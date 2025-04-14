import { originalLines, editedValues, logDebug, commandTypeMap } from './utils.js';

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
    const itemKeywords = new Map();
    const switchKeywords = new Map();
    const messageKeywords = new Map();
    const moveKeywords = new Map();
    const usedGraphicKeywords = new Set(); // Track used G# keywords
    const sheetGraphicUpdates = new Map(); // Track G# keywords per sheet for graphic replacement

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
                        usedGraphicKeywords.add(keyword); // Mark keyword as used
                        graphicKeywords.set(keyword, {
                            sheetName,
                            guid: graphicGuid,
                            motion: motion || '' // Use empty string if motion is missing
                        });
                        logDebug(`Found G#${keyword} in sheet ${sheetName} with GUID ${graphicGuid} and motion ${motion || 'none'}`);
                        const box = {
                            id: keyword,
                            desc: `${sheetName} graphic`,
                            defaultGuid: graphicGuid,
                            defaultString: motion || '',
                            defaultInteger: '',
                            category: 'キャラクターグラフィック',
                            type: 'GRAPHICAL'
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
                    // Store G# keyword for this sheet to update グラフィック
                    if (keyword && graphicGuid) {
                        sheetGraphicUpdates.set(sheetName, { keyword, lineIndex: currentSheetStart + 1 }); // +1 for グラフィック line
                        logDebug(`Scheduled グラフィック update for sheet ${sheetName} to |Guid|${keyword}|`);
                    }
                } else if (comment.startsWith('#')) {
                    const keyword = comment.slice(1).split(/\s+/)[0];
                    if (keyword) {
                        logDebug(`Found comment #${keyword} at line ${i + 1}`);
                        lastComment = {
                            id: keyword,
                            isGraphic: false,
                            isItem: false,
                            isSwitch: false,
                            isMessage: false,
                            isMove: false,
                            lineIndex: i
                        };
                    }
                }
            }
            continue;
        }
        if (inScript && lastComment) {
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
                        type: 'ITEM'
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
                        type: 'SWITCH'
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
                        type: 'MESSAGE'
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
                        type: 'MAP_POSITION'
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
                        option: '変更しないを追加'
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

    // Apply グラフィック updates for sheets with G# comments
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
            `\t設定ボックス\tキャラクターグラフィック`,
            `\t\t設定ID\t${keyword}`,
            `\t\t説明\t${sheetName} graphic`,
            `\t\tデフォルトGuid\t${guid}`,
            ...(motion ? [`\t\tデフォルト文字列\t${motion}`] : []), // Only include motion if it exists
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