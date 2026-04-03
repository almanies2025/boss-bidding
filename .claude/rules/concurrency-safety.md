# Concurrency and Thread Safety Rules

## Scope
These rules apply to ALL code that uses threads, async/await, multiprocessing, or shared mutable state. This includes workflow runtimes, Kaizen agents, Nexus API handlers, DataFlow connection pools, and any background task infrastructure.

---

## Core Principle: Shared Mutable State Is the Enemy

Concurrency bugs are among the hardest to reproduce and diagnose. The defense is to eliminate shared mutable state wherever possible, and to protect it explicitly where it cannot be avoided.

---

## MUST Rules

### 1. Immutable Data Structures for Shared Read-Only Data
Data shared across threads/tasks that is only read MUST be immutable or treated as immutable after initialization.

**Detection Patterns**:
```
❌ SHARED_CONFIG = {"key": "value"}  # mutable dict shared across threads
❌ class Cache:
       data = {}  # class-level mutable state
```

**Correct Pattern**:
```python
✅ from types import MappingProxyType
   SHARED_CONFIG = MappingProxyType({"key": "value"})  # read-only view

✅ from dataclasses import dataclass
   @dataclass(frozen=True)
   class Config:
       api_key: str
       timeout: int

✅ SHARED_TUPLE = (1, 2, 3)  # tuples are immutable
```

**Enforced by**: intermediate-reviewer agent
**Violation**: HIGH priority fix

---

### 2. Lock Acquisition Order Must Be Consistent
When multiple locks are acquired together, the acquisition order MUST be the same everywhere to prevent deadlocks.

**Detection Patterns**:
```
❌ # Thread A: acquires lock_a then lock_b
   # Thread B: acquires lock_b then lock_a  ← deadlock
```

**Required**:
- Document lock acquisition order in a comment near lock definitions
- Use a single coarse-grained lock if fine-grained ordering is complex
- Prefer `asyncio` primitives over threading locks in async code

**Correct Pattern**:
```python
✅ # Lock hierarchy (always acquire in this order):
   # 1. _registry_lock
   # 2. _session_lock
   # Never reverse.

class Manager:
    _registry_lock = threading.Lock()
    _session_lock = threading.Lock()

    def operation(self):
        with self._registry_lock:        # 1st
            with self._session_lock:     # 2nd
                self._do_work()
```

**Enforced by**: intermediate-reviewer agent
**Violation**: HIGH priority fix

---

### 3. Use Threading Primitives Correctly
MUST use the correct primitive for each use case.

| Use Case | Correct Primitive |
|----------|------------------|
| Mutual exclusion (sync) | `threading.Lock()` |
| Mutual exclusion (async) | `asyncio.Lock()` |
| Read-heavy shared state | `threading.RLock()` or reader-writer pattern |
| One-time initialization | `threading.Once` pattern or module-level singleton |
| Signaling between tasks | `asyncio.Event()` |
| Limiting concurrency | `asyncio.Semaphore(N)` |
| Queue between threads | `queue.Queue()` |
| Queue in async | `asyncio.Queue()` |

**Detection Patterns**:
```
❌ threading.Lock() used inside async def  ← blocks event loop
❌ asyncio.Lock() used in sync threading context  ← wrong runtime
```

**Correct**:
```python
✅ # In async code
   _lock = asyncio.Lock()
   async def safe_op():
       async with _lock:
           ...

✅ # In sync threaded code
   _lock = threading.Lock()
   def safe_op():
       with _lock:
           ...
```

**Enforced by**: intermediate-reviewer agent
**Violation**: HIGH priority fix

---

### 4. Atomic Operations for Shared Counters and Flags
Shared counters and boolean flags MUST use atomic operations or be protected by a lock.

**Detection Patterns**:
```
❌ self.count += 1  # not atomic in CPython under GIL pressure, never atomic outside CPython
❌ self.active = True  # visible to other threads only after memory barrier
```

**Correct Pattern**:
```python
✅ import threading
   self._lock = threading.Lock()

   def increment(self):
       with self._lock:
           self.count += 1

✅ # Or use threading.local() for per-thread state that doesn't need sharing
   _local = threading.local()
   _local.count = 0
```

**Enforced by**: intermediate-reviewer agent
**Violation**: MEDIUM priority fix

---

### 5. Async Resource Cleanup
All async resources (connections, files, locks) MUST be released in a `finally` block or via `async with`.

**Detection Patterns**:
```
❌ conn = await pool.acquire()
   result = await conn.execute(query)
   await pool.release(conn)  # not released if execute raises
```

**Correct Pattern**:
```python
✅ async with pool.acquire() as conn:
       result = await conn.execute(query)

✅ conn = await pool.acquire()
   try:
       result = await conn.execute(query)
   finally:
       await pool.release(conn)
```

**Enforced by**: intermediate-reviewer agent
**Violation**: HIGH priority fix

---

### 6. Race Condition Detection in Tests
Tests for concurrent code MUST exercise the race condition path, not just the happy path.

**Required**:
- Use `threading.Barrier` or `asyncio.gather` to synchronize concurrent test threads/tasks
- Run concurrent tests with multiple iterations to increase confidence
- Document any known TOCTOU (time-of-check to time-of-use) patterns

**Correct Pattern**:
```python
✅ async def test_concurrent_access():
       """Verify no data corruption under concurrent writes."""
       tasks = [asyncio.create_task(write_counter()) for _ in range(100)]
       await asyncio.gather(*tasks)
       assert counter.value == 100  # all increments applied
```

**Enforced by**: testing-specialist agent
**Violation**: MEDIUM priority fix

---

## MUST NOT Rules

### 1. No Global Mutable State Without Locks
MUST NOT have module-level mutable variables that are written from multiple threads.

```
❌ _cache = {}  # module-level, written from multiple threads/tasks
   def update_cache(key, value):
       _cache[key] = value  # not protected
```

**Exception**: Module-level constants set at import time before any threads start are acceptable.

### 2. No Fire-and-Forget Tasks Without Error Handling
MUST NOT create async tasks that swallow exceptions silently.

```
❌ asyncio.create_task(background_job())  # exceptions are silently discarded
```

**Correct**:
```python
✅ def handle_task_exception(task: asyncio.Task):
       if not task.cancelled():
           exc = task.exception()
           if exc:
               logger.exception("Background task failed", exc_info=exc)

   task = asyncio.create_task(background_job())
   task.add_done_callback(handle_task_exception)
```

### 3. No Shared Event Loops Across Threads
MUST NOT pass an `asyncio` event loop between threads. Each thread that uses async code MUST have its own event loop.

```
❌ loop = asyncio.get_event_loop()
   thread = threading.Thread(target=lambda: loop.run_until_complete(coro()))
```

**Correct**:
```python
✅ def thread_worker():
       asyncio.run(coro())  # creates a new loop for this thread

   thread = threading.Thread(target=thread_worker)
```

---

## Kailash-Specific

### AsyncLocalRuntime
- `AsyncLocalRuntime` uses an internal event loop — do not run it inside another `asyncio.run()` call
- Use `await runtime.execute_workflow_async(...)` — never call the sync version in async context

### Kaizen Agents
- Agent state (memory, context) MUST be per-request, not shared across concurrent agent calls
- Tool registries are read-only after initialization — no locks needed for reads

### PACT GovernanceEngine
- Already uses explicit locks (see `pact-governance.md`) — follow the existing lock hierarchy
- Do NOT add new locks inside PACT without reviewing the existing lock order

## Exceptions
Concurrency exceptions require:
1. Written justification with proof of safety (proof via test or formal argument)
2. Approval from intermediate-reviewer
3. Comment in code explaining why the race condition is benign or impossible
