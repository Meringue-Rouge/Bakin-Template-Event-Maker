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
    const switchKeywords = new Map(); // For SWITCH and IFSWITCH

    // First pass: Apply replacements for items, switches, and ifswitches
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
                    if (keyword && graphicGuid && motion) {
                        graphicKeywords.set(keyword, {
                            sheetName,
                            guid: graphicGuid,
                            motion
                        });
                        logDebug(`Found G#${keyword} in sheet ${sheetName} with GUID ${graphicGuid} and motion ${motion}`);
                        const box = {
                            id: keyword,
                            desc: `${sheetName} graphic`,
                            defaultGuid: graphicGuid,
                            defaultString: motion,
                            defaultInteger: '',
                            category: 'キャラクターグラフィック',
                            type: 'GRAPHICAL'
                        };
                        settingBoxes.push(box);
                        editedValues.settings[keyword] = {
                            id: keyword,
                            desc: box.desc,
                            guid: graphicGuid,
                            string: motion,
                            int: '',
                            type: 'GRAPHICAL'
                        };
                        logDebug(`Added graphic template for keyword ${keyword} from sheet ${sheetName}`);
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
                            lineIndex: i
                        };
                    }
                }
            }
            continue;
        }
        if (inScript && lastComment) {
            if (line.startsWith('コマンド\tIFITEM')) {
                logDebug(`Detected IFITEM after #${lastComment.id} at line ${i + 1}`);
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
                        logDebug(`Updated IFITEM Guid to |Guid|${lastComment.id}| at line ${j + 1}`);
                        break;
                    }
                }
                lastComment = null; // Clear after IFITEM
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
                lastComment = null; // Clear after SWITCH/IFSWITCH
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

    // Generate template lines
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
            `\t\tデフォルト文字列\t${motion}`,
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
        `テンプレート定義終了`
    ].flat();

    logDebug(`Generated ${settingBoxes.length} setting boxes: ${JSON.stringify(settingBoxes)}`);

    // Insert template at the appropriate position
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