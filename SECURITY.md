# 🛡️ Security, Privacy & Compliance Architecture (SECURITY.md)

## 1. Security Overview & Threat Modeling (STRIDE)

JustitiaAI implements defense-in-depth principles across all architectural layers to protect privileged legal work product and vulnerable client evidentiary data:

| Threat Category | Potential Attack Vector | JustitiaAI Countermeasure & Technical Control |
| :--- | :--- | :--- |
| **Spoofing** | Forged client identity or unauthorized counsel claims | Firebase Auth JWT signature verification with cryptographic public key rotation; RBAC authorization middleware. |
| **Tampering** | Alteration of legal audit trails or evidentiary documents | Google Cloud Storage WORM retention policies; Google Cloud KMS Customer-Managed Encryption Keys (CMEK); immutable BigQuery audit partitioning. |
| **Repudiation** | Denying submission of contract reviews or triage filings | Tamper-evident BigQuery event streaming recording anonymized client IP, SHA-256 event IDs, and microsecond timestamps. |
| **Information Disclosure** | PII leakage into generative AI context windows | Client-side and server-side multi-pass regex/NER filters redacting SSNs, financial accounts, and contact data prior to LLM processing. |
| **Denial of Service** | Volumetric scraping or automated query exhaustion | In-memory token bucket rate limiting; Cloud Run auto-scaling with concurrency limits; query caching layer. |
| **Elevation of Privilege** | Pro-se user attempting to access administrative telemetry | Strict dependency injection role validators (`require_roles([UserRole.ENTERPRISE_COUNSEL, UserRole.ADMIN])`). |

---

## 2. OWASP Top 10 (2025) Mitigations

1. **A01: Broken Access Control:** Enforced at the router level through FastAPI dependency injection with strongly typed `AuthenticatedUser` models.
2. **A02: Cryptographic Failures:** AES-256 CMEK encryption at rest on Google Cloud Storage; TLS 1.3 in transit with strict HSTS (`Strict-Transport-Security: max-age=31536000; includeSubDomains`).
3. **A03: Injection (SQL & Prompt Injection):**
   - Parameterized BigQuery streaming inserts preventing SQL injection.
   - Foundation model system instructions strictly isolated from user prompt payloads to prevent jailbreaks and indirect prompt injection.
4. **A04: Insecure Design:** Adherence to ABA Model Rule 5.5 prevents unauthorized practice of law through automated jurisdictional disclaimers.
5. **A05: Security Misconfiguration:** Hardened HTTP security headers (`Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`).

---

## 3. Vulnerability Disclosure Policy

If you discover a security vulnerability in JustitiaAI, please submit a report to `security@justitia.legal`. Reports are acknowledged within 24 hours, with critical patches deployed within 72 hours under our responsible disclosure program.
