# Error Handling and Logging Rules

## Scope
These rules apply to ALL Python code in the repository — all frameworks, all agents, all nodes, all API handlers.

## MUST Rules

### 1. Structured Error Logging
All errors MUST be logged with context, not just the message.

**Detection Patterns**:
```
❌ except Exception as e:
       print(e)
❌ logger.error("Something went wrong")
❌ logger.error(str(e))
```

**Correct Pattern**:
```python
✅ logger.error("Failed to process request", exc_info=True, extra={
       "user_id": user_id,
       "operation": "process_request",
       "input_size": len(data),
   })
✅ logger.exception("Unexpected failure in workflow node", extra={"node_id": node_id})
```

**Required fields in error logs**:
- Operation name or node ID
- Input identifiers (not values — no PII/secrets)
- `exc_info=True` for unexpected exceptions
- Severity appropriate to impact

**Enforced by**: intermediate-reviewer agent
**Violation**: HIGH priority fix

---

### 2. Retry with Exponential Backoff
All transient failures (network, DB, external APIs) MUST use exponential backoff with jitter.

**Detection Patterns**:
```
❌ for i in range(3):
       try:
           call()
       except:
           time.sleep(1)  # fixed sleep — no backoff
❌ while True:
       try:
           call()
           break
       except:
           pass  # infinite retry with no limit
```

**Correct Pattern**:
```python
✅ import random, time

def retry_with_backoff(fn, max_retries=3, base_delay=1.0):
    for attempt in range(max_retries):
        try:
            return fn()
        except TransientError as e:
            if attempt == max_retries - 1:
                raise
            delay = base_delay * (2 ** attempt) + random.uniform(0, 0.5)
            time.sleep(delay)
```

**Required**:
- Max retry count defined (never infinite)
- Exponential base delay with jitter
- Retry ONLY on transient errors (not validation errors)
- Log each retry attempt with attempt number

**Enforced by**: intermediate-reviewer agent
**Violation**: HIGH priority fix

---

### 3. Error Categorization
Errors MUST be categorized by type — do not catch `Exception` without re-raising or categorizing.

**Required categories**:
- **User errors** (invalid input, not found) → return structured error response, log at WARNING
- **Transient errors** (network timeout, DB lock) → retry with backoff, log at WARNING
- **System errors** (unexpected, unrecoverable) → log at ERROR with full context, propagate up
- **Security errors** (auth failure, validation failure) → log at WARNING, never expose internals

**Detection Patterns**:
```
❌ except Exception:
       return None  # swallows category — BLOCKED by zero-tolerance
❌ except Exception as e:
       return {"error": str(e)}  # may expose internals
```

**Correct Pattern**:
```python
✅ except ValidationError as e:
       logger.warning("Invalid input", extra={"field": e.field})
       raise UserFacingError(f"Invalid {e.field}") from e
✅ except TimeoutError as e:
       logger.warning("DB timeout, will retry", extra={"attempt": attempt})
       raise TransientError("Database unavailable") from e
✅ except Exception as e:
       logger.exception("Unexpected system error", extra={"operation": op})
       raise SystemError("Internal error") from e
```

**Enforced by**: intermediate-reviewer agent, security-reviewer agent
**Violation**: HIGH priority fix

---

### 4. Circuit Breaker for External Dependencies
External service calls (APIs, DBs, message queues) MUST have timeouts. Long-running operations MUST have deadlines.

**Detection Patterns**:
```
❌ requests.get(url)  # no timeout
❌ conn.execute(query)  # no statement timeout
```

**Correct Pattern**:
```python
✅ requests.get(url, timeout=(3.05, 27))  # (connect, read)
✅ conn.execute(query, timeout=30)
✅ async with asyncio.timeout(30):
       result = await external_call()
```

**Required**:
- Connect timeout: ≤ 5 seconds
- Read/operation timeout: ≤ 30 seconds (or documented exception)
- Timeout values from config/env, not hardcoded

**Enforced by**: intermediate-reviewer agent
**Violation**: MEDIUM priority fix

---

## MUST NOT Rules

### 1. No Silent Failures
MUST NOT swallow exceptions without logging or re-raising.

```
❌ except Exception:
       pass
❌ except Exception:
       return None
❌ try:
       risky()
   except:
       ...
```

Already enforced by `zero-tolerance.md` — this rule extends it with logging requirements.

### 2. No Secrets or PII in Error Messages
MUST NOT include passwords, API keys, tokens, or user PII in error messages or logs.

```
❌ logger.error(f"Auth failed for user {user.email} with password {password}")
❌ raise ValueError(f"Invalid token: {token}")
```

**Correct**:
```python
✅ logger.warning("Auth failed", extra={"user_id": user.id})  # ID not email
✅ raise ValueError("Invalid token format")  # no token value
```

### 3. No Generic Error Messages to Callers
MUST NOT expose internal error details to API callers or users.

```
❌ return {"error": traceback.format_exc()}
❌ return {"error": str(e)}  # may include file paths, class names
```

**Correct**:
```python
✅ return {"error": "Request could not be processed", "code": "PROCESSING_ERROR"}
```

## Kailash-Specific

### Workflow Nodes
- Node errors MUST propagate to the workflow runtime — do not catch and suppress inside nodes
- Use `NodeExecutionError` for node-level failures
- Log node_id and parameter snapshot (without secrets) on failure

### Kaizen Agents
- LLM call failures are transient — retry with backoff
- Prompt/response logging MUST mask any injected secrets
- Agent errors MUST not leak tool schemas or system prompts to end users

## Exceptions
Deviations require:
1. Written justification in code comment
2. Approval from intermediate-reviewer
3. Time-limited (must be remediated within one release cycle)
