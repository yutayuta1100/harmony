// ========================================
// メニュー自動更新システム
// ========================================

// Googleスプレッドシート連携の場合
const SHEET_CONFIG = {
    // ここにGoogleスプレッドシートのIDを設定
    SHEET_ID: 'YOUR_SHEET_ID_HERE',
    // Google Sheets APIキー（公開読み取り専用）
    API_KEY: 'YOUR_API_KEY_HERE',
    // データ範囲
    RANGE: 'Sheet1!A1:E10'
};

// メニューデータの取得と表示
async function loadTodayMenu() {
    try {
        // 方法1: Googleスプレッドシートから取得
        if (SHEET_CONFIG.SHEET_ID !== 'YOUR_SHEET_ID_HERE') {
            const menuData = await fetchGoogleSheetsData();
            if (menuData) {
                updateMenuDisplay(menuData);
                return;
            }
        }
        
        // 方法2: JSONファイルから取得（ローカル更新）
        const response = await fetch('menu-data.json');
        if (response.ok) {
            const data = await response.json();
            updateMenuDisplay(data);
        }
    } catch (error) {
        console.log('メニューデータの取得に失敗しました:', error);
        // エラー時はデフォルト表示のまま
    }
}

// Googleスプレッドシートからデータ取得
async function fetchGoogleSheetsData() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_CONFIG.SHEET_ID}/values/${SHEET_CONFIG.RANGE}?key=${SHEET_CONFIG.API_KEY}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        
        const data = await response.json();
        const values = data.values;
        
        if (!values || values.length < 2) return null;
        
        // データをパース（1行目はヘッダー、2行目以降がデータ）
        const today = new Date().toISOString().split('T')[0];
        const todayRow = values.find(row => row[0] === today);
        
        if (!todayRow) return null;
        
        return {
            date: todayRow[0],
            menuA: {
                name: todayRow[1],
                description: todayRow[2],
                price: todayRow[3]
            },
            menuB: {
                name: todayRow[4],
                description: todayRow[5],
                price: todayRow[6]
            },
            menuC: {
                name: todayRow[7],
                description: todayRow[8],
                price: todayRow[9]
            }
        };
    } catch (error) {
        console.error('Googleスプレッドシート取得エラー:', error);
        return null;
    }
}

// メニュー表示を更新
function updateMenuDisplay(data) {
    // 日替わり弁当Aを更新
    const menuACard = document.querySelector('.menu-card:nth-child(1)');
    if (menuACard && data.menuA) {
        updateMenuCard(menuACard, 'A', data.menuA);
    }
    
    // 日替わり弁当Bを更新
    const menuBCard = document.querySelector('.menu-card:nth-child(2)');
    if (menuBCard && data.menuB) {
        updateMenuCard(menuBCard, 'B', data.menuB);
    }
    
    // 日替わり弁当Cを更新
    const menuCCard = document.querySelector('.menu-card:nth-child(3)');
    if (menuCCard && data.menuC) {
        updateMenuCard(menuCCard, 'C', data.menuC);
    }
    
    // 更新日時を表示
    if (data.date) {
        addUpdateTime(data.date);
    }
}

// 個別のメニューカードを更新
function updateMenuCard(card, type, menuData) {
    // タイトルを更新
    const title = card.querySelector('h3');
    if (title && menuData.name) {
        title.textContent = menuData.name;
    }
    
    // 説明文を更新
    const description = card.querySelector('.menu-description');
    if (description && menuData.description) {
        description.textContent = menuData.description;
    }
    
    // 価格を更新
    const price = card.querySelector('.price');
    if (price && menuData.price) {
        price.textContent = `¥${menuData.price}`;
    }
}

// 更新日時を追加
function addUpdateTime(date) {
    const menuSection = document.querySelector('.menu-content');
    if (!menuSection) return;
    
    // 既存の更新日時を削除
    const existingTime = document.querySelector('.menu-update-time');
    if (existingTime) existingTime.remove();
    
    // 新しい更新日時を追加
    const updateTime = document.createElement('p');
    updateTime.className = 'menu-update-time';
    updateTime.style.cssText = 'text-align: center; color: #757575; font-size: 0.9rem; margin-top: 2rem;';
    updateTime.textContent = `最終更新: ${formatDate(date)}`;
    menuSection.appendChild(updateTime);
}

// 日付フォーマット
function formatDate(dateString) {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month}月${day}日 ${hours}:${minutes}`;
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', function() {
    // メニューデータを読み込み
    loadTodayMenu();
    
    // 30分ごとに自動更新
    setInterval(loadTodayMenu, 30 * 60 * 1000);
});

// ========================================
// 簡易管理機能（開発用）
// ========================================
function enableMenuEdit() {
    const menuCards = document.querySelectorAll('.menu-card');
    menuCards.forEach((card, index) => {
        const title = card.querySelector('h3');
        const description = card.querySelector('.menu-description');
        const price = card.querySelector('.price');
        
        // 編集可能にする
        title.contentEditable = true;
        description.contentEditable = true;
        price.contentEditable = true;
        
        // スタイルを追加
        [title, description, price].forEach(el => {
            el.style.outline = '1px dashed #2E7D32';
            el.style.padding = '5px';
        });
    });
    
    // 保存ボタンを追加
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'メニューを保存';
    saveBtn.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: #2E7D32; color: white; padding: 15px 30px; border-radius: 50px; border: none; cursor: pointer; z-index: 1000;';
    saveBtn.onclick = saveMenuData;
    document.body.appendChild(saveBtn);
}

// メニューデータを保存
function saveMenuData() {
    const menuData = {
        date: new Date().toISOString(),
        menuA: {},
        menuB: {},
        menuC: {}
    };
    
    const menuCards = document.querySelectorAll('.menu-card');
    menuCards.forEach((card, index) => {
        const type = ['menuA', 'menuB', 'menuC'][index];
        menuData[type] = {
            name: card.querySelector('h3').textContent,
            description: card.querySelector('.menu-description').textContent,
            price: card.querySelector('.price').textContent.replace('¥', '')
        };
    });
    
    // JSONとしてダウンロード
    const blob = new Blob([JSON.stringify(menuData, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'menu-data.json';
    a.click();
    
    console.log('メニューデータを保存しました:', menuData);
}

// コンソールから編集モードを有効化
// console.log('編集モードを有効にするには、コンソールで enableMenuEdit() を実行してください');