export const dimensions = [
  ['money', '经济回报', '收入是否达到你当前的目标'],
  ['content', '工作内容', '日常任务是否让你愿意投入'],
  ['growth', '职业成长', '能否积累想要的能力'],
  ['style', '工作方式', '协作、管理与自主权是否合适'],
  ['life', '生活适配', '城市、工时与生活是否协调'],
  ['risk', '风险适配', '确定性是否符合你的承受范围']
];
export function number(value) { return value === '' || value == null || !Number.isFinite(Number(value)) ? null : Number(value); }
export function cash(offer) {
  if (offer.salaryBasis === 'annual') return number(offer.guaranteedAnnual);
  const salary = number(offer.salary), months = number(offer.months);
  return salary === null || months === null ? null : salary * months;
}
export function evaluate(profile, offers) {
  const weights = Object.fromEntries(dimensions.map(([key]) => [key, Math.max(0, number(profile.weights[key]) ?? 0)]));
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  return offers.map(offer => {
    const annual = cash(offer), gates = [], unknown = [], contributions = [];
    let pendingGate = false;
    const pending = message => { unknown.push(message); pendingGate = true; };
    if (offer.opportunityStatus !== undefined && !['written','current'].includes(offer.opportunityStatus)) {
      pending(offer.opportunityStatus === 'withdrawn' ? '该机会已撤回或拒绝，不作为当前可选机会' : '确认机会阶段与是否已落实；口头意向、谈薪和面试中不等于已获得 offer');
    }
    const normalizeCity = value => String(value || '').trim().replace(/市$/, '');
    const requiredCities = Array.isArray(profile.cities) ? profile.cities : (profile.city ? [profile.city] : []);
    if (requiredCities.length && offer.assignment !== 'overseas') {
      const actualCity = offer.assignment === 'domestic' ? offer.assignmentDestination : offer.city;
      if (!normalizeCity(actualCity)) pending('确认实际工作或外派城市是否满足你的城市底线');
      else if (!requiredCities.map(normalizeCity).includes(normalizeCity(actualCity))) gates.push(`城市不满足底线：可接受 ${requiredCities.join('、')}`);
    }
    const min = number(profile.minMonthly);
    if (min !== null && min > 0) {
      if (annual === null) pending('确认固定工资与保证发薪月数，检查收入底线');
      else if (annual / 12 < min) gates.push('保证年薪折合月均低于你的税前收入底线');
    }
    const maxHours = number(profile.maxHours), hours = number(offer.hours);
    if (maxHours !== null && maxHours > 0) {
      if (hours === null) pending('向未来同事确认常态周工时');
      else if (hours > maxHours) gates.push(`预计每周 ${hours} 小时，超过你的工时底线`);
    }
    if (['domestic','overseas'].includes(offer.assignment)) {
      if (profile.acceptAssignment === 'no') gates.push('该机会要求外派，与你不接受外派的偏好冲突');
      else if (profile.acceptAssignment !== 'yes') pending('确认外派安排是否满足你的接受条件');
      if (!String(offer.assignmentDestination || '').trim()) pending('确认外派目的地');
      if (offer.assignment === 'overseas') {
        if (profile.acceptOverseas === 'no') gates.push('该机会要求海外工作，与你不接受海外工作的偏好冲突');
        else if (profile.acceptOverseas !== 'yes') pending('确认海外国家、城市和工作安排是否可接受');
      }
      if (offer.assignmentAcceptance === 'no') gates.push('你不接受这份 offer 的具体外派安排');
      else if (offer.assignmentAcceptance !== 'yes') pending('确认你是否接受这份 offer 的具体外派安排');
    } else if (!offer.assignment && (profile.acceptAssignment || profile.acceptOverseas)) pending('确认该机会是否要求外派或海外工作');
    const travelRank = {none:0,rare:1,monthly:2,weekly:3,frequent:4};
    if (offer.travel === 'yes') {
      if (!offer.travelFrequency) pending('确认出差频率');
      if (profile.travelTolerance === 'none') gates.push('该机会需要出差，但你不接受出差');
      else if (offer.travelFrequency && profile.travelTolerance && travelRank[offer.travelFrequency] > travelRank[profile.travelTolerance]) gates.push('出差频率超过你的接受上限');
    } else if (!offer.travel && profile.travelTolerance) pending('确认该机会是否需要出差');
    let low = 0, high = 0, knownWeight = 0;
    for (const [key, label] of dimensions) {
      let utility = null;
      if (key === 'money') {
        const target = number(profile.targetMonthly);
        if (annual !== null && target !== null && target > 0) utility = Math.min(100, Math.max(0, annual / 12 / target * 100));
      } else {
        const rating = number(offer[key]);
        if (rating !== null) utility = Math.max(0, Math.min(100, (rating - 1) / 4 * 100));
      }
      const weight = totalWeight ? weights[key] / totalWeight : 0;
      if (utility === null && weight > 0) unknown.push(`补充「${label}」信息；当前未按中等分处理`);
      if (utility !== null) { low += weight * utility; knownWeight += weight; }
      high += weight * (utility ?? 100);
      contributions.push({ key, label, utility, weight, points: utility === null ? null : utility * weight });
    }
    return { offer, annual, gates, unknown, contributions, low, high, coverage: knownWeight * 100, score: knownWeight > 0 ? low / knownWeight : null, eligible: !gates.length && !pendingGate };
  });
}
