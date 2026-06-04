/* ===== 珈琲ノート shared interactions ===== */
(function(){
  // ---- mobile drawer ----
  const overlay=document.getElementById('overlay');
  const menu=document.getElementById('mobileMenu');
  function openMenu(){menu&&menu.classList.add('open');overlay&&overlay.classList.add('open');document.body.style.overflow='hidden';}
  function closeMenu(){menu&&menu.classList.remove('open');overlay&&overlay.classList.remove('open');document.body.style.overflow='';}
  window.toggleMobileMenu=()=>menu&&menu.classList.contains('open')?closeMenu():openMenu();
  const burger=document.getElementById('burger');
  burger&&burger.addEventListener('click',openMenu);
  document.getElementById('drawerClose')&&document.getElementById('drawerClose').addEventListener('click',closeMenu);
  overlay&&overlay.addEventListener('click',closeMenu);
  menu&&menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));

  // ---- language toggle (JA/EN) ----
  window.toggleLanguage=function(lang){
    const root=document.documentElement;
    root.classList.toggle('lang-en',lang==='en');
    root.classList.toggle('lang-ja',lang!=='en');
    document.querySelectorAll('[data-lang-btn]').forEach(b=>{
      b.classList.toggle('active',b.getAttribute('data-lang-btn')===lang);
    });
    try{localStorage.setItem('cn_lang',lang);}catch(e){}
  };

  // ---- theme toggle (light/dark/auto) ----
  window.setTheme=function(mode){
    const root=document.documentElement;
    let applied=mode;
    if(mode==='auto'){
      applied=window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';
    }
    root.setAttribute('data-theme',applied);
    document.querySelectorAll('[data-theme-btn]').forEach(b=>{
      b.classList.toggle('active',b.getAttribute('data-theme-btn')===mode);
    });
    try{localStorage.setItem('cn_theme',mode);}catch(e){}
  };

  // ---- welcome guide collapse ----
  window.toggleWelcomeGuide=function(){
    const body=document.getElementById('welcomeGuideBody');
    if(!body)return;
    const open=body.style.display!=='none';
    body.style.display=open?'none':'';
    const ind=document.getElementById('welcomeGuideToggle');
    if(ind)ind.textContent=open?'＋ ガイドを開く':'－ ガイドを閉じる';
  };

  // ---- restore prefs ----
  document.addEventListener('DOMContentLoaded',function(){
    let t='auto';try{t=localStorage.getItem('cn_theme')||'auto';}catch(e){}
    if(window.setTheme)window.setTheme(t);
    let l='ja';try{l=localStorage.getItem('cn_lang')||'ja';}catch(e){}
    if(window.toggleLanguage)window.toggleLanguage(l);
    initQuickRecord();
    initStars();
  });

  // ---- localStorage helpers (core record store) ----
  window.lsGet=function(k,def){try{const v=localStorage.getItem(k);return v==null?def:JSON.parse(v);}catch(e){return def;}};
  window.lsSet=function(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}};
  window.lsGenId=function(){return 'id_'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);};

  // ---- rating stars ----
  let rating=0;
  function initStars(){
    const box=document.getElementById('rateStars');
    if(!box)return;
    const stars=[...box.querySelectorAll('[data-star]')];
    function paint(n){stars.forEach((s,i)=>s.classList.toggle('on',i<n));}
    stars.forEach((s,i)=>{
      s.addEventListener('mouseenter',()=>paint(i+1));
      s.addEventListener('click',()=>{rating=i+1;paint(rating);});
    });
    box.addEventListener('mouseleave',()=>paint(rating));
  }

  // ---- method segmented control ----
  function initQuickRecord(){
    const methods=document.querySelectorAll('[data-method]');
    let method='ハンドドリップ';
    methods.forEach(m=>m.addEventListener('click',()=>{
      methods.forEach(x=>x.classList.remove('active'));
      m.classList.add('active');method=m.getAttribute('data-method');
    }));
    const form=document.getElementById('quickForm');
    if(!form)return;
    const recordBtn=document.getElementById('recordBtn');
    const resetBtn=document.getElementById('resetBtn');
    recordBtn&&recordBtn.addEventListener('click',function(){
      const bean=document.getElementById('beanSelect');
      const name=bean&&bean.value?bean.options[bean.selectedIndex].text:'名称未設定の一杯';
      const g=(document.getElementById('inGram')||{}).value||'15.0';
      const ml=(document.getElementById('inMl')||{}).value||'240';
      const temp=(document.getElementById('inTemp')||{}).value||'92';
      const list=window.lsGet('cn_records',[]);
      list.unshift({id:window.lsGenId(),name,method,g,ml,temp,rating:rating||4.0,date:new Date().toISOString().slice(0,10)});
      window.lsSet('cn_records',list.slice(0,30));
      renderRecent();
      recordBtn.textContent='記録しました ✓';
      setTimeout(()=>recordBtn.textContent='記録する',1400);
    });
    resetBtn&&resetBtn.addEventListener('click',function(){
      form.querySelectorAll('input,textarea,select').forEach(el=>{if(el.type!=='button')el.value=el.defaultValue||'';});
      rating=0;const box=document.getElementById('rateStars');box&&box.querySelectorAll('.on').forEach(s=>s.classList.remove('on'));
    });
    renderRecent();
  }
  function renderRecent(){
    const ul=document.getElementById('recentList');
    if(!ul)return;
    const list=window.lsGet('cn_records',[]);
    if(!list.length)return; // keep seeded markup if empty
    ul.innerHTML=list.slice(0,5).map(r=>`
      <div class="rec-row">
        <div class="rec-th"><img src="uploads/lp_assets_transparent_png_11/01-06.png" alt=""></div>
        <div class="rec-meta"><div class="rec-name">${r.name}</div>
          <div class="rec-sub">${r.method} | ${r.g}g / ${r.ml}ml | ${r.temp}℃</div></div>
        <div class="rec-score"><b>★ ${Number(r.rating).toFixed(1)}</b><small>${r.date}</small></div>
      </div>`).join('');
  }
})();
