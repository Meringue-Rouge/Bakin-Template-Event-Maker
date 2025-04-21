import { originalLines, editedValues, logDebug, typeMap, originalSwitchReferences } from './utils.js';

export function parseTemplate(lines) {
    let title = '', description = '', settingBoxes = [], currentBox = null, currentCategory = '';
    let hasTemplate = false, eventName = '';
    let inSheet = false, sheetName = '', graphicGuid = '', motion = '';
    const graphicKeywords = new Map();
    const eventGraphicKeywords = new Map();
    const itemKeywords = new Map();
    const messageKeywords = new Map();
    const dialogueKeywords = new Map();
    const monsterKeywords = new Map();
    const battleBackgroundKeywords = new Map();
    const moveKeywords = new Map();
    const variableKeywords = new Map();
    const switchConditionKeywords = new Map();
    const characterKeywords = new Map(); // For #keyword in COL_CONTACT
    const usedGraphicKeywords = new Set();

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
        if (inSheet && line.startsWith('条件\tCOND_TYPE_SWITCH')) {
            let referenceName = '';
            let originalReferenceName = '';
            for (let j = i + 1; j < lines.length && !lines[j].trim().startsWith('条件終了'); j++) {
                const subLine = lines[j].trim();
                if (subLine.startsWith('参照名')) {
                    originalReferenceName = subLine.replace('参照名', '').trim();
                    referenceName = originalReferenceName.replace(/\|文字列\|([^|]*)\|/, '$1') || `switch_${sheetName.toLowerCase().replace(/\s+/g, '_')}_${i}`;
                    break;
                }
            }
            const keyword = referenceName;
            switchConditionKeywords.set(keyword, {
                desc: `${sheetName} switch condition`,
                string: referenceName
            });
            originalSwitchReferences.set(keyword, originalReferenceName);
            logDebug(`Found COND_TYPE_SWITCH in sheet ${sheetName} with reference name: ${referenceName}, original: ${originalReferenceName} at line ${i + 1}`);
            continue;
        }
        if (inSheet && line.startsWith('コマンド\tCOMMENT')) {
            if (i + 1 < lines.length && lines[i + 1].trim().startsWith('文字列')) {
                const comment = lines[i + 1].replace('文字列', '').trim();
                if (comment.startsWith('G#')) {
                    const keyword = comment.slice(2).split(/\s+/)[0];
                    if (keyword && graphicGuid && !usedGraphicKeywords.has(keyword)) {
                        usedGraphicKeywords.add(keyword);
                        graphicKeywords.set(keyword, {
                            sheetName,
                            guid: graphicGuid,
                            motion: motion || ''
                        });
                        logDebug(`Found G#${keyword} in sheet ${sheetName} with GUID ${graphicGuid} and motion ${motion || 'none'}`);
                    }
                } else if (comment.startsWith('C#')) {
                    const keyword = comment.slice(2).split(/\s+/)[0];
                    if (keyword && !graphicKeywords.has(keyword)) {
                        graphicKeywords.set(keyword, {
                            sheetName: sheetName || 'Event',
                            guid: graphicGuid || '',
                            motion: motion || ''
                        });
                        logDebug(`Found C#${keyword} in sheet ${sheetName || 'Event'} with GUID ${graphicGuid || 'none'} and motion ${motion || 'none'}`);
                    }
                } else if (comment.startsWith('#') || comment.startsWith('2#') || comment.startsWith('M#')) {
                    const isMonster = comment.startsWith('2#');
                    const keyword = isMonster ? comment.slice(2).split(/\s+/)[0] : (comment.startsWith('M#') ? comment.slice(2).split(/\s+/)[0] : comment.slice(1).split(/\s+/)[0]);
                    let dialogueCharacters = { leftSpeaker: null, rightSpeaker: null, eventL: null, eventR: null };
                    if (comment.includes('[') && comment.includes(']')) {
                        const bracketContent = comment.match(/\[([^\]]*)\]/)?.[1] || '';
                        const parts = bracketContent.split(',').map(c => c.trim());
                        if (parts.length >= 2) {
                            dialogueCharacters.leftSpeaker = parts[0] || null;
                            dialogueCharacters.rightSpeaker = parts[1] || null;
                            dialogueCharacters.eventL = parts[2] || null;
                            dialogueCharacters.eventR = parts[3] || null;
                        }
                    }
                    if (keyword) {
                        if (i + 2 < lines.length && lines[i + 2].trim().startsWith('コマンド\tDIALOGUE')) {
                            let dialogueText = '';
                            let leftGuid = '', rightGuid = '', leftMotion = '', rightMotion = '';
                            for (let j = i + 3; j < lines.length && !lines[j].trim().startsWith('コマンド終了'); j++) {
                                const subLine = lines[j].trim();
                                if (subLine.startsWith('文字列') && !subLine.includes('|文字列|') && !subLine.includes('|表情|')) {
                                    dialogueText = subLine.replace('文字列', '').trim();
                                } else if (subLine.startsWith('Guid') && !leftGuid) {
                                    leftGuid = subLine.replace('Guid', '').trim();
                                } else if ((subLine.includes('|表情|') || subLine.startsWith('|表情|')) && !leftMotion) {
                                    leftMotion = subLine.replace('文字列', '').replace('|表情|', '').trim();
                                } else if (subLine.startsWith('Guid') && leftGuid && !rightGuid) {
                                    rightGuid = subLine.replace('Guid', '').trim();
                                } else if ((subLine.includes('|表情|') || subLine.startsWith('|表情|')) && leftMotion && !rightMotion) {
                                    rightMotion = subLine.replace('文字列', '').replace('|表情|', '').trim();
                                }
                            }
                            dialogueKeywords.set(keyword, {
                                desc: `${keyword} dialogue`,
                                string: dialogueText,
                                leftSpeaker: dialogueCharacters.leftSpeaker,
                                rightSpeaker: dialogueCharacters.rightSpeaker,
                                eventL: dialogueCharacters.eventL,
                                eventR: dialogueCharacters.eventR
                            });
                            logDebug(`Found ${comment.startsWith('M#') ? 'M#' : '#'} ${keyword} for DIALOGUE in sheet ${sheetName} with text: ${dialogueText}`);
                        } else if (i + 2 < lines.length && lines[i + 2].trim().startsWith('コマンド\tMESSAGE')) {
                            let messageText = '';
                            for (let j = i + 3; j < lines.length && !lines[j].trim().startsWith('コマンド終了'); j++) {
                                const subLine = lines[j].trim();
                                if (subLine.startsWith('文字列')) {
                                    messageText = subLine.replace('文字列', '').trim();
                                    break;
                                }
                            }
                            messageKeywords.set(keyword, {
                                desc: `${keyword} message`,
                                string: messageText
                            });
                            logDebug(`Found #${keyword} for MESSAGE in sheet ${sheetName} with text: ${messageText}`);
                        } else if (i + 2 < lines.length && lines[i + 2].trim().startsWith('コマンド\tBOSSBATTLE')) {
                            let monsterGuid = '', backgroundGuid = '';
                            for (let j = i + 3; j < lines.length && !lines[j].trim().startsWith('コマンド終了'); j++) {
                                const subLine = lines[j].trim();
                                if (subLine.startsWith('Guid') && !monsterGuid) {
                                    monsterGuid = subLine.replace('Guid', '').trim();
                                } else if (subLine.startsWith('Guid') && monsterGuid && !backgroundGuid) {
                                    backgroundGuid = subLine.replace('Guid', '').trim();
                                }
                            }
                            monsterKeywords.set(`${keyword}-monster`, {
                                desc: `Monster to Fight`,
                                guid: monsterGuid
                            });
                            battleBackgroundKeywords.set(`${keyword}-battlemap`, {
                                desc: `Battle Background`,
                                guid: backgroundGuid
                            });
                            logDebug(`Found #${keyword} for BOSSBATTLE in sheet ${sheetName} with monster GUID ${monsterGuid} and background GUID ${backgroundGuid}`);
                        } else if (i + 2 < lines.length && lines[i + 2].trim().startsWith('コマンド\tGRAPHIC')) {
                            let guid = '', animation = '';
                            for (let j = i + 3; j < lines.length && !lines[j].trim().startsWith('コマンド終了'); j++) {
                                const subLine = lines[j].trim();
                                if (subLine.startsWith('Guid')) {
                                    guid = subLine.replace('Guid', '').trim();
                                } else if (subLine.startsWith('文字列')) {
                                    animation = subLine.replace('文字列', '').trim();
                                }
                            }
                            eventGraphicKeywords.set(keyword, {
                                guid,
                                motion: animation,
                                desc: `${keyword} graphic`
                            });
                            logDebug(`Found #${keyword} for GRAPHIC in sheet ${sheetName} with GUID ${guid} and animation ${animation || 'none'}`);
                        } else if (i + 2 < lines.length && lines[i + 2].trim().startsWith('コマンド\tVARIABLE')) {
                            let defaultInt = '0';
                            let integerCount = 0;
                            for (let j = i + 3; j < lines.length && !lines[j].trim().startsWith('コマンド終了'); j++) {
                                const subLine = lines[j].trim();
                                if (subLine.startsWith('整数')) {
                                    integerCount++;
                                    const value = subLine.replace('整数', '').trim();
                                    if (integerCount === 3) {
                                        defaultInt = value;
                                        variableKeywords.set(keyword, {
                                            desc: `${keyword} variable`,
                                            int: defaultInt
                                        });
                                        logDebug(`Found #${keyword} for VARIABLE in sheet ${sheetName} with default int: ${defaultInt}`);
                                        break;
                                    }
                                }
                            }
                        } else if (i + 2 < lines.length && lines[i + 2].trim().startsWith('コマンド\tCOL_CONTACT')) {
                            let guid = '';
                            for (let j = i + 3; j < lines.length && !lines[j].trim().startsWith('コマンド終了'); j++) {
                                const subLine = lines[j].trim();
                                if (subLine.startsWith('Guid')) {
                                    guid = subLine.replace('Guid', '').trim();
                                    break;
                                }
                            }
                            if (isMonster) {
                                monsterKeywords.set(keyword, {
                                    desc: `${keyword} monster`,
                                    guid: guid
                                });
                                logDebug(`Found 2#${keyword} for COL_CONTACT in sheet ${sheetName} with monster GUID ${guid}`);
                            } else {
                                characterKeywords.set(keyword, {
                                    desc: `${keyword} character`,
                                    guid: guid
                                });
                                logDebug(`Found #${keyword} for COL_CONTACT in sheet ${sheetName} with character GUID ${guid}`);
                            }
                        } else if (i + 3 < lines.length && lines[i + 2].trim().startsWith('コマンド\tIFITEM')) {
                            itemKeywords.set(keyword, {
                                guid: '',
                                desc: `${keyword} item`
                            });
                            logDebug(`Found #${keyword} for IFITEM in sheet ${sheetName}`);
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
                type: typeMap[currentCategory] || 'UNKNOWN',
                options: {},
                enableExport: currentCategory === 'スイッチ条件' ? false : true
            };
            continue;
        }
        if (currentBox) {
            if (line.startsWith('設定ID')) currentBox.id = line.replace('設定ID', '').trim();
            else if (line.startsWith('説明')) currentBox.desc = line.replace('説明', '').trim();
            else if (line.startsWith('デフォルトGuid')) currentBox.defaultGuid = line.replace('デフォルトGuid', '').trim();
            else if (line.startsWith('デフォルト文字列')) currentBox.defaultString = line.replace('デフォルト文字列', '').trim();
            else if (line.startsWith('デフォルト整数')) currentBox.defaultInteger = line.replace('デフォルト整数', '').trim();
            else if (line.startsWith('オプション')) {
                const option = line.replace('オプション', '').trim();
                const [key, value] = option.split(/\s+/).map(s => s.trim());
                if (key === '最大' || key === '最小') {
                    currentBox.options[key] = value;
                } else {
                    currentBox.option = option;
                }
            }
        }
        if (line.startsWith('設定ボックス終了') && currentBox) {
            if (currentBox.category === '説明文') description = currentBox.defaultString || '';
            else if (currentBox.id) settingBoxes.push(currentBox);
            // Update editedValues.settings with the parsed box
            if (currentBox.id && currentBox.type !== 'UNKNOWN') {
                editedValues.settings[currentBox.id] = {
                    id: currentBox.id,
                    desc: currentBox.desc,
                    guid: currentBox.defaultGuid,
                    string: currentBox.defaultString,
                    int: currentBox.defaultInteger,
                    type: currentBox.type,
                    options: currentBox.options,
                    enableExport: currentBox.enableExport,
                    originalReferenceName: originalSwitchReferences.get(currentBox.id)
                };
            }
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

    graphicKeywords.forEach(({ sheetName, guid, motion }, keyword) => {
        const box = {
            id: keyword,
            desc: `${sheetName} graphic`,
            defaultGuid: guid,
            defaultString: motion,
            defaultInteger: '',
            category: '顔グラフィック',
            type: 'FACIAL GRAPHICS',
            options: {},
            enableExport: true
        };
        settingBoxes.push(box);
        editedValues.settings[keyword] = {
            id: keyword,
            desc: box.desc,
            guid: guid,
            string: motion,
            int: '',
            type: 'FACIAL GRAPHICS'
        };
        logDebug(`Added graphic template for keyword ${keyword} from sheet ${sheetName}`);
    });

    eventGraphicKeywords.forEach(({ guid, motion, desc }, keyword) => {
        const box = {
            id: keyword,
            desc: desc,
            defaultGuid: guid,
            defaultString: motion,
            defaultInteger: '',
            category: 'キャラクターグラフィック',
            type: 'GRAPHICAL',
            options: {},
            enableExport: true
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
        logDebug(`Added event graphic template for keyword ${keyword} with GUID ${guid} and motion ${motion || 'none'}`);
    });

    itemKeywords.forEach(({ guid, desc }, keyword) => {
        const box = {
            id: keyword,
            desc: desc,
            defaultGuid: guid,
            defaultString: '',
            defaultInteger: '',
            category: 'アイテム',
            type: 'ITEM',
            options: {},
            enableExport: true
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
            type: 'MESSAGE',
            options: {},
            enableExport: true
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

    dialogueKeywords.forEach(({ desc, string, leftSpeaker, rightSpeaker, eventL, eventR }, keyword) => {
        const box = {
            id: keyword,
            desc: desc,
            defaultGuid: '',
            defaultString: string,
            defaultInteger: '',
            category: '文章',
            type: 'MESSAGE',
            options: {},
            enableExport: true
        };
        settingBoxes.push(box);
        editedValues.settings[keyword] = {
            id: keyword,
            desc: box.desc,
            guid: '',
            string: string,
            int: '',
            type: 'MESSAGE',
            leftSpeaker,
            rightSpeaker,
            eventL,
            eventR
        };
        logDebug(`Added dialogue template for keyword ${keyword} with text: ${string}`);
    });

    monsterKeywords.forEach(({ desc, guid }, keyword) => {
        const box = {
            id: keyword,
            desc: desc,
            defaultGuid: guid,
            defaultString: '',
            defaultInteger: '',
            category: 'モンスター',
            type: 'MONSTER',
            options: {},
            enableExport: true
        };
        settingBoxes.push(box);
        editedValues.settings[keyword] = {
            id: keyword,
            desc: box.desc,
            guid: guid,
            string: '',
            int: '',
            type: 'MONSTER'
        };
        logDebug(`Added monster template for keyword ${keyword} with GUID ${guid}`);
    });

    battleBackgroundKeywords.forEach(({ desc, guid }, keyword) => {
        const box = {
            id: keyword,
            desc: desc,
            defaultGuid: guid,
            defaultString: '',
            defaultInteger: '',
            category: 'バトル背景',
            type: 'BATTLE BACKGROUND',
            options: {},
            enableExport: true
        };
        settingBoxes.push(box);
        editedValues.settings[keyword] = {
            id: keyword,
            desc: box.desc,
            guid: guid,
            string: '',
            int: '',
            type: 'BATTLE BACKGROUND'
        };
        logDebug(`Added battle background template for keyword ${keyword} with GUID ${guid}`);
    });

    moveKeywords.forEach(({ desc, spot, orientation }, keyword) => {
        const mapPosBox = {
            id: `${keyword}-mappos`,
            desc: `${keyword} move destination`,
            defaultGuid: '',
            defaultString: spot,
            defaultInteger: '',
            category: 'マップ座標',
            type: 'MAP_POSITION',
            options: {},
            enableExport: true
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
            option: '変更しないを追加',
            options: {},
            enableExport: true
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

    variableKeywords.forEach(({ desc, int }, keyword) => {
        const box = {
            id: keyword,
            desc: desc,
            defaultGuid: '',
            defaultString: '',
            defaultInteger: int,
            category: '数値',
            type: 'VARIABLE',
            options: {
                最大: '999999',
                最小: '0'
            },
            enableExport: true
        };
        settingBoxes.push(box);
        editedValues.settings[keyword] = {
            id: keyword,
            desc: box.desc,
            guid: '',
            string: '',
            int: int,
            type: 'VARIABLE'
        };
        logDebug(`Added variable template for keyword ${keyword} with default int: ${int}`);
    });

    switchConditionKeywords.forEach(({ desc, string }, keyword) => {
        const box = {
            id: keyword,
            desc: desc,
            defaultGuid: '',
            defaultString: string,
            defaultInteger: '',
            category: 'スイッチ条件',
            type: 'COND_TYPE_SWITCH',
            options: {},
            enableExport: false
        };
        settingBoxes.push(box);
        editedValues.settings[keyword] = {
            id: keyword,
            desc: box.desc,
            guid: '',
            string: string,
            int: '',
            type: 'COND_TYPE_SWITCH',
            originalReferenceName: originalSwitchReferences.get(keyword),
            enableExport: false
        };
        logDebug(`Added switch condition template for keyword ${keyword} with reference name: ${string}`);
    });

    characterKeywords.forEach(({ desc, guid }, keyword) => {
        const box = {
            id: keyword,
            desc: desc,
            defaultGuid: guid,
            defaultString: '',
            defaultInteger: '',
            category: 'キャラクター',
            type: 'CHARACTER',
            options: {},
            enableExport: true
        };
        settingBoxes.push(box);
        editedValues.settings[keyword] = {
            id: keyword,
            desc: box.desc,
            guid: guid,
            string: '',
            int: '',
            type: 'CHARACTER'
        };
        logDebug(`Added character template for keyword ${keyword} with GUID ${guid}`);
    });

    editedValues.title = title || eventName || '';
    editedValues.description = description;

    return { title, description, settingBoxes, hasTemplate, eventName };
}