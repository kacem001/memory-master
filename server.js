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

// تسجيل معلومات الزوار
app.use((req, res, next) => {
    const ip = req.headers['x-forwarded-for'] ||
        req.headers['x-real-ip'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.ip ||
        'Unknown';

    const userAgent = req.headers['user-agent'] || 'Unknown';
    const timestamp = new Date().toISOString();
    const url = req.url;
    const method = req.method;

    // استخراج معلومات الجهاز من User-Agent
    let deviceInfo = 'Unknown Device';
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
        if (userAgent.includes('iPhone')) deviceInfo = 'iPhone';
        else if (userAgent.includes('Android')) deviceInfo = 'Android Phone';
        else deviceInfo = 'Mobile Device';
    } else if (userAgent.includes('iPad')) {
        deviceInfo = 'iPad';
    } else if (userAgent.includes('Windows')) {
        deviceInfo = 'Windows PC';
    } else if (userAgent.includes('Mac')) {
        deviceInfo = 'Mac';
    } else if (userAgent.includes('Linux')) {
        deviceInfo = 'Linux PC';
    }

    // استخراج المتصفح
    let browser = 'Unknown Browser';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    // طباعة معلومات الزائر
    console.log(`\n🌐 === زائر جديد ===`);
    console.log(`📅 التوقيت: ${timestamp}`);
    console.log(`🌍 IP Address: ${ip}`);
    console.log(`📱 الجهاز: ${deviceInfo}`);
    console.log(`🌐 المتصفح: ${browser}`);
    console.log(`📍 الصفحة: ${method} ${url}`);
    console.log(`🔧 User-Agent: ${userAgent}`);
    console.log(`========================\n`);

    next();
});

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
        console.log('📝 حفظ البيانات في الملف...', data.length, 'عنصر');
        fs.writeFileSync(leaderboardFile, JSON.stringify(data, null, 2));
        console.log('✅ تم حفظ البيانات بنجاح في', leaderboardFile);
        resolve(true);
    } catch (error) {
        console.error('❌ خطأ في حفظ لوحة الصدارة:', error);
        resolve(false);
    } finally {
        isWriting = false;
        // معالجة العنصر التالي في الطابور
        setTimeout(() => processWriteQueue(), 10);
    }
}

app.get('/', (req, res, next) => {
    console.log(`🎮 === لاعب دخل اللعبة ===`);
    console.log(`📅 ${new Date().toLocaleString('ar-EG')}`);
    console.log(`🎯 بدء جلسة لعب جديدة`);
    console.log(`==========================\n`);
    next();
});

app.get('/leaderboard', (req, res) => {
    const board = readLeaderboard();
    res.json(board);
});

app.post('/leaderboard', async (req, res) => {
    console.log('📥 === طلب حفظ نتيجة ===');
    console.log('البيانات المستلمة:', req.body);

    const { username, score, avatar, boardSize, gameType } = req.body;
    if (!username || !score || !boardSize) {
        console.log('❌ بيانات ناقصة:', { username, score, boardSize });
        return res.status(400).json({ error: "name, score, and board required" });
    }

    try {
        let board = readLeaderboard();
        console.log('📋 لوحة الصدارة الحالية:', board.length, 'عنصر');

        let user = board.find(u => u.username === username && u.boardSize === boardSize && u.gameType === gameType);

        if (!user) {
            board.push({ username, score, avatar, boardSize, gameType });
            await writeLeaderboard(board);
            console.log(`🏆 === رقم قياسي جديد! ===`);
            console.log(`🏅 اللاعب: ${username}`);
            console.log(`⏱️ الوقت: ${score} ثانية`);
            console.log(`🎯 حجم اللوحة: ${boardSize}`);
            console.log(`🎮 نوع اللعبة: ${gameType}`);
            console.log(`📅 ${new Date().toLocaleString('ar-EG')}`);
            console.log(`==========================\n`);
            res.json({ status: "added" });
        } else {
            if (score < user.score) {
                user.score = score;
                user.avatar = avatar;
                await writeLeaderboard(board);
                console.log(`🏆 === تحسين رقم قياسي! ===`);
                console.log(`🏅 اللاعب: ${username}`);
                console.log(`⏱️ الوقت الجديد: ${score} ثانية`);
                console.log(`🎯 حجم اللوحة: ${boardSize}`);
                console.log(`🎮 نوع اللعبة: ${gameType}`);
                console.log(`📅 ${new Date().toLocaleString('ar-EG')}`);
                console.log(`==========================\n`);
                res.json({ status: "updated" });
            } else {
                console.log(`📊 لا يوجد تحسن: ${username} - ${score} >= ${user.score}`);
                res.json({ status: "notupdated" });
            }
        }
    } catch (error) {
        console.error('❌ خطأ في معالجة لوحة الصدارة:', error);
        res.status(500).json({ error: "Server error" });
    }
});

app.listen(PORT, () => {
    console.log('\n🎮 ==== خادم لعبة الذاكرة جاهز! ====');
    console.log(`🌐 الرابط المحلي: http://localhost:${PORT}`);
    console.log(`🏆 لوحة الصدارة: http://localhost:${PORT}/leaderboard`);
    console.log(`📅 وقت البدء: ${new Date().toLocaleString('ar-EG')}`);

    // عرض إحصائيات أساسية
    const board = readLeaderboard();
    console.log(`📊 إجمالي الأرقام القياسية: ${board.length}`);

    if (board.length > 0) {
        const bestScore = Math.min(...board.map(b => b.score));
        const bestPlayer = board.find(b => b.score === bestScore);
        console.log(`🥇 أفضل لاعب: ${bestPlayer.username} (${bestScore} ثانية)`);
    }

    console.log('=====================================\n');
});
