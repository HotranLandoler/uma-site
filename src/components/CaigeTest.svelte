<script lang="ts">
	import { QUESTIONS, TYPES, TIE_ORDER, UI, type TypeKey, type Score } from "../data/caige";

	type Screen = "start" | "quiz" | "result";

	// 交互状态
	let screen = $state<Screen>("start");
	let current = $state(0);
	let answers = $state<Score[]>([]);
	let toast = $state("");

	const total = QUESTIONS.length;

	// 计分：累加各类型得分，并列时按 TIE_ORDER 决出胜者
	const winner = $derived.by<TypeKey>(() => {
		const scores = { holly: 0, lotus: 0, carrot: 0, apple: 0, banana: 0, coconut: 0 } as Record<TypeKey, number>;
		for (const ans of answers) {
			for (const [k, v] of Object.entries(ans)) {
				scores[k as TypeKey] += v;
			}
		}
		return (Object.keys(scores) as TypeKey[]).sort(
			(a, b) => scores[b] - scores[a] || TIE_ORDER.indexOf(a) - TIE_ORDER.indexOf(b),
		)[0];
	});

	const result = $derived(TYPES[winner]);
	const question = $derived(QUESTIONS[current]);
	const progress = $derived((current / total) * 100);

	function begin() {
		screen = "quiz";
		current = 0;
		answers = [];
		toast = "";
	}

	function choose(score: Score) {
		answers = [...answers, score];
		if (current + 1 >= total) {
			screen = "result";
		} else {
			current += 1;
		}
	}

	function back() {
		if (current === 0) return;
		current -= 1;
		answers = answers.slice(0, -1);
	}

	function restart() {
		screen = "start";
		current = 0;
		answers = [];
		toast = "";
	}

	async function copyResult() {
		const text = `我的《键盘农场》菜格类型是：${result.name}\n${result.desc}\n${result.relationCopy}`;
		try {
			await navigator.clipboard.writeText(text);
			toast = UI.copySuccess;
		} catch {
			toast = text;
		}
	}
</script>

<section class="wrap">
	<section class="panel">
		<div class="inner">
			<div class="brand">
				<img class="brand-sprout" src={UI.brandSprout} alt={UI.brandSproutAlt} />
				{UI.brand}
			</div>

			{#if screen === "start"}
				<div>
					<h1>{#each UI.titleLines as line, i}{#if i > 0}<br />{/if}{line}{/each}</h1>
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
						{#each question.a as opt}
							<button class="option" onclick={() => choose(opt.s)}>{opt.t}</button>
						{/each}
					</div>
					<div class="nav">
						<button
							class="secondary"
							style="visibility: {current > 0 ? 'visible' : 'hidden'}"
							onclick={back}>{UI.backBtn}</button
						>
						<span class="tiny">{UI.backHint}</span>
					</div>
				</div>
			{:else}
				<div class="result-card">
					<img class="result-img" src={result.image} alt={`你的菜格类型是${result.name}`} />
					<div class="result-copy">
						<p>{result.desc}</p>
						<div class="tags">
							{#each result.tags as tag}<span class="tag">{tag}</span>{/each}
						</div>
					</div>
					<img
						class="relation-img"
						src={result.relationImage}
						alt={`${result.name}的菜格关系图`}
					/>
					<div class="actions">
						<button onclick={copyResult}>{UI.copyBtn}</button>
						<button class="secondary" onclick={restart}>{UI.againBtn}</button>
					</div>
					<div class="toast" aria-live="polite">{toast}</div>
				</div>
			{/if}
		</div>
	</section>
</section>

<style>
	.wrap {
		--card: rgba(255, 255, 255, 0.86);
		--ink: #39505a;
		--muted: #6e8790;
		--shadow: 0 20px 60px rgba(47, 122, 141, 0.22);
		--radius: 28px;

		width: 100%;
		min-height: 100vh;
		margin: 0;
		padding: 28px 18px 40px;
		display: grid;
		place-items: center;
		text-align: left;
		color: var(--ink);
		background:
			radial-gradient(circle at 12% 14%, rgba(255, 255, 255, 0.55) 0 7%, transparent 8%),
			radial-gradient(circle at 88% 8%, rgba(255, 255, 255, 0.35) 0 6%, transparent 7%),
			linear-gradient(180deg, #b7f2f7 0%, #dff9d1 100%);
	}

	.panel {
		width: min(720px, 100%);
		background: var(--card);
		border: 3px solid rgba(255, 255, 255, 0.85);
		border-radius: var(--radius);
		box-shadow: var(--shadow);
		overflow: hidden;
		position: relative;
	}
	.panel::before {
		content: "";
		position: absolute;
		inset: 0 0 auto 0;
		height: 10px;
		background: linear-gradient(90deg, #80e36a, #43d8c9, #ffe067, #ff9f80);
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
		box-shadow: 0 8px 20px rgba(66, 151, 121, 0.1);
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
	button:hover {
		transform: translateY(-1px);
		box-shadow: 0 14px 28px rgba(48, 173, 132, 0.3);
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
		color: #3c565f;
		background: #fff;
		border: 2px solid transparent;
		box-shadow: 0 10px 30px rgba(52, 111, 132, 0.08);
		border-radius: 20px;
		padding: 16px 18px;
		font-weight: 800;
		line-height: 1.55;
	}
	.option:hover {
		border-color: rgba(68, 199, 179, 0.45);
		background: #fafffb;
	}

	.nav {
		display: flex;
		gap: 12px;
		justify-content: space-between;
		align-items: center;
		margin-top: 24px;
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
	.result-img {
		width: min(380px, 86%);
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
	.relation-img {
		width: min(520px, 100%);
		margin: 0 auto;
		display: block;
		border-radius: 24px;
		box-shadow: 0 16px 42px rgba(74, 93, 99, 0.14);
		background: #fff;
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
		.inner {
			padding: 32px 18px 24px;
		}
		.lead {
			font-size: 16px;
		}
		.option {
			padding: 14px 15px;
		}
		.nav {
			flex-direction: column-reverse;
			align-items: stretch;
		}
		.nav button {
			width: 100%;
		}
	}
</style>
