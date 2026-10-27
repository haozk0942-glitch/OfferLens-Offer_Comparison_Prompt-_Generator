export const esc = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function field(label,key,value,{type='text',hint='',min='',max='',placeholder='',scope='profile',id='',list=''}={}){return `<label class="field"><span>${label}</span><input data-scope="${scope}" data-key="${key}" data-id="${esc(id)}" type="${type}" value="${esc(value)}" ${min!==''?`min="${min}"`:''} ${max!==''?`max="${max}"`:''} ${list?`list="${list}"`:''} ${type==='number'?'step="any"':''} placeholder="${esc(placeholder)}">${hint?`<small>${hint}</small>`:''}</label>`;}
export function select(label,key,value,options,scope='profile',id=''){return `<label class="field"><span>${label}</span><select data-scope="${scope}" data-key="${key}" data-id="${esc(id)}">${options.map(([v,t])=>`<option value="${esc(v)}" ${String(value)===String(v)?'selected':''}>${esc(t)}</option>`).join('')}</select></label>`;}
export const acceptance = [['','暂不确定'],['yes','接受'],['no','不接受'],['conditional','有条件接受']];
export const frequency = [['','待确认'],['none','不接受出差'],['rare','偶尔：每季度不超过 1 次'],['monthly','每月 1—3 次'],['weekly','每周出差'],['frequent','高频 / 长期驻场']];
export const assignmentLabels={'':'待确认',none:'不外派',domestic:'国内外派',overseas:'海外外派'};
export const travelLabels={'':'待确认',no:'不出差',yes:'需要出差'};
