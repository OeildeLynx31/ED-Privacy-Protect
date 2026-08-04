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
    content = document.getElementById('req-list');
    content.innerHTML = "";
    counter = document.getElementById('counter');
    getTabsRequests(logs).then((tabLogs) => {
        counter.innerText = tabLogs.length;
        tabLogs.forEach(request => {
            content.appendChild(genReqElement(request));
        });
        genShield(tabLogs.length);
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

function sanitize(str) {
    let fakeTextarea = document.createElement('textarea');
    let text = document.createTextNode(str);
    fakeTextarea.appendChild(text);
    return fakeTextarea.innerHTML;
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
        return logs.filter((request) => request.tabId === tab.id);
    })
}

// ── PARSING ────────────────────────────────────────────────────────────────────

function parseMatomo(req) {
    console.log(req);
    const reqURL = new URL(req.url)
    const data = {
        type: "matomo",
        req_URL: reqURL.origin + reqURL.pathname,
        req_fullURL: req.url,
        req_data: req.data
    }
    const url = new URL(req.url);
    const params = new URLSearchParams(url.search);
    for (const [key, value] of params.entries()) {
        data[key] = value;
    }
    data["User-Agent"] = navigator.userAgent; // even if it is not in the URL params, it's given in the request headers
    return data;
}

function parseBM(req) {
    const date = new Date(req.timestamp);
    const data = {
        type: "bm",
        req_URL: req.url,
        req_fullURL: req.url,
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
    if (req.url.indexOf('/matomo.php') > -1) {
        return parseMatomo(req)
    } else if (req.url.indexOf('/bm_info') > -1) {
        return parseBM(req)
    }
}

function genReqElement(req) {
    const data = parseReq(req);
    let elem = JSON.stringify(data);
    let reqElem = document.createElement('div');
    reqElem.className = "request";
    if (data.type === "matomo") {
        elem = `
            <p class="reqTitle">Requête bloquée</p>
            <p class="reqURL">${sanitize(data["req_URL"])}</p>
            <p class="reqTag">visite</p>
            <p class="reqTime">à ${sanitize(data["h"])+"h"+sanitize(data["m"])+" et "+sanitize(data["s"])}s</p>
            <p> Traceur envoyé depuis la page EcoleDirecte ${sanitize(data["url"].slice(data["url"].indexOf('com/')+3))}.</p>
            <details>
                <summary>Données de la requête (infos sensibles)</summary>
                ${genDetailsCode(data)}
            </details>
        `;
        reqElem.setAttribute("actionType", "blocked")
    } else if (data.type === "bm") {
        elem = `
            <p class="reqTitle">Requête bloquée</p>
            <p class="reqURL">${sanitize(data["req_URL"])}</p>
            <p class="reqTag">actions/infos</p>
            <p class="reqTime">à ${data.date.getHours()+"h"+data.date.getMinutes()+" et "+data.date.getSeconds()}s</p>
            <p> Traceur envoyé depuis la page EcoleDirecte ${sanitize(data["uri"])}.</p>
            <details>
                <summary>Données de la requête (infos sensibles)</summary>
                ${genDetailsCode(data)}
            </details>
        `;
        reqElem.setAttribute("actionType", "blocked")
    }
    reqElem.innerHTML = elem;

    reqElem.querySelector('.copy-json').onclick = function() {
        navigator.clipboard.writeText(JSON.stringify(req));
    }
    reqElem.querySelector('.copy').onclick = function() {
        navigator.clipboard.writeText(reqElem.querySelector('code').innerText);
    }

    reqElem.appendChild(document.createElement('hr'))

    return reqElem;
}

function genDetailsList(req) {
    let html = "<ul>";
    Object.keys(req).forEach(key => {
        html += `<li><strong>${sanitize(key)}:</strong> ${sanitize(req[key])}</li>`;
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
        html += `${sanitize(key)}: ${sanitize(req[key])}<br>`;
    });

    copyBtns.appendChild(copyJSON);
    copyBtns.appendChild(copyText);

    code = document.createElement('code');
    code.innerHTML = html;

    completHTML = document.createElement('div');
    completHTML.appendChild(copyBtns);
    completHTML.appendChild(code);

    return completHTML.outerHTML.toString();
}

function genShield(n) {
    let shield = document.getElementsByTagName('svg')[0];
    let text = document.getElementById('tspan3');
    text.innerHTML = n;
}

refreshLog();