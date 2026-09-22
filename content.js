// ===========================================================================
// 全站内容 —— 日常只需要改这一个文件
// ===========================================================================
//
// 页面上的每一个字、每一张图都来自这里。改资料、加经历、加项目、加作品，
// 都只动这个文件，index.html、styles.css、app.js 都不用碰。
//
// 改完之后的流程：
//   1. 本地跑一次 `node tools/check-page.mjs`，确认没有漏文件、漏 alt；
//      （GitHub Actions 里也会跑同一条，不过本地先跑能省一次失败的推送）
//   2. git add -A && git commit -m "..." && git push
//   3. 工作流自动检查并发布，网址不变，不用手动传文件。
//
// 各段数据的含义：
//   meta        浏览器标签页标题、搜索引擎看到的简介
//   hero        首屏：姓名、身份、学校班级、头像
//   direction   一句话：现在会什么、在学什么
//   details     基本信息四格，想加一格就多写一个 { label, value }
//   experience  经历，一条一个 { name, time, detail }
//   projects    项目，一条一个 { time, title, detail }
//   skills      技能，一条一个 { label, detail }
//   goals       本学期目标，一串字符串
//   records     过程记录，一条一个 { date, text }
//   works       作品，一条一个对象。页面上那排标签按钮和年份排序都由它生成
//
// 注意：下面这些字符串里如果出现 & < > " 会被自动转成普通文字显示，
// 不会把页面结构搞坏，所以放心写。

const content = {
  meta: {
    title: '陈林希 · 个人主页',
    description: '陈林希的个人主页：学习经历、技能与课程作品。',
  },

  hero: {
    name: '陈林希',
    nameEn: 'Chen Linxi',
    role: '在校学生 · 前端开发方向',
    school: '广东科学技术职业学院',
    className: '25大模型应用产业学院班',
    avatar: 'assets/avatar.svg',
    avatarAlt: '个人头像占位图，请替换为自己的图片',
  },

  direction:
    '从写静态页面开始，现在能自己排响应式布局、用 Git 管版本，并让 GitHub Actions 自动发布。数据库和接口还在学。',

  details: [
    { label: '学习阶段', value: '在读学生' },
    { label: '所在城市', value: '珠海' },
    { label: '联系', value: '18902702190' },
    { label: '学校地址', value: '广东科学技术职业学院' },
  ],

  // 想加一条经历，复制一整个 { } 块贴在最前面，改成新内容
  experience: [
    {
      name: '广东科学技术职业学院 · 25大模型应用产业学院班',
      time: '在读',
      detail: '课程进行到第 6 周，做完 5 个网页练习，第一个是自己设计并发布上线的个人主页。',
    },
    {
      name: '个人练习 · Git 与网站发布',
      time: '2026 年 9 月起',
      detail:
        '把每次改动提交到个人仓库，用 GitHub Actions 自动发布到 GitHub Pages。改完推送就会更新，不用手动传文件。',
    },
  ],

  projects: [
    {
      time: '2026 年 9 月',
      title: '个人主页（课程项目）',
      detail:
        '基于课程模板做个人主页。作品列表不写在 HTML 里，而是用 JavaScript 从一份数据文件渲染，以后加作品只改数据。用 Git 记录改动，推送到自己的仓库后由 GitHub Actions 自动发布。测试时发现 4 张作品卡的封面颜色全一样，查到是脚本重建卡片时把标识类名覆盖掉了，改掉后恢复正常。',
    },
    {
      time: '2026 年 9 月',
      title: '作品筛选与排序',
      detail:
        '把 4 个作品写成一份数据，每个记着年份和标签。页面加载后用 JavaScript 生成卡片，上面一排按钮可以只看某一类作品，旁边的按钮按年份从新到旧或从旧到新排。',
    },
  ],

  skills: [
    { label: '页面结构', detail: 'HTML5 语义标签、表单、图片与链接；标题层级和图片 alt 会逐个检查。' },
    {
      label: '页面样式',
      detail: 'CSS3 配色与字体、Flex 和 Grid 布局、媒体查询；做了 1000px 和 640px 两档断点，手机上单列显示。',
    },
    {
      label: '开发工具',
      detail:
        'Git 常用命令（clone、commit、remote、push）、GitHub Pages 与 Actions；会用浏览器检查面板和控制台排查样式问题。',
    },
  ],

  goals: [
    '每次课留一个能跑起来的小改动，不留半成品。',
    '改过的 HTML、CSS、JavaScript 都能说清为什么这么写。',
    '每个作品都用 Git 记录版本，别人打开网址就能看到。',
  ],

  records: [
    { date: '2026-09-22', text: '完成个人主页，提交到自己的仓库，由 GitHub Actions 自动发布到 GitHub Pages。' },
    {
      date: '2026-09-22',
      text: '修好作品卡片封面配色的问题，并写了一份问题记录：重现步骤、实际现象、涉及文件、修复内容、重测结果。',
    },
    {
      date: '2026-09-22',
      text: '在 1366px 和 390px 两档宽度下检查页面，没有横向滚动条；用自检脚本核对过文件、链接锚点和图片 alt。',
    },
  ],

  worksNotice: '以下 4 个是课程里的示例项目，点卡片可以打开实际网页；自己的作品做好后替换这里。',

  // 加一个作品 = 复制一整块贴在最前面，改掉里面的值。
  //   cover  封面底色，想换颜色只改这里，不用去 styles.css 加规则
  //   tags   决定页面上有哪些筛选按钮，写新标签按钮会自己出现
  //   year   决定年份徽标和排序
  works: [
    {
      title: '长风成卷 · 博客应用',
      description: '文章展示、接口与数据库。',
      image: 'assets/work-blog.png',
      alt: '长风成卷 · 博客应用的实际网页截图',
      url: 'https://ffd-p2-blog.netlify.app/',
      year: 2026,
      tags: ['前端', '后端', '数据库'],
      cover: '#e5e0d1',
    },
    {
      title: '群像云图 · 社区应用',
      description: '内容发布与社区互动。',
      image: 'assets/work-community.png',
      alt: '群像云图 · 社区应用的实际网页截图',
      url: 'https://ffd-p3-community.netlify.app/',
      year: 2026,
      tags: ['前端', '数据库', '部署'],
      cover: '#dbe5dc',
    },
    {
      title: '一笺心意 · 祝福卡片',
      description: '卡片制作与作品分享。',
      image: 'assets/work-greeting-card.png',
      alt: '一笺心意 · 祝福卡片的实际网页截图',
      url: 'https://ffd-p4-greeting-card.netlify.app/',
      year: 2025,
      tags: ['前端', 'AI'],
      cover: '#ece0d9',
    },
    {
      title: '星声音乐站 · 音乐应用',
      description: '网页音频与交互实践。',
      image: 'assets/work-music-station.png',
      alt: '星声音乐站 · 音乐应用的实际网页截图',
      url: 'https://ffd-p5-music-station.netlify.app/',
      year: 2025,
      tags: ['前端', '测试'],
      cover: '#dfe3e7',
    },
  ],
}
