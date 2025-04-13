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

    // First pass: Apply item replacements
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
                        if (!settingBoxes.some(box => box.id === keyword)) {
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
                    }
                } else if (comment.startsWith('#')) {
                    const keyword = comment.slice(1).split(/\s+/)[0];
                    if (keyword) {
                        lastComment = {
                            id: keyword,
                            isGraphic: false,
                            isItem: true,
                            lineIndex: i
                        };
                        if (!itemKeywords.has(keyword)) {
                            itemKeywords.set(keyword, {
                                guid: '',
                                desc: `${keyword} item`
                            });
                            const box = {
                                id: keyword,
                                desc: `${keyword} item`,
                                defaultGuid: '',
                                defaultString: '',
                                defaultInteger: '',
                                category: 'アイテム',
                                type: 'ITEM'
                            };
                            settingBoxes.push(box);
                            editedValues.settings[keyword] = {
                                id: keyword,
                                desc: box.desc,
                                guid: '',
                                string: '',
                                int: '',
                                type: 'ITEM'
                            };
                            logDebug(`Added item template for keyword ${keyword}`);
                        }
                    }
                }
                continue;
            }
        }
        if (inScript && lastComment && line.startsWith('コマンド\tIFITEM')) {
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
        if (inScript && lastComment && !line.startsWith('コマンド\tCOMMENT')) {
            const commandLine = line.split(/\s+/).filter(part => part);
            const commandType = commandLine[1] || '';
            if (lastComment.isGraphic && commandType in commandTypeMap) {
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
        `テンプレート定義終了`
    ].flat();

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