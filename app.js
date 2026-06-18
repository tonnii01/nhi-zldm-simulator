// Core JavaScript Logic for NHI-ZLDM Simulator

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initLifecycleExplorer();
  initSimulator();
});

// ==========================================
// 1. SPA Navigation Tab Switching
// ==========================================
function initTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  const pages = document.querySelectorAll('.page-view');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      // Add active to current tab
      tab.classList.add('active');

      // Hide all pages
      pages.forEach(page => page.classList.remove('active'));
      // Show target page
      const targetId = tab.getAttribute('data-target');
      const targetPage = document.getElementById(targetId);
      if (targetPage) {
        targetPage.classList.add('active');
      }
    });
  });
}

// ==========================================
// 2. Interactive Lifecycle Explorer
// ==========================================
const LIFECYCLE_STAGES = {
  creation: {
    name: "Creation Stage",
    desc: "The beginning of the Non-Human Identity (NHI) lifecycle, where developers or CI/CD pipelines generate credentials (API keys, service tokens, certificates) to integrate third-party tools or automate systems.",
    riskTitle: "Hardcoded Secrets in Source Code",
    riskDesc: "Credentials are saved directly inside Git repositories, local configuration files, or documentation templates. Threat actors scan public repos (e.g. GitHub) or access private folders to harvest naked credentials.",
    defenseTitle: "Secrets Vault & CI/CD Scans",
    defenseDesc: "Integrate a secrets vault (e.g., HashiCorp Vault) to dynamically inject tokens. Implement automated pre-commit scanning hooks to analyze code changes and reject pushes containing plaintext credentials."
  },
  provisioning: {
    name: "Provisioning Stage",
    desc: "The process of registering the NHI, specifying its directory, and assigning scopes, roles, and resource access permissions in order for the service account to communicate with cloud infrastructure.",
    riskTitle: "Excessive Privileges & Lack of Scoping",
    riskDesc: "Due to lack of fine-grained management, service accounts are frequently granted full administrative or broad read/write access ('convenience configuration'), violating the Principle of Least Privilege.",
    defenseTitle: "Least Privilege Gate & JIT Access",
    defenseDesc: "Implement a 'Privilege Justification Gate' requiring approvals for permissions. Enforce Just-In-Time (JIT) IAM scopes so permissions are only active during scheduled execution windows, then automatically revoked."
  },
  use: {
    name: "Active Use Stage",
    desc: "The operational phase where machines authenticate programmatically to execute APIs, coordinate Kubernetes clusters, query databases, and synchronize microservices without human involvement.",
    riskTitle: "Token Theft & Lateral Movement",
    riskDesc: "If an active token is compromised (via man-in-the-middle, log ingestion, or server-side request forgery), the attacker can replicate the machine's API requests and pivot laterally to other sensitive connected services.",
    defenseTitle: "ITDR & Behavioral Anomaly Detection",
    defenseDesc: "Leverage Identity Threat Detection and Response (ITDR) to establish behavioral baselines (IP, timing patterns, API calls) for each NHI. Any sudden geographic deviation or query spike triggers immediate containment."
  },
  rotation: {
    name: "Rotation Stage",
    desc: "The maintenance phase where credentials must be periodically refreshed, re-issued, or replaced to limit the window of exposure and minimize the usefulness of any leaked secrets.",
    riskTitle: "Rotation Failures & Stale Credentials",
    riskDesc: "Manual rotation is prone to failure, often leading to developer hesitation and indefinitely long-lived secrets. When automated rotation fails due to sync lag, stale active credentials remain usable by attackers.",
    defenseTitle: "Automated Secret Rotation Policy",
    defenseDesc: "Deploy a centralized credential manager that automatically rotates keys at fixed Time-To-Live (TTL) intervals and seamlessly synchronizes the new secrets with corresponding microservices without manual code edits."
  },
  decommission: {
    name: "Decommission Stage",
    desc: "The final phase where a project is retired, an integration is disconnected, or a service pipeline is shut down, requiring all associated credentials to be revoked and wiped from the system.",
    riskTitle: "Orphaned NHIs Left Active",
    riskDesc: "When cloud infrastructure is decommissioned, associated service accounts are frequently forgotten. These 'orphaned credentials' remain active in the directory, representing a silent backdoor for attackers.",
    defenseTitle: "NHI Lifecycle Governance",
    defenseDesc: "Set up trigger logic where decommission events (retiring a repository or cloud project) automatically broadcast instructions to the Identity Provider to delete all associated service accounts and API tokens."
  }
};

function initLifecycleExplorer() {
  const steps = document.querySelectorAll('.lifecycle-step');
  const panel = document.getElementById('stage-detail');
  const nameEl = document.getElementById('detail-stage-name');
  const descEl = document.getElementById('detail-stage-desc');
  const riskTitleEl = document.getElementById('detail-risk-title');
  const riskDescEl = document.getElementById('detail-risk-desc');
  const defenseTitleEl = document.getElementById('detail-defense-title');
  const defenseDescEl = document.getElementById('detail-defense-desc');

  steps.forEach(step => {
    step.addEventListener('click', () => {
      // Deactivate all steps
      steps.forEach(s => s.classList.remove('active'));
      // Activate clicked step
      step.classList.add('active');

      const stageKey = step.getAttribute('data-stage');
      const data = LIFECYCLE_STAGES[stageKey];

      if (data) {
        // Remove animation class to restart it
        panel.classList.remove('fade-in');
        // Force reflow
        void panel.offsetWidth;

        // Update content
        nameEl.textContent = data.name;
        descEl.textContent = data.desc;
        riskTitleEl.textContent = data.riskTitle;
        riskDescEl.textContent = data.riskDesc;
        defenseTitleEl.textContent = data.defenseTitle;
        defenseDescEl.textContent = data.defenseDesc;

        // Add animation class back
        panel.classList.add('fade-in');
      }
    });
  });
}

// ==========================================
// 3. Interactive Attack & Defense Simulator
// ==========================================
const SCENARIO_DATA = {
  nyt: {
    title: "New York Times Breach (2024)",
    desc: "An attacker found a developer's GitHub Personal Access Token (PAT) leaked in a public repository. The token had excessive permissions, allowing the attacker to clone repositories and steal 270GB of code and documentation.",
    nodeMap: { repo: true, iam: false },
    primaryDefense: "l1",
    targetLine: "line-attacker-repo"
  },
  cloudflare: {
    title: "Cloudflare Incident (2024)",
    desc: "An attacker gained access to a static, unrotated Okta credential belonging to a service account. They used this stale token to authenticate weeks after creation, pivoting laterally across Cloudflare's internal systems.",
    nodeMap: { repo: false, iam: true },
    primaryDefense: "l2",
    targetLine: "line-attacker-iam"
  },
  adobe: {
    title: "Adobe Commerce Exploitation (2024)",
    desc: "An attacker obtained an administrative API key/token. They used this credential to make high-frequency admin calls, eventually injecting a payment skimmer script into the checkout flow of Adobe Commerce systems.",
    nodeMap: { repo: false, iam: true },
    primaryDefense: "l3",
    targetLine: "line-attacker-iam"
  }
};

let currentScenario = 'nyt';
let simTimeoutId = null;

function initSimulator() {
  const scenarioBtns = document.querySelectorAll('.scenario-btn');
  const infoTitle = document.getElementById('info-title');
  const infoText = document.getElementById('info-text');
  const runBtn = document.getElementById('btn-run-sim');
  const clearLogsBtn = document.getElementById('btn-clear-logs');
  const closeAlertBtn = document.getElementById('btn-close-alert');
  const alertModal = document.getElementById('sim-alert');

  // Toggle checks
  const toggleL1 = document.getElementById('toggle-l1');
  const toggleL2 = document.getElementById('toggle-l2');
  const toggleL3 = document.getElementById('toggle-l3');

  // Scenario selection handler
  scenarioBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (runBtn.disabled) return; // Prevent clicking during active simulation

      scenarioBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const scenKey = btn.getAttribute('data-scenario');
      currentScenario = scenKey;

      const data = SCENARIO_DATA[scenKey];
      if (data) {
        infoTitle.textContent = data.title;
        infoText.textContent = data.desc;

        // Reset toggles for default vulnerable state
        toggleL1.checked = false;
        toggleL2.checked = false;
        toggleL3.checked = false;

        resetArena();
        appendLog(`[INFO] Loaded scenario: ${data.title}. Protection toggles reset.`, 'text-cyan');
      }
    });
  });

  // Run Simulation Handler
  runBtn.addEventListener('click', () => {
    runBtn.disabled = true;
    runSimulation();
  });

  // Clear Logs Handler
  clearLogsBtn.addEventListener('click', () => {
    const logsContainer = document.getElementById('console-logs');
    logsContainer.innerHTML = '';
    appendLog('[INFO] Log terminal cleared. Standing by...', 'text-muted');
  });

  // Close Alert Handler
  closeAlertBtn.addEventListener('click', () => {
    alertModal.style.display = 'none';
  });
}

// Reset Arena elements
function resetArena() {
  // Clear any active timeouts
  if (simTimeoutId) {
    clearTimeout(simTimeoutId);
  }

  const runBtn = document.getElementById('btn-run-sim');
  runBtn.disabled = false;

  // Nodes
  document.getElementById('node-repo').classList.remove('active');
  document.getElementById('node-iam').classList.remove('active');
  document.getElementById('node-system').className = 'arena-node system-node'; // Reset state classes
  document.getElementById('node-command').classList.remove('active');

  // Lines
  const lines = document.querySelectorAll('.connection-line');
  lines.forEach(l => {
    l.classList.remove('active');
    l.classList.remove('active-threat');
  });

  // Checkpoints
  document.getElementById('checkpoint-l1').style.display = 'none';
  document.getElementById('checkpoint-l2').style.display = 'none';
  document.getElementById('checkpoint-l3').style.display = 'none';

  // Packet
  const packet = document.getElementById('credential-packet');
  packet.style.display = 'none';
  packet.className = 'credential-packet';

  // Shield
  const shield = document.getElementById('overall-shield');
  shield.className = 'shield-indicator idle';
  shield.querySelector('.indicator-text').textContent = 'SYSTEM IDLE';
}

function appendLog(message, className = '') {
  const logsContainer = document.getElementById('console-logs');
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  
  const div = document.createElement('div');
  div.className = `log-line ${className}`;
  div.textContent = `[${timeStr}] ${message}`;
  
  logsContainer.appendChild(div);
  logsContainer.scrollTop = logsContainer.scrollHeight;
}

// Run step-by-step logic
function runSimulation() {
  resetArena();

  const l1On = document.getElementById('toggle-l1').checked;
  const l2On = document.getElementById('toggle-l2').checked;
  const l3On = document.getElementById('toggle-l3').checked;

  const data = SCENARIO_DATA[currentScenario];
  const packet = document.getElementById('credential-packet');
  const shield = document.getElementById('overall-shield');

  appendLog(`[ATTACK] Initiating attack simulation: ${data.title}...`, 'text-warn');
  shield.className = 'shield-indicator compromised';
  shield.querySelector('.indicator-text').textContent = 'ATTACK ACTIVE';

  // Step 1: Attacker connects to Repository or Identity gateway
  const targetNodeId = data.nodeMap.repo ? 'node-repo' : 'node-iam';
  const targetNode = document.getElementById(targetNodeId);
  const targetLine = document.getElementById(data.targetLine);

  packet.style.display = 'block';
  packet.classList.add('threat-packet');
  packet.style.top = '25%';
  packet.style.left = '10%';
  packet.style.transition = 'none';

  // Trigger reflow for packet start pos
  void packet.offsetWidth;

  // Animate to node 1
  packet.style.transition = 'top 1s linear, left 1s linear';
  if (data.nodeMap.repo) {
    packet.style.top = '25%';
    packet.style.left = '45%';
  } else {
    packet.style.top = '70%';
    packet.style.left = '30%';
  }
  targetLine.classList.add('active-threat');

  simTimeoutId = setTimeout(() => {
    // Phase 1 check: Initial entry / hardcoded leaks
    if (currentScenario === 'nyt') {
      appendLog(`[ATTACK] Threat actor attempting code push containing plaintext GitHub PAT...`, 'text-warn');
      
      if (l1On) {
        // Blocked at Layer 1
        blockAttack('l1', '30%', '25%', 
          '[L1 HARDENING] CI/CD static scan detected credential pattern in commit push.',
          '[L1 HARDENING] Vault integration active: Rejected plaintext credential upload. Push BLOCKED.',
          'NYT Breach Blocked: Pre-Commit Scanning Active',
          'The simulator successfully blocked the attacker at Layer 1 (Proactive Hardening). Centralized secrets vault mapping and automated repository pre-commit hooks prevented the plain token from ever leaking into the Git history.'
        );
        return;
      } else {
        // Passes to Repo
        targetNode.classList.add('active');
        appendLog(`[WARN] Vulnerability exposed: Plaintext PAT committed to GitHub. No scanners active.`, 'text-danger');
        
        // Attacker clones repo and moves to DB
        simTimeoutId = setTimeout(() => {
          appendLog(`[ATTACK] Attacker harvested token. Initializing mass cloning of codebases from Git repository...`, 'text-warn');
          
          packet.style.top = '50%';
          packet.style.left = '80%';
          document.getElementById('line-repo-system').classList.add('active-threat');

          simTimeoutId = setTimeout(() => {
            // Check Layer 3 Anomaly containment
            if (l3On) {
              blockAttack('l3', '60%', '37.5%',
                '[L3 DETECT] Baseline engine detects anomalous volume of clone calls from external geographic IP.',
                '[L3 DETECT] Anomaly score exceeded critical threshold! Containment playbook executed: Service account token SUSPENDED.',
                'NYT Breach Contained: ITDR Baseline Alert Triggered',
                'Layer 3 Threat Containment successfully intercepted the attacker mid-attack. The Behavioral Baseline engine flagged the rapid volume clone spike, and the SOC playbook suspended the compromised token before exfiltration completed.'
              );
            } else if (l2On) {
              blockAttack('l2', '60%', '37.5%',
                '[L2 GOVERNANCE] Access attempt evaluated against directory policies.',
                '[L2 GOVERNANCE] Access DENIED: Requested scopes exceed permissions allowed by Privilege Justification Gate.',
                'NYT Breach Prevented: Scopes Restricted',
                'Layer 2 Governance blocked the breach. The Privilege Justification Gate restricted the token to a single micro-repository, meaning the attacker was unable to pivot and clone the corporate codebases.'
              );
            } else {
              breachSystem('NYT Breach Successful: 270GB Data Stolen', 
                'The attacker successfully bypassed all systems. With no secrets scanning, JIT controls, or threat detection active, the attacker used the exposed PAT to clone the corporate codebases and exfiltrate 270GB of raw IP data.'
              );
            }
          }, 1000);
        }, 1200);
      }
    } 

    else if (currentScenario === 'cloudflare') {
      appendLog(`[ATTACK] Threat actor attempting authentication to Okta using harvested service account token...`, 'text-warn');
      
      if (l2On) {
        // Blocked at Layer 2
        blockAttack('l2', '20%', '47.5%', 
          '[L2 GOVERNANCE] Okta IAM gate intercepted authentication token.',
          '[L2 GOVERNANCE] Verification Failed: Token expired. Automated rotation updated credentials weeks ago. Connection Rejected.',
          'Cloudflare Breach Blocked: Token Rotation Successful',
          'Layer 2 Governance blocked the attack. Because automated credential rotation is enforced and token TTL is restricted, the stolen service account token had already expired and was invalid when the attacker attempted to authenticate.'
        );
        return;
      } else {
        // Passes to IAM Gate
        targetNode.classList.add('active');
        appendLog(`[WARN] Authentication successful: Okta gateway accepted static unrotated credentials.`, 'text-danger');
        
        // Attacker moves laterally
        simTimeoutId = setTimeout(() => {
          appendLog(`[ATTACK] Threat actor attempting lateral movement to production servers...`, 'text-warn');
          
          packet.style.top = '50%';
          packet.style.left = '80%';
          document.getElementById('line-iam-system').classList.add('active-threat');

          simTimeoutId = setTimeout(() => {
            if (l3On) {
              blockAttack('l3', '55%', '60%',
                '[L3 DETECT] Behavioral engine detected geo-velocity anomaly (Active call from unrecognized geographic range).',
                '[L3 DETECT] SOC containment activated: API sessions terminated and credentials suspended in directory.',
                'Cloudflare Breach Contained: Geo-Anomaly Suspend',
                'Layer 3 Containment active. The Behavioral Baseline engine detected a sudden login sequence from an unauthorized IP. The automation playbook suspended the service account, severing the attacker\'s session.'
              );
            } else {
              breachSystem('Cloudflare Breach Successful: Lateral Pivot',
                'System compromised! The attacker authenticated using the stale token. Lacking lifecycle rotation and behavioral analysis, the nation-state actor established a persistent backdoor, gaining access to the internal network.'
              );
            }
          }, 1000);
        }, 1200);
      }
    }

    else if (currentScenario === 'adobe') {
      appendLog(`[ATTACK] Threat actor initiating administrative API transaction using stolen crypto key...`, 'text-warn');
      
      if (l1On) {
        // Blocked at Layer 1 (Vault management)
        blockAttack('l1', '20%', '47.5%',
          '[L1 HARDENING] Security vault enforces signed encryption keys; plaintext keys are banned.',
          '[L1 HARDENING] Request rejected. Plain key has no authorized environment mapping.',
          'Adobe Breach Prevented: Key Hardened',
          'Layer 1 Proactive Hardening saved the store. The crypto key was managed dynamically in a secrets vault rather than stored statically, making the stolen string useless outside the secure runtime environment.'
        );
        return;
      } else {
        targetNode.classList.add('active');
        appendLog(`[WARN] API key authorized. Access granted with full Administrative privileges.`, 'text-danger');
        
        // Attacker attempts to write script
        simTimeoutId = setTimeout(() => {
          appendLog(`[ATTACK] Attacker calling administrative endpoints to inject checkout skimmer script...`, 'text-warn');
          
          packet.style.top = '50%';
          packet.style.left = '80%';
          document.getElementById('line-iam-system').classList.add('active-threat');

          simTimeoutId = setTimeout(() => {
            if (l3On) {
              blockAttack('l3', '55%', '60%',
                '[L3 DETECT] Anomaly scoring engine flags sudden API write transaction spike vs behavioral baseline.',
                '[L3 DETECT] Threat level critical: Executing Containment Playbook. Token SUSPENDED and database sessions locked.',
                'Adobe Breach Contained: API Spike Blocked',
                'Layer 3 Threat Containment blocked the checkout injection. The Behavioral engine immediately flagged a high-frequency spike of administrative configuration write commands and automatically suspended the key.'
              );
            } else if (l2On) {
              blockAttack('l2', '55%', '60%',
                '[L2 GOVERNANCE] Central scheduler checks token validity TTL.',
                '[L2 GOVERNANCE] Access revoked mid-call: Rotation schedule triggered, invalidating stale token.',
                'Adobe Breach Blocked: Mid-Call Auto-Rotation',
                'Layer 2 Governance saved the platform. Just-in-Time token constraints and the automated rotation schedule expired the attacker\'s administrative token before the code injection script could compile.'
              );
            } else {
              breachSystem('Adobe Breach Successful: Payment Skimmer Active',
                'Breach successful! The administrative API key was abused to inject a javascript credit-card skimmer into the checkout portal, exfiltrating customers\' payment details directly to the attacker.'
              );
            }
          }, 1000);
        }, 1200);
      }
    }
  }, 1000);
}

// Block Animation Helper
function blockAttack(layerId, topPos, leftPos, logMsg1, logMsg2, modalTitle, modalText) {
  const packet = document.getElementById('credential-packet');
  const checkpoint = document.getElementById(`checkpoint-${layerId}`);
  const commandNode = document.getElementById('node-command');
  const systemNode = document.getElementById('node-system');
  const shield = document.getElementById('overall-shield');

  // Freeze packet at the checkpoint
  packet.style.transition = 'none';
  packet.style.top = topPos;
  packet.style.left = leftPos;

  // Show visual block
  checkpoint.style.display = 'flex';
  commandNode.classList.add('active');
  systemNode.classList.add('secured');

  // Activate lines from command center to show defense command
  document.getElementById('line-soc-system').classList.add('active');
  if (layerId === 'l2' || layerId === 'l3') {
    document.getElementById('line-soc-iam').classList.add('active');
  }

  // Update Logs
  appendLog(logMsg1, 'text-warn');
  appendLog(logMsg2, 'text-success');
  appendLog(`[SUCCESS] Attack successfully intercepted and contained.`, 'text-success');

  // Update status badge
  shield.className = 'shield-indicator defended';
  shield.querySelector('.indicator-text').textContent = 'ATTACK BLOCKED';

  // Show Success Modal
  simTimeoutId = setTimeout(() => {
    showModal(true, modalTitle, modalText);
    document.getElementById('btn-run-sim').disabled = false;
  }, 800);
}

// System Compromised Helper
function breachSystem(modalTitle, modalText) {
  const systemNode = document.getElementById('node-system');
  const shield = document.getElementById('overall-shield');

  systemNode.classList.add('compromised');
  appendLog(`[CRITICAL] SYSTEM VULNERABILITY EXPLOITED. TARGET COMPROMISED.`, 'text-danger');
  
  shield.className = 'shield-indicator compromised';
  shield.querySelector('.indicator-text').textContent = 'BREACH DETECTED';

  simTimeoutId = setTimeout(() => {
    showModal(false, modalTitle, modalText);
    document.getElementById('btn-run-sim').disabled = false;
  }, 800);
}

// Modal Manager
function showModal(isSuccess, title, text) {
  const modal = document.getElementById('sim-alert');
  const content = modal.querySelector('.sim-alert-content');
  const titleEl = document.getElementById('alert-title');
  const textEl = document.getElementById('alert-text');

  titleEl.textContent = title;
  textEl.textContent = text;

  // Clean styles
  content.className = 'sim-alert-content';
  if (isSuccess) {
    content.classList.add('alert-success');
  } else {
    content.classList.add('alert-danger');
  }

  modal.style.display = 'flex';
}
