import { originalLines, editedValues, logDebug, typeMap } from './utils.js';

export function parseTemplate(lines) {
    let title = '', description = '', settingBoxes = [], currentBox = null, currentCategory = '';
    let hasTemplate = false, eventName = '';
    let inSheet = false, sheetName = '', graphicGuid = '', motion = '';
    const graphicKeywords = new Map();
    const itemKeywords = new Map();
    const messageKeywords = new Map();
    const moveKeywords = new Map();
    const usedGraphicKeywords = new Set(); // Track used G# keywords

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('テンプレート定義') && !line.startsWith('テンプレート定義終了')) {
            title = line.replace('テンプレート定義', '').trim();
            hasTemplate = true;
            continue;
        }
        if (line.startsWith('イベント名')) {
            eventName = line.replace('イベント名', '').trim();
            continue;
        }
        if (line.startsWith('シート')) {
            inSheet = true;
            sheetName = line.replace('シート', '').trim();
            graphicGuid = '';
            motion = '';
            continue;
        }
        if (line.startsWith('シート終了')) {
            inSheet = false;
            sheetName = '';
            continue;
        }
        if (inSheet && line.startsWith('グラフィック')) {
            graphicGuid = line.replace('グラフィック', '').trim();
            continue;
        }
        if (inSheet && line.startsWith('モーション')) {
            motion = line.replace('モーション', '').trim();
            continue;
        }
        if (inSheet && line.startsWith('コマンド\tCOMMENT')) {
            if (i + 1 < lines.length && lines[i + 1].trim().startsWith('文字列')) {
                const comment = lines[i + 1].replace('文字列', '').trim();
                if (comment.startsWith('G#')) {
                    const keyword = comment.slice(2).split(/\s+/)[0];
                    if (keyword && graphicGuid && !usedGraphicKeywords.has(keyword)) {
                        usedGraphicKeywords.add(keyword); // Mark keyword as used
                        graphicKeywords.set(keyword, {
                            sheetName,
                            guid: graphicGuid,
                            motion: motion || '' // Use empty string if motion is missing
                        });
                        logDebug(`Found G#${keyword} in sheet ${sheetName} with GUID ${graphicGuid} and motion ${motion || 'none'}`);
                    }
                } else if (comment.startsWith('#')) {
                    const keyword = comment.slice(1).split(/\s+/)[0];
                    if (keyword) {
                        if (i + 3 < lines.length && lines[i + 2].trim().startsWith('コマンド\tIFITEM')) {
                            itemKeywords.set(keyword, {
                                guid: '',
                                desc: `${keyword} item`
                            });
                            logDebug(`Found #${keyword} for IFITEM in sheet ${sheetName}`);
                        } else if (i + 3 < lines.length && lines[i + 2].trim().startsWith('コマンド\tMESSAGE')) {
                            const messageLine = lines[i + 3].trim();
                            const messageText = messageLine.startsWith('文字列') 
                                ? messageLine.replace('文字列', '').trim() 
                                : '';
                            messageKeywords.set(keyword, {
                                desc: `${keyword} message`,
                                string: messageText
                            });
                            logDebug(`Found #${keyword} for MESSAGE in sheet ${sheetName} with text: ${messageText}`);
                        } else if (i + 3 < lines.length && (lines[i + 2].trim().startsWith('コマンド\tPLMOVE') || lines[i + 2].trim().startsWith('コマンド\tMOVE'))) {
                            const commandType = lines[i + 2].trim().startsWith('コマンド\tPLMOVE') ? 'PLMOVE' : 'MOVE';
                            let spot = '', orientation = '0';
                            for (let j = i + 3; j < lines.length && !lines[j].trim().startsWith('コマンド終了'); j++) {
                                const subLine = lines[j].trim();
                                if (subLine.startsWith('スポット')) {
                                    spot = subLine.replace('スポット', '').trim();
                                } else if (subLine.startsWith('整数') && !subLine.includes('Guid')) {
                                    orientation = subLine.replace('整数', '').trim();
                                }
                            }
                            moveKeywords.set(keyword, {
                                desc: `${keyword} move`,
                                spot,
                                orientation
                            });
                            logDebug(`Found #${keyword} for ${commandType} in sheet ${sheetName} with spot: ${spot}, orientation: ${orientation}`);
                        }
                    }
                }
            }
            continue;
        }
        // ... (rest of the existing code for setting boxes remains unchanged)
        if (line.startsWith('設定ボックス')) {
            if (currentBox && (currentBox.id || currentBox.category === '説明文')) {
                if (currentBox.category === '説明文') description = currentBox.defaultString || '';
                else settingBoxes.push(currentBox);
            }
            currentCategory = line.replace('設定ボックス', '').trim();
            currentBox = {
                id: '',
                desc: '',
                defaultGuid: '',
                defaultString: '',
                defaultInteger: '',
                category: currentCategory,
                type: typeMap[currentCategory] || 'UNKNOWN'
            };
            continue;
        }
        if (currentBox) {
            if (line.startsWith('設定ID')) currentBox.id = line.replace('設定ID', '').trim();
            else if (line.startsWith('説明')) currentBox.desc = line.replace('説明', '').trim();
            else if (line.startsWith('デフォルトGuid')) currentBox.defaultGuid = line.replace('デフォルトGuid', '').trim();
            else if (line.startsWith('デフォルト文字列')) currentBox.defaultString = line.replace('デフォルト文字列', '').trim();
            else if (line.startsWith('デフォルト整数')) currentBox.defaultInteger = line.replace('デフォルト整数', '').trim();
            else if (line.startsWith('オプション')) currentBox.option = line.replace('オプション', '').trim();
        }
        if (line.startsWith('設定ボックス終了') && currentBox) {
            if (currentBox.category === '説明文') description = currentBox.defaultString || '';
            else if (currentBox.id) settingBoxes.push(currentBox);
            currentBox = null;
            currentCategory = '';
            continue;
        }
        if (line.startsWith('テンプレート定義終了')) {
            if (currentBox) {
                if (currentBox.category === '説明文') description = currentBox.defaultString || '';
                else if (currentBox.id) settingBoxes.push(currentBox);
            }
            break;
        }
    }

    // Add graphic template boxes for G# keywords
    graphicKeywords.forEach(({ sheetName, guid, motion }, keyword) => {
        const box = {
            id: keyword,
            desc: `${sheetName} graphic`,
            defaultGuid: guid,
            defaultString: motion, // Motion can be empty
            defaultInteger: '',
            category: 'キャラクターグラフィック',
            type: 'GRAPHICAL'
        };
        settingBoxes.push(box);
        editedValues.settings[keyword] = {
            id: keyword,
            desc: box.desc,
            guid: guid,
            string: motion,
            int: '',
            type: 'GRAPHICAL'
        };
        logDebug(`Added graphic template for keyword ${keyword} from sheet ${sheetName}`);
    });

    // ... (rest of the existing code for item, message, move templates remains unchanged)
    itemKeywords.forEach(({ guid, desc }, keyword) => {
        const box = {
            id: keyword,
            desc: desc,
            defaultGuid: guid,
            defaultString: '',
            defaultInteger: '',
            category: 'アイテム',
            type: 'ITEM'
        };
        settingBoxes.push(box);
        editedValues.settings[keyword] = {
            id: keyword,
            desc: box.desc,
            guid: guid,
            string: '',
            int: '',
            type: 'ITEM'
        };
        logDebug(`Added item template for keyword ${keyword}`);
    });

    messageKeywords.forEach(({ desc, string }, keyword) => {
        const box = {
            id: keyword,
            desc: desc,
            defaultGuid: '',
            defaultString: string,
            defaultInteger: '',
            category: '文章',
            type: 'MESSAGE'
        };
        settingBoxes.push(box);
        editedValues.settings[keyword] = {
            id: keyword,
            desc: box.desc,
            guid: '',
            string: string,
            int: '',
            type: 'MESSAGE'
        };
        logDebug(`Added message template for keyword ${keyword} with text: ${string}`);
    });

    moveKeywords.forEach(({ desc, spot, orientation }, keyword) => {
        const mapPosBox = {
            id: `${keyword}-mappos`,
            desc: `${keyword} move destination`,
            defaultGuid: '',
            defaultString: spot,
            defaultInteger: '',
            category: 'マップ座標',
            type: 'MAP_POSITION'
        };
        settingBoxes.push(mapPosBox);
        editedValues.settings[`${keyword}-mappos`] = {
            id: `${keyword}-mappos`,
            desc: mapPosBox.desc,
            guid: '',
            string: spot,
            int: '',
            type: 'MAP_POSITION'
        };
        logDebug(`Added map position template for keyword ${keyword}-mappos with spot: ${spot}`);

        const orientationBox = {
            id: `${keyword}-orientation`,
            desc: `${keyword} move orientation`,
            defaultGuid: '',
            defaultString: '',
            defaultInteger: orientation,
            category: '方向',
            type: 'ORIENTATION',
            option: '変更しないを追加'
        };
        settingBoxes.push(orientationBox);
        editedValues.settings[`${keyword}-orientation`] = {
            id: `${keyword}-orientation`,
            desc: orientationBox.desc,
            guid: '',
            string: '',
            int: orientation,
            type: 'ORIENTATION',
            option: '変更しないを追加'
        };
        logDebug(`Added orientation template for keyword ${keyword}-orientation with value: ${orientation}`);
    });

    editedValues.title = title || eventName || '';
    editedValues.description = description;

    return { title, description, settingBoxes, hasTemplate, eventName };
}