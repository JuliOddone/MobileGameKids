/* SANRIO SLOTS v2 — GAMEPLAY SYSTEMS */

// ===== REEL SYSTEM =====
const REEL_COUNT=30;
function createSymEl(sym){
    const d=document.createElement('div');d.className='reel-symbol';d.dataset.symbolId=sym.id;
    if(sym.img){const i=document.createElement('img');i.src=sym.img;i.alt=sym.name;i.loading='eager';d.appendChild(i);}
    else{const e=document.createElement('div');e.className='bonus-emoji';d.appendChild(e);}
    return d;
}
function initReels(){D.reelStrips.forEach(s=>{s.innerHTML='';for(let i=0;i<REEL_COUNT;i++)s.appendChild(createSymEl(weightedRandom(CONFIG.symbols)));s.style.transform='translateY(0px)';});}
function symH(i){return D.reelCont[i].clientHeight/CONFIG.visibleSymbols;}

function animateReel(strip,idx,target,dur){
    return new Promise(res=>{
        const h=symH(idx);strip.innerHTML='';const ti=REEL_COUNT-CONFIG.visibleSymbols+1;
        for(let i=0;i<REEL_COUNT;i++)strip.appendChild(createSymEl(i===ti?target:weightedRandom(CONFIG.symbols)));
        strip.style.transition='none';strip.style.transform='translateY(0px)';strip.offsetHeight;
        strip.style.transition=`transform ${dur}ms cubic-bezier(0.15,0.85,0.35,1.02)`;
        strip.style.transform=`translateY(${-(ti-1)*h}px)`;setTimeout(res,dur);
    });
}

// ===== SPIN =====
async function spin(){
    if(state.isSpinning)return;
    const bet=CONFIG.betLevels[state.betIndex];
    const cost=state.isHoldSpin?Math.ceil(bet/2):bet;
    if(state.coins<cost){shakeEl(D.coin_count.parentElement);return;}

    state.isSpinning=true;state.coins-=cost;state.totalSpins++;state.spinsSinceJackpot++;
    state.cascadeLevel=0;updateHUD();hideWinD();hideNearMiss();
    D.win_line.classList.remove('active');clearWinning();hideCascadeBadge();

    const results=determineResults();state.reelResults=results;
    D.btn_spin.classList.add('spinning');D.btn_spin.disabled=true;

    const sd=state.turboMode?CONFIG.turboSpinDuration:CONFIG.spinDuration;
    const rd=state.turboMode?CONFIG.turboReelDelay:CONFIG.reelDelay;

    const promises=D.reelStrips.map((s,i)=>{
        if(state.heldReels[i]&&state.isHoldSpin)return Promise.resolve();
        return animateReel(s,i,results[i],sd+(i*rd));
    });
    await Promise.all(promises);

    D.btn_spin.classList.remove('spinning');D.btn_spin.disabled=false;
    state.isSpinning=false;state.isHoldSpin=false;
    state.heldReels=[false,false,false];D.holdBtns.forEach(b=>{b.classList.add('hidden');b.classList.remove('active');});

    // Character power chance
    if(Math.random()<CONFIG.powerChance)await triggerPower(results);

    await evaluateResults(results,bet);
    addXP(CONFIG.xpPerSpin);addSeasonXP(5);
    trackMission('spins',1);trackAchievement('total_spins',state.totalSpins);
    trackAchievement('max_bet',bet);trackAchievement('event_played',state.eventPlayed?1:0);
    state.eventPlayed=true;saveAll();

    if(state.autoSpin&&state.coins>=CONFIG.betLevels[state.betIndex]){
        setTimeout(()=>{if(state.autoSpin)spin();},state.turboMode?CONFIG.turboAutoSpinDelay:CONFIG.autoSpinDelay);
    }else if(state.autoSpin){state.autoSpin=false;D.btn_auto.classList.remove('active');}
}

function determineResults(){
    const r=[];
    if(state.spinsSinceJackpot>=state.nextMiniJackpot){
        const s=weightedRandom(CONFIG.symbols.filter(x=>!x.isBonus));r.push(s,s,s);
        state.spinsSinceJackpot=0;state.nextMiniJackpot=rng(40,60);return fillHeld(r);
    }
    for(let i=0;i<3;i++){
        if(state.heldReels[i]&&state.isHoldSpin)r.push(state.reelResults[i]);
        else r.push(weightedRandom(getActiveSymbols()));
    }
    if(!isWin(r)&&Math.random()<CONFIG.nearMissChance){r[1]={...r[0]};r[2]=weightedRandom(CONFIG.symbols.filter(s=>s.id!==r[0].id&&!s.isWild));}
    return r;
}

function getActiveSymbols(){
    // Deep copy so we never mutate CONFIG
    const syms=CONFIG.symbols.map(s=>({...s}));
    const ev=syms.find(s=>s.id===state.eventChar);
    if(ev) ev.weight=Math.round(ev.weight*1.5);
    return syms;
}

function fillHeld(r){
    for(let i=0;i<3;i++){if(state.heldReels[i]&&state.isHoldSpin&&state.reelResults[i])r[i]=state.reelResults[i];}
    return r;
}

function isWin(r){
    const ids=r.map(x=>x.id);const hw=r.some(x=>x.isWild);
    if(ids[0]===ids[1]&&ids[1]===ids[2])return true;
    if(hw){const nw=r.filter(x=>!x.isWild);if(nw.length<=1)return true;if(nw.length===2&&nw[0].id===nw[1].id)return true;}
    if(r.filter(x=>x.isBonus).length>=2)return true;
    return false;
}

async function evaluateResults(results,bet){
    const win=isWin(results);const nm=!win&&results[0].id===results[1].id;
    const isBonusTrigger=results.filter(x=>x.isBonus).length>=3;

    if(win){
        const vip=getVipData();const payout=calcPayout(results,bet,vip);
        const isJP=payout>=bet*10;
        state.streak++;state.totalWins++;if(state.streak>state.bestStreak)state.bestStreak=state.streak;
        updateStreak();highlightWin();D.win_line.classList.add('active');
        showWinD(payout);screenShake();createFlash();flyCoins(payout);
        addXP(CONFIG.xpPerWin);state.coins+=payout;state.coinsEver+=payout;
        if(payout>state.bestWin)state.bestWin=payout;updateHUD();

        // Track wins per character
        const mainChar=results.find(x=>!x.isWild&&!x.isBonus);
        if(mainChar){state.charWins[mainChar.id]=(state.charWins[mainChar.id]||0)+1;
            trackMission('char_win_'+mainChar.id,1);trackAchievement('wins_'+mainChar.id,state.charWins[mainChar.id]);}
        trackMission('coins_won',payout);trackMission('streak',state.streak>=3?1:0);
        trackMission('wild_win',results.some(x=>x.isWild)?1:0);
        trackAchievement('total_wins',state.totalWins);trackAchievement('best_streak',state.bestStreak);
        trackAchievement('best_win',state.bestWin);trackAchievement('coins_ever',state.coinsEver);
        if(results.every(x=>x.isWild))trackAchievement('triple_wild',1);

        if(Math.random()<0.15||isBonusTrigger)tryUnlock();
        if(isJP){await sleep(800);showBigWin(payout,results[0]);}
        if(payout>=bet*5)launchConfetti();

        // Show hold buttons for next spin
        showHoldButtons();

        // Cascade check — re-evaluate with new random symbols
        if(payout>0){
            state.cascadeLevel++;
            if(state.cascadeLevel>1){showCascadeBadge();trackAchievement('best_cascade',state.cascadeLevel);
                if(state.cascadeLevel>=3)trackMission('cascade_3',1);}
            if(state.cascadeLevel<5&&Math.random()<0.35){
                await sleep(600);await doCascade(bet);
            }
        }

        // Bonus round
        if(isBonusTrigger){await sleep(500);await startBonusRound();}

        // Tournament
        if(payout>state.tournamentBest){state.tournamentBest=payout;trackAchievement('tournament_top3',payout>=3000?1:0);}

    }else{
        state.streak=0;updateStreak();if(nm)showNearMiss();
    }
    addSeasonXP(win?15:3);
}

function calcPayout(r,bet,vip){
    let mul=0;const ids=r.map(x=>x.id);const hw=r.some(x=>x.isWild);const bc=r.filter(x=>x.isBonus).length;
    if(ids[0]===ids[1]&&ids[1]===ids[2]){mul=r[0].payout;if(r[0].isWild)mul=50;}
    else if(hw){const nw=r.filter(x=>!x.isWild);mul=nw.length<=1?20:(nw[0].id===nw[1].id?nw[0].payout*1.5:0);}
    else if(bc>=2){mul=25*bc;}
    const si=Math.min(state.streak,CONFIG.streakMultipliers.length-1);
    const cm=CONFIG.cascadeMultipliers[Math.min(state.cascadeLevel,CONFIG.cascadeMultipliers.length-1)];
    const eventMul=r.some(x=>x.id===state.eventChar)?1.5:1;
    return Math.max(Math.floor(bet*mul*CONFIG.streakMultipliers[si]*cm*(1+vip.payoutBonus)*eventMul),1);
}

async function doCascade(bet){
    // Generate new symbols for "fallen" positions
    const newResults=[weightedRandom(CONFIG.symbols),weightedRandom(CONFIG.symbols),weightedRandom(CONFIG.symbols)];
    state.reelResults=newResults;
    // Quick animate
    const sd=state.turboMode?300:600;
    await Promise.all(D.reelStrips.map((s,i)=>animateReel(s,i,newResults[i],sd)));
    if(isWin(newResults)){
        const vip=getVipData();const p=calcPayout(newResults,bet,vip);
        state.coins+=p;state.coinsEver+=p;
        if(p>state.bestWin)state.bestWin=p;
        highlightWin();showWinD(p);flyCoins(p);updateHUD();
        state.cascadeLevel++;showCascadeBadge();
        trackAchievement('best_cascade',state.cascadeLevel);
        if(state.cascadeLevel<5&&Math.random()<0.3){await sleep(500);await doCascade(bet);}
    }
}

// ===== HOLD & SPIN =====
function showHoldButtons(){D.holdBtns.forEach(b=>b.classList.remove('hidden'));}
function toggleHold(i){
    state.heldReels[i]=!state.heldReels[i];
    D.holdBtns[i].classList.toggle('active',state.heldReels[i]);
    if(state.heldReels.some(h=>h)){
        state.isHoldSpin=true;D.spin_text.textContent='RE-SPIN';
        state.holdUses++;trackMission('hold_spins',1);trackAchievement('hold_uses',state.holdUses);
    }else{state.isHoldSpin=false;D.spin_text.textContent='GIRAR';}
}

// ===== CHARACTER POWERS =====
async function triggerPower(results){
    const chars=results.filter(r=>r.power&&!r.isWild&&!r.isBonus);if(!chars.length)return;
    const c=chars[rng(0,chars.length-1)];
    D.power_char.textContent=c.name==='Hello Kitty'?'🐱':c.name==='Cinnamoroll'?'☁️':c.name==='Pompompurin'?'🐶':c.name==='My Melody'?'🐰':'🐸';
    D.power_name.textContent=c.power+'!';D.power_flash.classList.remove('hidden');
    state.powersUsed++;trackAchievement('powers_used',state.powersUsed);
    await sleep(2000);D.power_flash.classList.add('hidden');
}

// ===== BONUS ROUND =====
let bonusPicks=3, bonusTotal=0;
async function startBonusRound(){
    bonusPicks=3;bonusTotal=0;D.bonus_picks.textContent='3';D.bonus_total.textContent='0';
    D.btn_bonus_done.classList.add('hidden');
    const grid=D.bonus_grid;grid.innerHTML='';
    const rewards=[500,300,200,100,800,150,250,1000,50];rewards.sort(()=>Math.random()-0.5);
    for(let i=0;i<9;i++){
        const g=document.createElement('div');g.className='bonus-gift';g.textContent='🎁';g.dataset.reward=rewards[i];
        g.addEventListener('click',()=>revealGift(g));grid.appendChild(g);
    }
    D.modal_bonus.classList.remove('hidden');
    state.bonusRounds++;trackMission('bonus_round',1);trackAchievement('bonus_rounds',state.bonusRounds);
}
function revealGift(el){
    if(el.classList.contains('revealed')||bonusPicks<=0)return;
    bonusPicks--;const r=parseInt(el.dataset.reward);bonusTotal+=r;
    el.textContent=['🐱','☁️','🐶','🐰','🐸'][rng(0,4)];el.classList.add('revealed');
    el.dataset.reward='+'+r+' 🪙';
    D.bonus_picks.textContent=bonusPicks;D.bonus_total.textContent=fmt(bonusTotal);
    if(bonusPicks<=0){D.btn_bonus_done.classList.remove('hidden');
        D.bonus_grid.querySelectorAll('.bonus-gift:not(.revealed)').forEach(g=>{g.textContent='❓';g.style.opacity='0.4';});}
}
function collectBonus(){
    state.coins+=bonusTotal;state.coinsEver+=bonusTotal;updateHUD();
    D.modal_bonus.classList.add('hidden');launchConfetti();saveAll();
}

// ===== VISUAL EFFECTS =====
function highlightWin(){const ti=REEL_COUNT-CONFIG.visibleSymbols+1;D.reelStrips.forEach(s=>{const syms=s.querySelectorAll('.reel-symbol');if(syms[ti])syms[ti].classList.add('winning');});}
function clearWinning(){document.querySelectorAll('.reel-symbol.winning').forEach(e=>e.classList.remove('winning'));}
function showWinD(a){D.win_amount.textContent='+'+fmt(a);D.win_display.classList.remove('hidden');D.win_display.classList.add('visible');setTimeout(()=>{D.win_display.classList.remove('visible');D.win_display.classList.add('hidden');},2500);}
function hideWinD(){D.win_display.classList.remove('visible');D.win_display.classList.add('hidden');}
function showNearMiss(){D.near_miss_display.classList.remove('hidden');D.near_miss_display.classList.add('visible');setTimeout(()=>{D.near_miss_display.classList.remove('visible');D.near_miss_display.classList.add('hidden');},1500);}
function hideNearMiss(){D.near_miss_display.classList.remove('visible');D.near_miss_display.classList.add('hidden');}
function screenShake(){document.body.classList.add('screen-shake');setTimeout(()=>document.body.classList.remove('screen-shake'),500);}
function shakeEl(el){el.style.animation='nearMissShake 0.4s ease-in-out';setTimeout(()=>el.style.animation='',400);}
function createFlash(){const f=document.createElement('div');f.className='flash-overlay';document.body.appendChild(f);setTimeout(()=>f.remove(),400);}
function flyCoins(a){const c=Math.min(Math.ceil(a/50),12);for(let i=0;i<c;i++)setTimeout(()=>{const el=document.createElement('div');el.className='flying-coin';el.textContent='🪙';el.style.left=(30+Math.random()*40)+'%';el.style.top=(40+Math.random()*20)+'%';document.body.appendChild(el);setTimeout(()=>el.remove(),800);},i*80);}
function showCascadeBadge(){D.cascade_badge.classList.remove('hidden');D.cascade_multi.textContent='x'+CONFIG.cascadeMultipliers[Math.min(state.cascadeLevel,CONFIG.cascadeMultipliers.length-1)];}
function hideCascadeBadge(){D.cascade_badge.classList.add('hidden');}

function launchConfetti(){
    const cv=D.confetti_canvas,ctx=cv.getContext('2d');cv.width=innerWidth;cv.height=innerHeight;
    const ps=[],cols=['#FFB7C5','#C8A2D0','#A8E6CF','#FFE066','#89CFF0','#FF85A1'];
    for(let i=0;i<100;i++)ps.push({x:Math.random()*cv.width,y:Math.random()*cv.height-cv.height,w:5+Math.random()*5,h:8+Math.random()*5,color:cols[rng(0,5)],vx:(Math.random()-0.5)*4,vy:2+Math.random()*4,rot:Math.random()*6.28,rs:(Math.random()-0.5)*0.2,op:1});
    let fr=0;(function ani(){ctx.clearRect(0,0,cv.width,cv.height);let alive=false;
    ps.forEach(p=>{if(p.op<=0)return;alive=true;p.x+=p.vx;p.y+=p.vy;p.rot+=p.rs;p.vy+=0.05;if(p.y>cv.height)p.op-=0.02;
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.globalAlpha=p.op;ctx.fillStyle=p.color;ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);ctx.restore();});
    fr++;if(alive&&fr<180)requestAnimationFrame(ani);else ctx.clearRect(0,0,cv.width,cv.height);})();
}

function updateStreak(){if(state.streak>=2){D.streak_badge.classList.remove('hidden');D.streak_count.textContent=state.streak;}else D.streak_badge.classList.add('hidden');}
