import {field,select,acceptance,frequency} from './ui.js';
export function mobilityFields(offer){
  const f=(label,key,options={})=>field(label,key,offer[key],{scope:'offer',id:offer.id,...options});
  const s=(label,key,options)=>select(label,key,offer[key],options,'offer',offer.id);
  const assigned=['domestic','overseas'].includes(offer.assignment);
  return `<h3 class="subheading">外派与出差</h3>
  ${s('是否外派','assignment',[['','待确认'],['none','不需要外派'],['domestic','需要外派（国内）'],['overseas','需要外派（海外）']])}
  ${assigned?`<section class="conditional-card" aria-label="外派安排详情"><h4>外派安排</h4><p class="micro">只填写已知条件；补贴注明币种、周期与兑现条件，不自动计入保证收入</p>
    ${f('外派国家 / 地区','assignmentCountry',{placeholder:offer.assignment==='overseas'?'如：新加坡、日本、德国':'如：中国大陆'})}
    ${f('外派城市 / 具体目的地','assignmentDestination',{placeholder:'如：新加坡 / 裕廊；或苏州市'})}
    ${f('驻外时长','assignmentDuration',{placeholder:'如：连续 6 个月；每年累计 180 天'})}
    ${f('驻外补贴','assignmentAllowance',{placeholder:'如：人民币 5000 元/月；按驻外天数发放'})}
    ${s('你是否接受这份 offer 的外派安排','assignmentAcceptance',acceptance)}
    ${f('轮休、补贴条件及其他说明','assignmentNotes',{placeholder:'如：每季度轮休；住房另提供；补贴条件待确认'})}
  </section>`:''}
  ${s('是否需要出差','travel',[['','待确认'],['no','不需要出差'],['yes','需要出差']])}
  ${offer.travel==='yes'?`<section class="conditional-card" aria-label="出差安排详情"><h4>出差安排</h4>
    ${s('出差频率','travelFrequency',frequency.filter(([key])=>key!=='none'))}
    <p class="micro">与自我画像使用相同频率档位；“不接受出差”仅用于个人偏好</p>
    ${f('出差时长 / 地点 / 其他说明','travelNotes',{placeholder:'如：每次 3—5 天，国内为主'})}
  </section>`:''}`;
}
