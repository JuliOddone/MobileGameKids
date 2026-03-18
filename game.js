/* SANRIO SLOTS v2 — CORE ENGINE */
'use strict';

const CONFIG = {
    symbols: [
        { id:'hello_kitty', name:'Hello Kitty', img:'assets/hello_kitty.png', weight:20, payout:5, power:'Lucky Charm', powerDesc:'Aumenta chance de Wild' },
        { id:'cinnamoroll', name:'Cinnamoroll', img:'assets/cinnamoroll.png', weight:20, payout:5, power:'Cloud Shield', powerDesc:'Protege tu racha' },
        { id:'pompompurin', name:'Pompompurin', img:'assets/pompompurin.png', weight:20, payout:5, power:'Golden Bark', powerDesc:'Multiplicador x2 de monedas' },
        { id:'my_melody', name:'My Melody', img:'assets/my_melody.png', weight:18, payout:8, power:'Melody Grace', powerDesc:'Chance de re-spin gratis' },
        { id:'keroppi', name:'Keroppi', img:'assets/keroppi.png', weight:15, payout:10, power:'Lily Leap', powerDesc:'Bonus de cascada extra' },
        { id:'wild', name:'Wild ✨', img:'assets/wild.png', weight:5, payout:15, isWild:true },
        { id:'bonus', name:'Bonus 🎁', img:null, payout:25, weight:2, isBonus:true },
    ],
    betLevels: [5,10,25,50,100,250,500],
    reelCount:3, visibleSymbols:3, spinDuration:1800, reelDelay:300,
    turboSpinDuration:600, turboReelDelay:100, nearMissChance:0.18,
    streakMultipliers:[1,1,1.5,2,2.5,3,4,5],
    cascadeMultipliers:[1,2,3,5,8],
    xpPerSpin:10, xpPerWin:25, xpPerLevel:200, levelUpBonus:500,
    miniJackpotInterval:[40,60], autoSpinDelay:800, turboAutoSpinDelay:300,
    particleEmojis:['🌸','✨','💖','⭐','🎀','💫','🌟','🩷','♡','🦋'],
    tickerNames:['SakuraFan','KawaiiQueen','CinnaLover','PomPomStar','MelodyDream','KittyAngel','StarryHeart','PinkCloud','BowBunny','SweetPaws'],
    powerChance: 0.08,
    vipTiers: [
        { name:'Bronce', icon:'🥉', level:1, payoutBonus:0, xpBonus:1, perks:'Acceso básico al café' },
        { name:'Plata', icon:'🥈', level:5, payoutBonus:0.1, xpBonus:1.5, perks:'+10% payout, re-spin diario gratis' },
        { name:'Oro', icon:'🥇', level:15, payoutBonus:0.25, xpBonus:2, perks:'+25% payout, 2x XP, símbolos exclusivos' },
        { name:'Diamante', icon:'💎', level:30, payoutBonus:0.5, xpBonus:3, perks:'+50% payout, auto-hold, 3x XP' },
    ],
};

const COLLECTION = [
    {id:'hk_classic',name:'Hello Kitty Clásica',char:'hello_kitty',outfit:'🎀',unlocked:false},
    {id:'hk_princess',name:'Hello Kitty Princesa',char:'hello_kitty',outfit:'👑',unlocked:false},
    {id:'hk_star',name:'Hello Kitty Estrella',char:'hello_kitty',outfit:'⭐',unlocked:false},
    {id:'cn_classic',name:'Cinnamoroll Clásico',char:'cinnamoroll',outfit:'☁️',unlocked:false},
    {id:'cn_angel',name:'Cinnamoroll Ángel',char:'cinnamoroll',outfit:'😇',unlocked:false},
    {id:'cn_rainbow',name:'Cinnamoroll Arcoíris',char:'cinnamoroll',outfit:'🌈',unlocked:false},
    {id:'pp_classic',name:'Pompompurin Clásico',char:'pompompurin',outfit:'🧁',unlocked:false},
    {id:'pp_chef',name:'Pompompurin Chef',char:'pompompurin',outfit:'👨‍🍳',unlocked:false},
    {id:'pp_explorer',name:'Pompompurin Explorador',char:'pompompurin',outfit:'🗺️',unlocked:false},
    {id:'mm_classic',name:'My Melody Clásica',char:'my_melody',outfit:'🌷',unlocked:false},
    {id:'mm_fairy',name:'My Melody Hada',char:'my_melody',outfit:'🧚',unlocked:false},
    {id:'mm_night',name:'My Melody Noche',char:'my_melody',outfit:'🌙',unlocked:false},
    {id:'kp_classic',name:'Keroppi Clásico',char:'keroppi',outfit:'🍀',unlocked:false},
    {id:'kp_pirate',name:'Keroppi Pirata',char:'keroppi',outfit:'🏴‍☠️',unlocked:false},
    {id:'kp_sport',name:'Keroppi Deportista',char:'keroppi',outfit:'⚽',unlocked:false},
];

const MISSIONS_POOL = [
    {id:'m1',text:'Gana 3 veces seguidas',icon:'🔥',target:3,type:'streak',reward:500},
    {id:'m2',text:'Consigue un Wild',icon:'⭐',target:1,type:'wild_win',reward:200},
    {id:'m3',text:'Gira 20 veces',icon:'🎰',target:20,type:'spins',reward:300},
    {id:'m4',text:'Gana con Cinnamoroll',icon:'☁️',target:3,type:'char_win_cinnamoroll',reward:400},
    {id:'m5',text:'Logra una cascada x3',icon:'💥',target:1,type:'cascade_3',reward:600},
    {id:'m6',text:'Gana con Hello Kitty',icon:'🐱',target:3,type:'char_win_hello_kitty',reward:400},
    {id:'m7',text:'Usa Hold & Spin',icon:'🔒',target:5,type:'hold_spins',reward:350},
    {id:'m8',text:'Gana 1000 monedas',icon:'🪙',target:1000,type:'coins_won',reward:500},
    {id:'m9',text:'Gira 50 veces',icon:'🎰',target:50,type:'spins',reward:800},
    {id:'m10',text:'Consigue Bonus Round',icon:'🎁',target:1,type:'bonus_round',reward:750},
];

const ACHIEVEMENTS_DATA = [
    {id:'a1',name:'Primer Giro',desc:'Haz tu primer giro',icon:'🎰',target:1,type:'total_spins',reward:100},
    {id:'a2',name:'Giromanía',desc:'Gira 100 veces',icon:'🎰',target:100,type:'total_spins',reward:500},
    {id:'a3',name:'Spin Master',desc:'Gira 500 veces',icon:'🎰',target:500,type:'total_spins',reward:2000},
    {id:'a4',name:'Eterno Girador',desc:'Gira 1000 veces',icon:'🎰',target:1000,type:'total_spins',reward:5000},
    {id:'a5',name:'Primera Victoria',desc:'Gana por primera vez',icon:'🏆',target:1,type:'total_wins',reward:100},
    {id:'a6',name:'Ganador Serial',desc:'Gana 50 veces',icon:'🏆',target:50,type:'total_wins',reward:1000},
    {id:'a7',name:'Racha x3',desc:'Racha de 3 victorias',icon:'🔥',target:3,type:'best_streak',reward:300},
    {id:'a8',name:'Racha x5',desc:'Racha de 5 victorias',icon:'🔥',target:5,type:'best_streak',reward:800},
    {id:'a9',name:'Racha x8',desc:'Racha de 8 victorias',icon:'🔥',target:8,type:'best_streak',reward:2000},
    {id:'a10',name:'Cascada x2',desc:'Logra cascada doble',icon:'💥',target:2,type:'best_cascade',reward:500},
    {id:'a11',name:'Cascada x4',desc:'Logra cascada cuádruple',icon:'💥',target:4,type:'best_cascade',reward:2000},
    {id:'a12',name:'Coleccionista',desc:'Desbloquea 5 items',icon:'🎀',target:5,type:'collection_count',reward:500},
    {id:'a13',name:'Gran Coleccionista',desc:'Desbloquea 10 items',icon:'🎀',target:10,type:'collection_count',reward:2000},
    {id:'a14',name:'Colección Completa',desc:'Desbloquea todos los items',icon:'🎀',target:15,type:'collection_count',reward:10000},
    {id:'a15',name:'Nivel 5',desc:'Alcanza nivel 5',icon:'📈',target:5,type:'level',reward:500},
    {id:'a16',name:'Nivel 10',desc:'Alcanza nivel 10',icon:'📈',target:10,type:'level',reward:1500},
    {id:'a17',name:'Nivel 20',desc:'Alcanza nivel 20',icon:'📈',target:20,type:'level',reward:3000},
    {id:'a18',name:'Nivel 30',desc:'Alcanza nivel 30',icon:'📈',target:30,type:'level',reward:5000},
    {id:'a19',name:'VIP Plata',desc:'Alcanza VIP Plata',icon:'🥈',target:2,type:'vip_tier',reward:1000},
    {id:'a20',name:'VIP Oro',desc:'Alcanza VIP Oro',icon:'🥇',target:3,type:'vip_tier',reward:3000},
    {id:'a21',name:'VIP Diamante',desc:'Alcanza VIP Diamante',icon:'💎',target:4,type:'vip_tier',reward:10000},
    {id:'a22',name:'Hold Master',desc:'Usa Hold 20 veces',icon:'🔒',target:20,type:'hold_uses',reward:500},
    {id:'a23',name:'Bonus Hunter',desc:'Completa 5 Bonus Rounds',icon:'🎁',target:5,type:'bonus_rounds',reward:1500},
    {id:'a24',name:'Millonario',desc:'Acumula 10,000 monedas',icon:'🪙',target:10000,type:'coins_ever',reward:2000},
    {id:'a25',name:'Rico',desc:'Acumula 50,000 monedas',icon:'🪙',target:50000,type:'coins_ever',reward:5000},
    {id:'a26',name:'Misión Cumplida',desc:'Completa 5 misiones',icon:'📋',target:5,type:'missions_done',reward:500},
    {id:'a27',name:'Agente Completo',desc:'Completa 20 misiones',icon:'📋',target:20,type:'missions_done',reward:2000},
    {id:'a28',name:'Jackpot!',desc:'Gana más de 1000 en un giro',icon:'💰',target:1000,type:'best_win',reward:1000},
    {id:'a29',name:'Mega Jackpot',desc:'Gana más de 5000 en un giro',icon:'💰',target:5000,type:'best_win',reward:5000},
    {id:'a30',name:'Kitty Lover',desc:'Gana 10 veces con Hello Kitty',icon:'🐱',target:10,type:'wins_hello_kitty',reward:500},
    {id:'a31',name:'Cinna Fan',desc:'Gana 10 veces con Cinnamoroll',icon:'☁️',target:10,type:'wins_cinnamoroll',reward:500},
    {id:'a32',name:'Pom Fan',desc:'Gana 10 veces con Pompompurin',icon:'🐶',target:10,type:'wins_pompompurin',reward:500},
    {id:'a33',name:'Melody Fan',desc:'Gana 10 veces con My Melody',icon:'🐰',target:10,type:'wins_my_melody',reward:500},
    {id:'a34',name:'Keroppi Fan',desc:'Gana 10 veces con Keroppi',icon:'🐸',target:10,type:'wins_keroppi',reward:500},
    {id:'a35',name:'Pase Nivel 5',desc:'Alcanza nivel 5 del pase',icon:'🎫',target:5,type:'season_level',reward:300},
    {id:'a36',name:'Pase Nivel 15',desc:'Alcanza nivel 15 del pase',icon:'🎫',target:15,type:'season_level',reward:1000},
    {id:'a37',name:'Pase Nivel 30',desc:'Alcanza nivel 30 del pase',icon:'🎫',target:30,type:'season_level',reward:5000},
    {id:'a38',name:'Modo Oscuro',desc:'Activa el modo oscuro',icon:'🌙',target:1,type:'dark_mode',reward:100},
    {id:'a39',name:'Turbo Fan',desc:'Usa turbo 10 veces',icon:'⚡',target:10,type:'turbo_uses',reward:300},
    {id:'a40',name:'Auto Spinner',desc:'Usa auto-spin 5 veces',icon:'🔄',target:5,type:'auto_uses',reward:200},
    {id:'a41',name:'Apuesta Alta',desc:'Apuesta 500 en un giro',icon:'💸',target:500,type:'max_bet',reward:500},
    {id:'a42',name:'Triple Wild',desc:'Consigue 3 Wilds',icon:'⭐',target:1,type:'triple_wild',reward:3000},
    {id:'a43',name:'Primer Bonus',desc:'Completa tu primer Bonus Round',icon:'🎁',target:1,type:'bonus_rounds',reward:300},
    {id:'a44',name:'Evento Especial',desc:'Juega durante un evento',icon:'🎪',target:1,type:'event_played',reward:200},
    {id:'a45',name:'Gema Collector',desc:'Acumula 20 gemas',icon:'💎',target:20,type:'gems_ever',reward:500},
    {id:'a46',name:'Power Up!',desc:'Activa un poder de personaje',icon:'⚡',target:1,type:'powers_used',reward:200},
    {id:'a47',name:'Power Master',desc:'Activa 20 poderes',icon:'⚡',target:20,type:'powers_used',reward:1000},
    {id:'a48',name:'Bono Diario x7',desc:'Reclama 7 bonos diarios',icon:'🎁',target:7,type:'daily_claims',reward:1000},
    {id:'a49',name:'Torneo Top 3',desc:'Alcanza top 3 del torneo',icon:'🏆',target:1,type:'tournament_top3',reward:2000},
    {id:'a50',name:'Leyenda Kawaii',desc:'Desbloquea 40 logros',icon:'👑',target:40,type:'achievements_done',reward:10000},
];

const SEASON_REWARDS = [];
for(let i=1;i<=30;i++){
    SEASON_REWARDS.push({
        level:i,
        free: i%5===0 ? {type:'gems',amount:3,label:'💎x3'} : {type:'coins',amount:i*100,label:`🪙x${i*100}`},
        premium: i%10===0 ? {type:'collection',label:'🎀 Item exclusivo'} : i%3===0 ? {type:'gems',amount:2,label:'💎x2'} : {type:'coins',amount:i*150,label:`🪙x${i*150}`}
    });
}

// ===== STATE =====
const state = {
    coins:1000, gems:5, level:1, xp:0, betIndex:1, streak:0,
    totalSpins:0, totalWins:0, coinsEver:1000, gemsEver:5, bestWin:0, bestStreak:0, bestCascade:0,
    spinsSinceJackpot:0, nextMiniJackpot:rng(40,60),
    isSpinning:false, autoSpin:false, turboMode:false,
    heldReels:[false,false,false], isHoldSpin:false,
    cascadeLevel:0,
    dailyDay:0, dailyClaimed:false,
    missions:[], missionsCompleted:0,
    seasonLevel:1, seasonXP:0,
    tournamentBest:0,
    holdUses:0, bonusRounds:0, turboUses:0, autoUses:0, powersUsed:0, dailyClaims:0, eventPlayed:false,
    darkMode:false,
    introSeen:false,
    charWins:{hello_kitty:0,cinnamoroll:0,pompompurin:0,my_melody:0,keroppi:0},
    achievementsUnlocked:{},
    collection: COLLECTION.map(()=>false),
    reelResults:[null,null,null],
    eventChar:'cinnamoroll',
};

function rng(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function weightedRandom(syms){const t=syms.reduce((s,x)=>s+x.weight,0);let r=Math.random()*t;for(const s of syms){r-=s.weight;if(r<=0)return s;}return syms[0];}
function fmt(n){if(n>=1e6)return(n/1e6).toFixed(1)+'M';if(n>=1e3)return(n/1e3).toFixed(1)+'K';return n.toString();}
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
function getVipTier(){for(let i=CONFIG.vipTiers.length-1;i>=0;i--){if(state.level>=CONFIG.vipTiers[i].level)return i;}return 0;}
function getVipData(){return CONFIG.vipTiers[getVipTier()];}

// ===== PERSISTENCE =====
function saveAll(){
    const d = {...state, collection:COLLECTION.map(c=>c.unlocked)};
    delete d.isSpinning; delete d.reelResults;
    localStorage.setItem('sanrio_v2',JSON.stringify(d));
}
function loadAll(){
    try{
        const d=JSON.parse(localStorage.getItem('sanrio_v2'));
        if(!d)return;
        Object.keys(d).forEach(k=>{if(k==='collection'){d[k].forEach((v,i)=>{if(COLLECTION[i])COLLECTION[i].unlocked=v});}else if(k in state)state[k]=d[k];});
    }catch(e){}
}

// ===== DOM CACHE =====
const D={};
function cacheDom(){
    const ids=['coin-count','gem-count','level-number','xp-bar','streak-badge','streak-count',
        'cascade-badge','cascade-multi','bet-value','btn-spin','spin-text','btn-bet-up','btn-bet-down',
        'btn-auto','btn-turbo','btn-collection','btn-daily','btn-darkmode','btn-missions',
        'btn-tournament','btn-seasonpass','btn-achievements','btn-lore','btn-vip',
        'win-display','win-amount','win-line','near-miss-display',
        'reel-strip-1','reel-strip-2','reel-strip-3','reel-1','reel-2','reel-3',
        'hold-btn-1','hold-btn-2','hold-btn-3',
        'modal-collection','collection-grid','collection-fill','collection-text',
        'modal-daily','daily-calendar','btn-claim-daily',
        'modal-bigwin','bigwin-title','bigwin-amount','bigwin-character',
        'modal-levelup','levelup-number','levelup-coins',
        'modal-bonus','bonus-grid','bonus-picks','bonus-total','btn-bonus-done',
        'modal-missions','missions-list','close-missions',
        'modal-tournament','tournament-table','tournament-best','close-tournament',
        'modal-vip','vip-current-display','vip-tiers','close-vip',
        'modal-seasonpass','sp-track','sp-fill','sp-level','close-seasonpass',
        'modal-achievements','achievements-list','achievements-done','achievements-total','close-achievements',
        'modal-lore','lore-characters','close-lore',
        'confetti-canvas','particles-bg','ticker-content','slot-machine',
        'power-flash','power-char','power-name',
        'event-banner','event-text','event-icon','event-timer',
        'intro-overlay','btn-intro-start','intro-particles',
        'vip-badge','vip-tier-name',
        'btn-bigwin-continue','btn-levelup-continue','close-collection','close-daily'];
    ids.forEach(id=>{D[id.replace(/-/g,'_')]=document.getElementById(id);});
    D.reelStrips=[D.reel_strip_1,D.reel_strip_2,D.reel_strip_3];
    D.reelCont=[D.reel_1,D.reel_2,D.reel_3];
    D.holdBtns=[D.hold_btn_1,D.hold_btn_2,D.hold_btn_3];
}
