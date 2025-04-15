import { originalLines, editedValues, logDebug, typeMap } from './utils.js';
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

        // Generate updated template section
        const newTemplateLines = [
            `テンプレート定義\t${editedValues.title || 'Default Title'}`,
            `\t設定ボックス\t説明文`,
            `\t\tデフォルト文字列\t${editedValues.description || ''}`,
            `\t設定ボックス終了`
        ];

        // Add setting boxes from editedValues.settings
        Object.entries(editedValues.settings).forEach(([keyword, settings]) => {
            if (settings.type === 'GRAPHICAL') {
                newTemplateLines.push(
                    `\t設定ボックス\tキャラクターグラフィック`,
                    `\t\t設定ID\t${keyword}`,
                    `\t\t説明\t${settings.desc || `${keyword} graphic`}`,
                    `\t\tデフォルトGuid\t${settings.guid || ''}`,
                    ...(settings.string ? [`\t\tデフォルト文字列\t${settings.string}`] : []),
                    `\t設定ボックス終了`
                );
            } else if (settings.type === 'ITEM') {
                newTemplateLines.push(
                    `\t設定ボックス\tアイテム`,
                    `\t\t設定ID\t${keyword}`,
                    `\t\t説明\t${settings.desc || `${keyword} item`}`,
                    `\t設定ボックス終了`
                );
            } else if (settings.type === 'SWITCH') {
                newTemplateLines.push(
                    `\t設定ボックス\tスイッチ`,
                    `\t\t設定ID\t${keyword}`,
                    `\t\t説明\t${settings.desc || `${keyword} switch`}`,
                    `\t設定ボックス終了`
                );
            } else if (settings.type === 'MESSAGE') {
                newTemplateLines.push(
                    `\t設定ボックス\t文章`,
                    `\t\t設定ID\t${keyword}`,
                    `\t\t説明\t${settings.desc || `${keyword} message`}`,
                    `\t\tデフォルト文字列\t${settings.string || ''}`,
                    `\t設定ボックス終了`
                );
            } else if (settings.type === 'MAP_POSITION') {
                newTemplateLines.push(
                    `\t設定ボックス\tマップ座標`,
                    `\t\t設定ID\t${keyword}`,
                    `\t\t説明\t${settings.desc || `Select the Destination (right drag to scroll)`}`,
                    `\t設定ボックス終了`
                );
            } else if (settings.type === 'ORIENTATION') {
                newTemplateLines.push(
                    `\t設定ボックス\t方向`,
                    `\t\t設定ID\t${keyword}`,
                    `\t\t説明\t${settings.desc || `Orientation After Movement`}`,
                    `\t\tオプション\t変更しないを追加`,
                    `\t設定ボックス終了`
                );
            } else if (settings.type === 'VARIABLE') {
                newTemplateLines.push(
                    `\t設定ボックス\t数値`,
                    `\t\t設定ID\t${keyword}`,
                    `\t\t説明\t${settings.desc || `${keyword} variable`}`,
                    `\t\tデフォルト整数\t${settings.int || '0'}`,
                    `\t\tオプション\t最大\t${settings.max || '999999'}`,
                    `\t\tオプション\t最小\t${settings.min || '0'}`,
                    `\t設定ボックス終了`
                );
            }
        });

        newTemplateLines.push(`テンプレート定義終了`);

        // Replace or insert template section
        let templateStartIndex = -1, templateEndIndex = -1;
        for (let i = 0; i < modifiedLines.length; i++) {
            let line = modifiedLines[i].trim();
            if (line.startsWith('テンプレート定義') && !line.trim().startsWith('テンプレート定義終了')) {
                templateStartIndex = i;
            }
            if (line.startsWith('テンプレート定義終了') && templateStartIndex !== -1) {
                templateEndIndex = i;
                break;
            }
        }

        if (templateStartIndex !== -1 && templateEndIndex !== -1 && templateEndIndex >= templateStartIndex) {
            modifiedLines.splice(templateStartIndex, templateEndIndex - templateStartIndex + 1, ...newTemplateLines);
            logDebug(`Replaced template section from line ${templateStartIndex + 1} to ${templateEndIndex + 1}`);
        } else {
            let insertIndex = modifiedLines.findIndex(line => line.trim().startsWith('イベント名'));
            if (insertIndex === -1) insertIndex = 0;
            modifiedLines.splice(insertIndex, 0, ...newTemplateLines);
            logDebug(`Inserted new template section at line ${insertIndex + 1}`);
        }

        // Update GRAPHIC and VARIABLE commands with new values
        let inScript = false;
        Object.entries(editedValues.settings).forEach(([keyword, settings]) => {
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
                                        modifiedLines[j] = `${prefix}Guid\t|Guid|${keyword}|`;
                                        logDebug(`Updated GRAPHIC Guid for ${keyword} at line ${j + 1}`);
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
                                            modifiedLines[j] = `${prefix}整数\t|整数|${keyword}|`;
                                            logDebug(`Updated VARIABLE 整数 for ${keyword} at line ${j + 1}`);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

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
        if (settings.string && indices.string !== -1 && settings.type !== 'MESSAGE') {
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