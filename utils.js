// Global storage
let originalLines = [];
let editedValues = { title: '', description: '', settings: {} };
let originalSwitchReferences = new Map(); // Store original reference names for COND_TYPE_SWITCH

// Debug logging
const logDebug = message => {
    document.getElementById('debug').textContent += message + '\n';
};

// Update field
const updateField = (path, value) => {
    const keys = path.split('.');
    let obj = editedValues;
    for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]] = obj[keys[i]] || {};
    }
    obj[keys[keys.length - 1]] = value;
    logDebug(`Updated ${path}: ${value}`);
};

// Type mapping
const typeMap = {
    'キャラクターグラフィック': 'GRAPHICAL',
    '顔グラフィック': 'FACIAL GRAPHICS',
    '文章': 'MESSAGE',
    'モンスター': 'MONSTER',
    'アイテム': 'ITEM',
    'バトル背景': 'BATTLE BACKGROUND',
    '説明文': 'DESCRIPTION',
    '数値': 'VARIABLE',
    'スイッチ': 'SWITCH',
    'マップ座標': 'MAP_POSITION',
    '方向': 'ORIENTATION',
    '変数': 'VARIABLE',
    'スイッチ条件': 'COND_TYPE_SWITCH'
};

// Command to template type mapping
const commandTypeMap = {
    'SWITCH': 'SWITCH',
    'ITEM': 'ITEM',
    'GRAPHIC': 'GRAPHICAL',
    'DIALOGUE': 'MESSAGE',
    'MONEY': 'VARIABLE',
    'BOSSBATTLE': 'MONSTER', // Maps to MONSTER for enemy; BATTLE BACKGROUND handled separately
    'MOVE': 'MAP_POSITION',
    'PLMOVE': 'MAP_POSITION',
    'VARIABLE': 'VARIABLE',
    'MESSAGE': 'MESSAGE',
    'COND_TYPE_SWITCH': 'COND_TYPE_SWITCH'
};

// Export utilities
export { originalLines, editedValues, originalSwitchReferences, logDebug, updateField, typeMap, commandTypeMap };