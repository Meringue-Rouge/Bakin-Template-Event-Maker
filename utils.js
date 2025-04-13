// Global storage
let originalLines = [];
let editedValues = { title: '', description: '', settings: {} };

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
    obj[keys[keys.length - 1]] = value.trim();
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
    '数値': 'INTEGER',
    'スイッチ': 'SWITCH',
    'マップ座標': 'MAP_POSITION',
    '方向': 'ORIENTATION'
};

// Command to template type mapping
const commandTypeMap = {
    'SWITCH': 'SWITCH',
    'ITEM': 'ITEM',
    'GRAPHIC': 'GRAPHICAL',
    'DIALOGUE': 'MESSAGE',
    'MONEY': 'INTEGER',
    'BOSSBATTLE': 'MONSTER',
    'MOVE': 'MAP_POSITION', // Maps to MAP_POSITION for template generation
    'PLMOVE': 'MAP_POSITION' // Maps to MAP_POSITION for template generation
};

// Export utilities
export { originalLines, editedValues, logDebug, updateField, typeMap, commandTypeMap };