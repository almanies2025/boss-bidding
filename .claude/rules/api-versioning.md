# API Versioning and Compatibility Rules

## Scope
These rules apply to ALL public-facing SDK APIs, Nexus endpoints, DataFlow models, and Kaizen agent interfaces. They govern how APIs evolve without breaking existing consumers.

## Core Principle: Semantic Versioning is a Contract

Version numbers are a promise to SDK consumers:
- **MAJOR** — breaking change, consumers must update code
- **MINOR** — new capability, fully backward compatible
- **PATCH** — bug fix, behavior preserved

Violating this contract destroys trust. These rules enforce it.

---

## MUST Rules

### 1. Breaking Changes Require a Major Version Bump
A change is **breaking** if any existing valid consumer code stops working or produces different results.

**Breaking changes (require MAJOR bump)**:
```
❌ Removing a public function, class, or method
❌ Renaming a public function, class, or method without an alias
❌ Changing a function signature (removing/renaming parameters)
❌ Changing return type or structure
❌ Changing error types raised
❌ Changing behavior that callers depend on
❌ Removing a REST endpoint or changing its URL
❌ Removing a field from a response schema
❌ Changing a field type in a response schema
```

**Non-breaking changes (MINOR or PATCH)**:
```
✅ Adding a new optional parameter with a default
✅ Adding a new function, class, or method
✅ Adding a new field to a response schema
✅ Fixing incorrect behavior (document in CHANGELOG)
✅ Improving performance without behavior change
```

**Enforced by**: intermediate-reviewer agent on all PRs
**Violation**: BLOCK merge until version is bumped correctly

---

### 2. Deprecation Before Removal
APIs MUST NOT be removed without a deprecation period of at least **2 minor releases**.

**Required deprecation process**:
1. Add `@deprecated` annotation with version and replacement
2. Log a `DeprecationWarning` when the deprecated API is called
3. Document in CHANGELOG under `### Deprecated`
4. Remove in the next major release

**Correct Pattern**:
```python
✅ import warnings

def old_function(x):
    warnings.warn(
        "old_function is deprecated since v1.2.0 and will be removed in v2.0.0. "
        "Use new_function() instead.",
        DeprecationWarning,
        stacklevel=2,
    )
    return new_function(x)
```

**Detection Patterns**:
```
❌ # Removing a function in a minor release with no deprecation warning
❌ # Renaming without keeping old name as deprecated alias
```

**Enforced by**: intermediate-reviewer agent
**Violation**: BLOCK merge

---

### 3. Schema Evolution Must Be Additive
When evolving data schemas (DataFlow models, API request/response bodies):

**MUST**:
- Add new fields as optional with defaults
- Keep old fields until next major version
- Version the schema if the shape fundamentally changes

**Detection Patterns**:
```
❌ class UserModel:
       # Removed: name: str  ← breaking removal
       full_name: str  # rename without alias
```

**Correct Pattern**:
```python
✅ class UserModel:
       full_name: str
       name: str = ""  # deprecated alias, keep until v2.0
```

**Enforced by**: intermediate-reviewer agent
**Violation**: HIGH priority fix

---

### 4. Cross-SDK Consistency
When a public API exists in both Python and Rust SDKs, their signatures and behavior MUST remain consistent.

- Parameter names MUST match (adjusted for language conventions: snake_case vs camelCase)
- Return structures MUST be equivalent
- Error codes MUST be identical

See `rules/cross-sdk-inspection.md` for the inspection process.

**Enforced by**: cross-sdk-inspection rule, intermediate-reviewer
**Violation**: BLOCK release

---

### 5. Changelog Entries for All User-Facing Changes
Every PR that changes a public API MUST include a CHANGELOG entry.

**Format**:
```markdown
## [Unreleased]

### Added
- `WorkflowBuilder.add_node()` now accepts `timeout` parameter (default: None)

### Changed
- `LocalRuntime.execute()` now returns `(results, run_id)` tuple instead of `results` only

### Deprecated
- `workflow.run()` deprecated since 1.2.0, use `runtime.execute(workflow.build())` instead

### Removed
- `workflow.execute()` removed (deprecated since 1.0.0)

### Fixed
- Fixed race condition in `AsyncLocalRuntime` when concurrent workflows share a node ID
```

**Enforced by**: deployment.md checklist, git.md PR requirements
**Violation**: PR blocked until CHANGELOG updated

---

## MUST NOT Rules

### 1. No Undocumented Behavior Changes
MUST NOT change observable behavior in a PATCH release without documenting it as a bug fix.

### 2. No Breaking Changes in Minor or Patch Releases
MUST NOT make breaking changes outside of a major version bump — regardless of how "small" the change seems.

### 3. No Private-to-Public Promotion Without Review
MUST NOT make a private/internal API public without a deliberate versioning decision, since it immediately becomes a compatibility obligation.

---

## Nexus Endpoint Versioning

REST endpoints exposed via Nexus MUST follow URL versioning:

```
✅ /api/v1/workflows
✅ /api/v2/workflows  ← new version, v1 still live during transition
❌ /api/workflows  ← no version, breaking changes impossible to manage
```

**Endpoint retirement**:
- Announce deprecation in response headers: `Deprecation: true`, `Sunset: <date>`
- Support old endpoint for minimum 2 minor releases after deprecation
- Return 410 Gone after sunset date with migration instructions

---

## Exceptions
API versioning exceptions require:
1. Written justification (security fix, critical bug)
2. Approval from intermediate-reviewer
3. Immediate communication to known SDK consumers
4. Hotfix release with clear CHANGELOG entry
