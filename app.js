const BACKEND_URL = "/leaderboard";
const AVATARS = [
    "https://cdn-icons-png.flaticon.com/512/9131/9131529.png",
    "https://cdn-icons-png.flaticon.com/512/11498/11498793.png",
    "https://cdn-icons-png.flaticon.com/512/11918/11918393.png"
];

const animalImages = [
    { name: "حصان", img: "https://cdn-icons-png.flaticon.com/512/10252/10252626.png" },
    { name: "بقرة", img: "https://cdn-icons-png.flaticon.com/512/9791/9791206.png" },
    { name: "خروف", img: "https://cdn-icons-png.flaticon.com/512/10774/10774958.png" },
    { name: "جمل", img: "https://cdn-icons-png.flaticon.com/512/15196/15196380.png" },
    { name: "أسد", img: "https://cdn-icons-png.flaticon.com/512/9305/9305326.png" },
    { name: "نمر", img: "https://cdn-icons-png.flaticon.com/512/9305/9305329.png" },
    { name: "دب", img: "https://cdn-icons-png.flaticon.com/512/6467/6467794.png" },
    { name: "بطة", img: "https://cdn-icons-png.flaticon.com/512/9791/9791166.png" },
    { name: "ببغاء", img: "https://cdn-icons-png.flaticon.com/512/8453/8453079.png" },
    { name: "قرش", img: "https://cdn-icons-png.flaticon.com/512/10757/10757295.png" },
    { name: "فأر", img: "https://cdn-icons-png.flaticon.com/512/7075/7075141.png" },
    { name: "قرد", img: "https://cdn-icons-png.flaticon.com/512/7648/7648698.png" },
    { name: "سلحفاة", img: "https://cdn-icons-png.flaticon.com/512/10757/10757049.png" },
    { name: "قطة", img: "https://cdn-icons-png.flaticon.com/512/8372/8372002.png" },
    { name: "كلب", img: "https://cdn-icons-png.flaticon.com/512/6988/6988878.png" },
    { name: "أرنب", img: "https://cdn-icons-png.flaticon.com/512/18626/18626398.png" },
    { name: "حصان2", img: "https://cdn-icons-png.flaticon.com/512/17593/17593695.png" },
    { name: "بقرة2", img: "https://cdn-icons-png.flaticon.com/512/3069/3069172.png" },
    { name: "خروف2", img: "https://cdn-icons-png.flaticon.com/512/826/826963.png" },
    { name: "دب2", img: "https://cdn-icons-png.flaticon.com/512/7743/7743300.png" },
    { name: "عصفور", img: "https://cdn-icons-png.flaticon.com/512/2171/2171990.png" }
];

const colorImages = [
    { name: 'أحمر', img: 'https://cdn-icons-png.flaticon.com/512/18513/18513816.png' },
    { name: 'أخضر', img: 'https://cdn-icons-png.flaticon.com/512/1791/1791412.png' },
    { name: 'أزرق', img: 'https://cdn-icons-png.flaticon.com/512/18383/18383632.png' },
    { name: 'أصفر', img: 'https://cdn-icons-png.flaticon.com/512/12709/12709532.png' },
    { name: 'برتقالي', img: 'https://cdn-icons-png.flaticon.com/512/15637/15637270.png' },
    { name: 'بنفسجي', img: 'https://cdn-icons-png.flaticon.com/512/12916/12916975.png' },
    { name: 'وردي', img: 'https://cdn-icons-png.flaticon.com/512/13480/13480855.png' },
    { name: 'بني', img: 'https://cdn-icons-png.flaticon.com/512/14906/14906520.png' }
];

const soundIcon = {
    on: "https://cdn-icons-png.flaticon.com/512/7640/7640163.png",
    off: "https://cdn-icons-png.flaticon.com/512/4024/4024569.png"
};

let currentLang = localStorage.getItem('gameLanguage') || 'en';
let theme = localStorage.getItem('theme') || 'light';
let isSoundMute = localStorage.getItem('soundMute') === 'true' ? true : false;
let soundLevel = localStorage.getItem('soundLevel') ? Number(localStorage.getItem('soundLevel')) : 70;
let gameType = localStorage.getItem('gameType') || 'animals';
let boardSize = localStorage.getItem('boardSize') || '4x4';

const body = document.body;
const board = document.getElementById("board");
const restartBtn = document.getElementById("restart");
const showAllBtn = document.getElementById("show-all");
const doneOverlay = document.getElementById("done");
const finalTime = document.getElementById("final-time-text");
const playAgain = document.getElementById("play-again-btn");
const soundBtn = document.getElementById("sound-btn");
const soundIconEl = document.getElementById("sound-icon");
const settingsBtn = document.getElementById("settings-btn");
const settingsPopup = document.getElementById("settings-popup");
const settingsExit = document.getElementById("settings-exit");
const themeSelect = document.getElementById("theme-select");
const audioRange = document.getElementById("audio-range");
const audioValue = document.getElementById("audio-value");
const typeSelect = document.getElementById("type-select");
const sizeSelect = document.getElementById("size-select");
const leaderboardBtn = document.getElementById("leaderboard-btn");

const saveScorePopup = document.getElementById("save-score-popup");
const usernameInput = document.getElementById("username-input");
const avatarSelect = document.getElementById("avatar-select");
const submitUsernameBtn = document.getElementById("submit-username");
const backToButtonsBtn = document.getElementById("back-to-buttons");
const scoreMsg = document.getElementById("score-msg");
const doneButtons = document.getElementById("done-buttons");
const saveToLeaderboardBtn = document.getElementById("save-to-leaderboard-btn");
const toLeaderboardBtn = document.getElementById("to-leaderboard");

let deck = [];
let first = null;
let second = null;
let lock = false;
let matches = 0;
let seconds = 0;
let timerInterval = null;
let gameStarted = false;
let selectedAvatar = AVATARS[0];

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function formatTime(s) {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function getCurrentImages() {
    let [rows, cols] = boardSize.split('x').map(Number);
    let nPairs = (rows * cols) / 2;
    if (gameType === "animals") return shuffle(animalImages).slice(0, nPairs);
    if (gameType === "colors") return shuffle(colorImages).slice(0, nPairs);
    if (gameType === "mixed") {
        let half = Math.ceil(nPairs / 2);
        return shuffle([...shuffle(animalImages).slice(0, half), ...shuffle(colorImages).slice(0, nPairs - half)]);
    }
    return [];
}

function buildDeck() {
    let images = getCurrentImages();
    let arr = [];
    for (let i = 0; i < images.length; i++) {
        arr.push({ id: i, img: images[i].img, name: images[i].name });
        arr.push({ id: i, img: images[i].img, name: images[i].name });
    }
    return shuffle(arr);
}

function createCards() {
    deck = buildDeck();
    board.innerHTML = "";
    first = second = null;
    lock = false;
    matches = 0;
    gameStarted = false;
    stopTimer();
    seconds = 0;
    updateTimerDisplay();
    doneOverlay.classList.add("hidden");
    saveScorePopup.style.display = "none";
    doneButtons.classList.add("hidden");
    let [rows, cols] = boardSize.split('x').map(Number);
    board.style.gridTemplateColumns = `repeat(${cols},1fr)`;

    // Set board aspect ratio based on dimensions
    const aspectRatio = cols / rows;
    board.style.aspectRatio = aspectRatio.toString();

    // Adjust max-width based on board dimensions for better visual balance
    if (cols > rows) {
        // Wider boards (like 5x4)
        board.style.maxWidth = "600px";
    } else if (rows > cols) {
        // Taller boards (like 4x5)
        board.style.maxWidth = "400px";
    } else {
        // Square boards
        if (rows <= 2) {
            board.style.maxWidth = "300px"; // Smaller for 2x2
        } else {
            board.style.maxWidth = "500px";
        }
    }
    deck.forEach((c, idx) => {
        const card = document.createElement("div");
        card.className = "card";
        card.dataset.index = idx;
        card.setAttribute("role", "button");
        card.setAttribute("aria-label", c.name || "");
        card.innerHTML = `
      <div class="inner">
        <div class="face back"></div>
        <div class="face front">
          <img src="${c.img}" alt="${c.name || "بطاقة"}" class="tile-img" draggable="false" loading="lazy" />
        </div>
      </div>
    `;
        card.addEventListener("click", () => onClick(card, true));
        board.appendChild(card);
    });
    setTexts();
}

function updateTimerDisplay() {
    const timerElement = document.getElementById("timer");
    if (timerElement) timerElement.textContent = formatTime(seconds);
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    seconds = 0;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        seconds++;
        updateTimerDisplay();
    }, 1000);
    gameStarted = true;
}

function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
}

function beep(freq, duration, type = 'sine', vol = 0.09) {
    if (isSoundMute || soundLevel === 0) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    gain.gain.setValueAtTime((vol * soundLevel) / 100, audioCtx.currentTime);
    osc.start();
    osc.stop(audioCtx.currentTime + duration / 1000);
}

function finish() {
    stopTimer();
    doneOverlay.classList.remove("hidden");
    setTexts();
    // Update final time after setTexts() to avoid overwriting
    const finalTimeEl = document.getElementById("final-time");
    if (finalTimeEl) {
        finalTimeEl.textContent = formatTime(seconds);
    }
    beep(1500, 220, "triangle", .15);
    // Show victory screen with buttons first
    saveScorePopup.style.display = "none";
    doneButtons.classList.remove("hidden");
}

function onClick(card, withBeep) {
    if (lock) return;
    if (card.classList.contains("flipped")) return;
    if (!gameStarted) startTimer();
    card.classList.add("flipped");
    if (withBeep) beep(400, 80, "square");
    if (!first) {
        first = card;
        return;
    }
    second = card;
    lock = true;
    const a = deck[first.dataset.index].id;
    const b = deck[second.dataset.index].id;
    if (a === b) {
        matches++;
        beep(700, 170, "triangle");
        first = null;
        second = null;
        lock = false;
        if (matches === deck.length / 2) {
            finish();
        }
    } else {
        beep(220, 220, "sine");
        setTimeout(() => {
            first.classList.remove("flipped");
            second.classList.remove("flipped");
            first = second = null;
            lock = false;
        }, 900);
    }
}

restartBtn.addEventListener("click", createCards);
showAllBtn.addEventListener("click", () => {
    const all = document.querySelectorAll(".card");
    all.forEach(c => c.classList.add("flipped"));
    beep(900, 120, "sine");
    setTimeout(() => {
        all.forEach(c => c.classList.remove("flipped"));
    }, 2000);
});

function updateSizeOptions() {
    let sizes = TRANSLATIONS[currentLang].boardSizes;

    // إذا كان نوع اللعبة "colors"، نقتصر على الأحجام المتاحة فقط
    if (gameType === "colors") {
        sizes = ["2x2", "2x4", "4x4"];
    }

    sizeSelect.innerHTML = "";
    sizes.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s;
        opt.textContent = s;
        sizeSelect.appendChild(opt);
    });
    if (!sizes.includes(boardSize)) boardSize = sizes[0];
    sizeSelect.value = boardSize;
}

typeSelect.addEventListener("change", () => {
    gameType = typeSelect.value;
    localStorage.setItem('gameType', gameType);
    updateSizeOptions();
    boardSize = sizeSelect.value;
    localStorage.setItem('boardSize', boardSize);
    createCards();
});

sizeSelect.addEventListener("change", () => {
    boardSize = sizeSelect.value;
    localStorage.setItem('boardSize', boardSize);
    createCards();
});

settingsBtn.addEventListener("click", () => {
    settingsPopup.classList.remove("hidden");
    typeSelect.value = gameType;
    updateSizeOptions();
    sizeSelect.value = boardSize;
    themeSelect.value = theme;
    audioRange.value = soundLevel;
    audioValue.textContent = soundLevel;
});
settingsExit.addEventListener("click", () => {
    settingsPopup.classList.add("hidden");
});
themeSelect.addEventListener("change", () => {
    setTheme(themeSelect.value);
});
audioRange.addEventListener("input", () => {
    setSoundLevel(audioRange.value);
    audioValue.textContent = audioRange.value;
});

function setTheme(th) {
    theme = th;
    localStorage.setItem('theme', th);
    if (th === 'dark') body.classList.add('dark');
    else body.classList.remove('dark');
    themeSelect.value = th;
}

function setSoundMute(mute) {
    isSoundMute = mute;
    localStorage.setItem('soundMute', mute);
    soundIconEl.src = isSoundMute ? soundIcon.off : soundIcon.on;
    soundBtn.title = isSoundMute ? "Mute" : "Sound";
}
function setSoundLevel(level) {
    soundLevel = Math.max(0, Math.min(100, Number(level) || 0));
    localStorage.setItem('soundLevel', soundLevel);
    audioRange.value = soundLevel;
    audioValue.textContent = soundLevel;
    if (soundLevel === 0) {
        setSoundMute(true);
    } else {
        setSoundMute(false);
    }
}

soundBtn.addEventListener("click", () => {
    setSoundMute(!isSoundMute);
});

function setTexts() {
    const t = TRANSLATIONS[currentLang];
    document.getElementById("game-title").textContent = t.gameTitle;
    restartBtn.textContent = t.restartBtn;
    showAllBtn.textContent = t.showAllBtn;
    // Only set leaderboard-label if it exists (only in leaderboard.html)
    const leaderboardLabel = document.getElementById("leaderboard-label");
    if (leaderboardLabel) leaderboardLabel.textContent = t.leaderboard;
    leaderboardBtn.textContent = t.leaderboard;
    document.getElementById("victory-text").textContent = t.victoryText;
    document.getElementById("final-time-text").innerHTML = `${t.finalTimeText} <strong id="final-time">${formatTime(seconds)}</strong>`;
    document.getElementById("username-label").textContent = t.usernameLabel;
    submitUsernameBtn.textContent = t.saveBtn;
    backToButtonsBtn.textContent = t.backBtn;
    playAgain.textContent = t.playAgainBtn;
    saveToLeaderboardBtn.textContent = t.saveToLeaderboardBtn;
    toLeaderboardBtn.textContent = t.toLeaderboardBtn;
    document.getElementById("settings-title").textContent = t.settingsTitle;
    document.getElementById("theme-label").textContent = t.themeLabel;
    document.getElementById("audio-label").textContent = t.audioLabel;
    document.getElementById("type-label").textContent = t.typeLabel;
    document.getElementById("size-label").textContent = t.sizeLabel;
    settingsExit.textContent = t.exitBtn;
    typeSelect.options[0].textContent = t.animals;
    typeSelect.options[1].textContent = t.colors;
    typeSelect.options[2].textContent = t.mixed;
    updateSizeOptions();
    document.querySelectorAll(".lang-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.lang === currentLang);
    });
}

function renderLangSwitcher() {
    const langSelect = document.getElementById("lang-select");
    if (langSelect) {
        langSelect.value = currentLang;
        langSelect.addEventListener("change", (e) => {
            currentLang = e.target.value;
            localStorage.setItem('gameLanguage', currentLang);
            setTexts();
            createCards();
        });
    }
}

function showSaveScore() {
    doneButtons.classList.add("hidden");
    saveScorePopup.style.display = "flex";
    scoreMsg.textContent = "";
    usernameInput.value = "";
    usernameInput.focus();
    renderAvatarChoices();
}

function renderAvatarChoices() {
    avatarSelect.innerHTML = "";
    AVATARS.forEach((url, i) => {
        const img = document.createElement("img");
        img.src = url;
        img.className = "avatar-choice" + (selectedAvatar === url ? " selected" : "");
        img.onclick = () => {
            selectedAvatar = url;
            renderAvatarChoices();
        };
        avatarSelect.appendChild(img);
    });
}

submitUsernameBtn.addEventListener("click", async () => {
    let username = usernameInput.value.trim();
    if (!username || username.length < 2) {
        scoreMsg.textContent = TRANSLATIONS[currentLang].inputError;
        return;
    }
    let score = seconds;
    let avatar = selectedAvatar;
    let t = TRANSLATIONS[currentLang];
    try {
        let res = await fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, score, avatar, boardSize, gameType })
        });
        let data = await res.json();
        if (data.status === "added") scoreMsg.textContent = t.saveSuccess;
        else if (data.status === "updated") scoreMsg.textContent = t.saveUpdate;
        else scoreMsg.textContent = t.saveNotUpdate;
    } catch (e) {
        scoreMsg.textContent = t.saveError;
    }
    saveScorePopup.style.display = "none";
    doneButtons.classList.remove("hidden");
});

usernameInput.addEventListener("keydown", e => {
    if (e.key === "Enter") submitUsernameBtn.click();
});

// Play Again button - start new game
playAgain.addEventListener("click", () => {
    doneOverlay.classList.add("hidden");
    createCards();
});

// Save to Leaderboard button - show save score popup
saveToLeaderboardBtn.addEventListener("click", () => {
    showSaveScore();
});

// Back to buttons - hide save popup and show main buttons
backToButtonsBtn.addEventListener("click", () => {
    saveScorePopup.style.display = "none";
    doneButtons.classList.remove("hidden");
});

toLeaderboardBtn.addEventListener("click", () => {
    window.location.href = "leaderboard.html";
});

document.addEventListener("DOMContentLoaded", () => {
    setTheme(theme);
    setTexts();
    renderLangSwitcher();
    typeSelect.value = gameType;
    updateSizeOptions();
    sizeSelect.value = boardSize;
    createCards();
});
