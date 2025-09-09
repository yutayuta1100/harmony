# 🚀 Vercelデプロイメントチェックリスト

## ✅ デプロイ前の確認事項

### 1. ファイル構造の確認
```
ハーモニーウェブサイト/
├── index.html
├── styles.css
├── script.js
├── favicon.svg
├── vercel.json
├── images/
│   ├── bento.png    ✅
│   ├── bento2.png   ✅
│   ├── bento3.jpg   ✅
│   ├── bento4.jpg   ✅
│   ├── shop.png     ✅
│   ├── shop2.png    ✅
│   ├── owner.png    ✅
│   └── cooking.png  ✅
└── その他のファイル
```

### 2. 画像パスの確認
- ✅ すべての画像パスが相対パス（`images/`）になっている
- ✅ 絶対パス（`/images/`）を使用していない
- ✅ ファビコンパスが相対パス

### 3. Vercelでのデプロイ手順

#### 方法1: GitHub経由（推奨）
1. GitHubリポジトリを作成
2. すべてのファイルをプッシュ（imagesフォルダ含む）
3. Vercelでリポジトリを接続
4. 自動デプロイを設定

#### 方法2: Vercel CLI
```bash
# Vercel CLIをインストール
npm i -g vercel

# プロジェクトディレクトリで実行
cd /Users/onoe/Desktop/ハーモニーウェブサイト
vercel

# 質問に答える
# - Set up and deploy? → Yes
# - Which scope? → 自分のアカウント
# - Link to existing project? → No
# - What's your project's name? → harmony-hongo
# - In which directory is your code located? → ./
```

### 4. デプロイ後の確認

1. **test-images.html**にアクセス
   - `https://your-domain.vercel.app/test-images.html`
   - すべての画像が表示されるか確認

2. **デベロッパーツールで確認**
   - Network タブを開く
   - 404エラーがないか確認
   - 画像のパスが正しいか確認

### 5. トラブルシューティング

#### 画像が表示されない場合

1. **Vercelのダッシュボードで確認**
   - Functions → Files
   - imagesフォルダが存在するか確認

2. **大文字小文字の確認**
   - ファイル名の大文字小文字が一致しているか
   - 例: `bento.PNG` vs `bento.png`

3. **ファイルサイズの確認**
   - 画像が大きすぎないか（10MB以下推奨）

4. **Build設定の確認**
   - Build Command: なし（静的サイト）
   - Output Directory: ./

### 6. 推奨される追加設定

```json
// vercel.json に追加
{
  "functions": {
    "api/*.js": {
      "maxDuration": 10
    }
  },
  "regions": ["hnd1"]  // 東京リージョン
}
```

## 📝 メモ

- 画像の最適化ツール: https://tinypng.com/
- Vercelステータス: https://vercel-status.com/
- サポート: https://vercel.com/support