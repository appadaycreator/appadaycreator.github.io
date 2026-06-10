import { kanjiDatabase } from './words.js';

// Web Audio API 効果音
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function toggleMute() {
    isMuted = !isMuted;
    const btn = document.getElementById('muteBtn');
    if (btn) btn.textContent = isMuted ? '🔇 音' : '🔊 音';
    saveSettings();
}

function playSound(type) {
    if (isMuted) return;
    try {
        initAudio();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        const now = audioCtx.currentTime;
        if (type === 'correct') {
            osc.frequency.setValueAtTime(523, now);
            osc.frequency.setValueAtTime(659, now + 0.1);
            osc.frequency.setValueAtTime(784, now + 0.2);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
        } else if (type === 'wrong') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.setValueAtTime(150, now + 0.15);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'tower') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(550, now + 0.05);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === 'wave') {
            osc.frequency.setValueAtTime(392, now);
            osc.frequency.setValueAtTime(523, now + 0.15);
            osc.frequency.setValueAtTime(659, now + 0.3);
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
        }
    } catch (e) {}
}

// グローバル変数
let canvas, ctx;
let gameState = {
    isPlaying: false,
    isPaused: false,
    wave: 1,
    score: 0,
    gold: 100,
    castleHP: 100,
    maxHP: 100,
    accuracy: 100,
    correctAnswers: 0,
    totalAnswers: 0,
    kills: 0,
    combo: 0,
    speedMultiplier: 1,
    mistakes: [],
    level: 'grade1'
};
let enemies = [];
let towers = [];
let bullets = [];
let particles = [];
let currentEnemy = null;
let gameLoop;
let waveTimer = 0;
let spawnTimer = 0;
let lastKanji = null;
let messageTimer = null;
let hoverPos = null;
let isMuted = false;
// リサイズ時に元座標から再計算するための基準値
const originalPath = [
    {x: 0, y: 300},
    {x: 150, y: 300},
    {x: 150, y: 150},
    {x: 350, y: 150},
    {x: 350, y: 450},
    {x: 550, y: 450},
    {x: 550, y: 300},
    {x: 800, y: 300}
];
const gamePath = originalPath.map(p => ({...p}));

function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousemove', handleCanvasHover);
    canvas.addEventListener('mouseleave', () => { hoverPos = null; });
    canvas.addEventListener('touchstart', handleCanvasTouch, { passive: false });
    canvas.addEventListener('touchmove', handleCanvasTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleCanvasTouchEnd, { passive: false });
    document.getElementById('kanjiInput').addEventListener('keydown', handleKeyPress);
    window.addEventListener('resize', resizeCanvas);
    // ブラウザポリシー対応: 初回ユーザー操作時に音声コンテキスト初期化
    const unlockAudio = () => { initAudio(); document.removeEventListener('click', unlockAudio); };
    document.addEventListener('click', unlockAudio);
    loadSettings();
    updateHistoryDisplay();
    gameLoop = setInterval(update, 1000/60);
    drawGame();
    initOnboarding();
}

function resizeCanvas() {
    const container = canvas.parentElement;
    const padding = window.innerWidth < 360 ? 16 : (window.innerWidth < 480 ? 24 : 40);
    const maxWidth = Math.min(container.offsetWidth - padding, 800);
    const maxHeight = Math.max(Math.min(window.innerHeight * 0.55, 600), 300);
    canvas.width = maxWidth;
    canvas.height = Math.round(maxWidth * 0.75);
    updatePathForSize(canvas.width, canvas.height);
}

function updatePathForSize(width, height) {
    const scaleX = width / 800;
    const scaleY = height / 600;
    // 常に元座標から計算し、累積スケールを防ぐ
    originalPath.forEach((point, i) => {
        gamePath[i].x = Math.min(point.x * scaleX, width - 50);
        gamePath[i].y = Math.min(point.y * scaleY, height - 50);
    });
}

function startGame() {
    gameState.isPlaying = true;
    gameState.isPaused = false;
    window.gameStartTime = Date.now();
    document.getElementById('kanjiInput').disabled = false;
    spawnEnemy();
    showMessage('ゲーム開始！敵を撃退しよう！', 'success');
    updateDisplay();
}

function pauseGame() {
    gameState.isPaused = !gameState.isPaused;
    const btn = document.getElementById('pauseBtn');
    if (btn) btn.textContent = gameState.isPaused ? '▶️ 再開' : '⏸️ 一時停止';
    showMessage(gameState.isPaused ? 'ゲーム一時停止' : 'ゲーム再開', 'info');
}

function resetGame() {
    const prevSpeed = gameState.speedMultiplier || 1;
    const prevLevel = gameState.level;
    gameState = {
        isPlaying: false,
        isPaused: false,
        wave: 1,
        score: 0,
        gold: 100,
        castleHP: 100,
        maxHP: 100,
        accuracy: 100,
        correctAnswers: 0,
        totalAnswers: 0,
        kills: 0,
        combo: 0,
        speedMultiplier: prevSpeed,
        mistakes: [],
        level: prevLevel
    };
    enemies = [];
    towers = [];
    bullets = [];
    particles = [];
    currentEnemy = null;
    lastKanji = null;
    waveTimer = 0;
    spawnTimer = 0;
    document.getElementById('kanjiInput').disabled = true;
    document.getElementById('kanjiInput').value = '';
    document.getElementById('currentKanji').textContent = '準備中...';
    document.getElementById('kanjiInfo').textContent = 'ゲームを開始してください';
    const pauseBtn = document.getElementById('pauseBtn');
    if (pauseBtn) pauseBtn.textContent = '⏸️ 一時停止';
    updateDisplay();
    drawGame();
    showMessage('ゲームをリセットしました', 'info');
}

function spawnEnemy() {
    const kanjiData = getRandomKanji();
    if (!kanjiData) {
        showMessage('このレベルの単語がありません。', 'error');
        return;
    }
    // wave >= 10での難度上昇: 敵スピード +0.15x
    const waveSpeedBoost = gameState.wave >= 10 ? 0.15 : 0;
    const baseSpeed = Math.min(1 + (gameState.wave * 0.1) + waveSpeedBoost, 3.5);
    const enemy = {
        id: Date.now() + Math.random(),
        x: gamePath[0].x,
        y: gamePath[0].y,
        pathIndex: 0,
        kanji: kanjiData.kanji,
        reading: kanjiData.reading,
        meaning: kanjiData.meaning,
        hp: 100,
        maxHP: 100,
        speed: baseSpeed * gameState.speedMultiplier,
        color: getRandomColor(),
        size: 30
    };
    enemies.push(enemy);
    if (!currentEnemy) setCurrentEnemy(enemy);
}

function setCurrentEnemy(enemy) {
    currentEnemy = enemy;
    document.getElementById('currentKanji').textContent = enemy.kanji;
    document.getElementById('kanjiInfo').textContent = `意味: ${enemy.meaning}`;
    document.getElementById('kanjiInput').value = '';
    document.getElementById('kanjiInput').focus();
    // 次の敵プレビュー更新
    updateNextKanjiPreview();
}

function getRandomKanji() {
    const levelData = kanjiDatabase[gameState.level];
    if (!levelData || levelData.length === 0) return null;
    let candidate;
    let tries = 0;
    do {
        candidate = levelData[Math.floor(Math.random() * levelData.length)];
        tries++;
    } while (levelData.length > 1 && lastKanji && candidate.kanji === lastKanji.kanji && tries < 10);
    lastKanji = candidate;
    return candidate;
}

function getRandomColor() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function placeTower(x, y) {
    if (gameState.gold >= 50) {
        const tower = {
            x: x,
            y: y,
            range: 100,
            damage: 25,
            fireRate: 60,
            lastFire: 0,
            color: '#ffd93d',
            level: 1
        };
        towers.push(tower);
        gameState.gold -= 50;
        playSound('tower');
        showMessage('タワーを設置しました！タップして強化可能(Lv2:75G)', 'success');
        updateDisplay();
    } else {
        showMessage('ゴールドが足りません！(必要:50G)', 'error');
    }
}

// 既存タワーへのクリック検出
function getClickedTower(x, y) {
    return towers.find(tower => {
        const dx = tower.x - x;
        const dy = tower.y - y;
        return Math.sqrt(dx * dx + dy * dy) <= 22;
    });
}

function upgradeTower(tower) {
    const level = tower.level || 1;
    if (level >= 3) {
        showMessage('このタワーは最大レベル(Lv3)です！', 'info');
        return;
    }
    const upgradeData = {
        1: { cost: 75, damage: 50, range: 150, fireRate: 60, color: '#f59e0b' },
        2: { cost: 150, damage: 100, range: 200, fireRate: 40, color: '#ef4444' }
    };
    const data = upgradeData[level];
    if (gameState.gold < data.cost) {
        showMessage(`強化には${data.cost}Gが必要です！(現在:${gameState.gold}G)`, 'error');
        return;
    }
    gameState.gold -= data.cost;
    tower.level = level + 1;
    tower.damage = data.damage;
    tower.range = data.range;
    tower.fireRate = data.fireRate;
    tower.color = data.color;
    playSound('tower');
    showMessage(`⬆️ タワーをLv${tower.level}に強化！(-${data.cost}G) 攻撃力UP`, 'success');
    updateDisplay();
}

function checkAnswer() {
    const input = document.getElementById('kanjiInput').value.trim();
    if (!input || !currentEnemy) return;
    gameState.totalAnswers++;
    if (input === currentEnemy.reading) {
        gameState.combo++;
        const comboBonus = Math.floor(gameState.combo / 3);
        gameState.correctAnswers++;
        gameState.score += 100 + comboBonus * 50;
        gameState.gold += 20 + comboBonus * 10;
        gameState.kills++;
        const enemyIndex = enemies.indexOf(currentEnemy);
        if (enemyIndex > -1) enemies.splice(enemyIndex, 1);
        playSound('correct');
        createParticles(currentEnemy.x, currentEnemy.y, '#51cf66');
        if (enemies.length > 0) {
            setCurrentEnemy(enemies[0]);
        } else {
            currentEnemy = null;
            document.getElementById('currentKanji').textContent = '準備中...';
            document.getElementById('kanjiInfo').textContent = '次の敵を待機中...';
        }
        if (gameState.combo >= 3) {
            showMessage(`🔥 ${gameState.combo}コンボ！ボーナス +${comboBonus * 50}点`, 'success');
        } else {
            showMessage('正解！敵を倒しました！', 'success');
        }
        document.getElementById('kanjiInput').classList.add('correct-animation');
        setTimeout(() => {
            document.getElementById('kanjiInput').classList.remove('correct-animation');
        }, 500);
    } else {
        gameState.combo = 0;
        // 間違いノートに追加（重複除外）
        if (!gameState.mistakes.find(m => m.kanji === currentEnemy.kanji)) {
            gameState.mistakes.push({
                kanji: currentEnemy.kanji,
                reading: currentEnemy.reading,
                meaning: currentEnemy.meaning
            });
        }
        playSound('wrong');
        currentEnemy.hp -= 25;
        showMessage(`不正解！正解は「${currentEnemy.reading}」です`, 'error');
        document.getElementById('kanjiInput').classList.add('wrong-animation');
        setTimeout(() => {
            document.getElementById('kanjiInput').classList.remove('wrong-animation');
        }, 500);
    }
    gameState.accuracy = Math.round((gameState.correctAnswers / gameState.totalAnswers) * 100);
    document.getElementById('kanjiInput').value = '';
    updateDisplay();
}

function createParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            color: color,
            life: 30,
            maxLife: 30
        });
    }
}

function update() {
    if (!gameState.isPlaying || gameState.isPaused) {
        drawGame();
        return;
    }
    updateEnemies();
    updateTowers();
    updateBullets();
    updateParticles();
    spawnTimer++;
    // wave に基づいたスポーン間隔と敵数上限を段階的に調整
    const spawnInterval = getSpawnInterval(gameState.wave);
    const maxEnemies = getMaxEnemies(gameState.wave);
    if (spawnTimer > spawnInterval && enemies.length < maxEnemies) {
        spawnEnemy();
        spawnTimer = 0;
    }
    waveTimer++;
    if (waveTimer > 1200) {
        gameState.wave++;
        waveTimer = 0;
        // ウェーブクリアボーナス: 城HP小回復
        const healAmount = 10;
        gameState.castleHP = Math.min(gameState.castleHP + healAmount, gameState.maxHP);
        playSound('wave');
        showMessage(`ウェーブ ${gameState.wave} 開始！城HP +${healAmount}回復`, 'info');
    }
    if (gameState.castleHP <= 0) {
        gameOver();
    }
    drawGame();
    updateDisplay();
}

// wave に基づいたスポーン間隔（フレーム数）を計算
function getSpawnInterval(wave) {
    if (wave <= 3) return 120; // 2秒
    if (wave <= 5) return 90; // 1.5秒
    if (wave <= 10) return 60; // 1秒
    return 45; // 0.75秒（wave 11+）
}

// wave に基づいた敵数上限を計算
function getMaxEnemies(wave) {
    if (wave <= 5) return 3;
    if (wave <= 10) return 4;
    return 5; // wave 11+
}

// forEach内spliceを避けるためSet方式で削除管理
function updateEnemies() {
    const toRemove = new Set();

    enemies.forEach(enemy => {
        if (toRemove.has(enemy.id)) return;
        if (enemy.pathIndex < gamePath.length - 1) {
            const targetPoint = gamePath[enemy.pathIndex + 1];
            const dx = targetPoint.x - enemy.x;
            const dy = targetPoint.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < enemy.speed) {
                enemy.pathIndex++;
                enemy.x = targetPoint.x;
                enemy.y = targetPoint.y;
            } else {
                enemy.x += (dx / distance) * enemy.speed;
                enemy.y += (dy / distance) * enemy.speed;
            }
        } else {
            gameState.castleHP -= 10;
            toRemove.add(enemy.id);
            showMessage('敵が城に到達！HPが減少！', 'error');
        }
        if (enemy.hp <= 0 && !toRemove.has(enemy.id)) {
            toRemove.add(enemy.id);
            gameState.score += 50;
            gameState.kills++;
            createParticles(enemy.x, enemy.y, '#ff6b6b');
        }
    });

    if (toRemove.size > 0) {
        const wasCurrentRemoved = currentEnemy && toRemove.has(currentEnemy.id);
        enemies = enemies.filter(e => !toRemove.has(e.id));
        if (wasCurrentRemoved) {
            if (enemies.length > 0) {
                setCurrentEnemy(enemies[0]);
            } else {
                currentEnemy = null;
                document.getElementById('currentKanji').textContent = '準備中...';
                document.getElementById('kanjiInfo').textContent = '次の敵を待機中...';
            }
        }
    }
}

function updateTowers() {
    towers.forEach(tower => {
        tower.lastFire++;
        if (tower.lastFire >= tower.fireRate) {
            const target = enemies.find(enemy => {
                const dx = enemy.x - tower.x;
                const dy = enemy.y - tower.y;
                return Math.sqrt(dx * dx + dy * dy) <= tower.range;
            });
            if (target) {
                bullets.push({
                    x: tower.x,
                    y: tower.y,
                    targetX: target.x,
                    targetY: target.y,
                    speed: 5,
                    damage: tower.damage,
                    target: target
                });
                tower.lastFire = 0;
                tower.shooting = true;
                setTimeout(() => {
                    tower.shooting = false;
                }, 200);
            }
        }
    });
}

// 敵をリアルタイム追跡する弾更新
function updateBullets() {
    const toRemove = new Set();
    bullets.forEach((bullet, index) => {
        // ターゲットが存在していれば現在位置を追跡
        if (bullet.target && enemies.includes(bullet.target)) {
            bullet.targetX = bullet.target.x;
            bullet.targetY = bullet.target.y;
        }
        const dx = bullet.targetX - bullet.x;
        const dy = bullet.targetY - bullet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < bullet.speed || distance < 5) {
            if (bullet.target && enemies.includes(bullet.target)) {
                bullet.target.hp -= bullet.damage;
                createParticles(bullet.target.x, bullet.target.y, '#ffd93d');
            }
            toRemove.add(index);
        } else {
            bullet.x += (dx / distance) * bullet.speed;
            bullet.y += (dy / distance) * bullet.speed;
        }
    });
    if (toRemove.size > 0) {
        bullets = bullets.filter((_, i) => !toRemove.has(i));
    }
}

function updateParticles() {
    particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;
    });
    particles = particles.filter(p => p.life > 0);
}

function drawGame() {
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (!gameState.isPlaying && enemies.length === 0) {
        drawWelcomeScreen();
        return;
    }
    drawPath();
    drawCastle();
    drawTowers();
    drawHoverTower();
    drawEnemies();
    drawBullets();
    drawParticles();
    drawUI();
}

function drawWelcomeScreen() {
    const w = canvas.width;
    const h = canvas.height;
    // 背景グラデーション
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#1a1a2e');
    grad.addColorStop(1, '#16213e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    // タイトル
    ctx.fillStyle = '#ffd93d';
    ctx.font = `bold ${Math.min(w / 10, 36)}px "Noto Sans JP", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏯 漢字タワーディフェンス', w / 2, h * 0.22);
    // 操作ガイド
    const guides = [
        { icon: '1️⃣', text: '難易度を選択する（小学1年〜難読）' },
        { icon: '2️⃣', text: '「ゲーム開始」ボタンを押す' },
        { icon: '3️⃣', text: '漢字の読みをひらがなで入力→攻撃' },
        { icon: '4️⃣', text: 'ゴールドを貯めてタワーを設置(50G)' },
    ];
    const fontSize = Math.min(w / 28, 16);
    ctx.font = `${fontSize}px "Noto Sans JP", sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    guides.forEach((g, i) => {
        ctx.fillText(`${g.icon} ${g.text}`, w / 2, h * 0.42 + i * (fontSize + 14));
    });
    // ベストスコア表示
    const records = JSON.parse(localStorage.getItem('kanjiTowerDefenseRecords') || '[]');
    if (records.length > 0) {
        const best = records[0];
        ctx.fillStyle = 'rgba(251,191,36,0.9)';
        ctx.font = `bold ${Math.min(w / 26, 14)}px "Noto Sans JP", sans-serif`;
        ctx.fillText(`🏆 ベストスコア: ${best.score.toLocaleString()}点（W${best.wave}）`, w / 2, h * 0.75);
    }
    // スタートプロンプト
    const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 500);
    ctx.fillStyle = `rgba(255, 217, 61, ${pulse})`;
    ctx.font = `bold ${Math.min(w / 22, 20)}px "Noto Sans JP", sans-serif`;
    ctx.fillText('▶ 上の「ゲーム開始」を押してスタート！', w / 2, h * 0.88);
}

function drawPath() {
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(gamePath[0].x, gamePath[0].y);
    for (let i = 1; i < gamePath.length; i++) {
        ctx.lineTo(gamePath[i].x, gamePath[i].y);
    }
    ctx.stroke();
}

function drawCastle() {
    const castle = gamePath[gamePath.length - 1];
    ctx.fillStyle = '#8b5cf6';
    ctx.fillRect(castle.x - 25, castle.y - 25, 50, 50);
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(castle.x - 15, castle.y - 35, 30, 20);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(castle.x - 5, castle.y - 40, 10, 15);
    const hpRatio = gameState.castleHP / gameState.maxHP;
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(castle.x - 30, castle.y - 45, 60, 8);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(castle.x - 30, castle.y - 45, 60 * hpRatio, 8);
}

function drawTowers() {
    towers.forEach(tower => {
        const level = tower.level || 1;
        const rangeAlpha = level === 3 ? 0.35 : level === 2 ? 0.25 : 0.2;
        ctx.strokeStyle = `rgba(255, 217, 61, ${rangeAlpha})`;
        ctx.lineWidth = level > 1 ? 2 : 1;
        ctx.beginPath();
        ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = tower.shooting ? '#fff' : tower.color;
        ctx.beginPath();
        ctx.arc(tower.x, tower.y, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1f2937';
        ctx.beginPath();
        ctx.arc(tower.x, tower.y, 8, 0, Math.PI * 2);
        ctx.fill();
        // レベルインジケーター（Lv2以上）
        if (level > 1) {
            ctx.fillStyle = level === 3 ? '#ef4444' : '#f59e0b';
            ctx.font = 'bold 10px "Noto Sans JP", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`L${level}`, tower.x, tower.y - 23);
        }
    });
}

function drawHoverTower() {
    if (!hoverPos) return;
    const canPlace = gameState.gold >= 50;
    ctx.globalAlpha = 0.45;
    ctx.strokeStyle = canPlace ? 'rgba(255, 217, 61, 0.5)' : 'rgba(239, 68, 68, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(hoverPos.x, hoverPos.y, 100, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = canPlace ? '#ffd93d' : '#ef4444';
    ctx.beginPath();
    ctx.arc(hoverPos.x, hoverPos.y, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.arc(hoverPos.x, hoverPos.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '20px "Noto Sans JP"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(enemy.kanji, enemy.x, enemy.y);
        const hpRatio = enemy.hp / enemy.maxHP;
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(enemy.x - 20, enemy.y - 35, 40, 6);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(enemy.x - 20, enemy.y - 35, 40 * hpRatio, 6);
        if (enemy === currentEnemy) {
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, enemy.size + 5, 0, Math.PI * 2);
            ctx.stroke();
        }
    });
}

function drawBullets() {
    bullets.forEach(bullet => {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bullet.x, bullet.y);
        ctx.lineTo(bullet.x - bullet.speed, bullet.y - bullet.speed);
        ctx.stroke();
    });
}

function drawParticles() {
    particles.forEach(particle => {
        const alpha = particle.life / particle.maxLife;
        ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawUI() {
    if (gameState.isPlaying) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.width);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }
    // 次の行動アナウンス（右下）
    const towerCost = 50;
    const canPlaceTower = gameState.gold >= towerCost;
    const towerStatusText = canPlaceTower ? `💰 次のタワー: ${towerCost}G OK` : `💰 次のタワー: ${towerCost}G (不足: ${towerCost - gameState.gold}G)`;
    const towerStatusColor = canPlaceTower ? '#51cf66' : '#ff6b6b';

    ctx.fillStyle = towerStatusColor;
    ctx.font = 'bold 12px "Noto Sans JP", sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(towerStatusText, canvas.width - 8, canvas.height - 20);

    // 敵が近い警告（敵が右側3割エリアに侵入時に点滅）
    if (gameState.isPlaying && enemies.length > 0) {
        const rightThreshold = canvas.width * 0.7;
        const enemyNearby = enemies.some(e => e.x > rightThreshold);
        if (enemyNearby) {
            const blinkShow = Math.floor(gameState.score / 5) % 2 === 0; // スコア変動に基づく点滅
            if (blinkShow) {
                ctx.fillStyle = '#ff6b6b';
                ctx.font = 'bold 13px "Noto Sans JP", sans-serif';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'top';
                ctx.fillText('⚠️ 敵が近い！答えて倒そう！', canvas.width - 8, 8);
            }
        }
    }

    // タワー設置ガイド（左下に常時表示）
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.font = '11px "Noto Sans JP", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText('👆 タップ: タワー設置(50G) / タワーをタップ: 強化(Lv2:75G / Lv3:150G)', 10, canvas.height - 8);
}

function getTouchPos(event) {
    const rect = canvas.getBoundingClientRect();
    const t = event.changedTouches[0];
    return {
        x: t.clientX - rect.left,
        y: t.clientY - rect.top
    };
}

function handleCanvasTouch(event) {
    if (!gameState.isPlaying) return;
    event.preventDefault();
    const { x, y } = getTouchPos(event);
    const gridX = Math.floor(x / 40) * 40 + 20;
    const gridY = Math.floor(y / 40) * 40 + 20;
    hoverPos = isOnPath(gridX, gridY) ? null : { x: gridX, y: gridY };
}

function handleCanvasTouchMove(event) {
    if (!gameState.isPlaying) { hoverPos = null; return; }
    event.preventDefault();
    const { x, y } = getTouchPos(event);
    const gridX = Math.floor(x / 40) * 40 + 20;
    const gridY = Math.floor(y / 40) * 40 + 20;
    hoverPos = isOnPath(gridX, gridY) ? null : { x: gridX, y: gridY };
}

function handleCanvasTouchEnd(event) {
    if (!gameState.isPlaying) return;
    event.preventDefault();
    const { x, y } = getTouchPos(event);
    // 既存タワーをタップした場合はアップグレード
    const tappedTower = getClickedTower(x, y);
    if (tappedTower) {
        upgradeTower(tappedTower);
        hoverPos = null;
        return;
    }
    const gridX = Math.floor(x / 40) * 40 + 20;
    const gridY = Math.floor(y / 40) * 40 + 20;
    if (!isOnPath(gridX, gridY)) {
        placeTower(gridX, gridY);
    }
    hoverPos = null;
}

function handleCanvasClick(event) {
    if (!gameState.isPlaying) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    // 既存タワーをクリックした場合はアップグレード
    const clickedTower = getClickedTower(x, y);
    if (clickedTower) {
        upgradeTower(clickedTower);
        return;
    }
    const gridX = Math.floor(x / 40) * 40 + 20;
    const gridY = Math.floor(y / 40) * 40 + 20;
    if (!isOnPath(gridX, gridY)) {
        placeTower(gridX, gridY);
    }
}

function handleCanvasHover(event) {
    if (!gameState.isPlaying) { hoverPos = null; return; }
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const gridX = Math.floor(x / 40) * 40 + 20;
    const gridY = Math.floor(y / 40) * 40 + 20;
    hoverPos = isOnPath(gridX, gridY) ? null : { x: gridX, y: gridY };
}

function isOnPath(x, y) {
    for (let i = 0; i < gamePath.length - 1; i++) {
        const start = gamePath[i];
        const end = gamePath[i + 1];
        const distance = distanceToLineSegment(x, y, start.x, start.y, end.x, end.y);
        if (distance < 30) return true;
    }
    return false;
}

function distanceToLineSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length === 0) return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (length * length)));
    const projection = {
        x: x1 + t * dx,
        y: y1 + t * dy
    };
    return Math.sqrt((px - projection.x) * (px - projection.x) + (py - projection.y) * (py - projection.y));
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.isComposing) {
        checkAnswer();
    }
}

function updateDisplay() {
    document.getElementById('waveDisplay').textContent = gameState.wave;
    document.getElementById('scoreDisplay').textContent = gameState.score.toLocaleString();
    document.getElementById('goldDisplay').textContent = gameState.gold.toLocaleString();
    document.getElementById('hpDisplay').textContent = Math.max(0, gameState.castleHP);
    document.getElementById('accuracyDisplay').textContent = gameState.accuracy + '%';
    const comboEl = document.getElementById('comboDisplay');
    if (comboEl) comboEl.textContent = gameState.combo;
    // ウェーブ進行プログレスバー
    const progressContainer = document.getElementById('waveProgressContainer');
    const progressBar = document.getElementById('waveProgressBar');
    const waveTimerText = document.getElementById('waveTimerText');
    if (progressContainer) {
        if (gameState.isPlaying && !gameState.isPaused) {
            progressContainer.style.display = 'block';
            if (progressBar) progressBar.style.width = Math.min((waveTimer / 1800) * 100, 100) + '%';
            if (waveTimerText) {
                const remainSec = Math.max(0, Math.ceil((1800 - waveTimer) / 60));
                waveTimerText.textContent = remainSec + '秒';
            }
        } else {
            progressContainer.style.display = 'none';
        }
    }

    // スキップボタンのゴールド不足時グレーアウト
    const skipBtn = document.getElementById('skipBtn');
    if (skipBtn) {
        skipBtn.disabled = gameState.gold < 20 || !gameState.isPlaying;
        skipBtn.style.opacity = (gameState.gold < 20 || !gameState.isPlaying) ? '0.5' : '1';
    }
    updateNextKanjiPreview();
}

function updateNextKanjiPreview() {
    const nextEl = document.getElementById('nextKanjiPreview');
    if (!nextEl) return;
    const nextEnemy = enemies.find(e => e !== currentEnemy);
    if (nextEnemy) {
        nextEl.textContent = `次: ${nextEnemy.kanji}`;
        nextEl.style.display = 'inline-block';
    } else {
        nextEl.style.display = 'none';
    }
}

function skipKanji() {
    if (!gameState.isPlaying || !currentEnemy || gameState.gold < 20) return;
    gameState.gold -= 20;
    // スキップした漢字を間違いノートに追加
    if (!gameState.mistakes.find(m => m.kanji === currentEnemy.kanji)) {
        gameState.mistakes.push({
            kanji: currentEnemy.kanji,
            reading: currentEnemy.reading,
            meaning: currentEnemy.meaning
        });
    }
    const kanjiData = getRandomKanji();
    if (!kanjiData) return;
    currentEnemy.kanji = kanjiData.kanji;
    currentEnemy.reading = kanjiData.reading;
    currentEnemy.meaning = kanjiData.meaning;
    document.getElementById('currentKanji').textContent = currentEnemy.kanji;
    document.getElementById('kanjiInfo').textContent = `意味: ${currentEnemy.meaning}`;
    document.getElementById('kanjiInput').value = '';
    showMessage('🔀 スキップ！(-20G) 間違いノートに追加', 'info');
    updateDisplay();
}

function showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('messageDisplay');
    messageDiv.textContent = message;
    messageDiv.className = `message-display ${type}`;
    messageDiv.classList.add('show');
    clearTimeout(messageTimer);
    messageTimer = setTimeout(() => {
        messageDiv.classList.remove('show');
    }, 3000);
}

function gameOver() {
    gameState.isPlaying = false;
    saveGameRecord();

    document.getElementById('finalScore').textContent = gameState.score.toLocaleString();
    document.getElementById('finalWave').textContent = gameState.wave;
    document.getElementById('finalAccuracy').textContent = gameState.accuracy + '%';
    document.getElementById('finalKills').textContent = gameState.kills;

    // ベストスコア表示
    const records = JSON.parse(localStorage.getItem('kanjiTowerDefenseRecords') || '[]');
    const bestScore = records.length > 0 ? records[0].score : 0;
    const bestEl = document.getElementById('bestScoreDisplay');
    if (bestEl) bestEl.textContent = bestScore.toLocaleString();

    // 新記録バッジ
    const badge = document.getElementById('newRecordBadge');
    if (badge && records.length > 0 && records[0].score === gameState.score && records.filter(r => r.score === gameState.score).length === 1) {
        badge.style.display = 'inline-block';
    } else if (badge) {
        badge.style.display = 'none';
    }

    // ミニランキング表示（上位3件）
    const rankList = document.getElementById('rankingList');
    if (rankList) {
        const top3 = records.slice(0, 3);
        rankList.innerHTML = top3.map((r, i) => {
            const medals = ['🥇', '🥈', '🥉'];
            const isNow = r.score === gameState.score && i === top3.findIndex(x => x.score === gameState.score);
            return `<div style="display:flex;justify-content:space-between;padding:3px 0;${isNow ? 'font-weight:bold;color:#d97706;' : 'color:#64748b;'}">
                <span>${medals[i] || '　'} ${i + 1}位</span>
                <span>${r.score.toLocaleString()}点</span>
                <span>W${r.wave}</span>
            </div>`;
        }).join('') || '<div style="color:#94a3b8;">まだ記録がありません</div>';
    }

    // 間違いノート表示
    const mistakesList = document.getElementById('mistakesList');
    if (mistakesList) {
        if (gameState.mistakes.length > 0) {
            mistakesList.innerHTML = gameState.mistakes.map(m =>
                `<div style="display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px solid #fee2e2;gap:8px;">
                    <span style="font-weight:bold;min-width:3em;">${m.kanji}</span>
                    <span style="color:#dc2626;">${m.reading}</span>
                    <span style="color:#6b7280;font-size:0.85em;flex:1;text-align:right;">${m.meaning}</span>
                </div>`
            ).join('');
        } else {
            mistakesList.innerHTML = '<div style="color:#16a34a;text-align:center;">✨ 全問正解！</div>';
        }
    }

    // バッジチェック
    checkBadges();

    document.getElementById('gameOverModal').classList.add('show');
}

function restartGame() {
    document.getElementById('gameOverModal').classList.remove('show');
    resetGame();
    // 0.3秒後に自動的にゲームを開始（UX高速化）
    setTimeout(() => {
        startGame();
    }, 300);
}

function saveGameRecord() {
    const record = {
        score: gameState.score,
        wave: gameState.wave,
        accuracy: gameState.accuracy,
        kills: gameState.kills,
        level: gameState.level,
        date: new Date().toISOString()
    };
    let records = JSON.parse(localStorage.getItem('kanjiTowerDefenseRecords') || '[]');
    records.push(record);
    records.sort((a, b) => b.score - a.score);
    records = records.slice(0, 10);
    localStorage.setItem('kanjiTowerDefenseRecords', JSON.stringify(records));
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const records = JSON.parse(localStorage.getItem('kanjiTowerDefenseRecords') || '[]');
    const container = document.getElementById('playHistoryContainer');
    if (!container) return;

    if (records.length === 0) {
        container.innerHTML = '<div style="padding:12px;text-align:center;color:#9ca3af">プレイ履歴がありません</div>';
        return;
    }

    const levelLabels = {
        grade1: '小1', grade2: '小2', grade3: '小3', grade4: '小4', grade5: '小5', grade6: '小6',
        middle: '中学', common: '常用', nando: '難読'
    };

    const rows = records.map(r => {
        const date = new Date(r.date);
        const dateStr = date.toLocaleDateString('ja-JP', {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'});
        const levelLabel = levelLabels[r.level] || r.level;
        return `<div style="display:grid;grid-template-columns:auto 1fr auto auto auto;gap:8px;padding:8px 12px;border-bottom:1px solid #f1f5f9;align-items:center;font-size:.75rem">
          <span style="font-weight:700;color:#667eea">${r.score.toLocaleString()}</span>
          <span style="color:#64748b">${dateStr}</span>
          <span style="background:#f0f4f8;padding:2px 6px;border-radius:4px;color:#4b5563;font-weight:600">${levelLabel}</span>
          <span style="color:#64748b">W${r.wave}</span>
          <span style="color:#64748b">${r.accuracy}%</span>
        </div>`;
    }).join('');

    container.innerHTML = `<div style="display:grid;grid-template-columns:auto 1fr auto auto auto;gap:8px;padding:8px 12px;border-bottom:1px solid #d1d5db;font-weight:700;font-size:.7rem;color:#9ca3af;background:#f9fafb">
      <span>スコア</span><span>日時</span><span>難易度</span><span>W</span><span>正答率</span>
    </div>${rows}`;
}

function loadSettings() {
    const savedSettings = localStorage.getItem('kanjiTowerDefenseSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        gameState.level = settings.level || 'grade1';
        gameState.speedMultiplier = settings.speedMultiplier || 1;
        isMuted = !!settings.isMuted;
        setLevel(gameState.level);
        // 速度ボタンのアクティブ状態を復元
        document.querySelectorAll('.speed-btn').forEach(btn => btn.classList.remove('active'));
        const activeSpeedBtn = document.querySelector(`.speed-btn[data-speed="${gameState.speedMultiplier}"]`);
        if (activeSpeedBtn) activeSpeedBtn.classList.add('active');
        // ミュートボタン表示を復元
        const muteBtn = document.getElementById('muteBtn');
        if (muteBtn) muteBtn.textContent = isMuted ? '🔇 音' : '🔊 音';
    }
}

function saveSettings() {
    const settings = {
        level: gameState.level,
        speedMultiplier: gameState.speedMultiplier,
        isMuted: isMuted
    };
    localStorage.setItem('kanjiTowerDefenseSettings', JSON.stringify(settings));
}

function setLevel(level, event) {
    if (gameState.isPlaying) {
        showMessage('ゲーム中は難易度変更不可。リセット後に変更できます', 'info');
        return;
    }
    gameState.level = level;
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
    });
    if (event && event.target) {
        event.target.classList.add('active');
        event.target.setAttribute('aria-pressed', 'true');
    } else {
        const btn = document.querySelector(`.level-btn[onclick*="setLevel('${level}'"]`);
        if (btn) {
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
        }
    }
    saveSettings();
}

function setGameSpeed(speed) {
    gameState.speedMultiplier = speed;
    document.querySelectorAll('.speed-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`.speed-btn[data-speed="${speed}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    showMessage(`速度 ×${speed} に設定`, 'info');
    saveSettings();
}

function showHint() {
    if (currentEnemy) {
        const reading = currentEnemy.reading;
        const firstChar = reading[0];
        const hint = `ヒント: ${reading.length}文字・最初は「${firstChar}」（意味: ${currentEnemy.meaning}）`;
        showMessage(hint, 'info');
    } else {
        showMessage('現在対象の敵がいません', 'info');
    }
}

function shareResult(platform = 'copy') {
    const levelLabels = {
        grade1: '小学1年', grade2: '小学2年', grade3: '小学3年',
        grade4: '小学4年', grade5: '小学5年', grade6: '小学6年',
        middle: '中学生', common: '常用漢字', nando: '難読漢字'
    };
    const levelLabel = levelLabels[gameState.level] || gameState.level;
    const text = `🏯 漢字タワーディフェンス「文字城防衛」\n\n` +
                 `📊 ${levelLabel}モードの結果:\n` +
                 `スコア: ${gameState.score.toLocaleString()}点\n` +
                 `ウェーブ: ${gameState.wave}波\n` +
                 `正答率: ${gameState.accuracy}%\n` +
                 `撃破数: ${gameState.kills}体\n\n` +
                 `#漢字タワーディフェンス #漢字学習 #漢字ゲーム\n` +
                 `https://appadaycreator.com/kanji-tower-defense/`;
    const url = 'https://appadaycreator.com/kanji-tower-defense/';

    if (platform === 'x') {
        const twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(twitterUrl, '_blank', 'width=550,height=420');
    } else if (platform === 'line') {
        const lineUrl = `https://social-plugins.line.me/web/add_to_line?url=${encodeURIComponent(url)}&text=${encodeURIComponent('🏯 漢字タワーディフェンス「文字城防衛」')}`;
        window.open(lineUrl, '_blank');
    } else {
        navigator.clipboard.writeText(text).then(() => {
            showMessage('結果をクリップボードにコピーしました！', 'success');
        }).catch(() => {
            showMessage('共有に失敗しました', 'error');
        });
    }
    // 3秒後に自動リスタート
    setTimeout(() => { if (document.getElementById('gameOverModal').classList.contains('show')) { restartGame(); } }, 3000);
}

// バッジシステム
let badgesList = [];
const BADGES = {
    perfectAccuracy: { name: '🎯 ノーミス達成', cond: () => gameState.accuracy === 100 && gameState.totalAnswers > 0 },
    comboMaster: { name: '⚡ コンボマスター', cond: () => gameState.combo >= 5 },
    waveWarrior: { name: '🌊 波状防衛', cond: () => gameState.wave >= 10 },
    towerBuilder: { name: '🏗️ 塔の達人', cond: () => towers.length >= 3 },
    speedRunner: { name: '⏱️ スピードラン', cond: () => { const elapsed = (Date.now() - (window.gameStartTime || Date.now())) / 1000; return elapsed < 300 && gameState.wave >= 3; } }
};

function checkBadges() {
    const badgesSection = document.getElementById('badgesSection');
    const badgesList_ = document.getElementById('badgesList');
    let earnedBadges = [];
    for (const [key, badge] of Object.entries(BADGES)) {
        if (badge.cond()) earnedBadges.push(badge.name);
    }
    if (earnedBadges.length > 0) {
        badgesSection.style.display = 'block';
        badgesList_.innerHTML = earnedBadges.map(b => `<div style="background:#fff;border:1px solid #f59e0b;border-radius:8px;padding:6px 12px;font-size:0.85em;font-weight:600;color:#d97706;">${b}</div>`).join('');
    }
}

// オンボーディング
let onboardingStep = 0;
const onboardingSteps = [
    { title: '🏯 漢字タワーディフェンス', content: 'このゲームは、漢字の読みに正解することで敵を撃退する楽しい学習ゲームです。' },
    { title: '📝 漢字を読む', content: 'キャンバスに表示された漢字のひらがな読みを入力欄に入力して「攻撃」ボタンを押します。正解するとゴールドが増えます。' },
    { title: '🏗️ タワー設置', content: 'ゴールドが貯まったら、キャンバスをクリックしてタワーを設置。タワーが敵を自動で撃退してくれます。' },
    { title: '🎮 ゲーム開始', content: '難易度を選んで「ゲーム開始」ボタンを押してプレイ開始！楽しく漢字を覚えましょう。' }
];

function initOnboarding() {
    if (!window.kjGet('kj_first_play_done')) {
        onboardingStep = 0;
        nextOnboardingStep();
    }
}

function nextOnboardingStep() {
    const modal = document.getElementById('onboardingModal');
    const btn = document.getElementById('onboardingBtn');
    const content = document.getElementById('onboardingContent');
    const title = document.getElementById('onboardingTitle');
    if (onboardingStep < onboardingSteps.length) {
        const step = onboardingSteps[onboardingStep];
        title.textContent = step.title;
        content.textContent = step.content;
        btn.textContent = onboardingStep < onboardingSteps.length - 1 ? '次へ' : 'ゲーム開始！';
        modal.style.display = 'flex';
        onboardingStep++;
    } else {
        modal.style.display = 'none';
        window.kjSet('kj_first_play_done', true);
    }
}

// ======== 比較・シミュレーション機能 (M7) ========
const levelConfig = {
    grade1: { name: '小1', difficulty: 1, enemyHPMult: 0.8, scoreMultiplier: 1.0 },
    grade2: { name: '小2', difficulty: 2, enemyHPMult: 1.0, scoreMultiplier: 1.1 },
    grade3: { name: '小3', difficulty: 3, enemyHPMult: 1.2, scoreMultiplier: 1.2 },
    grade4: { name: '小4', difficulty: 4, enemyHPMult: 1.4, scoreMultiplier: 1.3 },
    grade5: { name: '小5', difficulty: 5, enemyHPMult: 1.6, scoreMultiplier: 1.4 },
    grade6: { name: '小6', difficulty: 6, enemyHPMult: 1.8, scoreMultiplier: 1.5 },
    middle: { name: '中学生', difficulty: 7, enemyHPMult: 2.2, scoreMultiplier: 1.7 },
    common: { name: '常用漢字', difficulty: 8, enemyHPMult: 2.6, scoreMultiplier: 1.9 },
    nando: { name: '難読', difficulty: 9, enemyHPMult: 3.0, scoreMultiplier: 2.1 }
};

function toggleSimulator() {
    const panel = document.getElementById('simulatorPanel');
    if (panel.style.display === 'none' || !panel.style.display) {
        displaySimulatorResults();
        panel.style.display = 'block';
    } else {
        panel.style.display = 'none';
    }
}

function simulateDifficultyStats(levelKey) {
    const config = levelConfig[levelKey];
    if (!config) return null;

    const baseEnemiesPerWave = 3;
    const totalWaves = 10;
    let totalEnemies = 0;

    for (let wave = 1; wave <= totalWaves; wave++) {
        const waveEnemies = Math.ceil(baseEnemiesPerWave + (wave - 1) * 0.5);
        totalEnemies += waveEnemies;
    }

    const baseScore = 100;
    const estimatedScore = Math.round(totalEnemies * baseScore * config.scoreMultiplier);
    const difficultyRank = ['🟢', '🟢', '🟡', '🟡', '🟠', '🟠', '🔴', '🔴', '🔴'][config.difficulty - 1];

    const baseWinRate = 0.85;
    const difficultyModifier = 1 - ((config.difficulty - 1) * 0.08);
    const estimatedWinRate = Math.max(10, Math.min(95, Math.round(baseWinRate * 100 * difficultyModifier)));

    return {
        level: levelKey,
        name: config.name,
        estimatedScore: estimatedScore,
        totalEnemies: totalEnemies,
        difficultyRank: difficultyRank,
        winRate: estimatedWinRate,
        difficulty: config.difficulty
    };
}

function displaySimulatorResults() {
    const levels = ['grade1', 'grade2', 'grade3', 'grade4', 'grade5', 'grade6', 'middle', 'common', 'nando'];
    const results = levels.map(lvl => simulateDifficultyStats(lvl)).filter(Boolean);

    const tbody = document.getElementById('simulatorTable');
    tbody.innerHTML = results.map(r => `
        <tr style="background:#fff;border-bottom:1px solid #e0f2fe;">
            <td style="padding:10px 8px;font-weight:700;color:#0369a1;">${r.name}</td>
            <td style="text-align:center;padding:10px 8px;color:#1e40af;font-weight:700;">${r.estimatedScore.toLocaleString()} 点</td>
            <td style="text-align:center;padding:10px 8px;color:#1e40af;">${r.totalEnemies} 体</td>
            <td style="text-align:center;padding:10px 8px;font-size:1.2rem;">${r.difficultyRank}</td>
            <td style="text-align:center;padding:10px 8px;">
                <div style="display:flex;align-items:center;justify-content:center;gap:6px;">
                    <div style="width:60px;height:6px;background:#e0f2fe;border-radius:3px;overflow:hidden;">
                        <div style="width:${r.winRate}%;height:100%;background:${r.winRate >= 70 ? '#10b981' : r.winRate >= 50 ? '#f59e0b' : '#ef4444'};transition:width .3s;"></div>
                    </div>
                    <span style="font-weight:700;color:#0369a1;min-width:30px;">${r.winRate}%</span>
                </div>
            </td>
        </tr>
    `).join('');

    const chart = document.getElementById('simulatorChart');
    const chartContainer = document.getElementById('chartContainer');
    chart.style.display = 'block';

    const maxScore = Math.max(...results.map(r => r.estimatedScore));
    chartContainer.innerHTML = results.map(r => `
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;">
            <div style="width:100%;background:linear-gradient(180deg,#0369a1,#0ea5e9);border-radius:4px 4px 0 0;height:${Math.max(10, (r.estimatedScore / maxScore) * 100)}%;transition:height .3s;"></div>
            <div style="font-size:.7rem;font-weight:700;color:#0369a1;margin-top:6px;text-align:center;white-space:nowrap;">${r.name}</div>
        </div>
    `).join('');
}

window.setLevel = setLevel;
window.startGame = startGame;
window.pauseGame = pauseGame;
window.resetGame = resetGame;
window.showHint = showHint;
window.shareResult = shareResult;
window.checkAnswer = checkAnswer;
window.restartGame = restartGame;
window.setGameSpeed = setGameSpeed;
window.skipKanji = skipKanji;
window.toggleMute = toggleMute;
window.nextOnboardingStep = nextOnboardingStep;
window.toggleSimulator = toggleSimulator;
window.addEventListener('load', init);
