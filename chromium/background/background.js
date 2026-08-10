const MAX_LOG = 200;

async function getLog() {
  const { blockedLog = [] } = await chrome.storage.local.get("blockedLog");
  return blockedLog;
}

async function appendLog(entry) {
  const log = await getLog();
  log.unshift(entry);
  await chrome.storage.local.set({ blockedLog: log.slice(0, MAX_LOG) });
}

function hostname(value) {
  try {
    return new URL(value).hostname;
  } catch {
    return "unknown";
  }
}

chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(async ({ request, rule }) => {
  if (![1, 2].includes(rule.ruleId)) return;

  const entry = {
    id: `${Date.now()}-${crypto.randomUUID()}`,
    endpoint: rule.ruleId === 1 ? "matomo.php" : "bm_info",
    host: hostname(request.url),
    method: request.method,
    type: request.type,
    tabId: request.tabId,
    timestamp: new Date().toISOString(),
    initiatorHost: hostname(request.initiator)
  };

  await appendLog(entry);
  chrome.runtime.sendMessage({ type: "REQUEST_BLOCKED", entry }).catch(() => {});
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "GET_LOG") {
    getLog().then(sendResponse);
    return true;
  }
  if (message.type === "CLEAR_LOG") {
    chrome.storage.local.set({ blockedLog: [] }).then(() => sendResponse({ ok: true }));
    return true;
  }
});
