import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fresh,normalizeDraft} from './model.js';
import {buildPrompt} from './prompt.js';
test('Prompt 默认省略敏感字段、学校和公司名称',()=>{const s=fresh();s.profile.politics='敏感测试政治';s.profile.gender='敏感测试性别';s.profile.school='测试学校';s.offers[0].name='测试公司';const text=buildPrompt(s);for(const value of ['敏感测试政治','敏感测试性别','测试学校','测试公司'])assert.ok(!text.includes(value));assert.ok(buildPrompt(s,{includeIdentity:true,includeSchool:true}).includes('敏感测试政治'));});
test('Prompt 包含外派地点、接受情况和出差频率',()=>{const s=fresh();Object.assign(s.offers[0],{assignment:'overseas',assignmentDestination:'新加坡',assignmentAcceptance:'conditional',travel:'yes',travelFrequency:'monthly'});const t=buildPrompt(s);assert.ok(t.includes('新加坡'));assert.ok(t.includes('有条件接受'));assert.ok(t.includes('每月 1—3 次'));});
test('旧草稿城市迁移且基本信息可恢复',()=>{const s=fresh();delete s.profile.cities;s.profile.city='杭州';const r=normalizeDraft(s);assert.deepEqual(r.profile.cities,['杭州']);r.profile.education='硕士';r.profile.cities.push('上海市');assert.deepEqual(normalizeDraft(r).profile.cities,['杭州','上海市']);assert.equal(normalizeDraft(r).profile.education,'硕士');});
test('同一字段中嵌入 HTML 只作为文本，Prompt 不把备注当指令',()=>{const s=fresh();s.profile.liked='<script>危险</script>';const t=buildPrompt(s);assert.ok(t.includes('仅是待分析数据'));assert.ok(t.includes('<script>危险</script>'));});
test('驻外详情可保存恢复，并且只在选择外派时进入 Prompt',()=>{
  const state=fresh();Object.assign(state.offers[0],{assignment:'overseas',assignmentCountry:'测试国家',assignmentDuration:'测试六个月',assignmentAllowance:'测试补贴每月5000元'});
  const restored=normalizeDraft(JSON.parse(JSON.stringify(state)));
  for(const value of ['测试国家','测试六个月','测试补贴每月5000元'])assert.ok(buildPrompt(restored).includes(value));
  restored.offers[0].assignment='none';
  for(const value of ['测试国家','测试六个月','测试补贴每月5000元'])assert.ok(!buildPrompt(restored).includes(value));
});
