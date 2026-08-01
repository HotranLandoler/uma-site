<script lang="ts">
  import {
    QUESTIONS,
    TYPES,
    TIE_ORDER,
    UI,
    type TypeKey,
    type Score,
  } from "../data/vgti";

  type Screen = "start" | "quiz" | "result";

  // 交互状态
  let screen = $state<Screen>("start");
  let current = $state(0);
  let answers = $state<Score[]>([]);
  let selected = $state<number | null>(null);
  let toast = $state("");
  let poolWaveOffsetIndex = $state(-1);

  const total = QUESTIONS.length;
  const UI_VERSION = "2026.08.01-8";
  const POOL_WAVE_OFFSETS = [-64, -32, 18, 52, 76] as const;

  // 计分：累加各类型得分，并列时按 TIE_ORDER 决出胜者
  const winner = $derived.by<TypeKey>(() => {
    const scores = {
      holly: 0,
      lotus: 0,
      carrot: 0,
      apple: 0,
      banana: 0,
      coconut: 0,
    } as Record<TypeKey, number>;
    for (const ans of answers) {
      for (const [k, v] of Object.entries(ans)) {
        scores[k as TypeKey] += v;
      }
    }
    return (Object.keys(scores) as TypeKey[]).sort(
      (a, b) =>
        scores[b] - scores[a] || TIE_ORDER.indexOf(a) - TIE_ORDER.indexOf(b),
    )[0];
  });

  const result = $derived(TYPES[winner]);
  const question = $derived(QUESTIONS[current]);
  const progress = $derived((current / total) * 100);
  const selectedOption = $derived(
    selected === null ? null : question.a[selected],
  );
  const isPoolSelected = $derived(
    selectedOption?.t === "波光闪闪的水面",
  );
  const isCommuterSelected = $derived(
    selectedOption?.t === "行色匆忙的路人",
  );
  const isDanceSelected = $derived(
    selectedOption?.t === "跳广场舞的叔叔阿姨",
  );
  const poolWaveOffset = $derived(
    poolWaveOffsetIndex < 0 ? 0 : POOL_WAVE_OFFSETS[poolWaveOffsetIndex],
  );

  // 关系卡：先「会让你紧张」，再「推荐农友」
  const allCards = $derived([
    ...(result.relations.tense ?? []),
    ...result.relations.recommend,
  ]);

  function begin() {
    screen = "quiz";
    current = 0;
    answers = [];
    selected = null;
    toast = "";
  }

  function choose(index: number) {
    const choosingPool = question.a[index]?.t === "波光闪闪的水面";
    if (choosingPool && selected !== index) {
      poolWaveOffsetIndex =
        (poolWaveOffsetIndex + 1) % POOL_WAVE_OFFSETS.length;
    }
    selected = index;
  }

  function next() {
    if (selected === null) return;
    answers = [...answers, question.a[selected].s];
    if (current + 1 >= total) {
      screen = "result";
    } else {
      current += 1;
      selected = null;
    }
  }

  function back() {
    if (current === 0) return;
    current -= 1;
    answers = answers.slice(0, -1);
    selected = null;
  }

  function restart() {
    screen = "start";
    current = 0;
    answers = [];
    selected = null;
    toast = "";
  }

  async function saveResult() {
    toast = UI.preparing;
    try {
      const res = await fetch(result.image);
      const blob = await res.blob();
      const file = new File([blob], `菜格测试-${result.name}.png`, {
        type: blob.type || "image/png",
      });
      const nav = navigator as Navigator & {
        canShare?: (data?: ShareData) => boolean;
      };
      if (
        typeof navigator.share === "function" &&
        nav.canShare?.({ files: [file] })
      ) {
        try {
          await navigator.share({
            files: [file],
            title: UI.shareTitle,
            text: `我的菜格类型是${result.name}`,
          });
          toast = UI.shareDone;
        } catch (e) {
          // 用户取消分享，不计为错误
          if (e instanceof DOMException && e.name === "AbortError") {
            toast = "";
          } else {
            throw e;
          }
        }
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `菜格测试-${result.name}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast = UI.downloadDone;
      }
    } catch {
      toast = UI.captureFail;
    }
  }
</script>

<svg
  width="0"
  height="0"
  aria-hidden="true"
  style="position:absolute;overflow:hidden"
>
  <defs>
    <clipPath id="hero-wave" clipPathUnits="objectBoundingBox">
      <path d="M0,0 L1,0 L1,0.75 C0.75,0.95 0.25,0.95 0,0.75 Z" />
    </clipPath>
  </defs>
</svg>

<section
  class:pool-active={isPoolSelected}
  class:commuter-active={isCommuterSelected}
  class:dance-active={isDanceSelected}
  class="wrap"
>
  <div class="background-art" aria-hidden="true">
    <span class="facet facet-one"></span>
    <span class="facet facet-two"></span>
    <!-- 独立层淡入，避免改 .wrap background 触发整页重绘 -->
    <div class="pool-sky"></div>
    <!-- Adapted from Goodkatz's MIT-licensed "Simple CSS Waves". -->
    <svg
      class="pool-waves"
      style={`--pool-wave-offset: ${poolWaveOffset}px`}
      viewBox="0 24 150 28"
      preserveAspectRatio="none"
      shape-rendering="optimizeSpeed"
    >
      <defs>
        <path
          id="pool-gentle-wave"
          d="M-160 44c30 0 58-18 88-18s58 18 88 18 58-18 88-18 58 18 88 18v44h-352z"
        />
      </defs>
      <g class="pool-parallax">
        <use href="#pool-gentle-wave" x="48" y="0"></use>
        <use href="#pool-gentle-wave" x="48" y="3"></use>
        <use href="#pool-gentle-wave" x="48" y="5"></use>
        <use class="pool-wave-back" href="#pool-gentle-wave" x="48" y="7"
        ></use>
      </g>
    </svg>
    <div class="commuter-city"></div>
    <div class="commuter-crowd commuter-crowd--far">
      {#each Array(4) as _}<span class="commuter-person"></span>{/each}
    </div>
    <div class="commuter-crowd commuter-crowd--near">
      {#each Array(4) as _}<span class="commuter-person"></span>{/each}
    </div>
    <div class="dance-plaza"></div>
    <svg
      class="dance-crowd"
      viewBox="0 0 760 210"
      preserveAspectRatio="xMidYMax meet"
    >
      <g class="dance-figure dance-figure--one" transform="translate(70 67)">
        <circle cx="0" cy="0" r="16"></circle>
        <path d="M-19 25Q0 13 19 25L24 91H-24Z"></path>
        <path class="dance-limb" d="M-14 34L-43 13M14 34L43 50"></path>
        <path class="dance-limb" d="M-11 88L-27 133M11 88L29 130"></path>
      </g>
      <g class="dance-figure dance-figure--two" transform="translate(220 45)">
        <circle cx="0" cy="0" r="17"></circle>
        <path d="M-21 27Q0 14 21 27L27 98H-27Z"></path>
        <path class="dance-limb" d="M-15 38L-46 57M15 38L42 9"></path>
        <path class="dance-limb" d="M-12 95L-31 145M12 95L27 145"></path>
      </g>
      <g class="dance-figure dance-figure--three" transform="translate(380 26)">
        <circle cx="0" cy="0" r="18"></circle>
        <path d="M-23 29Q0 15 23 29L29 106H-29Z"></path>
        <path class="dance-limb" d="M-17 42L-50 18M17 42L50 18"></path>
        <path class="dance-limb" d="M-13 103L-35 158M13 103L35 158"></path>
      </g>
      <g class="dance-figure dance-figure--four" transform="translate(540 45)">
        <circle cx="0" cy="0" r="17"></circle>
        <path d="M-21 27Q0 14 21 27L27 98H-27Z"></path>
        <path class="dance-limb" d="M-15 38L-42 9M15 38L46 57"></path>
        <path class="dance-limb" d="M-12 95L-27 145M12 95L31 145"></path>
      </g>
      <g class="dance-figure dance-figure--five" transform="translate(690 67)">
        <circle cx="0" cy="0" r="16"></circle>
        <path d="M-19 25Q0 13 19 25L24 91H-24Z"></path>
        <path class="dance-limb" d="M-14 34L-43 50M14 34L43 13"></path>
        <path class="dance-limb" d="M-11 88L-29 130M11 88L27 133"></path>
      </g>
    </svg>
  </div>
  <section class:quiz-panel={screen === "quiz"} class="panel">
    <div class="inner">
      <div class="brand">
        <img
          class="brand-sprout"
          src={UI.brandSprout}
          alt={UI.brandSproutAlt}
        />
        {UI.brand}
      </div>

      {#if screen === "start"}
        <div>
          <h1>
            {#each UI.titleLines as line, i}{#if i > 0}<br />{/if}{line}{/each}
          </h1>
          <p class="lead">{UI.lead}</p>
          <div class="pill-row">
            {#each UI.pills as pill}<span class="pill">{pill}</span>{/each}
          </div>
          <button onclick={begin}>{UI.startBtn}</button>
        </div>
      {:else if screen === "quiz"}
        <div>
          <div class="progress">
            <div class="progress-top">
              <span>第 {current + 1} / {total} 题</span>
              <span>{UI.countHint}</span>
            </div>
            <div
              class="bar"
              role="progressbar"
              aria-valuemin="1"
              aria-valuemax={total}
              aria-valuenow={current + 1}
            >
              <span style="width: {progress}%"></span>
            </div>
          </div>
          <h2>{question.q}</h2>
          <div class="options">
            {#each question.a as opt, index}
              <button
                class:selected={selected === index}
                class:selected-pool={selected === index &&
                  opt.t === "波光闪闪的水面"}
                class:selected-commuter={selected === index &&
                  opt.t === "行色匆忙的路人"}
                class:selected-dance={selected === index &&
                  opt.t === "跳广场舞的叔叔阿姨"}
                class="option"
                aria-pressed={selected === index}
                onclick={() => choose(index)}
              >
                <span class="option-text">{opt.t}</span>
                <span class="option-water" aria-hidden="true"></span>
                {#if opt.t === "行色匆忙的路人"}
                  <span class="bus-carriage" aria-hidden="true">
                    <span class="bus-window bus-window--one"></span>
                    <span class="bus-window bus-window--two"></span>
                    <span class="bus-window bus-window--three"></span>
                    <span class="bus-strap bus-strap--one"></span>
                    <span class="bus-strap bus-strap--two"></span>
                    <span class="bus-strap bus-strap--three"></span>
                  </span>
                {/if}
                {#if opt.t === "跳广场舞的叔叔阿姨"}
                  <span class="dance-beat" aria-hidden="true">
                    <span></span><span></span><span></span><span></span>
                  </span>
                {/if}</button
              >
            {/each}
          </div>
          <div class="nav">
            <span class="tiny">{UI.backHint}</span>
            <div class="nav-actions">
              <button
                class="secondary"
                style="visibility: {current > 0 ? 'visible' : 'hidden'}"
                onclick={back}>{UI.backBtn}</button
              >
              <button class="next" disabled={selected === null} onclick={next}>
                {current + 1 >= total ? "查看答案" : "下一题"}
              </button>
            </div>
          </div>
        </div>
      {:else}
        <div class="result-card">
          <img
            class="result-img"
            src={result.image}
            width="1200"
            height="1600"
            alt={`你的菜格类型是${result.name}`}
          />
          <div class="result-copy">
            <p>{result.desc}</p>
            <div class="tags">
              {#each result.tags as tag}<span class="tag">{tag}</span>{/each}
            </div>
          </div>
          <div class="relation">
            <div class="relation-hero">
              <p class="relation-title">{result.heroTitle}</p>
            </div>
            <div class="relation-friends">
              {#each allCards as rel}
                <div
                  class="relation-card {rel.kind === 'tense'
                    ? 'relation-card--tense'
                    : ''}"
                >
                  <div
                    class="relation-avatar"
                    style="background: {TYPES[rel.key].avatarBg}"
                  >
                    <img src={TYPES[rel.key].icon} alt={TYPES[rel.key].name} />
                  </div>
                  <p
                    class="relation-friend-name"
                    style="color: {TYPES[rel.key].color}"
                  >
                    {TYPES[rel.key].name}
                  </p>
                  <p class="relation-friend-tag">{rel.tagline}</p>
                </div>
              {/each}
            </div>
          </div>
          <div class="actions">
            <button onclick={saveResult}>{UI.saveBtn}</button>
            <button class="secondary" onclick={restart}>{UI.againBtn}</button>
          </div>
          <div class="toast" aria-live="polite">{toast}</div>
        </div>
      {/if}
    </div>
  </section>
  <small class="ui-version" title="页面版本">VGTI {UI_VERSION}</small>
</section>

<style>
  :global(body) {
    background: #dcebe5;
    font-family: unset;
  }
  .wrap {
    --card: rgba(248, 251, 244, 0.88);
    --ink: #253f43;
    --muted: #587174;
    --shadow: 0 18px 50px rgba(47, 93, 87, 0.14);
    --radius: 24px;

    /*
     * 水池背景参数
     * bg-top / bg-bottom：背景上下端颜色。
     * wave-height：波浪区域高度；数值越大，波浪在页面中占据的高度越多。
     * wave-color-1~4：由前至后的四层波浪颜色；alpha 越大越不透明。
     * wave-speed-1~4：每层完成一次移动所需时间；秒数越小，移动越快。
     * wave-phase-1~4：负值 delay，选中瞬间各层已处于周期中的不同相位。
     * wave-offset：由交互循环写入的水平偏移，避免每次激活都从同一位置出现。
     */
    --pool-bg-top: #8edee0;
    --pool-bg-bottom: #3ca8bd;
    --pool-wave-height: clamp(150px, 20vh, 270px);
    --pool-wave-color-1: rgba(223, 255, 252, 0.68);
    --pool-wave-color-2: rgba(173, 240, 236, 0.56);
    --pool-wave-color-3: rgba(106, 206, 211, 0.52);
    --pool-wave-color-4: rgba(42, 146, 171, 0.46);
    --pool-wave-speed-1: 20s;
    --pool-wave-speed-2: 14s;
    --pool-wave-speed-3: 25s;
    --pool-wave-speed-4: 36s;
    --pool-wave-offset: 0px;
    /* 负 delay = 选中瞬间已处于周期中的不同相位，避免四层叠在同一起点 */
    --pool-wave-phase-1: -5s;
    --pool-wave-phase-2: -9s;
    --pool-wave-phase-3: -16s;
    --pool-wave-phase-4: -27s;

    /*
     * 水池按钮参数
     * button-rock-angle：按钮左右摇摆的最大角度；越大摇晃越明显。
     * button-rock-speed：完成一次左右摇摆的时间；越小摇晃越快。
     * button-water / button-crest：按钮内水体和浅色浪头的颜色。
     */
    --pool-button-rock-angle: 0.4deg;
    --pool-button-rock-speed: 3s;
    --pool-button-water: #42bdca;
    --pool-button-crest: #78dfe0;

    /*
     * 通勤背景参数
     * city-top / city-bottom：城市背景上下端颜色。
     * city-divider / city-road-line：站台分界线和路面横线颜色。
     * city-fade-speed：城市背景淡入时长；越小越快，设为 0s 可直接切换。
     * crowd-height：人群活动区域占页面底部的高度。
     * crowd-fade-speed：桌面端人群淡入时长；手机端为性能考虑固定关闭。
     * crowd-speed / fast / slow：路人穿过屏幕的三档时长；越小越匆忙。
     * crowd-phase-far/near-1~4：8 个路人的负延迟；调整可改变初始分布，
     * 尽量不要设成相同值，否则人物容易重叠成一团。
     * crowd-step-speed：桌面端腿部摆动一次的时长；越小步频越快。
     * person-scale：所有路人的基础尺寸；far-person-scale / opacity 控制远景。
     * person-head：所有路人的头部颜色。
     * walk-*-start / end：左右两组路人的起点和终点；绝对值越大，
     * 路人在屏幕外等待和行走的距离越长。
     * coat-far/near-1~4：前后两层 8 个路人的衣服颜色。
     */
    --commuter-city-top: #bfc8c4;
    --commuter-city-bottom: #8f9da0;
    --commuter-city-divider: #78878a;
    --commuter-city-road-line: rgba(237, 224, 187, 0.42);
    --commuter-city-fade-speed: 0.4s;
    --commuter-crowd-height: 42%;
    --commuter-crowd-fade-speed: 0.28s;
    --commuter-crowd-speed: 16s;
    --commuter-crowd-speed-fast: 13s;
    --commuter-crowd-speed-slow: 20s;
    --commuter-crowd-phase-far-1: -2s;
    --commuter-crowd-phase-far-2: -8s;
    --commuter-crowd-phase-far-3: -13s;
    --commuter-crowd-phase-far-4: -5s;
    --commuter-crowd-phase-near-1: -1s;
    --commuter-crowd-phase-near-2: -9s;
    --commuter-crowd-phase-near-3: -5s;
    --commuter-crowd-phase-near-4: -12s;
    --commuter-crowd-step-speed: 0.48s;
    --commuter-person-scale: 1;
    --commuter-far-person-scale: 0.78;
    --commuter-far-person-opacity: 0.58;
    --commuter-person-head: #33494d;
    --commuter-walk-right-start: -12vw;
    --commuter-walk-right-end: 116vw;
    --commuter-walk-left-start: 12vw;
    --commuter-walk-left-end: -116vw;
    --commuter-coat-far-1: #5c7474;
    --commuter-coat-far-2: #6d6670;
    --commuter-coat-far-3: #536b64;
    --commuter-coat-far-4: #76665e;
    --commuter-coat-near-1: #344f54;
    --commuter-coat-near-2: #7d554f;
    --commuter-coat-near-3: #485d75;
    --commuter-coat-near-4: #695f45;

    /*
     * 通勤按钮参数
     * bus-bump-speed：一轮“静止—颠簸—静止”的总时长；越小颠簸越频繁。
     * bus-idle/high/low/settle-y：桌面端车厢四档垂直位置；
     * 更负代表抬得更高。mobile-* 是手机端对应的轻量幅度。
     * bus-body / frame / window / accent：车身、结构线、车窗和腰线颜色。
     * bus-text / wheel：选中文字和车轮颜色。
     * bus-window-opacity：车窗透明度；越小越不抢文字。
     * bus-radius：车厢圆角。
     * bus-shadow-base / shadow-color：车厢底部硬阴影和外侧柔和阴影。
     * strap-angle-1~3：三枚吊环摆动角度；越大摆幅越明显。
     */
    --commuter-bus-bump-speed: 8s;
    --commuter-bus-idle-y: -2px;
    --commuter-bus-high-y: -4px;
    --commuter-bus-low-y: 0px;
    --commuter-bus-settle-y: -3px;
    --commuter-bus-mobile-idle-y: -1px;
    --commuter-bus-mobile-high-y: -3px;
    --commuter-bus-mobile-low-y: 0px;
    --commuter-bus-body: #d77d55;
    --commuter-bus-frame: #31535a;
    --commuter-bus-window: #d9ebe5;
    --commuter-bus-accent: #efc376;
    --commuter-bus-text: #173f46;
    --commuter-bus-wheel: #253f43;
    --commuter-bus-window-opacity: 0.84;
    --commuter-bus-radius: 11px;
    --commuter-bus-shadow-base: #263f44;
    --commuter-bus-shadow-color: rgba(28, 53, 58, 0.24);
    --commuter-bus-text-highlight: rgba(255, 255, 255, 0.72);
    --commuter-strap-angle-1: 5deg;
    --commuter-strap-angle-2: 3deg;
    --commuter-strap-angle-3: 6deg;

    /*
     * 广场舞背景与按钮参数
     * sky / ground：晚饭后广场的天空、地面颜色。
     * grid：地砖分隔线；crowd-*：人物轮廓与五件低饱和上衣颜色。
     * beat-speed：一轮“动次打次”的时长。
     * crowd-shift-*：人群左右整体移动幅度；button-scale-*：按钮强弱拍缩放。
     * 注意：≤560px 会在下方媒体查询中覆盖这两组幅度；调整桌面值不会影响手机值。
     * button-*：按钮主体、结构线、节拍块、文字与阴影颜色。
     */
    --dance-sky-top: #f1d9bf;
    --dance-sky-bottom: #d8bab2;
    --dance-ground: #a49aaa;
    --dance-ground-deep: #81798d;
    --dance-grid: rgba(244, 225, 202, 0.3);
    --dance-crowd-ink: #4f5260;
    --dance-crowd-1: #bd6f68;
    --dance-crowd-2: #668781;
    --dance-crowd-3: #c29358;
    --dance-crowd-4: #73809c;
    --dance-crowd-5: #9a6e83;
    --dance-beat-speed: 1.6s;
    --dance-crowd-shift-strong: -18px;
    --dance-crowd-shift-weak: 14px;
    --dance-button-scale-strong: 1.016;
    --dance-button-scale-weak: 1.006;
    --dance-button-body: #dc8877;
    --dance-button-frame: #555564;
    --dance-button-accent: #f0c36e;
    --dance-button-text: #323744;
    --dance-button-shadow-base: #675963;
    --dance-button-shadow-color: rgba(62, 52, 64, 0.22);

    width: 100%;
    min-height: 100vh;
    margin: 0;
    padding: 28px 18px 40px;
    display: grid;
    place-items: center;
    text-align: left;
    color: var(--ink);
    position: relative;
    isolation: isolate;
    overflow: hidden;
    background:
      linear-gradient(145deg, rgba(255, 244, 190, 0.42), transparent 38%),
      #dcebe5;
  }

  .background-art {
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    overflow: hidden;
    contain: paint;
  }
  .ui-version {
    position: absolute;
    right: 9px;
    bottom: 7px;
    z-index: 0;
    color: rgba(37, 63, 67, 0.34);
    font-size: 10px;
    font-weight: 600;
    line-height: 1;
    letter-spacing: 0.02em;
    user-select: text;
  }
  .pool-active .ui-version {
    color: rgba(255, 255, 255, 0.38);
  }
  .dance-active .ui-version {
    color: rgba(255, 250, 240, 0.48);
  }
  .facet {
    position: absolute;
    opacity: 0.42;
    transition: opacity 0.45s ease;
  }
  .facet-one {
    width: 42vmax;
    height: 34vmax;
    top: -14vmax;
    right: -9vmax;
    background: #f0c989;
    clip-path: polygon(12% 0, 100% 8%, 72% 100%, 0 64%);
  }
  .facet-two {
    width: 34vmax;
    height: 30vmax;
    bottom: -14vmax;
    left: -8vmax;
    background: #8fc5a9;
    clip-path: polygon(0 18%, 72% 0, 100% 72%, 28% 100%);
  }
  .pool-sky {
    position: absolute;
    inset: 0;
    opacity: 0;
    background: linear-gradient(
      180deg,
      var(--pool-bg-top),
      var(--pool-bg-bottom)
    );
    transition: opacity 0.45s ease;
    transform: translateZ(0);
    will-change: opacity;
  }
  .pool-waves {
    position: absolute;
    inset: auto 0 -1px;
    width: 100%;
    height: var(--pool-wave-height);
    opacity: 0;
    /* 只淡入，避免与子层 transform 动画抢同一合成层 */
    transition: opacity 0.4s ease;
    transform: translateZ(0);
    backface-visibility: hidden;
    will-change: opacity;
  }
  .pool-active .pool-sky,
  .pool-active .pool-waves {
    opacity: 1;
  }
  .pool-active .facet {
    opacity: 0.1;
  }
  .commuter-city {
    position: absolute;
    inset: 0;
    opacity: 0;
    background:
      linear-gradient(
        90deg,
        transparent 0 12%,
        rgba(255, 255, 255, 0.12) 12% 13%,
        transparent 13% 34%,
        rgba(255, 255, 255, 0.1) 34% 35%,
        transparent 35% 72%,
        rgba(255, 255, 255, 0.12) 72% 73%,
        transparent 73%
      ),
      linear-gradient(
        180deg,
        var(--commuter-city-top) 0 68%,
        var(--commuter-city-divider) 68% 70%,
        var(--commuter-city-bottom) 70%
      );
    transition: opacity var(--commuter-city-fade-speed) ease;
    transform: translateZ(0);
    will-change: opacity;
  }
  .commuter-city::before,
  .commuter-city::after {
    content: "";
    position: absolute;
    left: 0;
    width: 100%;
    height: 3px;
    background: var(--commuter-city-road-line);
  }
  .commuter-city::before {
    bottom: 23%;
  }
  .commuter-city::after {
    bottom: 9%;
  }
  .commuter-crowd {
    position: absolute;
    inset: auto 0 0;
    height: var(--commuter-crowd-height);
    opacity: 0;
    transition: opacity var(--commuter-crowd-fade-speed) ease;
  }
  .commuter-person {
    --coat: #485f62;
    --person-scale: var(--commuter-person-scale);
    position: absolute;
    bottom: 9%;
    left: 0;
    width: 32px;
    height: 74px;
    border-radius: 45% 45% 20% 20%;
    background: linear-gradient(var(--coat), var(--coat)) center 21px / 27px
      36px no-repeat;
    animation: commuter-walk-right var(--commuter-crowd-speed) linear infinite
      paused;
    will-change: transform;
  }
  .commuter-person::before {
    content: "";
    position: absolute;
    top: 0;
    left: 8px;
    width: 17px;
    height: 19px;
    border-radius: 52% 52% 45% 45%;
    background: var(--commuter-person-head);
  }
  .commuter-person::after {
    content: "";
    position: absolute;
    left: 8px;
    bottom: 0;
    width: 16px;
    height: 23px;
    background:
      linear-gradient(78deg, transparent 42%, var(--coat) 43% 62%, transparent 63%),
      linear-gradient(102deg, transparent 38%, var(--coat) 39% 58%, transparent 59%);
    transform-origin: 50% 0;
    animation: commuter-steps var(--commuter-crowd-step-speed) ease-in-out
      infinite alternate paused;
  }
  .commuter-crowd--far {
    z-index: 0;
  }
  .commuter-crowd--far .commuter-person {
    --person-scale: var(--commuter-far-person-scale);
    opacity: var(--commuter-far-person-opacity);
  }
  .commuter-crowd--far .commuter-person:nth-child(1) {
    --coat: var(--commuter-coat-far-1);
    animation-delay: var(--commuter-crowd-phase-far-1);
  }
  .commuter-crowd--far .commuter-person:nth-child(2) {
    --coat: var(--commuter-coat-far-2);
    bottom: 19%;
    animation-delay: var(--commuter-crowd-phase-far-2);
    animation-duration: var(--commuter-crowd-speed-slow);
  }
  .commuter-crowd--far .commuter-person:nth-child(3) {
    --coat: var(--commuter-coat-far-3);
    bottom: 13%;
    animation-delay: var(--commuter-crowd-phase-far-3);
    animation-duration: var(--commuter-crowd-speed-fast);
  }
  .commuter-crowd--far .commuter-person:nth-child(4) {
    --coat: var(--commuter-coat-far-4);
    bottom: 23%;
    animation-delay: var(--commuter-crowd-phase-far-4);
    animation-duration: var(--commuter-crowd-speed-slow);
  }
  .commuter-crowd--near .commuter-person {
    right: 0;
    left: auto;
    animation-name: commuter-walk-left;
  }
  .commuter-crowd--near .commuter-person:nth-child(1) {
    --coat: var(--commuter-coat-near-1);
    animation-delay: var(--commuter-crowd-phase-near-1);
    animation-duration: var(--commuter-crowd-speed-fast);
  }
  .commuter-crowd--near .commuter-person:nth-child(2) {
    --coat: var(--commuter-coat-near-2);
    bottom: 5%;
    animation-delay: var(--commuter-crowd-phase-near-2);
  }
  .commuter-crowd--near .commuter-person:nth-child(3) {
    --coat: var(--commuter-coat-near-3);
    bottom: 15%;
    animation-delay: var(--commuter-crowd-phase-near-3);
    animation-duration: var(--commuter-crowd-speed-fast);
  }
  .commuter-crowd--near .commuter-person:nth-child(4) {
    --coat: var(--commuter-coat-near-4);
    bottom: 8%;
    animation-delay: var(--commuter-crowd-phase-near-4);
    animation-duration: var(--commuter-crowd-speed-slow);
  }
  .commuter-active .commuter-city,
  .commuter-active .commuter-crowd {
    opacity: 1;
  }
  .commuter-active .facet {
    opacity: 0.06;
  }
  .commuter-active .commuter-person,
  .commuter-active .commuter-person::after {
    animation-play-state: running;
  }
  .dance-plaza {
    position: absolute;
    inset: 0;
    opacity: 0;
    background:
      repeating-linear-gradient(
        90deg,
        transparent 0 13vw,
        var(--dance-grid) 13vw calc(13vw + 2px)
      )
      0 100% / 100% 38% no-repeat,
      repeating-linear-gradient(
        0deg,
        transparent 0 58px,
        var(--dance-grid) 58px 60px
      )
      0 100% / 100% 38% no-repeat,
      linear-gradient(
        180deg,
        var(--dance-sky-top) 0 62%,
        var(--dance-ground) 62% 82%,
        var(--dance-ground-deep) 100%
      );
    transition: opacity 0.35s ease;
    transform: translateZ(0);
    will-change: opacity;
  }
  .dance-crowd {
    position: absolute;
    right: 4%;
    bottom: 2%;
    left: 4%;
    width: 92%;
    height: min(29vh, 240px);
    margin: auto;
    overflow: visible;
    opacity: 0;
    color: var(--dance-crowd-ink);
    transition: opacity 0.25s ease;
    transform: translate3d(var(--dance-crowd-shift-strong), 0, 0);
    animation: dance-crowd-shift var(--dance-beat-speed) ease-in-out infinite
      paused;
    will-change: transform;
  }
  .dance-figure {
    fill: var(--dance-crowd-1);
    stroke: var(--dance-crowd-ink);
    stroke-width: 9;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .dance-figure circle {
    fill: var(--dance-crowd-ink);
    stroke: none;
  }
  .dance-figure > path:not(.dance-limb) {
    stroke: none;
  }
  .dance-figure--two {
    fill: var(--dance-crowd-2);
  }
  .dance-figure--three {
    fill: var(--dance-crowd-3);
  }
  .dance-figure--four {
    fill: var(--dance-crowd-4);
  }
  .dance-figure--five {
    fill: var(--dance-crowd-5);
  }
  .dance-active .dance-plaza,
  .dance-active .dance-crowd {
    opacity: 1;
  }
  .dance-active .facet {
    opacity: 0.06;
  }
  .dance-active .dance-crowd {
    animation-play-state: running;
  }
  @keyframes dance-crowd-shift {
    0%,
    100% {
      transform: translate3d(var(--dance-crowd-shift-strong), 0, 0);
    }
    50% {
      transform: translate3d(var(--dance-crowd-shift-weak), 0, 0);
    }
  }
  @keyframes commuter-walk-right {
    from {
      transform: translate3d(var(--commuter-walk-right-start), 0, 0)
        scale(var(--person-scale));
    }
    to {
      transform: translate3d(var(--commuter-walk-right-end), 0, 0)
        scale(var(--person-scale));
    }
  }
  @keyframes commuter-walk-left {
    from {
      transform: translate3d(var(--commuter-walk-left-start), 0, 0)
        scale(var(--person-scale));
    }
    to {
      transform: translate3d(var(--commuter-walk-left-end), 0, 0)
        scale(var(--person-scale));
    }
  }
  @keyframes commuter-steps {
    from {
      transform: skewX(-7deg);
    }
    to {
      transform: skewX(7deg);
    }
  }
  /*
   * 动画常挂、默认 paused：选中时只切 play-state，
   * 避免四层 SVG 同时冷启动；负 delay 仍保留相位。
   * 用 longhand，避免 animation 简写把 delay 重置为 0。
   */
  .pool-parallax > use {
    animation-name: move-pool-wave;
    animation-timing-function: cubic-bezier(0.55, 0.5, 0.45, 0.5);
    animation-iteration-count: infinite;
    animation-play-state: paused;
    will-change: transform;
  }
  .pool-active .pool-parallax > use {
    animation-play-state: running;
  }
  .pool-parallax > use:nth-child(1) {
    fill: var(--pool-wave-color-1);
    animation-delay: var(--pool-wave-phase-1);
    animation-duration: var(--pool-wave-speed-1);
  }
  .pool-parallax > use:nth-child(2) {
    fill: var(--pool-wave-color-2);
    animation-delay: var(--pool-wave-phase-2);
    animation-duration: var(--pool-wave-speed-2);
  }
  .pool-parallax > use:nth-child(3) {
    fill: var(--pool-wave-color-3);
    animation-delay: var(--pool-wave-phase-3);
    animation-duration: var(--pool-wave-speed-3);
  }
  .pool-parallax > use:nth-child(4) {
    fill: var(--pool-wave-color-4);
    animation-delay: var(--pool-wave-phase-4);
    animation-duration: var(--pool-wave-speed-4);
  }
  @keyframes move-pool-wave {
    from {
      transform: translate3d(calc(-90px + var(--pool-wave-offset)), 0, 0);
    }
    to {
      transform: translate3d(calc(85px + var(--pool-wave-offset)), 0, 0);
    }
  }

  .panel {
    width: min(720px, 100%);
    background: var(--card);
    border: 1px solid rgba(255, 255, 255, 0.68);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    position: relative;
    transition:
      background 0.35s ease,
      border-color 0.35s ease,
      box-shadow 0.35s ease;
  }
  .panel::before {
    content: "";
    position: absolute;
    inset: 0 0 auto 0;
    height: 7px;
    border-radius: var(--radius) var(--radius) 0 0;
    background: linear-gradient(90deg, #7dbd82, #69bdba, #e6c878, #df9c78);
  }
  .panel.quiz-panel {
    background: transparent;
    border-color: transparent;
    box-shadow: none;
  }
  .panel.quiz-panel::before {
    display: none;
  }

  .inner {
    padding: 38px 26px 30px;
  }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-weight: 900;
    color: #2e8b63;
    font-size: 24px;
    letter-spacing: 1px;
    margin-bottom: 22px;
    padding: 6px 12px 6px 8px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.7);
  }
  .brand-sprout {
    width: 30px;
    height: 30px;
    object-fit: contain;
    display: block;
  }

  h1,
  h2,
  p {
    margin: 0;
  }
  h1 {
    font-size: clamp(34px, 7vw, 62px);
    line-height: 1.06;
    color: #245b70;
    margin-bottom: 16px;
  }
  h2 {
    font-size: clamp(24px, 5vw, 40px);
    line-height: 1.18;
    color: #2e5965;
    margin-bottom: 18px;
  }
  .lead {
    font-size: 18px;
    line-height: 1.8;
    color: var(--muted);
    margin-bottom: 28px;
  }

  .pill-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 24px 0 30px;
  }
  .pill {
    padding: 9px 13px;
    border-radius: 999px;
    background: rgba(87, 197, 126, 0.16);
    color: #3e7f55;
    font-weight: 700;
    font-size: 14px;
  }

  button {
    appearance: none;
    border: 0;
    border-radius: 999px;
    cursor: pointer;
    font: inherit;
    font-weight: 900;
    color: #fff;
    background: linear-gradient(135deg, #32c7c1, #8bdc4f);
    box-shadow: 0 10px 24px rgba(48, 173, 132, 0.26);
    padding: 15px 24px;
    transition:
      transform 0.12s ease,
      box-shadow 0.12s ease,
      opacity 0.12s ease;
  }
  button:active {
    transform: translateY(1px);
  }
  button.secondary {
    background: #fff;
    color: #3b7280;
    border: 2px solid rgba(59, 114, 128, 0.16);
    box-shadow: none;
  }

  .progress {
    margin: 8px 0 26px;
  }
  .progress-top {
    display: flex;
    justify-content: space-between;
    color: var(--muted);
    font-size: 14px;
    font-weight: 800;
    margin-bottom: 10px;
  }
  .bar {
    height: 12px;
    background: rgba(67, 143, 157, 0.14);
    border-radius: 99px;
    overflow: hidden;
  }
  .bar span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #8be252, #41d3c5);
    transition: width 0.25s ease;
  }

  .options {
    display: grid;
    gap: 12px;
    margin-top: 22px;
  }
  .option {
    width: 100%;
    text-align: left;
    color: #304d51;
    background: rgba(250, 253, 248, 0.8);
    border: 2px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 8px 24px rgba(42, 83, 84, 0.08);
    border-radius: 16px;
    padding: 16px 18px;
    font-weight: 800;
    line-height: 1.55;
    position: relative;
    overflow: hidden;
    isolation: isolate;
  }
  .option-text {
    position: relative;
    z-index: 2;
  }
  .option.selected {
    color: #173f46;
    border-color: rgba(35, 105, 108, 0.62);
    background: rgba(235, 250, 244, 0.92);
    box-shadow:
      0 0 0 3px rgba(241, 255, 248, 0.4),
      0 12px 28px rgba(31, 94, 91, 0.16);
    transform: translateY(-1px);
  }
  .option-water {
    position: absolute;
    z-index: 1;
    left: -5%;
    bottom: -12px;
    width: 110%;
    height: 36px;
    background: var(--pool-button-water);
    opacity: 0;
    pointer-events: none;
    transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
    will-change: transform, opacity;
  }
  .option-water::before {
    content: "";
    position: absolute;
    inset: -16px 0 auto;
    height: 32px;
    background: radial-gradient(
        circle at 14px 16px,
        var(--pool-button-crest) 0 15px,
        transparent 16px
      )
      0 0 / 28px 32px repeat-x;
  }
  .option-water::after {
    content: "";
    position: absolute;
    width: 7px;
    height: 7px;
    top: -12px;
    left: 22%;
    border-radius: 50%;
    background: #fff;
    opacity: 0.75;
    box-shadow:
      8px -8px 0 -2px #fff,
      96px 5px 0 -1px rgba(255, 255, 255, 0.9),
      184px -7px 0 -2px rgba(255, 255, 255, 0.85);
  }
  .option.selected-pool {
    color: #123f50;
    /* 与普通选项保持同样边框宽度，避免选中瞬间让整组选项重新布局 */
    border: 2px solid #278ca2;
    background: #c9f3ef;
    box-shadow:
      0 5px 0 #176c81,
      0 10px 20px rgba(16, 91, 110, 0.2);
    transform-origin: center center;
    backface-visibility: hidden;
    will-change: transform;
    animation: pool-button-rock var(--pool-button-rock-speed) ease-in-out
      infinite;
  }
  .option.selected-pool .option-water {
    opacity: 1;
    /* 仅平移，去掉 rotate，减少每帧重绘径向渐变 */
    animation: cartoon-water-sway 1.5s ease-in-out infinite alternate;
  }
  .option.selected-pool .option-water::after {
    animation: water-sparkle 1.2s ease-in-out infinite alternate;
  }
  .bus-carriage {
    position: absolute;
    z-index: 1;
    inset: 0;
    opacity: 0;
    pointer-events: none;
    background:
      radial-gradient(
        circle at 9% 94%,
        var(--commuter-bus-wheel) 0 7px,
        transparent 8px
      ),
      radial-gradient(
        circle at 91% 94%,
        var(--commuter-bus-wheel) 0 7px,
        transparent 8px
      ),
      linear-gradient(
        180deg,
        var(--commuter-bus-body) 0 73%,
        var(--commuter-bus-accent) 73% 82%,
        var(--commuter-bus-frame) 82%
      );
  }
  .bus-carriage::before {
    content: "";
    position: absolute;
    top: 7px;
    right: 8%;
    left: 8%;
    height: 3px;
    border-radius: 99px;
    background: var(--commuter-bus-frame);
  }
  .bus-window {
    position: absolute;
    top: 13px;
    width: 22%;
    height: 25px;
    border: 2px solid var(--commuter-bus-frame);
    border-radius: 3px;
    background: var(--commuter-bus-window);
    opacity: var(--commuter-bus-window-opacity);
  }
  .bus-window--one {
    left: 5%;
  }
  .bus-window--two {
    left: 39%;
  }
  .bus-window--three {
    right: 5%;
  }
  .bus-strap {
    --strap-angle: 4deg;
    position: absolute;
    z-index: 2;
    top: 7px;
    width: 2px;
    height: 17px;
    background: var(--commuter-bus-frame);
    transform-origin: 50% 0;
  }
  .bus-strap::after {
    content: "";
    position: absolute;
    top: 13px;
    left: -7px;
    width: 16px;
    height: 14px;
    z-index: 0;
    background: var(--commuter-bus-frame);
    clip-path: polygon(50% 0, 100% 100%, 0 100%);
  }
  .bus-strap::before {
    content: "";
    position: absolute;
    top: 17px;
    left: -4px;
    width: 10px;
    height: 8px;
    z-index: 1;
    background: var(--commuter-bus-window);
    clip-path: polygon(50% 0, 100% 100%, 0 100%);
  }
  .bus-strap--one {
    --strap-angle: var(--commuter-strap-angle-1);
    left: 30%;
  }
  .bus-strap--two {
    --strap-angle: var(--commuter-strap-angle-2);
    left: 64%;
  }
  .bus-strap--three {
    --strap-angle: var(--commuter-strap-angle-3);
    left: 78%;
  }
  .option.selected-commuter {
    color: var(--commuter-bus-text);
    border-color: var(--commuter-bus-frame);
    border-radius: var(--commuter-bus-radius);
    background: var(--commuter-bus-body);
    box-shadow:
      0 5px 0 var(--commuter-bus-shadow-base),
      0 12px 24px var(--commuter-bus-shadow-color);
    transform-origin: center center;
    backface-visibility: hidden;
    will-change: transform;
    animation: bus-road-bump var(--commuter-bus-bump-speed) linear infinite;
  }
  .option.selected-commuter .option-text {
    z-index: 3;
    text-shadow: 0 1px 0 var(--commuter-bus-text-highlight);
  }
  .option.selected-commuter .bus-carriage {
    opacity: 1;
  }
  .option.selected-commuter .bus-strap {
    animation: bus-strap-sway var(--commuter-bus-bump-speed) linear infinite;
  }
  .dance-beat {
    position: absolute;
    z-index: 1;
    right: 16px;
    bottom: 12px;
    width: 45px;
    height: 27px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    opacity: 0;
    pointer-events: none;
  }
  .dance-beat span {
    width: 8px;
    border: 2px solid var(--dance-button-frame);
    border-radius: 4px 4px 2px 2px;
    background: var(--dance-button-accent);
  }
  .dance-beat span:nth-child(1) {
    height: 18px;
  }
  .dance-beat span:nth-child(2) {
    height: 10px;
  }
  .dance-beat span:nth-child(3) {
    height: 24px;
  }
  .dance-beat span:nth-child(4) {
    height: 13px;
  }
  .option.selected-dance {
    color: var(--dance-button-text);
    border-color: var(--dance-button-frame);
    background: var(--dance-button-body);
    box-shadow:
      0 5px 0 var(--dance-button-shadow-base),
      0 12px 24px var(--dance-button-shadow-color);
    transform-origin: center center;
    backface-visibility: hidden;
    will-change: transform;
    animation: dance-button-beat var(--dance-beat-speed) ease-in-out infinite;
  }
  .option.selected-dance .option-text {
    z-index: 2;
    text-shadow: 0 1px 0 rgba(255, 245, 225, 0.62);
  }
  .option.selected-dance .dance-beat {
    opacity: 1;
  }
  /*
   * 34%~45% 与 70%~81% 是一轮中的两段颠簸窗口，其余时间保持平稳。
   * 若希望更少颠簸，可删除后一组百分比；吊环 keyframes 需同步调整。
   */
  @keyframes bus-road-bump {
    0%,
    34%,
    45%,
    70%,
    81%,
    100% {
      transform: translate3d(0, var(--commuter-bus-idle-y), 0);
    }
    36%,
    74% {
      transform: translate3d(0, var(--commuter-bus-high-y), 0);
    }
    39%,
    77% {
      transform: translate3d(0, var(--commuter-bus-low-y), 0);
    }
    42%,
    79% {
      transform: translate3d(0, var(--commuter-bus-settle-y), 0);
    }
  }
  @keyframes bus-strap-sway {
    0%,
    34%,
    45%,
    70%,
    82%,
    100% {
      transform: rotate(0deg);
    }
    38%,
    75% {
      transform: rotate(var(--strap-angle));
    }
    42%,
    79% {
      transform: rotate(calc(0deg - var(--strap-angle)));
    }
  }
  @keyframes dance-button-beat {
    0%,
    100% {
      transform: translate3d(0, -2px, 0)
        scale3d(
          var(--dance-button-scale-strong),
          var(--dance-button-scale-strong),
          1
        );
    }
    18% {
      transform: translate3d(0, -1px, 0) scale3d(1, 1, 1);
    }
    42% {
      transform: translate3d(0, -1px, 0) scale3d(1, 1, 1);
    }
    50% {
      transform: translate3d(0, -1px, 0)
        scale3d(
          var(--dance-button-scale-weak),
          var(--dance-button-scale-weak),
          1
        );
    }
    68%,
    92% {
      transform: translate3d(0, -1px, 0) scale3d(1, 1, 1);
    }
  }
  @keyframes cartoon-water-sway {
    from {
      transform: translate3d(-2.5%, 0, 0);
    }
    to {
      transform: translate3d(2.5%, 0, 0);
    }
  }
  @keyframes pool-button-rock {
    0% {
      transform: translate3d(0, -3px, 0)
        rotate(calc(0deg - var(--pool-button-rock-angle)));
    }
    50% {
      transform: translate3d(0, -3px, 0)
        rotate(var(--pool-button-rock-angle));
    }
    100% {
      transform: translate3d(0, -3px, 0)
        rotate(calc(0deg - var(--pool-button-rock-angle)));
    }
  }
  @keyframes water-sparkle {
    from {
      opacity: 0.48;
    }
    to {
      opacity: 1;
    }
  }
  @media (hover: hover) {
    button:hover {
      transform: translateY(-1px);
      box-shadow: 0 14px 28px rgba(48, 173, 132, 0.3);
    }
    .option:hover {
      border-color: rgba(68, 199, 179, 0.45);
      background: #fafffb;
    }
    .option.selected-pool:hover {
      border-color: #278ca2;
      background: #c9f3ef;
    }
    .option.selected-commuter:hover {
      border-color: var(--commuter-bus-frame);
      background: var(--commuter-bus-body);
    }
    .option.selected-dance:hover {
      border-color: var(--dance-button-frame);
      background: var(--dance-button-body);
    }
  }

  .nav {
    display: flex;
    gap: 16px;
    flex-direction: column;
    align-items: stretch;
    margin-top: 24px;
  }
  .nav-actions {
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }
  .nav-actions .next {
    margin-left: auto;
    min-width: 132px;
  }
  button:disabled {
    cursor: not-allowed;
    opacity: 0.42;
    box-shadow: none;
    transform: none;
  }
  .tiny {
    color: var(--muted);
    font-size: 13px;
    line-height: 1.6;
  }

  .result-card {
    display: grid;
    gap: 22px;
  }
  .result-img,
  .result-copy,
  .relation,
  .actions,
  .toast {
    animation: result-rise 0.5s ease-out both;
  }
  .result-img {
    animation-delay: 0s;
  }
  .result-copy {
    animation-delay: 0.1s;
  }
  .relation {
    animation-delay: 0.2s;
  }
  .actions {
    animation-delay: 0.3s;
  }
  @keyframes result-rise {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .result-img {
    width: min(380px, 86%);
    height: auto;
    margin: 0 auto;
    display: block;
    border-radius: 18px;
    box-shadow: 0 18px 45px rgba(74, 93, 99, 0.18);
    background: #fff;
  }
  .result-copy {
    background: rgba(255, 255, 255, 0.74);
    border-radius: 22px;
    padding: 18px;
    line-height: 1.8;
    color: #526971;
  }
  .relation {
    background: #fff;
    border-radius: 24px;
    box-shadow: 0 16px 42px rgba(74, 93, 99, 0.14);
    overflow: hidden;
  }
  .relation-hero {
    background: linear-gradient(180deg, #f7d3c0 0%, #fbe4d6 100%);
    padding: 24px 20px 50px;
    text-align: center;
    clip-path: url(#hero-wave);
  }
  .relation-title {
    font-weight: 900;
    font-size: 20px;
    color: #3a4a52;
    margin: 0;
  }
  .relation-friends {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    padding: 22px 16px;
    padding-top: 0;
  }
  .relation-card {
    background: #fff;
    border-radius: 18px;
    padding: 16px 8px 14px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }
  .relation-card--tense {
    border-color: #f5b978;
  }
  .relation-avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: visible;
    margin-bottom: 4px;
  }
  .relation-avatar img {
    width: 80%;
    height: 80%;
    object-fit: contain;
    display: block;
  }
  .relation-friend-name {
    font-weight: 900;
    font-size: 18px;
    margin: 0;
    line-height: 1.2;
  }
  .relation-friend-tag {
    font-size: 12px;
    color: #6e8790;
    margin: 0;
    line-height: 1.4;
  }

  @media (max-width: 480px) {
    .relation-friends {
      gap: 8px;
      padding: 16px 10px 18px;
      padding-top: 0;
    }
    .relation-card {
      padding: 12px 4px 10px;
    }
    .relation-avatar {
      width: 48px;
      height: 48px;
    }
    .relation-friend-name {
      font-size: 15px;
    }
    .relation-friend-tag {
      font-size: 11px;
    }
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
  }
  .tag {
    background: rgba(255, 184, 77, 0.2);
    color: #8b6322;
    border-radius: 999px;
    padding: 7px 10px;
    font-weight: 800;
    font-size: 13px;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
  }
  .toast {
    min-height: 24px;
    text-align: center;
    color: #4a8e64;
    font-weight: 900;
  }

  @media (max-width: 560px) {
    .wrap {
      min-height: 100svh;
      padding: 18px 14px 30px;
      --pool-wave-height: clamp(120px, 18vh, 200px);
    }
    .inner {
      padding: 28px 4px 22px;
    }
    .panel:not(.quiz-panel) .inner {
      padding-inline: 18px;
    }
    .lead {
      font-size: 16px;
    }
    .option {
      padding: 14px 15px;
    }
    .nav {
      gap: 12px;
    }
    .nav-actions button {
      flex: 1;
    }
    .nav-actions .next {
      margin-left: 0;
    }
    /* 手机少画一层 SVG，减轻选中瞬间合成压力 */
    .pool-wave-back {
      display: none;
    }
    /* 手机上按钮只做轻量上下浮动，避免旋转带动阴影重绘 */
    .option.selected-pool {
      animation-name: pool-button-float;
    }
    .option.selected-pool .option-water::after {
      animation: none;
      opacity: 0.85;
    }
    /*
     * 手机只保留前后景各两人，并关闭独立腿部动画。
     * 人群直接出现，避免选中当帧为透明度过渡创建两张大合成层。
     * nth-child(n + 3) 表示隐藏第 3 人起的元素；改为 n + 4 可各保留 3 人，
     * 但会增加选中瞬间和持续运行的合成压力。
     */
    .facet,
    .commuter-crowd,
    .dance-crowd {
      transition: none;
    }
    .commuter-crowd--near .commuter-person:nth-child(n + 3),
    .commuter-crowd--far .commuter-person:nth-child(n + 3) {
      display: none;
    }
    .commuter-person::after {
      animation: none;
      transform: none;
    }
    /* 手机缩小车厢上下颠簸幅度 */
    .option.selected-commuter {
      animation-name: bus-road-bump-mobile;
    }
    /*
     * 手机只保留中间三人，并单独覆盖人群整体位移与按钮缩放：
     * 人群 -1.5px / 1px，按钮 1.008 / 1.004。调整桌面 `.wrap` 中的同名变量
     * 不会改变这里的手机值；若希望双端同步，可删除下面四个覆盖声明。
     * 静态四拍块仍保留，避免为同一节奏再启动四个独立动画。
     */
    .wrap {
      --dance-crowd-shift-strong: -15px;
      --dance-crowd-shift-weak: 10px;
      --dance-button-scale-strong: 1.012;
      --dance-button-scale-weak: 1.008;
    }
    .dance-figure--one,
    .dance-figure--five {
      display: none;
    }
    .dance-crowd {
      right: -15%;
      left: -15%;
      width: 130%;
      height: min(24vh, 190px);
    }
  }
  @keyframes pool-button-float {
    0%,
    100% {
      transform: translate3d(0, -2px, 0);
    }
    50% {
      transform: translate3d(0, -5px, 0);
    }
  }
  @keyframes bus-road-bump-mobile {
    0%,
    36%,
    45%,
    72%,
    82%,
    100% {
      transform: translate3d(0, var(--commuter-bus-mobile-idle-y), 0);
    }
    39%,
    75% {
      transform: translate3d(0, var(--commuter-bus-mobile-high-y), 0);
    }
    42%,
    79% {
      transform: translate3d(0, var(--commuter-bus-mobile-low-y), 0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      scroll-behavior: auto !important;
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
</style>
