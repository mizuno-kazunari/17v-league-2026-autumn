# イチナナV 麻雀リーグ 2026 — ホームページ

Discord「イチナナV　麻雀リーグ　チーム戦」向けの静的サイトです。  
配色は **淡いオレンジベース＋赤の刺し色**（`#c8103c`）。

公開URL: https://mizuno-kazunari.github.io/17v-league-2026-autumn/

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
├── data/results.json
└── assets/logos/
    ├── league-logo-temp.png # リーグロゴ
    ├── team-koneko.png      # 小猫熊
    ├── team-apple.png       # お前をApple牌
    ├── team-pandaz.png      # PANDAaaaZ
    └── team-nekojyaku.png   # 猫雀カルテット
```

## カラー（淡いオレンジ＋赤刺し色）

| トークン | 値 |
|---|---|
| `--c-bg` | `#FFF5EB` |
| `--c-bg-soft` | `#FFE8D6` |
| `--c-bg-mute` | `#FFDFC8` |
| `--c-ink` | `#1a1a1a` |
| `--c-accent` | `#c8103c` |
| `--c-accent-deep` | `#a30a2e` |
| `--c-accent-soft` | `#fde8ee` |

## リザルト更新

開幕後は `data/results.json` を更新するとランキングが反映されます。

## 更新メモ（未確定・追記予定）

- 小猫熊 / PANDAaaaZ / 猫雀カルテットのメンバー名
- 11/6 以外の開始時刻・対戦カード
- リザルト（開幕後：雀魂大会戦・Excel集計）
- 正式リーグロゴへの差し替え

## クレジット

- 運営：相川 翔
- 雀魂大会ID：128015
