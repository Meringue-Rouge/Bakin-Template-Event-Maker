import { originalLines, editedValues, logDebug, commandTypeMap, originalSwitchReferences } from './utils.js';

export function generateTemplate(lines, eventName) {
    if (!eventName) {
        editedValues.title = '';
        return { generatedTemplate: { title: '', description: '', settingBoxes: [] }, modifiedLines: [] };
    }

    const settingBoxes = [];
    let modifiedLines = [...lines];
    let inScript = false, inSheet = false, lastComment = null, currentSheetStart = -1;
    let sheetName = '', graphicGuid = '', motion = '';
    const graphicKeywords = new Map();
    const eventGraphicKeywords = new Map();
    const itemKeywords = new Map();
    const switchKeywords = new Map();
    const messageKeywords = new Map();
    const monsterKeywords = new Map();
    const battleBackgroundKeywords = new Map();
    const moveKeywords = new Map();
    const variableKeywords = new Map();
    const dialogueKeywords = new Map();
    const switchConditionKeywords = new Map();
    const stringVariableKeywords = new Map();
    const usedGraphicKeywords = new Set();
    const sheetGraphicUpdates = new Map();

    for (let i = 0; i < modifiedLines.length; i++) {
        let line = modifiedLines[i].trim();
        if (line.startsWith('シート')) {
            inSheet = true;
            sheetName = line.replace('シート', '').trim();
            currentSheetStart = i;
            graphicGuid = '';
            motion = '';
            continue;
        }
        if (line.startsWith('シート終了')) {
            inSheet = false;
            sheetName = '';
            currentSheetStart = -1;
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
            for (let j = i + 1; j < modifiedLines.length && !modifiedLines[j].trim().startsWith('条件終了'); j++) {
                const subLine = modifiedLines[j].trim();
                if (subLine.startsWith('参照名')) {
                    originalReferenceName = subLine.replace('参照名', '').trim();
                    referenceName = originalReferenceName.replace(/\|文字列\|([^|]*)\|/, '$1') || `switch_${sheetName.toLowerCase().replace(/\s+/g, '_')}_${i}`;
                    const prefix = modifiedLines[j].match(/^\t*/)[0];
                    const keyword = referenceName;
                    modifiedLines[j] = `${prefix}参照名\t|文字列|${keyword}|`;
                    logDebug(`Updated COND_TYPE_SWITCH 参照名 to |文字列|${keyword}| at line ${j + 1}`);
                    if (!switchConditionKeywords.has(keyword)) {
                        switchConditionKeywords.set(keyword, {
                            desc: `${sheetName} switch condition`,
                            string: referenceName
                        });
                        originalSwitchReferences.set(keyword, originalReferenceName);
                        const box = {
                            id: keyword,
                            desc: `${sheetName} switch condition`,
                            defaultGuid: '',
                            defaultString: referenceName,
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
                            string: referenceName,
                            int: '',
                            type: 'COND_TYPE_SWITCH',
                            originalReferenceName,
                            enableExport: false
                        };
                        logDebug(`Added switch condition template for keyword ${keyword} with reference name: ${referenceName}, original: ${originalReferenceName}`);
                    }
                    break;
                }
            }
            continue;
        }
        if (line.startsWith('スクリプト')) {
            inScript = true;
            continue;
        }
        if (line.startsWith('スクリプト終了')) {
            inScript = false;
            lastComment = null;
            continue;
        }
        if (inScript && line.startsWith('コマンド\tCOMMENT')) {
            if (i + 1 < modifiedLines.length && modifiedLines[i + 1].trim().startsWith('文字列')) {
                const comment = modifiedLines[i + 1].replace('文字列', '').trim();
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
                        const box = {
                            id: keyword,
                            desc: `${sheetName} graphic`,
                            defaultGuid: graphicGuid,
                            defaultString: motion || '',
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
                            guid: graphicGuid,
                            string: motion || '',
                            int: '',
                            type: 'GRAPHICAL'
                        };
                        logDebug(`Added graphic template for keyword ${keyword} from sheet ${sheetName}`);
                    }
                    if (keyword && graphicGuid) {
                        sheetGraphicUpdates.set(sheetName, { keyword, lineIndex: currentSheetStart + 1 });
                        logDebug(`Scheduled グラフィック update for sheet ${sheetName} to |Guid|${keyword}|`);
                    }
                } else if (comment.startsWith('C#')) {
                    const keyword = comment.slice(2).split(/\s+/)[0];
                    if (keyword && !graphicKeywords.has(keyword)) {
                        graphicKeywords.set(keyword, {
                            sheetName: sheetName || 'Event',
                            guid: graphicGuid || '',
                            motion: motion || ''
                        });
                        const box = {
                            id: keyword,
                            desc: `${sheetName || 'Event'} graphic`,
                            defaultGuid: graphicGuid || '',
                            defaultString: motion || '',
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
                            guid: graphicGuid || '',
                            string: motion || '',
                            int: '',
                            type: 'FACIAL GRAPHICS'
                        };
                        logDebug(`Added character graphic template for C#${keyword} with GUID ${graphicGuid || 'none'} and motion ${motion || 'none'}`);
                    }
                } else if (comment.startsWith('#') || comment.startsWith('M#')) {
                    const keyword = comment.startsWith('M#') ? comment.slice(2).split(/\s+/)[0] : comment.slice(1).split(/\s+/)[0];
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
                        logDebug(`Found ${comment.startsWith('M#') ? 'M#' : '#'} ${keyword} at line ${i + 1}`);
                        lastComment = {
                            id: keyword,
                            isGraphic: comment.startsWith('G#'),
                            isEventGraphic: false,
                            isItem: false,
                            isSwitch: false,
                            isMessage: false,
                            isBossBattle: false,
                            isMove: false,
                            isVariable: false,
                            isDialogue: false,
                            isStringVariable: false,
                            dialogueCharacters,
                            lineIndex: i
                        };
                    }
                }
            }
            continue;
        }
        if (inScript && lastComment) {
            if (line.startsWith('コマンド\tDIALOGUE')) {
                logDebug(`Detected DIALOGUE after ${lastComment.id} at line ${i + 1}`);
                lastComment.isDialogue = true;
                if (!dialogueKeywords.has(lastComment.id)) {
                    let dialogueText = '';
                    let leftGuid = '', rightGuid = '', leftMotion = '', rightMotion = '', speaker = '0';
                    for (let j = i + 1; j < modifiedLines.length && !modifiedLines[j].trim().startsWith('コマンド終了'); j++) {
                        const subLine = modifiedLines[j].trim();
                        if (subLine.startsWith('文字列') && !subLine.includes('|文字列|') && !subLine.includes('|表情|')) {
                            dialogueText = subLine.replace('文字列', '').trim();
                            const prefix = modifiedLines[j].match(/^\t*/)[0];
                            modifiedLines[j] = `${prefix}文字列\t|文字列|${lastComment.id}|`;
                            logDebug(`Updated DIALOGUE 文字列 to |文字列|${lastComment.id}| at line ${j + 1}`);
                        } else if (subLine.startsWith('Guid') && !leftGuid) {
                            leftGuid = subLine.replace('Guid', '').trim();
                        } else if ((subLine.startsWith('文字列') || subLine.startsWith('|表情|')) && !leftMotion) {
                            leftMotion = subLine.replace('文字列', '').replace('|表情|', '').trim();
                        } else if (subLine.startsWith('Guid') && leftGuid && !rightGuid) {
                            rightGuid = subLine.replace('Guid', '').trim();
                        } else if ((subLine.startsWith('文字列') || subLine.startsWith('|表情|')) && leftMotion && !rightMotion) {
                            rightMotion = subLine.replace('文字列', '').replace('|表情|', '').trim();
                        } else if (subLine.startsWith('整数') && !subLine.includes('Guid')) {
                            speaker = subLine.replace('整数', '').trim();
                        }
                    }
                    let updateIndex = i + 1;
                    const prefix = modifiedLines[i + 1].match(/^\t*/)[0];
                    const leftSpeakerId = lastComment.dialogueCharacters.leftSpeaker || 'player';
                    const rightSpeakerId = lastComment.dialogueCharacters.rightSpeaker || 'guest';
                    const dialogueLines = [
                        `${prefix}文字列\t|文字列|${lastComment.id}|`,
                        `${prefix}整数\t2`,
                        `${prefix}整数\t0`,
                        `${prefix}Guid\t|Guid|${leftSpeakerId}|`,
                        lastComment.dialogueCharacters.eventL ? `${prefix}文字列\t${leftMotion || 'wait'}` : `${prefix}|表情|${leftSpeakerId}|`,
                        `${prefix}Guid\t|Guid|${rightSpeakerId}|`,
                        lastComment.dialogueCharacters.eventR ? `${prefix}文字列\t${rightMotion || 'wait'}` : `${prefix}|表情|${rightSpeakerId}|`,
                        `${prefix}整数\t${speaker}`
                    ];
                    for (let j = 0; j < dialogueLines.length && updateIndex < modifiedLines.length; j++, updateIndex++) {
                        if (!modifiedLines[updateIndex].trim().startsWith('コマンド終了')) {
                            modifiedLines[updateIndex] = dialogueLines[j];
                        }
                    }
                    dialogueKeywords.set(lastComment.id, {
                        desc: `${lastComment.id} dialogue`,
                        string: dialogueText,
                        leftSpeaker: lastComment.dialogueCharacters.leftSpeaker,
                        rightSpeaker: lastComment.dialogueCharacters.rightSpeaker,
                        eventL: lastComment.dialogueCharacters.eventL,
                        eventR: lastComment.dialogueCharacters.eventR
                    });
                    const box = {
                        id: lastComment.id,
                        desc: `${lastComment.id} dialogue`,
                        defaultGuid: '',
                        defaultString: dialogueText,
                        defaultInteger: '',
                        category: '文章',
                        type: 'MESSAGE',
                        options: {},
                        enableExport: true
                    };
                    settingBoxes.push(box);
                    editedValues.settings[lastComment.id] = {
                        id: lastComment.id,
                        desc: box.desc,
                        guid: '',
                        string: dialogueText,
                        int: '',
                        type: 'MESSAGE'
                    };
                    logDebug(`Added dialogue template for keyword ${lastComment.id} with text: ${dialogueText}`);
                }
                lastComment = null;
                continue;
            }
            if (line.startsWith('コマンド\tMESSAGE')) {
                logDebug(`Detected MESSAGE after #${lastComment.id} at line ${i + 1}`);
                lastComment.isMessage = true;
                if (!messageKeywords.has(lastComment.id)) {
                    let messageText = '';
                    for (let j = i + 1; j < modifiedLines.length && !modifiedLines[j].trim().startsWith('コマンド終了'); j++) {
                        if (modifiedLines[j].trim().startsWith('文字列')) {
                            messageText = modifiedLines[j].replace('文字列', '').trim();
                            const prefix = modifiedLines[j].match(/^\t*/)[0];
                            modifiedLines[j] = `${prefix}文字列\t|文字列|${lastComment.id}|`;
                            logDebug(`Updated MESSAGE 文字列 to |文字列|${lastComment.id}| at line ${j + 1}`);
                            break;
                        }
                    }
                    messageKeywords.set(lastComment.id, {
                        desc: `${lastComment.id} message`,
                        string: messageText
                    });
                    const box = {
                        id: lastComment.id,
                        desc: `${lastComment.id} message`,
                        defaultGuid: '',
                        defaultString: messageText,
                        defaultInteger: '',
                        category: '文章',
                        type: 'MESSAGE',
                        options: {},
                        enableExport: true
                    };
                    settingBoxes.push(box);
                    editedValues.settings[lastComment.id] = {
                        id: lastComment.id,
                        desc: box.desc,
                        guid: '',
                        string: messageText,
                        int: '',
                        type: 'MESSAGE'
                    };
                    logDebug(`Added message template for keyword ${lastComment.id} with text: ${messageText}`);
                }
                lastComment = null;
                continue;
            }
            if (line.startsWith('コマンド\tSTRING_VARIABLE')) {
                logDebug(`Detected STRING_VARIABLE after #${lastComment.id} at line ${i + 1}`);
                lastComment.isStringVariable = true;
                if (!stringVariableKeywords.has(lastComment.id)) {
                    let stringText = '';
                    for (let j = i + 1; j < modifiedLines.length && !modifiedLines[j].trim().startsWith('コマンド終了'); j++) {
                        if (modifiedLines[j].trim().startsWith('文字列')) {
                            stringText = modifiedLines[j].replace('文字列', '').trim();
                            const prefix = modifiedLines[j].match(/^\t*/)[0];
                            modifiedLines[j] = `${prefix}文字列\t|文字列|${lastComment.id}|`;
                            logDebug(`Updated STRING_VARIABLE 文字列 to |文字列|${lastComment.id}| at line ${j + 1}`);
                            break;
                        }
                    }
                    stringVariableKeywords.set(lastComment.id, {
                        desc: `${lastComment.id} string variable`,
                        string: stringText
                    });
                    const box = {
                        id: lastComment.id,
                        desc: `${lastComment.id} string variable`,
                        defaultGuid: '',
                        defaultString: stringText,
                        defaultInteger: '',
                        category: '文章',
                        type: 'STRING_VARIABLE',
                        options: {},
                        enableExport: true
                    };
                    settingBoxes.push(box);
                    editedValues.settings[lastComment.id] = {
                        id: lastComment.id,
                        desc: box.desc,
                        guid: '',
                        string: stringText,
                        int: '',
                        type: 'STRING_VARIABLE'
                    };
                    logDebug(`Added string variable template for keyword ${lastComment.id} with text: ${stringText}`);
                }
                lastComment = null;
                continue;
            }
            if (line.startsWith('コマンド\tBOSSBATTLE')) {
                logDebug(`Detected BOSSBATTLE after #${lastComment.id} at line ${i + 1}`);
                lastComment.isBossBattle = true;
                if (!monsterKeywords.has(`${lastComment.id}-monster`)) {
                    let monsterGuid = '', backgroundGuid = '';
                    let guidCount = 0;
                    for (let j = i + 1; j < modifiedLines.length && !modifiedLines[j].trim().startsWith('コマンド終了'); j++) {
                        const subLine = modifiedLines[j].trim();
                        if (subLine.startsWith('Guid')) {
                            guidCount++;
                            if (guidCount === 1) {
                                monsterGuid = subLine.replace('Guid', '').trim();
                                const prefix = modifiedLines[j].match(/^\t*/)[0];
                                modifiedLines[j] = `${prefix}Guid\t|Guid|${lastComment.id}-monster|`;
                                logDebug(`Updated BOSSBATTLE monster Guid to |Guid|${lastComment.id}-monster| at line ${j + 1}`);
                            } else if (guidCount === 3) {
                                backgroundGuid = subLine.replace('Guid', '').trim();
                                const prefix = modifiedLines[j].match(/^\t*/)[0];
                                modifiedLines[j] = `${prefix}Guid\t|Guid|${lastComment.id}-battlemap|`;
                                logDebug(`Updated BOSSBATTLE background Guid to |Guid|${lastComment.id}-battlemap| at line ${j + 1}`);
                            }
                        }
                    }
                    monsterKeywords.set(`${lastComment.id}-monster`, {
                        desc: `Monster to Fight`,
                        guid: monsterGuid
                    });
                    battleBackgroundKeywords.set(`${lastComment.id}-battlemap`, {
                        desc: `Battle Background`,
                        guid: backgroundGuid
                    });
                    const monsterBox = {
                        id: `${lastComment.id}-monster`,
                        desc: `Monster to Fight`,
                        defaultGuid: monsterGuid,
                        defaultString: '',
                        defaultInteger: '',
                        category: 'モンスター',
                        type: 'MONSTER',
                        options: {},
                        enableExport: true
                    };
                    const backgroundBox = {
                        id: `${lastComment.id}-battlemap`,
                        desc: `Battle Background`,
                        defaultGuid: backgroundGuid,
                        defaultString: '',
                        defaultInteger: '',
                        category: 'バトル背景',
                        type: 'BATTLE BACKGROUND',
                        options: {},
                        enableExport: true
                    };
                    settingBoxes.push(monsterBox, backgroundBox);
                    editedValues.settings[`${lastComment.id}-monster`] = {
                        id: `${lastComment.id}-monster`,
                        desc: monsterBox.desc,
                        guid: monsterGuid,
                        string: '',
                        int: '',
                        type: 'MONSTER'
                    };
                    editedValues.settings[`${lastComment.id}-battlemap`] = {
                        id: `${lastComment.id}-battlemap`,
                        desc: backgroundBox.desc,
                        guid: backgroundGuid,
                        string: '',
                        int: '',
                        type: 'BATTLE BACKGROUND'
                    };
                    logDebug(`Added monster template for keyword ${lastComment.id}-monster with GUID ${monsterGuid}`);
                    logDebug(`Added battle background template for keyword ${lastComment.id}-battlemap with GUID ${backgroundGuid}`);
                }
                lastComment = null;
                continue;
            }
            if (line.startsWith('コマンド\tGRAPHIC')) {
                logDebug(`Detected GRAPHIC after #${lastComment.id} at line ${i + 1}`);
                lastComment.isEventGraphic = true;
                if (!eventGraphicKeywords.has(lastComment.id)) {
                    let guid = '', animation = '';
                    for (let j = i + 1; j < modifiedLines.length && !modifiedLines[j].trim().startsWith('コマンド終了'); j++) {
                        const subLine = modifiedLines[j].trim();
                        if (subLine.startsWith('Guid')) {
                            guid = subLine.replace('Guid', '').trim();
                            const prefix = modifiedLines[j].match(/^\t*/)[0];
                            modifiedLines[j] = `${prefix}Guid\t|Guid|${lastComment.id}|`;
                            logDebug(`Updated GRAPHIC Guid to |Guid|${lastComment.id}| at line ${j + 1}`);
                        } else if (subLine.startsWith('文字列')) {
                            animation = subLine.replace('文字列', '').trim();
                        }
                    }
                    eventGraphicKeywords.set(lastComment.id, {
                        guid,
                        motion: animation,
                        desc: `${lastComment.id} graphic`
                    });
                    const box = {
                        id: lastComment.id,
                        desc: `${lastComment.id} graphic`,
                        defaultGuid: guid,
                        defaultString: animation,
                        defaultInteger: '',
                        category: 'キャラクターグラフィック',
                        type: 'GRAPHICAL',
                        options: {},
                        enableExport: true
                    };
                    settingBoxes.push(box);
                    editedValues.settings[lastComment.id] = {
                        id: lastComment.id,
                        desc: box.desc,
                        guid,
                        string: animation,
                        int: '',
                        type: 'GRAPHICAL'
                    };
                    logDebug(`Added event graphic template for keyword ${lastComment.id} with GUID ${guid} and animation ${animation || 'none'}`);
                }
                lastComment = null;
                continue;
            }
            if (line.startsWith('コマンド\tVARIABLE')) {
                logDebug(`Detected VARIABLE after #${lastComment.id} at line ${i + 1}`);
                lastComment.isVariable = true;
                if (!variableKeywords.has(lastComment.id)) {
                    let defaultInt = '0';
                    let integerCount = 0;
                    for (let j = i + 1; j < modifiedLines.length && !modifiedLines[j].trim().startsWith('コマンド終了'); j++) {
                        const subLine = modifiedLines[j].trim();
                        if (subLine.startsWith('整数')) {
                            integerCount++;
                            if (integerCount === 3) {
                                defaultInt = subLine.replace('整数', '').trim();
                                const prefix = modifiedLines[j].match(/^\t*/)[0];
                                modifiedLines[j] = `${prefix}整数\t|整数|${lastComment.id}|`;
                                logDebug(`Updated VARIABLE third 整数 to |整数|${lastComment.id}| at line ${j + 1}`);
                                break;
                            }
                        }
                    }
                    variableKeywords.set(lastComment.id, {
                        desc: `${lastComment.id} variable`,
                        int: defaultInt
                    });
                    const box = {
                        id: lastComment.id,
                        desc: `${lastComment.id} variable`,
                        defaultGuid: '',
                        defaultString: '',
                        defaultInteger: defaultInt,
                        category: '数値',
                        type: 'VARIABLE',
                        options: {
                            最大: '999999',
                            最小: '0'
                        },
                        enableExport: true
                    };
                    settingBoxes.push(box);
                    editedValues.settings[lastComment.id] = {
                        id: lastComment.id,
                        desc: box.desc,
                        guid: '',
                        string: '',
                        int: defaultInt,
                        type: 'VARIABLE'
                    };
                    logDebug(`Added variable template for keyword ${lastComment.id} with default int: ${defaultInt}`);
                }
                lastComment = null;
                continue;
            }
            if (line.startsWith('コマンド\tITEM') || line.startsWith('コマンド\tIFITEM')) {
                logDebug(`Detected ITEM after #${lastComment.id} at line ${i + 1}`);
                lastComment.isItem = true;
                if (!itemKeywords.has(lastComment.id)) {
                    itemKeywords.set(lastComment.id, {
                        guid: '',
                        desc: `${lastComment.id} item`
                    });
                    const box = {
                        id: lastComment.id,
                        desc: `${lastComment.id} item`,
                        defaultGuid: '',
                        defaultString: '',
                        defaultInteger: '',
                        category: 'アイテム',
                        type: 'ITEM',
                        options: {},
                        enableExport: true
                    };
                    settingBoxes.push(box);
                    editedValues.settings[lastComment.id] = {
                        id: lastComment.id,
                        desc: box.desc,
                        guid: '',
                        string: '',
                        int: '',
                        type: 'ITEM'
                    };
                    logDebug(`Added item template for keyword ${lastComment.id}`);
                }
                for (let j = i + 1; j < modifiedLines.length && !modifiedLines[j].trim().startsWith('コマンド終了'); j++) {
                    if (modifiedLines[j].trim().startsWith('Guid')) {
                        const prefix = modifiedLines[j].match(/^\t*/)[0];
                        modifiedLines[j] = `${prefix}Guid\t|Guid|${lastComment.id}|`;
                        logDebug(`Updated ITEM Guid to |Guid|${lastComment.id}| at line ${j + 1}`);
                        break;
                    }
                }
                lastComment = null;
                continue;
            }
            if (line.startsWith('コマンド\tSWITCH') || line.startsWith('コマンド\tIFSWITCH')) {
                logDebug(`Detected ${line.startsWith('コマンド\tSWITCH') ? 'SWITCH' : 'IFSWITCH'} after #${lastComment.id} at line ${i + 1}`);
                lastComment.isSwitch = true;
                if (!switchKeywords.has(lastComment.id)) {
                    switchKeywords.set(lastComment.id, {
                        desc: `${lastComment.id} switch`
                    });
                    const box = {
                        id: lastComment.id,
                        desc: `${lastComment.id} switch`,
                        defaultGuid: '',
                        defaultString: '',
                        defaultInteger: '',
                        category: 'スイッチ',
                        type: 'SWITCH',
                        options: {},
                        enableExport: true
                    };
                    settingBoxes.push(box);
                    editedValues.settings[lastComment.id] = {
                        id: lastComment.id,
                        desc: box.desc,
                        guid: '',
                        string: '',
                        int: '',
                        type: 'SWITCH'
                    };
                    logDebug(`Added switch template for keyword ${lastComment.id}`);
                }
                for (let j = i + 1; j < modifiedLines.length && !modifiedLines[j].trim().startsWith('コマンド終了'); j++) {
                    if (modifiedLines[j].trim().startsWith('変数')) {
                        const prefix = modifiedLines[j].match(/^\t*/)[0];
                        modifiedLines[j] = `${prefix}変数\t|文字列|${lastComment.id}|`;
                        logDebug(`Updated ${line.startsWith('コマンド\tSWITCH') ? 'SWITCH' : 'IFSWITCH'} 変数 to |文字列|${lastComment.id}| at line ${j + 1}`);
                        break;
                    }
                }
                lastComment = null;
                continue;
            }
            if (line.startsWith('コマンド\tPLMOVE') || line.startsWith('コマンド\tMOVE')) {
                const commandType = line.startsWith('コマンド\tPLMOVE') ? 'PLMOVE' : 'MOVE';
                logDebug(`Detected ${commandType} after #${lastComment.id} at line ${i + 1}`);
                lastComment.isMove = true;
                if (!moveKeywords.has(lastComment.id)) {
                    let spot = '', orientation = '0';
                    for (let j = i + 1; j < modifiedLines.length && !modifiedLines[j].trim().startsWith('コマンド終了'); j++) {
                        const subLine = modifiedLines[j].trim();
                        if (subLine.startsWith('スポット')) {
                            spot = subLine.replace('スポット', '').trim();
                            const prefix = modifiedLines[j].match(/^\t*/)[0];
                            modifiedLines[j] = `${prefix}スポット\t|文字列|${lastComment.id}-mappos|`;
                            logDebug(`Updated ${commandType} スポット to |文字列|${lastComment.id}-mappos| at line ${j + 1}`);
                        } else if (subLine.startsWith('整数') && !subLine.includes('Guid')) {
                            orientation = subLine.replace('整数', '').trim();
                            const prefix = modifiedLines[j].match(/^\t*/)[0];
                            modifiedLines[j] = `${prefix}整数\t|整数|${lastComment.id}-orientation|`;
                            logDebug(`Updated ${commandType} 整数 to |整数|${lastComment.id}-orientation| at line ${j + 1}`);
                        }
                    }
                    moveKeywords.set(lastComment.id, {
                        desc: `${lastComment.id} move`,
                        spot,
                        orientation
                    });
                    const mapPosBox = {
                        id: `${lastComment.id}-mappos`,
                        desc: `Select the Destination (right drag to scroll)`,
                        defaultGuid: '',
                        defaultString: spot,
                        defaultInteger: '',
                        category: 'マップ座標',
                        type: 'MAP_POSITION',
                        options: {},
                        enableExport: true
                    };
                    settingBoxes.push(mapPosBox);
                    editedValues.settings[`${lastComment.id}-mappos`] = {
                        id: `${lastComment.id}-mappos`,
                        desc: mapPosBox.desc,
                        guid: '',
                        string: spot,
                        int: '',
                        type: 'MAP_POSITION'
                    };
                    logDebug(`Added map position template for keyword ${lastComment.id}-mappos with spot: ${spot}`);
                    const orientationBox = {
                        id: `${lastComment.id}-orientation`,
                        desc: `Orientation After Movement`,
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
                    editedValues.settings[`${lastComment.id}-orientation`] = {
                        id: `${lastComment.id}-orientation`,
                        desc: orientationBox.desc,
                        guid: '',
                        string: '',
                        int: orientation,
                        type: 'ORIENTATION',
                        option: '変更しないを追加'
                    };
                    logDebug(`Added orientation template for keyword ${lastComment.id}-orientation with value: ${orientation}`);
                }
                lastComment = null;
                continue;
            }
            if (lastComment.isGraphic) {
                const commandLine = line.split(/\s+/).filter(part => part);
                const commandType = commandLine[1] || '';
                if (commandType in commandTypeMap) {
                    for (let j = currentSheetStart; j < i && j >= 0; j++) {
                        if (modifiedLines[j].trim().startsWith('グラフィック')) {
                            modifiedLines[j] = `\t\tグラフィック\t|Guid|${lastComment.id}|`;
                            logDebug(`Updated グラフィック to |Guid|${lastComment.id}| at line ${j + 1}`);
                            break;
                        }
                    }
                    lastComment = null;
                }
            }
        }
    }

    sheetGraphicUpdates.forEach(({ keyword, lineIndex }, sheetName) => {
        if (lineIndex >= 0 && lineIndex < modifiedLines.length) {
            modifiedLines[lineIndex] = `\t\tグラフィック\t|Guid|${keyword}|`;
            logDebug(`Updated グラフィック in sheet ${sheetName} to |Guid|${keyword}| at line ${lineIndex + 1}`);
        }
    });

    const generatedTemplateLines = [
        `テンプレート定義\t${eventName}`,
        `\t設定ボックス\t説明文`,
        `\t\tデフォルト文字列\t${editedValues.description || ''}`,
        `\t設定ボックス終了`,
        ...(graphicKeywords.size ? Array.from(graphicKeywords.entries()).map(([keyword, { sheetName, guid, motion }]) => [
            `\t設定ボックス\t顔グラフィック`,
            `\t\t設定ID\t${keyword}`,
            `\t\t説明\t${sheetName} graphic`,
            `\t\tデフォルトGuid\t${guid}`,
            ...(motion ? [`\t\tデフォルト文字列\t${motion}`] : []),
            `\t設定ボックス終了`
        ].join('\n')) : []),
        ...(eventGraphicKeywords.size ? Array.from(eventGraphicKeywords.entries()).map(([keyword, { guid, motion, desc }]) => [
            `\t設定ボックス\tキャラクターグラフィック`,
            `\t\t設定ID\t${keyword}`,
            `\t\t説明\t${desc}`,
            `\t\tデフォルトGuid\t${guid}`,
            ...(motion ? [`\t\tデフォルト文字列\t${motion}`] : []),
            `\t設定ボックス終了`
        ].join('\n')) : []),
        ...(itemKeywords.size ? Array.from(itemKeywords.entries()).map(([keyword, { desc, guid }]) => [
            `\t設定ボックス\tアイテム`,
            `\t\t設定ID\t${keyword}`,
            `\t\t説明\t${desc}`,
            `\t\tデフォルトGuid\t${guid}`,
            `\t設定ボックス終了`
        ].join('\n')) : []),
        ...(switchKeywords.size ? Array.from(switchKeywords.entries()).map(([keyword, { desc }]) => [
            `\t設定ボックス\tスイッチ`,
            `\t\t設定ID\t${keyword}`,
            `\t\t説明\t${desc}`,
            `\t設定ボックス終了`
        ].join('\n')) : []),
        ...(messageKeywords.size ? Array.from(messageKeywords.entries()).map(([keyword, { desc, string }]) => [
            `\t設定ボックス\t文章`,
            `\t\t設定ID\t${keyword}`,
            `\t\t説明\t${desc}`,
            `\t\tデフォルト文字列\t${string}`,
            `\t設定ボックス終了`
        ].join('\n')) : []),
        ...(dialogueKeywords.size ? Array.from(dialogueKeywords.entries()).map(([keyword, { desc, string }]) => [
            `\t設定ボックス\t文章`,
            `\t\t設定ID\t${keyword}`,
            `\t\t説明\t${desc}`,
            `\t\tデフォルト文字列\t${string}`,
            `\t設定ボックス終了`
        ].join('\n')) : []),
        ...(stringVariableKeywords.size ? Array.from(stringVariableKeywords.entries()).map(([keyword, { desc, string }]) => [
            `\t設定ボックス\t文章`,
            `\t\t設定ID\t${keyword}`,
            `\t\t説明\t${desc}`,
            `\t\tデフォルト文字列\t${string}`,
            `\t設定ボックス終了`
        ].join('\n')) : []),
        ...(monsterKeywords.size ? Array.from(monsterKeywords.entries()).map(([keyword, { desc, guid }]) => [
            `\t設定ボックス\tモンスター`,
            `\t\t設定ID\t${keyword}`,
            `\t\t説明\t${desc}`,
            `\t\tデフォルトGuid\t${guid}`,
            `\t設定ボックス終了`,
            `\t改行`
        ].join('\n')) : []),
        ...(battleBackgroundKeywords.size ? Array.from(battleBackgroundKeywords.entries()).map(([keyword, { desc, guid }]) => [
            `\t設定ボックス\tバトル背景`,
            `\t\t設定ID\t${keyword}`,
            `\t\t説明\t${desc}`,
            `\t\tデフォルトGuid\t${guid}`,
            `\t設定ボックス終了`
        ].join('\n')) : []),
        ...(moveKeywords.size ? Array.from(moveKeywords.entries()).map(([keyword]) => [
            `\t設定ボックス\tマップ座標`,
            `\t\t設定ID\t${keyword}-mappos`,
            `\t\t説明\tSelect the Destination (right drag to scroll)`,
            `\t設定ボックス終了`,
            `\t設定ボックス\t方向`,
            `\t\t設定ID\t${keyword}-orientation`,
            `\t\t説明\tOrientation After Movement`,
            `\t\tオプション\t変更しないを追加`,
            `\t設定ボックス終了`
        ].join('\n')) : []),
        ...(variableKeywords.size ? Array.from(variableKeywords.entries()).map(([keyword, { desc, int }]) => [
            `\t設定ボックス\t数値`,
            `\t\t設定ID\t${keyword}`,
            `\t\t説明\t${desc}`,
            `\t\tデフォルト整数\t${int}`,
            `\t\tオプション\t最大\t999999`,
            `\t\tオプション\t最小\t0`,
            `\t設定ボックス終了`
        ].join('\n')) : []),
        ...(switchConditionKeywords.size ? Array.from(switchConditionKeywords.entries()).map(([keyword, { desc, string }]) => [
            `\t設定ボックス\tスイッチ条件`,
            `\t\t設定ID\t${keyword}`,
            `\t\t説明\t${desc}`,
            `\t\tデフォルト文字列\t${string}`,
            `\t設定ボックス終了`
        ].join('\n')) : []),
        `テンプレート定義終了`
    ].flat();

    logDebug(`Generated ${settingBoxes.length} setting boxes: ${JSON.stringify(settingBoxes)}`);

    let insertIndex = modifiedLines.findIndex(line => line.trim().startsWith('イベント名'));
    if (insertIndex === -1) insertIndex = 0;
    modifiedLines.splice(insertIndex, 0, ...generatedTemplateLines);

    return {
        generatedTemplate: {
            title: eventName,
            description: editedValues.description || '',
            settingBoxes
        },
        modifiedLines
    };
}