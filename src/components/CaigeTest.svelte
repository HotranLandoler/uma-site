<script lang="ts">
  import "./caige-test/styles/index.css";
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
  const UI_VERSION = "2026.08.01-15";
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
  const isCloudSelected = $derived(
    selectedOption?.t === "棉花糖一样的云朵",
  );
  const isCommuterSelected = $derived(
    selectedOption?.t === "行色匆忙的路人",
  );
  const isDanceSelected = $derived(
    selectedOption?.t === "跳广场舞的叔叔阿姨",
  );
  const isRantSelected = $derived(
    selectedOption?.t === "和朋友吐槽刚遇到的奇葩",
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
  class:cloud-active={isCloudSelected}
  class:commuter-active={isCommuterSelected}
  class:dance-active={isDanceSelected}
  class:rant-active={isRantSelected}
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
    <div class="cloud-sky"></div>
    <div class="cloud-field">
      <span class="cloud"></span>
      <span class="cloud"></span>
      <span class="cloud"></span>
      <span class="cloud"></span>
      <span class="cloud"></span>
    </div>
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
    <div class="rant-scene"></div>
    <span class="rant-mark rant-mark--left">?</span>
    <span class="rant-mark rant-mark--right">?!</span>
    <span class="rant-hand-emoji">
      <span class="rant-hand-pair rant-hand-emoji--left">
        <span>🫲</span><span>🫲</span>
      </span>
      <span class="rant-hand-pair rant-hand-emoji--right">
        <span>🫱</span><span>🫱</span>
      </span>
    </span>
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
                class:selected-cloud={selected === index &&
                  opt.t === "棉花糖一样的云朵"}
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
