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
  /** 小图标（public 内路径） */
  icon: string;
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
  brand: "键盘农场 菜格测试",
  brandSprout: "/vgti/stages/stage-2.png",
  brandSproutAlt: "发芽植物",
  titleLines: ["测测你的", "菜格类型"],
  lead: "VGTI（Vegetable Type Indicator）是一种菜格类型理论模型，基于心理学家卡尔·罗特（Carrot）的心理类型理论，由它带领的UMa实验室开发。",
  pills: ["约 1 分钟", "5 道题", "凭第一反应选择"],
  startBtn: "开始测试",
  countHint: "凭第一反应选择",
  backHint: "不用纠结，每个人都会有自己的菜！",
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
    q: "坐你对面的人正在飞快地敲键盘，ta一定是在：",
    a: [
      { t: "和朋友吐槽刚遇到的奇葩", s: { carrot: 1 } },
      { t: "为了一篇回复删了又打，打了又删", s: { banana: 1 } },
      { t: "当键盘侠和别人吵架", s: { holly: 1 } },
      { t: "赶一个马上就到ddl的作业", s: { apple: 1 } },
    ],
  },
  {
    q: "聊天框蹦出来一句：“有个小问题想问你”，你会：",
    a: [
      { t: "立刻问什么事", s: { apple: 1 } },
      { t: "已读，但是等到有空再回", s: { lotus: 1 } },
      { t: "不要来找我不要来找我……", s: { banana: 1 } },
      { t: "回一个猫猫表情包", s: { coconut: 1 } },
    ],
  },
  {
    q: "连续工作了好几个小时！你站起来望向窗外，看见：",
    a: [
      { t: "棉花糖一样的云朵", s: { coconut: 1 } },
      {
        t: "行色匆忙的路人",
        s: { banana: 1 },
      },
      {
        t: "波光闪闪的水面",
        s: { lotus: 1 },
      },
      {
        t: "跳广场舞的叔叔阿姨",
        s: { holly: 1 },
      },
    ],
  },
  {
    q: "手机相册里翻到了一张你没有印象的屏幕截图，它的内容是：",
    a: [
      { t: "早上7点的闹钟正在响铃", s: { lotus: 1 } },
      { t: "一条搞笑的帖子", s: { holly: 1 } },
      { t: "一个教程视频的开头", s: { coconut: 1 } },
      { t: "一家外卖店的评论区", s: { carrot: 1 } },
    ],
  },
  {
    q: "必须要吃一种东西！你选择：",
    a: [
      { t: "超酸柠檬糖", s: { apple: 1 } },
      { t: "齁甜怪味豆", s: { coconut: 1 } },
      {
        t: "苦瓜冰美式",
        s: { banana: 1 },
      },
      { t: "爆辣脆薯片", s: { holly: 1 } },
    ],
  },
];

/** 结果文案 */
export const TYPES: Record<TypeKey, TypeInfo> = {
  holly: {
    name: "冬青",
    icon: "/vgti/small-icons/Holly.webp",
    image: "/vgti/holly.webp",
    desc: "红果满枝，四季常青，只要有你在，即使是寒冬也洋溢着节日般的热闹与欢乐。你的爱意外放而舒展，总是保持着一颗分享与支持的心，于是也被相同的爱意环抱。",
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
    icon: "/vgti/small-icons/Lotus.webp",
    image: "/vgti/lotus.webp",
    desc: "开花是朝九晚五，宗旨是多睡少补，你是花中公务员，有着不可撼动的养生态度。你总是淡淡的，好像游离于人群之外。但你只是有自己的社会时钟，不会被浪潮推着走。",
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
    icon: "/vgti/small-icons/Carrot.webp",
    image: "/vgti/carrot.webp",
    desc: "都说一个萝卜一个坑，但不知为何，你遇到的是一个一个又一个坑。你总是愿意亲自去一探究竟，然后又多了一段黑历史。但在一次次尝试中，你比其他人更了解自我的感受。",
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
    icon: "/vgti/small-icons/Apple.webp",
    image: "/vgti/apple.webp",
    desc: "有人说你是世界上最常见、最不起眼的，有人说你是带来智慧与罪恶的，独一无二的。他有他们的定义，而你决定创造你自己的答案。你纯粹的内心是鼓舞他人最强大的动力。",
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
    icon: "/vgti/small-icons/Banana.webp",
    image: "/vgti/banana.webp",
    desc: "传说只要把你挂在高处，就能让你支棱起来续命，但实际情况是你会在生活的重力下自由落体。为了追求完美，你总是把自己绷得很紧，但有时候，躺下，才是最适合你的生活哲理。",
    tags: ["蕉绿", "容易紧张", "成熟后甜甜的"],
    heroTitle: "最适合和TA们一起玩",
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
    icon: "/vgti/small-icons/Coco.webp",
    image: "/vgti/coconut.webp",
    desc: "椰子肉，椰子冻，椰子水，椰子鸡……家常食谱两百卷，卷卷都能有椰名。你热衷于接触新事物，并且发挥自己的创意做出新东西，你有能把简单的生活过得丰富多彩的超能力。",
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
