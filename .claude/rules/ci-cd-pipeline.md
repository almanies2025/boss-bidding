# CI/CD Pipeline Standards Rules

## Scope
These rules apply to ALL GitHub Actions workflows (`.github/workflows/`), CI configuration, and deployment scripts. `deployment.md` covers the release checklist — this rule defines what MUST be in the CI pipeline itself.

---

## Core Principle: CI Is the Quality Gate

If it's not in CI, it doesn't reliably happen. Manual processes drift and get skipped under pressure. Every quality requirement (tests, linting, security scans) MUST be enforced by CI, not by convention.

---

## MUST Rules

### 1. Required CI Checks for Every PR
Every pull request MUST pass ALL of the following before merge:

| Check | Tool | Failure action |
|-------|------|---------------|
| Linting | `ruff check` | Block merge |
| Formatting | `ruff format --check` | Block merge |
| Type checking | `mypy` (or `pyright`) | Block merge |
| Unit tests (Tier 1) | `pytest tests/unit/` | Block merge |
| Security scan | `pip-audit` or `safety` | Block merge on HIGH/CRITICAL |
| Import sorting | `ruff` (isort rules) | Block merge |

**Correct workflow structure**:
```yaml
✅ name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - run: pip install ruff mypy
      - run: ruff check .
      - run: ruff format --check .
      - run: mypy src/

  test:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - run: pip install -e ".[dev]"
      - run: pytest tests/unit/ -v --tb=short

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pip install pip-audit
      - run: pip-audit
```

**Enforced by**: branch-protection.md (status checks required)
**Violation**: BLOCK merge

---

### 2. Test Matrix — Python Versions
The test suite MUST run against the minimum AND latest supported Python versions.

**Required matrix** (update when support policy changes):
```yaml
✅ strategy:
     matrix:
       python-version: ["3.10", "3.11", "3.12"]
```

**Detection Patterns**:
```
❌ # Tests only run on one Python version
❌ python-version: "3.11"  # single version only
```

**Enforced by**: deployment.md checklist before release
**Violation**: BLOCK release (not required for every PR — required for release CI)

---

### 3. Integration Tests Run in Staging CI
Tier 2 integration tests MUST run in CI against real infrastructure (not mocked) before deployment to staging.

**Required**:
- Separate CI job: `integration-test`
- Runs against a test database (not production)
- Uses staging secrets from GitHub Secrets (not hardcoded)
- Triggered on merge to `main` or `develop`, not on every PR (too slow)

**Correct**:
```yaml
✅ integration-test:
     runs-on: ubuntu-latest
     if: github.ref == 'refs/heads/main'
     services:
       postgres:
         image: postgres:16
         env:
           POSTGRES_PASSWORD: test
         options: >-
           --health-cmd pg_isready
           --health-interval 10s
     env:
       DATABASE_URL: postgres://postgres:test@localhost/test_db
       ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY_TEST }}
     steps:
       - uses: actions/checkout@v4
       - run: pip install -e ".[dev]"
       - run: pytest tests/integration/ -v
```

**Enforced by**: testing.md, deployment.md
**Violation**: BLOCK deploy to staging

---

### 4. Secrets MUST Come from GitHub Secrets
CI workflows MUST use GitHub Secrets for all sensitive values. No hardcoded credentials.

**Detection Patterns**:
```
❌ env:
     API_KEY: sk-ant-real-key-here  # hardcoded in workflow file
❌ run: export ANTHROPIC_API_KEY=sk-ant-123  # hardcoded in run step
```

**Correct**:
```yaml
✅ env:
     ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
     DATABASE_URL: ${{ secrets.DATABASE_URL_CI }}
```

**Enforced by**: security-reviewer agent, pre-commit hook
**Violation**: BLOCK merge — security critical

---

### 5. Build Artifacts Must Be Versioned and Signed
Release artifacts (PyPI packages, Docker images) MUST:
- Include the version from `pyproject.toml`
- Be built from a clean git state (no uncommitted changes)
- Be uploaded to TestPyPI first, then PyPI (see `deployment.md`)

**Correct release workflow structure**:
```yaml
✅ release:
     runs-on: ubuntu-latest
     if: startsWith(github.ref, 'refs/tags/v')
     steps:
       - uses: actions/checkout@v4
       - name: Verify clean state
         run: git diff --exit-code
       - name: Build
         run: python -m build
       - name: Publish to TestPyPI
         uses: pypa/gh-action-pypi-publish@release/v1
         with:
           repository-url: https://test.pypi.org/legacy/
           password: ${{ secrets.TEST_PYPI_TOKEN }}
       - name: Smoke test TestPyPI install
         run: pip install --index-url https://test.pypi.org/simple/ kailash==${{ github.ref_name }}
       - name: Publish to PyPI
         uses: pypa/gh-action-pypi-publish@release/v1
         with:
           password: ${{ secrets.PYPI_TOKEN }}
```

**Enforced by**: deployment.md checklist
**Violation**: BLOCK release

---

### 6. Rollback Procedure Defined
Every deployment workflow MUST have a documented rollback step or link to a runbook.

**Required** (in workflow file or linked runbook):
- How to revert to the previous version
- How to detect a bad deployment (health check)
- Who to notify on deployment failure

**Correct Pattern**:
```yaml
✅ - name: Deploy
     run: ./scripts/deploy.sh $VERSION

   - name: Verify deployment
     run: ./scripts/health-check.sh
     # On failure: see docs/runbooks/rollback.md for rollback procedure
```

**Enforced by**: deployment.md, observability.md
**Violation**: BLOCK initial production deploy without rollback runbook

---

## MUST NOT Rules

### 1. No `--no-verify` in CI
MUST NOT skip pre-commit hooks or commit verification in CI.

```
❌ git commit --no-verify -m "CI build"
```

### 2. No Pinning to `@latest` or Unpinned Actions
GitHub Actions MUST be pinned to a specific version tag or SHA.

```
❌ uses: actions/checkout@main  # unpinned — supply chain risk
❌ uses: actions/checkout@latest
✅ uses: actions/checkout@v4
✅ uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # SHA pin (most secure)
```

**Enforced by**: security-reviewer agent
**Violation**: MEDIUM priority fix

### 3. No Direct Pushes to Protected Branches from CI
CI MUST NOT force-push or directly commit to `main` or `develop`. All changes go through PRs.

```
❌ run: git push origin main  # CI pushing directly to main
```

---

## CI Performance Guidelines

Keep CI fast — slow CI is ignored or bypassed:
- Unit tests: < 2 minutes
- Lint + type check: < 1 minute
- Integration tests: < 10 minutes
- Full release pipeline: < 20 minutes

Use caching for dependencies:
```yaml
✅ - uses: actions/cache@v4
     with:
       path: ~/.cache/pip
       key: ${{ runner.os }}-pip-${{ hashFiles('**/pyproject.toml') }}
```

---

## Kailash-Specific

### SDK Release CI
- Follows `deployment.md` release checklist in CI form
- Version consistency check (pyproject.toml vs `__init__.py`) runs in CI automatically via `session-start.js` logic

### Workspace Hooks
- CI does NOT run workspace hooks (`.claude/scripts/hooks/`) — hooks are for local development
- Tests in CI test the SDK behavior, not the COC configuration

## Exceptions
CI exceptions require:
1. Written justification in PR description
2. Approval from intermediate-reviewer
3. Issue filed to restore the check — not silently removed permanently
