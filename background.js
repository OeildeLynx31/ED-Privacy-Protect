// ── background.js ────────────────────────────────────────────────────────────
// Compatible Chrome, Edge et Firefox (MV2).
// Blocklist statique — pas de gestion dynamique depuis le popup.

console.log('ED Privacy Protect background script initialized');

const TextDec = new TextDecoder();

// ── Blocklist ────────────────────────────────────────────────────────────────
const BLOCKLIST_PATTERNS = [
  "*/matomo.php",
  "*/bm_info"
];

// Pre-compile BLOCKLIST patterns into RegExps for better performance.
const BLOCKLIST = BLOCKLIST_PATTERNS.map((p) => {
  try {
    const escaped = p
      .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\*/g, ".*");
    return new RegExp(escaped, "i");
  } catch (e) {
    console.error(`Invalid blocklist pattern: ${p}`, e);
    return null;
  }
}).filter(Boolean);

// ── Constantes ────────────────────────────────────────────────────────────────
const MAX_LOG = 200;

// ── Helpers storage ───────────────────────────────────────────────────────────
async function getLog() {
  try {
    const res = await api.storage.local.get("blockedLog");
    return res.blockedLog || [];
  } catch (e) {
    console.error("Error getting log from storage:", e);
    return [];
  }
}

async function appendLog(entry) {
  try {
    const log = await getLog();
    log.unshift(entry);
    if (log.length > MAX_LOG) log.length = MAX_LOG;
    await api.storage.local.set({ blockedLog: log });
  } catch (e) {
    console.error("Error appending log to storage:", e);
  }
}

// ── Correspondance URL / pattern ──────────────────────────────────────────────
function matchesBlocklist(url) {
  return BLOCKLIST.some((regex) => regex.test(url));
}

// ── Interception des requêtes ─────────────────────────────────────────────────
api.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    if (!matchesBlocklist(details.url)) return { cancel: false };

    logAndNotify(details, "headers");

    return { cancel: true };
  },
  { urls: ["<all_urls>"] },
  ["blocking", "requestHeaders"]
);

api.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (!matchesBlocklist(details.url)) return { cancel: false };

    logAndNotify(details, "body");

    return { cancel: true };
  },
  { urls: ["<all_urls>"] },
  ["blocking", "requestBody"]
);

async function logAndNotify(details, type) {
  let data = "";
  try {
    if (type === "headers" && details.requestHeaders) {
      const cookieHeader = details.requestHeaders.find(
        (header) => header.name.toLowerCase() === "cookie"
      );
      data = cookieHeader ? cookieHeader.value : "";
    } else if (type === "body" && details.requestBody && !details.requestBody.error) {
      if (details.requestBody.raw && details.requestBody.raw.length > 0) {
        data = TextDec.decode(details.requestBody.raw[0].bytes);
      } else if (details.requestBody.formData && details.requestBody.formData.data) {
        data = details.requestBody.formData.data;
      }
    }
  } catch (e) {
    console.error("Error extracting data from request:", e, details);
  }

  const entry = {
    id:        `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    url:       details.url,
    method:    details.method,
    type:      details.type,
    tabId:     details.tabId,
    timestamp: new Date().toISOString(),
    data:      data, // Renamed from cookie to data for clarity
    // Firefox uses `originUrl`, Chrome uses `initiator`
    initiator: details.initiator || details.originUrl || "unknown",
  };

  console.log("Intercepted :", type, details, entry);
  await appendLog(entry);
  api.runtime.sendMessage({ type: "REQUEST_BLOCKED", entry }).catch(() => {});
}

async function getCookies() {

}

// ── API messages (popup ↔ background) ────────────────────────────────────────
api.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "GET_LOG") {
    getLog().then(sendResponse);
    return true;
  }
  if (msg.type === "CLEAR_LOG") {
    api.storage.local.set({ blockedLog: [] }).then(() => sendResponse({ ok: true }));
    return true;
  }
});