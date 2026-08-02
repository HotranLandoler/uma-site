<script lang="ts">
  import { onMount } from "svelte";
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
  let phoneTime = $state("--:--");
  let catMemeHead = $state<HTMLDivElement | null>(null);
  let catMemeVoice = $state<HTMLSpanElement | null>(null);

  const total = QUESTIONS.length;
  const UI_VERSION = "2026.08.02-47";
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
  const isDraftSelected = $derived(
    selectedOption?.t === "为了一篇回复删了又打，打了又删",
  );
  const isKeyboardWarriorSelected = $derived(
    selectedOption?.t === "当键盘侠和别人吵架",
  );
  const isDeadlineSelected = $derived(
    selectedOption?.t === "赶一个马上就到ddl的作业",
  );
  const isFastReplySelected = $derived(
    selectedOption?.t === "立刻问什么事",
  );
  const isDelayedReplySelected = $derived(
    selectedOption?.t === "已读，但是等到有空再回",
  );
  const isAvoidMessageSelected = $derived(
    selectedOption?.t === "不要来找我不要来找我……",
  );
  const isCatMemeSelected = $derived(
    selectedOption?.t === "回一个猫猫表情包",
  );
  const isAlarmSelected = $derived(
    selectedOption?.t === "早上7点的闹钟正在响铃",
  );
  const poolWaveOffset = $derived(
    poolWaveOffsetIndex < 0 ? 0 : POOL_WAVE_OFFSETS[poolWaveOffsetIndex],
  );

  function cssTimeToMs(value: string) {
    const normalized = value.trim();
    const amount = Number.parseFloat(normalized);
    if (!Number.isFinite(amount)) return 0;
    return Math.max(0, normalized.endsWith("ms") ? amount : amount * 1000);
  }

  $effect(() => {
    if (!isCatMemeSelected || !catMemeHead || !catMemeVoice) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const style = getComputedStyle(catMemeHead);
    const css = (name: string, fallback: string) =>
      style.getPropertyValue(name).trim() || fallback;
    const riseTime = cssTimeToMs(css("--cat-meme-head-rise-time", "0.2s"));
    const fallTime = cssTimeToMs(css("--cat-meme-head-fall-time", "0.8s"));
    const lowHoldTime = cssTimeToMs(
      css("--cat-meme-head-low-hold-time", "1s"),
    );
    const resetTime = cssTimeToMs(
      css("--cat-meme-head-reset-time", "0.2s"),
    );
    const defaultHoldTime = cssTimeToMs(
      css("--cat-meme-head-default-hold-time", "1s"),
    );
    const voiceTime = Math.max(
      1,
      cssTimeToMs(css("--cat-meme-voice-time", "0.8s")),
    );
    const totalTime = Math.max(
      1,
      riseTime + fallTime + lowHoldTime + resetTime + defaultHoldTime,
    );
    const point = (x: string, y: string) => `translate(${x}, ${y})`;
    const defaultPoint = point(
      css("--cat-meme-head-default-x", "0px"),
      css("--cat-meme-head-default-y", "0px"),
    );
    const highPoint = point(
      css("--cat-meme-head-high-x", "0px"),
      css("--cat-meme-head-high-y", "0px"),
    );
    const lowPoint = point(
      css("--cat-meme-head-low-x", "0px"),
      css("--cat-meme-head-low-y", "0px"),
    );
    const animation = catMemeHead.animate(
      [
        {
          transform: defaultPoint,
          offset: 0,
          easing: css(
            "--cat-meme-head-rise-easing",
            "cubic-bezier(0.16, 1, 0.3, 1)",
          ),
        },
        {
          transform: highPoint,
          offset: riseTime / totalTime,
          easing: css(
            "--cat-meme-head-fall-easing",
            "cubic-bezier(0.45, 0, 0.55, 1)",
          ),
        },
        {
          transform: lowPoint,
          offset: (riseTime + fallTime) / totalTime,
          easing: "linear",
        },
        {
          transform: lowPoint,
          offset: (riseTime + fallTime + lowHoldTime) / totalTime,
          easing: css(
            "--cat-meme-head-reset-easing",
            "cubic-bezier(0.4, 0, 0.2, 1)",
          ),
        },
        {
          transform: defaultPoint,
          offset:
            (riseTime + fallTime + lowHoldTime + resetTime) / totalTime,
          easing: "linear",
        },
        { transform: defaultPoint, offset: 1 },
      ],
      { duration: totalTime, iterations: Infinity },
    );
    const voiceStartTime = riseTime + fallTime;
    const voiceEndTime = Math.min(voiceStartTime + voiceTime, totalTime);
    const voiceFadeInTime = Math.min(
      voiceStartTime + Math.min(120, voiceTime * 0.25),
      voiceEndTime,
    );
    const voiceEndTransform = `translate(${css(
      "--cat-meme-voice-drift-x",
      "-110px",
    )}, ${css("--cat-meme-voice-drift-y", "-18px")}) scale(1.06)`;
    const voiceAnimation = catMemeVoice.animate(
      [
        {
          opacity: 0,
          transform: "translate(0, 0) scale(0.82)",
          offset: 0,
        },
        {
          opacity: 0,
          transform: "translate(0, 0) scale(0.82)",
          offset: voiceStartTime / totalTime,
          easing: "ease-out",
        },
        {
          opacity: 1,
          transform: "translate(0, 0) scale(1)",
          offset: voiceFadeInTime / totalTime,
          easing: css(
            "--cat-meme-voice-easing",
            "cubic-bezier(0.22, 1, 0.36, 1)",
          ),
        },
        {
          opacity: 0,
          transform: voiceEndTransform,
          offset: voiceEndTime / totalTime,
        },
        { opacity: 0, transform: voiceEndTransform, offset: 1 },
      ],
      { duration: totalTime, iterations: Infinity },
    );

    return () => {
      animation.cancel();
      voiceAnimation.cancel();
    };
  });

  onMount(() => {
    phoneTime = new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date());
  });

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
  class:draft-active={isDraftSelected}
  class:keyboard-warrior-active={isKeyboardWarriorSelected}
  class:deadline-active={isDeadlineSelected}
  class:fast-reply-active={isFastReplySelected}
  class:delayed-reply-active={isDelayedReplySelected}
  class:avoid-message-active={isAvoidMessageSelected}
  class:cat-meme-active={isCatMemeSelected}
  class:alarm-active={isAlarmSelected}
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
    <div class="draft-scene"></div>
    <div class="draft-composer" aria-hidden="true">
      <div class="draft-toolbar">
        <span></span><span></span><span></span>
      </div>
      <div class="draft-input">
        <span class="draft-line draft-line--one">I thik...</span>
        <span class="draft-line draft-line--two">Maybe it's...</span>
        <span class="draft-line draft-line--three">No, never mind.</span>
      </div>
      <span class="draft-send"></span>
    </div>
    <div class="keyboard-warrior-scene"></div>
    <div class="keyboard-warrior-rain" aria-hidden="true">
      {#each ["$", "*", "^", "%", "~", "#", "!", "&", "@", "%", "*", "$", "^", "~", "!", "#", "%", "&", "*", "@"] as symbol}
        <span>{symbol}</span>
      {/each}
    </div>
    <div class="deadline-scene"></div>
    <div class="deadline-workspace" aria-hidden="true">
      <div class="deadline-document">
        <div class="deadline-document-head">
          <span></span><span></span><span></span>
        </div>
        <div class="deadline-copy">
          <div class="deadline-line deadline-line--one">
            <span style="width: 8%; --deadline-reveal-at: 2"></span>
            <span style="width: 10%; --deadline-reveal-at: 5"></span>
            <span style="width: 6%; --deadline-reveal-at: 8"></span>
            <span style="width: 12%; --deadline-reveal-at: 11"></span>
            <span style="width: 7%; --deadline-reveal-at: 14"></span>
            <span style="width: 9%; --deadline-reveal-at: 16"></span>
            <span style="width: 5%; --deadline-reveal-at: 18"></span>
            <span style="width: 11%; --deadline-reveal-at: 20"></span>
          </div>
          <div class="deadline-line deadline-line--two">
            <span style="width: 11%; --deadline-reveal-at: 20"></span>
            <span style="width: 6%; --deadline-reveal-at: 25"></span>
            <span style="width: 8%; --deadline-reveal-at: 30"></span>
            <span style="width: 5%; --deadline-reveal-at: 35"></span>
            <span style="width: 12%; --deadline-reveal-at: 40"></span>
            <span style="width: 7%; --deadline-reveal-at: 45"></span>
            <span style="width: 9%; --deadline-reveal-at: 50"></span>
            <span style="width: 6%; --deadline-reveal-at: 55"></span>
          </div>
          <div class="deadline-line deadline-line--three">
            <span style="width: 7%; --deadline-reveal-at: 55"></span>
            <span style="width: 12%; --deadline-reveal-at: 61"></span>
            <span style="width: 5%; --deadline-reveal-at: 67"></span>
            <span style="width: 9%; --deadline-reveal-at: 73"></span>
            <span style="width: 6%; --deadline-reveal-at: 80"></span>
            <span style="width: 11%; --deadline-reveal-at: 87"></span>
            <span style="width: 8%; --deadline-reveal-at: 94"></span>
            <span style="width: 5%; --deadline-reveal-at: 99"></span>
          </div>
        </div>
      </div>
      <div class="deadline-countdown">
        <span class="deadline-countdown-label"></span>
        <span class="deadline-countdown-track">
          <span class="deadline-countdown-fill"></span>
        </span>
      </div>
    </div>
    <div class="fast-reply-scene"></div>
    <div class="fast-reply-play" aria-hidden="true">
      <span class="fast-reply-return-line fast-reply-return-line--one"></span>
      <span class="fast-reply-return-line fast-reply-return-line--two"></span>
      <span class="fast-reply-ball"></span>
      <span class="fast-reply-impact"></span>
    </div>
    <div class="delayed-reply-scene"></div>
    <div class="delayed-reply-night"></div>
    <div class="delayed-reply-sky" aria-hidden="true">
      <span class="delayed-reply-sun"></span>
      <span class="delayed-reply-moon"></span>
      <span class="delayed-reply-stars">
        {#each Array(9) as _}<i></i>{/each}
      </span>
    </div>
    <div class="avoid-message-scene"></div>
    <div class="avoid-message-stage" aria-hidden="true">
      <div class="avoid-message-phone-x">
        <div class="avoid-message-phone-y">
          <div class="avoid-message-phone">
            <span class="avoid-message-speaker"></span>
            <div class="avoid-message-screen">
              <span class="avoid-message-time">{phoneTime}</span>
              <span class="avoid-message-alert">
                <i></i><i></i>
                <b></b>
              </span>
              <span class="avoid-message-face">
                <i></i><i></i><b></b>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="cat-meme-scene"></div>
    <div class="cat-meme-stage" aria-hidden="true">
      <div class="cat-meme">
        <span class="cat-meme-tail"></span>
        <div class="cat-meme-head-lift" bind:this={catMemeHead}>
          <span class="cat-meme-ear cat-meme-ear--left"></span>
          <span class="cat-meme-ear cat-meme-ear--right"></span>
          <div class="cat-meme-head">
            <span class="cat-meme-eye cat-meme-eye--left"></span>
            <span class="cat-meme-eye cat-meme-eye--right"></span>
            <span class="cat-meme-muzzle cat-meme-muzzle--left"></span>
            <span class="cat-meme-muzzle cat-meme-muzzle--right"></span>
            <span class="cat-meme-nose"></span>
          </div>
          <span class="cat-meme-voice" bind:this={catMemeVoice}>huh~</span>
        </div>
        <div class="cat-meme-body">
          <span class="cat-meme-paw cat-meme-paw--left"></span>
          <span class="cat-meme-paw cat-meme-paw--right"></span>
        </div>
      </div>
    </div>
    <div class="alarm-scene"></div>
    <div class="alarm-stage" aria-hidden="true">
      <!--
        单表情可替换为：
        alarm-eyes--neutral / --happy / --sad / --angry /
        --unamused / --suspicious / --pain / --confused / --unsure
        当前按两个完整循环交替播放 unamused / sad。
      -->
      <div class="alarm-eyes alarm-eyes--alternate-unamused-sad">
        {#each ["left", "right"] as side}
          <div class="alarm-eye alarm-eye--{side}">
            <div class="alarm-eye-lower">
              <div class="alarm-eye-lid"></div>
            </div>
            <div class="alarm-eye-upper">
              <div class="alarm-eye-lid"></div>
            </div>
          </div>
        {/each}
      </div>
      <svg class="alarm-bell" viewBox="-10 0 35 35" aria-hidden="true">
        <path
          class="alarm-bell-body"
          d="M14 12v1H0v-1l0.73-0.58c0.77-0.77 0.81-3.55 1.19-4.42 0.77-3.77 4.08-5 4.08-5 0-0.55 0.45-1 1-1s1 0.45 1 1c0 0 3.39 1.23 4.16 5 0.38 1.88 0.42 3.66 1.19 4.42l0.66 0.58z"
        ></path>
        <path
          class="alarm-bell-clapper"
          d="M7 15.7c1.11 0 2-0.89 2-2H5c0 1.11 0.89 2 2 2z"
        ></path>
      </svg>
    </div>
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
            {#each UI.pills.filter((pill) => pill !== "凭第一反应选择") as pill}
              <span class="pill">{pill}</span>
            {/each}
          </div>
          <button onclick={begin}>{UI.startBtn}</button>
        </div>
      {:else if screen === "quiz"}
        <div>
          <div class="progress">
            <div class="progress-top">
              <span>{current + 1}/{total}</span>
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
            <div class="nav-actions">
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
