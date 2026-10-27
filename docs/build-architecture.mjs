import { writeFile } from 'node:fs/promises';
const groups = [
  {id:'A',name:'入口与使用流程',desc:'把用户带入一次可以完成、可以返回修改的决策。',nodes:[
    ['A1','首页与产品说明','已实现','展示价值、隐私说明、开始入口。','app.js · home()','进入画像或示例'],
    ['A2','虚构案例体验','已实现','预填两份虚构机会，直接查看结果；覆盖草稿前提示。','app.js · example 操作','快速理解使用方式'],
    ['A3','三步导航','已实现','认识自己 → 了解机会 → 看清取舍，可返回修改。','app.js · navigate() / shell()','页面切换'],
    ['A4','动态追问','计划·MVP增强','根据 offer 差异选择追问，例如仅在城市不同时追问异地。','尚未编码','回答 → 用户确认 → 更新画像'],
    ['A5','决策截止日期','计划·MVP增强','记录最晚答复日期，据此安排核实事项。','尚未编码','行动优先级']
  ]},
  {id:'B',name:'用户画像层',desc:'当前版本以用户主动填写为主；完整画像还没有自动生成。',nodes:[
    ['B1','阶段与目标','已实现','阶段 stage；主要目标 goal。当前只用于记录与结果回顾，不自动改变权重。','profile.stage / goal','目标摘要'],
    ['B2','现实底线','已实现','必须城市 city；最低税前月均保证收入 minMonthly；最大周工时 maxHours。留空不设置。','profile.city / minMonthly / maxHours','送入硬约束检查'],
    ['B3','满意收入锚点','已实现','targetMonthly 作为经济得分目标；当前达到目标即满分。尚无多段效用曲线。','profile.targetMonthly','经济效用计算'],
    ['B4','六维重要程度','已实现','经济、内容、成长、方式、生活、风险，用户各设 1—5；归一化为权重。','profile.weights','送入加权计算'],
    ['B5','正向与消耗经历','部分实现','liked / disliked 为自由文本，结果页回顾；没有 AI 提取、矛盾检测或自动评分。','profile.liked / disliked','反思材料'],
    ['B6','兴趣与能力证据','计划·MVP增强','区分能做好、喜欢做、希望学习；结合事例，而非只有自评标签。','尚未编码','内容匹配的依据'],
    ['B7','工作方式偏好','计划·MVP增强','自主权、协作密度、反馈频率、任务清晰度、变化容忍度。','尚未编码','工作方式匹配依据'],
    ['B8','生活与风险承受','计划·MVP增强','经济缓冲、照护与地域需要、通勤、可持续精力、试错成本；自愿最少采集。','尚未编码','底线和软偏好候选'],
    ['B9','画像确认与证据','计划·MVP增强','每条推断显示来源、解释、是否确认；用户确认后才改变偏好。','尚未编码','已确认画像'],
    ['B10','MBTI 记录','部分实现','mbti 文本选填，当前只保存，不出现在结果解释、不推断、不计分。','profile.mbti','未来可引出待确认问题'],
    ['B11','八字 / 趣味探索','后续可选','独立入口和解读；出生信息不推导职业分数；用户确认的现实偏好才能进入决策。','尚未编码','独立趣味内容；无直接评分连线']
  ]},
  {id:'C',name:'Offer 与岗位画像层',desc:'2—4 个机会。现在主要是结构化录入和用户判断，不是自动公司背调。',nodes:[
    ['C1','机会管理与身份','已实现','新增、删除、编辑；id / name / role / city，支持匿名名称。','offers[] · newOffer()','机会列表'],
    ['C2','收入拆分','已实现','salary × months 为税前年保证收入；bonus 单独显示，不计入评分。','offer.salary / months / bonus','保证现金与浮动部分'],
    ['C3','工时与工作内容','部分实现','hours 输入周工时；tasks 自由文本。尚无任务占比、通勤、忙季及远程字段。','offer.hours / tasks','工时底线与说明'],
    ['C4','五项主观匹配评价','已实现','内容、成长、工作方式、生活、风险各评 1—5；未知保留空。当前全部由用户判断。','offer.content / growth / style / life / risk','效用映射'],
    ['C5','主要信息来源','部分实现','source 为整份机会的单一来源标签；尚未逐字段绑定来源、日期与可信状态。','offer.source','结果依据说明'],
    ['C6','岗位工作与培养证据','计划·MVP增强','实际职责占比、导师安排、反馈、项目机会与能力迁移。','尚未编码','内容与成长匹配依据'],
    ['C7','团队与工作环境','计划·MVP增强','直属领导、协作方式、工作边界、实际远程与出差安排。','尚未编码','方式与生活匹配依据'],
    ['C8','复杂薪酬与生活成本','后续可选','签字费、股权、税后、通勤与居住成本；第一年和稳定年份分开。','尚未编码','独立现金流情景'],
    ['C9','逐字段证据管理','计划·MVP增强','字段值 + 来源 + 获取时间 + 书面/口头/推测/未知 + 合理范围。','尚未编码','输入可追溯']
  ]},
  {id:'D',name:'决策引擎层',desc:'纯 JavaScript 规则函数。已有六项测试；尚未做职业预测模型验证。',nodes:[
    ['D1','输入与数值处理','部分实现','界面数值范围校验、导入部分校验；number() 识别未知。尚无统一完整 schema 校验。','app.js / engine.js · number()','数值或 null'],
    ['D2','保证收入计算','已实现','annual = salary × months；月均 = annual ÷ 12。','engine.js · cash()','保证年收入'],
    ['D3','硬约束检查','已实现','城市精确匹配、月均保证收入下限、周工时上限；输出冲突与待确认。','engine.js · evaluate()','gates / eligible / unknown'],
    ['D4','六维效用映射','已实现','经济 = min(100, 月均保证收入 / 满意收入 × 100)；其他 = (自评分 − 1) / 4 × 100。','engine.js · evaluate()','每维 0—100 或未知'],
    ['D5','权重与贡献','已实现','权重除以总和；单项贡献 = 权重 × 效用。已知项参考分按已知权重重新归一。','contributions / score','分项贡献与参考总分'],
    ['D6','未知信息边界','已实现','coverage 是已知项占总权重比例；未知分别按 0/100 形成 low/high 情景边界，不是概率。','coverage / low / high','信息缺口与范围'],
    ['D7','比较结论门槛','已实现','仅全部机会评分完整且底线满足时生成领先判断；分差 < 2 用难分高下文案，2 分为原型规则。','app.js · results()','暂领先 / 难分 / 待补充'],
    ['D8','证据驱动匹配','计划·MVP增强','用已确认的用户偏好与岗位条件解释适配；不直接用人格标签加减分。','尚未编码','减少无依据自评'],
    ['D9','情景与翻转阈值','部分实现','已支持改权重后重算；未实现自动寻找翻转点、工时奖金情景和稳定性扫描。','app.js · weight 事件','当前权重重算；未来条件阈值'],
    ['D10','规则验证','部分实现','6 项测试：底线不可抵消、未知不补中等、新增选项不改旧分、未知工时、奖金不计分、全未知。','engine.test.js','规则回归检查；非满意度验证']
  ]},
  {id:'E',name:'结果与行动层',desc:'让用户知道结果来自哪里，以及下一步应该核实什么。',nodes:[
    ['E1','结论和冲突','已实现','当前领先文案、各机会底线状态和冲突原因。冲突机会仍展示，不能作为合格推荐。','app.js · results()','有条件的比较结论'],
    ['E2','六维明细与解释','已实现','匹配分/已知项参考分、覆盖权重、收入、条形明细、计算方法与来源。','app.js · results()','可检查的结果卡'],
    ['E3','信息核实清单','部分实现','根据未知维度、底线和总来源生成模板；尚无优先级、完成勾选或责任对象。','result.unknown → checklist','待问问题'],
    ['E4','画像回顾','部分实现','展示主要目标、投入经历、消耗经历；未生成可编辑的画像摘要。','profile.goal / liked / disliked','回到自我需求'],
    ['E5','取舍与条件解释','计划·MVP增强','明确选择得到什么、放弃什么，以及哪些事实会改变结论。','尚未编码','决策说明'],
    ['E6','决策快照与复盘','后续可选','保留每次输入、权重、结论、最终选择与后续体验；当前只有单份草稿。','尚未编码','决策版本与回顾'],
    ['E7','报告分享与打印','部分实现','JSON 导出、基本打印样式已具备；尚无 PDF/图片按钮、脱敏分享页或云端链接。','app.js / styles.css','草稿备份；非完整报告系统']
  ]},
  {id:'F',name:'数据、运行与工程层',desc:'所有业务计算发生在浏览器；本地 Node 服务只提供静态文件。',nodes:[
    ['F1','浏览器草稿','已实现','state = profile + offers + example；localStorage 键 offerlens.v1，当前浏览器单份记录。','app.js · state / save()','刷新恢复；非跨设备同步'],
    ['F2','导入导出与清空','已实现','JSON 导入导出、覆盖确认、清空确认、导入文件大小限制。','app.js · render() / click 事件','本地备份和恢复'],
    ['F3','页面与样式','已实现','原生 ES Modules，四个页面渲染函数；CSS 响应式和键盘焦点样式，无第三方依赖。','index.html / app.js / styles.css','手机优先界面'],
    ['F4','本地静态服务','已实现','Node HTTP 服务，仅允许指定静态文件；默认仅本机 127.0.0.1:5173。无数据库和业务 API。','server.mjs','本地预览'],
    ['F5','AI 辅助服务','后续可选','提取经历、解析 JD、提出追问；需要用户确认；密钥必须放服务端，不能写进前端。','尚未编码','候选字段和说明，不直接替代规则引擎'],
    ['F6','发布与 GitHub','计划·上线前','准备许可证、构建/静态托管方案、仓库、公开演示、使用文档与隐私说明。','README 已有；未发布','可访问网站与开源仓库'],
    ['F7','账号与云同步','暂不纳入','第一版无需登录；未来有跨设备需求再评估权限、存储和删除机制。','尚未编码','不阻塞第一版']
  ]}
];
// 2026-10-24 第二轮：多城市、流动偏好及用户自带 AI 的 Prompt 路径。
const updateNode=(id,patch)=>{for(const group of groups){const node=group.nodes.find(n=>n[0]===id);if(node)for(const [index,value] of Object.entries(patch))node[Number(index)]=value;}};
updateNode('A3',{2:'已实现',3:'自我画像 → Offer 信息 → 生成 Prompt；本地比较作为可选辅助，均可返回修改。'});
updateNode('B2',{3:'城市 cities[] 可下拉或手动多项添加；最低税前月均收入与最大工时。旧 city 草稿自动迁移。',4:'model.js / views.js / engine.js'});
updateNode('B8',{3:'已加入外派、海外意愿、出差频率上限及条件；经济缓冲、照护与通勤等仍待补充。',2:'部分实现'});
groups.find(g=>g.id==='B').nodes.push(['B12','基本背景信息','已实现','政治面貌、性别、学历、学校、专业均选填。敏感属性不评分，Prompt 默认省略政治面貌、性别及学校名。','model.js / views.js','背景记录及用户选择后的 Prompt']);
groups.find(g=>g.id==='C').nodes.push(['C10','具体外派安排','已实现','是否外派、国内/海外目的地、用户对该安排的接受程度及备注。','views.js / model.js','引擎底线与 Prompt'],['C11','出差安排','已实现','是否出差；需要时追问频率和时长/地点说明。','views.js / model.js','频率上限检查与 Prompt']);
updateNode('D3',{3:'多城市匹配（兼容市后缀）、收入、工时、外派与海外意愿、具体外派接受程度、出差频率上限；有条件接受标待确认。'});
updateNode('D10',{3:'已增加多城市、国内/海外外派、出差上限、Prompt 省略字段与迁移测试；规则测试非满意度验证。',4:'engine.test.js / prompt.test.js'});
updateNode('F3',{3:'原生 ES Modules + 响应式 CSS。新增 model.js、views.js、ui.js、cities.js 和 prompt.js，按职责拆分。',4:'index.html / app.js / styles.css / 新模块'});
groups.push({id:'G',name:'Prompt 生成与外部 AI 路径',desc:'新的主要输出路径：用户自己复制到 AI 服务分析，无需本项目托管模型。',nodes:[
['G1','结构化输入整理','已实现','组合已确认画像、匿名机会、外派出差事实与本地规则参考；保留未知。','prompt.js · buildPrompt()','中文结构化 Prompt'],
['G2','隐私与内容预览','已实现','默认用机会代号，省略公司名、学校名、政治面貌和性别；学校与敏感属性可主动勾选。自由文本需自行检查。','views.js · promptView()','可编辑 Prompt 预览'],
['G3','复制与下载','已实现','复制 Prompt 或下载 txt，复制失败时选中文本；不自动上传到任何模型。','app.js · copy-prompt / download-prompt','用户自行选择 AI'],
['G4','分析指令模板','已实现','要求先检查底线、区分事实假设、说明取舍、给翻转条件与优先追问，不让人格或敏感属性直接决定排名。','prompt.js','有约束的分析请求'],
['G5','AI 回答回填与比较','后续可选','尚无回答导入、统一结果校验或多模型对照。当前在外部对话继续分析。','尚未编码','未来闭环扩展']
]});
groups.find(g=>g.id==='B').nodes.push(['B13','背景与等待条件','已实现','工作经验、空档期、家庭地域需求、经济缓冲、长期方向、休息边界、截止日期、在途机会和核心纠结。','schema.js / views.js','进入 Prompt 的画像背景']);
groups.find(g=>g.id==='C').nodes.push(
['C12','机会阶段与当前工作','已实现','最多八个机会；区分当前工作、书面 offer、口头意向、谈薪、签约、面试、候选池和撤回。','schema.js / model.js','规则待确认及等待策略'],
['C13','公司平台与发展','已实现','具体区县、企业性质、行业业务、层级、团队、晋升和组织趋势。均为用户提供，未自动背调。','schema.js / views.js','Prompt 对照材料'],
['C14','薪酬福利细节','已实现','总包、原始 N+说法、奖金条件、公积金比例基数、保险年金、餐房补、宿舍食堂、签字费、人才补贴和分期激励；不自动计入保证收入。','schema.js / prompt.js','避免重复计算的分析素材'],
['C15','节奏与合同取舍','已实现','作息、倒班、加班、年假、通勤、生活支出、试用、合同主体、竞业服务期、优点顾虑与证据来源。','schema.js / prompt.js','分析生活代价与待核实条款']);
updateNode('C8',{2:'部分实现',3:'已记录签字费、补贴、分期激励和生活成本等；仍未实现税后、股权及复杂现金流计算。'});
updateNode('C6',{2:'部分实现',3:'新增团队、晋升、平台与发展说明，工作任务仍为文本；未实现事实驱动的自动成长评分。'});
updateNode('D7',{3:'新增阶段检查：口头意向、面试等未落实机会标待确认；仅所有机会完整且底线满足才给领先判断，仍未独立排序已落实子集。'});
groups.find(g=>g.id==='G').nodes.push(['G6','截图字段与等待策略','已实现','新增细节全部进入 Prompt，要求区分现实基线、已落实与在途机会；讨论保底/浮动、首年/长期、生活代价及等待成本。','schema.js / prompt.js','外部 AI 的结构化分析请求']);
groups.find(g=>g.id==='B').nodes.push(['B14','跨职业任务画像','已实现','12 项任务的愿意程度、能力自述和经历证据分开记录；不是人格测验。','careers.js / schema.js','已填写的自我描述与证据']);
groups.find(g=>g.id==='C').nodes.push(['C16','职业分类与实际任务匹配','已实现','17 类方向提示核实问题；任务强度、资格要求、带教支持和业务考核由用户确认。不按类别自动填需求或加分。','careers.js / career-view.js','兴趣一致、可能消耗或待补充的讨论提示']);
groups.find(g=>g.id==='G').nodes.push(['G7','跨职业人岗分析','已实现','Prompt 区分兴趣、能力、证据与真实任务，支持教培、销售、运营、翻译、财务等，要求讨论可学习部分及缺口。','prompt.js / docs/CAREER-MATCHING.md','非概率、非人格决定的条件分析']);
updateNode('B6',{2:'部分实现',3:'已增加任务愿意程度、能力自述与经历证据；尚无自动证据提取或客观能力验证。'});
updateNode('D8',{2:'部分实现',3:'已实现个人愿意程度与实际任务强度的讨论提示，不合并到六维总分；仍需用户和模型结合经历、资格及支持解释。'});
updateNode('A3',{3:'01 自我画像 → 02 Offer 信息 → 03 本地比较 → 04 生成 Prompt；支持返回修改和直接跳转。'});
updateNode('B11',{2:'部分实现',3:'已支持可选开关、已有四柱或出生资料录入、独立探索 Prompt；不自动排盘、不计职业分数，主 Prompt 需主动勾选才加入。',4:'exploration.js / model.js / prompt.js'});
groups.find(g=>g.id==='B').nodes.push(['B15','扩充经历与偏好','已实现','具体经历、环境偏好和现实取舍三组 12 项问题，均选填；推断需要用户确认，不自动改权重。','schema.js · experienceGroups / views.js','丰富的画像证据']);
groups.find(g=>g.id==='G').nodes.push(['G8','通用 AI 使用指南','已实现','官方通用工具入口、复制新建对话、先追问后建议、来源核实及对照分歧；非效果排名，无 API 调用。','exploration.js · aiGuide()','用户自助分析路径']);
const status = s => s === '已实现' ? 'done' : s === '部分实现' ? 'partial' : 'planned';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const total=groups.reduce((n,g)=>n+g.nodes.length,0);
const header=`# OfferLens 项目架构与节点审阅笔记\n\n更新时间：2026-10-24。依据当前代码核对；“已实现”表示存在实现，不代表经过真实用户或职业预测有效性验证。\n\n目标人群：应届生与初职求职者。中文、手机优先、无需登录。\n\n状态：已实现 / 部分实现 / 计划·MVP增强 / 后续可选 / 暂不纳入。\n\n## 1. 全局架构\n\n`;
const mermaid='~~~mermaid\nflowchart TD\n  A[入口：开始填写或体验示例] --> B[用户画像]\n  A --> C[Offer 与岗位画像]\n  B --> D[输入处理与硬约束检查]\n  C --> D\n  D --> G[六维效用与加权计算]\n  G --> H[未知范围与结论门槛]\n  H --> E[结果解释与行动清单]\n  E --> I[修改画像、权重或岗位信息]\n  I --> D\n  B <--> F[本地草稿与 JSON 备份]\n  C <--> F\n  J[未来：经历 AI 提取] -.用户确认后.-> B\n  K[可选：MBTI 与八字探索] -.仅引导现实偏好确认.-> B\n~~~\n\n';
let md=header+mermaid+'## 2. 分层节点清单\n\n';
for(const g of groups){md+=`### ${g.id} · ${g.name}\n\n${g.desc}\n\n`;for(const [id,name,s,desc,code,out] of g.nodes){md+=`#### ${id} ${name} — ${s}\n\n- 功能：${desc}\n- 当前位置：${code}\n- 输出/下游：${out}\n- 审阅：[ ] 保留　[ ] 修改　[ ] 延后　[ ] 删除\n- 你的意见：\n\n`;}}
md+=`## 3. 数据实体与关系\n\n| 实体 | 当前字段 | 当前用途 | 后续扩展 |\n| --- | --- | --- | --- |\n| Profile 用户画像 | stage、goal、city、minMonthly、targetMonthly、maxHours、liked、disliked、mbti、weights | 底线、经济目标、权重、经历回顾 | 结构化偏好、证据和用户确认 |\n| Offer 岗位机会 | id、name、role、city、salary、months、bonus、hours、tasks、source、五项评价 | 一个机会的条件和自评 | 实际任务、通勤、团队、逐字段证据 |\n| Evaluation 计算结果 | annual、gates、unknown、contributions、low、high、coverage、score、eligible | 临时计算、结果展示 | 翻转阈值与比较理由 |\n| Draft 当前草稿 | profile、offers、example | 一个画像关联 2—4 个机会；本地单份保存 | 多组比较和版本 |\n| Evidence 证据 | 尚无独立实体 | 目前只有整份 offer 的 source | 字段、来源、日期、状态、合理范围 |\n| DecisionSnapshot 决策快照 | 尚未实现 | 当前修改会覆盖草稿 | 输入与规则版本、选择、理由、复盘 |\n\nEvaluation 不单独保存，每次查看结果按当前草稿重算。source 目前不改变评分。目标和经历不会自动调整权重；城市和工时目前主要用于底线，不自动推导生活评分。\n\n## 4. 技术依赖图\n\n~~~mermaid\nflowchart LR\n  N[Node server.mjs 静态服务] --> H[index.html]\n  H --> C[styles.css]\n  H --> A[app.js 页面、事件、草稿]\n  A --> E[engine.js 纯计算]\n  A <--> L[浏览器 localStorage]\n  A <--> J[本地 JSON 文件]\n  T[engine.test.js] --> E\n~~~\n\n没有业务后端、数据库、登录、第三方分析或 AI 请求；当前实现不是 React 项目。server.mjs 不保存画像，也不计算分数。\n\n## 5. 你最需要审阅的产品决策\n\n1. 用户画像是否足够具体？优先补任务兴趣、工作方式还是现实责任？\n2. 第一版是否保留“用户给岗位打分”，还是增加问题和证据辅助打分？\n3. 哪些条件是硬底线，哪些应该允许权衡？\n4. 经济维度达到目标即封顶是否符合预期？是否需要分段效用？\n5. 当前只有所有机会完整且无底线问题时才给领先结论，是否应改为只比较合格机会？\n6. 已知项参考分可能受缺失信息结构影响，是否需要更突出范围或隐藏参考排名？\n7. MBTI 和八字是否作为独立趣味入口？两者均不直接计分。\n8. 一周内优先做动态追问、证据管理还是结果取舍解释？建议先画像确认与取舍解释。\n\n## 6. 审阅方式\n\n请用节点编号反馈，例如：B7 保留，增加“是否接受下班消息”；D7 修改，合格机会单独比较；B11 延后。交互图的审阅备注仅保存在本页浏览器；可导出 JSON 备份，再将意见提供给开发者。\n\nNotion 使用：将本 Markdown 文件导入 Notion，或复制正文。若图形未自动渲染，将 Mermaid 源码放入支持 Mermaid 的代码块。没有自动创建 Notion 页面。\n`;
md=md.replace('## 1. 全局架构','## 最新主流程\n\n自我画像 → Offer 信息 → 生成 Prompt → 用户自行粘贴到外部 AI；本地规则比较保留为辅助。新增 cities[]、背景信息、流动意愿、具体外派和出差字段。旧字段 city 自动迁移；下面数据实体表是初始模型概览，新增字段以 B12 / C10 / C11 / G 层及 model.js 为准。\n\n## 1. 全局架构');
await writeFile(new URL('./ARCHITECTURE.md',import.meta.url),md.replaceAll('2—4','2—8'));
const html=`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>OfferLens · 架构审阅图</title><style>
:root{font-family:system-ui,"Microsoft YaHei",sans-serif;color:#233c35;background:#f5f7f2}*{box-sizing:border-box}body{margin:0}header,main,footer{max-width:1200px;margin:auto;padding:30px 24px}header{padding-top:48px}h1{font-size:34px;margin:12px 0}p{line-height:1.8;color:#64776d;font-size:14px}.eyebrow{letter-spacing:2px;font-size:12px;color:#527c63}.toolbar{display:flex;gap:10px;flex-wrap:wrap;position:sticky;top:0;background:#f5f7f2ee;backdrop-filter:blur(12px);z-index:3;padding:14px 0}button,select,input,textarea{font:inherit}button,.download{border:1px solid #ccd8cb;border-radius:9px;background:white;color:#254d3d;padding:10px 14px;cursor:pointer;font-size:13px}button.active{background:#21594d;color:white}input[type=search]{border:1px solid #ccd8cb;border-radius:9px;padding:10px;min-width:200px;flex:1}h2{font-size:22px;margin:0 0 8px}h3{font-size:16px;margin:0}.diagram{border:1px solid #dce4d8;background:#fff;padding:26px;border-radius:20px}.flow{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;align-items:stretch}.flow a{display:block;text-decoration:none;border:1px solid #cfddca;background:#f0f5e8;border-radius:12px;padding:20px;color:#214c3d}.flow a b{font-size:20px;display:block;margin-bottom:8px}.arrow{text-align:center;margin:12px;color:#6d856d;font-size:13px}.boundary{padding:14px 18px;border-left:3px solid #92ab68;background:#f0f4e8;font-size:13px;line-height:1.8;margin-top:20px}.legend{display:flex;gap:10px;flex-wrap:wrap;margin:20px 0}.badge{font-size:11px;padding:4px 8px;border-radius:6px;white-space:nowrap;background:#edf0e9;color:#66725b}.done{background:#e6f0e1;color:#3f6837}.partial{background:#fff1d8;color:#94661d}.planned{background:#edf0f4;color:#687789}.group{margin-top:30px;scroll-margin-top:90px}.nodes{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.node{background:white;border:1px solid #dce4d8;border-radius:13px;align-self:start;overflow:hidden}summary{padding:17px;cursor:pointer;display:flex;align-items:center;gap:10px;list-style:none}summary:before{content:'＋';color:#7d9478}.node[open] summary:before{content:'−'}summary b{font-size:11px;color:#718469}summary strong{font-size:14px;flex:1}.detail{padding:0 18px 18px}.detail p{font-size:13px;margin:7px 0}.code{font:12px monospace;background:#f3f5ef;padding:9px;border-radius:7px;overflow-wrap:anywhere}.review{display:grid;grid-template-columns:110px 1fr;gap:9px;margin-top:15px}select,textarea{border:1px solid #d5dfd0;border-radius:7px;padding:9px;background:#fcfdf9;width:100%;font-size:13px}textarea{min-height:66px;resize:vertical}.tables{overflow-x:auto;margin:25px 0}table{border-collapse:collapse;width:100%;font-size:13px}th,td{text-align:left;padding:14px;border-bottom:1px solid #dce4d8;line-height:1.8;vertical-align:top}.question{padding:18px 22px;background:#e9efdf;border-radius:14px;margin-top:30px}.question li{margin:12px 0;font-size:14px;line-height:1.8}footer{font-size:12px;color:#71816e}a{color:#21594d}button:focus-visible,summary:focus-visible,textarea:focus-visible,select:focus-visible,input:focus-visible{outline:3px solid #9eb773;outline-offset:3px}.hidden{display:none!important}.technical{padding:18px;border:1px solid #d7e0d0;background:white;border-radius:12px;line-height:2;font-size:14px}#save-status{font-size:12px;color:#607a57}@media(max-width:650px){h1{font-size:27px}.flow,.nodes{grid-template-columns:1fr}main,header{padding:22px 16px}.diagram{padding:18px}summary{padding:15px;flex-wrap:wrap}summary .badge{margin-left:auto}.review{grid-template-columns:1fr}.toolbar{position:static}.flow a{padding:15px}.flow a b{font-size:17px}}@media print{.toolbar,.review,.download,#save-status{display:none}.node{break-inside:avoid}.nodes{display:block}.node{margin-bottom:10px}header,main{max-width:none}.group{break-before:auto}}
</style><header><div class="eyebrow">OFFERLENS / PRODUCT & SYSTEM MAP</div><h1>从认识自己，到看清选择</h1><p>项目架构与功能审阅图 · 2026-10-24 · ${total} 个节点<br>点击节点展开功能、代码位置与输出。给节点选择“保留 / 修改 / 延后 / 删除”，填写意见后导出审阅记录。</p><div class="legend"><span class="badge done">已实现</span><span class="badge partial">部分实现</span><span class="badge planned">计划 / 后续 / 暂不纳入</span></div><p>实现状态依据当前代码核对；已实现不等于通过真实用户验证。当前采用原生 JavaScript，没有业务后端和 AI 服务。</p></header><main><section class="diagram"><h2>01 · 全局关系</h2><p>先查看层级，再向下展开各节点。底层数据为各页面提供草稿，修改输入后回到引擎重算。</p><div class="flow"><a href="#A"><b>A · 入口与流程</b>开始填写 / 体验示例 →</a><a href="#B"><b>B · 用户画像</b>现实条件 / 目标 / 偏好 ↓</a><a href="#C"><b>C · 岗位画像</b>机会条件 / 工作内容 / 信息来源 ↓</a></div><div class="arrow">B 用户画像 + C 岗位画像 → D 决策引擎 → E 结果与行动 → 修改 B / C 后重算</div><div class="flow"><a href="#D"><b>D · 决策引擎</b>底线 → 效用 → 权重 → 未知边界</a><a href="#E"><b>E · 结果与行动</b>分项解释 / 核实清单 / 偏好调整</a><a href="#F"><b>F · 数据与工程</b>本地草稿 ↔ 页面；静态服务 → 浏览器</a></div><div class="boundary">探索边界：MBTI 当前仅记录；八字尚未实现。未来趣味探索只能引出待确认问题，由用户确认现实偏好后进入画像，不直接连接评分。</div></section><div class="toolbar"><button class="active" data-filter="all">全部节点</button><button data-filter="done">已实现</button><button data-filter="partial">部分实现</button><button data-filter="planned">待开发</button><button id="expand">全部展开</button><button id="collapse">全部收起</button><input id="search" type="search" aria-label="搜索节点" placeholder="搜索：画像、权重、八字…"><button id="export">导出审阅意见 ↓</button><button id="print">打印 / 存为 PDF</button></div><span id="save-status" role="status">审阅记录仅保存在本浏览器，与产品草稿分开。</span>${groups.map(g=>`<section class="group" id="${g.id}"><h2>${g.id} · ${g.name}</h2><p>${g.desc}</p><div class="nodes">${g.nodes.map(([id,name,s,desc,code,out])=>`<details class="node" data-status="${status(s)}" data-id="${id}"><summary><b>${id}</b><strong>${name}</strong><span class="badge ${status(s)}">${s}</span></summary><div class="detail"><p>${desc}</p><div class="code">${esc(code)}</div><p><strong>输出 / 下游：</strong>${out}</p><div class="review"><select aria-label="${id} 审阅决定"><option value="">尚未审阅</option><option>保留</option><option>修改</option><option>延后</option><option>删除</option></select><textarea aria-label="${id} 审阅备注" placeholder="写下你想修改的字段、层级或规则…"></textarea></div></div></details>`).join('')}</div></section>`).join('')}<section class="group"><h2>02 · 数据实体与关系</h2><div class="tables"><table><thead><tr><th>对象</th><th>当前内容</th><th>关系与边界</th></tr></thead><tbody><tr><td>Profile 用户画像</td><td>阶段、目标、三项底线、满意收入、两段经历、MBTI、六维权重</td><td>一份画像关联 2—4 个 offer；目标和经历不自动修改权重</td></tr><tr><td>Offer 岗位机会</td><td>名称、岗位、城市、工资、月数、奖金、工时、任务、总来源、五项自评</td><td>目前没有逐字段来源或岗位事实自动分析</td></tr><tr><td>Evaluation 计算结果</td><td>保证收入、底线、未知项、分项贡献、覆盖、范围、分数</td><td>从当前输入重算，不单独保存；信息来源不直接加减分</td></tr><tr><td>Draft 草稿</td><td>profile + offers + example</td><td>浏览器 localStorage 单份；无账号或跨设备同步</td></tr><tr><td>Evidence / Snapshot</td><td>独立证据、决策版本、复盘尚未实现</td><td>未来扩展，不应误认为已经具备</td></tr></tbody></table></div></section><section class="group"><h2>03 · 技术架构</h2><div class="technical">Node server.mjs（仅提供静态文件）<br>↓<br>index.html → styles.css + app.js（页面 / 事件 / 草稿）<br>app.js → engine.js（纯函数计算）<br>app.js ↔ localStorage / JSON 文件<br>engine.test.js → engine.js（六项规则检查）<br><br>所有业务计算在浏览器完成；无需安装第三方依赖。没有数据库、业务 API、模型请求或云端同步。</div></section><section class="question"><h2>04 · 优先检查这六件事</h2><ol><li>B6—B9：画像需要先补兴趣、工作方式，还是经历确认？</li><li>C4 / D8：继续让用户自评分，还是用问题与证据辅助匹配？</li><li>D3：底线的边界是否合理？哪些可以有条件接受？</li><li>D4：经济得分达到满意收入即封顶，是否需要调整？</li><li>D6—D7：缺失数据时如何呈现？是否仅在合格机会中比较？</li><li>B11：八字独立为趣味入口，是否进入后续版本？</li></ol><p>反馈示例：B7 修改，增加“能否接受下班消息”；D7 修改，仅比较合格机会；B11 延后。</p></section></main><footer>审阅图与产品数据相互独立。可直接离线打开本 HTML。对应 Notion 导入笔记：同目录 ARCHITECTURE.md。浏览器清理数据可能丢失审阅备注，请及时导出。</footer><script>
const key='offerlens.architecture.review.v1'; let notes={};try{notes=JSON.parse(localStorage.getItem(key)||'{}')||{}}catch{} let filter='all';
const nodes=[...document.querySelectorAll('.node')];
for(const node of nodes){const id=node.dataset.id;const select=node.querySelector('select'),text=node.querySelector('textarea'); select.value=notes[id]?.decision||'';text.value=notes[id]?.note||'';const save=()=>{notes[id]={decision:select.value,note:text.value};try{localStorage.setItem(key,JSON.stringify(notes));document.querySelector('#save-status').textContent='审阅意见已保存至本浏览器；导出可备份。'}catch{document.querySelector('#save-status').textContent='保存失败，请立即导出审阅意见。'}};select.addEventListener('change',save);text.addEventListener('input',save)}
function apply(){const q=document.querySelector('#search').value.trim().toLowerCase();for(const n of nodes)n.classList.toggle('hidden',(filter!=='all'&&n.dataset.status!==filter)||!n.textContent.toLowerCase().includes(q));for(const g of document.querySelectorAll('section.group[id]'))g.classList.toggle('hidden',![...g.querySelectorAll('.node')].some(n=>!n.classList.contains('hidden')))}
for(const b of document.querySelectorAll('[data-filter]'))b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));apply()};document.querySelector('#search').oninput=apply;document.querySelector('#expand').onclick=()=>nodes.forEach(n=>n.open=true);document.querySelector('#collapse').onclick=()=>nodes.forEach(n=>n.open=false);document.querySelector('#export').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({project:'OfferLens',architectureDate:'2026-10-24',exportedAt:new Date().toISOString(),notes},null,2)],{type:'application/json'}));a.download='offerlens-architecture-review.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};document.querySelector('#print').onclick=()=>{nodes.forEach(n=>{n.classList.remove('hidden');n.open=true});document.querySelectorAll('.group').forEach(g=>g.classList.remove('hidden'));window.print();apply()};
</script></html>`;
await writeFile(new URL('./architecture.html',import.meta.url),html.replaceAll('2—4','2—8').replace('<div class="toolbar">','<section class="diagram" style="margin-top:18px"><h2>新增主路径 · G Prompt 输出</h2><p>B 用户画像 + C 岗位画像 → <a href="#G">G 本地生成、预览并复制 Prompt</a> → 用户自行选择 AI 分析。D / E 本地规则结果保留为辅助，无需本项目调用模型。</p></section><div class="toolbar">'));
console.log(`架构图与 Markdown 已生成：${groups.length} 层，${total} 个节点。`);
