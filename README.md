# smartblack
スマートブラック（DyDo）向けプレイアブル・ミニゲーム集。

- **デブ活バスター**: 食事→8秒の運動チャレンジ→コーヒー習慣の紹介。無操作でも前面表示の24秒でCTAに到達。 `docs/debu-buster/`
- GitHub Pages: https://ichinose-pixel.github.io/smartblack/debu-buster/
- 進行テスト: `node --test tests/flow.test.cjs`

## 構成
- `index.html`: UI・商品表示・既存の埋め込み画像
- `core.js`: 操作に依存しない進行と入力制限
- `game.js`: 操作、演出、音、再プレイ
- `game.css`: スマホ・横画面・動きを減らす設定への対応

商品に触れて数値や体形が改善する演出は使用しません。ゲームの体形変化は架空です。商品情報はダイドードリンコの公式商品ページに準拠。現在の遷移先で確認できない初回半額表示を削除し、通常価格と購入プランへのリンクを掲載しています。
