/**
 * セキュアなメニュー更新システム
 * APIキーは config.js から読み込みます
 */

// 設定ファイルを動的に読み込み
let CONFIG = null;

async function loadConfig() {
    try {
        // config.js が存在する場合は読み込む
        const script = document.createElement('script');
        script.src = 'config.js';
        document.head.appendChild(script);
        
        // 少し待ってからCONFIGを確認
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (typeof window.CONFIG !== 'undefined') {
            CONFIG = window.CONFIG;
            console.log('設定ファイルを読み込みました');
            return true;
        }
    } catch (error) {
        console.log('config.js が見つかりません。デフォルト設定を使用します。');
    }
    
    // デフォルト設定
    CONFIG = {
        GAS: {
            WEB_APP_URL: null
        },
        UPDATE: {
            AUTO_UPDATE_INTERVAL: 30 * 60 * 1000,
            FALLBACK_TO_LOCAL: true
        }
    };
    
    return false;
}

// ========================================
// Google Apps Scriptから最新メニューを取得
// ========================================
async function fetchMenuFromGAS() {
    if (!CONFIG || !CONFIG.GAS || !CONFIG.GAS.WEB_APP_URL) {
        console.log('GAS URLが設定されていません');
        return null;
    }
    
    try {
        const response = await fetch(CONFIG.GAS.WEB_APP_URL);
        const result = await response.json();
        
        if (result.success && result.data) {
            console.log('GASから最新メニューを取得しました:', result.lastUpdated);
            return result.data;
        }
    } catch (error) {
        console.error('GAS接続エラー:', error);
    }
    
    return null;
}

// ========================================
// ローカルのJSONファイルから取得（フォールバック）
// ========================================
async function fetchMenuFromLocal() {
    try {
        const response = await fetch('menu-data.json');
        const data = await response.json();
        console.log('ローカルファイルからメニューを読み込みました');
        return data;
    } catch (error) {
        console.error('ローカルファイル読み込みエラー:', error);
        return null;
    }
}

// ========================================
// メニュー表示を更新
// ========================================
function updateMenuDisplay(data) {
    if (!data) return;
    
    // メニューカードを更新
    const menuCards = document.querySelectorAll('.menu-card');
    const menus = [data.menuA, data.menuB, data.menuC];
    
    menuCards.forEach((card, index) => {
        if (menus[index]) {
            const menu = menus[index];
            
            // 名前を更新
            const title = card.querySelector('h3');
            if (title) {
                title.textContent = menu.name || `日替わり弁当${String.fromCharCode(65 + index)}`;
            }
            
            // 説明を更新
            const desc = card.querySelector('.menu-description');
            if (desc) {
                desc.textContent = menu.description || '本日のメニューは店頭にてご確認ください';
            }
            
            // 価格を更新
            const price = card.querySelector('.price');
            if (price) {
                price.textContent = menu.price ? `¥${menu.price}` : '¥---';
            }
        }
    });
    
    // 更新時刻を表示
    updateTimestamp(data);
    
    // ローカルストレージに保存（キャッシュ）
    localStorage.setItem('menuData', JSON.stringify(data));
    localStorage.setItem('menuDataTimestamp', new Date().toISOString());
}

// ========================================
// 更新時刻の表示
// ========================================
function updateTimestamp(data) {
    const menuSection = document.querySelector('#menu');
    if (!menuSection) return;
    
    let updateElement = menuSection.querySelector('.update-info');
    
    if (!updateElement) {
        updateElement = document.createElement('div');
        updateElement.className = 'update-info';
        updateElement.style.cssText = `
            text-align: center;
            padding: 10px;
            background: #f0f0f0;
            border-radius: 10px;
            margin: 20px auto;
            max-width: 500px;
            font-size: 0.9rem;
            color: #666;
        `;
        menuSection.querySelector('.menu-content').appendChild(updateElement);
    }
    
    const source = data.source === 'twitter' ? 'Twitter' : 'ローカル';
    const date = data.date ? new Date(data.date) : new Date();
    const timeString = `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    
    updateElement.innerHTML = `
        <div>${source}から自動更新</div>
        <div>${timeString}</div>
    `;
}

// ========================================
// キャッシュから読み込み
// ========================================
function loadFromCache() {
    const cached = localStorage.getItem('menuData');
    const timestamp = localStorage.getItem('menuDataTimestamp');
    
    if (cached && timestamp) {
        const age = Date.now() - new Date(timestamp).getTime();
        // 30分以内のキャッシュは有効
        if (age < 30 * 60 * 1000) {
            console.log('キャッシュからメニューを読み込みました');
            return JSON.parse(cached);
        }
    }
    
    return null;
}

// ========================================
// メイン処理
// ========================================
async function initializeMenu() {
    console.log('メニューシステムを初期化中...');
    
    // 設定を読み込み
    await loadConfig();
    
    // キャッシュを確認
    const cached = loadFromCache();
    if (cached) {
        updateMenuDisplay(cached);
    }
    
    // 最新データを取得
    let menuData = null;
    
    // 1. GASから取得を試みる
    menuData = await fetchMenuFromGAS();
    
    // 2. 失敗したらローカルファイルから
    if (!menuData && CONFIG.UPDATE.FALLBACK_TO_LOCAL) {
        menuData = await fetchMenuFromLocal();
    }
    
    // 3. データがあれば表示を更新
    if (menuData) {
        updateMenuDisplay(menuData);
    }
    
    // 定期更新を設定
    if (CONFIG.UPDATE.AUTO_UPDATE_INTERVAL) {
        setInterval(async () => {
            console.log('メニューを自動更新中...');
            const data = await fetchMenuFromGAS() || await fetchMenuFromLocal();
            if (data) updateMenuDisplay(data);
        }, CONFIG.UPDATE.AUTO_UPDATE_INTERVAL);
    }
}


// ========================================
// ページ読み込み時に実行
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initializeMenu();
});

// コンソールメッセージ
console.log(`
====================================
セキュアメニュー更新システム
====================================
設定方法:
1. config-template.js を config.js にコピー
2. config.js にAPIキーを設定
3. Google Apps Scriptをデプロイ
4. config.js にGAS URLを設定

詳細: TWITTER_MENU_SETUP.md を参照
====================================
`);