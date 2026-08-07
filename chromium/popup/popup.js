let logEntries = [];

function send(message) {
  return new Promise((resolve) => chrome.runtime.sendMessage(message, resolve));
}

async function currentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function addText(parent, tag, value, className) {
  const element = document.createElement(tag);
  element.textContent = value;
  if (className) element.className = className;
  parent.appendChild(element);
  return element;
}

function formatTime(timestamp) {
  return new Intl.DateTimeFormat("fr-FR", { timeStyle: "medium" }).format(new Date(timestamp));
}

function renderEntry(entry) {
  const container = document.createElement("div");
  container.className = "request";
  container.setAttribute("actionType", "blocked");
  addText(container, "p", "Requête bloquée", "reqTitle");
  addText(container, "p", entry.host, "reqURL");
  addText(container, "p", entry.endpoint === "matomo.php" ? "visite" : "actions/infos", "reqTag");
  addText(container, "p", `à ${formatTime(entry.timestamp)}`, "reqTime");
  addText(container, "p", `Traceur EcoleDirecte bloqué (${entry.type || "requête"}).`);

  const details = document.createElement("details");
  addText(details, "summary", "Détails non sensibles");
  const code = document.createElement("code");
  code.textContent = JSON.stringify({
    endpoint: entry.endpoint,
    host: entry.host,
    method: entry.method,
    type: entry.type,
    tabId: entry.tabId,
    timestamp: entry.timestamp,
    initiatorHost: entry.initiatorHost
  }, null, 2);
  details.appendChild(code);
  container.appendChild(details);
  container.appendChild(document.createElement("hr"));
  return container;
}

async function renderLog(logs) {
  const list = document.getElementById("req-list");
  const tab = await currentTab();
  const tabLogs = logs.filter((entry) => entry.tabId === tab.id);
  list.replaceChildren(...tabLogs.map(renderEntry));
  document.getElementById("counter").textContent = String(tabLogs.length);
  document.getElementById("tspan3").textContent = String(tabLogs.length);
}

async function refreshLog() {
  logEntries = (await send({ type: "GET_LOG" })) || [];
  await renderLog(logEntries);
}

document.getElementById("clear").addEventListener("click", async () => {
  await send({ type: "CLEAR_LOG" });
  logEntries = [];
  await renderLog(logEntries);
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "REQUEST_BLOCKED") {
    logEntries.unshift(message.entry);
    renderLog(logEntries);
  }
});

refreshLog();
