import {readFile,writeFile} from 'node:fs/promises';
const cities=JSON.parse(await readFile(new URL('../cities-source.json',import.meta.url),'utf8'));
const areas=JSON.parse(await readFile(new URL('../areas-source.json',import.meta.url),'utf8'));
const names=[...new Set([...cities.filter(x=>!['市辖区','县'].includes(x.name)&&!x.name.includes('直辖县级')).map(x=>x.name),...areas.filter(x=>x.name.endsWith('市')).map(x=>x.name),'北京市','天津市','上海市','重庆市','香港','澳门','台北市','新北市','桃园市','台中市','台南市','高雄市','基隆市','新竹市','嘉义市'])].sort(new Intl.Collator('zh-Hans-CN-u-co-pinyin').compare);
await writeFile(new URL('../cities.js',import.meta.url),`// 城市及地区选项，来源及覆盖范围见 docs/CITY-DATA.md。\nexport const cities = ${JSON.stringify(names,null,2)};\n`);
console.log(`生成 ${names.length} 个城市及地区选项`);
