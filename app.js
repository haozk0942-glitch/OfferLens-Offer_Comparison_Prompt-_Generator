import {buildExplorationPrompt} from './exploration.js';
import { dimensions, evaluate } from './engine.js';
import { defaultProfile, newOffer, fresh, normalizeDraft, MAX_OFFERS } from './model.js';
import { profileView, offersView, promptView } from './views.js';
import {statusLabel} from './schema.js';
const promptOptions = { includeIdentity: false, includeSchool: false, includeBazi: false };
const STORE = 'offerlens.v1';
let state = fresh(), page = 'home', notice = '';
try { const saved = JSON.parse(localStorage.getItem(STORE)); if (saved?.profile?.weights && Array.isArray(saved.offers) && saved.offers.length >= 2 && saved.offers.length <= MAX_OFFERS) state = normalizeDraft(saved); } catch { notice = '未能读取本地记录，将使用新草稿。'; }
const app = document.querySelector('#app');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const yuan = n => n == null ? '待补充' : '¥' + Math.round(n).toLocaleString('zh-CN');
function save() { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch { notice = '浏览器未能保存，请保持页面打开并导出备份。'; const status = document.querySelector('#save-status'); if (status) status.textContent = notice; } }
function field(label, key, value, { type = 'text', hint = '', min = '', max = '', placeholder = '', scope = 'profile', id = '' } = {}) {
  const attr = `data-scope="${scope}" data-key="${key}" ${id ? `data-id="${id}"` : ''}`;
  return `<label class="field"><span>${label}</span><input ${attr} type="${type}" value="${esc(value)}" ${min !== '' ? `min="${min}"` : ''} ${max !== '' ? `max="${max}"` : ''} ${type === 'number' ? 'step="any"' : ''} placeholder="${placeholder}">${hint ? `<small>${hint}</small>` : ''}</label>`;
}
function select(label, key, value, options, scope = 'profile', id = '') { return `<label class="field"><span>${label}</span><select data-scope="${scope}" data-key="${key}" data-id="${id}">${options.map(([v, text]) => `<option value="${esc(v)}" ${String(value) === String(v) ? 'selected' : ''}>${text}</option>`).join('')}</select></label>`; }
function shell(content) {
  app.innerHTML = `<header class="header"><button class="brand" data-page="home"><img class="brand-icon" src="logo.svg" alt="" width="36" height="36"> OfferLens <span class="brand-sub">知己择业</span></button><div class="header-right"><span class="local-badge">● 无需登录 · 本地保存</span><button class="text-btn" data-action="export">导出草稿</button></div></header><main>${notice ? `<div class="notice" role="status">${esc(notice)}</div>` : ''}${page !== 'home' ? `<nav class="steps" aria-label="填写步骤">${[['profile','01','自我画像'],['offers','02','Offer 信息'],['results','03','本地比较'],['prompt','04','生成 Prompt']].map(([p,n,t])=>`<button data-page="${p}" class="${p === page ? 'active' : ''}" ${p === page ? 'aria-current="step"' : ''}><span>${n}</span>${t}</button>`).join('')}</nav>${state.example ? '<div class="example-note">你正在体验虚构案例，所有条件均为演示数据。<button data-action="fresh">开始我的比较 →</button></div>' : ''}` : ''}${content}</main><footer><span>OfferLens · 先认识自己，再看清选择</span><span id="save-status">数据保存在当前浏览器，请勿在共享设备保留敏感信息。</span><button data-action="clear">清空本地数据</button></footer>`;
}
function home() { return `<section class="hero"><div class="hero-copy"><div class="eyebrow">为第一份，也为下一份工作</div><h1>好的 offer，<br>先要适合<span>你</span></h1><p class="hero-intro">薪资之外，还有你想成为的人。<br>从经历、偏好与生活出发，把纠结变成清晰的取舍。</p><div class="hero-actions"><button class="primary" data-page="profile">开始认识自己 <span>↗</span></button><button class="secondary" data-action="example">先看一个例子 →</button></div><p class="micro">无需注册 · 随时修改 · 不上传你的填写内容</p></div><div class="hero-visual"><div class="visual-top"><span>一次选择，几种可能</span><span>↗</span></div><div class="orbit"><div class="orbit-center">你<span>每个选择的中心</span></div><span class="orbit-tag t1">职业成长</span><span class="orbit-tag t2">生活节奏</span><span class="orbit-tag t3">真实收入</span><span class="orbit-tag t4">工作热爱</span></div><div class="visual-bottom"><span class="tiny-star">✳</span><p>没有统一的最优解，<br><strong>有属于你的优先级。</strong></p></div></div></section><section class="home-bottom"><div class="section-title"><span class="eyebrow">HOW IT WORKS</span><h2>从“哪个更好”，到“哪个更适合我”</h2></div><div class="feature-grid">${[['01','把自己放进选择里','梳理目标、经历与不可妥协的条件。'],['02','让机会回到同一把尺子','分清保证收入、实际工作和待确认信息。'],['03','看懂结果背后的取舍','了解为什么领先，以及什么条件会改变选择。']].map(([n,t,d])=>`<article><span class="feature-number">${n}</span><h3>${t}</h3><p>${d}</p></article>`).join('')}</div></section>`; }
function profile() { return profileView(state); }
function offers() { return offersView(state); }
function results() {
  const rows = evaluate(state.profile,state.offers);
  const complete = rows.every(r=>r.coverage > 99.99 && r.eligible);
  const sorted = [...rows].sort((a,b)=>(b.score??-1)-(a.score??-1));
  const gap = complete ? sorted[0].score-sorted[1].score : null;
  const headline = !complete ? '先看取舍，再补齐关键事实' : gap < 2 ? '这几份机会，目前难分高下' : `${esc(sorted[0].offer.name || '未命名机会')} 在当前偏好下领先`;
  return `<div class="page-intro"><p>本地规则只供参考；你也可以生成 Prompt，交给自己使用的 AI 继续分析</p><button class="secondary" data-page="prompt">生成 AI 分析 Prompt →</button></div><section class="summary"><span class="summary-symbol">✳</span><div><h2>${headline}</h2><p>${complete?'这是当前权重下的比较结果。下方调整偏好，观察你的选择是否变化。':'存在底线冲突、待核实底线或缺失评分，暂不生成确定推荐。已知项得分仅供参考。'}</p></div></section><div class="result-grid">${rows.map(r=>`<section class="panel result-card"><div class="card-top"><span class="offer-index">${esc(r.offer.city||'城市待确认')}</span><span class="status ${r.gates.length?'bad':''}">${r.gates.length?'底线冲突':r.eligible?'未发现底线冲突':'底线待确认'}</span></div><h2>${esc(r.offer.name||'未命名机会')}</h2><p class="muted">${esc(r.offer.role||'岗位待补充')} · ${esc(statusLabel(r.offer.opportunityStatus))}</p><div class="score">${r.score==null?'—':Math.round(r.score)}<span>${r.coverage>99.99?' / 100 匹配分':' / 100 已知项参考分'}</span></div><p class="micro">评分信息覆盖 ${Math.round(r.coverage)}% 权重${r.coverage<99.99?` · 未知项按 0—100 变化时，总分范围 ${Math.floor(r.low)}—${Math.ceil(r.high)}`:''}</p><div class="cash-line"><span>税前年保证收入</span><strong>${yuan(r.annual)}</strong></div><div class="cash-line"><span>预计浮动奖金（未计分）</span><strong>${yuan(r.offer.bonus===''?null:Number(r.offer.bonus))}</strong></div><div class="bars">${r.contributions.map(c=>`<div class="bar-row"><div><span>${c.label}</span><small>权重 ${Math.round(c.weight*100)}%</small><b>${c.utility==null?'未知':Math.round(c.utility)}</b></div><div class="bar-track"><span style="width:${c.utility??0}%"></span></div></div>`).join('')}</div>${r.gates.length?`<div class="gate-list">${r.gates.map(g=>`<p>! ${esc(g)}</p>`).join('')}</div>`:''}<details><summary>查看计算与依据</summary><p>经济得分 = 保证年薪 ÷ 12 ÷ 满意月收入 × 100，最高 100。其余由你给出的 1—5 分映射为 0—100。</p><p>已知项参考分按已知项权重重新归一；信息覆盖不足时，不用于确定推荐。</p><p>信息来源：${esc(r.offer.source)}。${esc(r.offer.tasks||'尚未记录工作内容。')}</p></details></section>`).join('')}</div><section class="panel"><h2>下一步，问清楚这些事</h2><div class="checklist">${rows.map(r=>`<div><h3>${esc(r.offer.name||'未命名机会')}</h3>${[...r.unknown,...(r.offer.source==='待核实'?['向 HR 或未来同事核实岗位条件与信息来源']:[])].length?[...r.unknown,...(r.offer.source==='待核实'?['向 HR 或未来同事核实岗位条件与信息来源']:[])].map(t=>`<p>□ ${esc(t)}</p>`).join(''):'<p>核实奖金条件、实际工作内容与日常节奏是否和预期一致。</p>'}</div>`).join('')}</div></section><section class="panel"><h2>如果优先级变了呢？</h2><p class="muted">拖动后实时重算。变化会保存为你的最新偏好。</p><div class="scenario-weights">${dimensions.map(([k,t])=>`<label class="weight"><span>${t}<b>${state.profile.weights[k]}</b></span><input aria-label="${t}重要程度" type="range" min="1" max="5" value="${state.profile.weights[k]}" data-scope="weight" data-key="${k}"></label>`).join('')}</div></section><section class="reflection"><h3>别忘了你最初在意的事</h3><p>当前目标：${esc(state.profile.goal)}</p><p>让你投入：${esc(state.profile.liked||'尚未记录，可以回到画像页补充。')}</p><p>不想重演：${esc(state.profile.disliked||'尚未记录，可以回到画像页补充。')}</p></section><div class="bottom-actions"><button class="secondary" data-page="offers">← 修改 offer</button><button class="primary" data-page="prompt">下一步：生成 Prompt →</button></div>`;
}
function render() {
  shell(({home,profile,offers,results,prompt:()=>promptView(state,promptOptions)}[page])());
  const label = document.createElement('label');
  label.className = 'text-btn import-label'; label.textContent = '导入草稿';
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.json,application/json'; input.className = 'import-file'; input.setAttribute('aria-label','导入 JSON 草稿');
  input.addEventListener('change', async () => {
    try {
      const file = input.files[0]; if (!file) return;
      if (file.size > 1000000) throw new Error('文件过大，请使用本工具导出的草稿。');
      const parsed = JSON.parse(await file.text());
      if (!parsed?.profile || !Array.isArray(parsed.offers) || parsed.offers.length < 2 || parsed.offers.length > MAX_OFFERS) throw new Error('草稿格式不正确。');
      const imported = normalizeDraft(parsed);
      if (!confirm('导入会替换当前草稿，是否继续？')) return;
      state = imported; save(); page='profile'; notice='草稿已导入，请检查画像和岗位信息。'; render();
    } catch (error) { notice = `导入失败：${error.message}`; render(); }
  });
  label.append(input); document.querySelector('.header-right').prepend(label);
}
function navigate(next) {
  const invalid = app.querySelector('input:invalid');
  if (invalid) { invalid.reportValidity(); return; }
  if (next==='results' && !(Number(state.profile.targetMonthly)>0)) { notice='请先填写大于 0 的满意税前月均收入，才能计算经济得分。'; page='profile'; }
  else { notice=''; page=next; }
  render(); window.scrollTo({top:0,behavior:'smooth'});
}
app.addEventListener('input', e => { const el=e.target; const {scope,key,id}=el.dataset; if(!scope)return; if(scope==='profile')state.profile[key]=el.value; if(scope==='offer'){const o=state.offers.find(o=>o.id===id); if(o)o[key]=el.value;} if(scope==='weight'){state.profile.weights[key]=Number(el.value); const output=document.querySelector(`#weight-${key}`);if(output)output.textContent=el.value;} save(); });
app.addEventListener('change', e=>{
  const el=e.target;
  if(el.id==='city-select' && el.value){addCities(el.value);return;}
  if(['baziEnabled','baziMode'].includes(el.dataset.key)){render();return;}
  if(el.dataset.promptOption){promptOptions[el.dataset.promptOption]=el.checked;render();return;}
  if(el.dataset.scope==='weight' && page==='results')render();
  const taskChoice=el.tagName==='SELECT' && (el.dataset.key?.startsWith('wish_')||el.dataset.key?.startsWith('ability_')||el.dataset.key?.startsWith('demand_')||el.dataset.key==='careerFamily');
  if(taskChoice){
    const openStates=[...app.querySelectorAll('.extra-section')].map(node=>node.open);
    const y=window.scrollY; render();
    app.querySelectorAll('.extra-section').forEach((node,i)=>{if(openStates[i]!==undefined)node.open=openStates[i];});
    window.scrollTo(0,y);
  }
  if(el.dataset.scope==='offer' && ['assignment','travel'].includes(el.dataset.key))render();
});
function addCities(value){const items=value.split(/[、,，;；\n]/).map(x=>x.trim()).filter(Boolean);state.profile.cities=[...new Set([...state.profile.cities,...items])];save();render();}
function downloadText(text,name){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
app.addEventListener('keydown',e=>{if(e.target.id==='custom-city'&&e.key==='Enter'){e.preventDefault();addCities(e.target.value);}});
app.addEventListener('click', e=>{const button=e.target.closest('button');if(!button)return;if(button.dataset.page){navigate(button.dataset.page);return;} const action=button.dataset.action;
  if(action==='exploration-prompt'){
    const text=buildExplorationPrompt(state.profile);
    document.querySelector('#exploration-output').innerHTML='<label class="field"><span>独立文化探索 Prompt · 未发送给任何服务</span><textarea id="exploration-prompt" readonly>'+esc(text)+'</textarea></label><button class="secondary" data-action="copy-exploration">复制探索 Prompt</button><p id="exploration-status" role="status" class="micro"></p>';
  }
  if(action==='copy-exploration'){
    const output=document.querySelector('#exploration-prompt');
    navigator.clipboard.writeText(output.value).then(()=>{document.querySelector('#exploration-status').textContent='已复制，请自行决定是否向外部 AI 提供这些信息';}).catch(()=>{output.focus();output.select();document.querySelector('#exploration-status').textContent='已选中全文，请手动复制';});
  }
  if(action==='add-city'){addCities(document.querySelector('#custom-city').value);}
  if(action==='remove-city'){state.profile.cities.splice(Number(button.dataset.index),1);save();render();}
  if(action==='download-prompt'){downloadText(document.querySelector('#prompt-output').value,'offerlens-prompt.txt');}
  if(action==='copy-prompt'){
    const output=document.querySelector('#prompt-output');
    navigator.clipboard.writeText(output.value).then(()=>{document.querySelector('#copy-status').textContent='Prompt 已复制，请粘贴到你使用的 AI 对话中';}).catch(()=>{output.focus();output.select();document.querySelector('#copy-status').textContent='自动复制未成功，已选中全文，请按 Ctrl+C 或长按复制';});
  }
  if(action==='add' && state.offers.length<MAX_OFFERS){state.offers.push(newOffer(`Offer ${String.fromCharCode(65+state.offers.length)}`));save();render();}
  if(action==='remove'){state.offers=state.offers.filter(o=>o.id!==button.dataset.id);save();render();}
  if(action==='export'){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='offerlens-draft.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
  if(action==='clear' && confirm('清空这台浏览器中的画像和 offer？此操作不可撤销，建议先导出。')){state=fresh();save();page='home';notice='本地数据已清空。';render();}
  if(action==='fresh' && confirm('开始新比较会替换当前草稿，是否继续？')){state=fresh();save();page='profile';render();}
  if(action==='example'){
    if((state.profile.liked||state.offers.some(o=>o.salary!=='')) && !confirm('示例会替换当前草稿，建议先导出。继续？'))return;
    state=fresh();state.example=true;state.profile={...defaultProfile(),cities:['杭州市'],maxHours:50,minMonthly:10000,liked:'独立负责一个小功能，得到具体反馈。',disliked:'需求经常临时变化，下班后无法休息。'};
    state.offers=[{...newOffer('青禾科技'),role:'课程研发',careerFamily:'education',city:'杭州',salary:16000,months:13,bonus:16000,hours:48,content:4,growth:5,style:3,life:3,risk:3,source:'HR 口头说明',tasks:'负责课程内容研发，有导师安排，需确认授课及招生占比。'},{...newOffer('山屿数字'),role:'内容运营',careerFamily:'operations',city:'杭州',salary:14000,months:13,bonus:10000,hours:40,content:4,growth:3,style:5,life:5,risk:4,source:'直属领导 / 未来同事',tasks:'用户活动与内容运营，工作边界较明确，需确认活动值班。'}];save();page='results';render();window.scrollTo(0,0);
  }
});
render();
