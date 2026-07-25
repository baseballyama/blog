import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		/*
		 * フォントは絶対にインライン化しない。
		 *
		 * 既定では 4 KB 未満のアセットが base64 で CSS に埋め込まれる。画像やアイコンなら
		 * リクエストが減って得だが、フォントでは逆になる。この CSS はレンダーブロッキング
		 * であり、しかも @font-face は unicode-range で「必要なときだけ落とす」ように
		 * 作られている。埋め込むとその遅延読み込みが無効化され、使わない字形まで初回描画の
		 * 手前に居座る。実際 cyrillic-ext のサブセットがこれに当たり、CSS の 36% を
		 * 占めていた (詳細は src/app.css の @font-face のコメント)。
		 *
		 * 今参照しているサブセットは 2 つとも 4 KB を超えるので現状は素通りするが、
		 * サブセットを足したときに黙って戻るのを防ぐために明示しておく。
		 */
		assetsInlineLimit: (filePath) =>
			/\.(woff2?|ttf|otf|eot)$/i.test(filePath) ? false : undefined,
	},
});
