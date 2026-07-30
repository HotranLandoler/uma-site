/**
 * 《键盘农场》菜格测试 —— 文案与数据
 *
 * 文案来源：菜格测试-最终编辑版.md（与原 index.html 一致）。
 * 迭代文案时只需编辑本文件，无需改动组件逻辑。
 */

/** 六种菜格类型标识 */
export type TypeKey =
  | "holly"
  | "lotus"
  | "carrot"
  | "apple"
  | "banana"
  | "coconut";

/** 单个选项的得分：可给一个或多个类型加分 */
export type Score = Partial<Record<TypeKey, number>>;

export interface Option {
  /** 选项文案 */
  t: string;
  /** 选项得分 */
  s: Score;
}

export interface Question {
  /** 题干 */
  q: string;
  /** 选项 */
  a: Option[];
}

export interface FriendRel {
  /** 关联的菜格类型 */
  key: TypeKey;
  /** 关系副标题 */
  tagline: string;
  /** 关系种类 */
  kind: "tense" | "recommend";
}

export interface Relations {
  /** 推荐农友 */
  recommend: FriendRel[];
  /** 会让你紧张（可选） */
  tense?: FriendRel[];
}

export interface TypeInfo {
  /** 类型名 */
  name: string;
  /** 表情符号 */
  emoji: string;
  /** 结果图（public 内路径） */
  image: string;
  /** 结果描述 */
  desc: string;
  /** 关键词标签 */
  tags: string[];
  /** 关系卡顶部标题 */
  heroTitle: string;
  /** 头像底色 */
  avatarBg: string;
  /** 类型主色（用于名称） */
  color: string;
  /** 菜格关系 */
  relations: Relations;
}

/** 界面固定文案 */
export const UI = {
  brand: "键盘农场",
  brandSprout: "/vgti/stages/stage-2.png",
  brandSproutAlt: "发芽植物",
  titleLines: ["测测你的", "菜格类型"],
  lead: "上班、写作业、赶 deadline、约下午茶……你的键盘农场里，长出了哪一种菜格？",
  pills: ["约 2 分钟", "9 道生活题", "凭第一反应选择"],
  startBtn: "开始测试",
  countHint: "凭第一反应选择",
  backHint: "不用纠结，菜格会自己长出来。",
  backBtn: "上一题",
  saveBtn: "保存结果图片",
  againBtn: "重新测试",
  preparing: "正在准备图片…",
  shareDone: "已保存/分享。",
  downloadDone: "图片已开始下载，可保存到手机相册。",
  captureFail: "保存失败，请长按结果图片保存到手机。",
  shareTitle: "我的菜格测试结果",
} as const;

/** 并列优先级（高 → 低）：香蕉 ＞ 莲花 ＞ 萝卜 ＞ 椰子 ＞ 冬青 ＞ 苹果 */
export const TIE_ORDER: TypeKey[] = [
  "banana",
  "lotus",
  "carrot",
  "coconut",
  "holly",
  "apple",
];

/** 测试题 */
export const QUESTIONS: Question[] = [
  {
    q: "周一打开电脑，发现今天的事情比想象中多。你的第一反应是？",
    a: [
      { t: "先列清单，把截止时间和优先级排出来。", s: { apple: 2 } },
      { t: "缓慢开机中。身体还没反应过来已经到周一了。", s: { lotus: 2 } },
      { t: "该不会周一就要加班吧。", s: { banana: 2 } },
      { t: "去准备一杯好喝的，先把心情调到能工作的频道。", s: { coconut: 2 } },
      { t: "像往常一样，有条不紊地处理工作。", s: { holly: 1, carrot: 1 } },
    ],
  },
  {
    q: "同事发来一句“有个小问题想问你”。你通常会？",
    a: [
      { t: "心里一紧：不会又有什么坑吧？", s: { carrot: 2, banana: 1 } },
      { t: "先问清楚需求、负责人和什么时候要。", s: { apple: 2 } },
      { t: "看到了，等等再认真回。", s: { lotus: 2 } },
      { t: "先回个表情包！", s: { coconut: 1, holly: 1 } },
    ],
  },
  {
    q: "朋友圈里突然开始晒恋爱、旅行、节日礼物，你会？",
    a: [
      { t: "默默看完，点个赞，然后继续做自己的事。", s: { holly: 2 } },
      {
        t: "关注他们吃了什么、去了哪家店、买了什么好东西。",
        s: { coconut: 2 },
      },
      {
        t: "认真思考：大家的生活都很精彩，我也要努力。",
        s: { banana: 2, apple: 1 },
      },
      {
        t: "不看朋友圈。什么？你说xxx官宣了？我咋不知道？",
        s: { carrot: 1, lotus: 1 },
      },
    ],
  },
  {
    q: "距离进度汇报还有三天，你更像哪种状态？",
    a: [
      { t: "节点已经排好了，今天该推进哪一块很清楚。", s: { apple: 2 } },
      { t: "反复确认有没有疏漏。", s: { banana: 2 } },
      { t: "这不是还有三天吗？今天先躺一下。", s: { lotus: 2 } },
      { t: "先过一遍流程，看看哪里最容易翻车。", s: { carrot: 2 } },
    ],
  },
  {
    q: "和朋友们相约假期出去玩，现在正在制定规划，你会？",
    a: [
      { t: "我有真实踩坑清单，先讲不推荐什么。", s: { carrot: 2 } },
      { t: "把价格、评价、路线和注意事项整理好。", s: { apple: 1, carrot: 1 } },
      {
        t: "推荐一家被网红种草的氛围好、东西也好吃的新店。",
        s: { coconut: 2 },
      },
      { t: "我都可以，你们决定，我跟着就行。", s: { holly: 2 } },
    ],
  },
  {
    q: "早上闹钟响了，你最可能是？",
    a: [
      { t: "已经按了7次“再睡一会”。", s: { lotus: 2 } },
      { t: "刚醒就开始想今天所有待办。", s: { banana: 2 } },
      { t: "按计划起床，准备去公园晨跑。", s: { apple: 2 } },
      { t: "一想到待会早餐吃什么就想笑。", s: { coconut: 2 } },
    ],
  },
  {
    q: "下午三点状态掉线，你会怎么做？",
    a: [
      { t: "咖啡、奶茶、小蛋糕，随便一个都能救我。", s: { coconut: 2 } },
      { t: "安静一会儿，下楼散散心，给桌面绿植浇浇水。", s: { holly: 2 } },
      { t: "需要有人拍我一下，不然我会继续掉线。", s: { lotus: 2 } },
      { t: "开始焦虑，总觉得今天要来不及。", s: { banana: 2 } },
    ],
  },
  {
    q: "深夜12点，你在做什么？",
    a: [
      {
        t: "再打最后一把游戏！下把赢了肯定去睡！/只看最后一集！我保证看到女主复仇成功了就去睡！",
        s: { lotus: 2 },
      },
      { t: "已经进入梦乡。", s: { carrot: 2 } },
      {
        t: "睡不着，脑海里在想前几天自己在同事面前出糗的事。",
        s: { banana: 2 },
      },
      { t: "还在学习/复盘！强者不需要睡觉。", s: { apple: 2 } },
    ],
  },
  {
    q: "如果键盘农场能帮你今天顺利一点，你最想要它长出什么？",
    a: [
      { t: "🍎 自动冒出Todo List，提醒大家往前走。", s: { apple: 2 } },
      { t: "🥕每次翻车都记录在便利贴，方便下次避坑。", s: { carrot: 2 } },
      {
        t: "🥥更多有趣的物品！比如午后长出一杯让人开心的奶茶。",
        s: { coconut: 2 },
      },
      {
        t: "🪷记录我每天的成长和工作，帮助我顺利进入盛开状态。",
        s: { lotus: 2 },
      },
      {
        t: "🌲番茄钟。旁边再热闹，我也能安稳地保持自己的节奏。",
        s: { holly: 2 },
      },
      {
        t: "🍌更多舒缓的音乐，让我把脑内的小剧场先暂停十分钟。",
        s: { banana: 2 },
      },
    ],
  },
];

/** 结果文案 */
export const TYPES: Record<TypeKey, TypeInfo> = {
  holly: {
    name: "冬青",
    emoji: "🌲",
    image: "/vgti/holly.png",
    desc: "你经常出现在热闹、节日、情侣氛围旁边，但不一定要加入。你低调旁观，偶尔单身自嘲，不依附别人，也能默默常绿。",
    tags: ["低调旁观", "单身自嘲", "默默常绿"],
    heroTitle: "最适合和TA们一起玩",
    avatarBg: "#d6efd2",
    color: "#3e7f55",
    relations: {
      recommend: [
        { key: "coconut", tagline: "一起收集小确幸", kind: "recommend" },
        { key: "carrot", tagline: "安静可靠搭子", kind: "recommend" },
        { key: "lotus", tagline: "互相不催不急", kind: "recommend" },
      ],
    },
  },
  lotus: {
    name: "莲花",
    emoji: "🪷",
    image: "/vgti/lotus.png",
    desc: "你有点佛系，你身边有种令人宁静的磁场。你不是没有潜力，只是启动需要一点外力。起床、开工、回复消息都可能卡一下；但只要被推一把，你也能让人看到惊艳的一面。",
    tags: ["需要启动", "有潜力", "被点燃后很强"],
    heroTitle: "最适合和TA们一起玩",
    avatarBg: "#f3d6e3",
    color: "#a64d7a",
    relations: {
      recommend: [
        { key: "apple", tagline: "轻轻推你启动", kind: "recommend" },
        { key: "coconut", tagline: "用仪式感开机", kind: "recommend" },
        { key: "carrot", tagline: "陪你稳稳落地", kind: "recommend" },
      ],
    },
  },
  carrot: {
    name: "萝卜",
    emoji: "🥕",
    image: "/vgti/carrot.png",
    desc: "你可能经常踩坑：工作踩坑、餐厅踩坑、网购踩坑。但你踩完会记下来，你的经验越来越丰富，成为朋友眼里那个最踏实可靠的人。",
    tags: ["经常踩坑", "务实可靠", "避坑体质"],
    heroTitle: "最适合和TA们一起玩",
    avatarBg: "#d8efd3",
    color: "#3e7f55",
    relations: {
      recommend: [
        { key: "apple", tagline: "一起推进避坑", kind: "recommend" },
        { key: "coconut", tagline: "踩坑后补血", kind: "recommend" },
        { key: "banana", tagline: "帮TA少想一点", kind: "recommend" },
      ],
    },
  },
  apple: {
    name: "苹果",
    emoji: "🍎",
    image: "/vgti/apple.png",
    desc: "你有自律感，也有推进感。你不一定大声催促，但会让周围的水果意识到“该熟了”。你是团队里的隐形进度条，能让项目准时落地。",
    tags: ["自律", "推进项目", "隐形进度条"],
    heroTitle: "最适合和TA们一起玩",
    avatarBg: "#fadbd2",
    color: "#b54a3a",
    relations: {
      recommend: [
        { key: "carrot", tagline: "提前排雷", kind: "recommend" },
        { key: "lotus", tagline: "被你推醒", kind: "recommend" },
        { key: "coconut", tagline: "把气氛调柔和", kind: "recommend" },
      ],
    },
  },
  banana: {
    name: "香蕉",
    emoji: "🍌",
    image: "/vgti/banana.png",
    desc: "你有点“蕉绿”：deadline 还没到，脑子已经开始预演所有意外。你容易紧张，也容易被环境催熟；但状态稳定后，其实是甜甜的好相处型。",
    tags: ["蕉绿", "容易紧张", "成熟后甜甜的"],
    heroTitle: "菜格关系图",
    avatarBg: "#fcecc4",
    color: "#b58a2a",
    relations: {
      tense: [{ key: "apple", tagline: "会让你紧张", kind: "tense" }],
      recommend: [
        { key: "coconut", tagline: "适合一起降噪", kind: "recommend" },
        { key: "holly", tagline: "适合一起常绿", kind: "recommend" },
      ],
    },
  },
  coconut: {
    name: "椰子",
    emoji: "🥥",
    image: "/vgti/coconut.png",
    desc: "你是生活美学派，也是小确幸收集者。美食、咖啡馆、下午茶、拼单、约饭，都是你在紧张的生活中创造愉悦的灵感。办公室下午茶时间，你总能第一时间带领同事们赶往现场。",
    tags: ["生活美学派", "小确幸收集者", "下午茶活跃"],
    heroTitle: "最适合和TA们一起玩",
    avatarBg: "#e8dcc4",
    color: "#8b6322",
    relations: {
      recommend: [
        { key: "banana", tagline: "一起缓解蕉绿", kind: "recommend" },
        { key: "lotus", tagline: "一起仪式感开机", kind: "recommend" },
        { key: "holly", tagline: "陪你安稳快乐", kind: "recommend" },
      ],
    },
  },
};
