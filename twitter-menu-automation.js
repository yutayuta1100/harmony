// ========================================
// Twitter → メニュー自動反映システム
// Google Apps Script版
// ========================================

/**
 * Google Apps Scriptにデプロイして使用
 * 
 * 設定手順:
 * 1. Google Apps Script (script.google.com) で新規プロジェクト作成
 * 2. このコードを貼り付け
 * 3. プロパティに以下を設定:
 *    - TWITTER_BEARER_TOKEN: Twitter API v2のBearer Token
 *    - OPENAI_API_KEY: OpenAI APIキー
 *    - TWITTER_USERNAME: okazunoharmony
 * 4. トリガーを設定（毎朝7:30に実行など）
 * 5. ウェブアプリとしてデプロイ
 */

// Google Apps Script版のコード
const GAS_CODE = `
// メイン処理
function updateMenuFromTwitter() {
  const props = PropertiesService.getScriptProperties();
  const TWITTER_BEARER = props.getProperty('TWITTER_BEARER_TOKEN');
  const OPENAI_KEY = props.getProperty('OPENAI_API_KEY');
  const USERNAME = 'okazunoharmony';
  
  try {
    // 1. Twitterから最新投稿を取得
    const tweet = getLatestTweet(USERNAME, TWITTER_BEARER);
    if (!tweet) {
      console.log('ツイートが取得できませんでした');
      return;
    }
    
    // 2. OpenAI APIで解析
    const menuData = analyzeMenuWithGPT(tweet.text, OPENAI_KEY);
    if (!menuData) {
      console.log('メニュー解析に失敗しました');
      return;
    }
    
    // 3. データを保存（Google Sheetsまたは返却用）
    saveMenuData(menuData);
    
    return menuData;
  } catch (error) {
    console.error('エラー:', error);
    return null;
  }
}

// Twitter API v2で最新ツイート取得
function getLatestTweet(username, bearerToken) {
  // ユーザーIDを取得
  const userUrl = \`https://api.twitter.com/2/users/by/username/\${username}\`;
  const userResponse = UrlFetchApp.fetch(userUrl, {
    headers: {
      'Authorization': \`Bearer \${bearerToken}\`
    }
  });
  const userData = JSON.parse(userResponse.getContentText());
  const userId = userData.data.id;
  
  // 最新ツイートを取得
  const tweetsUrl = \`https://api.twitter.com/2/users/\${userId}/tweets?max_results=5&exclude=retweets,replies\`;
  const tweetsResponse = UrlFetchApp.fetch(tweetsUrl, {
    headers: {
      'Authorization': \`Bearer \${bearerToken}\`
    }
  });
  const tweetsData = JSON.parse(tweetsResponse.getContentText());
  
  // 今日のツイートを探す
  const today = new Date();
  const todayStr = Utilities.formatDate(today, 'JST', 'yyyy-MM-dd');
  
  for (const tweet of tweetsData.data) {
    const tweetDate = new Date(tweet.created_at);
    const tweetDateStr = Utilities.formatDate(tweetDate, 'JST', 'yyyy-MM-dd');
    
    if (tweetDateStr === todayStr && tweet.text.includes('本日')) {
      return tweet;
    }
  }
  
  // 今日のツイートがない場合は最新を返す
  return tweetsData.data[0];
}

// OpenAI APIでメニューを解析
function analyzeMenuWithGPT(tweetText, apiKey) {
  const prompt = \`
以下のツイートから本日のお弁当メニュー情報を抽出してJSON形式で返してください。
3種類のメニュー（A, B, C）それぞれについて、名前、説明、価格を抽出してください。

ツイート:
\${tweetText}

以下のJSON形式で返してください:
{
  "menuA": {
    "name": "メニュー名",
    "description": "説明や副菜",
    "price": "価格（数字のみ）"
  },
  "menuB": {
    "name": "メニュー名",
    "description": "説明や副菜",
    "price": "価格（数字のみ）"
  },
  "menuC": {
    "name": "メニュー名",
    "description": "説明や副菜",
    "price": "価格（数字のみ）"
  }
}
\`;
  
  const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
    method: 'post',
    headers: {
      'Authorization': \`Bearer \${apiKey}\`,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'あなたは日本語のツイートからお弁当メニュー情報を正確に抽出するアシスタントです。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    })
  });
  
  const result = JSON.parse(response.getContentText());
  const menuData = JSON.parse(result.choices[0].message.content);
  
  // 日付を追加
  menuData.date = new Date().toISOString();
  menuData.source = 'twitter';
  
  return menuData;
}

// データを保存
function saveMenuData(menuData) {
  // オプション1: Google Sheetsに保存
  const sheet = SpreadsheetApp.openById('YOUR_SHEET_ID').getActiveSheet();
  const row = [
    new Date(),
    menuData.menuA.name,
    menuData.menuA.description,
    menuData.menuA.price,
    menuData.menuB.name,
    menuData.menuB.description,
    menuData.menuB.price,
    menuData.menuC.name,
    menuData.menuC.description,
    menuData.menuC.price
  ];
  sheet.appendRow(row);
  
  // オプション2: プロパティに保存（簡易版）
  PropertiesService.getScriptProperties().setProperty('latestMenu', JSON.stringify(menuData));
}

// ウェブアプリとして公開（GET）
function doGet() {
  const menuData = PropertiesService.getScriptProperties().getProperty('latestMenu');
  
  return ContentService
    .createTextOutput(menuData || '{}')
    .setMimeType(ContentService.MimeType.JSON);
}

// 毎朝自動実行（トリガー設定用）
function scheduledUpdate() {
  updateMenuFromTwitter();
}
`;

// ========================================
// GitHub Actions版
// ========================================

const GITHUB_ACTION_YAML = `
name: Update Menu from Twitter

on:
  schedule:
    # 毎朝7:30 JST (22:30 UTC)に実行
    - cron: '30 22 * * *'
  workflow_dispatch: # 手動実行も可能

jobs:
  update-menu:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install axios openai
    
    - name: Fetch and analyze tweet
      env:
        TWITTER_BEARER_TOKEN: \${{ secrets.TWITTER_BEARER_TOKEN }}
        OPENAI_API_KEY: \${{ secrets.OPENAI_API_KEY }}
      run: |
        node update-menu-from-twitter.js
    
    - name: Commit and push changes
      run: |
        git config --global user.name 'GitHub Actions'
        git config --global user.email 'actions@github.com'
        git add menu-data.json
        git commit -m "Update menu from Twitter - $(date +'%Y-%m-%d')" || exit 0
        git push
`;

// ========================================
// Node.js版スクリプト（GitHub Actions用）
// ========================================

const NODE_SCRIPT = `
const axios = require('axios');
const OpenAI = require('openai');
const fs = require('fs');

// 環境変数から設定を取得
const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

async function getLatestTweet() {
    try {
        // ユーザーID取得
        const userResponse = await axios.get(
            'https://api.twitter.com/2/users/by/username/okazunoharmony',
            {
                headers: {
                    'Authorization': \`Bearer \${TWITTER_BEARER_TOKEN}\`
                }
            }
        );
        const userId = userResponse.data.data.id;
        
        // 最新ツイート取得
        const tweetsResponse = await axios.get(
            \`https://api.twitter.com/2/users/\${userId}/tweets\`,
            {
                params: {
                    max_results: 5,
                    exclude: 'retweets,replies'
                },
                headers: {
                    'Authorization': \`Bearer \${TWITTER_BEARER_TOKEN}\`
                }
            }
        );
        
        // 今日のツイートを探す
        const today = new Date().toISOString().split('T')[0];
        const tweets = tweetsResponse.data.data;
        
        for (const tweet of tweets) {
            const tweetDate = tweet.created_at.split('T')[0];
            if (tweetDate === today && tweet.text.includes('本日')) {
                return tweet.text;
            }
        }
        
        // 最新のツイートを返す
        return tweets[0].text;
    } catch (error) {
        console.error('Twitter API Error:', error);
        return null;
    }
}

async function analyzeMenuWithGPT(tweetText) {
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: "あなたは日本語のツイートからお弁当メニュー情報を正確に抽出するアシスタントです。"
            },
            {
                role: "user",
                content: \`以下のツイートから本日のお弁当メニュー情報を抽出してJSON形式で返してください。
3種類のメニュー（A, B, C）それぞれについて、名前、説明、価格を抽出してください。

ツイート:
\${tweetText}

JSONフォーマット:
{
  "menuA": {"name": "メニュー名", "description": "説明", "price": "価格"},
  "menuB": {"name": "メニュー名", "description": "説明", "price": "価格"},
  "menuC": {"name": "メニュー名", "description": "説明", "price": "価格"}
}\`
            }
        ],
        response_format: { type: "json_object" }
    });
    
    return JSON.parse(completion.choices[0].message.content);
}

async function updateMenu() {
    console.log('Fetching latest tweet...');
    const tweetText = await getLatestTweet();
    
    if (!tweetText) {
        console.error('Failed to fetch tweet');
        return;
    }
    
    console.log('Tweet fetched:', tweetText.substring(0, 100) + '...');
    
    console.log('Analyzing with GPT...');
    const menuData = await analyzeMenuWithGPT(tweetText);
    
    // 日付と元データを追加
    menuData.date = new Date().toISOString();
    menuData.lastUpdated = new Date().toISOString();
    menuData.source = 'twitter';
    menuData.originalTweet = tweetText;
    
    // JSONファイルに保存
    fs.writeFileSync('menu-data.json', JSON.stringify(menuData, null, 2));
    console.log('Menu updated successfully!');
}

// 実行
updateMenu().catch(console.error);
`;

// ========================================
// クライアントサイドで使用する改良版
// ========================================

async function loadMenuFromGAS() {
    // Google Apps ScriptのウェブアプリURLを設定
    const GAS_URL = 'YOUR_GAS_WEB_APP_URL';
    
    try {
        const response = await fetch(GAS_URL);
        const menuData = await response.json();
        
        if (menuData && menuData.menuA) {
            updateMenuDisplay(menuData);
            console.log('メニューをTwitterから自動更新しました');
        }
    } catch (error) {
        console.error('メニュー取得エラー:', error);
        // フォールバック: ローカルのmenu-data.jsonを使用
        loadLocalMenu();
    }
}

async function loadLocalMenu() {
    try {
        const response = await fetch('menu-data.json');
        const menuData = await response.json();
        updateMenuDisplay(menuData);
    } catch (error) {
        console.error('ローカルメニュー取得エラー:', error);
    }
}

function updateMenuDisplay(data) {
    // メニューカードを更新
    const menuCards = document.querySelectorAll('.menu-card');
    const menus = [data.menuA, data.menuB, data.menuC];
    
    menuCards.forEach((card, index) => {
        if (menus[index]) {
            const menu = menus[index];
            
            // 名前を更新
            const title = card.querySelector('h3');
            if (title) title.textContent = menu.name || `日替わり弁当${String.fromCharCode(65 + index)}`;
            
            // 説明を更新
            const desc = card.querySelector('.menu-description');
            if (desc) desc.textContent = menu.description || '本日のメニューは店頭にてご確認ください';
            
            // 価格を更新
            const price = card.querySelector('.price');
            if (price) price.textContent = menu.price ? `¥${menu.price}` : '¥---';
        }
    });
    
    // 更新時刻を表示
    if (data.lastUpdated) {
        const updateTime = new Date(data.lastUpdated);
        const timeString = `${updateTime.getMonth() + 1}月${updateTime.getDate()}日 ${updateTime.getHours()}:${updateTime.getMinutes().toString().padStart(2, '0')}更新`;
        
        const menuSection = document.querySelector('#menu');
        let updateElement = menuSection.querySelector('.update-time');
        
        if (!updateElement) {
            updateElement = document.createElement('p');
            updateElement.className = 'update-time';
            updateElement.style.cssText = 'text-align: center; color: #757575; font-size: 0.9rem; margin-top: 1rem;';
            menuSection.querySelector('.menu-content').appendChild(updateElement);
        }
        
        updateElement.textContent = `Twitter自動更新: ${timeString}`;
    }
}

// 初期化時に実行
document.addEventListener('DOMContentLoaded', function() {
    // Google Apps Script版を使用する場合
    // loadMenuFromGAS();
    
    // ローカルJSON版を使用する場合
    loadLocalMenu();
    
    // 30分ごとに更新
    setInterval(loadLocalMenu, 30 * 60 * 1000);
});

console.log(`
=================================
Twitter自動メニュー更新システム
=================================
実装方法:

1. Google Apps Script版（推奨）
   - 無料で使用可能
   - サーバー不要
   - 自動実行可能

2. GitHub Actions版
   - GitHubでホスティングしている場合に最適
   - 完全自動化

詳細は twitter-menu-automation.js を参照
=================================
`);