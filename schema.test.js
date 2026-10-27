import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fresh,newOffer,normalizeDraft} from './model.js';
import {profileGroups,offerGroups} from './schema.js';
import {buildPrompt} from './prompt.js';
import {cash,evaluate} from './engine.js';
test('截图提炼字段均进入草稿与 Prompt，导入后不丢失',()=>{
 const state=fresh();
 for(const group of profileGroups)for(const [key]of group.fields)state.profile[key]=`测试-${key}`;
 for(const group of offerGroups)for(const [key,,type,options]of group.fields)state.offers[0][key]=type==='number'?'12':type==='select'?options[1][0]:`测试-${key}`;
 const restored=normalizeDraft(JSON.parse(JSON.stringify(state)));const prompt=buildPrompt(restored);
 for(const group of profileGroups)for(const [key,label]of group.fields){assert.equal(restored.profile[key],state.profile[key]);assert.ok(prompt.includes(label));assert.ok(prompt.includes(`测试-${key}`));}
 for(const group of offerGroups)for(const [key,label,type]of group.fields){assert.equal(restored.offers[0][key],state.offers[0][key]);assert.ok(prompt.includes(label));if(!['select','number'].includes(type))assert.ok(prompt.includes(`测试-${key}`));}
});
test('宣称总包、补贴与分期激励不重复计入保证收入',()=>{const o={...newOffer(),salary:11500,months:13,totalPackage:170000,mealAllowance:168,housingAllowance:750,signOn:20000,incentives:'49000，三年分期'};assert.equal(cash(o),149500);});
test('N 未知不推算工资，只有宣称总包时保证收入仍未知',()=>{const o={...newOffer(),compensationRaw:'(N+2k)*14',totalPackage:350000};assert.equal(cash(o),null);});
test('支持直接输入保底年薪，与月薪口径互斥',()=>{const o={...newOffer(),salary:15000,months:13,salaryBasis:'annual',guaranteedAnnual:190000};assert.equal(cash(o),190000);o.guaranteedAnnual='';assert.equal(cash(o),null);o.salaryBasis='';assert.equal(cash(o),195000);});
test('口头意向与面试中不作为已落实机会',()=>{const state=fresh();for(const status of ['oral','interview','pool','signing','negotiating','withdrawn','']){const r=evaluate(state.profile,[{...newOffer(),opportunityStatus:status}])[0];assert.equal(r.eligible,false);assert.ok(r.unknown.some(x=>/机会阶段|撤回/.test(x)));}});
test('支持八个机会并拒绝超过上限的导入',()=>{const s=fresh();while(s.offers.length<8)s.offers.push(newOffer());assert.equal(normalizeDraft(s).offers.length,8);s.offers.push(newOffer());assert.throws(()=>normalizeDraft(s));});
test('扩展数值字段拒绝负数及非法数字',()=>{const s=fresh();s.offers[0].fundRate='101';assert.throws(()=>normalizeDraft(s));s.offers[0].fundRate='12';s.offers[0].mealAllowance='-1';assert.throws(()=>normalizeDraft(s));});
