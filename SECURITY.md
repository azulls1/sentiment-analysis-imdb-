# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 1.0.x   | Yes                |
| < 1.0   | No                 |

## Reporting a Vulnerability

We take security seriously. If you discover a vulnerability, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

### How to Report

1. Email: **security@iagentek.com.mx**
2. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgement**: Within 48 hours of your report.
- **Assessment**: We will evaluate severity within 5 business days.
- **Resolution**: Critical vulnerabilities will be patched within 7 days. High-severity issues within 14 days.
- **Disclosure**: We will coordinate public disclosure with you after a fix is released.

## Security Update Process

1. Vulnerabilities are triaged by severity (Critical, High, Medium, Low).
2. Critical and High findings trigger an immediate patch release.
3. Medium and Low findings are addressed in the next scheduled release.
4. All security patches are documented in the CHANGELOG.

## Security Measures in Place

- **Secret management**: Docker-secrets-first resolution (`/run/secrets/<name>` -> env var -> default) for all sensitive configuration (Supabase credentials, API key). See `backend/config.py:_load_secret()`.
- **Secret scanning**: Gitleaks runs in CI on every push and pull request.
- **Dependency scanning**: Trivy (CRITICAL blocking, HIGH advisory), pip-audit, and npm audit run in CI.
- **Pre-commit hooks**: Gitleaks pre-commit hook available for local development.
- **API authentication**: Optional API key enforcement via `X-API-Key` header.
- **Rate limiting**: Per-IP sliding-window rate limiting with configurable thresholds.
- **Security headers**: CSP, HSTS (2-year max-age), X-Frame-Options DENY, X-Content-Type-Options nosniff, X-XSS-Protection, Referrer-Policy enforced.
- **CORS**: Restricted to explicit allowed origins with limited methods (`GET`, `POST`, `OPTIONS`) and headers.
- **Request timeout**: Configurable server-side timeout (default 30 s) to prevent slowloris attacks.
- **Circuit breaker**: Zero-shot classification service uses a three-state circuit breaker (CLOSED/OPEN/HALF_OPEN) to prevent cascade failures.

## Secret Management

### Local Development

Secrets are loaded from `.env` file or environment variables.

### Docker / Production

Secrets are mounted as Docker secrets at `/run/secrets/<name>`. The application
checks this path first before falling back to environment variables.

Supported secret names:
- `supabase_url`
- `supabase_anon_key`
- `supabase_service_key`
- `api_key`

See `docker-compose.yml` for the secrets configuration block (uncomment for production).

## Responsible Disclosure

We kindly ask that you:
- Allow reasonable time for us to fix the issue before public disclosure.
- Do not access or modify other users' data.
- Do not perform actions that could harm the availability of the service.
