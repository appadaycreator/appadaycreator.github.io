/* ============================================================
   クレジットカード最適診断 — app.js
   ============================================================ */

/* ===== ストレージキー ===== */
const SK = {
  answers:'ccf_answers',
  result:'ccf_result',
  step:'ccf_step'
};

/* ===== トースト ===== */
const Toast = {
  container: null,
  init(){
    this.container = document.getElementById('toast-container');
  },
  show(msg, type='info', dur=3200){
    if(!this.container) return;
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    const icons = {
      ok:`<svg viewBox="0 0 24 24"><path stroke="var(--ok)" stroke-width="2.5" fill="none" d="M5 13l4 4L19 7"/></svg>`,
      err:`<svg viewBox="0 0 24 24"><path stroke="var(--danger)" stroke-width="2.5" fill="none" d="M18 6L6 18M6 6l12 12"/></svg>`,
      info:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="var(--info)" stroke-width="2" fill="none"/><path stroke="var(--info)" stroke-width="2" fill="none" d="M12 8v4M12 16h.01"/></svg>`
    };
    t.innerHTML = (icons[type]||icons.info) + `<span>${msg}</span>`;
    this.container.appendChild(t);
    setTimeout(()=>t.remove(), dur);
  }
};

/* ===== ローディング ===== */
const Loading = {
  el: null,
  init(){ this.el = document.getElementById('loading-overlay'); },
  show(){ this.el && this.el.classList.add('show'); },
  hide(){ this.el && this.el.classList.remove('show'); }
};

/* ===== 再開バナー ===== */
const Resume = {
  banner: null,
  init(){
    this.banner = document.getElementById('resume-banner');
    if(!this.banner) return;
    document.getElementById('rb-go')?.addEventListener('click', ()=>{
      this.banner.style.display='none';
      startApp();
    });
    document.getElementById('rb-no')?.addEventListener('click', ()=>{
      this.banner.style.display='none';
      clearSaved();
    });
  },
  checkResume(){
    const saved = getSavedAnswers();
    if(!this.banner) return;
    if(saved && Object.keys(saved).length > 0){
      this.banner.style.display='flex';
    } else {
      this.banner.style.display='none';
    }
  }
};

/* ===== ローカルストレージ ===== */
function saveAnswers(answers){
  try{ localStorage.setItem(SK.answers, JSON.stringify(answers)); }catch(e){}
}
function getSavedAnswers(){
  try{ return JSON.parse(localStorage.getItem(SK.answers)||'null'); }catch(e){ return null; }
}
function clearSaved(){
  try{
    localStorage.removeItem(SK.answers);
    localStorage.removeItem(SK.result);
    localStorage.removeItem(SK.step);
  }catch(e){}
}

/* ===== M3: 診断履歴機能 ===== */
function saveHistory(answers, ranking){
  try{
    let history = JSON.parse(localStorage.getItem('ccf_history')||'[]');
    const topCard = ranking[0];
    const entry = {
      timestamp: Date.now(),
      answers: answers,
      topCard: topCard.key,
      topScore: topCard.score,
      ranking: ranking.slice(0,3).map(r=>r.key)
    };
    history.unshift(entry);
    if(history.length > 10) history.pop();
    localStorage.setItem('ccf_history', JSON.stringify(history));
  }catch(e){}
}
function getHistory(){
  try{ return JSON.parse(localStorage.getItem('ccf_history')||'[]'); }catch(e){ return []; }
}
function clearHistory(){
  try{ localStorage.removeItem('ccf_history'); }catch(e){}
}
function deleteHistoryEntry(idx){
  try{
    let history = getHistory();
    history.splice(idx, 1);
    localStorage.setItem('ccf_history', JSON.stringify(history));
  }catch(e){}
}

/* ===== M10: 印刷・エクスポート機能 ===== */
function printResult(){
  window.print();
}
function exportCSV(){
  const ranking = getRanking().slice(0,3);
  const qLabels = [
    ['20代','30代','40代','50代以上'][answers.age??0],
    questions[1].options[answers.scene??0]?.label||'−',
    ['3万円未満','3〜5万円','5〜10万円','10万円以上'][answers.amount??0],
    questions[3].options[answers.priority??0]?.label||'−',
    questions[4].options[answers.lifestyle??0]?.label||'−'
  ];
  const rows = [
    ['順位','カード名','年会費','還元率','マッチ度','年間試算','URL'].join(','),
    ...ranking.map((r,i)=>{
      const c = cardDatabase[r.key];
      const maxScore = ranking[0].score || 1;
      const pct = Math.round(r.score / maxScore * 100);
      const annual = calcAnnualBonus ? calcAnnualBonus(answers, r.key) : 0;
      return [i+1,c.name,c.annualFee,c.baseRate,pct+'%',annual+'円',c.affiliate?.url||''].map(v=>`"${v}"`).join(',');
    })
  ];
  const csv = rows.join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `credit-card-finder-result-${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
}

/* ===== 診断状態 ===== */
let currentStep = 0;
let answers = {};

/* ===== アイコン SVG ===== */
function iconSVG(name){
  const icons = {
    user:`<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`,
    cart:`<svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>`,
    store:`<svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    plane:`<svg viewBox="0 0 24 24"><path d="M21 16l-8-4-9 4V4l9 4 8-4v12z"/></svg>`,
    dining:`<svg viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,
    globe:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>`,
    yen:`<svg viewBox="0 0 24 24"><path d="M12 2L6 12h12L12 2zm0 10v10M9 15h6M9 19h6"/></svg>`,
    target:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
    percent:`<svg viewBox="0 0 24 24"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>`,
    shield:`<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    gift:`<svg viewBox="0 0 24 24"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>`,
    heart:`<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
    piggy:`<svg viewBox="0 0 24 24"><path d="M19 11a7 7 0 01-7 7 7 7 0 01-7-7 7 7 0 017-7 7 7 0 017 7z"/><path d="M19 11h2M16 16l1.5 2M8 16l-1.5 2"/><circle cx="9" cy="10" r="1"/></svg>`,
    check:`<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
    crown:`<svg viewBox="0 0 24 24"><path d="M2 20h20M5 20l2-10 5 5 5-8 2 13"/></svg>`
  };
  return icons[name] || icons.user;
}

/* ===== ステッパー更新 ===== */
function updateStepper(step){
  const steps = document.querySelectorAll('.step');
  const progLine = document.querySelector('.prog-line');
  const totalSteps = questions.length;
  steps.forEach((el,i)=>{
    el.classList.remove('done','active');
    if(i < step) el.classList.add('done');
    else if(i === step) el.classList.add('active');
    const sc = el.querySelector('.sc');
    if(sc){
      if(i < step){
        sc.innerHTML = `<svg viewBox="0 0 24 24"><path stroke="#fff" stroke-width="3" fill="none" d="M5 13l4 4L19 7"/></svg>`;
      } else {
        sc.textContent = i+1;
      }
    }
  });
  if(progLine){
    const pct = step === 0 ? 0 : Math.min((step / (totalSteps)) * 86, 86);
    progLine.style.width = pct + '%';
  }
  const prog = document.getElementById('quiz-progress');
  if(prog) prog.querySelector('i').style.width = ((step+1)/totalSteps*100)+'%';
}

/* ===== 設問レンダリング ===== */
function renderQuestion(idx){
  const q = questions[idx];
  if(!q) return;

  const countEl = document.getElementById('q-count');
  if(countEl) countEl.textContent = `質問 ${idx+1} / ${questions.length}`;

  const titleEl = document.getElementById('q-title');
  if(titleEl) titleEl.textContent = q.title;

  const subEl = document.getElementById('q-sub');
  if(subEl) subEl.textContent = q.sub||'';

  const opts = document.getElementById('options');
  if(!opts) return;
  opts.className = 'options' + (q.cols===2 ? ' two' : '');
  opts.innerHTML = '';

  q.options.forEach((opt,i)=>{
    const btn = document.createElement('button');
    btn.className = 'opt' + (answers[q.id]===i ? ' selected' : '');
    btn.setAttribute('aria-pressed', answers[q.id]===i ? 'true':'false');
    btn.innerHTML = `
      <span class="oico">${iconSVG(opt.icon||q.icon)}</span>
      <span class="otext">${opt.label}<span class="osub">${opt.sub||''}</span></span>
      <span class="ock"><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></span>
    `;
    btn.addEventListener('click',()=>selectOption(idx, i, btn, opts));
    opts.appendChild(btn);
  });

  const prevBtn = document.getElementById('btn-prev');
  const nextBtn = document.getElementById('btn-next');
  if(prevBtn) prevBtn.disabled = idx === 0;
  if(nextBtn){
    nextBtn.disabled = answers[q.id] === undefined;
    nextBtn.textContent = idx === questions.length-1 ? '診断結果を見る →' : '次へ →';
  }

  updateStepper(idx);
}

function selectOption(qIdx, optIdx, btn, opts){
  opts.querySelectorAll('.opt').forEach(b=>{
    b.classList.remove('selected');
    b.setAttribute('aria-pressed','false');
  });
  btn.classList.add('selected');
  btn.setAttribute('aria-pressed','true');
  answers[questions[qIdx].id] = optIdx;
  saveAnswers(answers);

  const nextBtn = document.getElementById('btn-next');
  if(nextBtn) nextBtn.disabled = false;

  // auto advance after short delay if not last question
  if(qIdx < questions.length-1){
    setTimeout(()=>goNext(), 320);
  }
}

/* ===== ナビゲーション ===== */
function goNext(){
  if(answers[questions[currentStep].id] === undefined) return;
  if(currentStep < questions.length-1){
    currentStep++;
    renderQuestion(currentStep);
  } else {
    showResult();
  }
}

function goPrev(){
  if(currentStep > 0){
    currentStep--;
    renderQuestion(currentStep);
  }
}

/* ===== スコアリング ===== */
function calcScores(){
  const scored = {};
  cardKeys.forEach(key => { scored[key] = 0; });

  // Q1 age: 年齢制限フィルタ + ボーナス
  const ageBand = ['20s','30s','40s','50p'][answers.age ?? 0];
  cardKeys.forEach(key=>{
    const c = cardDatabase[key];
    if(c.ageLimit){
      const [mn,mx] = c.ageLimit;
      const ageMin = ageBand==='20s'?18:ageBand==='30s'?30:ageBand==='40s'?40:50;
      if(ageMin > mx){ scored[key] -= 999; return; } // 申し込み不可
    }
    // 20代: JCB W ボーナス
    if(ageBand==='20s' && key==='jcbW') scored[key] += 3;
  });

  // Q2 scene
  const sceneOpt = questions[1].options[answers.scene ?? 0];
  if(sceneOpt?.keys){
    sceneOpt.keys.forEach(k=>{
      cardKeys.forEach(key=>{
        scored[key] += (cardDatabase[key].scores[k]||0) * 2;
      });
    });
  }

  // Q3 amount: 月利用額
  const amtBand = ['low','mid','high','vhigh'][answers.amount ?? 0];
  if(amtBand==='vhigh'){
    // ゴールド系有利
    scored['smbcGold'] = (scored['smbcGold']||0) + 10;
  }
  if(amtBand==='low'){
    // 年会費無料を強く優遇
    cardKeys.forEach(key=>{
      if(cardDatabase[key].annualFeeNum===0) scored[key] += 4;
    });
  }

  // Q4 priority
  const prioOpt = questions[3].options[answers.priority ?? 0];
  if(prioOpt?.keys){
    prioOpt.keys.forEach(k=>{
      cardKeys.forEach(key=>{
        scored[key] += (cardDatabase[key].scores[k]||0) * 3;
      });
    });
  }

  // Q5 lifestyle
  const lifeOpt = questions[4].options[answers.lifestyle ?? 0];
  if(lifeOpt?.keys){
    lifeOpt.keys.forEach(k=>{
      cardKeys.forEach(key=>{
        scored[key] += (cardDatabase[key].scores[k]||0) * 2;
      });
    });
  }

  return scored;
}

function getRanking(){
  const scored = calcScores();
  return cardKeys
    .filter(k => scored[k] > -900)
    .map(k=>({ key:k, score:scored[k] }))
    .sort((a,b)=>b.score-a.score);
}

/* ===== 結果表示 ===== */
function showResult(){
  Loading.show();
  setTimeout(()=>{
    Loading.hide();
    document.getElementById('quiz-area').style.display='none';
    document.getElementById('stepper').style.display='none';

    const ranking = getRanking();
    renderResult(ranking);
    saveHistory(answers, ranking);

    document.getElementById('result-area').classList.add('show');
    updateStepper(questions.length);

    try{ localStorage.setItem(SK.result, JSON.stringify(ranking.slice(0,3).map(r=>r.key))); }catch(e){}
  }, 800);
}

function cardFaceGrad(c){
  return `linear-gradient(135deg,${c.face[0]},${c.face[1]})`;
}

function renderResult(ranking){
  const top3 = ranking.slice(0,3);
  const recGrid = document.getElementById('rec-grid');
  if(!recGrid) return;
  recGrid.innerHTML='';

  const rankLabels = ['🥇 第1位','🥈 第2位','🥉 第3位'];
  const applyClasses = ['rec1apply','rec2apply','rec3apply'];
  const rankClasses = ['rank1','rank2','rank3'];

  top3.forEach((r,i)=>{
    const c = cardDatabase[r.key];
    const maxScore = ranking[0].score || 1;
    const pct = Math.round(r.score / maxScore * 100);
    const div = document.createElement('div');
    div.className = `rec ${rankClasses[i]}`;
    div.innerHTML = `
      <span class="rank-badge">${rankLabels[i]}</span>
      <div class="score"><b>${pct}</b><span>マッチ度</span></div>
      <div class="rec-face" style="background:${cardFaceGrad(c)}">
        <div class="rf-chip"></div>
        <div class="rf-brand">${c.brandText}</div>
        <div class="rf-no">•••• •••• •••• 1234</div>
      </div>
      <h3>${c.name}</h3>
      <div class="tags">${c.features.map(f=>`<span class="tag free">${f}</span>`).join('')}</div>
      <p class="desc">${c.desc}</p>
      <div class="rec-specs">
        <div><span>年会費</span><b>${c.annualFee}</b></div>
        <div><span>還元率</span><b>${c.baseRate}</b></div>
        <div><span>ブランド</span><b>${c.brands[0]}</b></div>
      </div>
      <div class="apply" style="margin-top:auto">
        <button class="btn-apply ${applyClasses[i]}" onclick="applyCard('${r.key}')">申し込む（無料）</button>
        <a class="detail" href="${c.affiliate?.url||'#'}" target="_blank" rel="noopener">公式サイトを見る →</a>
      </div>
    `;
    recGrid.appendChild(div);
  });

  // 回答サマリー
  renderSummary();

  // 比較テーブル
  renderCompare(top3);

  // スポンサー
  renderSponsor(top3);

  // M4: チャート可視化
  setTimeout(()=>{
    renderMatchChart(ranking);
    renderRadarChart(ranking, answers);
  }, 300);

  // M6: 目標フィールド初期化
  const goal = getGoal();
  if(goal){
    const monthlyEl = document.getElementById('goal-monthly');
    const annualEl = document.getElementById('goal-annual');
    if(monthlyEl) monthlyEl.value = goal.monthlyAmount || '';
    if(annualEl) annualEl.value = goal.annualPoints || '';
  }
}

function renderSummary(){
  const list = document.getElementById('sum-list');
  if(!list) return;
  const labels = [
    { key:'age', label:'年齢層', icon:'user', vals:['20代','30代','40代','50代以上'] },
    { key:'scene', label:'利用シーン', icon:'cart', vals: questions[1].options.map(o=>o.label) },
    { key:'amount', label:'月間利用額', icon:'yen', vals:['3万円未満','3〜5万円','5〜10万円','10万円以上'] },
    { key:'priority', label:'重視ポイント', icon:'target', vals: questions[3].options.map(o=>o.label) },
    { key:'lifestyle', label:'ライフスタイル', icon:'heart', vals: questions[4].options.map(o=>o.label) }
  ];
  list.innerHTML = labels.map(l=>`
    <div class="sum-row">
      <span class="sk"><svg viewBox="0 0 24 24" fill="none" stroke="var(--violet-600)" stroke-width="1.8">${iconSVG(l.icon)}</svg>${l.label}</span>
      <span class="sv">${l.vals[answers[l.key]??0]||'−'}</span>
    </div>
  `).join('');
}

function renderCompare(top3){
  const tbl = document.getElementById('cmp-table');
  if(!tbl) return;
  tbl.innerHTML = `
    <thead><tr>
      <th>カード名</th><th>年会費</th><th>基本還元率</th><th>ブランド</th>
    </tr></thead>
    <tbody>
      ${top3.map(r=>{
        const c = cardDatabase[r.key];
        return `<tr>
          <td>${c.name}</td>
          <td>${c.annualFee}</td>
          <td class="cmp-rate">${c.baseRate}</td>
          <td>${c.brands.join('/')}</td>
        </tr>`;
      }).join('')}
    </tbody>
  `;
}

function renderSponsor(top3){
  const grid = document.getElementById('sp-cards');
  if(!grid) return;
  grid.innerHTML = top3.map(r=>{
    const c = cardDatabase[r.key];
    return `<div class="sp-item">
      <div class="sp-logo" style="background:${cardFaceGrad(c)};color:#fff;font-size:.56rem;font-weight:800">${c.name}</div>
      <span>${c.annualFee}</span>
    </div>`;
  }).join('');
}

/* ===== 申し込み ===== */
function applyCard(key){
  const c = cardDatabase[key];
  if(!c) return;
  const url = c.affiliate?.url || '#';
  window.open(url,'_blank','noopener');
  Toast.show(`${c.name}の申し込みページを開きました`, 'ok');
}

/* ===== シェア ===== */
function shareX(){
  const url = encodeURIComponent(location.href);
  const text = encodeURIComponent('クレジットカード診断で自分に最適な1枚が分かった！あなたも試してみて👇');
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`,'_blank','noopener');
}

function shareLine(){
  const url = encodeURIComponent(location.href);
  window.open(`https://social-plugins.line.me/lineit/share?url=${url}`,'_blank','noopener');
}

function copySummary(){
  const labels = [
    { key:'age', label:'年齢層', vals:['20代','30代','40代','50代以上'] },
    { key:'scene', label:'利用シーン', vals: questions[1].options.map(o=>o.label) },
    { key:'amount', label:'月間利用額', vals:['3万円未満','3〜5万円','5〜10万円','10万円以上'] },
    { key:'priority', label:'重視ポイント', vals: questions[3].options.map(o=>o.label) },
    { key:'lifestyle', label:'ライフスタイル', vals: questions[4].options.map(o=>o.label) }
  ];
  const text = '【クレジットカード診断の回答】\n' + labels.map(l=>{
    return `${l.label}: ${l.vals[answers[l.key]??0]||'−'}`;
  }).join('\n') + `\n${location.href}`;
  navigator.clipboard?.writeText(text).then(()=>{
    Toast.show('回答をコピーしました！', 'ok');
  }).catch(()=>{
    Toast.show('コピーに失敗しました', 'err');
  });
}

function copyResult(){
  const ranking = getRanking().slice(0,3);
  const text = `【クレカ診断結果】\n` + ranking.map((r,i)=>{
    const c = cardDatabase[r.key];
    return `${i+1}位: ${c.name}（${c.annualFee}・${c.baseRate}還元）`;
  }).join('\n') + `\n${location.href}`;
  navigator.clipboard?.writeText(text).then(()=>{
    Toast.show('結果をコピーしました！', 'ok');
  }).catch(()=>{
    Toast.show('コピーに失敗しました', 'err');
  });
}

function copyShareText(){
  copyResult();
}

/* ===== M3: 履歴モーダル機能 ===== */
function showHistoryModal(){
  const modal = document.getElementById('history-modal');
  const historyList = document.getElementById('history-list');
  if(!modal || !historyList) return;

  const history = getHistory();
  if(history.length === 0){
    historyList.innerHTML = '<p style="text-align:center;color:var(--muted);padding:2rem">まだ診断履歴がありません</p>';
  } else {
    historyList.innerHTML = history.map((entry, idx)=>{
      const date = new Date(entry.timestamp);
      const dateStr = date.toLocaleDateString('ja-JP', {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'});
      const card = cardDatabase[entry.topCard];
      const maxScore = entry.topScore || 1;
      const pct = Math.round((entry.topScore / maxScore) * 100);
      return `
        <div class="history-item">
          <div class="hi-head"><span class="hi-date">${dateStr}</span><button class="hi-del" onclick="deleteHistoryEntry(${idx}); showHistoryModal()">削除</button></div>
          <div class="hi-card">${card?.name||'不明'}</div>
          <div class="hi-score">マッチ度 ${pct}%</div>
        </div>
      `;
    }).join('');
  }
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeHistoryModal(){
  const modal = document.getElementById('history-modal');
  if(modal) modal.classList.remove('show');
  document.body.style.overflow = '';
}

/* ===== M6: 目標設定機能 ===== */
function saveGoal(monthlyAmount, annualPoints){
  try{
    localStorage.setItem('ccf_goal', JSON.stringify({monthlyAmount, annualPoints, timestamp: Date.now()}));
    Toast.show('目標を保存しました！', 'ok');
  }catch(e){}
}
function getGoal(){
  try{ return JSON.parse(localStorage.getItem('ccf_goal')||'null'); }catch(e){ return null; }
}
function clearGoal(){
  try{ localStorage.removeItem('ccf_goal'); }catch(e){}
}

/* ===== M4: チャート可視化（Chart.js使用）===== */
function renderMatchChart(ranking){
  const canvasEl = document.getElementById('match-chart');
  if(!canvasEl || typeof Chart === 'undefined') return;

  const top3 = ranking.slice(0,3);
  const maxScore = ranking[0].score || 1;
  const labels = top3.map(r=>cardDatabase[r.key]?.name||'');
  const data = top3.map(r=>Math.round((r.score/maxScore)*100));

  new Chart(canvasEl, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'マッチ度',
        data: data,
        backgroundColor: ['#7c3aed','#a78bfa','#ddd6fe'],
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      indexAxis: 'y',
      plugins: {legend: {display: false}},
      scales: {x: {max: 100, ticks: {callback: v=>v+'%'}}}
    }
  });
}
function renderRadarChart(ranking, answers){
  const canvasEl = document.getElementById('radar-chart');
  if(!canvasEl || typeof Chart === 'undefined') return;

  const topCard = cardDatabase[ranking[0].key];
  if(!topCard) return;

  const labels = ['年齢層向け','シーン別','月間額最適','重視ポイント','ライフスタイル'];
  const scores = [
    (topCard.scores?.age || 0) * 2,
    (topCard.scores?.retail || 0) * 2,
    (topCard.scores?.cashback || 0) * 2,
    (topCard.scores?.priority || 0) * 3,
    (topCard.scores?.lifestyle || 0) * 2
  ];

  new Chart(canvasEl, {
    type: 'radar',
    data: {
      labels: labels,
      datasets: [{
        label: topCard.name,
        data: scores,
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124,58,237,0.1)',
        borderWidth: 2,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      plugins: {legend: {display: true}},
      scales: {r: {beginAtZero: true, max: 10}}
    }
  });
}
function startApp(){
  const saved = getSavedAnswers();
  if(saved && Object.keys(saved).length > 0){
    answers = saved;
    currentStep = Math.min(Object.keys(saved).length, questions.length-1);
  } else {
    answers = {};
    currentStep = 0;
  }
  document.body.classList.add('app-mode');
  document.getElementById('quiz-area').style.display='block';
  document.getElementById('stepper').style.display='block';
  document.getElementById('result-area').classList.remove('show');
  renderQuestion(currentStep);
  window.scrollTo({top:0});
}

function backToLP(){
  if(document.querySelector('.lp-view')){
    document.body.classList.remove('app-mode');
    Resume.checkResume();
    window.scrollTo({top:0});
  } else {
    location.href = '/lp/credit-card-finder/';
  }
}

function retakeQuiz(){
  clearSaved();
  answers = {};
  currentStep = 0;
  document.getElementById('result-area').classList.remove('show');
  document.getElementById('quiz-area').style.display='block';
  document.getElementById('stepper').style.display='block';
  renderQuestion(0);
  window.scrollTo({top:0});
}

/* ===== ドロワー (モバイルメニュー) ===== */
function initDrawer(){
  const hamburger = document.getElementById('hamburger');
  const drawer = document.getElementById('drawer');
  const scrim = document.getElementById('scrim');
  const drawerClose = document.getElementById('drawer-close');
  if(!hamburger||!drawer) return;

  function openDrawer(){
    drawer.classList.add('open');
    scrim?.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded','true');
  }
  function closeDrawer(){
    drawer.classList.remove('open');
    scrim?.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded','false');
  }
  hamburger.addEventListener('click',()=>{
    drawer.classList.contains('open') ? closeDrawer() : openDrawer();
  });
  scrim?.addEventListener('click', closeDrawer);
  drawerClose?.addEventListener('click', closeDrawer);
}

/* ===== FAQ アコーディオン ===== */
function initFAQ(){
  document.querySelectorAll('.faq-item').forEach(item=>{
    item.addEventListener('toggle',()=>{
      // chevron rotation handled by CSS [open] selector
    });
  });
}

/* ===== ページローダー ===== */
function hidePageLoader(){
  const loader = document.getElementById('page-loader-cc');
  if(loader){
    setTimeout(()=>loader.classList.add('hide'), 200);
  }
}

/* ===== 他のカードを見る ===== */
function showOtherCards(){
  const ranking = getRanking();
  const others = ranking.slice(3,8);
  const container = document.getElementById('other-cards-list');
  if(!container) return;
  container.innerHTML = others.map(r=>{
    const c = cardDatabase[r.key];
    return `<div class="minicard" style="cursor:pointer" onclick="applyCard('${r.key}')">
      <div class="mc-face" style="background:${cardFaceGrad(c)}">
        <div class="mc-chip"></div>
        <div class="mc-brand" style="color:#fff">${c.brandText}</div>
      </div>
      <span>${c.name}</span>
    </div>`;
  }).join('');
  document.getElementById('other-cards-section').style.display='block';
}

/* ===== ミニカード (LP用) ===== */
function renderMiniCards(){
  const grid = document.getElementById('card-grid-lp');
  if(!grid) return;
  const show = cardKeys.slice(0,8);
  grid.innerHTML = show.map(key=>{
    const c = cardDatabase[key];
    return `<div class="minicard">
      <div class="mc-face" style="background:${cardFaceGrad(c)}">
        <div class="mc-chip"></div>
        <div class="mc-brand" style="color:${c.face[0]==='#eef0f3'||c.face[0]==='#c6c9ce'?'#333':'#fff'}">${c.brandText}</div>
      </div>
      <span>${c.name}</span>
    </div>`;
  }).join('');
}

/* ===== イベントバインド ===== */
function bindEvents(){
  // LP start buttons
  document.querySelectorAll('[data-action="start"]').forEach(btn=>{
    btn.addEventListener('click', startApp);
  });
  // quiz nav
  document.getElementById('btn-prev')?.addEventListener('click', goPrev);
  document.getElementById('btn-next')?.addEventListener('click', goNext);
  // app brand (back to LP)
  document.getElementById('app-brand')?.addEventListener('click', backToLP);
  document.getElementById('btn-back-lp')?.addEventListener('click', backToLP);
  // retake
  document.getElementById('btn-retake')?.addEventListener('click', retakeQuiz);
  // share
  document.getElementById('sh-x')?.addEventListener('click', shareX);
  document.getElementById('sh-line')?.addEventListener('click', shareLine);
  document.getElementById('sh-copy')?.addEventListener('click', copyResult);
  document.querySelector('.copy-btn')?.addEventListener('click', copySummary);
  document.getElementById('btn-copy-share')?.addEventListener('click', copyShareText);
  // others
  document.getElementById('btn-others')?.addEventListener('click', showOtherCards);
}

/* ===== DOMContentLoaded ===== */
document.addEventListener('DOMContentLoaded', ()=>{
  Toast.init();
  Loading.init();
  Resume.init();
  initDrawer();
  initFAQ();
  renderMiniCards();
  bindEvents();
  Resume.checkResume();
  hidePageLoader();

  // URL hash check: #start
  if(location.hash === '#start'){
    startApp();
  }
});
