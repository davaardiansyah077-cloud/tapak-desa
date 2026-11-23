/* TAPAK DESA IPED/IPUK 0.1 — client-side prototype. Data remains in this browser. */
(() => {
  'use strict';
  const KEY = 'tapak-desa-iped-v1';
  const sectors = [
    ['pertanian','Pertanian dan perkebunan'],['peternakan','Peternakan'],['perikanan','Perikanan dan kelautan'],
    ['industri','Industri pengolahan dan UMKM'],['perdagangan','Perdagangan dan jasa'],['pariwisata','Pariwisata dan ekonomi kreatif']
  ];
  const ipedDims = ['Sumber daya','Pasar','Produktivitas & nilai tambah','Infrastruktur & kelembagaan','Keberlanjutan'];
  const ipukDims = ['Kesesuaian potensi lokal','Permintaan pasar','Kelayakan finansial','Kesiapan operasional','Nilai tambah ekonomi','Keberlanjutan & risiko'];
  const templates = {
    pertanian:['Agregasi hasil panen','Penyediaan sarana produksi pertanian','Pengeringan dan penyimpanan hasil','Pengolahan hasil pertanian'],
    peternakan:['Pengadaan pakan ternak','Pemasaran hasil ternak','Pengolahan hasil peternakan'],
    perikanan:['Distribusi hasil perikanan','Penyimpanan dingin','Pengolahan hasil perikanan'],
    industri:['Pengadaan bahan baku UMKM','Pengemasan dan pemasaran produk','Rumah produksi bersama'],
    perdagangan:['Pengadaan kebutuhan pokok','Distribusi barang kebutuhan warga','Perdagangan kolektif produk lokal'],
    pariwisata:['Pemasaran produk wisata lokal','Penyediaan layanan pendukung wisata','Pusat oleh-oleh dan produk kreatif']
  };
  const defaultData = { version:'0.1-demo', ahpIPED:{}, ahpIPUK:{}, sectorData:{}, opportunities:[] };
  let data = load();
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt = n => Number(n).toLocaleString('id-ID',{maximumFractionDigits:1});
  const load = () => { try { return {...structuredClone(defaultData),...JSON.parse(localStorage.getItem(KEY)||'{}')}; } catch { return structuredClone(defaultData); } };
  const save = () => { localStorage.setItem(KEY,JSON.stringify(data)); const el=$('ipedSaveState'); if(el)el.textContent='Tersimpan di perangkat ini'; };
  const pairs = n => { const out=[]; for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)out.push([i,j]); return out; };
  const matrixFrom = (n, vals={}) => { const m=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?1:1)); for(const [key,v] of Object.entries(vals)){const [i,j]=key.split('-').map(Number);m[i][j]=Number(v);m[j][i]=1/Number(v);} return m; };
  function ahp(matrix){
    const n=matrix.length; const gm=matrix.map(r=>Math.exp(r.reduce((s,v)=>s+Math.log(v),0)/n)); const total=gm.reduce((a,b)=>a+b,0); const w=gm.map(x=>x/total);
    const aw=matrix.map(r=>r.reduce((s,v,j)=>s+v*w[j],0)); const lambda=aw.reduce((s,v,i)=>s+v/w[i],0)/n; const ri={1:0,2:0,3:.58,4:.90,5:1.12,6:1.24,7:1.32,8:1.41,9:1.45,10:1.49}[n]; const ci=n<=2?0:(lambda-n)/(n-1); const cr=ri?ci/ri:0;
    return {weights:w,lambda,ci,cr,consistent:cr<=.1};
  }
  function renderAHP(containerId, key, labels){
    const el=$(containerId); if(!el)return; const saved=data[key]||{}; const opts=[1,2,3,4,5,6,7,8,9];
    el.innerHTML=pairs(labels.length).map(([i,j])=>`<label class="iped-pair"><span>${esc(labels[i])} <small>dibanding</small> ${esc(labels[j])}</span><select data-ahp="${key}" data-pair="${i}-${j}">${opts.map(v=>`<option value="${v}" ${Number(saved[`${i}-${j}`]||1)===v?'selected':''}>${v===1?'Sama penting':v+' — '+(v<=3?'sedikit hingga moderat':v<=5?'lebih penting':'sangat hingga ekstrem')}</option>`).join('')}</select></label>`).join('');
  }
  function getWeights(key, labels){ return ahp(matrixFrom(labels.length,data[key])).weights; }
  function renderSectorForm(){
    const root=$('ipedSectorInputs'); if(!root)return;
    root.innerHTML=sectors.map(([id,name])=>{const v=data.sectorData[id]||{};return `<details class="iped-sector" ${v.open?'open':''}><summary><span>${name}</span><span class="iped-summary-score">${v.score!=null?fmt(v.score)+'/100':'Belum dinilai'}</span></summary><div class="iped-score-grid">${ipedDims.map((d,i)=>`<label>${d}<input type="number" min="0" max="100" step="1" data-sector="${id}" data-dim="${i}" value="${v.values?.[i]??''}" placeholder="0–100"/><small>Masukkan skor berdasarkan rubrik dan bukti lapangan.</small></label>`).join('')}<label class="iped-full">Sumber / bukti dan periode<input data-source="${id}" value="${esc(v.source||'')}" placeholder="Contoh: monografi desa, survei kelompok tani, 2026"/></label></div></details>`;}).join('');
  }
  function sectorResults(){
    const w=getWeights('ahpIPED',ipedDims); return sectors.map(([id,name])=>{const vals=data.sectorData[id]?.values||[];const present=vals.filter(v=>v!==''&&v!=null&&Number.isFinite(Number(v)));const coverage=present.length/ipedDims.length*100;const score=coverage?vals.reduce((s,v,i)=>s+(v!==''&&v!=null?Number(v)*w[i]:0),0)/(present.reduce((s,v)=>s+1,0)===5?1:present.reduce((s,v)=>s+w[vals.indexOf(v)]||0,0)):null;
      // Renormalize using the weights belonging to observed dimensions.
      let denom=0,num=0; vals.forEach((v,i)=>{if(v!==''&&v!=null&&Number.isFinite(Number(v))){num+=Number(v)*w[i];denom+=w[i];}}); const result=denom?num/denom:null;
      return {id,name,score:result==null?null:Number(result.toFixed(2)),coverage};});
  }
  function renderIPEDResults(){
    const results=sectorResults(); const root=$('ipedSectorResults'); if(!root)return;
    root.innerHTML=results.sort((a,b)=>(b.score??-1)-(a.score??-1)).map(x=>`<div class="iped-result-row"><div><strong>${esc(x.name)}</strong><small>${x.coverage.toFixed(0)}% indikator terisi</small></div><div class="iped-bar"><span style="width:${x.score??0}%"></span></div><b>${x.score==null?'—':fmt(x.score)}</b></div>`).join('');
    const scored=results.filter(x=>x.score!=null); const complete=results.filter(x=>x.coverage===100).length; $('ipedOverall').textContent=scored.length?fmt(scored.reduce((s,x)=>s+x.score,0)/scored.length):'—'; $('ipedSectorCount').textContent=`${scored.length} dari ${sectors.length} sektor dinilai`;
    $('ipedDataQuality').textContent=`${complete} sektor terisi lengkap; skor parsial dihitung ulang berdasarkan bobot indikator yang tersedia. Hasil belum dapat dianggap final tanpa verifikasi bukti.`;
  }
  function renderIPUKAHP(){renderAHP('ahpIPUKPairs','ahpIPUK',ipukDims);}
  function addOpportunity(sectorId, name){
    if(!sectorId||!name.trim())return; data.opportunities.push({id:'opp_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6),sectorId,name:name.trim(),scores:Array(6).fill(''),gates:[false,false,false,false,false],evidence:''}); save(); renderOpportunities();
  }
  function renderOpportunities(){
    const root=$('ipedOpportunities');if(!root)return; const weights=getWeights('ahpIPUK',ipukDims);
    $('ipedOppCount').textContent=String(data.opportunities.length);
    root.innerHTML=data.opportunities.length?data.opportunities.map(o=>{const vals=o.scores||[];let denom=0,num=0;vals.forEach((v,i)=>{if(v!==''&&v!=null&&Number.isFinite(Number(v))){num+=Number(v)*weights[i];denom+=weights[i];}});const coverage=denom*100;const score=denom?num/denom:null;const failed=(o.gates||[]).filter(x=>!x).length;const status=coverage<80?'Data belum cukup':failed?'Perlu perbaikan':score>=75?'Prioritas pengembangan':score>=60?'Kajian/persiapan':'Prioritas rendah';return `<article class="iped-opportunity" data-opp="${o.id}"><div class="iped-opp-head"><div><span class="eyebrow green">${esc(sectors.find(s=>s[0]===o.sectorId)?.[1]||'Sektor')}</span><h3>${esc(o.name)}</h3></div><div class="iped-opp-score"><strong>${score==null?'—':fmt(score)}</strong><small>IPUK / 100</small></div></div><div class="iped-score-grid">${ipukDims.map((d,i)=>`<label>${d}<input type="number" min="0" max="100" step="1" data-opp-score="${o.id}" data-dim="${i}" value="${vals[i]??''}" placeholder="0–100"/></label>`).join('')}</div><div class="iped-gates"><strong>Gerbang kritis (centang jika sudah terpenuhi dan ada bukti)</strong>${['Permintaan pasar tervalidasi','Pemasok / input tersedia','Modal dan arus kas teridentifikasi','Pengelola dan SOP tersedia','Legalitas dan kewenangan diperiksa'].map((g,i)=>`<label><input type="checkbox" data-gate="${o.id}" data-index="${i}" ${(o.gates||[])[i]?'checked':''}/> ${g}</label>`).join('')}</div><label class="iped-evidence">Bukti / catatan penilaian<input data-opp-evidence="${o.id}" value="${esc(o.evidence||'')}" placeholder="Tautan dokumen, hasil wawancara, calon pembeli, asumsi finansial..."/></label><div class="iped-opp-foot"><span class="iped-status ${status==='Prioritas pengembangan'?'good':status==='Data belum cukup'?'warn':'neutral'}">${status}</span><button type="button" class="table-action" data-remove-opp="${o.id}">Hapus alternatif</button></div></article>`;}).join(''):'<p class="iped-empty">Belum ada alternatif usaha. Tambahkan alternatif berdasarkan sektor yang sudah dipetakan.</p>';
  }
  function renderAll(){renderAHP('ahpIPEDPairs','ahpIPED',ipedDims);renderIPUKAHP();renderSectorForm();renderIPEDResults();renderOpportunities();}
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-remove-opp]')){const id=e.target.closest('[data-remove-opp]').dataset.removeOpp;data.opportunities=data.opportunities.filter(x=>x.id!==id);save();renderOpportunities();}
  });
  document.addEventListener('change',e=>{
    const t=e.target;
    if(t.dataset.ahp){data[t.dataset.ahp] ||= {};data[t.dataset.ahp][t.dataset.pair]=Number(t.value);save();renderIPEDResults();renderOpportunities();}
    if(t.dataset.sector){const id=t.dataset.sector;data.sectorData[id] ||= {values:[]};data.sectorData[id].values ||= [];data.sectorData[id].values[Number(t.dataset.dim)]=t.value===''?'':Number(t.value);save();renderIPEDResults();}
    if(t.dataset.source){const id=t.dataset.source;data.sectorData[id] ||= {values:[]};data.sectorData[id].source=t.value;save();}
    if(t.dataset.oppScore){const o=data.opportunities.find(x=>x.id===t.dataset.oppScore);if(o){o.scores[Number(t.dataset.dim)]=t.value===''?'':Number(t.value);save();renderOpportunities();}}
    if(t.dataset.gate){const o=data.opportunities.find(x=>x.id===t.dataset.gate);if(o){o.gates[Number(t.dataset.index)]=t.checked;save();renderOpportunities();}}
    if(t.dataset.oppEvidence){const o=data.opportunities.find(x=>x.id===t.dataset.oppEvidence);if(o){o.evidence=t.value;save();}}
  });
  $('ipedOpportunitySector')?.addEventListener('change',e=>{const dl=$('ipedBusinessSuggestions');if(dl)dl.innerHTML=(templates[e.target.value]||[]).map(x=>`<option value="${esc(x)}">`).join('');});
  $('ipedAddOpportunity')?.addEventListener('click',()=>{const sector=$('ipedOpportunitySector').value;const name=$('ipedOpportunityName').value;addOpportunity(sector,name);$('ipedOpportunityName').value='';});
  $('ipedRecalculate')?.addEventListener('click',()=>{const a=ahp(matrixFrom(ipedDims.length,data.ahpIPED));const b=ahp(matrixFrom(ipukDims.length,data.ahpIPUK));$('ipedAHPStatus').innerHTML=`IPED: CR ${(a.cr*100).toFixed(2)}% — ${a.consistent?'konsisten':'perlu ditinjau'}<br>IPUK: CR ${(b.cr*100).toFixed(2)}% — ${b.consistent?'konsisten':'perlu ditinjau'}`;renderIPEDResults();renderOpportunities();});
  $('ipedExport')?.addEventListener('click',()=>{const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),methodology:'Hybrid AHP–Weighted Scoring',data},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='hasil-iped-tapak-desa.json';a.click();URL.revokeObjectURL(a.href);});
  $('ipedImport')?.addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{const p=JSON.parse(await f.text());const incoming=p.data||p;if(!incoming.sectorData||!Array.isArray(incoming.opportunities))throw Error('format');data={...structuredClone(defaultData),...incoming};save();renderAll();alert('Data IPED berhasil diimpor.');}catch{alert('File IPED tidak sesuai format.');}e.target.value='';});
  const nav=document.querySelector('.nav-menu'); if(nav&&!document.querySelector('[data-page="iped"]')){const btn=document.createElement('button');btn.className='nav-link';btn.dataset.page='iped';btn.innerHTML='<span class="nav-icon">◈</span> Penilaian IPED';const anchor=nav.querySelector('[data-page="potensi"]');anchor?.after(btn);btn.addEventListener('click',()=>{document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id==='page-iped'));document.querySelectorAll('.nav-link').forEach(n=>n.classList.toggle('active',n===btn));$('pageCrumb').textContent='Penilaian IPED';document.getElementById('sidebar').classList.remove('open');document.getElementById('mobileOverlay').classList.remove('show');window.scrollTo({top:0,behavior:'smooth'});});}
  renderAll();
})();
