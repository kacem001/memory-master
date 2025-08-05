let currentLang = localStorage.getItem('gameLanguage') || 'ar';
let boardSizeFilter = TRANSLATIONS[currentLang].boardSizes[0];

function formatTime(s) {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
}

function getTypeName(type) {
    return TRANSLATIONS[currentLang][type] || type;
}

function setTexts() {
    const t = TRANSLATIONS[currentLang];
    document.getElementById("leaderboard-label").textContent = t.leaderboard;
    const backBtn = document.getElementById("back-btn");
    if (backBtn) backBtn.textContent = t.backBtn;
}

function renderLangSwitcher() {
    const langSelect = document.getElementById("lang-select");
    if (langSelect) {
        langSelect.value = currentLang;
        langSelect.addEventListener("change", (e) => {
            currentLang = e.target.value;
            localStorage.setItem('gameLanguage', currentLang);
            setTexts();
            renderFilter();
            renderLeaderboard(lastData);
        });
    }
}

function renderFilter() {
    const t = TRANSLATIONS[currentLang];
    const filterDiv = document.getElementById("leaderboard-filter");
    filterDiv.innerHTML = "";
    t.boardSizes.forEach(size => {
        const btn = document.createElement("button");
        btn.className = "filter-btn" + (boardSizeFilter === size ? " active" : "");
        btn.textContent = size;
        btn.onclick = () => {
            boardSizeFilter = size;
            renderLeaderboard(lastData);
            renderFilter();
        };
        filterDiv.appendChild(btn);
    });
}

let lastData = [];
function renderLeaderboard(data) {
    lastData = data;
    const t = TRANSLATIONS[currentLang];
    const container = document.getElementById("leaderboard-list");
    container.innerHTML = "";
    let filtered = data.filter(entry => entry.boardSize === boardSizeFilter);
    filtered.sort((a, b) => a.score - b.score);
    filtered.forEach(entry => {
        const card = document.createElement("div");
        card.className = "leaderboard-card";
        card.innerHTML = `
      <div class="leaderboard-field">
        <div class="leaderboard-label">${t.avatar}</div>
        <div class="leaderboard-value"><img class="leaderboard-avatar" src="${entry.avatar}" width="38" height="38" alt="${entry.username}"></div>
      </div>
      <div class="leaderboard-field">
        <div class="leaderboard-label">${t.name}</div>
        <div class="leaderboard-value">${entry.username}</div>
      </div>
      <div class="leaderboard-field">
        <div class="leaderboard-label">${t.time}</div>
        <div class="leaderboard-value">${formatTime(entry.score)}</div>
      </div>
      <div class="leaderboard-field">
        <div class="leaderboard-label">${t.type}</div>
        <div class="leaderboard-value">${getTypeName(entry.gameType || "")}</div>
      </div>
    `;
        container.appendChild(card);
    });
}

fetch('/leaderboard')
    .then(res => res.json())
    .then(data => {
        renderLeaderboard(data);
        setTexts();
        renderLangSwitcher();
        renderFilter();
    });
