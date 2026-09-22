// 个人主页脚本。
//
// 只做两件事：
//   1. 把 content.js 里的数据渲染成页面；
//   2. 绑交互：导航高亮、阅读进度条、返回顶部、栏目淡入、作品筛选与排序。
//
// 内容全部在 content.js，**改资料不用碰这个文件**。
// 只有想新增一个完整栏目时，才需要在这里的 blocks 里加一条渲染规则。
//
// 加载顺序：index.html 里 content.js 必须排在 app.js 前面，这个文件要读前者定义的内容。

// ---------- 小工具 ----------
// 按选择器找元素。文字简写只是为了让下面的代码短一点，功能就是原生方法。
const $ = (selector) => document.querySelector(selector)
const $$ = (selector) => [...document.querySelectorAll(selector)]

// 内容里出现 & < > " 时，拼进 HTML 会被当成标签解析，所以统一转义成普通文字。
const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }
const esc = (value) => String(value ?? '').replace(/[&<>"]/g, (char) => ESCAPES[char])

// ---------- 作品区的状态 ----------
// 筛选和排序的当前值集中放在这里。值一改就重画一次列表，界面永远跟着状态走。
let activeTag = '全部'
let newestFirst = true

// 按当前状态算出要显示哪些作品、按什么顺序
function visibleWorks() {
  const filtered =
    activeTag === '全部' ? content.works : content.works.filter((work) => work.tags.includes(activeTag))
  // filter 返回的是新数组，而 sort 会就地改动，所以先复制一份再排。
  // 少了复制这一步，反复切换排序会把 content.works 的原始顺序打乱。
  return [...filtered].sort((a, b) => (newestFirst ? b.year - a.year : a.year - b.year))
}

// ---------- 渲染规则 ----------
// 每个键对应 HTML 里 data-block="同名" 的位置，值是一个"数据 → HTML 字符串"的函数。
// 参数就是 content.js 里同名的数据；brand / footerName 要跨段取姓名，直接用 content。
//
// 要新增一个栏目：这里加一条规则，content.js 加一段数据，index.html 加一个挂载点。
const blocks = {
  // 头部和页脚的姓名名片，都取 hero 里的姓名，不用重复维护
  brand: () => `${esc(content.hero.name)}<span>${esc(content.hero.nameEn)}</span>`,
  footerName: () => `${esc(content.hero.name)}<span>${esc(content.hero.nameEn)}</span>`,

  // 首屏：姓名、身份、学校班级、头像
  hero: (profile) => `
    <div class="hero-copy">
      <h1>
        ${esc(profile.name)}
        <span>${esc(profile.nameEn)}</span>
      </h1>
      <p class="hero-role">${esc(profile.role)}</p>
      <p class="hero-school">${esc(profile.school)} · ${esc(profile.className)}</p>
    </div>
    <div class="hero-visual">
      <figure>
        <img alt="${esc(profile.avatarAlt)}" height="220" src="${esc(profile.avatar)}" width="220"/>
      </figure>
    </div>
  `,

  // 一句话：现在会什么、在学什么
  direction: (text) => `
    <span class="eyebrow">学习方向</span>
    <p>${esc(text)}</p>
  `,

  // 基本信息四格
  details: (list) =>
    list.map((item) => `<div><span>${esc(item.label)}</span><p>${esc(item.value)}</p></div>`).join(''),

  // 经历
  experience: (list) =>
    list
      .map(
        (item) => `
    <div class="experience-item">
      <p class="experience-heading">
        <strong>${esc(item.name)}</strong>
        <time>${esc(item.time)}</time>
      </p>
      <p class="experience-detail">${esc(item.detail)}</p>
    </div>
  `,
      )
      .join(''),

  // 项目
  projects: (list) =>
    list
      .map(
        (item) => `
    <article class="research-item">
      <h3>
        <time>${esc(item.time)}</time>
        ${esc(item.title)}
      </h3>
      <p>${esc(item.detail)}</p>
    </article>
  `,
      )
      .join(''),

  // 技能
  skills: (list) =>
    list.map((item) => `<li><strong>${esc(item.label)}</strong>${esc(item.detail)}</li>`).join(''),

  // 目标：就是一串字符串
  goals: (list) => list.map((text) => `<li>${esc(text)}</li>`).join(''),

  // 过程记录
  records: (list) =>
    list.map((item) => `<li><strong>${esc(item.date)}</strong> ${esc(item.text)}</li>`).join(''),

  // 作品区上方那句说明
  worksNotice: (text) => esc(text),

  // 作品卡片。封面底色取自数据里的 cover，写在卡片的 CSS 变量上，
  // 所以加作品、换颜色都不用去改 styles.css。
  works: () => {
    const list = visibleWorks()
    // 筛完一个不剩时要说一句话，不能让列表空着
    if (list.length === 0) return '<li class="works-empty">这个标签下还没有作品。</li>'
    return list
      .map(
        (work) => `
    <li class="work-card" style="--cover:${esc(work.cover)}">
      <span class="work-year">${esc(work.year)}</span>
      <a href="${esc(work.url)}" rel="noopener noreferrer" target="_blank">
        <div class="work-cover">
          <img alt="${esc(work.alt)}" decoding="async" height="800" src="${esc(work.image)}" width="1200"/>
        </div>
        <div class="work-copy">
          <h3>${esc(work.title)}</h3>
          <p>${esc(work.description)}</p>
        </div>
      </a>
    </li>
  `,
      )
      .join('')
  },
}

// ---------- 把数据挂到页面上 ----------
// HTML 里每个 data-block="xxx"，用 blocks 里同名的规则填上 content.xxx。
// works 这一步先画出默认状态，后面筛选和排序时由 renderWorks 重画。
for (const mount of $$('[data-block]')) {
  const key = mount.dataset.block
  mount.innerHTML = blocks[key](content[key])
}

// 标签页标题也来自 content.js，改名不用去翻 HTML
document.title = content.meta.title
$('meta[name="description"]').setAttribute('content', content.meta.description)

// ---------- 作品区：筛选 + 排序 ----------
function renderWorks() {
  $('.portfolio-list').innerHTML = blocks.works()
}

// 标签按钮由数据生成：作品里出现过哪些标签，就出现哪些按钮，加新标签不用改这里。
function renderTags() {
  const tags = ['全部', ...new Set(content.works.flatMap((work) => work.tags))]
  $('#works-tags').innerHTML = tags
    .map((tag) => `<button type="button" aria-pressed="${tag === activeTag}">${esc(tag)}</button>`)
    .join('')
}

// 工具栏用事件委托：只在容器上挂一个监听器。按钮是后来才生成的，这样也能响应，
// 而且以后加多少个标签都只占一个监听器。
$('#works-tags').addEventListener('click', (event) => {
  const button = event.target.closest('button')
  if (!button) return
  activeTag = button.textContent
  renderTags() // 重画按钮，更新 aria-pressed 高亮
  renderWorks() // 重画列表
})

$('#works-sort').addEventListener('click', (event) => {
  newestFirst = !newestFirst
  event.currentTarget.textContent = newestFirst ? '按年份：新→旧' : '按年份：旧→新'
  renderWorks()
})

renderTags()

// ---------- 导航高亮 + 当前栏目徽标 ----------
// 导航链接上的文字就是栏目名，直接从 HTML 读，不另外维护一份对照表：
// 以后加一个栏目，这里的代码一行都不用改。
const navLinks = $$('nav a')
const sectionNames = new Map(navLinks.map((link) => [link.getAttribute('href'), link.textContent.trim()]))

function showCurrent(hash) {
  const current = hash || '#about' // 没有 # 时默认第一个栏目，否则刚打开什么都不高亮
  $('#section-indicator').textContent = sectionNames.get(current) || ''

  for (const link of navLinks) {
    const isCurrent = link.getAttribute('href') === current
    // 高亮长什么样由 CSS 的 nav a.is-current 决定，JS 只管什么时候加这个类
    link.classList.toggle('is-current', isCurrent)
    // 顺带告诉读屏软件"当前在这一项"。视觉上看不见，但无障碍要靠它，不是额外功能。
    if (isCurrent) link.setAttribute('aria-current', 'location')
    else link.removeAttribute('aria-current')
  }
}

// 点导航、按前进后退都会改 hash，hash 一变就重新高亮
window.addEventListener('hashchange', () => showCurrent(location.hash))
// 这行不能省：直接打开 index.html#skills 时 hash 从头到尾没有"变化"过，hashchange 不会触发
showCurrent(location.hash)

// ---------- 阅读进度条 ----------
function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight
  // 页面太短时 scrollable 是 0，除以 0 得到 NaN，进度条就不动了，先挡一下
  const ratio = scrollable > 0 ? window.scrollY / scrollable : 0
  $('#reading-progress').style.width = `${ratio * 100}%`
}

// ---------- 返回顶部 ----------
$('#to-top').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  // 回到顶部后地址栏的 # 还停在原处，手动同步一下，否则徽标还写着刚才那个栏目
  history.replaceState(null, '', location.pathname)
  showCurrent('#about')
})

// 滚动一秒能触发几十次，所以只在**一个** scroll 监听器里做两件事：更新进度条、决定按钮显不显示。
window.addEventListener('scroll', () => {
  updateProgress()
  // 用视口高度的一半多作为阈值，而不是写死像素，手机和电脑都合适
  $('#to-top').classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6)
})
updateProgress() // 刷新时可能已经滚在中间，首屏也算一次

// ---------- 栏目进出视口的两件事 ----------
// 页面上所有栏目。hero 是首屏，section 是其余栏目，两类都要。
const sections = $$('main .hero[id], main section[id]')

// IntersectionObserver 由浏览器底层实现，只在元素真的进出视口时通知，
// 比在 scroll 回调里逐个算位置省性能。
const spy = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) showCurrent(`#${entry.target.id}`)
    }
  },
  // rootMargin 把判定区收窄到屏幕中间一条，必须滚到中间才算"进入这个栏目"。
  // 不收窄的话栏目刚露头就切换，滚动时高亮会来回乱跳。
  { rootMargin: '-45% 0px -45% 0px' },
)
sections.forEach((section) => spy.observe(section))

// 栏目第一次进入视口时淡入上移，只做一次，往回滚不会再淡一遍
const reveal = new IntersectionObserver(
  (entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      entry.target.classList.add('is-visible')
      observer.unobserve(entry.target) // 已经显示过就不用再盯着它了
    }
  },
  { threshold: 0.15 }, // 露出 15% 就算进入
)
sections.forEach((section) => reveal.observe(section))
