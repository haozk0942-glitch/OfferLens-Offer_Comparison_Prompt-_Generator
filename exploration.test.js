import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fresh,normalizeDraft} from './model.js';
import {buildPrompt} from './prompt.js';
import {buildExplorationPrompt} from './exploration.js';
import {evaluate} from './engine.js';
test('八字默认关闭且不进入主 Prompt，主动选择才加入',()=>{const s=fresh();assert.equal(s.profile.baziEnabled,'no');Object.assign(s.profile,{baziEnabled:'yes',baziMode:'birth',birthDate:'测试出生日期',birthPlace:'测试出生地区'});assert.ok(!buildPrompt(s).includes('测试出生日期'));assert.ok(buildPrompt(s,{includeBazi:true}).includes('测试出生日期'));s.profile.baziEnabled='no';assert.ok(!buildPrompt(s,{includeBazi:true}).includes('测试出生日期'));});
test('八字开关和资料不影响评分',()=>{const s=fresh();const scores=evaluate(s.profile,s.offers);Object.assign(s.profile,{baziEnabled:'yes',birthDate:'2000-01-01',baziChart:'测试四柱'});assert.deepEqual(evaluate(s.profile,s.offers),scores);});
test('出生资料与已有四柱模式互斥输出，旧草稿兼容',()=>{const s=fresh();Object.assign(s.profile,{baziEnabled:'yes',baziMode:'chart',baziChart:'测试四柱',birthDate:'隐藏出生日期',achievementStory:'组织活动的完整经历'});const restored=normalizeDraft(s);assert.ok(buildExplorationPrompt(restored.profile).includes('测试四柱'));assert.ok(!buildExplorationPrompt(restored.profile).includes('隐藏出生日期'));assert.ok(buildPrompt(restored).includes('组织活动的完整经历'));assert.equal(restored.profile.baziEnabled,'yes');});
