/**
 * 設定ファイルのテンプレート
 * 
 * 【重要】使用方法:
 * 1. このファイルを config.js にコピー
 * 2. config.js に実際のAPIキーを設定
 * 3. config.js は絶対にGitにコミットしない（.gitignoreに記載済み）
 * 
 * cp config-template.js config.js
 */

const CONFIG = {
    // OpenAI API設定
    OPENAI: {
        API_KEY: 'your_openai_api_key_here',  // ここに実際のAPIキーを設定
        MODEL: 'gpt-4o-mini',
        MAX_TOKENS: 500,
        TEMPERATURE: 0.3
    },
    
    // Google Apps Script設定
    GAS: {
        WEB_APP_URL: 'your_gas_web_app_url_here'  // GASデプロイ後のURL
    },
    
    // Twitter設定
    TWITTER: {
        USERNAME: 'okazunoharmony',
        BEARER_TOKEN: 'your_twitter_bearer_token_here'  // オプション
    },
    
    // 更新設定
    UPDATE: {
        AUTO_UPDATE_INTERVAL: 30 * 60 * 1000,  // 30分
        FALLBACK_TO_LOCAL: true  // GAS接続失敗時にローカルJSONを使用
    }
};

// Node.js環境とブラウザ環境の両方で動作
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}