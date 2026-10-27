import {careerFamilies,fitSignals,traits} from './careers.js';
import {esc} from './ui.js';
export function careerPanel(profile,offer){
 const family=careerFamilies.find(([key])=>key===offer.careerFamily);
 const signals=fitSignals(profile,offer).filter(row=>row.实际任务强度!=='未知');
 return `<section class="career-panel"><h4>个人特质与岗位性质</h4><p class="micro">关注你是否愿意长期做这些任务，以及已有经历和学习支持。不把外向、学校、专业或 MBTI 当作职业结论。</p>${family?`<strong>${esc(family[1])}</strong><p class="micro">${esc(family[3])}</p><ul>${family[4].map(q=>`<li>${esc(q)}</li>`).join('')}</ul>`:'<p class="micro">在“职业方向与实际任务要求”中选择类别后，显示该方向的核实问题。也可以不选类别直接填写任务强度。</p>'}
 ${family?.[2].length?`<p class="micro">优先核实维度（仅作提示）：${family[2].map(key=>esc(traits.find(([id])=>id===key)?.[1]||key)).join('、')}；并不意味着该类别每个岗位都有同等要求。</p>`:''}
 ${signals.length?`<div class="fit-signals">${signals.map(row=>`<p><strong>${esc(row.维度)}</strong>：愿意程度 ${row.愿意程度} / 任务强度 ${row.实际任务强度} · ${row.提示}</p>`).join('')}</div>`:'<p class="micro">填写“个人偏好 × 真实岗位任务”，再结合画像进行对照。</p>'}
 <p class="micro">这里是规则提示，不是心理测评、能力鉴定或匹配概率；能力自述不能与任务频率直接相减。</p></section>`;
}
