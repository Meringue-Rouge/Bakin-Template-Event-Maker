import { logDebug, updateField } from './utils.js';

export function displayTemplate({ title, description, settingBoxes }) {
    const displayDiv = document.getElementById('template-display');
    let html = `
        <label for="title-input">Template Title:</label>
        <input type="text" id="title-input" value="${title || ''}">
        <label for="description-input">Template Description:</label>
        <textarea id="description-input">${description || ''}</textarea>
    `;

    settingBoxes.forEach(box => {
        html += `
            <div class="setting-box">
                <h2>[${box.type}]</h2>
                <label for="id-input-${box.id}">Setting ID:</label>
                <input type="text" id="id-input-${box.id}" value="${box.id}">
                <label for="desc-input-${box.id}">Setting Description:</label>
                <textarea id="desc-input-${box.id}">${box.desc || ''}</textarea>
                ${renderInput(box.type, box)}
            </div>
        `;
    });

    displayDiv.innerHTML = html || '<p>No valid template data found.</p>';
    logDebug(`Displayed ${settingBoxes.length} setting boxes`);

    // Add event listeners for title and description
    document.getElementById('title-input').addEventListener('input', (e) => {
        updateField('title', e.target.value);
    });
    document.getElementById('description-input').addEventListener('input', (e) => {
        updateField('description', e.target.value);
    });

    // Add event listeners for each setting box
    settingBoxes.forEach(box => {
        document.getElementById(`id-input-${box.id}`).addEventListener('input', (e) => {
            updateField(`settings.${box.id}.id`, e.target.value);
        });
        document.getElementById(`desc-input-${box.id}`).addEventListener('input', (e) => {
            updateField(`settings.${box.id}.desc`, e.target.value);
        });
    });
}

function renderInput(type, box) {
    let html = '';
    if (['GRAPHICAL', 'FACIAL GRAPHICS', 'MONSTER', 'BATTLE BACKGROUND'].includes(type)) {
        html += `
            <label for="guid-input-${box.id}">Edit GUID:</label>
            <input type="text" id="guid-input-${box.id}" value="${box.defaultGuid || ''}" onchange="updateField('settings.${box.id}.guid', this.value)">
        `;
    }
    if (type === 'GRAPHICAL') {
        html += `
            <label for="string-input-${box.id}">Animation Name:</label>
            <input type="text" id="string-input-${box.id}" value="${box.defaultString || ''}" onchange="updateField('settings.${box.id}.string', this.value)">
        `;
    }
    if (type === 'MESSAGE' || type === 'SWITCH') {
        html += `
            <label for="string-input-${box.id}">${type === 'SWITCH' ? 'Switch Name' : 'Message Text'}:</label>
            <textarea id="string-input-${box.id}" ${type === 'MESSAGE' ? 'readonly' : ''} onchange="updateField('settings.${box.id}.string', this.value)">${box.defaultString || ''}</textarea>
        `;
    }
    if (type === 'INTEGER') {
        html += `
            <label for="int-input-${box.id}">Value:</label>
            <input type="number" id="int-input-${box.id}" value="${box.defaultInteger || '0'}" onchange="updateField('settings.${box.id}.int', this.value)">
        `;
    }
    if (type === 'MAP_POSITION') {
        html += `
            <label for="string-input-${box.id}">Destination Spot:</label>
            <input type="text" id="string-input-${box.id}" value="${box.defaultString || ''}" onchange="updateField('settings.${box.id}.string', this.value)">
        `;
    }
    if (type === 'ORIENTATION') {
        // Display orientation as read-only text
        const orientationLabel = box.defaultInteger === '-1' ? 'No Change' :
                                box.defaultInteger === '0' ? 'Up' :
                                box.defaultInteger === '1' ? 'Right' :
                                box.defaultInteger === '2' ? 'Down' :
                                box.defaultInteger === '3' ? 'Left' : box.defaultInteger;
        html += `
            <label for="int-input-${box.id}">Orientation:</label>
            <input type="text" id="int-input-${box.id}" value="${orientationLabel}" readonly>
        `;
    }
    return html;
}