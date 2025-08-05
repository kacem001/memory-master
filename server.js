const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const leaderboardFile = path.join(__dirname, 'leaderboard.json');

// إضافة قفل للعمليات المتزامنة
let isWriting = false;
const writeQueue = [];

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// إضافة headers للتعامل مع عدة جلسات
app.use((req, res, next) => {
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
    next();
});

// دالة آمنة لقراءة الملف
function readLeaderboard() {
    try {
        if (!fs.existsSync(leaderboardFile)) return [];
        const data = fs.readFileSync(leaderboardFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading leaderboard:', error);
        return [];
    }
}

// دالة آمنة لكتابة الملف
function writeLeaderboard(data) {
    return new Promise((resolve) => {
        writeQueue.push({ data, resolve });
        processWriteQueue();
    });
}

function processWriteQueue() {
    if (isWriting || writeQueue.length === 0) return;

    isWriting = true;
    const { data, resolve } = writeQueue.shift();

    try {
        fs.writeFileSync(leaderboardFile, JSON.stringify(data, null, 2));
        resolve(true);
    } catch (error) {
        console.error('Error writing leaderboard:', error);
        resolve(false);
    } finally {
        isWriting = false;
        // معالجة العنصر التالي في الطابور
        setTimeout(() => processWriteQueue(), 10);
    }
}

app.get('/leaderboard', (req, res) => {
    const board = readLeaderboard();
    res.json(board);
});

app.post('/leaderboard', async (req, res) => {
    const { username, score, avatar, boardSize, gameType } = req.body;
    if (!username || !score || !boardSize) {
        return res.status(400).json({ error: "name, score, and board required" });
    }

    try {
        let board = readLeaderboard();
        let user = board.find(u => u.username === username && u.boardSize === boardSize && u.gameType === gameType);

        if (!user) {
            board.push({ username, score, avatar, boardSize, gameType });
            await writeLeaderboard(board);
            res.json({ status: "added" });
        } else {
            if (score < user.score) {
                user.score = score;
                user.avatar = avatar;
                await writeLeaderboard(board);
                res.json({ status: "updated" });
            } else {
                res.json({ status: "notupdated" });
            }
        }
    } catch (error) {
        console.error('Error processing leaderboard:', error);
        res.status(500).json({ error: "Server error" });
    }
});

app.listen(PORT, () => {
    console.log('\n==== Ready !  ====');
    console.log(`game home    http://localhost:${PORT}`);
    console.log(`لوحة الصدارة عبر:  http://localhost:${PORT}/leaderboard`);
    console.log('================\n');
});
