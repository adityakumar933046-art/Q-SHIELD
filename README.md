# Q-SHIELD: Quantum-Inspired Cyber Threat Detection for Digital Signature Security

> **SIH Problem Statement 26141**  
> Complete software framework for Teleportation-based Quantum Digital Signatures (QDS) and non-machine-learning statistical threat detection.

---

## 🌟 Key Capabilities & Features

- **Strict No AI/ML Policy**: All threat detection, anomaly detection, and security evaluations rely exclusively on quantum statistical physics limits, Pauli projective measurement distributions, trace distance / density matrix fidelity $\mathcal{F}(\rho, \sigma)$, Chi-Square ($\chi^2$) hypothesis testing, and Sequential Probability Ratio Tests (SPRT).
- **Quantum Teleportation Engine**: Built on **Qiskit** & **NumPy** for single/multi-qubit Pauli eigenstate preparation ($|0\rangle, |1\rangle, |+\rangle, |-\rangle, |+i\rangle, |-i\rangle$), Bell-state entanglement ($|\Phi^+\rangle, |\Phi^-\rangle, |\Psi^+\rangle, |\Psi^-\rangle$), Bell State Measurements (BSM), and Bob Pauli recovery operator simulation.
- **Full Cyber Attack Simulator**: Real-time simulation of:
  1. Signature Forgery Attacks
  2. Sender Impersonation Attacks
  3. Replay Attacks
  4. Quantum Channel Noise & Intercept-Resend Manipulation
  5. Unauthorized Verification Attempts
- **11 Modular Django Backend Apps**: `accounts`, `organizations`, `qds`, `quantum_engine`, `verification`, `statistics_engine`, `threat_detection`, `attack_simulator`, `incidents`, `analytics`, `audit`.
- **Modern React + TypeScript + Vite + Tailwind UI**: Live threat telemetry, interactive QDS Studio, attack simulation suite, Qiskit circuit model visualizers, and Recharts telemetry graphs.

---

## 🚀 Project Structure

```
q-shield/
├── backend/
│   ├── manage.py
│   ├── seed_data.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── .env
│   ├── qshield/                  # Root Django Configuration
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── exceptions.py
│   └── apps/                     # 11 Modular Apps
│       ├── accounts/
│       ├── organizations/
│       ├── qds/
│       ├── quantum_engine/       # Qiskit simulation & density matrix statevector engine
│       ├── verification/         # Quantum signature verification workflow
│       ├── statistics_engine/    # Chi-Square, SPRT, QBER calculation
│       ├── threat_detection/     # Statistical threshold evaluator
│       ├── attack_simulator/     # Vector simulation runner
│       ├── incidents/            # Security incident mitigation
│       ├── analytics/            # Aggregated telemetry summary
│       └── audit/                # Immutable transaction audit trail
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── src/
│       ├── components/           # Navbar, Sidebar, StatCard, CircuitVisualizer
│       ├── pages/                # Dashboard, QdsStudio, AttackSimulator, Threats, Analytics, Audit
│       ├── services/             # Axios REST API client
│       └── types/                # TypeScript type definitions
└── docs/
    └── ARCHITECTURE.md           # Full Technical & Mathematical Specification
```

---

## 🛠️ Quick Start & Execution Guide

### Prerequisites
- Python 3.10+
- Node.js v18+ & npm

### 1. Backend Setup & Server Start

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run migrations & seed data
python manage.py migrate
python seed_data.py

# Run Django backend server (Port 8000)
python manage.py runserver 8000
```

*Default Seed Credentials:*
- Admin User: `admin` / `admin123`
- Operator User: `operator` / `operator123`

### 2. Frontend Setup & Dev Server Start

```bash
cd frontend

# Install packages
npm install

# Build for production verification
npm run build

# Start Vite dev server (Port 5173)
npm run dev
```

Open your browser to `http://localhost:5173` to access the Q-SHIELD Dashboard!

---

## 🧪 Running Automated Tests

To run the backend unit test suite (testing Qiskit fidelity, Chi-Square hypothesis calculations, and threat detection thresholds):

```bash
cd backend
python manage.py test apps.quantum_engine.tests apps.statistics_engine.tests apps.threat_detection.tests
```

---

## 📚 Technical Documentation

For in-depth mathematical formulations, teleportation circuit mechanics, and statistical threshold bounds, refer to [ARCHITECTURE.md](docs/ARCHITECTURE.md).
