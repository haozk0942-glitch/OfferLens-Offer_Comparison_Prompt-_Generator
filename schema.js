// 截图提炼的可选字段，不内置帖子中的公司评价和待遇。
import {traits,familyOptions,interestOptions,abilityOptions,demandOptions} from './careers.js';
export const opportunityStatuses=[['','待确认'],['current','当前工作（比较基线）'],['written','已收到书面 offer'],['oral','口头意向 / OC'],['negotiating','待谈薪'],['signing','等待签约'],['interview','面试中'],['pool','候选池 / 等待结果'],['withdrawn','已撤回 / 已拒绝']];
export const profileGroups=[{title:'职业背景与生活条件',hint:'选填，只写影响决定的条件，不需要亲属身份等细节',fields:[
['experience','工作经验与过往行业','text','如：一年半导体经验'],
['gapNotes','空档期 / 当前就业状态','text','如：已离职，空档一年'],
['familyNeeds','家庭与地域支持需求','textarea','如：希望靠近父母，需要照护时间'],
['financialRunway','经济缓冲与等待承受能力','text','如：还能接受找工作两个月'],
['longTermGoal','长期方向与平台偏好','textarea','如：重视专业深度和未来跳槽空间'],
['restNeeds','休息、倒班和加班边界','textarea','如：不接受夜班，希望双休'],
['decisionDeadline','最晚决策日期','date',''],
['pendingOptions','还在推进的机会 / 是否继续等待','textarea','如：两个面试预计两周出结果'],
['mainDilemma','当前最纠结的取舍','textarea','如：稳定与成长、收入与工作强度']]}];
export const offerGroups=[
{title:'机会阶段、公司与岗位',hint:'当前工作可作为基线；口头意向、面试和正式 offer 分开',open:true,fields:[
['opportunityStatus','机会阶段','select',opportunityStatuses],['replyDeadline','答复 / 签约截止日期','date',''],
['district','具体区县 / 园区 / 办公地址','text','如：上海嘉定；北京亦庄'],
['companyNature','公司性质','select',[['','未知'],...['央企','地方国企','事业单位','民营企业','外资企业','合资企业','其他'].map(x=>[x,x])]],
['industry','行业与主要业务','text','如：半导体设备、汽车零部件'],
['platform','公司 / 部门层级与平台特点','text','如：集团子公司、研发中心；层级为自述'],
['team','所属部门、团队与直属领导','textarea','不清楚可留空'],
['promotion','晋升路径、时间与条件','textarea','区分已确认安排与个人推测'],
['prospects','业务趋势、组织变化与发展顾虑','textarea','如：收购、降本；注明信息来源']]},
{title:'薪酬细节、公积金与福利',hint:'金额默认人民币；总包、补贴和激励不直接叠加进保证收入',fields:[
['salaryBasis','保证收入录入口径','select',[['','固定月薪 × 保证月数'],['annual','直接填写税前年保证收入']]],
['guaranteedAnnual','税前年保证收入（元，仅年薪口径生效）','number','如：190000；需明确保底，不是含浮动的总包'],
['compensationRaw','原始薪资说法 / N 的含义','textarea','如：(N+2k)×14；N 未知时不填造数值'],
['totalPackage','对方宣称的年度总包（元）','number','可能已含奖金补贴，需核实组成'],
['bonusRules','奖金范围与绩效条件','textarea','如：0—6 个月，不保证；哪些月数保底'],
['fundRate','公积金缴存比例（%）','number','请在下方注明个人 / 单位或双方'],
['fundBase','公积金缴存基数（元/月）','number','如为月薪的 65%，请在口径里补充'],
['fundNotes','公积金口径与补充公积金','text','比例是哪一方，补充公积金是否另计'],
['insurance','社保、补充保险与企业年金','textarea','如：六险二金；企业年金金额及归属条件'],
['mealAllowance','餐补（元/月）','number',''],['housingAllowance','房补（元/月）','number',''],
['housing','宿舍与住房条件','textarea','如：不住宿才有房补，互斥不要重复算'],
['canteen','食堂与用餐成本','text','如：有食堂，个人承担部分费用'],
['signOn','签字费（元，一次性）','number',''],
['talentSubsidy','人才 / 博士 / 博后补贴与资格','textarea','记录来源、资格、到账时间和服务期'],
['incentives','长期激励、分期奖励与兑现条件','textarea','如：三年分期、绩效门槛、离职返还']]},
{title:'工作节奏与生活成本',hint:'保留原始说法，不把 996、大小周或传闻自动换算成精确工时',fields:[
['schedule','作息与休息制度','select',[['','未知'],...['双休','大小周','单休','轮休','其他'].map(x=>[x,x])]],
['scheduleRaw','原始作息说法','text','如：995.5、8106、弹性 8 小时；解释具体时间'],
['shift','倒班 / 夜班安排','textarea','如：每四个月倒班一次，持续半个月'],
['overtime','加班时长、频率与补偿','textarea','如：每月加班约 36 小时，补偿待核实'],
['leave','年假、额外假期与使用限制','text','如：5+5 天，区分法定与额外'],
['commute','单程通勤时间（分钟）','number',''],
['livingCost','预计每月个人生活支出（元）','number','明确是否含房租餐饮，避免重复扣减']]},
{title:'试用、合同与主观取舍',hint:'协议只记录条款和待核实事项；优缺点作为个人判断',fields:[
['probation','试用 / 实习期与薪资折扣','textarea','区分实习与试用，记录期限、比例和转正条件'],
['contract','合同主体、用工形式与编制','text','如：直签 / 派遣，合同与实际工作单位'],
['restrictions','竞业、服务期、违约与返还条款','textarea','如：补贴服务期、签字费返还、竞业范围'],
['advantages','你认为的主要优点','textarea','如：岗位方向、平台、生活压力'],
['concerns','你认为的主要顾虑','textarea','如：部门不明、岗位路径窄、稳定性待核实'],
['evidenceNotes','关键判断的来源与确定程度','textarea','如：HR 口头说明 / 未来同事 / 网上传闻']]}];
profileGroups.unshift({title:'我愿意做什么、能做什么',hint:'不是人格测验。只填与你有关的维度，愿意程度与能力分开，用项目、兼职、社团或实习举例；未知可跳过。',fields:[
 ['careerInterest','正在考虑的职业方向','text','可填写多个方向，如：教研、翻译、财务'],
 ...traits.flatMap(([key,name,example])=>[[`wish_${key}`,`${name} · 愿意程度`,'select',interestOptions],[`ability_${key}`,`${name} · 能力自述`,'select',abilityOptions],[`evidence_${key}`,`${name} · 经历证据`,'textarea',example]])
]});
offerGroups.unshift({title:'职业方向与实际任务要求',hint:'职业类别只提示核实问题，不自动填写需求或改变得分；同名岗位也可能很不同。',open:true,fields:[
 ['careerFamily','职业类别','select',familyOptions],
 ['roleSubtype','细分方向 / 核心任务占比','textarea','如：授课 60%、教研 30%、招生 10%；或投研而非销售'],
 ['roleRequirements','必要资格与入职要求','textarea','如：教师资格、语言水平、专业证书；注明是否入职必须'],
 ['roleSupport','培训、带教与支持资源','textarea','如：新人培训、复核、导师、客户线索或工具支持'],
 ['commercialTerms','业务考核与浮动收入规则','textarea','如：招生续费、提成回款、直播 GMV、退单扣回；非销售可跳过'],
 ['demandEvidence','任务强度的信息依据','textarea','如：JD、面试官、未来同事；尚未确认请写待核实']
]});
offerGroups.push({title:'个人偏好 × 真实岗位任务',hint:'只评估日常任务出现的强度，不是能力门槛；类别不会代填，未知保留。该部分不自动并入六维总分。',fields:traits.map(([key,name])=>[`demand_${key}`,`${name} · 岗位任务强度`,'select',demandOptions])});
export const experienceGroups=[
{title:'从具体经历发现偏好',section:'experience',hint:'工作、兼职、社团、课程或照护经历都可以。用“情境—行动—结果—感受”回答，选填。',fields:[
 ['achievementStory','一件有成就感的事：你做了什么？','textarea','当时目标、你的行动、结果，以及真正让你满足的部分'],
 ['drainingStory','一段消耗经历：到底是哪种因素？','textarea','任务本身、沟通方式、时间安排、价值冲突，还是缺少支持？'],
 ['feedbackStory','别人反复肯定或提醒你的是什么？','textarea','给一个具体例子，区分外界评价与自己的判断'],
 ['repeatChoice','如果重来一次，你会保留或改变什么？','textarea','哪些环境与任务想再次经历，哪些不想重演']
]},
{title:'你更适合怎样的工作环境',section:'experience',hint:'比较环境偏好，不给自己贴固定性格标签。',fields:[
 ['learningStyle','怎样的学习和带教最有效？','textarea','如：先示范、自己试做、固定复盘、及时反馈'],
 ['managerStyle','希望获得怎样的管理与反馈？','textarea','如：明确边界、自主决定方法、定期具体反馈'],
 ['collaborationStory','独立与协作怎样搭配更舒服？','textarea','举例说明需要专注的时间与可接受沟通频率'],
 ['conflictStory','面对拒绝、冲突或临时变化，你如何应对？','textarea','说一次真实经历、恢复方式，以及希望得到的支持']
]},
{title:'把偏好变成可以讨论的取舍',section:'experience',hint:'可以保留矛盾和不确定，AI 应先向你核实，不能直接改权重。',fields:[
 ['tradeoffStory','你愿意为哪项收获付出什么代价？','textarea','如：为更好的带教接受暂时少一些收入，但不接受持续夜班'],
 ['nonNegotiableStory','哪些条件是底线，哪些只是加分项？','textarea','解释原因；实际筛选仍以你在底线栏明确填写的条件为准'],
 ['regretScenario','一年后后悔，最可能因为什么？','textarea','最希望避免的情景，以及现在可核实的信号'],
 ['preferenceUncertainty','哪些偏好来自自己，哪些仍受外部期待影响？','textarea','可以写仍在犹豫的地方，无需给出确定答案']
]}];
profileGroups.push(...experienceGroups);
export const extraDefaults=groups=>Object.fromEntries(groups.flatMap(g=>g.fields.map(([key])=>[key,''])));
export const extraNumbers=offerGroups.flatMap(g=>g.fields.filter(f=>f[2]==='number').map(([k])=>k));
export const statusLabel=value=>opportunityStatuses.find(([k])=>k===value)?.[1]||'待确认';
export function projectFields(groups,source){return Object.fromEntries(groups.map(g=>[g.title,Object.fromEntries(g.fields.filter(([key])=>source[key]!==''&&source[key]!=null).map(([key,label])=>[label,key==='opportunityStatus'?statusLabel(source[key]):source[key]]))]).filter(([,values])=>Object.keys(values).length));}
