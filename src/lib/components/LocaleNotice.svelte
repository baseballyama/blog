<script lang="ts">
	import { page } from '$app/state';

	let { href, text, action }: { href: string; text: string; action: string } = $props();
</script>

<!--
	日本語話者が英語ページに来たときだけ出す案内。自動リダイレクトはしない。
	以前は navigator.language と localStorage を見るクライアント JS だったが、MPA 化に
	あたって「出すかどうか」はサーバー (Accept-Language + cookie) が決め、「閉じる」も
	JS 無しで動く POST フォームにした。
-->
<div class="locale-notice" lang="ja">
	<p>{text}</p>
	<a {href}>{action}</a>
	<form method="POST" action="/locale-notice/dismiss">
		<input type="hidden" name="redirect" value={page.url.pathname} />
		<button type="submit" aria-label="閉じる">×</button>
	</form>
</div>
