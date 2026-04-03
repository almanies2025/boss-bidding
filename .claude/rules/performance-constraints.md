# Performance and Resource Constraints Rules

## Scope
These rules apply to ALL production code paths — workflow nodes, API handlers, agent loops, database queries, and background tasks. Performance is a correctness requirement, not an afterthought.

---

## Core Principle: Resource Budgets Are Explicit

Every operation has a cost. That cost must be bounded, measured, and not exceeded silently. A workflow that consumes unbounded memory or a node that blocks for 60 seconds is a bug, not a feature.

---

## MUST Rules

### 1. Define Resource Budgets for Critical Paths
All critical paths MUST have explicit targets documented in code or config.

**Critical paths include**:
- API request handlers (Nexus endpoints)
- Workflow node execution
- LLM agent calls
- Database queries in hot loops
- Background task processing

**Required targets** (override per-operation via config if needed):

| Operation | Latency Target | Memory Target |
|-----------|---------------|---------------|
| API endpoint (p99) | ≤ 2s | — |
| Single workflow node | ≤ 30s | ≤ 256MB |
| LLM agent call | ≤ 60s | — |
| DB query (OLTP) | ≤ 100ms | — |
| Background task | ≤ 5min | ≤ 512MB |

Targets MUST come from config/env — not hardcoded:
```python
✅ timeout = float(os.environ.get("NODE_TIMEOUT_SECONDS", "30"))
❌ timeout = 30  # magic number
```

**Enforced by**: intermediate-reviewer agent
**Violation**: MEDIUM priority fix

---

### 2. No Unbounded Collections in Memory
MUST NOT load unbounded datasets into memory.

**Detection Patterns**:
```
❌ results = db.query("SELECT * FROM events").all()  # no limit
❌ items = [process(x) for x in huge_generator]  # materializes all
❌ data = response.json()  # no size check on response
```

**Correct Pattern**:
```python
✅ # Paginate
for page in db.query("SELECT * FROM events").paginate(page_size=1000):
    process_batch(page)

✅ # Stream / yield
def process_stream(generator, batch_size=500):
    batch = []
    for item in generator:
        batch.append(item)
        if len(batch) >= batch_size:
            yield batch
            batch = []
    if batch:
        yield batch

✅ # Enforce response size limit
response = requests.get(url, stream=True)
content = response.raw.read(MAX_RESPONSE_BYTES)
```

**Enforced by**: intermediate-reviewer agent
**Violation**: HIGH priority fix

---

### 3. No N+1 Query Patterns
MUST NOT execute queries inside loops over result sets.

**Detection Patterns**:
```
❌ users = db.get_all_users()
   for user in users:
       profile = db.get_profile(user.id)  # N+1
```

**Correct Pattern**:
```python
✅ # Batch fetch
user_ids = [u.id for u in users]
profiles = db.get_profiles_batch(user_ids)  # single query

✅ # JOIN at query level
users_with_profiles = db.query("""
    SELECT u.*, p.* FROM users u
    LEFT JOIN profiles p ON p.user_id = u.id
""")
```

**Enforced by**: dataflow-specialist agent, intermediate-reviewer
**Violation**: HIGH priority fix

---

### 4. Async I/O for Concurrent Operations
When performing multiple independent I/O operations, MUST use async concurrency — not sequential awaits.

**Detection Patterns**:
```
❌ result_a = await fetch_a()  # sequential — wastes time
   result_b = await fetch_b()
```

**Correct Pattern**:
```python
✅ result_a, result_b = await asyncio.gather(fetch_a(), fetch_b())

✅ async with asyncio.TaskGroup() as tg:
       task_a = tg.create_task(fetch_a())
       task_b = tg.create_task(fetch_b())
   result_a = task_a.result()
   result_b = task_b.result()
```

**Enforced by**: intermediate-reviewer agent
**Violation**: MEDIUM priority fix

---

### 5. Performance Tests for Critical Paths
All new critical path code MUST include a performance test (Tier 2 or 3).

**Required**:
- Baseline latency assertion (not just correctness)
- Memory usage check for data-intensive operations
- Load test for new Nexus endpoints before release

**Correct Pattern**:
```python
✅ def test_workflow_execution_performance():
       start = time.perf_counter()
       results, run_id = runtime.execute(workflow.build(), inputs=STANDARD_INPUT)
       elapsed = time.perf_counter() - start
       assert elapsed < 5.0, f"Workflow too slow: {elapsed:.2f}s"
```

**Enforced by**: testing-specialist agent, deployment.md checklist
**Violation**: BLOCK release if critical path has no perf test

---

## MUST NOT Rules

### 1. No Blocking Calls in Async Context
MUST NOT call blocking I/O inside async functions without offloading to a thread pool.

```
❌ async def handler():
       data = open("file.txt").read()  # blocks event loop
       result = requests.get(url)      # blocks event loop
```

**Correct**:
```python
✅ async def handler():
       async with aiofiles.open("file.txt") as f:
           data = await f.read()
       async with aiohttp.ClientSession() as session:
           async with session.get(url) as response:
               result = await response.json()

✅ # Or offload to thread pool for legacy sync code
   result = await asyncio.get_event_loop().run_in_executor(None, blocking_fn)
```

### 2. No Polling Loops Without Backoff
MUST NOT busy-poll for state changes without sleep/backoff.

```
❌ while not is_ready():
       pass  # 100% CPU
❌ while not is_ready():
       time.sleep(0.001)  # 1ms polling — still very wasteful
```

**Correct**:
```python
✅ # Event-driven
await event.wait()

✅ # Or poll with reasonable interval + max wait
for attempt in range(max_attempts):
    if is_ready():
        break
    await asyncio.sleep(min(0.1 * (2 ** attempt), 5.0))
else:
    raise TimeoutError("Condition not met within deadline")
```

### 3. No Unbounded Concurrency
MUST NOT fan out to unlimited concurrent tasks.

```
❌ tasks = [asyncio.create_task(process(item)) for item in huge_list]
   await asyncio.gather(*tasks)  # may spawn thousands
```

**Correct**:
```python
✅ semaphore = asyncio.Semaphore(MAX_CONCURRENT)

async def bounded_process(item):
    async with semaphore:
        return await process(item)

tasks = [bounded_process(item) for item in huge_list]
results = await asyncio.gather(*tasks)
```

---

## Kailash-Specific

### Workflow Nodes
- Nodes with external I/O MUST declare a `timeout` parameter
- Nodes MUST NOT accumulate state across executions (stateless by design)
- Use `BatchNode` patterns for processing collections — do not loop inside a single node

### Kaizen Agents
- Agent loops MUST have a max_iterations guard
- Tool calls are I/O — use `asyncio.gather` for parallel tool invocations when supported
- LLM context window is a resource — trim prompts that grow unboundedly

### DataFlow
- Use `stream=True` on large query results
- Index columns used in WHERE/JOIN clauses — unindexed queries on large tables are a bug

## Exceptions
Performance exceptions require:
1. Documented benchmark showing the deviation is acceptable
2. Approval from intermediate-reviewer
3. Tracked as a technical debt item in journal
