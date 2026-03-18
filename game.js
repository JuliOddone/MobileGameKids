/* ============================================
   SANRIO SLOTS — KAWAII FORTUNE
   Game Engine
   ============================================ */

(function () {
    'use strict';

    // ==========================================
    // CONFIGURATION
    // ==========================================
    const CONFIG = {
        symbols: [
            { id: 'hello_kitty', name: 'Hello Kitty', img: 'assets/hello_kitty.png', weight: 20, payout: 5 },
            { id: 'cinnamoroll', name: 'Cinnamoroll', img: 'assets/cinnamoroll.png', weight: 20, payout: 5 },
            { id: 'pompompurin', name: 'Pompompurin', img: 'assets/pompompurin.png', weight: 20, payout: 5 },
            { id: 'my_melody', name: 'My Melody', img: 'assets/my_melody.png', weight: 18, payout: 8 },
            { id: 'keroppi', name: 'Keroppi', img: 'assets/keroppi.png', weight: 15, payout: 10 },
            { id: 'wild', name: 'Wild ✨', img: 'assets/wild.png', weight: 5, payout: 15, isWild: true },
            { id: 'bonus', name: 'Bonus 🎁', img: null, payout: 25, weight: 2, isBonus: true },
        ],
        betLevels: [5, 10, 25, 50, 100, 250, 500],
        reelCount: 3,
        visibleSymbols: 3,  // 3 rows visible
        spinDuration: 1800,
        reelDelay: 300,
        turboSpinDuration: 600,
        turboReelDelay: 100,
        nearMissChance: 0.18,
        streakMultipliers: [1, 1, 1.5, 2, 2.5, 3, 4, 5],
        xpPerSpin: 10,
        xpPerWin: 25,
        xpPerLevel: 200,
        levelUpBonus: 500,
        miniJackpotInterval: [40, 60],
        miniJackpotMultiplier: 20,
        autoSpinDelay: 800,
        turboAutoSpinDelay: 300,
        particleEmojis: ['🌸', '✨', '💖', '⭐', '🎀', '💫', '🌟', '🩷', '♡', '🦋'],
        tickerNames: ['SakuraFan', 'KawaiiQueen', 'CinnaLover', 'PomPomStar', 'MelodyDream', 'KittyAngel',
            'StarryHeart', 'PinkCloud', 'BowBunny', 'SweetPaws', 'LuckyClover', 'CuteStorm'],
    };

    // Collection items: character + outfit variations
    const COLLECTION = [
        { id: 'hk_classic', name: 'Hello Kitty Clásica', char: 'hello_kitty', outfit: '🎀', unlocked: false },
        { id: 'hk_princess', name: 'Hello Kitty Princesa', char: 'hello_kitty', outfit: '👑', unlocked: false },
        { id: 'hk_star', name: 'Hello Kitty Estrella', char: 'hello_kitty', outfit: '⭐', unlocked: false },
        { id: 'cn_classic', name: 'Cinnamoroll Clásico', char: 'cinnamoroll', outfit: '☁️', unlocked: false },
        { id: 'cn_angel', name: 'Cinnamoroll Ángel', char: 'cinnamoroll', outfit: '😇', unlocked: false },
        { id: 'cn_rainbow', name: 'Cinnamoroll Arcoíris', char: 'cinnamoroll', outfit: '🌈', unlocked: false },
        { id: 'pp_classic', name: 'Pompompurin Clásico', char: 'pompompurin', outfit: '🧁', unlocked: false },
        { id: 'pp_chef', name: 'Pompompurin Chef', char: 'pompompurin', outfit: '👨‍🍳', unlocked: false },
        { id: 'pp_explorer', name: 'Pompompurin Explorador', char: 'pompompurin', outfit: '🗺️', unlocked: false },
        { id: 'mm_classic', name: 'My Melody Clásica', char: 'my_melody', outfit: '🌷', unlocked: false },
        { id: 'mm_fairy', name: 'My Melody Hada', char: 'my_melody', outfit: '🧚', unlocked: false },
        { id: 'mm_night', name: 'My Melody Noche', char: 'my_melody', outfit: '🌙', unlocked: false },
        { id: 'kp_classic', name: 'Keroppi Clásico', char: 'keroppi', outfit: '🍀', unlocked: false },
        { id: 'kp_pirate', name: 'Keroppi Pirata', char: 'keroppi', outfit: '🏴‍☠️', unlocked: false },
        { id: 'kp_sport', name: 'Keroppi Deportista', char: 'keroppi', outfit: '⚽', unlocked: false },
    ];

    // ==========================================
    // GAME STATE
    // ==========================================
    const state = {
        coins: 1000,
        gems: 5,
        level: 1,
        xp: 0,
        betIndex: 1,         // index into CONFIG.betLevels
        streak: 0,
        totalSpins: 0,
        spinsSinceJackpot: 0,
        nextMiniJackpot: randomInRange(CONFIG.miniJackpotInterval[0], CONFIG.miniJackpotInterval[1]),
        isSpinning: false,
        autoSpin: false,
        turboMode: false,
        dailyDay: loadDailyProgress(),
        collection: loadCollection(),
        reelResults: [null, null, null],
    };

    // ==========================================
    // DOM REFS
    // ==========================================
    const DOM = {};
    function cacheDom() {
        DOM.coinCount = document.getElementById('coin-count');
        DOM.gemCount = document.getElementById('gem-count');
        DOM.levelNumber = document.getElementById('level-number');
        DOM.xpBar = document.getElementById('xp-bar');
        DOM.levelBadge = document.getElementById('level-badge');
        DOM.streakBadge = document.getElementById('streak-badge');
        DOM.streakCount = document.getElementById('streak-count');
        DOM.betValue = document.getElementById('bet-value');
        DOM.btnSpin = document.getElementById('btn-spin');
        DOM.btnBetUp = document.getElementById('btn-bet-up');
        DOM.btnBetDown = document.getElementById('btn-bet-down');
        DOM.btnAuto = document.getElementById('btn-auto');
        DOM.btnTurbo = document.getElementById('btn-turbo');
        DOM.btnCollection = document.getElementById('btn-collection');
        DOM.btnDaily = document.getElementById('btn-daily');
        DOM.winDisplay = document.getElementById('win-display');
        DOM.winAmount = document.getElementById('win-amount');
        DOM.winLine = document.getElementById('win-line');
        DOM.nearMissDisplay = document.getElementById('near-miss-display');
        DOM.reelStrips = [
            document.getElementById('reel-strip-1'),
            document.getElementById('reel-strip-2'),
            document.getElementById('reel-strip-3'),
        ];
        DOM.reelContainers = [
            document.getElementById('reel-1'),
            document.getElementById('reel-2'),
            document.getElementById('reel-3'),
        ];
        DOM.modalCollection = document.getElementById('modal-collection');
        DOM.collectionGrid = document.getElementById('collection-grid');
        DOM.collectionFill = document.getElementById('collection-fill');
        DOM.collectionText = document.getElementById('collection-text');
        DOM.modalDaily = document.getElementById('modal-daily');
        DOM.dailyCalendar = document.getElementById('daily-calendar');
        DOM.btnClaimDaily = document.getElementById('btn-claim-daily');
        DOM.modalBigwin = document.getElementById('modal-bigwin');
        DOM.bigwinTitle = document.getElementById('bigwin-title');
        DOM.bigwinAmount = document.getElementById('bigwin-amount');
        DOM.bigwinCharacter = document.getElementById('bigwin-character');
        DOM.modalLevelup = document.getElementById('modal-levelup');
        DOM.levelupNumber = document.getElementById('levelup-number');
        DOM.levelupCoins = document.getElementById('levelup-coins');
        DOM.confettiCanvas = document.getElementById('confetti-canvas');
        DOM.particlesBg = document.getElementById('particles-bg');
        DOM.tickerContent = document.getElementById('ticker-content');
        DOM.slotMachine = document.getElementById('slot-machine');
    }

    // ==========================================
    // UTILITIES
    // ==========================================
    function randomInRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function weightedRandom(symbols) {
        const totalWeight = symbols.reduce((sum, s) => sum + s.weight, 0);
        let rand = Math.random() * totalWeight;
        for (const s of symbols) {
            rand -= s.weight;
            if (rand <= 0) return s;
        }
        return symbols[0];
    }

    function formatNumber(n) {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return n.toString();
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function loadDailyProgress() {
        try {
            const data = JSON.parse(localStorage.getItem('sanrio_daily'));
            if (data && data.date === new Date().toDateString()) return data.day;
        } catch (e) { }
        return 0;
    }

    function saveDailyProgress() {
        localStorage.setItem('sanrio_daily', JSON.stringify({
            date: new Date().toDateString(),
            day: state.dailyDay
        }));
    }

    function loadCollection() {
        try {
            const data = JSON.parse(localStorage.getItem('sanrio_collection'));
            if (data && Array.isArray(data)) {
                COLLECTION.forEach((item, i) => {
                    if (data[i]) item.unlocked = true;
                });
            }
        } catch (e) { }
        return COLLECTION;
    }

    function saveCollection() {
        const data = COLLECTION.map(item => item.unlocked);
        localStorage.setItem('sanrio_collection', JSON.stringify(data));
    }

    function saveState() {
        localStorage.setItem('sanrio_state', JSON.stringify({
            coins: state.coins,
            gems: state.gems,
            level: state.level,
            xp: state.xp,
            totalSpins: state.totalSpins,
        }));
    }

    function loadState() {
        try {
            const data = JSON.parse(localStorage.getItem('sanrio_state'));
            if (data) {
                state.coins = data.coins || 1000;
                state.gems = data.gems || 5;
                state.level = data.level || 1;
                state.xp = data.xp || 0;
                state.totalSpins = data.totalSpins || 0;
            }
        } catch (e) { }
    }

    // ==========================================
    // PARTICLES SYSTEM
    // ==========================================
    function initParticles() {
        const container = DOM.particlesBg;
        for (let i = 0; i < 20; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.textContent = CONFIG.particleEmojis[Math.floor(Math.random() * CONFIG.particleEmojis.length)];
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDuration = (8 + Math.random() * 12) + 's';
            p.style.animationDelay = (Math.random() * 10) + 's';
            p.style.fontSize = (14 + Math.random() * 16) + 'px';
            container.appendChild(p);
        }
    }

    // ==========================================
    // TICKER (Social Proof)
    // ==========================================
    function initTicker() {
        const content = DOM.tickerContent;
        const items = [];
        for (let i = 0; i < 12; i++) {
            const name = CONFIG.tickerNames[Math.floor(Math.random() * CONFIG.tickerNames.length)];
            const amount = [50, 100, 200, 500, 1000, 2500, 5000][Math.floor(Math.random() * 7)];
            const char = ['🐱', '🐶', '🐰', '🐸', '☁️'][Math.floor(Math.random() * 5)];
            items.push(`<span class="ticker-item">${char} <span class="ticker-name">${name}</span> ganó <span class="ticker-amount">+${amount} 🪙</span></span>`);
        }
        content.innerHTML = items.join('');
    }

    // ==========================================
    // REEL SYSTEM
    // ==========================================
    const REEL_SYMBOL_COUNT = 30; // symbols per reel strip
    let reelPositions = [0, 0, 0];

    function createSymbolElement(symbol) {
        const div = document.createElement('div');
        div.className = 'reel-symbol';
        div.dataset.symbolId = symbol.id;

        if (symbol.img) {
            const img = document.createElement('img');
            img.src = symbol.img;
            img.alt = symbol.name;
            img.loading = 'eager';
            div.appendChild(img);
        } else {
            // Bonus symbol — CSS fallback
            const emoji = document.createElement('div');
            emoji.className = 'bonus-emoji';
            div.appendChild(emoji);
        }
        return div;
    }

    function populateReel(stripEl) {
        stripEl.innerHTML = '';
        for (let i = 0; i < REEL_SYMBOL_COUNT; i++) {
            const sym = weightedRandom(CONFIG.symbols);
            stripEl.appendChild(createSymbolElement(sym));
        }
    }

    function initReels() {
        DOM.reelStrips.forEach((strip) => {
            populateReel(strip);
        });
        // Show initial position (middle row = index 1)
        DOM.reelStrips.forEach((strip, i) => {
            const reelContainer = DOM.reelContainers[i];
            const symbolHeight = reelContainer.clientHeight / CONFIG.visibleSymbols;
            strip.style.transform = `translateY(0px)`;
            reelPositions[i] = 0;
        });
    }

    function getSymbolHeight(reelIndex) {
        return DOM.reelContainers[reelIndex].clientHeight / CONFIG.visibleSymbols;
    }

    // ==========================================
    // SPIN ENGINE
    // ==========================================
    async function spin() {
        if (state.isSpinning) return;

        const bet = CONFIG.betLevels[state.betIndex];
        if (state.coins < bet) {
            shakeElement(DOM.coinCount.parentElement);
            return;
        }

        state.isSpinning = true;
        state.coins -= bet;
        state.totalSpins++;
        state.spinsSinceJackpot++;
        updateHUD();

        // Hide previous displays
        hideWinDisplay();
        hideNearMiss();
        DOM.winLine.classList.remove('active');
        clearWinningSymbols();

        // Determine results
        const results = determineResults();
        state.reelResults = results;

        DOM.btnSpin.classList.add('spinning');
        DOM.btnSpin.disabled = true;

        const spinDuration = state.turboMode ? CONFIG.turboSpinDuration : CONFIG.spinDuration;
        const reelDelay = state.turboMode ? CONFIG.turboReelDelay : CONFIG.reelDelay;

        // Animate each reel
        const promises = DOM.reelStrips.map((strip, i) => {
            return animateReel(strip, i, results[i], spinDuration + (i * reelDelay));
        });

        await Promise.all(promises);

        DOM.btnSpin.classList.remove('spinning');
        DOM.btnSpin.disabled = false;
        state.isSpinning = false;

        // Evaluate results
        await evaluateResults(results, bet);

        // XP per spin
        addXP(CONFIG.xpPerSpin);

        // Save
        saveState();

        // Auto-spin
        if (state.autoSpin && state.coins >= CONFIG.betLevels[state.betIndex]) {
            const delay = state.turboMode ? CONFIG.turboAutoSpinDelay : CONFIG.autoSpinDelay;
            setTimeout(() => { if (state.autoSpin) spin(); }, delay);
        } else if (state.autoSpin && state.coins < CONFIG.betLevels[state.betIndex]) {
            state.autoSpin = false;
            DOM.btnAuto.classList.remove('active');
        }
    }

    function determineResults() {
        const results = [];

        // Check for mini jackpot
        if (state.spinsSinceJackpot >= state.nextMiniJackpot) {
            // Force 3-of-a-kind win
            const sym = weightedRandom(CONFIG.symbols.filter(s => !s.isBonus));
            results.push(sym, sym, sym);
            state.spinsSinceJackpot = 0;
            state.nextMiniJackpot = randomInRange(CONFIG.miniJackpotInterval[0], CONFIG.miniJackpotInterval[1]);
            return results;
        }

        // Normal spin
        for (let i = 0; i < CONFIG.reelCount; i++) {
            results.push(weightedRandom(CONFIG.symbols));
        }

        // Near miss manipulation
        if (!isWin(results) && Math.random() < CONFIG.nearMissChance) {
            // Make first 2 reels match
            results[1] = { ...results[0] };
            // Third reel is different
            let diff = weightedRandom(CONFIG.symbols.filter(s => s.id !== results[0].id && !s.isWild));
            results[2] = diff;
        }

        return results;
    }

    function isWin(results) {
        const ids = results.map(r => r.id);
        const hasWild = results.some(r => r.isWild);

        // 3 of a kind
        if (ids[0] === ids[1] && ids[1] === ids[2]) return true;

        // 2 match + wild
        if (hasWild) {
            const nonWild = results.filter(r => !r.isWild);
            if (nonWild.length <= 1) return true;
            if (nonWild.length === 2 && nonWild[0].id === nonWild[1].id) return true;
        }

        // 3 bonus
        if (results.filter(r => r.isBonus).length >= 2) return true;

        return false;
    }

    function animateReel(strip, reelIndex, targetSymbol, duration) {
        return new Promise(resolve => {
            const symbolHeight = getSymbolHeight(reelIndex);

            // Repopulate reel with random symbols + target in middle
            strip.innerHTML = '';
            const totalSymbols = REEL_SYMBOL_COUNT;
            const targetIndex = totalSymbols - CONFIG.visibleSymbols + 1; // Place target at center row

            for (let i = 0; i < totalSymbols; i++) {
                if (i === targetIndex) {
                    strip.appendChild(createSymbolElement(targetSymbol));
                } else {
                    strip.appendChild(createSymbolElement(weightedRandom(CONFIG.symbols)));
                }
            }

            // Start from top
            strip.style.transition = 'none';
            strip.style.transform = 'translateY(0px)';

            // Force reflow
            strip.offsetHeight;

            // Animate down to targetIndex
            const targetOffset = -(targetIndex - 1) * symbolHeight;

            strip.style.transition = `transform ${duration}ms cubic-bezier(0.15, 0.85, 0.35, 1.02)`;
            strip.style.transform = `translateY(${targetOffset}px)`;

            setTimeout(resolve, duration);
        });
    }

    // ==========================================
    // RESULT EVALUATION
    // ==========================================
    async function evaluateResults(results, bet) {
        const win = isWin(results);
        const isNearMiss = !win && results[0].id === results[1].id;

        if (win) {
            const payout = calculatePayout(results, bet);
            const isJackpot = payout >= bet * 10;
            const isBonusWin = results.filter(r => r.isBonus).length >= 2;

            // Streak
            state.streak++;
            updateStreak();

            // Win effects
            highlightWinningSymbols();
            DOM.winLine.classList.add('active');
            showWinDisplay(payout);
            screenShake();
            createFlash();
            spawnFlyingCoins(payout);

            // XP bonus for winning
            addXP(CONFIG.xpPerWin);

            // Add coins
            state.coins += payout;
            updateHUD();

            // Collection unlock chance on win
            if (Math.random() < 0.15 || isBonusWin) {
                tryUnlockCollectionItem();
            }

            // Big win / Jackpot modal
            if (isJackpot) {
                await sleep(800);
                showBigWin(payout, results[0]);
            }

            // Confetti on big wins
            if (payout >= bet * 5) {
                launchConfetti();
            }
        } else {
            // Reset streak
            state.streak = 0;
            updateStreak();

            if (isNearMiss) {
                showNearMiss();
            }
        }
    }

    function calculatePayout(results, bet) {
        let multiplier = 0;
        const ids = results.map(r => r.id);
        const hasWild = results.some(r => r.isWild);
        const bonusCount = results.filter(r => r.isBonus).length;

        // 3 of a kind
        if (ids[0] === ids[1] && ids[1] === ids[2]) {
            multiplier = results[0].payout;
            if (results[0].isWild) multiplier = 50; // 3 wilds = mega
        }
        // 2 match + wild
        else if (hasWild) {
            const nonWild = results.filter(r => !r.isWild);
            if (nonWild.length <= 1) {
                multiplier = 20;
            } else if (nonWild[0].id === nonWild[1].id) {
                multiplier = nonWild[0].payout * 1.5;
            }
        }
        // Bonus
        else if (bonusCount >= 2) {
            multiplier = CONFIG.symbols.find(s => s.isBonus).payout * bonusCount;
        }

        // Apply streak multiplier
        const streakIdx = Math.min(state.streak, CONFIG.streakMultipliers.length - 1);
        const streakMul = CONFIG.streakMultipliers[streakIdx];

        const total = Math.floor(bet * multiplier * streakMul);

        // "Loss disguised as win" — sometimes return less than bet but show as win
        return Math.max(total, 1);
    }

    // ==========================================
    // VISUAL EFFECTS
    // ==========================================
    function highlightWinningSymbols() {
        DOM.reelStrips.forEach(strip => {
            const symbols = strip.querySelectorAll('.reel-symbol');
            // The visual center (middle row)
            const centerIdx = Math.floor(symbols.length / 2);
            // Find the symbol that's currently visible in middle
            // Due to our animation, the target is at index REEL_SYMBOL_COUNT - 2
            const targetIdx = REEL_SYMBOL_COUNT - CONFIG.visibleSymbols + 1;
            if (symbols[targetIdx]) {
                symbols[targetIdx].classList.add('winning');
            }
        });
    }

    function clearWinningSymbols() {
        document.querySelectorAll('.reel-symbol.winning').forEach(el => {
            el.classList.remove('winning');
        });
    }

    function showWinDisplay(amount) {
        DOM.winAmount.textContent = '+' + formatNumber(amount);
        DOM.winDisplay.classList.remove('hidden');
        DOM.winDisplay.classList.add('visible');

        setTimeout(() => {
            DOM.winDisplay.classList.remove('visible');
            DOM.winDisplay.classList.add('hidden');
        }, 2500);
    }

    function hideWinDisplay() {
        DOM.winDisplay.classList.remove('visible');
        DOM.winDisplay.classList.add('hidden');
    }

    function showNearMiss() {
        DOM.nearMissDisplay.classList.remove('hidden');
        DOM.nearMissDisplay.classList.add('visible');
        setTimeout(() => {
            DOM.nearMissDisplay.classList.remove('visible');
            DOM.nearMissDisplay.classList.add('hidden');
        }, 1500);
    }

    function hideNearMiss() {
        DOM.nearMissDisplay.classList.remove('visible');
        DOM.nearMissDisplay.classList.add('hidden');
    }

    function screenShake() {
        document.body.classList.add('screen-shake');
        setTimeout(() => document.body.classList.remove('screen-shake'), 500);
    }

    function shakeElement(el) {
        el.style.animation = 'nearMissShake 0.4s ease-in-out';
        setTimeout(() => { el.style.animation = ''; }, 400);
    }

    function createFlash() {
        const flash = document.createElement('div');
        flash.className = 'flash-overlay';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 400);
    }

    function spawnFlyingCoins(amount) {
        const count = Math.min(Math.ceil(amount / 50), 15);
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const coin = document.createElement('div');
                coin.className = 'flying-coin';
                coin.textContent = '🪙';
                coin.style.left = (30 + Math.random() * 40) + '%';
                coin.style.top = (40 + Math.random() * 20) + '%';
                document.body.appendChild(coin);
                setTimeout(() => coin.remove(), 800);
            }, i * 80);
        }
    }

    // ==========================================
    // CONFETTI
    // ==========================================
    function launchConfetti() {
        const canvas = DOM.confettiCanvas;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const confetti = [];
        const colors = ['#FFB7C5', '#C8A2D0', '#A8E6CF', '#FFE066', '#89CFF0', '#FF85A1', '#FFCC02'];

        for (let i = 0; i < 120; i++) {
            confetti.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                w: 6 + Math.random() * 6,
                h: 10 + Math.random() * 6,
                color: colors[Math.floor(Math.random() * colors.length)],
                vx: (Math.random() - 0.5) * 4,
                vy: 2 + Math.random() * 4,
                rot: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.2,
                opacity: 1,
            });
        }

        let frame = 0;
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let alive = false;

            confetti.forEach(c => {
                if (c.opacity <= 0) return;
                alive = true;

                c.x += c.vx;
                c.y += c.vy;
                c.rot += c.rotSpeed;
                c.vy += 0.05;

                if (c.y > canvas.height) {
                    c.opacity -= 0.02;
                }

                ctx.save();
                ctx.translate(c.x, c.y);
                ctx.rotate(c.rot);
                ctx.globalAlpha = c.opacity;
                ctx.fillStyle = c.color;
                ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
                ctx.restore();
            });

            frame++;
            if (alive && frame < 180) {
                requestAnimationFrame(animate);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
        animate();
    }

    // ==========================================
    // STREAK SYSTEM
    // ==========================================
    function updateStreak() {
        if (state.streak >= 2) {
            DOM.streakBadge.classList.remove('hidden');
            DOM.streakCount.textContent = state.streak;
            DOM.streakBadge.style.transform = 'scale(1)';
        } else {
            DOM.streakBadge.classList.add('hidden');
        }
    }

    // ==========================================
    // XP & LEVEL
    // ==========================================
    function addXP(amount) {
        state.xp += amount;
        const xpNeeded = CONFIG.xpPerLevel * state.level;

        if (state.xp >= xpNeeded) {
            state.xp -= xpNeeded;
            state.level++;
            state.coins += CONFIG.levelUpBonus * state.level;
            showLevelUp();
        }

        updateHUD();
    }

    function showLevelUp() {
        DOM.levelupNumber.textContent = state.level;
        DOM.levelupCoins.textContent = '+' + formatNumber(CONFIG.levelUpBonus * state.level) + ' 🪙';
        DOM.modalLevelup.classList.remove('hidden');
        launchConfetti();
    }

    // ==========================================
    // BIG WIN MODAL
    // ==========================================
    function showBigWin(amount, symbol) {
        DOM.bigwinAmount.textContent = '+' + formatNumber(amount);

        if (amount >= 1000) {
            DOM.bigwinTitle.textContent = '🎰 ¡¡JACKPOT!! 🎰';
        } else {
            DOM.bigwinTitle.textContent = '¡GRAN PREMIO!';
        }

        if (symbol && symbol.img) {
            DOM.bigwinCharacter.innerHTML = `<img src="${symbol.img}" alt="${symbol.name}">`;
        } else {
            DOM.bigwinCharacter.textContent = '🎁';
        }

        DOM.modalBigwin.classList.remove('hidden');
        launchConfetti();
    }

    // ==========================================
    // COLLECTION
    // ==========================================
    function tryUnlockCollectionItem() {
        const locked = COLLECTION.filter(item => !item.unlocked);
        if (locked.length === 0) return;

        const item = locked[Math.floor(Math.random() * locked.length)];
        item.unlocked = true;
        saveCollection();

        // Show notification
        showCollectionNotification(item);
    }

    function showCollectionNotification(item) {
        const notif = document.createElement('div');
        notif.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #FFF5E1, #FFE0E8);
            border: 2px solid var(--pink);
            border-radius: 16px;
            padding: 10px 20px;
            font-family: var(--font-display);
            font-size: 14px;
            font-weight: 600;
            color: var(--dark);
            z-index: 300;
            box-shadow: 0 8px 24px rgba(255,183,197,0.4);
            animation: modalPop 0.4s cubic-bezier(0.34,1.56,0.64,1);
            display: flex;
            align-items: center;
            gap: 8px;
            white-space: nowrap;
        `;
        notif.innerHTML = `${item.outfit} <span>¡Nueva colección: <strong>${item.name}</strong>!</span>`;
        document.body.appendChild(notif);
        setTimeout(() => {
            notif.style.transition = 'all 0.3s';
            notif.style.opacity = '0';
            notif.style.transform = 'translateX(-50%) translateY(-20px)';
            setTimeout(() => notif.remove(), 300);
        }, 2500);
    }

    function renderCollection() {
        DOM.collectionGrid.innerHTML = '';
        let unlockedCount = 0;

        COLLECTION.forEach(item => {
            const card = document.createElement('div');
            const sym = CONFIG.symbols.find(s => s.id === item.char);
            card.className = `collection-card ${item.unlocked ? 'unlocked' : 'locked'}`;

            if (item.unlocked) {
                unlockedCount++;
                card.innerHTML = `
                    ${sym && sym.img ? `<img src="${sym.img}" alt="${item.name}">` : ''}
                    <div class="collection-card-name">${item.outfit} ${item.name}</div>
                `;
            } else {
                card.innerHTML = `<div class="collection-card-name">???</div>`;
            }

            DOM.collectionGrid.appendChild(card);
        });

        const pct = Math.round((unlockedCount / COLLECTION.length) * 100);
        DOM.collectionFill.style.width = pct + '%';
        DOM.collectionText.textContent = `${unlockedCount} / ${COLLECTION.length}`;
    }

    // ==========================================
    // DAILY BONUS
    // ==========================================
    const DAILY_REWARDS = [100, 200, 300, 500, 750, 1000, 2000];

    function renderDailyCalendar() {
        DOM.dailyCalendar.innerHTML = '';
        for (let i = 0; i < 7; i++) {
            const day = document.createElement('div');
            day.className = 'daily-day';
            if (i < state.dailyDay) day.classList.add('claimed');
            if (i === state.dailyDay) day.classList.add('today');
            day.innerHTML = `
                <span class="day-num">${i + 1}</span>
                <span class="day-reward">${i === 6 ? '💎' : '🪙'}</span>
            `;
            DOM.dailyCalendar.appendChild(day);
        }

        // Check if already claimed today
        const lastClaim = localStorage.getItem('sanrio_lastClaim');
        if (lastClaim === new Date().toDateString()) {
            DOM.btnClaimDaily.disabled = true;
            DOM.btnClaimDaily.querySelector('span').textContent = '¡Ya reclamado!';
        } else {
            DOM.btnClaimDaily.disabled = false;
            DOM.btnClaimDaily.querySelector('span').textContent = '¡Reclamar!';
        }
    }

    function claimDailyBonus() {
        const lastClaim = localStorage.getItem('sanrio_lastClaim');
        if (lastClaim === new Date().toDateString()) return;

        const dayIdx = Math.min(state.dailyDay, 6);
        const reward = DAILY_REWARDS[dayIdx];

        if (dayIdx === 6) {
            state.gems += 3;
        }

        state.coins += reward;
        state.dailyDay = (state.dailyDay + 1) % 7;

        localStorage.setItem('sanrio_lastClaim', new Date().toDateString());
        saveDailyProgress();
        saveState();
        updateHUD();
        renderDailyCalendar();

        // Visual feedback
        spawnFlyingCoins(reward);
        launchConfetti();

        DOM.btnClaimDaily.disabled = true;
        DOM.btnClaimDaily.querySelector('span').textContent = '¡Ya reclamado!';
    }

    // ==========================================
    // HUD UPDATE
    // ==========================================
    function updateHUD() {
        DOM.coinCount.textContent = formatNumber(state.coins);
        DOM.gemCount.textContent = state.gems;
        DOM.levelNumber.textContent = state.level;
        DOM.betValue.textContent = CONFIG.betLevels[state.betIndex];

        const xpNeeded = CONFIG.xpPerLevel * state.level;
        const pct = Math.min((state.xp / xpNeeded) * 100, 100);
        DOM.xpBar.style.width = pct + '%';

        // Animate coin count
        animateValue(DOM.coinCount, state.coins);
    }

    function animateValue(el, finalValue) {
        el.style.transition = 'transform 0.2s';
        el.style.transform = 'scale(1.2)';
        setTimeout(() => {
            el.style.transform = 'scale(1)';
        }, 200);
    }

    // ==========================================
    // BET CONTROLS
    // ==========================================
    function betUp() {
        if (state.isSpinning) return;
        state.betIndex = Math.min(state.betIndex + 1, CONFIG.betLevels.length - 1);
        DOM.betValue.textContent = CONFIG.betLevels[state.betIndex];
        shakeElement(DOM.betValue.parentElement);
    }

    function betDown() {
        if (state.isSpinning) return;
        state.betIndex = Math.max(state.betIndex - 1, 0);
        DOM.betValue.textContent = CONFIG.betLevels[state.betIndex];
        shakeElement(DOM.betValue.parentElement);
    }

    // ==========================================
    // AUTO SPIN
    // ==========================================
    function toggleAutoSpin() {
        state.autoSpin = !state.autoSpin;
        DOM.btnAuto.classList.toggle('active', state.autoSpin);

        if (state.autoSpin && !state.isSpinning) {
            spin();
        }
    }

    function toggleTurbo() {
        state.turboMode = !state.turboMode;
        DOM.btnTurbo.classList.toggle('active', state.turboMode);
    }

    // ==========================================
    // MODAL CONTROLS
    // ==========================================
    function openCollection() {
        renderCollection();
        DOM.modalCollection.classList.remove('hidden');
    }

    function closeCollection() {
        DOM.modalCollection.classList.add('hidden');
    }

    function openDaily() {
        renderDailyCalendar();
        DOM.modalDaily.classList.remove('hidden');
    }

    function closeDaily() {
        DOM.modalDaily.classList.add('hidden');
    }

    // ==========================================
    // EVENT LISTENERS
    // ==========================================
    function bindEvents() {
        DOM.btnSpin.addEventListener('click', spin);
        DOM.btnBetUp.addEventListener('click', betUp);
        DOM.btnBetDown.addEventListener('click', betDown);
        DOM.btnAuto.addEventListener('click', toggleAutoSpin);
        DOM.btnTurbo.addEventListener('click', toggleTurbo);
        DOM.btnCollection.addEventListener('click', openCollection);
        DOM.btnDaily.addEventListener('click', openDaily);
        document.getElementById('close-collection').addEventListener('click', closeCollection);
        document.getElementById('close-daily').addEventListener('click', closeDaily);
        DOM.btnClaimDaily.addEventListener('click', claimDailyBonus);

        document.getElementById('btn-bigwin-continue').addEventListener('click', () => {
            DOM.modalBigwin.classList.add('hidden');
        });

        document.getElementById('btn-levelup-continue').addEventListener('click', () => {
            DOM.modalLevelup.classList.add('hidden');
        });

        // Close modals on overlay click
        [DOM.modalCollection, DOM.modalDaily, DOM.modalBigwin, DOM.modalLevelup].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.add('hidden');
            });
        });

        // Keyboard shortcut (space = spin)
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                spin();
            }
        });

        // Prevent context menu on long press
        document.addEventListener('contextmenu', (e) => e.preventDefault());

        // Window resize
        window.addEventListener('resize', () => {
            DOM.confettiCanvas.width = window.innerWidth;
            DOM.confettiCanvas.height = window.innerHeight;
        });
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================
    function init() {
        cacheDom();
        loadState();
        initParticles();
        initTicker();
        initReels();
        bindEvents();
        updateHUD();

        // Mark daily button with notification if unclaimed
        const lastClaim = localStorage.getItem('sanrio_lastClaim');
        if (lastClaim !== new Date().toDateString()) {
            DOM.btnDaily.classList.add('has-notification');
        }

        // Splash micro-animation
        setTimeout(() => {
            DOM.slotMachine.style.animation = 'modalPop 0.6s cubic-bezier(0.34,1.56,0.64,1)';
        }, 200);

        console.log('🌸 Sanrio Slots — Kawaii Fortune initialized!');
    }

    // Start when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
