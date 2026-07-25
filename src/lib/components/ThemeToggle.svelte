<!--
	テーマ切り替えボタン。csr = false なので Svelte のイベントハンドラは付かない。
	クリックは app.html のインラインスクリプトが [data-theme-toggle] への委譲で拾い、
	出すアイコンは :root[data-theme] を見て CSS が切り替える。つまりこのコンポーネントは
	完全に静的な HTML として出力される。
-->
<button
	class="theme-toggle"
	type="button"
	data-theme-toggle
	aria-label="Toggle theme"
	title="Toggle theme"
>
	<!-- sun: dark のときに出す（押すと light になる） -->
	<svg
		class="icon-sun"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		aria-hidden="true"
	>
		<circle cx="12" cy="12" r="4" />
		<path
			d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
			stroke-linecap="round"
		/>
	</svg>
	<!-- moon: light のときに出す（押すと dark になる） -->
	<svg class="icon-moon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
		<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
	</svg>
</button>
