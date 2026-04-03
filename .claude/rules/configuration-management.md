# Configuration Management and Secrets Rotation Rules

## Scope
These rules extend `env-models.md` (which mandates `.env` as the source of truth) with multi-environment separation, startup validation, secrets rotation, and fallback behavior. Apply to ALL deployment environments and ALL Python/JS/TS code.

---

## Core Principle: Configuration Failures Are Fatal at Startup

A misconfigured service that starts silently and fails at runtime is worse than one that refuses to start. Fail loudly at boot, not during a live request.

---

## MUST Rules

### 1. Environment Separation
Configuration MUST be separated by environment. The active environment is set by `APP_ENV`.

**Required environments**:
- `development` — local dev, may use mocks, verbose logging
- `staging` — mirrors production, real infrastructure, test data
- `production` — real users, real data, strict security

**Detection Patterns**:
```
❌ DATABASE_URL = "postgres://prod-host/prod_db"  # hardcoded production in dev config
❌ if debug:  # boolean flag used as environment proxy
❌ # No environment distinction at all
```

**Correct Pattern**:
```python
✅ # .env.development
   DATABASE_URL=postgres://localhost/dev_db
   LOG_LEVEL=DEBUG
   LLM_MODEL=claude-haiku-4-5-20251001  # cheaper model for dev

✅ # .env.staging
   DATABASE_URL=postgres://staging-host/staging_db
   LOG_LEVEL=INFO

✅ # .env.production
   DATABASE_URL=postgres://prod-host/prod_db
   LOG_LEVEL=WARNING

✅ # Load correct env file
   env = os.environ.get("APP_ENV", "development")
   load_dotenv(f".env.{env}")
```

**File structure**:
```
.env.example          ← committed, no real values, all keys documented
.env.development      ← local dev, gitignored
.env.staging          ← gitignored, deployed via secrets manager
.env.production       ← gitignored, deployed via secrets manager
.env                  ← gitignored, local override
```

**Enforced by**: security-reviewer agent
**Violation**: BLOCK deploy

---

### 2. Startup Validation — Required Keys MUST Be Present
All required configuration keys MUST be validated at application startup. Missing required keys = immediate crash with a clear error.

**Detection Patterns**:
```
❌ api_key = os.environ.get("API_KEY")  # returns None silently
❌ db_url = os.environ.get("DATABASE_URL", "sqlite:///:memory:")  # silent fallback to wrong DB
```

**Correct Pattern**:
```python
✅ REQUIRED_KEYS = [
       "DATABASE_URL",
       "ANTHROPIC_API_KEY",
       "APP_SECRET_KEY",
   ]

def validate_config():
    missing = [k for k in REQUIRED_KEYS if not os.environ.get(k)]
    if missing:
        raise EnvironmentError(
            f"Missing required configuration: {', '.join(missing)}. "
            f"See .env.example for documentation."
        )

# Call at module import or app startup — before serving any requests
validate_config()

✅ # Or per-key
def require_env(key: str) -> str:
    value = os.environ.get(key)
    if not value:
        raise EnvironmentError(f"Required environment variable '{key}' is not set")
    return value

DATABASE_URL = require_env("DATABASE_URL")
```

**Enforced by**: intermediate-reviewer agent
**Violation**: HIGH priority fix

---

### 3. Optional Keys MUST Have Safe Defaults
Optional configuration MUST have documented defaults that are safe for production.

**Safe defaults**:
- Timeouts: explicit values (not 0 or None which disables timeout)
- Log levels: `WARNING` for production, `DEBUG` only for development
- Feature flags: `false` (off by default, opt-in)
- Retry counts: bounded (e.g., 3)

**Detection Patterns**:
```
❌ timeout = int(os.environ.get("TIMEOUT", "0"))  # 0 disables timeout — unsafe default
❌ debug = os.environ.get("DEBUG", "true")  # debug on by default — unsafe
```

**Correct Pattern**:
```python
✅ timeout = int(os.environ.get("REQUEST_TIMEOUT_SECONDS", "30"))
✅ log_level = os.environ.get("LOG_LEVEL", "WARNING")
✅ feature_x_enabled = os.environ.get("FEATURE_X_ENABLED", "false").lower() == "true"
```

**Enforced by**: intermediate-reviewer agent
**Violation**: MEDIUM priority fix

---

### 4. Configuration Precedence
When multiple sources provide the same key, follow this precedence (highest to lowest):

1. CLI arguments / runtime overrides
2. Environment variables
3. `.env` file
4. Application defaults

**MUST NOT** silently override higher-precedence values with lower-precedence ones.

---

### 5. Secrets Rotation Readiness
Code MUST be written to support secret rotation without downtime.

**Required**:
- No cached/global secret values that survive rotation
- Use a config object that re-reads secrets at configurable intervals
- Database and API connections MUST re-authenticate after auth failure (don't cache credentials indefinitely)

**Detection Patterns**:
```
❌ API_KEY = os.environ["API_KEY"]  # module-level constant — won't pick up rotation
```

**Correct Pattern**:
```python
✅ def get_api_key() -> str:
       """Re-read on each call to support rotation."""
       return os.environ["API_KEY"]

✅ # Or lazy config object
class Config:
    @property
    def api_key(self) -> str:
        return os.environ["API_KEY"]

config = Config()
```

**Enforced by**: intermediate-reviewer agent, security-reviewer agent
**Violation**: MEDIUM priority fix

---

### 6. Expired or Missing Secrets — Fail Closed
When a secret is expired, revoked, or missing at runtime:

**MUST**:
- Fail the specific operation (not the entire service if avoidable)
- Log at ERROR with operation name and key name (not key value)
- Return a structured error to the caller

**MUST NOT**:
- Retry with a blank/default credential
- Fall back to an insecure transport (e.g., HTTP instead of HTTPS)
- Cache the error state and serve stale responses

---

## MUST NOT Rules

### 1. No Real Credentials in `.env.example`
`.env.example` is committed to git and MUST contain only placeholder values.

```
❌ ANTHROPIC_API_KEY=sk-ant-real-key-here  # in .env.example
✅ ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

### 2. No Environment-Specific Logic Based on Key Values
MUST NOT branch on the value of a secret or config to detect the environment.

```
❌ if "staging" in DATABASE_URL:
       enable_debug_logging()
```

**Correct**:
```python
✅ if os.environ.get("APP_ENV") == "staging":
       enable_debug_logging()
```

### 3. No Mixing of `.env` Loading in Tests
Tests MUST NOT accidentally load production `.env` files.

```
❌ load_dotenv()  # in test setup — may load .env with prod credentials
```

**Correct** (already handled by root `conftest.py` — do not override):
```python
✅ # conftest.py loads .env.test or sets test defaults
   # Tests use os.environ["KEY"] = "test-value" for overrides
```

---

## Kailash-Specific

### Model Names
- All LLM model names MUST come from env (enforced by `env-models.md`)
- Default model in `.env.example`: `KAILASH_MODEL=claude-sonnet-4-6`
- Dev may use cheaper model: `KAILASH_MODEL=claude-haiku-4-5-20251001`

### DataFlow Database Config
- Connection strings MUST come from env
- Pool sizes MUST come from config (see `dataflow-pool.md`)
- No schema names hardcoded — use `DB_SCHEMA` env var

## Exceptions
Configuration exceptions require:
1. Written justification in code comment
2. Approval from security-reviewer
3. Tracked in journal as a known risk
