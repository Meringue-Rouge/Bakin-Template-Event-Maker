import { originalLines, editedValues, logDebug, typeMap, originalSwitchReferences } from './utils.js';
import { parseTemplate } from './templateParser.js';
import { generateTemplate } from './templateGenerator.js';
import { displayTemplate } from './uiRenderer.js';

// Handle file upload
document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return logDebug('No file selected');
    const reader = new FileReader();
    reader.onload = e => {
        try {
            originalLines.length = 0; // Clear previous lines
            originalLines.push(...e.target.result.split('\n'));
            editedValues.title = '';
            editedValues.description = '';
            editedValues.settings = {};
            let template = parseTemplate(originalLines);
            if (!template.hasTemplate && template.eventName) {
                const { generatedTemplate, modifiedLines } = generateTemplate(originalLines, template.eventName);
                template = { ...generatedTemplate, hasTemplate: false, eventName: template.eventName };
                originalLines.length = 0;
                originalLines.push(...modifiedLines);
                editedValues.title = generatedTemplate.title;
            }
            displayTemplate(template);
            document.getElementById('exportSection').classList.add('visible');
            logDebug('File loaded and parsed');
        } catch (error) {
            logDebug(`Error processing file: ${error.message}`);
            alert('Failed to process file. Check debug log.');
        }
    };
    reader.onerror = () => {
        logDebug('File reading failed');
        alert('Failed to read file.');
    };
    reader.readAsText(file);
});

function exportFile() {
    if (!originalLines.length) {
        logDebug('No original lines to export');
        alert('No file data available to export.');
        return;
    }

    try {
        let modifiedLines = [...originalLines];
        let inSheet = false; // Declare inSheet at the correct scope

        // Generate updated template section
        const newTemplateLines = [
            `テンプレート定義\t${editedValues.title || 'Default Title'}`,
            `\t設定ボックス\t説明文`,
            `\t\tデフォルト文字列\t${editedValues.description || ''}`,
            `\t設定ボックス終了`
        ];

        // Create ID mapping for renamed settings
        const idMapping = {};
        Object.entries(editedValues.settings).forEach(([oldId, settings]) => {
            if (settings.id && settings.id !== oldId) {
                idMapping[oldId] = settings.id;
                logDebug(`Mapped old ID ${oldId} to new ID ${settings.id}`);
            }
        });

        // Add setting boxes from editedValues.settings
        Object.entries(editedValues.settings).forEach(([keyword, settings]) => {
            // Skip COND_TYPE_SWITCH if enableExport is false
            if (settings.type === 'COND_TYPE_SWITCH' && !settings.enableExport) {
                // Restore original reference name
                if (settings.originalReferenceName !== undefined) {
                    for (let i = 0; i < modifiedLines.length; i++) {
                        const line = modifiedLines[i].trim();
                        if (line.startsWith('シート')) {
                            inSheet = true;
                            continue;
                        }
                        if (line.startsWith('シート終了')) {
                            inSheet = false;
                            continue;
                        }
                        if (inSheet && line.startsWith('条件\tCOND_TYPE_SWITCH')) {
                            for (let j = i + 1; j < modifiedLines.length && !modifiedLines[j].trim().startsWith('条件終了'); j++) {
                                if (modifiedLines[j].trim().startsWith('参照名') && modifiedLines[j].includes(keyword)) {
                                    const prefix = modifiedLines[j].match(/^\t*/)[0];
                                    modifiedLines[j] = `${prefix}参照名\t${settings.originalReferenceName}`;
                                    logDebug(`Restored original 参照名 for ${keyword} to ${settings.originalReferenceName} at line ${j + 1}`);
                                    break;
                                }
                            }
                        }
                    }
                }
                logDebug(`Skipped COND_TYPE_SWITCH template for ${keyword} (enableExport is false)`);
                return;
            }

            const settingId = idMapping[keyword] || keyword; // Use new ID if available
            if (settings.type === 'FACIAL GRAPHICS') {
                newTemplateLines.push(
                    `\t設定ボックス\t顔グラフィック`,
                    `\t\t設定ID\t${settingId}`,
                    `\t\t説明\t${settings.desc || `${settingId} graphic`}`,
                    `\t\tデフォルトGuid\t${settings.guid || ''}`,
                    ...(settings.string ? [`\t\tデフォルト文字列\t${settings.string}`] : []),
                    `\t設定ボックス終了`
                );
            } else if (settings.type === 'GRAPHICAL') {
                newTemplateLines.push(
                    `\t設定ボックス\tキャラクターグラフィック`,
                    `\t\t設定ID\t${settingId}`,
                    `\t\t説明\t${settings.desc || `${settingId} graphic`}`,
                    `\t\tデフォルトGuid\t${settings.guid || ''}`,
                    ...(settings.string ? [`\t\tデフォルト文字列\t${settings.string}`] : []),
                    `\t設定ボックス終了`
                );
            } else if (settings.type === 'ITEM') {
                newTemplateLines.push(
                    `\t設定ボックス\tアイテム`,
                    `\t\t設定ID\t${settingId}`,
                    `\t\t説明\t${settings.desc || `${settingId} item`}`,
                    `\t設定ボックス終了`
                );
            } else if (settings.type === 'SWITCH') {
                newTemplateLines.push(
                    `\t設定ボックス\tスイッチ`,
                    `\t\t設定ID\t${settingId}`,
                    `\t\t説明\t${settings.desc || `${settingId} switch`}`,
                    ...(settings.string ? [`\t\tデフォルト文字列\t${settings.string}`] : []),
                    `\t設定ボックス終了`
                );
            } else if (settings.type === 'MESSAGE') {
                newTemplateLines.push(
                    `\t設定ボックス\t文章`,
                    `\t\t設定ID\t${settingId}`,
                    `\t\t説明\t${settings.desc || `${settingId} message`}`,
                    `\t\tデフォルト文字列\t${settings.string || ''}`,
                    `\t設定ボックス終了`
                );
            } else if (settings.type === 'STRING_VARIABLE') {
                newTemplateLines.push(
                    `\t設定ボックス\t文章`,
                    `\t\t設定ID\t${settingId}`,
                    `\t\t説明\t${settings.desc || `${settingId} string variable`}`,
                    `\t\tデフォルト文字列\t${settings.string || ''}`,
                    `\t設定ボックス終了`
                );
            } else if (settings.type === 'MONSTER') {
                newTemplateLines.push(
                    `\t設定ボックス\tモンスター`,
                    `\t\t設定ID\t${settingId}`,
                    `\t\t説明\t${settings.desc || `Monster to Fight`}`,
                    `\t\tデフォルトGuid\t${settings.guid || ''}`,
                    `\t設定ボックス終了`,
                    `\t改行`
                );
            } else if (settings.type === 'BATTLE BACKGROUND') {
                newTemplateLines.push(
                    `\t設定ボックス\tバトル背景`,
                    `\t\t設定ID\t${settingId}`,
                    `\t\t説明\t${settings.desc || `Battle Background`}`,
                    `\t\tデフォルトGuid\t${settings.guid || ''}`,
                    `\t設定ボックス終了`
                );
            } else if (settings.type === 'MAP_POSITION') {
                newTemplateLines.push(
                    `\t設定ボックス\tマップ座標`,
                    `\t\t設定ID\t${settingId}`,
                    `\t\t説明\t${settings.desc || `Select the Destination (right drag to scroll)`}`,
                    `\t設定ボックス終了`
                );
            } else if (settings.type === 'ORIENTATION') {
                newTemplateLines.push(
                    `\t設定ボックス\t方向`,
                    `\t\t設定ID\t${settingId}`,
                    `\t\t説明\t${settings.desc || `Orientation After Movement`}`,
                    `\t\tオプション\t変更しないを追加`,
                    `\t設定ボックス終了`
                );
            } else if (settings.type === 'VARIABLE') {
                newTemplateLines.push(
                    `\t設定ボックス\t数値`,
                    `\t\t設定ID\t${settingId}`,
                    `\t\t説明\t${settings.desc || `${settingId} variable`}`,
                    `\t\tデフォルト整数\t${settings.int || '0'}`,
                    `\t\tオプション\t最大\t${settings.max || '999999'}`,
                    `\t\tオプション\t最小\t${settings.min || '0'}`,
                    `\t設定ボックス終了`
                );
            } else if (settings.type === 'COND_TYPE_SWITCH') {
                newTemplateLines.push(
                    `\t設定ボックス\tスイッチ`,
                    `\t\t設定ID\t${settingId}`,
                    `\t\t説明\t${settings.desc || `${settingId} switch condition`}`,
                    `\t\tデフォルト文字列\t${settings.string || ''}`,
                    `\t設定ボックス終了`
                );
            }
        });

        newTemplateLines.push(`テンプレート定義終了`);

        // Find existing Guid or set default
        let eventGuid = '4a9c0d55-620b-488f-b8dd-d27443dd39af'; // Default Guid
        let guidIndex = modifiedLines.findIndex(line => line.trim().startsWith('Guid'));
        if (guidIndex !== -1) {
            eventGuid = modifiedLines[guidIndex].replace('Guid', '').trim();
        }

        // Remove all existing template sections
        let i = 0;
        while (i < modifiedLines.length) {
            let line = modifiedLines[i].trim();
            if (line.startsWith('テンプレート定義') && !line.trim().startsWith('テンプレート定義終了')) {
                let startIndex = i;
                while (i < modifiedLines.length && !modifiedLines[i].trim().startsWith('テンプレート定義終了')) {
                    i++;
                }
                if (i < modifiedLines.length && modifiedLines[i].trim().startsWith('テンプレート定義終了')) {
                    i++; // Include the テンプレート定義終了 line
                }
                modifiedLines.splice(startIndex, i - startIndex);
                i = startIndex; // Re-check the same index after removal
            } else {
                i++;
            }
        }

        // Remove existing Guid if it exists
        guidIndex = modifiedLines.findIndex(line => line.trim().startsWith('Guid'));
        if (guidIndex !== -1) {
            modifiedLines.splice(guidIndex, 1);
        }

        // Find insertion point (before event name or sheet, or at start)
        let insertIndex = modifiedLines.findIndex(line => line.trim().startsWith('イベント名'));
        if (insertIndex === -1) {
            insertIndex = modifiedLines.findIndex(line => line.trim().startsWith('シート'));
            if (insertIndex === -1) insertIndex = 0;
        }

        // Find event name and store it for repositioning
        let eventNameLine = null;
        let eventNameIndex = modifiedLines.findIndex(line => line.trim().startsWith('イベント名'));
        if (eventNameIndex !== -1) {
            eventNameLine = modifiedLines[eventNameIndex];
            modifiedLines.splice(eventNameIndex, 1); // Remove event name temporarily
        }

        // Insert new template section and Guid
        modifiedLines.splice(insertIndex, 0, ...newTemplateLines, `Guid\t${eventGuid}`);
        logDebug(`Inserted new template section and Guid at line ${insertIndex + 1}`);

        // Reinsert event name after Guid
        if (eventNameLine) {
            modifiedLines.splice(insertIndex + newTemplateLines.length + 1, 0, eventNameLine);
            logDebug(`Inserted イベント名 at line ${insertIndex + newTemplateLines.length + 2}`);
        } else {
            // If no event name was found, add a default one
            modifiedLines.splice(insertIndex + newTemplateLines.length + 1, 0, `イベント名\t${editedValues.title || 'Default Event'}`);
            logDebug(`Inserted default イベント名 at line ${insertIndex + newTemplateLines.length + 2}`);
        }

        // Update GRAPHIC, VARIABLE, MESSAGE, BOSSBATTLE, and COND_TYPE_SWITCH commands with new values
        let inScript = false;
        inSheet = false; // Reset inSheet
        Object.entries(editedValues.settings).forEach(([keyword, settings]) => {
            const settingId = idMapping[keyword] || keyword; // Use new ID if available
            if (settings.type === 'GRAPHICAL') {
                for (let i = 0; i < modifiedLines.length; i++) {
                    const line = modifiedLines[i].trim();
                    if (line.startsWith('スクリプト')) {
                        inScript = true;
                        continue;
                    }
                    if (line.startsWith('スクリプト終了')) {
                        inScript = false;
                        continue;
                    }
                    if (inScript && line.startsWith('コマンド\tCOMMENT')) {
                        if (i + 1 < modifiedLines.length && modifiedLines[i + 1].trim().startsWith('文字列')) {
                            const comment = modifiedLines[i + 1].replace('文字列', '').trim();
                            if (comment === `#${keyword}` && i + 2 < modifiedLines.length && modifiedLines[i + 2].trim().startsWith('コマンド\tGRAPHIC')) {
                                for (let j = i + 3; j < modifiedLines.length && !modifiedLines[j].trim().startsWith('コマンド終了'); j++) {
                                    if (modifiedLines[j].trim().startsWith('Guid')) {
                                        const prefix = modifiedLines[j].match(/^\t*/)[0];
                                        modifiedLines[j] = `${prefix}Guid\t|Guid|${settingId}|`;
                                        logDebug(`Updated GRAPHIC Guid for ${keyword} to ${settingId} at line ${j + 1}`);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            } else if (settings.type === 'VARIABLE') {
                for (let i = 0; i < modifiedLines.length; i++) {
                    const line = modifiedLines[i].trim();
                    if (line.startsWith('スクリプト')) {
                        inScript = true;
                        continue;
                    }
                    if (line.startsWith('スクリプト終了')) {
                        inScript = false;
                        continue;
                    }
                    if (inScript && line.startsWith('コマンド\tCOMMENT')) {
                        if (i + 1 < modifiedLines.length && modifiedLines[i + 1].trim().startsWith('文字列')) {
                            const comment = modifiedLines[i + 1].replace('文字列', '').trim();
                            if (comment === `#${keyword}` && i + 2 < modifiedLines.length && modifiedLines[i + 2].trim().startsWith('コマンド\tVARIABLE')) {
                                let integerCount = 0;
                                for (let j = i + 3; j < modifiedLines.length && !modifiedLines[j].trim().startsWith('コマンド終了'); j++) {
                                    if (modifiedLines[j].trim().startsWith('整数')) {
                                        integerCount++;
                                        if (integerCount === 3) {
                                            const prefix = modifiedLines[j].match(/^\t*/)[0];
                                            modifiedLines[j] = `${prefix}整数\t|整数|${settingId}|`;
                                            logDebug(`Updated VARIABLE 整数 for ${keyword} to ${settingId} at line ${j + 1}`);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } else if (settings.type === 'MESSAGE') {
                for (let i = 0; i < modifiedLines.length; i++) {
                    const line = modifiedLines[i].trim();
                    if (line.startsWith('スクリプト')) {
                        inScript = true;
                        continue;
                    }
                    if (line.startsWith('スクリプト終了')) {
                        inScript = false;
                        continue;
                    }
                    if (inScript && line.startsWith('コマンド\tCOMMENT')) {
                        if (i + 1 < modifiedLines.length && modifiedLines[i + 1].trim().startsWith('文字列')) {
                            const comment = modifiedLines[i + 1].replace('文字列', '').trim();
                            if (comment === `#${keyword}` && i + 2 < modifiedLines.length && modifiedLines[i + 2].trim().startsWith('コマンド\tMESSAGE')) {
                                for (let j = i + 3; j < modifiedLines.length && !modifiedLines[j].trim().startsWith('コマンド終了'); j++) {
                                    if (modifiedLines[j].trim().startsWith('文字列')) {
                                        const prefix = modifiedLines[j].match(/^\t*/)[0];
                                        modifiedLines[j] = `${prefix}文字列\t|文字列|${settingId}|`;
                                        logDebug(`Updated MESSAGE 文字列 for ${keyword} to ${settingId} at line ${j + 1}`);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            } else if (settings.type === 'STRING_VARIABLE') {
                for (let i = 0; i < modifiedLines.length; i++) {
                    const line = modifiedLines[i].trim();
                    if (line.startsWith('スクリプト')) {
                        inScript = true;
                        continue;
                    }
                    if (line.startsWith('スクリプト終了')) {
                        inScript = false;
                        continue;
                    }
                    if (inScript && line.startsWith('コマンド\tCOMMENT')) {
                        if (i + 1 < modifiedLines.length && modifiedLines[i + 1].trim().startsWith('文字列')) {
                            const comment = modifiedLines[i + 1].replace('文字列', '').trim();
                            if (comment === `#${keyword}` && i + 2 < modifiedLines.length && modifiedLines[i + 2].trim().startsWith('コマンド\tSTRING_VARIABLE')) {
                                for (let j = i + 3; j < modifiedLines.length && !modifiedLines[j].trim().startsWith('コマンド終了'); j++) {
                                    if (modifiedLines[j].trim().startsWith('文字列')) {
                                        const prefix = modifiedLines[j].match(/^\t*/)[0];
                                        modifiedLines[j] = `${prefix}文字列\t|文字列|${settingId}|`;
                                        logDebug(`Updated STRING_VARIABLE 文字列 for ${keyword} to ${settingId} at line ${j + 1}`);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            } else if (settings.type === 'MONSTER' || settings.type === 'BATTLE BACKGROUND') {
                const baseKeyword = keyword.replace(/-monster|-battlemap/, '');
                for (let i = 0; i < modifiedLines.length; i++) {
                    const line = modifiedLines[i].trim();
                    if (line.startsWith('スクリプト')) {
                        inScript = true;
                        continue;
                    }
                    if (line.startsWith('スクリプト終了')) {
                        inScript = false;
                        continue;
                    }
                    if (inScript && line.startsWith('コマンド\tCOMMENT')) {
                        if (i + 1 < modifiedLines.length && modifiedLines[i + 1].trim().startsWith('文字列')) {
                            const comment = modifiedLines[i + 1].replace('文字列', '').trim();
                            if (comment === `#${baseKeyword}` && i + 2 < modifiedLines.length && modifiedLines[i + 2].trim().startsWith('コマンド\tBOSSBATTLE')) {
                                let guidCount = 0;
                                for (let j = i + 3; j < modifiedLines.length && !modifiedLines[j].trim().startsWith('コマンド終了'); j++) {
                                    if (modifiedLines[j].trim().startsWith('Guid')) {
                                        guidCount++;
                                        if (guidCount === 1 && settings.type === 'MONSTER') {
                                            const prefix = modifiedLines[j].match(/^\t*/)[0];
                                            modifiedLines[j] = `${prefix}Guid\t|Guid|${settingId}|`;
                                            logDebug(`Updated BOSSBATTLE monster Guid for ${keyword} to ${settingId} at line ${j + 1}`);
                                        } else if (guidCount === 3 && settings.type === 'BATTLE BACKGROUND') {
                                            const prefix = modifiedLines[j].match(/^\t*/)[0];
                                            modifiedLines[j] = `${prefix}Guid\t|Guid|${settingId}|`;
                                            logDebug(`Updated BOSSBATTLE background Guid for ${keyword} to ${settingId} at line ${j + 1}`);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } else if (settings.type === 'COND_TYPE_SWITCH' && settings.enableExport) {
                const originalReferenceName = settings.originalReferenceName || keyword;
                for (let i = 0; i < modifiedLines.length; i++) {
                    const line = modifiedLines[i].trim();
                    if (line.startsWith('シート')) {
                        inSheet = true;
                        continue;
                    }
                    if (line.startsWith('シート終了')) {
                        inSheet = false;
                        continue;
                    }
                    if (inSheet && line.startsWith('条件\tCOND_TYPE_SWITCH')) {
                        for (let j = i + 1; j < modifiedLines.length && !modifiedLines[j].trim().startsWith('条件終了'); j++) {
                            if (modifiedLines[j].trim().startsWith('参照名') && modifiedLines[j].includes(originalReferenceName)) {
                                const prefix = modifiedLines[j].match(/^\t*/)[0];
                                modifiedLines[j] = `${prefix}参照名\t|文字列|${settingId}|`;
                                logDebug(`Updated COND_TYPE_SWITCH 参照名 for ${keyword} to ${settingId} at line ${j + 1}`);
                                break;
                            }
                        }
                    }
                }
            }
        });

        // Convert commas to dots for specific fields (判定拡張X, 判定拡張Z, 判定拡張Y)
        const fieldsToConvert = ['判定拡張X', '判定拡張Z', '判定拡張Y'];
        for (let i = 0; i < modifiedLines.length; i++) {
            const line = modifiedLines[i].trim();
            for (const field of fieldsToConvert) {
                if (line.startsWith(field)) {
                    const value = line.replace(field, '').trim();
                    if (value.includes(',')) {
                        const newValue = value.replace(',', '.');
                        modifiedLines[i] = `\t${field}\t${newValue}`;
                        logDebug(`Converted ${field} value from ${value} to ${newValue} at line ${i + 1}`);
                    }
                    break;
                }
            }
        }

        const recreatedFile = modifiedLines.join('\n');
        logDebug('Exported file content:\n' + recreatedFile);

        const filenameId = document.getElementById('filenameId').value || '090000';
        const filenameString = document.getElementById('filenameString').value.trim();
        const filename = filenameString ? `${filenameId}_${filenameString}.txt` : `${filenameId}.txt`;

        const blob = new Blob([recreatedFile], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert('File exported successfully!');
    } catch (error) {
        logDebug(`Export failed: ${error.message}`);
        alert('Failed to export file. Check debug log for details.');
    }
}

function updateSettingBox(lines, boxLines, startIndex, idMapping) {
    let settingId = '', newSettingId = '';
    let indices = { guid: -1, string: -1, desc: -1, int: -1, id: -1, max: -1, min: -1 };
    for (let j = 0; j < boxLines.length; j++) {
        const line = boxLines[j].trim();
        if (line.startsWith('設定ID')) {
            settingId = line.replace('設定ID', '').trim();
            indices.id = startIndex + j;
        }
        else if (line.startsWith('デフォルトGuid')) indices.guid = startIndex + j;
        else if (line.startsWith('デフォルト文字列')) indices.string = startIndex + j;
        else if (line.startsWith('説明')) indices.desc = startIndex + j;
        else if (line.startsWith('デフォルト整数')) indices.int = startIndex + j;
        else if (line.startsWith('オプション\t最大')) indices.max = startIndex + j;
        else if (line.startsWith('オプション\t最小')) indices.min = startIndex + j;
    }
    const settings = editedValues.settings[settingId] || {};
    if (settings.id && settings.id !== settingId) {
        idMapping[settingId] = newSettingId = settings.id;
        if (indices.id !== -1) {
            lines[indices.id] = `\t設定ID\t${newSettingId}`;
            logDebug(`Replaced 設定ID ${settingId} with ${newSettingId} at line ${indices.id + 1}`);
        }
    }
    if (settingId === '説明' && editedValues.description && indices.string !== -1) {
        lines[indices.string] = `\tデフォルト文字列\t${editedValues.description}`;
    } else {
        if (settings.guid && indices.guid !== -1 && settings.type !== 'ITEM') {
            lines[indices.guid] = `\tデフォルトGuid\t${settings.guid}`;
            logDebug(`Updated GUID for ${settingId} at line ${indices.guid + 1}`);
        }
        if (settings.desc && indices.desc !== -1) {
            lines[indices.desc] = `\t説明\t${settings.desc}`;
            logDebug(`Updated description for ${settingId} at line ${indices.desc + 1}`);
        }
        if (settings.string && indices.string !== -1 && settings.type !== 'MESSAGE' && settings.type !== 'STRING_VARIABLE') {
            lines[indices.string] = `\tデフォルト文字列\t${settings.string}`;
            logDebug(`Updated string for ${settingId} at line ${indices.string + 1}`);
        }
        if (settings.int && indices.int !== -1) {
            lines[indices.int] = `\tデフォルト整数\t${settings.int}`;
            logDebug(`Updated integer for ${settingId} at line ${indices.int + 1}`);
        }
        if (settings.max && indices.max !== -1) {
            lines[indices.max] = `\tオプション\t最大\t${settings.max}`;
            logDebug(`Updated max for ${settingId} at line ${indices.max + 1}`);
        }
        if (settings.min && indices.min !== -1) {
            lines[indices.min] = `\tオプション\t最小\t${settings.min}`;
            logDebug(`Updated min for ${settingId} at line ${indices.min + 1}`);
        }
    }
}

// Attach event listeners
document.getElementById('exportButton').addEventListener('click', exportFile);

document.getElementById('helpSection').addEventListener('click', function(event) {
    if (event.target.closest('h2')) {
        this.classList.toggle('collapsed');
    }
});