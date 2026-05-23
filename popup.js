// ── LOG ──────────────────────────────────────────────────────────────────────
let logEntries = [];

function send(msg) {
  return api.runtime.sendMessage(msg);
}


async function refreshLog() {
  logEntries = await send({ type: "GET_LOG" }) || [];
  renderLog(logEntries);
}

function renderLog(logs) {
    content = document.getElementById('req-list')
    content.innerHTML = "";
    counter = document.getElementById('counter')
    getTabsRequests(logs).then((tabLogs) => {
        counter.innerText = tabLogs.length
        tabLogs.forEach(request => {
            content.appendChild(genReqElement(request))
            content.appendChild(document.createElement('hr'))
        });
        console.log(tabLogs.length)
        genShield(tabLogs.length)
    })
}

document.getElementById("clear").addEventListener("click", async () => {
  await send({ type: "CLEAR_LOG" });
  logEntries = [];
  renderLog([]);
});

// ── LIVE UPDATE when popup is open ───────────────────────────────────────────
api.runtime.onMessage.addListener((msg) => {
  if (msg.type === "REQUEST_BLOCKED") {
    logEntries.unshift(msg.entry);
    renderLog(logEntries);
  }
});

// ── UTILS ────────────────────────────────────────────────────────────────────
function escHtml(s) {
  return String(s)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;");
}

function shortHost(url) {
  try { return new URL(url).hostname; } catch { return url; }
}

async function getCurrentTab() {
  const [tab] = await api.tabs.query({
    active: true,
    currentWindow: true
  });
  return tab;
}

async function getTabsRequests(logs) {
    return await getCurrentTab().then((tab) => {
        return logs.filter((request) => request.tabId === tab.id)
    })
}

// ── PARSING ────────────────────────────────────────────────────────────────────

function parseMatomo(req) {
    const data = {
        type: "matomo",
        fullURL: req.url,
        req_data: req.data
    }
    const url = new URL(req.url);
    const params = new URLSearchParams(url.search);
    for (const [key, value] of params.entries()) {
        data[key] = value;
    }
    return data;
}

function parseBM(req) {
    const date = new Date(req.timestamp);
    const data = {
        type: "bm",
        fullURL: req.url,
        date: date
    }
    try {
        const payload = JSON.parse(req.data).browser_info;
        for (const key of Object.keys(payload)) {
            data[key] = typeof payload[key] === "object" ? JSON.stringify(payload[key]) : payload[key];
        }
    } catch (e) {
        console.error("Error parsing BM data:", e);
        data.error = "Erreur de parsing des données";
        data.raw = req.data;
    }
    return data;
}

function parseReq(req) {
    console.log("recieved", req)
    if (req.url.indexOf('/matomo.php') > -1) {
        return parseMatomo(req)
    } else if (req.url.indexOf('/bm_info') > -1) {
        return parseBM(req)
    }
}

function genReqElement(req) {
    const data = parseReq(req)
    let elem = JSON.stringify(data)
    let reqElem = document.createElement('div')
    reqElem.className = "request"
    if (data.type === "matomo") {
        elem = `
                <h2>Traqueur de visite</h2>
                <p>Nature: visite de la page ${data["action_name"]}</p>
                <p>Capturée par ED à <b>${data["h"]+":"+data["m"]+" et "+data["s"]}s</b>.</p>
                <p>Depuis la page <b>${data["url"]}</b> de résolution <b>${data["res"]}px</b>.</p>
                <details>
                    <summary>Détails de la requête (infos sensibles)</summary>
                    ${genDetailsCode(data)}
                </details>
        `
    } else if (data.type === "bm") {
        elem = `
            <div class="request">
                <h2>Traqueur d'action</h2>
                <p>Nature: actions/informations</p>
                <p>Capturée par ED à <b>${data.date.getHours()+":"+data.date.getMinutes()+" et "+data.date.getSeconds()}s</b>.</p>
                <p>Depuis la page <b>${data.fullURL}</b>, ${data["Elapsed_Time"]/1000}s après le chargement de la page</b>.</p>
                <details>
                    <summary>Détails de la requête (infos sensibles)</summary>
                    ${genDetailsCode(data)}
                </details>
            </div>`
    }
    reqElem.innerHTML = elem;

    reqElem.querySelector('.copy-json').onclick = function() {
        navigator.clipboard.writeText(JSON.stringify(req));
        console.log('click')
    }
    reqElem.querySelector('.copy').onclick = function() {
        navigator.clipboard.writeText(reqElem.querySelector('code').innerText);
        console.log('click')
    }

    return reqElem
}

function genDetailsList(req) {
    let html = "<ul>";
    Object.keys(req).forEach(key => {
        html += `<li><strong>${escHtml(key)}:</strong> ${escHtml(req[key])}</li>`
    });
    return html + "</ul>";
}

function genDetailsCode(req) {
    let copyBtns = document.createElement('div')
    copyBtns.id = "buttonBar";

    let copyJSON = document.createElement('button');
    let copyText = document.createElement('button');
    copyJSON.innerText = "copy json";
    copyText.innerText = "copy";
    copyJSON.className = "copy-json";
    copyText.className = "copy";

    let html = "";
    Object.keys(req).forEach(key => {
        html += `${escHtml(key)}: ${escHtml(req[key])}<br>`
    });

    copyBtns.appendChild(copyJSON)
    copyBtns.appendChild(copyText)

    code = document.createElement('code')
    code.innerHTML = html

    completHTML = document.createElement('div')
    completHTML.appendChild(copyBtns)
    completHTML.appendChild(code)

    return completHTML.outerHTML.toString();
}

function genShield(n) {
    let shield = document.getElementsByTagName('svg')[0];
    let text = document.getElementById('tspan-nb');
    text.innerHTML = n
}

refreshLog();