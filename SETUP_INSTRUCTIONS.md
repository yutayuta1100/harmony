# 🔐 セキュアなAPIキー設定手順

## ⚠️ 重要な注意事項
**APIキーは絶対にGitHubや公開サーバーにアップロードしないでください**

## 📋 設定手順

### ステップ1: ローカル設定ファイルの作成

```bash
# config-template.js を config.js にコピー
cp config-template.js config.js
```

### ステップ2: config.js を編集

```javascript
const CONFIG = {
    OPENAI: {
        API_KEY: 'sk-proj-...',  // ここに実際のAPIキーを貼り付け
    },
    // ...
};
```

### ステップ3: Google Apps Scriptの設定

#### 3-1. 新規プロジェクト作成
1. [Google Apps Script](https://script.google.com/) にアクセス
2. 「新規プロジェクト」をクリック

#### 3-2. コードを貼り付け
1. `gas-menu-updater.js` の内容をすべてコピー
2. Google Apps Scriptエディタに貼り付け

#### 3-3. APIキーを安全に設定
1. 左側メニューの「プロジェクトの設定」⚙️ をクリック
2. 下にスクロールして「スクリプト プロパティ」
3. 「プロパティを追加」をクリック
4. 以下を設定:

| プロパティ名 | 値 |
|------------|---|
| OPENAI_API_KEY | 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 |
| TWITTER_USERNAME | okazunoharmony |

#### 3-4. テスト実行
```javascript
// エディタで以下の関数を実行
checkSetup()  // 設定確認
testMenuUpdate()  // テスト実行
```

#### 3-5. ウェブアプリとしてデプロイ
1. 「デプロイ」→「新しいデプロイ」
2. 設定:
   - 種類: ウェブアプリ
   - 説明: Twitter Menu API
   - 実行ユーザー: 自分
   - アクセスできるユーザー: 全員
3. 「デプロイ」をクリック
4. 表示されるURLをコピー

#### 3-6. config.js にURL設定
```javascript
GAS: {
    WEB_APP_URL: 'https://script.google.com/macros/s/xxxxx/exec'
}
```

### ステップ4: トリガー設定（自動実行）

1. Google Apps Scriptで「時計」アイコン（トリガー）をクリック
2. 「トリガーを追加」
3. 設定:
   - 関数: `scheduledUpdate`
   - イベントソース: 時間主導型
   - 時間ベース: 日付ベースのタイマー
   - 時刻: 午前7時30分〜8時30分

## 🧪 動作確認

### ブラウザで確認
1. `index.html` を開く
2. デベロッパーツール（F12）を開く
3. Consoleタブで以下を確認:
   - 「設定ファイルを読み込みました」
   - 「GASから最新メニューを取得しました」

### 手動更新テスト
メニューセクションの「🔄 最新メニューを取得」ボタンをクリック

## 🔒 セキュリティチェックリスト

- [ ] `config.js` が `.gitignore` に含まれている
- [ ] APIキーがコード内に直接書かれていない
- [ ] Google Apps ScriptのAPIキーがプロパティに保存されている
- [ ] GitHubにプッシュする前に `git status` で確認

## 🚨 トラブルシューティング

### エラー: "OpenAI APIキーが設定されていません"
→ Google Apps Scriptのスクリプトプロパティを確認

### エラー: "GAS URLが設定されていません"
→ config.js のGAS.WEB_APP_URLを確認

### メニューが更新されない
1. Google Apps Scriptの実行ログを確認
2. ブラウザのコンソールログを確認
3. キャッシュをクリア（Ctrl+Shift+R）

## 📞 サポート

問題が解決しない場合:
1. エラーメッセージをコピー
2. Google Apps Scriptの実行ログをコピー
3. ブラウザのコンソールログをコピー

---

## ✅ 完了確認

すべて設定が完了したら:
1. 毎朝7:30に自動でTwitterからメニューを取得
2. OpenAI APIで解析
3. ウェブサイトに自動反映

これで完全自動化の完成です！🎉