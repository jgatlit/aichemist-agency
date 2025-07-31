document.addEventListener('DOMContentLoaded', () => {
    const configPanel = document.getElementById('config-panel');
    const toggleAllSectionsButton = document.getElementById('toggle-all-sections');
    const savePresetButton = document.getElementById('save-preset');
    const presetsPanel = document.getElementById('presets-panel');
    const togglePresetsPanelButton = document.getElementById('toggle-presets-panel');
    const presetsListDiv = document.getElementById('presets-list');
    const deviceNameInput = document.getElementById('device-name');

    let chatbot;

    let chatbotConfig = {}; // Initialize as empty, will be populated from inputs

    function syncConfigFromInputs() {
        // Define the base structure of chatbotConfig to ensure all paths exist
        chatbotConfig = {
            chatflowid: document.getElementById('chatflowid') ? document.getElementById('chatflowid').value : "YOUR_CHATFLOW_ID",
            apiHost: document.getElementById('apiHost') ? document.getElementById('apiHost').value : "YOUR_API_HOST",
            theme: {
                button: {},
                tooltip: {},
                disclaimer: {},
                customCSS: "",
                chatWindow: {
                    botMessage: {},
                    userMessage: {},
                    textInput: {},
                    feedback: {},
                    dateTimeToggle: {},
                    footer: {}
                }
            }
        };

        // Iterate over all input elements in the config panel
        configPanel.querySelectorAll('[data-path]').forEach(inputElement => {
            const path = inputElement.dataset.path;
            let value;

            if (inputElement.type === 'checkbox') {
                value = inputElement.checked;
            } else if (inputElement.type === 'range' || inputElement.type === 'number') {
                value = parseInt(inputElement.value, 10);
            } else if (path === 'theme.chatWindow.starterPrompts') {
                value = inputElement.value.split(',').map(s => s.trim()).filter(s => s !== '');
            } else if (path === 'theme.chatWindow.showAgentMessages') {
                value = (inputElement.value === 'true'); // Convert string "true"/"false" to boolean
            } else {
                value = inputElement.value;
            }

            // Special handling for cssUrl which is not nested under theme
            if (path === 'cssUrl') {
                chatbotConfig.cssUrl = value;
                return;
            }

            // Update nested object using path
            let current = chatbotConfig;
            const keys = path.split('.');
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    current[keys[i]] = {}; // Create nested object if it doesn't exist
                }
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
        });
    }

    

    const fetchThemeButton = document.getElementById('fetch-theme');
    const cssUrlInput = document.getElementById('css-url');
    const themeStatus = document.getElementById('theme-status');

    function initChatbot(config) {
        if (chatbot) {
            chatbot.destroy();
        }
        chatbot = Chatbot.init(config);
    }

    function updateConfig(path, value) {
        let current = chatbotConfig;
        const keys = path.split('.');
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        initChatbot(chatbotConfig);
    }

    configPanel.addEventListener('input', (event) => {
        const target = event.target;
        const path = target.dataset.path;
        let value = target.value;

        if (target.type === 'checkbox') {
            value = target.checked;
        } else if (target.type === 'range' || target.type === 'number') {
            value = parseInt(value, 10);
        }

        if (path) {
            updateConfig(path, value);
        }

        // Update color display tile if it's a color input
        if (target.id.includes('Color')) {
            const displayTile = document.getElementById(target.id + '-display');
            if (displayTile) {
                console.log(`Input event: ${target.id}, Value: ${value}, Hex: ${colorToHex(value)}`);
                displayTile.style.backgroundColor = colorToHex(value);
            }
        }
    });

    // Add expand/collapse functionality for individual sections
    configPanel.querySelectorAll('.config-section h3').forEach(h3 => {
        h3.addEventListener('click', () => {
            const content = h3.nextElementSibling;
            if (content && content.classList.contains('config-content')) {
                content.classList.toggle('collapsed');
            }
        });
    });

    // Collapse/Expand All Sections
    toggleAllSectionsButton.addEventListener('click', () => {
        const allConfigContents = configPanel.querySelectorAll('.config-content');
        const isAnyCollapsed = Array.from(allConfigContents).some(content => content.classList.contains('collapsed'));

        allConfigContents.forEach(content => {
            if (isAnyCollapsed) {
                content.classList.remove('collapsed'); // Expand all
            } else {
                content.classList.add('collapsed'); // Collapse all
            }
        });
    });

    function colorToHex(color) {
        if (color.startsWith('#')) return color;
        if (color.startsWith('rgb')) {
            const parts = color.match(/\d+/g);
            if (parts) {
                const r = parseInt(parts[0]).toString(16).padStart(2, '0');
                const g = parseInt(parts[1]).toString(16).padStart(2, '0');
                const b = parseInt(parts[2]).toString(16).padStart(2, '0');
                return `#${r}${g}${b}`;
            }
        }
        return '#000000'; // Fallback for unknown formats
    }

    // Helper to convert any color format to RGB array [r, g, b]
    function toRgb(color) {
        if (color.startsWith('#')) {
            const hex = color.slice(1);
            return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
        } else if (color.startsWith('rgb')) {
            const parts = color.match(/\d+/g);
            return parts ? [parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2])] : [0, 0, 0];
        }
        return [0, 0, 0]; // Default to black
    }

    // Calculate relative luminance
    function getLuminance(color) {
        const rgb = toRgb(color).map(c => {
            c /= 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    }

    // Calculate contrast ratio
    function getContrastRatio(color1, color2) {
        const lum1 = getLuminance(color1);
        const lum2 = getLuminance(color2);
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        return (brightest + 0.05) / (darkest + 0.05);
    }

    // Get contrasting text color (black or white)
    function getContrastingTextColor(backgroundColor) {
        const luminance = getLuminance(backgroundColor);
        return luminance > 0.179 ? '#000000' : '#FFFFFF'; // WCAG threshold for text on background
    }

    fetchThemeButton.addEventListener('click', async () => {
        const rawUrl = cssUrlInput.value;
        if (!rawUrl) {
            themeStatus.textContent = 'Please enter a CSS URL.';
            return;
        }

        themeStatus.textContent = 'Downloading CSS via server...';
        try {
            // Call the PHP script to download the CSS
            const phpResponse = await fetch(`./download_css.php?url=${encodeURIComponent(rawUrl)}`);
            const phpResult = await phpResponse.text();
            console.log('PHP Script Response:', phpResult);

            if (phpResponse.ok && phpResult.includes('CSS file saved successfully')) {
                themeStatus.textContent = 'CSS downloaded. Applying theme...';
                // Now fetch the locally saved CSS file
                const response = await fetch('./css/mojohealthmentor-styles.css');
                if (!response.ok) {
                    throw new Error('Failed to fetch local CSS file.');
                }
                const cssText = await response.text();

                const colorRegex = /(#(?:[0-9a-f]{3}){1,2}|(rgb|hsl)a?\([^)]+\))/ig;
                const colors = cssText.match(colorRegex) || [];

                const uniqueColors = [...new Set(colors)];
                chatbotConfig.availableThemeColors = uniqueColors;
                populateColorOptions(uniqueColors);

                if (colors.length === 0) {
                    themeStatus.textContent = 'No colors found in the CSS file.';
                    return;
                }

                const colorCounts = colors.reduce((acc, color) => {
                    acc[color] = (acc[color] || 0) + 1;
                    return acc;
                }, {});

                const sortedColors = Object.keys(colorCounts).sort((a, b) => colorCounts[b] - colorCounts[a]);

                let primaryColor = sortedColors[0];
                let secondaryColor = sortedColors[1] || '#000000'; // Fallback if only one color

                // Ensure primary and secondary colors are distinct enough for accents
                if (getContrastRatio(primaryColor, secondaryColor) < 3) { // Lower threshold for accent distinction
                    secondaryColor = getContrastingTextColor(primaryColor); // Use contrasting black/white for accent if not distinct
                }

                // Function to set color and update config
                const setColor = (elementId, configPath, colorValue) => {
                    const inputElement = document.getElementById(elementId);
                    if (inputElement) {
                        inputElement.value = colorToHex(colorValue);
                        updateConfig(configPath, colorValue);
                        const displayTile = document.getElementById(elementId + '-display');
                        if (displayTile) {
                            console.log(`setColor: ${elementId}, Value: ${colorValue}, Hex: ${colorToHex(colorValue)}`);
                            displayTile.style.backgroundColor = colorToHex(colorValue);
                        }
                    }
                };

                // Apply primary color to main backgrounds
                setColor('chatWindow-backgroundColor', 'theme.chatWindow.backgroundColor', primaryColor);
                setColor('disclaimer-backgroundColor', 'theme.disclaimer.backgroundColor', primaryColor);
                setColor('tooltip-backgroundColor', 'theme.tooltip.tooltipBackgroundColor', primaryColor);
                setColor('textInput-backgroundColor', 'theme.chatWindow.textInput.backgroundColor', primaryColor);

                // Apply secondary color to button backgrounds and accents
                setColor('button-backgroundColor', 'theme.button.backgroundColor', secondaryColor);
                setColor('textInput-sendButtonColor', 'theme.chatWindow.textInput.sendButtonColor', secondaryColor);
                setColor('feedback-color', 'theme.chatWindow.feedback.color', secondaryColor);
                setColor('disclaimer-buttonColor', 'theme.disclaimer.buttonColor', secondaryColor);

                // Determine contrasting text colors for various elements
                const chatWindowTextColor = getContrastingTextColor(primaryColor);
                const buttonIconColor = getContrastingTextColor(secondaryColor);
                const disclaimerButtonTextColor = getContrastingTextColor(secondaryColor);

                // Apply contrasting text colors
                setColor('botMessage-textColor', 'theme.chatWindow.botMessage.textColor', chatWindowTextColor);
                setColor('userMessage-textColor', 'theme.chatWindow.userMessage.textColor', chatWindowTextColor);
                setColor('disclaimer-textColor', 'theme.disclaimer.textColor', chatWindowTextColor);
                setColor('tooltip-textColor', 'theme.tooltip.tooltipTextColor', chatWindowTextColor);
                setColor('footer-textColor', 'theme.chatWindow.footer.textColor', chatWindowTextColor);
                setColor('textInput-textColor', 'theme.chatWindow.textInput.textColor', chatWindowTextColor);
                setColor('button-iconColor', 'theme.button.iconColor', buttonIconColor);
                setColor('disclaimer-buttonTextColor', 'theme.disclaimer.buttonTextColor', disclaimerButtonTextColor);

                // Generate blurred background color for disclaimer
                const blurredColor = primaryColor.startsWith('#') ? primaryColor + '80' : primaryColor.replace('rgb(', 'rgba(').replace(')', ', 0.5)');
                setColor('disclaimer-blurredBackgroundColor', 'theme.disclaimer.blurredBackgroundColor', blurredColor);

                // Chat Window Title Bar Color (via custom CSS)
                const titleTextColor = getContrastingTextColor(primaryColor);
                const customCss = `
                    .flowise-chat-window--header {
                        background-color: ${primaryColor} !important;
                    }
                    .flowise-chat-window--header .flowise-chat-window--title {
                        color: ${titleTextColor} !important;
                    }
                `;
                updateConfig('theme.customCSS', customCss);

                themeStatus.textContent = 'Theme applied successfully!';
            } else {
                themeStatus.textContent = `Error downloading CSS: ${phpResult}`;
            }

        } catch (error) {
            themeStatus.textContent = `Error: ${error.message}`;
        }
    });

    function populateColorOptions(colors) {
        document.querySelectorAll('.color-palette').forEach(paletteDiv => {
            paletteDiv.innerHTML = ''; // Clear existing swatches
            const inputElementId = paletteDiv.id.replace('-palette', '');
            const inputElement = document.getElementById(inputElementId); // Get the associated text input

            colors.forEach(color => {
                const swatch = document.createElement('div');
                swatch.classList.add('color-swatch');
                swatch.style.backgroundColor = colorToHex(color);
                swatch.title = color; // Show color value on hover

                swatch.addEventListener('click', () => {
                    if (inputElement && inputElement.dataset.path) {
                        inputElement.value = color;
                        updateConfig(inputElement.dataset.path, color);
                        const displayTile = document.getElementById(inputElement.id + '-display');
                        if (displayTile) {
                            displayTile.style.backgroundColor = colorToHex(color);
                        }
                        const colorPicker = document.getElementById(inputElement.id + '-picker');
                        if (colorPicker) {
                            colorPicker.value = colorToHex(color);
                        }
                    }
                });
                paletteDiv.appendChild(swatch);
            });
        });
    }

    // Initialize color display tiles and add click listeners for color pickers on page load
    document.querySelectorAll('input[id$="-backgroundColor"], input[id$="-textColor"], input[id="button-iconColor"], input[id="feedback-color"]').forEach(inputElement => {
        console.log('Processing inputElement:', inputElement); // Log the actual element
        console.log('Processing inputElement.id:', inputElement.id);
        const displayTile = document.getElementById(inputElement.id + '-display');
        const colorPicker = document.getElementById(inputElement.id + '-picker');

        console.log('  displayTile found:', !!displayTile);
        console.log('  colorPicker found:', !!colorPicker);

        if (displayTile) {
            console.log(`Page load: ${inputElement.id}, Value: ${inputElement.value}, Hex: ${colorToHex(inputElement.value)}`);
            displayTile.style.backgroundColor = colorToHex(inputElement.value);

            displayTile.addEventListener('click', () => {
                console.log('Display tile clicked for:', inputElement.id);
                if (colorPicker) {
                    colorPicker.click(); // Open the native color picker
                } else {
                    console.error('Color picker not found for:', inputElement.id);
                }
            });
        } else {
            console.error('Display tile not found for:', inputElement.id);
        }

        if (colorPicker) {
            colorPicker.addEventListener('input', (event) => {
                const newColor = event.target.value;
                inputElement.value = newColor; // Update the text input with the new color
                updateConfig(inputElement.dataset.path, newColor); // Update the chatbot config
                if (displayTile) {
                    displayTile.style.backgroundColor = newColor; // Update the display tile
                }
            });
        }
    });

    // Preset functions
    

    async function saveCurrentConfigAsPreset(presetName) {
        const deviceName = deviceNameInput.value;
        if (!deviceName) {
            alert('Please enter a Device Name to save the preset.');
            return;
        }

        try {
            const response = await fetch('./presets_api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    deviceName: deviceName,
                    presetName: presetName,
                    config: chatbotConfig,
                    hidden: false
                }),
            });
            const result = await response.json();
            if (response.ok) {
                alert(`Preset \'${presetName}\' saved successfully!`);
                renderPresetsList();
            } else {
                alert(`Error saving preset: ${result.error}`);
            }
        } catch (error) {
            console.error('Error saving preset:', error);
            alert('Failed to save preset due to a network error.');
        }
    }

    async function loadPresetConfig(deviceName, presetName) {
        try {
            const response = await fetch('./presets_api.php');
            const allPresets = await response.json();
            
            if (response.ok) {
                const devicePresets = allPresets[deviceName];
                if (devicePresets) {
                    const presetToLoad = devicePresets.find(p => p.presetName === presetName);
                    if (presetToLoad) {
                        chatbotConfig = JSON.parse(JSON.stringify(presetToLoad.config)); // Deep copy
                        initChatbot(chatbotConfig);
                        // Update all input fields with the loaded config values
                        for (const key in chatbotConfig.theme) {
                            if (typeof chatbotConfig.theme[key] === 'object' && chatbotConfig.theme[key] !== null) {
                                for (const subKey in chatbotConfig.theme[key]) {
                                    const elementId = `${key}-${subKey}`;
                                    const inputElement = document.getElementById(elementId);
                                    if (inputElement) {
                                        if (inputElement.type === 'checkbox') {
                                            inputElement.checked = chatbotConfig.theme[key][subKey];
                                        } else {
                                            inputElement.value = chatbotConfig.theme[key][subKey];
                                        }
                                        // Update display tile if it exists
                                        const displayTile = document.getElementById(elementId + '-display');
                                        if (displayTile && (elementId.includes('Color') || elementId.includes('color'))) {
                                            displayTile.style.backgroundColor = colorToHex(inputElement.value);
                                        }
                                    }
                                }
                            }
                        }
                        alert(`Preset '${presetName}' from '${deviceName}' loaded successfully!`);
                    } else {
                        alert(`Preset '${presetName}' not found for device '${deviceName}'.`);
                    }
                } else {
                    alert(`No presets found for device '${deviceName}'.`);
                }
            } else {
                alert(`Error loading presets: ${allPresets.error}`);
            }
        } catch (error) {
            console.error('Error loading preset:', error);
            alert('Failed to load preset due to a network error.');
        }
    }

    async function deletePreset(deviceName, presetName) {
        try {
            const response = await fetch('./presets_api.php');
            const allPresets = await response.json();

            if (response.ok) {
                if (allPresets[deviceName]) {
                    const presetIndex = allPresets[deviceName].findIndex(p => p.presetName === presetName);
                    if (presetIndex !== -1) {
                        allPresets[deviceName][presetIndex].hidden = true;

                        const saveResponse = await fetch('./presets_api.php', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(allPresets),
                        });
                        const saveResult = await saveResponse.json();

                        if (saveResponse.ok) {
                            alert(`Preset '${presetName}' from '${deviceName}' deleted.`);
                            renderPresetsList();
                        } else {
                            alert(`Error saving updated presets: ${saveResult.error}`);
                        }
                    } else {
                        alert(`Preset '${presetName}' not found for device '${deviceName}'.`);
                    }
                } else {
                    alert(`No presets found for device '${deviceName}'.`);
                }
            } else {
                alert(`Error fetching presets: ${allPresets.error}`);
            }
        } catch (error) {
            console.error('Error deleting preset:', error);
            alert('Failed to delete preset due to a network error.');
        }
    }

    async function renderPresetsList() {
        presetsListDiv.innerHTML = '';
        try {
            const response = await fetch('./presets_api.php');
            const presetsByDevice = await response.json();

            if (response.ok) {
                for (const deviceName in presetsByDevice) {
                    const devicePresets = presetsByDevice[deviceName];
                    if (devicePresets.length > 0) {
                        const deviceHeader = document.createElement('h4');
                        deviceHeader.textContent = `Device: ${deviceName}`;
                        presetsListDiv.appendChild(deviceHeader);

                        devicePresets.forEach(preset => {
                            if (preset.hidden !== true) { // Only show non-hidden presets
                                const presetDiv = document.createElement('div');
                                presetDiv.classList.add('preset-item');
                                const date = new Date(preset.timestamp * 1000);
                                presetDiv.innerHTML = `
                                    <span>${preset.presetName} (${date.toLocaleString()})</span>
                                    <button class="load-preset" data-device-name="${deviceName}" data-preset-name="${preset.presetName}">Load</button>
                                    <button class="delete-preset" data-device-name="${deviceName}" data-preset-name="${preset.presetName}">Delete</button>
                                `;
                                presetsListDiv.appendChild(presetDiv);
                            }
                        });
                    }
                }
            } else {
                presetsListDiv.innerHTML = `<p>Error loading presets: ${presetsByDevice.error}</p>`;
            }
        } catch (error) {
            console.error('Error rendering presets list:', error);
            presetsListDiv.innerHTML = '<p>Failed to load presets due to a network error.</p>';
        }

        // Add event listeners to new buttons
        presetsListDiv.querySelectorAll('.load-preset').forEach(button => {
            button.addEventListener('click', (event) => {
                const deviceName = event.target.dataset.deviceName;
                const presetName = event.target.dataset.presetName;
                loadPresetConfig(deviceName, presetName);
            });
        });

        presetsListDiv.querySelectorAll('.delete-preset').forEach(button => {
            button.addEventListener('click', (event) => {
                const deviceName = event.target.dataset.deviceName;
                const presetName = event.target.dataset.presetName;
                if (confirm(`Are you sure you want to delete preset '${presetName}' from device '${deviceName}'?`)) {
                    deletePreset(deviceName, presetName);
                }
            });
        });
    }

    // Toggle Presets Panel
    togglePresetsPanelButton.addEventListener('click', () => {
        presetsListDiv.classList.toggle('collapsed');
    });

    // Save Preset Button
    savePresetButton.addEventListener('click', () => {
        const presetName = prompt('Enter a name for the preset:');
        if (presetName) {
            saveCurrentConfigAsPreset(presetName);
        }
    });

    // Initialize color display tiles and add click listeners for color pickers on page load
    document.querySelectorAll('input[id$="-backgroundColor"], input[id$="-textColor"], input[id="button-iconColor"], input[id="feedback-color"]').forEach(inputElement => {
        console.log('Processing inputElement:', inputElement); // Log the actual element
        console.log('Processing inputElement.id:', inputElement.id);
        const displayTile = document.getElementById(inputElement.id + '-display');
        const colorPicker = document.getElementById(inputElement.id + '-picker');

        console.log('  displayTile found:', !!displayTile);
        console.log('  colorPicker found:', !!colorPicker);

        if (displayTile) {
            console.log(`Page load: ${inputElement.id}, Value: ${inputElement.value}, Hex: ${colorToHex(inputElement.value)}`);
            displayTile.style.backgroundColor = colorToHex(inputElement.value);

            displayTile.addEventListener('click', () => {
                console.log('Display tile clicked for:', inputElement.id);
                if (colorPicker) {
                    colorPicker.click(); // Open the native color picker
                } else {
                    console.error('Color picker not found for:', inputElement.id);
                }
            });
        } else {
            console.error('Display tile not found for:', inputElement.id);
        }

        if (colorPicker) {
            colorPicker.addEventListener('input', (event) => {
                const newColor = event.target.value;
                inputElement.value = newColor; // Update the text input with the new color
                updateConfig(inputElement.dataset.path, newColor); // Update the chatbot config
                if (displayTile) {
                    displayTile.style.backgroundColor = newColor; // Update the display tile
                }
            });
        }
    });

    // Load the flowise-embed script dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/flowise-embed/dist/web.js';
    script.type = 'module';
    script.onload = async () => {
        syncConfigFromInputs(); // Populate chatbotConfig from initial input values
        initChatbot(chatbotConfig); // Initialize with the default configuration
        await renderPresetsList(); // Render presets on load
    };
    document.body.appendChild(script);
});