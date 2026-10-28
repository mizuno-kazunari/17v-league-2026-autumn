# イチナナV 麻雀リーグ 2026 秋ノ陣 — ホームページ（ドラフト）

Discord「イチナナV　麻雀リーグ　チーム戦」向けの静的サイトです。  
配色は **白ベース＋赤の刺し色**（`#c8103c`）。構成は [明戸杯2026](https://enataso0810-taso.github.io/meidocup2026/) を参考にしています。

**Discordサーバー情報をもとに作成したドラフトです。公式確認後に公開してください。**

## ローカルで開く

### 方法A：そのまま開く

`index.html` をブラウザで開く（`file://`）。

### 方法B：簡易サーバー（推奨）

```bash
cd ichinana-v-mahjong-league
python3 -m http.server 8080
```

ブラウザで http://localhost:8080/ を開く。

## 構成

```
ichinana-v-mahjong-league/
├── index.html
├── README.md
├── css/styles.css
├── js/main.js
└── assets/logos/
    ├── league-logo-temp.png # 大会ロゴ（仮）
    ├── team-koneko.png      # 小猫熊
    ├── team-apple.png       # お前をApple牌
    ├── team-pandaz.png      # PANDAaaaZ
    └── team-nekojyaku.png   # 猫雀カルテット
```

大会ロゴ（`league-logo-temp.png`）は仮素材です。正式ロゴが決まり次第差し替えてください。

## カラー（白ベース＋赤刺し色）

| トークン | 値 |
|---|---|
| `--c-bg` | `#ffffff` |
| `--c-bg-soft` | `#f7f7f8` |
| `--c-ink` | `#1a1a1a` |
| `--c-accent` | `#c8103c` |
| `--c-accent-deep` | `#a30a2e` |
| `--c-accent-soft` | `#fde8ee` |

## GitHub Pages で公開する

1. 新しいリポジトリを作成（例：`ichinana-v-mahjong-league`）
2. このフォルダの内容を push
3. リポジトリ **Settings → Pages**
   - Source: **Deploy from a branch**
   - Branch: `main`（または `gh-pages`）／ Folder: `/ (root)`
4. 数分後、`https://<user>.github.io/<repo>/` で公開

サブディレクトリ公開の場合も、相対パスのみ使用しているため追加設定は不要です。

## 更新メモ（未確定・追記予定）

- 小猫熊 / PANDAaaaZ / 猫雀カルテットのメンバー名
- 11/6 以外の開始時刻・対戦カード
- リザルト（開幕後：雀魂大会戦・Excel集計＝相川翔）
- ルール細則（リーダー会議確定後）
- 正式大会ロゴへの差し替え

## クレジット

- 運営：mikicat（みきにゃ）
- 雀魂大会ID：128015
- 参考デザイン：明戸杯2026
