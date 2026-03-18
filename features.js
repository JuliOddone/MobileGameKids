/* SANRIO SLOTS v2 — FEATURES & UI */

// ===== HUD =====
function updateHUD(){
    D.coin_count.textContent=fmt(state.coins);D.gem_count.textContent=state.gems;
    D.level_number.textContent=state.level;D.bet_value.textContent=CONFIG.betLevels[state.betIndex];
    const xpN=CONFIG.xpPerLevel*state.level;D.xp_bar.style.width=Math.min((state.xp/xpN)*100,100)+'%';
    const vip=getVipData();D.vip_tier_name.textContent=vip.name;
    D.coin_count.style.transition='transform 0.2s';D.coin_count.style.transform='scale(1.2)';
    setTimeout(()=>D.coin_count.style.transform='scale(1)',200);
}

// ===== XP & LEVEL =====
function addXP(a){
    const vip=getVipData();state.xp+=Math.floor(a*vip.xpBonus);
    const xpN=CONFIG.xpPerLevel*state.level;
    if(state.xp>=xpN){state.xp-=xpN;state.level++;state.coins+=CONFIG.levelUpBonus*state.level;state.coinsEver+=CONFIG.levelUpBonus*state.level;
        trackAchievement('level',state.level);showLevelUp();}
    updateHUD();
}
function showLevelUp(){D.levelup_number.textContent=state.level;D.levelup_coins.textContent='+'+fmt(CONFIG.levelUpBonus*state.level)+' 🪙';D.modal_levelup.classList.remove('hidden');launchConfetti();}
function showBigWin(a,sym){
    D.bigwin_amount.textContent='+'+fmt(a);D.bigwin_title.textContent=a>=1000?'🎰 ¡¡JACKPOT!! 🎰':'¡GRAN PREMIO!';
    D.bigwin_character.innerHTML=sym&&sym.img?`<img src="${sym.img}" alt="${sym.name}">`:'🎁';
    D.modal_bigwin.classList.remove('hidden');launchConfetti();
}

// ===== BET =====
function betUp(){if(!state.isSpinning){state.betIndex=Math.min(state.betIndex+1,CONFIG.betLevels.length-1);updateHUD();}}
function betDown(){if(!state.isSpinning){state.betIndex=Math.max(state.betIndex-1,0);updateHUD();}}
function toggleAuto(){state.autoSpin=!state.autoSpin;D.btn_auto.classList.toggle('active',state.autoSpin);if(state.autoSpin){state.autoUses++;trackAchievement('auto_uses',state.autoUses);if(!state.isSpinning)spin();}}
function toggleTurbo(){state.turboMode=!state.turboMode;D.btn_turbo.classList.toggle('active',state.turboMode);if(state.turboMode){state.turboUses++;trackAchievement('turbo_uses',state.turboUses);}}

// ===== DARK MODE =====
function toggleDark(){state.darkMode=!state.darkMode;document.body.classList.toggle('dark-mode',state.darkMode);
    D.btn_darkmode.textContent=state.darkMode?'☀️':'🌙';trackAchievement('dark_mode',1);saveAll();}

// ===== COLLECTION =====
function tryUnlock(){const l=COLLECTION.filter(c=>!c.unlocked);if(!l.length)return;const it=l[rng(0,l.length-1)];it.unlocked=true;
    state.collection=COLLECTION.map(c=>c.unlocked);trackAchievement('collection_count',COLLECTION.filter(c=>c.unlocked).length);
    showCollectNotif(it);saveAll();}
function showCollectNotif(it){const n=document.createElement('div');n.style.cssText='position:fixed;top:70px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#FFF5E1,#FFE0E8);border:2px solid var(--pink);border-radius:16px;padding:8px 16px;font-family:var(--font-display);font-size:13px;font-weight:600;z-index:300;box-shadow:0 8px 24px rgba(255,183,197,0.4);animation:modalPop 0.4s cubic-bezier(0.34,1.56,0.64,1);white-space:nowrap;color:#4A3B5C';
    n.innerHTML=`${it.outfit} ¡${it.name}!`;document.body.appendChild(n);setTimeout(()=>{n.style.transition='all 0.3s';n.style.opacity='0';setTimeout(()=>n.remove(),300);},2000);}
function renderCollection(){
    D.collection_grid.innerHTML='';let uc=0;
    COLLECTION.forEach(it=>{const c=document.createElement('div');const sym=CONFIG.symbols.find(s=>s.id===it.char);
        c.className='collection-card '+(it.unlocked?'unlocked':'locked');
        if(it.unlocked){uc++;c.innerHTML=(sym&&sym.img?`<img src="${sym.img}">`:'')+'<div class="collection-card-name">'+it.outfit+' '+it.name+'</div>';}
        else c.innerHTML='<div class="collection-card-name">???</div>';D.collection_grid.appendChild(c);});
    D.collection_fill.style.width=Math.round(uc/COLLECTION.length*100)+'%';D.collection_text.textContent=uc+' / '+COLLECTION.length;
}

// ===== DAILY =====
const DAILY_R=[100,200,300,500,750,1000,2000];
function renderDaily(){
    D.daily_calendar.innerHTML='';for(let i=0;i<7;i++){const d=document.createElement('div');d.className='daily-day';
        if(i<state.dailyDay)d.classList.add('claimed');if(i===state.dailyDay)d.classList.add('today');
        d.innerHTML=`<span class="day-num">${i+1}</span><span class="day-reward">${i===6?'💎':'🪙'}</span>`;D.daily_calendar.appendChild(d);}
    const lc=localStorage.getItem('sanrio_lastClaim');
    D.btn_claim_daily.disabled=lc===new Date().toDateString();
    D.btn_claim_daily.querySelector('span').textContent=D.btn_claim_daily.disabled?'¡Ya reclamado!':'¡Reclamar!';
}
function claimDaily(){
    if(localStorage.getItem('sanrio_lastClaim')===new Date().toDateString())return;
    const r=DAILY_R[Math.min(state.dailyDay,6)];if(state.dailyDay===6)state.gems+=3;
    state.coins+=r;state.coinsEver+=r;state.dailyDay=(state.dailyDay+1)%7;state.dailyClaims++;
    localStorage.setItem('sanrio_lastClaim',new Date().toDateString());
    trackAchievement('daily_claims',state.dailyClaims);updateHUD();renderDaily();flyCoins(r);saveAll();
}

// ===== MISSIONS =====
function initMissions(){if(!state.missions.length||state.missions.every(m=>m.done))state.missions=pickMissions(3);}
function pickMissions(n){const pool=[...MISSIONS_POOL].sort(()=>Math.random()-0.5);return pool.slice(0,n).map(m=>({...m,progress:0,done:false}));}
function trackMission(type,val){
    state.missions.forEach(m=>{if(m.done)return;if(m.type===type){m.progress=Math.min(m.progress+val,m.target);
        if(m.progress>=m.target){m.done=true;state.coins+=m.reward;state.coinsEver+=m.reward;state.missionsCompleted++;
            trackAchievement('missions_done',state.missionsCompleted);updateHUD();
            showCollectNotif({outfit:'📋',name:'Misión: '+m.text+' (+'+m.reward+'🪙)'});
            // Replace completed mission
            const newM=MISSIONS_POOL.filter(p=>!state.missions.find(x=>x.id===p.id)).sort(()=>Math.random()-0.5)[0];
            if(newM){const i=state.missions.indexOf(m);state.missions[i]={...newM,progress:0,done:false};}
        }}});
}
function renderMissions(){
    D.missions_list.innerHTML='';state.missions.forEach(m=>{const c=document.createElement('div');c.className='mission-card'+(m.done?' completed':'');
        const pct=Math.min(m.progress/m.target*100,100);
        c.innerHTML=`<div class="mission-top"><span class="mission-name">${m.icon} ${m.text}</span><span class="mission-reward">+${m.reward}🪙</span></div>
        <div class="mission-bar-bg"><div class="mission-bar-fill" style="width:${pct}%"></div></div>
        <div class="mission-progress-text">${m.progress}/${m.target}</div>`;D.missions_list.appendChild(c);});
}

// ===== TOURNAMENT =====
function renderTournament(){
    D.tournament_best.textContent=fmt(state.tournamentBest);
    const names=['KawaiiQueen','SakuraFan','CinnaLover','StarryHeart','PomPomStar','BowBunny','MelodyDream','PinkCloud','SweetPaws','LuckyClover'];
    const scores=[8500,6200,4800,3500,2800,2100,1500,900,500,200].map((s,i)=>({name:names[i],score:s+rng(-200,200),isPlayer:false}));
    scores.push({name:'⭐ TÚ',score:state.tournamentBest,isPlayer:true});
    scores.sort((a,b)=>b.score-a.score);
    D.tournament_table.innerHTML='';scores.slice(0,11).forEach((e,i)=>{const r=document.createElement('div');
        r.className='tournament-row'+(e.isPlayer?' player':'');
        r.innerHTML=`<span class="tournament-rank">${i<3?['🥇','🥈','🥉'][i]:(i+1)}</span><span class="tournament-pname">${e.name}</span><span class="tournament-score">${fmt(e.score)} 🪙</span>`;
        D.tournament_table.appendChild(r);});
}

// ===== VIP =====
function renderVIP(){
    const ct=getVipTier();const vip=CONFIG.vipTiers[ct];
    D.vip_current_display.innerHTML=`<div class="vip-current-tier">${vip.icon} ${vip.name}</div><div class="vip-current-perks">${vip.perks}</div>`;
    D.vip_tiers.innerHTML='';CONFIG.vipTiers.forEach((t,i)=>{const c=document.createElement('div');
        c.className='vip-tier-card'+(i===ct?' active':'')+(i>ct?' locked':'');
        c.innerHTML=`<span class="vip-tier-emoji">${t.icon}</span><div class="vip-tier-info"><div class="vip-tier-title">${t.name}</div>
        <div class="vip-tier-req">Nivel ${t.level}+</div><div class="vip-tier-perks-list">${t.perks}</div></div>`;
        D.vip_tiers.appendChild(c);});
    trackAchievement('vip_tier',ct+1);
}

// ===== SEASON PASS =====
function addSeasonXP(a){state.seasonXP+=a;const needed=100*state.seasonLevel;
    if(state.seasonXP>=needed&&state.seasonLevel<30){state.seasonXP-=needed;state.seasonLevel++;
        const r=SEASON_REWARDS[state.seasonLevel-1];if(r){if(r.free.type==='coins'){state.coins+=r.free.amount;state.coinsEver+=r.free.amount;}
            if(r.free.type==='gems'){state.gems+=r.free.amount;state.gemsEver=(state.gemsEver||5)+r.free.amount;}}
        trackAchievement('season_level',state.seasonLevel);updateHUD();}
}
function renderSeasonPass(){
    D.sp_level.textContent=state.seasonLevel;D.sp_fill.style.width=Math.min(state.seasonXP/(100*state.seasonLevel)*100,100)+'%';
    D.sp_track.innerHTML='';const start=Math.max(0,state.seasonLevel-3);const end=Math.min(30,state.seasonLevel+7);
    for(let i=start;i<end;i++){const r=SEASON_REWARDS[i];const it=document.createElement('div');
        it.className='sp-item'+(i<state.seasonLevel-1?' claimed':'')+(i===state.seasonLevel-1?' current':'');
        it.innerHTML=`<span class="sp-item-level">${i+1}</span><span class="sp-item-reward">${r.free.label}</span>
        <span class="sp-item-status">${i<state.seasonLevel-1?'✅':i===state.seasonLevel-1?'🔄':'🔒'}</span>`;
        D.sp_track.appendChild(it);}
}

// ===== ACHIEVEMENTS =====
function trackAchievement(type,val){
    ACHIEVEMENTS_DATA.forEach(a=>{if(state.achievementsUnlocked[a.id])return;
        if(a.type===type&&val>=a.target){state.achievementsUnlocked[a.id]=true;state.coins+=a.reward;state.coinsEver+=a.reward;
            showCollectNotif({outfit:a.icon,name:a.name+' (+'+a.reward+'🪙)'});updateHUD();
            trackAchievement('achievements_done',Object.keys(state.achievementsUnlocked).length);}});
}
function renderAchievements(){
    const done=Object.keys(state.achievementsUnlocked).length;D.achievements_done.textContent=done;D.achievements_total.textContent=ACHIEVEMENTS_DATA.length;
    D.achievements_list.innerHTML='';ACHIEVEMENTS_DATA.forEach(a=>{const c=document.createElement('div');const u=!!state.achievementsUnlocked[a.id];
        c.className='achievement-card'+(u?' unlocked':'');
        c.innerHTML=`<span class="achievement-emoji">${a.icon}</span><div class="achievement-info"><div class="achievement-name">${a.name}</div>
        <div class="achievement-desc">${a.desc}</div></div><span class="achievement-status">${u?'✅':'🔒'}</span><span style="font-size:10px;color:#D4930D;font-weight:700;margin-left:4px">+${a.reward}🪙</span>`;
        D.achievements_list.appendChild(c);});
}

// ===== LORE =====
function renderLore(){
    D.lore_characters.innerHTML='';CONFIG.symbols.filter(s=>s.power).forEach(s=>{const c=document.createElement('div');c.className='lore-char-card';
        c.innerHTML=`<img class="lore-char-img" src="${s.img}" alt="${s.name}"><div class="lore-char-info"><div class="lore-char-name">${s.name}</div>
        <div class="lore-char-power"><strong>${s.power}</strong> — ${s.powerDesc}</div></div>`;D.lore_characters.appendChild(c);});
}

// ===== PARTICLES & TICKER =====
function initParticles(){for(let i=0;i<20;i++){const p=document.createElement('div');p.className='particle';
    p.textContent=CONFIG.particleEmojis[rng(0,CONFIG.particleEmojis.length-1)];p.style.left=Math.random()*100+'%';
    p.style.animationDuration=(8+Math.random()*12)+'s';p.style.animationDelay=(Math.random()*10)+'s';p.style.fontSize=(14+Math.random()*16)+'px';D.particles_bg.appendChild(p);}}
function initTicker(){const items=[];for(let i=0;i<12;i++){const n=CONFIG.tickerNames[rng(0,CONFIG.tickerNames.length-1)];const a=[50,100,200,500,1000,2500,5000][rng(0,6)];
    items.push(`<span class="ticker-item">${['🐱','🐶','🐰','🐸','☁️'][rng(0,4)]} <span class="ticker-name">${n}</span> ganó <span class="ticker-amount">+${a} 🪙</span></span>`);}
    D.ticker_content.innerHTML=items.join('');}

// ===== CINEMATIC INTRO =====
function initIntro(){
    if(state.introSeen){D.intro_overlay.classList.add('hidden');return;}
    // Intro particles
    for(let i=0;i<15;i++){const p=document.createElement('div');p.className='particle';
        p.textContent=CONFIG.particleEmojis[rng(0,CONFIG.particleEmojis.length-1)];p.style.left=Math.random()*100+'%';
        p.style.animationDuration=(6+Math.random()*8)+'s';p.style.animationDelay=Math.random()*3+'s';p.style.fontSize=(16+Math.random()*20)+'px';
        D.intro_particles.appendChild(p);}
}

// ===== EVENT SETUP =====
function initEvent(){
    const chars=['cinnamoroll','hello_kitty','pompompurin','my_melody','keroppi'];
    const names=['Cinnamoroll','Hello Kitty','Pompompurin','My Melody','Keroppi'];
    const icons=['☁️','🐱','🐶','🐰','🐸'];
    const weekIdx=Math.floor(Date.now()/(7*24*60*60*1000))%5;
    state.eventChar=chars[weekIdx];
    D.event_text.textContent='Semana '+names[weekIdx]+' — ¡Payout x1.5!';
    D.event_icon.textContent=icons[weekIdx];
}

// ===== MODAL HELPERS =====
function openModal(id,renderFn){if(renderFn)renderFn();document.getElementById(id).classList.remove('hidden');}
function closeModal(id){document.getElementById(id).classList.add('hidden');}

// ===== EVENT LISTENERS =====
function bindEvents(){
    D.btn_spin.addEventListener('click',spin);
    D.btn_bet_up.addEventListener('click',betUp);D.btn_bet_down.addEventListener('click',betDown);
    D.btn_auto.addEventListener('click',toggleAuto);D.btn_turbo.addEventListener('click',toggleTurbo);
    D.btn_darkmode.addEventListener('click',toggleDark);

    D.btn_collection.addEventListener('click',()=>openModal('modal-collection',renderCollection));
    D.btn_daily.addEventListener('click',()=>openModal('modal-daily',renderDaily));
    D.btn_missions.addEventListener('click',()=>openModal('modal-missions',renderMissions));
    D.btn_tournament.addEventListener('click',()=>openModal('modal-tournament',renderTournament));
    D.btn_vip.addEventListener('click',()=>openModal('modal-vip',renderVIP));
    D.btn_seasonpass.addEventListener('click',()=>openModal('modal-seasonpass',renderSeasonPass));
    D.btn_achievements.addEventListener('click',()=>openModal('modal-achievements',renderAchievements));
    D.btn_lore.addEventListener('click',()=>openModal('modal-lore',renderLore));
    D.vip_badge.addEventListener('click',()=>openModal('modal-vip',renderVIP));

    D.close_collection.addEventListener('click',()=>closeModal('modal-collection'));
    D.close_daily.addEventListener('click',()=>closeModal('modal-daily'));
    D.close_missions.addEventListener('click',()=>closeModal('modal-missions'));
    D.close_tournament.addEventListener('click',()=>closeModal('modal-tournament'));
    D.close_vip.addEventListener('click',()=>closeModal('modal-vip'));
    D.close_seasonpass.addEventListener('click',()=>closeModal('modal-seasonpass'));
    D.close_achievements.addEventListener('click',()=>closeModal('modal-achievements'));
    D.close_lore.addEventListener('click',()=>closeModal('modal-lore'));

    D.btn_claim_daily.addEventListener('click',claimDaily);
    D.btn_bigwin_continue.addEventListener('click',()=>closeModal('modal-bigwin'));
    D.btn_levelup_continue.addEventListener('click',()=>closeModal('modal-levelup'));
    D.btn_bonus_done.addEventListener('click',collectBonus);

    D.holdBtns.forEach((b,i)=>b.addEventListener('click',()=>toggleHold(i)));

    D.btn_intro_start.addEventListener('click',()=>{state.introSeen=true;D.intro_overlay.classList.add('hidden');saveAll();});

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(m=>{m.addEventListener('click',e=>{if(e.target===m)m.classList.add('hidden');});});

    // Keyboard
    document.addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();spin();}});
    document.addEventListener('contextmenu',e=>e.preventDefault());
    window.addEventListener('resize',()=>{D.confetti_canvas.width=innerWidth;D.confetti_canvas.height=innerHeight;});
}

// ===== INIT =====
function init(){
    cacheDom();loadAll();
    if(state.darkMode)document.body.classList.add('dark-mode');
    initIntro();initParticles();initTicker();initReels();initMissions();initEvent();
    bindEvents();updateHUD();

    const lc=localStorage.getItem('sanrio_lastClaim');
    if(lc!==new Date().toDateString())D.btn_daily.classList.add('has-notification');
    if(state.missions.some(m=>m.done))D.btn_missions.classList.add('has-notification');

    setTimeout(()=>{D.slot_machine.style.animation='modalPop 0.6s cubic-bezier(0.34,1.56,0.64,1)';},200);
    console.log('🌸 Sanrio Slots v2 — Kawaii Fortune initialized!');
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
