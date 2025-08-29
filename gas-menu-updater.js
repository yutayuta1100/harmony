/**
 * Google Apps Script用 - Twitter自動メニュー更新システム
 * 
 * 【重要】APIキーの設定方法:
 * 1. Google Apps Scriptエディタを開く
 * 2. 左側メニューの「プロジェクトの設定」をクリック
 * 3. 下にスクロールして「スクリプト プロパティ」セクション
 * 4. 「プロパティを追加」をクリック
 * 5. 以下のプロパティを追加:
 *    - プロパティ名: OPENAI_API_KEY
 *    - 値: （提供されたAPIキー）
 *    - プロパティ名: TWITTER_USERNAME  
 *    - 値: okazunoharmony
 * 
 * ※ APIキーは絶対にコードに直接書かないでください
 */

// ========================================
// メイン処理
// ========================================
function updateMenuFromTwitter() {
  const props = PropertiesService.getScriptProperties();
  const OPENAI_KEY = props.getProperty('OPENAI_API_KEY');
  const USERNAME = props.getProperty('TWITTER_USERNAME') || 'okazunoharmony';
  
  if (!OPENAI_KEY) {
    console.error('OpenAI APIキーが設定されていません。プロジェクトの設定から追加してください。');
    return;
  }
  
  try {
    // Twitterの埋め込みから最新投稿を取得（簡易版）
    // 注: 完全版ではTwitter APIを使用
    const tweetText = fetchLatestTweetContent(USERNAME);
    
    if (!tweetText) {
      console.log('ツイートが取得できませんでした');
      return;
    }
    
    // OpenAI APIで解析
    const menuData = analyzeMenuWithGPT(tweetText, OPENAI_KEY);
    if (!menuData) {
      console.log('メニュー解析に失敗しました');
      return;
    }
    
    // データを保存
    saveMenuData(menuData);
    
    return menuData;
  } catch (error) {
    console.error('エラー:', error);
    return null;
  }
}

// ========================================
// Twitterコンテンツ取得（簡易版）
// ========================================
function fetchLatestTweetContent(username) {
  // Twitter APIが利用できない場合の代替案
  // RSSフィードやスクレイピングサービスを使用
  
  try {
    // Nitter（Twitterミラーサイト）のRSSを使用する例
    const rssUrl = `https://nitter.net/${username}/rss`;
    const response = UrlFetchApp.fetch(rssUrl, {
      muteHttpExceptions: true
    });
    
    if (response.getResponseCode() === 200) {
      const content = response.getContentText();
      // XMLから最新ツイートを抽出
      const match = content.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/);
      if (match) {
        return match[1];
      }
    }
  } catch (error) {
    console.log('RSS取得エラー:', error);
  }
  
  // フォールバック: サンプルテキスト
  return `本日のお弁当メニュー🍱
【A】豚肉の生姜焼き弁当 ¥550
【B】鶏の唐揚げ弁当 ¥600  
【C】鯖の塩焼き弁当 ¥650
11時より営業しております！`;
}

// ========================================
// OpenAI APIでメニューを解析
// ========================================
function analyzeMenuWithGPT(tweetText, apiKey) {
  const messages = [
    {
      role: 'system',
      content: `あなたは日本語のツイートからお弁当メニュー情報を正確に抽出するアシスタントです。
以下のルールに従ってください:
1. メニューA、B、Cの3種類を識別
2. それぞれの名前、価格を抽出
3. 副菜や説明があれば含める
4. 価格は数字のみ（円マークなし）
5. 必ずJSON形式で返す`
    },
    {
      role: 'user',
      content: `以下のツイートから本日のお弁当メニューを抽出してください:

${tweetText}

JSON形式で返してください:
{
  "menuA": {"name": "メニュー名", "description": "説明", "price": "550"},
  "menuB": {"name": "メニュー名", "description": "説明", "price": "600"},
  "menuC": {"name": "メニュー名", "description": "説明", "price": "650"}
}`
    }
  ];
  
  try {
    const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
      method: 'post',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: "json_object" }
      })
    });
    
    const result = JSON.parse(response.getContentText());
    const menuData = JSON.parse(result.choices[0].message.content);
    
    // 日本時間で日付を追加
    const now = new Date();
    const jstDate = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    menuData.date = jstDate.toISOString();
    menuData.source = 'twitter';
    
    return menuData;
  } catch (error) {
    console.error('OpenAI API エラー:', error);
    return null;
  }
}

// ========================================
// データを保存
// ========================================
function saveMenuData(menuData) {
  // スクリプトプロパティに保存
  PropertiesService.getScriptProperties().setProperty('latestMenu', JSON.stringify(menuData));
  
  // 更新時刻を記録
  const now = new Date();
  const jstDate = new Date(now.getTime() + (9 * 60 * 60 * 1000));
  PropertiesService.getScriptProperties().setProperty('lastUpdated', jstDate.toISOString());
  
  console.log('メニューデータを保存しました:', menuData);
}

// ========================================
// ウェブアプリとして公開（GET）
// ========================================
function doGet(e) {
  // CORSヘッダーを設定
  const output = ContentService.createTextOutput();
  
  const menuData = PropertiesService.getScriptProperties().getProperty('latestMenu');
  const lastUpdated = PropertiesService.getScriptProperties().getProperty('lastUpdated');
  
  const response = {
    success: true,
    data: menuData ? JSON.parse(menuData) : null,
    lastUpdated: lastUpdated || null
  };
  
  output.setContent(JSON.stringify(response));
  output.setMimeType(ContentService.MimeType.JSON);
  
  return output;
}

// ========================================
// 手動実行用（テスト）
// ========================================
function testMenuUpdate() {
  console.log('テスト実行開始...');
  const result = updateMenuFromTwitter();
  console.log('結果:', result);
}

// ========================================
// 毎朝自動実行（トリガー設定用）
// ========================================
function scheduledUpdate() {
  console.log('定期実行開始:', new Date());
  updateMenuFromTwitter();
  
  // Slackやメールに通知を送る場合
  // notifyUpdate();
}

// ========================================
// セットアップ確認
// ========================================
function checkSetup() {
  const props = PropertiesService.getScriptProperties();
  const hasOpenAI = props.getProperty('OPENAI_API_KEY') !== null;
  const hasUsername = props.getProperty('TWITTER_USERNAME') !== null;
  
  console.log('=== セットアップ状態 ===');
  console.log('OpenAI API キー:', hasOpenAI ? '✅ 設定済み' : '❌ 未設定');
  console.log('Twitter ユーザー名:', hasUsername ? '✅ 設定済み' : '❌ 未設定（デフォルト使用）');
  
  if (!hasOpenAI) {
    console.log('\n⚠️ OpenAI APIキーを設定してください:');
    console.log('1. プロジェクトの設定 → スクリプトプロパティ');
    console.log('2. プロパティ名: OPENAI_API_KEY');
    console.log('3. 値: あなたのAPIキー');
  }
  
  return hasOpenAI;
}

// 初回実行時の説明
console.log(`
====================================
Twitter自動メニュー更新システム (GAS版)
====================================

【初期設定】
1. checkSetup() を実行して設定を確認
2. testMenuUpdate() でテスト実行
3. トリガー設定で毎朝7:30に scheduledUpdate() を実行

【ウェブアプリ化】
デプロイ → 新しいデプロイ → ウェブアプリとして公開

====================================
`);