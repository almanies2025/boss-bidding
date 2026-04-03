# Monitoring, Alerting, and Observability Rules

## Scope
These rules apply to ALL production services, autonomous agents, workflow runtimes, and background tasks. Observability is a first-class requirement — a system you cannot observe is a system you cannot operate safely.

---

## Core Principle: Observable by Default

Every operation that can fail must emit a signal when it does. Every system that runs autonomously must report its health. You do not add observability after a production incident — you build it in from the start.

---

## MUST Rules

### 1. Structured Logging (JSON in Production)
All logs in staging and production MUST be structured (JSON), not plain text.

**Detection Patterns**:
```
❌ print(f"Processing user {user_id}")  # unstructured
❌ logging.info(f"Workflow {wf_id} completed in {elapsed:.2f}s")  # unstructured
```

**Correct Pattern**:
```python
✅ import structlog  # or standard logging with JSON formatter
   log = structlog.get_logger()

   log.info("workflow.completed",
       workflow_id=wf_id,
       elapsed_seconds=elapsed,
       node_count=len(nodes),
       status="success",
   )

   log.error("workflow.failed",
       workflow_id=wf_id,
       node_id=failed_node,
       error_type=type(exc).__name__,
       # NO: error_message=str(exc)  ← may leak internals
   )
```

**Required log fields for all operational events**:
- `event` — machine-readable event name (e.g., `workflow.started`, `node.failed`)
- `timestamp` — ISO 8601 (handled by framework)
- `level` — DEBUG/INFO/WARNING/ERROR/CRITICAL
- `service` — service/component name
- Relevant IDs: `workflow_id`, `node_id`, `user_id`, `request_id`

**Enforced by**: intermediate-reviewer agent
**Violation**: MEDIUM priority fix

---

### 2. Log Levels Used Correctly
Log levels MUST communicate severity accurately.

| Level | When to use |
|-------|-------------|
| `DEBUG` | Detailed trace for development — NEVER in production default |
| `INFO` | Normal operations worth recording (workflow started, task completed) |
| `WARNING` | Unexpected but handled (retry, fallback used, degraded mode) |
| `ERROR` | Operation failed, user/system impact, requires attention |
| `CRITICAL` | Service is broken, immediate human intervention required |

**Detection Patterns**:
```
❌ logger.error("User not found")  # user error → should be WARNING or INFO
❌ logger.info("Database connection failed")  # system failure → should be ERROR
❌ logger.debug("Starting workflow execution")  # operational event → should be INFO
```

**Enforced by**: intermediate-reviewer agent
**Violation**: LOW priority fix

---

### 3. Request/Workflow Tracing
All requests and workflow executions MUST carry a trace/correlation ID end-to-end.

**Required**:
- Generate a `request_id` or `trace_id` at entry point (API handler, CLI start, agent invocation)
- Pass the ID through all downstream calls (log, tool calls, DB queries)
- Include in all error responses

**Correct Pattern**:
```python
✅ import uuid

def handle_request(request):
    trace_id = request.headers.get("X-Trace-Id") or str(uuid.uuid4())
    log = logger.bind(trace_id=trace_id)

    log.info("request.started", endpoint=request.path)
    result = process(request, trace_id=trace_id)
    log.info("request.completed", status=result.status)
    return result

✅ # Workflow execution
results, run_id = runtime.execute(workflow.build())
log.info("workflow.completed", run_id=run_id, node_count=len(results))
```

**Enforced by**: intermediate-reviewer agent
**Violation**: MEDIUM priority fix

---

### 4. Health Check Endpoints
All Nexus services MUST expose a health check endpoint.

**Required endpoints**:
- `GET /health` — liveness: is the service running? Returns 200 OK or 503
- `GET /health/ready` — readiness: is the service ready to serve traffic?

**Correct Pattern**:
```python
✅ @app.get("/health")
   async def health():
       return {"status": "ok", "service": "my-service", "version": VERSION}

✅ @app.get("/health/ready")
   async def ready():
       checks = {
           "database": await check_db(),
           "llm_api": await check_llm(),
       }
       all_ok = all(v == "ok" for v in checks.values())
       return JSONResponse(
           {"status": "ready" if all_ok else "degraded", "checks": checks},
           status_code=200 if all_ok else 503,
       )
```

**Enforced by**: nexus-specialist agent
**Violation**: BLOCK deploy

---

### 5. Operational Metrics for Critical Paths
Critical paths MUST emit metrics (counters, histograms) for:
- Request count and error rate
- Latency (p50, p95, p99)
- Queue depth for background tasks
- LLM token usage (for cost tracking)

**Correct Pattern**:
```python
✅ from prometheus_client import Counter, Histogram

REQUEST_COUNT = Counter("requests_total", "Total requests", ["endpoint", "status"])
REQUEST_LATENCY = Histogram("request_duration_seconds", "Request latency", ["endpoint"])

@REQUEST_LATENCY.labels(endpoint="/api/workflow").time()
async def handle_workflow_request():
    ...
    REQUEST_COUNT.labels(endpoint="/api/workflow", status="success").inc()
```

**Note**: Metric library choice (Prometheus, OpenTelemetry, etc.) follows project convention — use what's already in use. Do not introduce a second metrics library.

**Enforced by**: intermediate-reviewer agent
**Violation**: MEDIUM priority — required before release of new endpoints

---

### 6. Autonomous Agent Heartbeat
Autonomous agents and long-running background tasks MUST emit a heartbeat log or metric at regular intervals.

**Required**:
- Log at INFO level every N seconds/iterations (N from config)
- Include: agent ID, iteration count, last successful operation, pending queue depth
- Absence of heartbeat = implicit alert signal for monitoring systems

**Correct Pattern**:
```python
✅ HEARTBEAT_INTERVAL = int(os.environ.get("AGENT_HEARTBEAT_SECONDS", "30"))

class MyAgent:
    async def run_loop(self):
        last_heartbeat = time.monotonic()
        iteration = 0
        while self.running:
            await self.process_next()
            iteration += 1
            if time.monotonic() - last_heartbeat >= HEARTBEAT_INTERVAL:
                log.info("agent.heartbeat",
                    agent_id=self.id,
                    iteration=iteration,
                    queue_depth=len(self.queue),
                )
                last_heartbeat = time.monotonic()
```

**Enforced by**: intermediate-reviewer agent
**Violation**: MEDIUM priority fix

---

## MUST NOT Rules

### 1. No Swallowed Errors Without Observability
MUST NOT suppress an error without emitting a log or metric. (Extends `zero-tolerance.md` with observability requirement.)

```
❌ except Exception:
       pass  # error swallowed, no signal
```

### 2. No Secrets in Logs or Traces
MUST NOT include API keys, passwords, tokens, or PII in any log, trace, or metric label.

```
❌ log.info("LLM call", api_key=self.api_key)
❌ log.debug("User data", email=user.email)
```

### 3. No Verbose Debug Logging in Production
MUST NOT enable DEBUG logging in production. It generates excessive volume and may expose sensitive data.

```
❌ LOG_LEVEL=DEBUG  # in .env.production
```

---

## Incident Response Requirements

Every service that runs in production MUST have a runbook entry (in `docs/runbooks/` or journal) covering:
1. How to check if the service is healthy
2. How to diagnose the most common failures
3. How to restart/recover the service
4. Escalation path if automated recovery fails

This is not optional documentation — it is a deployment prerequisite.

**Enforced by**: deployment.md checklist
**Violation**: BLOCK initial production deploy without runbook

---

## Kailash-Specific

### Workflow Runtime
- `run_id` from `runtime.execute(workflow.build())` MUST be logged at INFO level
- Failed nodes MUST be logged with node_id and error type

### Kaizen Agents
- Each agent invocation should log: agent class, input token count (not content), output token count
- Multi-agent coordination steps should log handoff events: which agent is delegating to which

### Nexus
- All HTTP requests automatically get trace IDs via middleware — do not add manual trace ID generation in handlers
- Use the built-in Nexus access log, don't duplicate it

## Exceptions
Observability exceptions require:
1. Written justification (e.g., test-only code, throwaway script)
2. Approval from intermediate-reviewer
3. Explicit scope limit — exception does not apply to production paths
