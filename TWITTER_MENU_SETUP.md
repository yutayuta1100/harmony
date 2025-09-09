# Twitter自動メニュー更新システム 設定ガイド

## 🎯 概要
@okazunoharmony のTwitter投稿を自動的に取得し、OpenAI APIで解析してウェブサイトのメニューに反映させるシステムです。

## 📋 必要なもの
1. **Twitter API v2 のBearer Token**
2. **OpenAI API Key**
3. **Google Apps Script** または **GitHub** アカウント

---

## 🚀 方法1: Google Apps Script版（推奨）

### メリット
- ✅ 完全無料
- ✅ サーバー不要
- ✅ 設定が簡単
- ✅ 自動実行可能

### 設定手順

#### 1. Twitter API の取得
1. [Twitter Developer Portal](https://developer.twitter.com/) にアクセス
2. アプリを作成
3. Bearer Tokenを取得

#### 2. OpenAI API Keyの取得
1. [OpenAI Platform](https://platform.openai.com/) にアクセス
2. API Keysセクションで新規キーを作成
3. APIキーをコピー（一度しか表示されません）

#### 3. Google Apps Scriptの設定
1. [Google Apps Script](https://script.google.com/) にアクセス
2. 新規プロジェクトを作成
3. `twitter-menu-automation.js` のGAS_CODE部分をコピー＆ペースト

#### 4. プロパティの設定
```javascript
// スクリプトエディタで「プロジェクトの設定」→「スクリプトプロパティ」
TWITTER_BEARER_TOKEN: あなたのTwitter Bearer Token
OPENAI_API_KEY: あなたのOpenAI APIキー
```

#### 5. トリガーの設定
- 関数: `scheduledUpdate`
- 実行タイプ: 時間主導型
- 時刻: 毎日午前7時30分〜8時30分

#### 6. ウェブアプリとしてデプロイ
1. 「デプロイ」→「新しいデプロイ」
2. 種類: ウェブアプリ
3. アクセス権限: 全員
4. デプロイ

#### 7. ウェブサイトの更新
```javascript
// menu-updater.js の最初に追加
const GAS_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
```

---

## 🚀 方法2: GitHub Actions版

### メリット
- ✅ GitHub Pagesと統合
- ✅ 履歴管理
- ✅ 完全自動化

### 設定手順

#### 1. リポジトリの準備
```bash
# ファイル構造
your-repo/
├── .github/
│   └── workflows/
│       └── update-menu.yml
├── update-menu-from-twitter.js
├── menu-data.json
└── index.html
```

#### 2. GitHub Secretsの設定
リポジトリの Settings → Secrets → Actions で以下を設定:
- `TWITTER_BEARER_TOKEN`
- `OPENAI_API_KEY`

#### 3. ワークフローファイルの作成
`.github/workflows/update-menu.yml` を作成し、GITHUB_ACTION_YAMLの内容を貼り付け

#### 4. Node.jsスクリプトの作成
`update-menu-from-twitter.js` を作成し、NODE_SCRIPTの内容を貼り付け

#### 5. package.jsonの作成
```json
{
  "name": "harmony-menu-updater",
  "version": "1.0.0",
  "dependencies": {
    "axios": "^1.5.0",
    "openai": "^4.0.0"
  }
}
```

---

## 🚀 方法3: 簡易版（手動トリガー）

### ブックマークレット版
```javascript
javascript:(function(){
    // ブラウザのコンソールで実行
    fetch('https://your-gas-url.com/exec')
        .then(r => r.json())
        .then(data => {
            localStorage.setItem('menuData', JSON.stringify(data));
            location.reload();
        });
})();
```

---

## 📝 Twitter投稿フォーマット例

効果的に解析されるツイート例:

```
おはようございます☀️
本日のお弁当メニューです🍱

【A】豚肉の生姜焼き弁当 ¥550
副菜：ひじき煮、ポテトサラダ、漬物

【B】鶏の唐揚げ弁当 ¥600
副菜：きんぴらごぼう、玉子焼き、野菜炒め

【C】鯖の塩焼き弁当 ¥650
副菜：肉じゃが、ほうれん草のお浸し、漬物

本日も11時より営業しております。
よろしくお願いします😊

#本郷三丁目 #お弁当 #ハーモニー
```

---

## 🔧 トラブルシューティング

### Twitter APIが取得できない
- Bearer Tokenの有効期限を確認
- API制限（月間上限）を確認

### OpenAI APIエラー
- APIキーの有効性を確認
- 利用制限・残高を確認

### メニューが更新されない
- Google Apps Scriptのログを確認
- GitHub Actionsのログを確認
- CORSエラーの場合はプロキシを設定

---

## 💰 コスト

### 月間概算（毎日1回更新の場合）
- Twitter API: **無料** (Essential tierの範囲内)
- OpenAI API: **約$0.30** (GPT-4o-miniを使用)
- Google Apps Script: **無料**
- GitHub Actions: **無料** (パブリックリポジトリ)

**合計: 月額約30円〜40円**

---

## 📞 サポート

設定でお困りの場合は、以下の情報をご準備ください:
- エラーメッセージ
- 実行環境（Google Apps Script / GitHub Actions）
- APIの種類とプラン

---

## 🎉 完成イメージ

1. 毎朝7時前に@okazunoharmonyがツイート
2. 7時30分に自動取得・解析
3. ウェブサイトのメニューが自動更新
4. お客様は常に最新メニューを確認可能

これで、手動更新の手間なく、Twitter投稿だけでウェブサイトが自動更新されます！