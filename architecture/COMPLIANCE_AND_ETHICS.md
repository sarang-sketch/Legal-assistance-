# JustitiaAI Legal Ethics, Compliance & Governance Framework

## 1. Compliance with ABA Model Rules of Professional Conduct

### 1.1 Rule 5.5: Unauthorized Practice of Law (UPL)
JustitiaAI is engineered with strict technical controls preventing the unauthorized practice of law:
- **Informational Copilot Paradigm:** The system acts strictly as an analytical accelerator, research engine, and clerical workflow tool. It does not provide individualized legal representation or establish attorney-client relationships.
- **Mandatory Disclaimers:** Every generated output is cryptographically signed and injected with statutory disclaimers reminding users that AI outputs must be validated by a licensed attorney.
- **Jurisdictional Boundary Guard:** Queries are parameterized by explicit jurisdiction, refusing to apply laws of foreign states without clear disclaimers.

### 1.2 Rule 1.1: Competence & Diligence (AI Grounding)
To prevent legal AI hallucinations (e.g. fabricated court citations that led to sanctions in *Mata v. Avianca*), JustitiaAI mandates:
1. **Google Search Grounding:** Dual-verification of cited case names, docket numbers, and regional reporter references against official court dockets.
2. **Automated Shepardizing:** Real-time cross-referencing against an overruled case registry. Any citation deemed bad law is rejected and flagged with critical warnings.

---

## 2. Privacy, Security & Attorney-Client Privilege

### 2.1 PII & Evidentiary Scrubbing
Before any prompt or document chunk reaches model context windows, JustitiaAI applies regularized tokenizers and NER models to redact:
- Social Security Numbers (`SSN`)
- Bank Account & Routing Numbers
- Phone Numbers and Personal Email Addresses
- Sensitive Minor Identifiers

### 2.2 SOC2 & ISO 27001 Data Confidentiality
- **Customer-Managed Encryption Keys (CMEK):** Client vaults in Google Cloud Storage are encrypted using dedicated Cloud KMS keys.
- **Zero-Training Guarantee:** Data sent to Vertex AI enterprise foundation models is never retained or used to train public Google models.
