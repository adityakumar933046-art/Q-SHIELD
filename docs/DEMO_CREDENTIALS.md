# Q-SHIELD — Presentation Demo Credentials

> [!IMPORTANT]
> **DEVELOPMENT & DEMONSTRATION USE ONLY**  
> These credentials are loaded from environment variables or safe local defaults for SIH Grand Finale presentation testing. They must not be deployed to production environments.

---

## Pre-Configured Presentation Accounts

| Role | Username | Email | Development Password | Department / Node |
|---|---|---|---|---|
| **Administrator** | `admin` | `admin@quantum.defense.gov` | `AdminDevPassword2026!` | Security Operations Center |
| **Signer (Quantum Operator)** | `signer_alice` | `alice@quantum.defense.gov` | `SignerDevPassword2026!` | Quantum Key Distribution Lab |
| **Verifier** | `verifier_bob` | `bob@quantum.defense.gov` | `VerifierDevPassword2026!` | Verification Node 01 |
| **Security Analyst** | `analyst_carol` | `carol@quantum.defense.gov` | `AnalystDevPassword2026!` | Threat Intelligence SOC |

---

## Environment Variable Configuration

To customize seed credentials, set the following environment variables in `backend/.env`:

```env
SEED_ADMIN_PASSWORD=YourCustomAdminPassword2026!
SEED_SIGNER_PASSWORD=YourCustomSignerPassword2026!
SEED_VERIFIER_PASSWORD=YourCustomVerifierPassword2026!
SEED_ANALYST_PASSWORD=YourCustomAnalystPassword2026!
```

Re-run the database seeder script to populate:
```bash
cd backend
python seed_data.py
```
