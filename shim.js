// ── shim.js ──────────────────────────────────────────────────────────────────
// Unified API for Chrome and Firefox compatibility.

const api = (() => {
  // Firefox uses `browser`, Chrome uses `chrome`.
  if (typeof browser !== "undefined" && browser.runtime) {
    return browser;
  }

  if (typeof chrome !== "undefined" && chrome.runtime) {
      // Helper to wrap callback-based Chrome APIs into Promises.
      const promisify = (fn) => (...args) =>
        new Promise((resolve, reject) => {
          fn(...args, (result) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(result);
            }
          });
        });

      return {
        storage: {
          local: {
            get: promisify(chrome.storage.local.get.bind(chrome.storage.local)),
            set: promisify(chrome.storage.local.set.bind(chrome.storage.local)),
          },
        },
        runtime: {
          sendMessage: (...args) =>
            new Promise((resolve) => {
              chrome.runtime.sendMessage(...args, (response) => {
                // Suppress "no receiving end" errors.
                void chrome.runtime.lastError;
                resolve(response);
              });
            }),
          onMessage: chrome.runtime.onMessage,
        },
        tabs: {
          query: promisify(chrome.tabs.query.bind(chrome.tabs)),
        },
        webRequest: chrome.webRequest,
      };
  }

  // Mock for testing environments if browser/chrome are not available
  return {
    storage: {
      local: {
        get: () => Promise.resolve({ blockedLog: [] }),
        set: () => Promise.resolve(),
      },
    },
    runtime: {
      sendMessage: (msg) => {
        if (msg.type === "GET_LOG") {
          return Promise.resolve([]);
        }
        return Promise.resolve({});
      },
      onMessage: {
        addListener: () => {},
      },
    },
    tabs: {
      query: () => Promise.resolve([{ id: 1 }]),
    },
    webRequest: {},
  };
})();
window.api = api;
