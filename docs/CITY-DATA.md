# 城市名称选项

下载日期：2026-10-24。

来源：[modood/Administrative-divisions-of-China](https://github.com/modood/Administrative-divisions-of-China)，dist/cities.json 与 dist/areas.json，许可证见 CITY-DATA-LICENSE.txt。来源仓库说明使用 2023 年统计区划快照，不保证是实时最新区划。

保留地级城市及地区名称、县级市，排除“市辖区”和“省直辖县级行政区划”等容器名称；另补充四个直辖市、香港、澳门和部分台湾城市。不是完整覆盖所有乡镇或台湾地区行政区划。没有目标城市时支持手动添加。

使用 Intl.Collator 的中文拼音排序。选项保存在本地 cities.js，填写时不访问外部接口。重新生成：node docs/build-cities.mjs。
