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

  const total = QUESTIONS.length;

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

<section class:pool-active={isPoolSelected} class="wrap">
  <div class="background-art" aria-hidden="true">
    <span class="facet facet-one"></span>
    <span class="facet facet-two"></span>
    <!-- 独立层淡入，避免改 .wrap background 触发整页重绘 -->
    <div class="pool-sky"></div>
    <!-- Adapted from Goodkatz's MIT-licensed "Simple CSS Waves". -->
    <svg
      class="pool-waves"
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
                class="option"
                aria-pressed={selected === index}
                onclick={() => choose(index)}
              >
                <span class="option-text">{opt.t}</span>
                <span class="option-water" aria-hidden="true"></span></button
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
  }
  .pool-active .pool-sky,
  .pool-active .pool-waves {
    opacity: 1;
  }
  .pool-active .facet {
    opacity: 0.1;
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
      transform: translate3d(-90px, 0, 0);
    }
    to {
      transform: translate3d(85px, 0, 0);
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
    border: 3px solid #278ca2;
    background: #c9f3ef;
    box-shadow:
      0 5px 0 #176c81,
      0 10px 20px rgba(16, 91, 110, 0.2);
    transform-origin: center center;
    backface-visibility: hidden;
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
