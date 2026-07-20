<script lang="ts">
	import { onMount } from 'svelte';

	let { href, text, action }: { href: string; text: string; action: string } = $props();

	const STORAGE_KEY = 'locale-notice-dismissed';

	// 日本語話者が英語ページに来たときだけ出す。自動リダイレクトはしない。
	let visible = $state(false);

	onMount(() => {
		try {
			if (localStorage.getItem(STORAGE_KEY) === '1') return;
			if (!navigator.language?.toLowerCase().startsWith('ja')) return;
			visible = true;
		} catch {
			// localStorage が使えない環境では何も出さない
		}
	});

	function dismiss() {
		visible = false;
		try {
			localStorage.setItem(STORAGE_KEY, '1');
		} catch {
			// 保存できなくても閉じられればよい
		}
	}
</script>

{#if visible}
	<div class="locale-notice" lang="ja">
		<p>{text}</p>
		<a {href}>{action}</a>
		<button type="button" onclick={dismiss} aria-label="閉じる">×</button>
	</div>
{/if}
