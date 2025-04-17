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

    // Attach event listeners for title and description
    document.getElementById('title-input').addEventListener('input', (e) => {
        updateField('title', e.target.value);
    });
    document.getElementById('description-input').addEventListener('input', (e) => {
        updateField('description', e.target.value);
    });

    // Attach event listeners for setting boxes
    settingBoxes.forEach(box => {
        document.getElementById(`id-input-${box.id}`).addEventListener('input', (e) => {
            updateField(`settings.${box.id}.id`, e.target.value);
        });
        document.getElementById(`desc-input-${box.id}`).addEventListener('input', (e) => {
            updateField(`settings.${box.id}.desc`, e.target.value);
        });

        // Attach listeners for specific input fields based on type
        if (['GRAPHICAL', 'FACIAL GRAPHICS', 'MONSTER', 'BATTLE BACKGROUND'].includes(box.type)) {
            const guidInput = document.getElementById(`guid-input-${box.id}`);
            if (guidInput) {
                guidInput.addEventListener('input', (e) => {
                    updateField(`settings.${box.id}.guid`, e.target.value);
                });
            }
        }
        if (box.type === 'GRAPHICAL') {
            const stringInput = document.getElementById(`string-input-${box.id}`);
            if (stringInput) {
                stringInput.addEventListener('input', (e) => {
                    updateField(`settings.${box.id}.string`, e.target.value);
                });
            }
        }
        if (box.type === 'MESSAGE' || box.type === 'SWITCH') {
            const stringInput = document.getElementById(`string-input-${box.id}`);
            if (stringInput) {
                stringInput.addEventListener('input', (e) => {
                    updateField(`settings.${box.id}.string`, e.target.value);
                });
            }
        }
        if (box.type === 'VARIABLE') {
            const intInput = document.getElementById(`int-input-${box.id}`);
            if (intInput) {
                intInput.addEventListener('input', (e) => {
                    updateField(`settings.${box.id}.int`, e.target.value);
                });
            }
            const minInput = document.getElementById(`min-input-${box.id}`);
            if (minInput) {
                minInput.addEventListener('input', (e) => {
                    updateField(`settings.${box.id}.min`, e.target.value);
                });
            }
            const maxInput = document.getElementById(`max-input-${box.id}`);
            if (maxInput) {
                maxInput.addEventListener('input', (e) => {
                    updateField(`settings.${box.id}.max`, e.target.value);
                });
            }
        }
        if (box.type === 'MAP_POSITION') {
            const stringInput = document.getElementById(`string-input-${box.id}`);
            if (stringInput) {
                stringInput.addEventListener('input', (e) => {
                    updateField(`settings.${box.id}.string`, e.target.value);
                });
            }
        }
        // Note: ORIENTATION is readonly, so no listener is needed
    });
}

function renderInput(type, box) {
    let html = '';
    if (['GRAPHICAL', 'FACIAL GRAPHICS', 'MONSTER', 'BATTLE BACKGROUND'].includes(type)) {
        html += `
            <label for="guid-input-${box.id}">Edit GUID:</label>
            <input type="text" id="guid-input-${box.id}" value="${box.defaultGuid || ''}">
        `;
    }
    if (type === 'GRAPHICAL') {
        html += `
            <label for="string-input-${box.id}">Animation Name:</label>
            <input type="text" id="string-input-${box.id}" value="${box.defaultString || ''}">
        `;
    }
    if (type === 'MESSAGE' || type === 'SWITCH') {
        html += `
            <label for="string-input-${box.id}">${type === 'SWITCH' ? 'Switch Name' : 'Message Text'}:</label>
            <textarea id="string-input-${box.id}">${box.defaultString || ''}</textarea>
        `;
    }
    if (type === 'VARIABLE') {
        html += `
            <label for="int-input-${box.id}">Value:</label>
            <input type="number" id="int-input-${box.id}" value="${box.defaultInteger || '0'}">
            <label for="min-input-${box.id}">Minimum:</label>
            <input type="number" id="min-input-${box.id}" value="${box.options?.最小 || '0'}">
            <label for="max-input-${box.id}">Maximum:</label>
            <input type="number" id="max-input-${box.id}" value="${box.options?.最大 || '999999'}">
        `;
    }
    if (type === 'MAP_POSITION') {
        html += `
            <label for="string-input-${box.id}">Destination Spot:</label>
            <input type="text" id="string-input-${box.id}" value="${box.defaultString || ''}">
        `;
    }
    if (type === 'ORIENTATION') {
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