const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const leaderboardFile = path.join(__dirname, 'leaderboard.json');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get('/leaderboard', (req, res) => {
    if (!fs.existsSync(leaderboardFile)) return res.json([]);
    const board = JSON.parse(fs.readFileSync(leaderboardFile));
    res.json(board);
});

app.post('/leaderboard', (req, res) => {
    const { username, score, avatar, boardSize, gameType } = req.body;
    if (!username || !score || !boardSize) return res.status(400).json({ error: "name, score, and board required" });
    let board = [];
    if (fs.existsSync(leaderboardFile)) board = JSON.parse(fs.readFileSync(leaderboardFile));
    let user = board.find(u => u.username === username && u.boardSize === boardSize && u.gameType === gameType);
    if (!user) {
        board.push({ username, score, avatar, boardSize, gameType });
        res.json({ status: "added" });
    } else {
        if (score < user.score) {
            user.score = score;
            user.avatar = avatar;
            res.json({ status: "updated" });
        } else {
            res.json({ status: "notupdated" });
        }
    }
    fs.writeFileSync(leaderboardFile, JSON.stringify(board));
});

app.listen(PORT, () => {
    console.log('\n==== جاهز! ====');
    console.log(`ادخل للعبة عبر:    http://localhost:${PORT}`);
    console.log(`لوحة الصدارة عبر:  http://localhost:${PORT}/leaderboard`);
    console.log('================\n');
});