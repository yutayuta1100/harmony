# ハーモニー 公式ウェブサイト

本郷三丁目のお弁当屋「ハーモニー」の公式ウェブサイトです。

## 🚀 公開前のチェックリスト

### 必須設定

- [ ] **Google Analytics ID を設定**
  - `index.html` の `G-XXXXXXXXXX` を実際のトラッキングIDに置き換え

- [ ] **お問い合わせフォームの設定**
  - [Formspree](https://formspree.io) でアカウント作成
  - `index.html` の `YOUR_FORM_ID` を実際のフォームIDに置き換え

- [ ] **ドメイン名の更新**
  - Open Graph tags のURL
  - sitemap.xml のURL
  - robots.txt のURL

### 推奨設定

- [ ] 画像の最適化（圧縮）
- [ ] SSL証明書の設定（ホスティングサービス側）
- [ ] バックアップの設定

## 📁 ファイル構成

```
ハーモニーウェブサイト/
├── index.html          # メインページ
├── styles.css          # スタイルシート
├── script.js           # JavaScript
├── 404.html           # 404エラーページ
├── sitemap.xml        # サイトマップ
├── robots.txt         # クローラー設定
├── favicon.svg        # ファビコン
├── images/            # 画像フォルダ
│   ├── bento.png
│   ├── bento2.png
│   ├── bento3.jpg
│   ├── bento4.jpg
│   ├── shop.png
│   ├── shop2.png
│   ├── owner.png
│   └── cooking.png
└── README.md          # このファイル
```

## 🔧 メンテナンス

### 日替わりメニューの更新
- Twitter (@okazunoharmony) で毎朝7時頃に自動更新
- 手動更新が必要な場合は `menu-data.json` を編集

### 営業時間・定休日の変更
- `index.html` の構造化データ内を編集
- フッター部分のテキストを編集

## 📞 サポート

技術的な問題が発生した場合の連絡先:
- 開発者: [連絡先を記入]

## 📄 ライセンス

© 2024 Harmony. All rights reserved.
