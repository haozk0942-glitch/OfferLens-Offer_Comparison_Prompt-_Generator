import {profileGroups,offerGroups,extraDefaults,extraNumbers} from './schema.js';
import {explorationDefaults} from './exploration.js';
export const MAX_OFFERS=8;
export const defaultProfile = () => ({ ...explorationDefaults, ...extraDefaults(profileGroups), stage:'应届毕业生', goal:'积累专业能力', city:'', cities:[], minMonthly:'', targetMonthly:15000, maxHours:'', liked:'', disliked:'', mbti:'', politics:'', gender:'', education:'', school:'', major:'', acceptAssignment:'', acceptOverseas:'', mobilityNotes:'', travelTolerance:'', weights:{money:4,content:4,growth:5,style:3,life:4,risk:3} });
export const newOffer = (name='') => ({...extraDefaults(offerGroups),id:crypto.randomUUID(),name,role:'',city:'',salary:'',months:12,bonus:'',hours:'',tasks:'',source:'待核实',content:'',growth:'',style:'',life:'',risk:'',assignment:'',assignmentDestination:'',assignmentCountry:'',assignmentDuration:'',assignmentAllowance:'',assignmentAcceptance:'',assignmentNotes:'',travel:'',travelFrequency:'',travelNotes:''});
export const fresh = () => ({profile:defaultProfile(),offers:[newOffer('Offer A'),newOffer('Offer B')],example:false});
export function normalizeDraft(raw) {
  if(!raw?.profile || !Array.isArray(raw.offers) || raw.offers.length<2 || raw.offers.length>MAX_OFFERS)throw new Error('草稿需要包含画像及 2—8 个机会');
  const profile=defaultProfile();
  for(const key of Object.keys(profile))if(!['weights','cities'].includes(key) && ['number','string'].includes(typeof raw.profile[key]))profile[key]=String(raw.profile[key]);
  profile.cities=Array.isArray(raw.profile.cities)?[...new Set(raw.profile.cities.filter(x=>typeof x==='string').map(x=>x.trim()).filter(Boolean))]:String(raw.profile.city||'').split(/[、,，;；]/).map(x=>x.trim()).filter(Boolean);
  profile.city='';
  for(const key of Object.keys(profile.weights)){const n=Number(raw.profile.weights?.[key]??profile.weights[key]);if(!Number.isFinite(n)||n<1||n>5)throw new Error('权重必须在 1—5 之间');profile.weights[key]=n;}
  for(const [key,min,max] of [['minMonthly',0,1e9],['targetMonthly',1,1e9],['maxHours',1,168]])if(profile[key]!=='' && (!Number.isFinite(Number(profile[key])) || Number(profile[key])<min || Number(profile[key])>max))throw new Error('画像中的数值超出范围');
  const offers=raw.offers.map(rawOffer=>{if(!rawOffer||typeof rawOffer!=='object')throw new Error('机会格式不正确');const offer=newOffer();for(const key of Object.keys(offer))if(key!=='id'&&['number','string'].includes(typeof rawOffer[key]))offer[key]=String(rawOffer[key]);for(const [key,min,max] of [['salary',0,1e9],['months',1,24],['bonus',0,1e10],['hours',1,168],...['content','growth','style','life','risk'].map(k=>[k,1,5])])if(offer[key]!==''&&(!Number.isFinite(Number(offer[key]))||Number(offer[key])<min||Number(offer[key])>max))throw new Error('机会中的数值超出范围');return offer;});
  for(const offer of offers){
    for(const key of extraNumbers){if(offer[key]!==''&&(!Number.isFinite(Number(offer[key]))||Number(offer[key])<0))throw new Error('扩展字段中的金额和时间必须为非负数');}
    if(offer.fundRate!==''&&Number(offer.fundRate)>100)throw new Error('公积金比例不能超过 100%');
    for(const group of offerGroups)for(const [key,,type,options] of group.fields)if(type==='select'&&!options.some(([value])=>value===offer[key]))throw new Error('机会选项值不正确');
  }
  return {profile,offers,example:raw.example===true};
}
