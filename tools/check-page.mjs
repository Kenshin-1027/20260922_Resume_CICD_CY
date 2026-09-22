// 个人主页自检脚本
//
// 用法：node tools/check-page.mjs
//
// GitHub Actions 里跑的就是这一条，推上去之前先在本地跑一次，能省一次失败的推送。
//
// 页面内容现在全部来自 content.js、由 app.js 渲染，所以这个脚本除了查 index.html，
// 还要把 content.js 执行一遍来核对：栏目数据齐不齐、图片在不在、alt 合不合格。
//
// 查的都是人工很容易漏、机器几秒钟能查完的东西：
//   1. 必须有的文件在不在
//   2. index.html 引用的本地文件是不是真的存在
//   3. 页内锚点 #xxx 有没有对应的 id
//   4. content.js 该有的段落齐不齐
//   5. 每张图有没有文件、有没有像样的 alt
//
// 不依赖任何第三方包，Node 24 自带的能力就够。

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const problems = [];
const ok = (msg) => console.log('  [OK]', msg);
const bad = (msg) => { problems.push(msg); console.log('  [X] ', msg); };

console.log('== 1. 必须有的文件 ==');
// content.js 是内容唯一来源，app.js 负责渲染并绑交互，缺一个页面就是空的
for (const name of ['index.html', 'styles.css', 'content.js', 'app.js']) {
  if (fs.existsSync(path.join(root, name))) ok(name);
  else bad(`缺少 ${name}`);
}

const htmlPath = path.join(root, 'index.html');
if (!fs.existsSync(htmlPath)) {
  console.log('\n找不到 index.html，后面的检查没法做。');
  process.exit(1);
}
const html = fs.readFileSync(htmlPath, 'utf8');

console.log('\n== 2. index.html 引用的本地文件 ==');
// 取出所有 href/src，跳过 http(s)、data:、mailto: 和页内锚点
const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)]
  .map((m) => m[1])
  .filter((v) => !/^(https?:|data:|mailto:|#|\/\/)/.test(v));

for (const ref of [...new Set(refs)]) {
  const target = path.join(root, ref.split('?')[0].split('#')[0]);
  if (fs.existsSync(target)) ok(ref);
  else bad(`引用了不存在的文件：${ref}`);
}

console.log('\n== 3. 页内锚点 ==');
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const anchors = [...new Set([...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]))];
for (const anchor of anchors) {
  // 手册示例里的占位符不算问题
  if (anchor === '栏目ID') continue;
  if (ids.has(anchor)) ok(`#${anchor}`);
  else bad(`导航指向 #${anchor}，但页面里没有 id="${anchor}"`);
}

// ---------------- 把 content.js 执行一遍 ----------------
// 在沙箱里直接执行它、把 content 取回来，比用正则去扒文本可靠得多；
// 顺便还能顺手发现语法错误 —— 写错一个逗号，这里就会直接报出来。
const contentPath = path.join(root, 'content.js');
let content = null;
if (fs.existsSync(contentPath)) {
  try {
    content = new Function(`${fs.readFileSync(contentPath, 'utf8')}; return content`)();
  } catch (error) {
    bad(`content.js 执行出错，检查一下括号和逗号：${error.message}`);
  }
} else {
  bad('缺少 content.js');
}

console.log('\n== 4. content.js 的段落 ==');
// 少一段页面就会缺一块，而看上去只是"少了点东西"，很容易被忽略，所以逐个列出来核对。
for (const key of [
  'meta', 'hero', 'direction', 'details', 'experience', 'projects',
  'skills', 'goals', 'records', 'worksNotice', 'works',
]) {
  if (content?.[key]) ok(`content.${key}`);
  else bad(`content.js 缺少 content.${key}`);
}

console.log('\n== 5. 图片的文件和 alt ==');
// alt 是图片加载失败时的替代文字，也是视障用户理解图片的唯一途径。
// 它很容易在改代码时被删掉，而且**页面看起来完全正常**，人工发现不了——
// 这正是最适合交给机器查的那类问题。
const WEAK_ALT = new Set(['图片', '照片', 'image', 'photo', 'img']);
const images = [
  { src: content?.hero?.avatar, alt: content?.hero?.avatarAlt },
  ...(Array.isArray(content?.works) ? content.works.map((work) => ({ src: work?.image, alt: work?.alt })) : []),
];

for (const { src, alt } of images) {
  if (!src) { bad('有一张图没写文件路径'); continue; }
  if (!fs.existsSync(path.join(root, src))) { bad(`图片不存在：${src}`); continue; }
  if (!String(alt ?? '').trim()) { bad(`图片缺少 alt：${src}`); continue; }
  if (WEAK_ALT.has(String(alt).trim())) { bad(`alt 写得太笼统（"${alt}"）：${src}`); continue; }
  ok(`${src} → ${alt}`);
}

console.log('');
if (problems.length) {
  console.log(`自检未通过，共 ${problems.length} 个问题，请逐条修好再提交。`);
  process.exit(1);
}
console.log('自检通过。');
