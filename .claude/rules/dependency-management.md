# Dependency Management and Supply Chain Security Rules

## Scope
These rules apply to ALL `pyproject.toml`, `requirements*.txt`, `package.json`, and `Cargo.toml` files in the repository. They govern how dependencies are added, updated, pinned, and audited.

---

## Core Principle: Every Dependency Is a Trust Decision

Adding a dependency means trusting its author, their supply chain, all its transitive dependencies, and all future versions if unpinned. This is not a trivial decision.

---

## MUST Rules

### 1. Version Specifiers Must Be Intentional
Every dependency MUST have a deliberate version specifier. No bare unpinned names.

**Version specifier guide**:

| Specifier | When to use |
|-----------|-------------|
| `>=1.2, <2` | Libraries — allow patch/minor updates, block breaking changes |
| `~=1.2.3` | Same as `>=1.2.3, <1.3` — conservative patch-only updates |
| `==1.2.3` | Executables/tools, or when exact reproducibility is required |
| `>=1.0` | Only for very stable, widely-trusted packages with strong compatibility guarantees |

**Detection Patterns**:
```
❌ requests  # no version — any version accepted
❌ requests>=1.0  # effectively unbounded
❌ requests==2.28.0  # exact pin for a library — makes updates painful
```

**Correct Pattern**:
```toml
✅ [project]
   dependencies = [
       "requests>=2.28,<3",        # library — allow compatible updates
       "anthropic>=0.30,<1",       # SDK — pin major
       "pydantic>=2.0,<3",         # major version pinned
   ]

   [project.optional-dependencies]
   dev = [
       "pytest==8.1.1",            # dev tool — exact pin for reproducibility
       "ruff==0.4.2",
   ]
```

**Enforced by**: intermediate-reviewer agent on pyproject.toml changes
**Violation**: MEDIUM priority fix

---

### 2. Dependency Audit Before Adding
Before adding a new dependency, MUST verify:

1. **Necessity** — Can existing dependencies or stdlib handle it?
2. **Maintenance** — Is the package actively maintained (commits in last 12 months)?
3. **Popularity** — Is it widely used? (proxy for trustworthiness)
4. **License** — Is the license compatible? (see License Policy below)
5. **Transitive footprint** — How many transitive dependencies does it add?

**Document the decision** in the PR description or a CHANGELOG `### Added` entry.

**Detection Patterns**:
```
❌ # Adding a dependency without PR description explaining why it was chosen
❌ # Adding a package with 0 downloads/week or last commit >2 years ago
```

**Enforced by**: intermediate-reviewer agent
**Violation**: PR blocked pending justification

---

### 3. License Compliance
All dependencies MUST use approved licenses.

**Approved licenses** (permissive — use freely):
- MIT, BSD-2, BSD-3, Apache-2.0, ISC, Python-2.0, CC0

**Conditional licenses** (require review):
- LGPL-2.1, LGPL-3.0 — OK for dynamic linking, check usage pattern
- MPL-2.0 — OK if not modifying the MPL files

**Blocked licenses** (MUST NOT use):
- GPL-2.0, GPL-3.0 — copyleft infects the whole project
- AGPL-3.0 — network copyleft, especially risky for SaaS
- SSPL — service-side copyleft
- Proprietary / no-license — no rights granted

**Enforced by**: security-reviewer agent before releases
**Violation**: BLOCK release until license issue resolved

---

### 4. Vulnerability Scanning
Dependencies MUST be scanned for known vulnerabilities:

- **Before release**: Run `pip audit` (or `safety check`) and resolve all HIGH/CRITICAL findings
- **In CI**: Vulnerability scanning runs on every PR that modifies dependency files
- **On discovery**: If a vulnerability is found in a transient dependency, update the affected package within the SLA:
  - CRITICAL: ≤ 24 hours
  - HIGH: ≤ 7 days
  - MEDIUM: ≤ 30 days
  - LOW: next planned release

**Correct CI integration**:
```yaml
✅ - name: Audit dependencies
     run: pip install pip-audit && pip-audit
```

**Enforced by**: deployment.md checklist, security-reviewer agent
**Violation**: BLOCK release on unresolved HIGH/CRITICAL vulnerabilities

---

### 5. Lock Files for Reproducible Builds
Production deployments MUST use lock files for reproducible installs.

**Python**:
- Use `pip-compile` (pip-tools) to generate `requirements.lock` from `pyproject.toml`
- Commit `requirements.lock` to version control
- CI installs from lock file: `pip install -r requirements.lock`

**Node** (if applicable):
- Commit `package-lock.json` or `yarn.lock`
- CI uses `npm ci` (not `npm install`)

**Detection Patterns**:
```
❌ # No lock file in repo
❌ pip install -r requirements.txt  # in CI — no lock, non-deterministic
```

**Enforced by**: deployment.md, CI pipeline
**Violation**: BLOCK release

---

## MUST NOT Rules

### 1. No Dependencies Installed from Non-Official Sources
MUST NOT install packages from:
- Git URLs (unless for internal packages in a controlled org)
- Unverified private indexes
- Local paths in production configs

```
❌ "my-package @ git+https://github.com/random/my-package"  # in production deps
❌ "suspicious-tool @ https://example.com/suspicious-tool.tar.gz"
```

**Correct**:
```toml
✅ # Internal packages: use a private PyPI index configured in pip.conf
   # External packages: always install from pypi.org
```

### 2. No Unused Dependencies
MUST NOT keep unused dependencies in `pyproject.toml`. Unused dependencies:
- Expand attack surface
- Slow install times
- Create false license obligations

Run `pip-autoremove` or audit imports to detect unused packages before release.

### 3. No Direct Pinning of Transitive Dependencies
MUST NOT add transitive (indirect) dependencies to `pyproject.toml` unless resolving a security issue.

```
❌ "urllib3==1.26.18"  # transitive dep of requests — let requests manage it
```

**Exception**: Security patches that upstream hasn't released yet.

---

## Update Policy

| Dependency type | Update frequency | Process |
|-----------------|-----------------|---------|
| Security patches | Immediately (per SLA) | Hotfix branch |
| Major versions | Deliberate, with testing | Feature branch, full test suite |
| Minor/patch updates | Monthly sweep | Automated PR via Dependabot/Renovate |
| Dev dependencies | With each release cycle | Batch update PR |

---

## Kailash-Specific

### Core SDK and Framework Packages
- `kailash`, `kailash-dataflow`, `kailash-nexus`, `kailash-kaizen`, `kailash-pact` are internal — pin to exact version in production deployments, use compatible range in library code
- When a Kailash SDK bug is found, fix the source — do NOT pin around it (see `zero-tolerance.md`)

## Exceptions
Dependency exceptions require:
1. Written justification (security, legacy compatibility)
2. Approval from security-reviewer
3. Time-limited: tracked with a resolution deadline in journal
