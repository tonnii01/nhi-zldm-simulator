# NHI-ZLDM: Non-Human Identity Zero-Trust Lifecycle Defense Model Simulator

NHI-ZLDM is an interactive, high-fidelity security simulator designed to demonstrate and visualize vulnerabilities in the Non-Human Identity (NHI) lifecycle and how the Zero-Trust Lifecycle Defense Model (ZLDM) layers protect against active threats.

---

## 🚀 Overview

Modern enterprise environments contain 50x to 100x more machine identities (API keys, service tokens, client certificates, database credentials) than human identities. Unlike human accounts, NHIs typically lack interactive Multi-Factor Authentication (MFA), often possess excessive privileges, and are frequently orphaned after project decommissions. 

This project simulates real-world attack vectors targeting NHIs and shows how implementing a multi-layered zero-trust defense framework can intercept and mitigate breaches.

---

## 🛠️ Key Features

1. **Identity Paradigm Shift (Dashboard)**
   * Side-by-side comparative analysis of **Human Identity** vs. **Non-Human Identity (NHI)** across major security parameters: Lifecycle, Authentication, Monitoring, Privilege Level, and Scale.
2. **NHI Lifecycle Explorer**
   * Clickable interactive timeline mapping the 5 stages of an NHI lifecycle: **Creation, Provisioning, Active Use, Rotation, and Decommission**.
   * Displays specific vulnerability risks and zero-trust countermeasures at each stage.
3. **Interactive Simulation Center**
   * Live attack-defense visualization showing traffic flow and credential packet movement between nodes (Attacker, VCS/GitHub, Identity Provider, Production Database, and ZLDM SOC).
   * Interactive toggles to activate/deactivate defense controls:
     * **Layer 1: Proactive Hardening** (Secrets Vaulting & CI/CD scan)
     * **Layer 2: Active Governance** (JIT access & Token TTL/Rotation)
     * **Layer 3: Threat Containment** (ITDR & Behavioral Anomaly detection)
   * Real-time console logs terminal displaying the step-by-step compromise or interception sequence.

---

## 📁 Project Structure

*   [index.html](file:///c:/xampp/htdocs/nhi-zldm-simulator/index.html) — Core DOM structure, responsive flexbox/grid layout, and inline SVGs for the simulation canvas.
*   [styles.css](file:///c:/xampp/htdocs/nhi-zldm-simulator/styles.css) — Premium visual theme featuring dark mode, cyber-cyberpunk glassmorphism, animated glow effects, customized sliders, and interactive layout elements.
*   [app.js](file:///c:/xampp/htdocs/nhi-zldm-simulatory/app.js) — Interactive simulator logic, custom event listeners, SVG network coordinate calculations, packet animation controls, and log terminal outputs.
*   [NHI_Cs.pdf](file:///c:/xampp/htdocs/nhi-zldm-simulator/NHI_Cs.pdf) — Academic research paper reference detailing Non-Human Identity attacks, risks, exploitation techniques, and defense strategies.

---

## ⚙️ Historical Scenarios Simulated

*   **New York Times Breach (2024)**: Attack vector via exposed GitHub PAT (Personal Access Token). Demonstrates Layer 1 CI/CD scanning/vaulting defenses, and Layer 3 geographical clone detection.
*   **Cloudflare Incident (2024)**: Lateral movement using a stale/unrotated Okta service account token. Demonstrates Layer 2 token TTL/automatic rotation, and Layer 3 session termination.
*   **Adobe Commerce (2024)**: High-frequency administrative key abuse to inject a malicious payment skimmer. Demonstrates Layer 1 key hardening, Layer 2 JIT rotation, and Layer 3 behavioral write-anomaly containment.

---

## 💻 How to Run Locally

Since this is a client-side web application built with vanilla web technologies, no build server compilation is required:

1. Clone or download the repository.
2. Double-click [index.html](file:///c:/xampp/htdocs/nhi-zldm-simulator/index.html) to open it directly in any modern web browser (Chrome, Firefox, Edge, Safari).
3. Alternatively, serve it via local hosting utilities:
    * **VS Code Live Server**: Right-click `index.html` -> "Open with Live Server".
    * **Python**: Run `python -m http.server 8000` in the directory.
    * **Node.js**: Run `npx serve` in the directory.
    * **Apache/XAMPP**: Move the project folder to your `htdocs` directory and navigate to `http://localhost/nhi-zldm-simulator/`.
