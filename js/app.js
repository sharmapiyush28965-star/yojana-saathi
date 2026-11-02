/* Yojana Saathi — app flow: home -> interview -> results -> track */
let SCHEMES = [];
let profile = {};
let stepIdx = 0;

const STATES = [
  ["himachal_pradesh","हिमाचल प्रदेश","Himachal Pradesh"],
  ["punjab","पंजाब","Punjab"],["haryana","हरियाणा","Haryana"],
  ["uttar_pradesh","उत्तर प्रदेश","Uttar Pradesh"],["bihar","बिहार","Bihar"],
  ["madhya_pradesh","मध्य प्रदेश","Madhya Pradesh"],["rajasthan","राजस्थान","Rajasthan"],
  ["maharashtra","महाराष्ट्र","Maharashtra"],["gujarat","गुजरात","Gujarat"],
  ["west_bengal","पश्चिम बंगाल","West Bengal"],["odisha","ओडिशा","Odisha"],
  ["jharkhand","झारखंड","Jharkhand"],["chhattisgarh","छत्तीसगढ़","Chhattisgarh"],
  ["uttarakhand","उत्तराखंड","Uttarakhand"],["delhi","दिल्ली","Delhi"],
  ["karnataka","कर्नाटक","Karnataka"],["tamil_nadu","तमिलनाडु","Tamil Nadu"],
  ["telangana","तेलंगाना","Telangana"],["andhra_pradesh","आंध्र प्रदेश","Andhra Pradesh"],
  ["kerala","केरल","Kerala"],["assam","असम","Assam"]
];

const STEPS = [
  {field:'age', type:'number', q:'q_age'},
  {field:'gender', type:'options', q:'q_gender', opts:[['male','gender_male'],['female','gender_female'],['other','gender_other']]},
  {field:'state', type:'state', q:'q_state'},
  {field:'area', type:'options', q:'q_area', opts:[['rural','area_rural'],['urban','area_urban']]},
  {field:'occupation', type:'options', q:'q_occupation', opts:[['farmer','occ_farmer'],['labour','occ_labour'],['shop','occ_shop'],['job','occ_job'],['student','occ_student'],['home','occ_home'],['other','occ_other']]},
  {field:'annual_income', type:'options', q:'q_income', opts:[[75000,'inc_below1'],[200000,'inc_1to3'],[550000,'inc_3to8'],[1200000,'inc_above8']]},
  {field:'land_owned', type:'yesno', q:'q_land'},
  {field:'bpl', type:'yesno', q:'q_bpl'},
  {field:'caste_category', type:'options', q:'q_caste', opts:[['general','caste_gen'],['sc','caste_sc'],['st','caste_st'],['obc','caste_obc']]},
  {field:'income_tax_payer', type:'yesno', q:'q_tax'},
  {field:'govt_employee', type:'yesno', q:'q_govt'},
  {field:'disability', type:'yesno', q:'q_disability'},
  {field:'pregnant', type:'yesno', q:'q_pregnant', cond:p=>p.gender==='female'},
  {field:'girl_child_below_10', type:'yesno', q:'q_girlchild'},
  {field:'street_vendor', type:'yesno', q:'q_vendor'},
  {field:'artisan', type:'yesno', q:'q_artisan'},
];
function activeSteps(){ return STEPS.filter(s=>!s.cond || s.cond(profile)); }

async function loadSchemes(){
  const files = ['data/schemes_batch1.json','data/schemes_batch2.json'];
  SCHEMES = [];
  for(const f of files){
    try{ const r = await fetch(f); if(r.ok){ const j = await r.json(); SCHEMES = SCHEMES.concat(j); } }catch(e){}
  }
}

function render(){ 
  document.getElementById('appName').textContent = t('appName');
  document.getElementById('tagline').textContent = t('tagline');
  document.getElementById('disclaimer').textContent = t('disclaimer');
  document.getElementById('langHi').classList.toggle('active', LANG==='hi');
  document.getElementById('langEn').classList.toggle('active', LANG==='en');
}

function showHome(){
  stepIdx = 0; profile = {};
  const s = document.getElementById('screen');
  let plans = [];
  try{ plans = JSON.parse(localStorage.getItem('ys_plans')||'[]'); }catch(e){}
  s.innerHTML = `<div class="card" style="text-align:center">
    <div style="font-size:3rem">🏛️</div>
    <p style="margin:12px 0">${t('tagline')}</p>
    <button class="btn" onclick="showStep()">${t('start')}</button>
    ${plans.length?`<button class="btn secondary" onclick="showTrack()">${t('track_title')} (${plans.length})</button>`:''}
  </div>`;
}

function showTrack(){
  let plans = [];
  try{ plans = JSON.parse(localStorage.getItem('ys_plans')||'[]'); }catch(e){}
  const s = document.getElementById('screen');
  let h = `<div class="card"><div class="q">${t('track_title')}</div>`;
  if(!plans.length) h += `<p>—</p>`;
  for(const pl of plans.slice().reverse()){
    const d = new Date(pl.when);
    const names = pl.matched.map(id=>{ const sc = SCHEMES.find(x=>x.id===id); return sc ? (sc.name[LANG]||sc.name.en) : id; });
    h += `<div class="card" style="margin:8px 0"><b>₹${pl.total.toLocaleString('en-IN')}${t('per_year')}</b> — ${d.toLocaleDateString(LANG==='hi'?'hi-IN':'en-IN')}
      <ul class="docs">${names.map(n=>`<li>${n}</li>`).join('')}</ul></div>`;
  }
  h += `<button class="btn secondary" onclick="showHome()">${t('back')}</button></div>`;
  s.innerHTML = h;
}

function showStep(){
  const steps = activeSteps();
  if(stepIdx >= steps.length){ showResults(); return; }
  const st = steps[stepIdx];
  const s = document.getElementById('screen');
  const pct = Math.round(stepIdx/steps.length*100);
  let body = `<div class="progress"><div style="width:${pct}%"></div></div><div class="card"><div class="q">${t(st.q)}</div>`;
  if(st.type==='number'){
    body += `<input class="num-input" id="ans" type="number" min="0" max="120" inputmode="numeric" placeholder="--">`;
  } else if(st.type==='state'){
    body += `<select class="num-input" id="ans">` + STATES.map(x=>`<option value="${x[0]}">${LANG==='hi'?x[1]:x[2]}</option>`).join('') + `</select>`;
  } else if(st.type==='options'){
    body += st.opts.map(o=>`<button class="opt" data-v="${o[0]}" onclick="answerOpt(this)">${t(o[1])}</button>`).join('');
  } else if(st.type==='yesno'){
    body += `<button class="opt" data-v="1" onclick="answerOpt(this)">${t('yes')}</button><button class="opt" data-v="0" onclick="answerOpt(this)">${t('no')}</button>`;
  }
  body += `<div class="row">` + (stepIdx>0?`<button class="btn secondary" onclick="goBack()">${t('back')}</button>`:'') +
    (st.type==='number'||st.type==='state'?`<button class="btn" onclick="answerFree()">${stepIdx===steps.length-1?t('see_results'):t('next')}</button>`:'') + `</div></div>`;
  s.innerHTML = body;
  const inp = document.getElementById('ans');
  if(inp && st.type==='number') inp.focus();
}

function answerOpt(btn){
  const steps = activeSteps(); const st = steps[stepIdx];
  let v = btn.getAttribute('data-v');
  if(st.type==='yesno') v = (v==='1');
  if(st.field==='annual_income') v = Number(v);
  profile[st.field] = v;
  if(st.field==='girl_child_below_10' && v===true) profile.girl_child_age = 5;
  stepIdx++; showStep();
}
function answerFree(){
  const steps = activeSteps(); const st = steps[stepIdx];
  const inp = document.getElementById('ans');
  let v = inp.value;
  if(st.type==='number'){ v = parseInt(v,10); if(isNaN(v)||v<0||v>120) return; }
  profile[st.field] = v; stepIdx++; showStep();
}
function goBack(){ if(stepIdx>0){ stepIdx--; showStep(); } }

function showResults(){
  const {matched, nearMiss} = matchSchemes(SCHEMES, profile, LANG);
  const total = matched.reduce((a,m)=>a+(m.scheme.benefit_value||0),0);
  const s = document.getElementById('screen');
  let h = `<div class="card total"><div>${t('est_total')}</div><div class="amt">₹${total.toLocaleString('en-IN')}${t('per_year')}</div><div style="font-size:.85rem;opacity:.9">${matched.length} schemes</div></div>`;
  h += `<div class="card"><div class="q">${t('results_title')}</div>`;
  if(!matched.length) h += `<p>${t('results_none')}</p>`;
  h += `</div>`;
  for(const m of matched){
    const sc = m.scheme;
    h += `<div class="card scheme"><h3>${sc.name[LANG]||sc.name.en}</h3>
      <span class="benefit">${sc.benefit[LANG]||sc.benefit.en}</span>
      <div class="sec-label">${t('why_title')}</div><p>${m.reasons}</p>
      <div class="sec-label">${t('docs_title')}</div><ul class="docs">${(sc.documents[LANG]||sc.documents.en).map(d=>`<li>${d}</li>`).join('')}</ul>
      <div class="sec-label">${t('apply_title')}</div><p>${sc.apply[LANG]||sc.apply.en}</p>
      <p style="margin-top:6px"><a href="${sc.source_url}" target="_blank" rel="noopener">🔗 ${sc.source_url.replace('https://','').split('/')[0]}</a></p>
    </div>`;
  }
  if(nearMiss.length){
    h += `<div class="card"><div class="q">${t('near_title')}</div>`;
    for(const n of nearMiss.slice(0,5)){
      h += `<div class="card scheme near" style="margin:8px 0"><h3>${n.scheme.name[LANG]||n.scheme.name.en}<span class="badge">${t('near_title')}</span></h3>
      <p>${t('near_explain')}</p><p><b>${n.explain}</b></p></div>`;
    }
    h += `</div>`;
  }
  h += `<button class="btn" onclick="savePlan(${matched.length})">${t('save_plan')}</button>
        <button class="btn secondary" onclick="showHome()">${t('new_profile')}</button>`;
  s.innerHTML = h;
  window._lastResult = {profile, matched: matched.map(m=>m.scheme.id), total, when: Date.now()};
}

function savePlan(){
  try{
    const plans = JSON.parse(localStorage.getItem('ys_plans')||'[]');
    plans.push(window._lastResult);
    localStorage.setItem('ys_plans', JSON.stringify(plans));
    alert(LANG==='hi' ? 'योजना सेव हो गई!' : 'Plan saved!');
  }catch(e){}
}

document.getElementById('langHi').onclick = ()=>{ setLang('hi'); render(); showHome(); };
document.getElementById('langEn').onclick = ()=>{ setLang('en'); render(); showHome(); };

(async function init(){ render(); await loadSchemes(); showHome(); })();
