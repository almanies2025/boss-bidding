# Data Validation and Sanitization Rules

## Scope
These rules apply to ALL system boundaries: API inputs, CLI arguments, file uploads, database reads of untrusted data, LLM outputs used as structured data, and inter-service messages. `security.md` mandates validation — this rule provides the patterns.

---

## Core Principle: Trust Nothing at System Boundaries

Data from outside your process boundary (users, external APIs, LLM outputs, files, message queues) is untrusted until validated. Validate once at the boundary, trust internally. Do not re-validate already-trusted internal data — this creates noise and complexity.

---

## MUST Rules

### 1. Schema Validation at All Entry Points
All structured inputs MUST be validated against a schema before use.

**Detection Patterns**:
```
❌ def create_user(data: dict):
       name = data["name"]  # no validation
       email = data["email"]  # no format check
```

**Correct Pattern**:
```python
✅ from pydantic import BaseModel, EmailStr, field_validator

class CreateUserRequest(BaseModel):
    name: str
    email: EmailStr
    age: int

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("name cannot be empty")
        if len(v) > 255:
            raise ValueError("name too long")
        return v

    @field_validator("age")
    @classmethod
    def age_in_range(cls, v: int) -> int:
        if not (0 <= v <= 150):
            raise ValueError("age must be between 0 and 150")
        return v

def create_user(data: dict):
    request = CreateUserRequest(**data)  # raises ValidationError if invalid
    ...
```

**Preferred validation library**: Pydantic (already a Kailash SDK dependency).

**Enforced by**: security-reviewer agent, intermediate-reviewer agent
**Violation**: HIGH priority fix

---

### 2. String Length Limits on All String Inputs
Every string field from untrusted sources MUST have a maximum length.

**Required limits** (use these or tighter based on domain):

| Field type | Max length |
|-----------|-----------|
| Name, title, label | 255 chars |
| Description, notes | 2,000 chars |
| Free-form text | 10,000 chars |
| LLM prompt input | 100,000 chars (or model context limit) |
| File path | 1,024 chars |
| URL | 2,048 chars |
| ID fields | 128 chars |

**Detection Patterns**:
```
❌ class NoteRequest(BaseModel):
       content: str  # no length limit — can receive megabytes
```

**Correct**:
```python
✅ from pydantic import Field

class NoteRequest(BaseModel):
    content: str = Field(..., max_length=10_000)
```

**Enforced by**: intermediate-reviewer agent
**Violation**: MEDIUM priority fix

---

### 3. Whitelist Enumerable Values
Fields with a fixed set of valid values MUST use an enum or literal type, not a free-form string.

**Detection Patterns**:
```
❌ def set_status(status: str):
       if status not in ["active", "inactive", "pending"]:
           raise ValueError("invalid status")  # manual check — error-prone
```

**Correct Pattern**:
```python
✅ from enum import Enum

class UserStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"

class UpdateStatusRequest(BaseModel):
    status: UserStatus  # Pydantic validates automatically
```

**Enforced by**: intermediate-reviewer agent
**Violation**: LOW priority fix

---

### 4. Sanitize Before Persistence
Data MUST be sanitized before writing to persistent storage.

**Required sanitization steps**:
- **Trim** leading/trailing whitespace from user-entered strings
- **Normalize** Unicode to NFC form (see Unicode section below)
- **Strip null bytes** from strings (null bytes corrupt some databases)
- **Validate file paths** — no path traversal (`../`, absolute paths in uploads)

**Correct Pattern**:
```python
✅ import unicodedata

def sanitize_string(value: str) -> str:
    value = value.strip()
    value = unicodedata.normalize("NFC", value)
    value = value.replace("\x00", "")  # strip null bytes
    return value
```

**Enforced by**: security-reviewer agent
**Violation**: HIGH priority fix for path traversal; MEDIUM for others

---

### 5. Unicode Handling
All string processing MUST handle Unicode correctly.

**Required**:
- Use NFC normalization for stored strings (canonical composition)
- Handle surrogate characters (from some JSON encoders) — strip or replace
- Do not assume `len(s)` equals visual character count — use `len(s.encode("utf-8"))` for byte limits

**Detection Patterns**:
```
❌ if len(name) > 255:  # counts code points, not bytes — "名前" is 2 chars but 6 bytes
       raise ValueError("too long")
```

**Correct Pattern**:
```python
✅ import unicodedata

def validate_name(name: str) -> str:
    name = unicodedata.normalize("NFC", name)
    if len(name.encode("utf-8")) > 255:
        raise ValueError("name too long")
    return name
```

**Enforced by**: intermediate-reviewer agent
**Violation**: MEDIUM priority fix

---

### 6. File Upload Validation
File uploads MUST be validated on type, size, and content before processing.

**Required checks**:
1. **Size limit** — reject before reading content: `Content-Length` header + streaming size check
2. **MIME type** — validate against allowlist of expected types
3. **Magic bytes** — verify file content matches declared type (don't trust extension alone)
4. **Filename sanitization** — strip path components, non-printable chars

**Correct Pattern**:
```python
✅ import magic  # python-magic

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "application/pdf"}

async def validate_upload(file: UploadFile) -> bytes:
    content = await file.read(MAX_FILE_SIZE + 1)
    if len(content) > MAX_FILE_SIZE:
        raise ValidationError("File too large (max 10MB)")

    detected_type = magic.from_buffer(content, mime=True)
    if detected_type not in ALLOWED_MIME_TYPES:
        raise ValidationError(f"File type not allowed: {detected_type}")

    safe_filename = secure_filename(file.filename)  # strips path components
    return content, safe_filename
```

**Enforced by**: security-reviewer agent
**Violation**: HIGH priority fix

---

### 7. LLM Output Validation
When LLM output is used as structured data (parsed JSON, function args, etc.), it MUST be validated like any other untrusted input.

**Detection Patterns**:
```
❌ result = json.loads(llm_response)
   execute_action(result["action"], result["params"])  # unvalidated LLM output
```

**Correct Pattern**:
```python
✅ class LLMActionResult(BaseModel):
       action: Literal["create", "update", "delete"]
       params: dict[str, str]  # typed, not Any

try:
    parsed = LLMActionResult.model_validate_json(llm_response)
except ValidationError as e:
    log.warning("LLM returned invalid structured output", error=str(e))
    raise RetryableError("LLM output failed validation, retrying")
```

**Enforced by**: agent-reasoning.md, intermediate-reviewer agent
**Violation**: HIGH priority fix

---

## MUST NOT Rules

### 1. No Validation Error Messages That Leak Internals
Error messages returned to callers MUST NOT include:
- Stack traces
- Database schema details
- Internal field names (use user-facing names)
- File system paths

```
❌ {"error": "column 'usr_email_addr' violates not-null constraint"}  # DB internals
✅ {"error": "email is required", "field": "email"}
```

### 2. No Trusting Client-Provided IDs Without Authorization
MUST NOT use a user-provided ID to access a resource without verifying the requesting user has access to that resource.

```
❌ record = db.get(request.params["record_id"])  # IDOR — no ownership check
✅ record = db.get_for_user(request.params["record_id"], user_id=current_user.id)
```

### 3. No Re-Validation of Internal Data
MUST NOT add schema validation to data that is generated and consumed internally (within the same service, same process). Validate at boundaries only.

---

## Kailash-Specific

### Nexus Endpoints
- Use Pydantic models for all request bodies — Nexus/FastAPI validates automatically
- Query parameters MUST be typed (not `str` when an `int` or `enum` is expected)

### Kaizen Tool Parameters
- Tool parameter schemas are already validated by the Kaizen framework
- Additional domain validation (range checks, format checks) goes in the tool implementation

### DataFlow
- DataFlow model fields should use Pydantic validators for domain constraints
- Input records from external sources MUST be validated before `model.save()`

## Exceptions
Validation exceptions require:
1. Written justification (e.g., trusted internal pipeline with no external input)
2. Approval from security-reviewer
3. Explicit scope — exception does not extend to any boundary that accepts external data
