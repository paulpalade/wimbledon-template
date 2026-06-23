// Configuration
const CONFIG = {
    EXPORT_WIDTH: 3840,
    EXPORT_HEIGHT: 2160,
    PREVIEW_ASPECT_RATIO: 16 / 9,
    
    // Asset paths
    BACKGROUND_IMAGE: 'assets/background.png',
    TOURNAMENTS_JSON: 'tournaments.json',
    
    // Font paths
    FONTS: {
        light: 'assets/fonts/IBMPlexSans-Light.ttf',
        regular: 'assets/fonts/IBMPlexSans-Regular.ttf',
        semibold: 'assets/fonts/IBMPlexSans-SemiBold.ttf'
    },
    
    // Tournament configurations (loaded from JSON)
    TOURNAMENTS: {},

    //8A3FFC. D2A106
    
    // Layout configuration for image positioning
    LAYOUT: {
        title: { x: 1920, y: 187, fontSize: 51, color: '#000000', align: 'center', baseline: 'middle', font: 'light' },
        imageA: { x: 227, y: 595, width: 1022, height: 1022, strokeColor: '#8A3FFC', strokeWidth: 20 },
        imageB: { x: 2602, y: 595, width: 1022, height: 1022, strokeColor: '#D2A106', strokeWidth: 20},
        playerNameA: { x: 732, y: 1941, fontSize: 90, color: '#000000', align: 'center', baseline: 'middle', font: 'light' },
        playerCountryA: { x: 732, y: 2024, fontSize: 34, color: '#000000', align: 'center', baseline: 'middle', font: 'regular' },
        playerNameB: { x: 3105, y: 1941, fontSize: 90, color: '#000000', align: 'center', baseline: 'middle', font: 'light' },
        playerCountryB: { x: 3105, y: 2024, fontSize: 34, color: '#000000', align: 'center', baseline: 'middle', font: 'regular' },
        text: { x: 1910, y: 1120, fontSize: 218,  align: 'center', baseline: 'middle', font: 'regular', letterSpacing: -10},
        characterPercent: { x: 2035, y: 1145, fontSize: 128,  align: 'left', baseline: 'middle', font: 'light' },
        arc: { x: 1920, y: 1102, radius: 346, strokeWidth: 36 },
        triangle: { size: 90, offsetX: 430, cornerRadius: 7 }
    }
};

// State management
const state = {
    tournamentType: 'men',
    selectedImageA: null,
    selectedImageB: null,
    selectedPlayerA: null,
    selectedPlayerB: null,
    numericValue: 50,
    winner: 'left',
    loadedImages: {},
    fontsLoaded: false,
    tournamentsLoaded: false,
    isInitializing: true,
    dropdownOptions: {
        a: [],
        b: []
    }
};

// DOM elements
const elements = {
    tournamentType: document.getElementById('tournament-type'),
    dropdownA: document.getElementById('dropdown-a'),
    dropdownB: document.getElementById('dropdown-b'),
    dropdownAInput: document.getElementById('dropdown-a-input'),
    dropdownBInput: document.getElementById('dropdown-b-input'),
    dropdownAList: document.getElementById('dropdown-a-list'),
    dropdownBList: document.getElementById('dropdown-b-list'),
    dropdownAContainer: document.querySelector('[data-dropdown="a"]'),
    dropdownBContainer: document.querySelector('[data-dropdown="b"]'),
    winnerSelect: document.getElementById('winner-select'),
    numericInput: document.getElementById('numeric-input'),
    renderBtn: document.getElementById('render-btn'),
    previewCanvas: document.getElementById('preview-canvas'),
    exportCanvas: document.getElementById('export-canvas')
};

// Initialize the application
async function init() {
    await loadTournaments();
    loadFonts();
    populateDropdowns();
    setupEventListeners();
    preloadImages();
    // Don't call updatePreview here - let it be called after fonts and images load
}

// Load tournaments data from JSON file
async function loadTournaments() {
    try {
        const response = await fetch(CONFIG.TOURNAMENTS_JSON);
        if (!response.ok) {
            throw new Error(`Failed to load tournaments: ${response.status} ${response.statusText}`);
        }
        CONFIG.TOURNAMENTS = await response.json();
        state.tournamentsLoaded = true;
        console.log('✓ Tournaments data loaded');
    } catch (error) {
        console.error('Failed to load tournaments data:', error);
        alert('Failed to load tournament data. Please check that tournaments.json exists and is valid.');
        // Set empty tournaments to prevent errors
        CONFIG.TOURNAMENTS = { men: { title: '', players: [] }, women: { title: '', players: [] } };
        state.tournamentsLoaded = true;
    }
}

// Load custom fonts
async function loadFonts() {
    try {
        const fontLight = new FontFace('IBM Plex Sans', `url(${CONFIG.FONTS.light})`, { weight: '300' });
        const fontRegular = new FontFace('IBM Plex Sans', `url(${CONFIG.FONTS.regular})`, { weight: '400' });
        const fontSemibold = new FontFace('IBM Plex Sans', `url(${CONFIG.FONTS.semibold})`, { weight: '600' });
        
        await fontLight.load();
        await fontRegular.load();
        await fontSemibold.load();
        
        document.fonts.add(fontLight);
        document.fonts.add(fontRegular);
        document.fonts.add(fontSemibold);
        
        state.fontsLoaded = true;
        console.log('✓ Custom fonts loaded');
        checkInitializationComplete();
    } catch (error) {
        console.warn('Failed to load custom fonts, using fallback:', error);
        state.fontsLoaded = true; // Continue anyway with fallback fonts
        checkInitializationComplete();
    }
}

// Populate dropdown menus based on tournament type
function populateDropdowns() {
    const tournament = CONFIG.TOURNAMENTS[state.tournamentType];
    const players = tournament.players.map(player => ({
        value: player.id || player.name,
        name: player.name,
        country: player.country,
        path: player.image
    }));

    state.dropdownOptions.a = players;
    state.dropdownOptions.b = players;

    if (players.length >= 2) {
        selectDropdownPlayer('a', players[0].value);
        selectDropdownPlayer('b', players[1].value);
    } else if (players.length === 1) {
        selectDropdownPlayer('a', players[0].value);
        selectDropdownPlayer('b', players[0].value);
    } else {
        clearDropdownSelection('a');
        clearDropdownSelection('b');
    }

    renderFilterableDropdown('a');
    renderFilterableDropdown('b');
}

// Setup event listeners
function setupEventListeners() {
    // Tournament type change
    elements.tournamentType.addEventListener('change', (e) => {
        state.tournamentType = e.target.value;
        populateDropdowns();
        preloadImages();
        validateAndUpdateNumericValue();
        updatePreview();
    });

    setupFilterableDropdownEvents('a');
    setupFilterableDropdownEvents('b');
    
    elements.winnerSelect.addEventListener('change', (e) => {
        state.winner = e.target.value || null;
        validateAndUpdateNumericValue();
        updatePreview();
    });
    
    // Update state on input but don't validate yet (allow free typing)
    elements.numericInput.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value)) {
            state.numericValue = value;
        }
    });
    
    // Validate and render on Enter key press
    elements.numericInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            validateAndUpdateNumericValue();
            updatePreview();
            elements.numericInput.blur(); // Remove focus after Enter
        }
    });
    
    // Validate on blur (focus out) but don't render
    elements.numericInput.addEventListener('blur', () => {
        console.log("Focus out");
        validateAndUpdateNumericValue();
        updatePreview();
    });
    
    elements.renderBtn.addEventListener('click', () => {
        validateAndUpdateNumericValue();
        exportPNG();
    });
    
    // Handle window resize for responsive preview
    window.addEventListener('resize', updatePreview);

    document.addEventListener('click', (event) => {
        if (!elements.dropdownAContainer.contains(event.target)) {
            closeDropdown('a');
        }
        if (!elements.dropdownBContainer.contains(event.target)) {
            closeDropdown('b');
        }
    });
}

// Validate and update numeric input value
function validateAndUpdateNumericValue() {
    let value = parseInt(elements.numericInput.value);
    if (isNaN(value)) {
        value = 50; // Default value
    }
    // No clamping - accept any value
    let clampValue =Math.max(50, Math.min(value, 99));
    elements.numericInput.value = clampValue;
    state.numericValue = clampValue;
}

// Preload images for better performance
function getDropdownElements(key) {
    return key === 'a'
        ? {
            hiddenInput: elements.dropdownA,
            textInput: elements.dropdownAInput,
            list: elements.dropdownAList,
            container: elements.dropdownAContainer
        }
        : {
            hiddenInput: elements.dropdownB,
            textInput: elements.dropdownBInput,
            list: elements.dropdownBList,
            container: elements.dropdownBContainer
        };
}

function setupFilterableDropdownEvents(key) {
    const { textInput, container } = getDropdownElements(key);
    const toggleButton = container.querySelector('.filterable-dropdown__toggle');

    textInput.addEventListener('focus', () => {
        openDropdown(key);
    });

    textInput.addEventListener('input', (e) => {
        openDropdown(key, false);
        renderFilterableDropdown(key, e.target.value);
    });

    textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDropdown(key);
            textInput.blur();
        }
    });

    toggleButton.addEventListener('click', () => {
        const isOpen = container.classList.contains('filterable-dropdown--open');
        if (isOpen) {
            closeDropdown(key);
        } else {
            openDropdown(key);
            textInput.focus();
        }
    });
}

function renderFilterableDropdown(key, filterText = '') {
    const { list, textInput, hiddenInput } = getDropdownElements(key);
    const normalizedFilter = filterText.trim().toLowerCase();
    const options = state.dropdownOptions[key].filter(option =>
        option.name.toLowerCase().includes(normalizedFilter)
    );

    list.innerHTML = '';

    if (options.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.className = 'filterable-dropdown__item filterable-dropdown__item--empty';
        emptyItem.textContent = 'No players found';
        list.appendChild(emptyItem);
        return;
    }

    options.forEach(option => {
        const item = document.createElement('li');
        item.className = 'filterable-dropdown__item';
        item.textContent = option.name;
        item.setAttribute('role', 'option');
        item.dataset.value = option.value;

        if (hiddenInput.value === option.value) {
            item.classList.add('filterable-dropdown__item--selected');
            item.setAttribute('aria-selected', 'true');
        }

        item.addEventListener('mousedown', (event) => {
            event.preventDefault();
            selectDropdownPlayer(key, option.value);
            closeDropdown(key);
            validateAndUpdateNumericValue();
            updatePreview();
        });

        list.appendChild(item);
    });

    if (!document.activeElement || document.activeElement !== textInput) {
        const selectedOption = state.dropdownOptions[key].find(option => option.value === hiddenInput.value);
        textInput.value = selectedOption ? selectedOption.name : '';
    }
}

function selectDropdownPlayer(key, value) {
    const { hiddenInput, textInput } = getDropdownElements(key);
    const selectedOption = state.dropdownOptions[key].find(option => option.value === value);

    hiddenInput.value = selectedOption ? selectedOption.value : '';

    if (selectedOption) {
        textInput.value = selectedOption.name;
    } else {
        textInput.value = '';
    }

    if (key === 'a') {
        state.selectedImageA = selectedOption ? selectedOption.path : null;
        state.selectedPlayerA = selectedOption ? {
            name: selectedOption.name,
            country: selectedOption.country
        } : null;
    } else {
        state.selectedImageB = selectedOption ? selectedOption.path : null;
        state.selectedPlayerB = selectedOption ? {
            name: selectedOption.name,
            country: selectedOption.country
        } : null;
    }

    renderFilterableDropdown(key, textInput.value);
}

function clearDropdownSelection(key) {
    selectDropdownPlayer(key, '');
}

function openDropdown(key, resetFilter = true) {
    const { container, textInput } = getDropdownElements(key);
    container.classList.add('filterable-dropdown--open');
    textInput.setAttribute('aria-expanded', 'true');

    if (resetFilter) {
        textInput.value = '';
    }

    renderFilterableDropdown(key, textInput.value);
}

function closeDropdown(key) {
    const { container, textInput, hiddenInput } = getDropdownElements(key);
    container.classList.remove('filterable-dropdown--open');
    textInput.setAttribute('aria-expanded', 'false');

    const selectedOption = state.dropdownOptions[key].find(option => option.value === hiddenInput.value);
    textInput.value = selectedOption ? selectedOption.name : '';
}

function preloadImages() {
    // Only preload the background image
    const imagesToLoad = [CONFIG.BACKGROUND_IMAGE];
    
    let loadedCount = 0;
    const totalImages = imagesToLoad.length;
    
    imagesToLoad.forEach(path => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        // Add cache-busting timestamp to preloaded images
        img.src = `${path}?t=${Date.now()}`;
        img.onload = () => {
            state.loadedImages[path] = img;
            loadedCount++;
            if (loadedCount === totalImages) {
                checkInitializationComplete();
            }
        };
        img.onerror = () => {
            console.warn(`Failed to load image: ${path}`);
            loadedCount++;
            if (loadedCount === totalImages) {
                checkInitializationComplete();
            }
        };
    });
}

// Check if initialization is complete and render once
function checkInitializationComplete() {
    if (state.isInitializing && state.fontsLoaded && state.tournamentsLoaded && Object.keys(state.loadedImages).length > 0) {
        state.isInitializing = false;
        updatePreview();
    }
}

// Load an image and return a promise
function loadImage(src) {
    // Check if image is already loaded in cache
    if (state.loadedImages[src]) {
        return Promise.resolve(state.loadedImages[src]);
    }
    
    return new Promise((resolve, reject) => {
        // Add cache-busting timestamp to all images to ensure updates are reflected
        const cacheBustSrc = `${src}?t=${Date.now()}`;
        
        const img = new Image();
        // Set crossOrigin to avoid CORS issues
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            state.loadedImages[src] = img;
            resolve(img);
        };
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        img.src = cacheBustSrc;
    });
}

// Update preview canvas
async function updatePreview() {
    const canvas = elements.previewCanvas;
    const ctx = canvas.getContext('2d');
    
    // Calculate preview dimensions maintaining 16:9 aspect ratio
    const containerWidth = canvas.parentElement.clientWidth;
    const previewWidth = containerWidth;
    const previewHeight = previewWidth / CONFIG.PREVIEW_ASPECT_RATIO;
    
    canvas.width = previewWidth;
    canvas.height = previewHeight;
    
    // Calculate scale factor
    const scale = previewWidth / CONFIG.EXPORT_WIDTH;
    
    // Clear canvas
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    try {
        // Draw background
        const bgImage = await loadImage(CONFIG.BACKGROUND_IMAGE);
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    } catch (error) {
        console.warn('Background image not loaded:', error.message);
        // Draw placeholder background
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Draw Player 1 (Image A) with circle mask and stroke
    if (state.selectedImageA) {
        try {
            const imgA = await loadImage(state.selectedImageA);
            const layout = CONFIG.LAYOUT.imageA;
            drawCircularImage(ctx, imgA, layout, scale, layout.strokeColor, layout.strokeWidth);
        } catch (error) {
            console.warn('Image A not loaded:', error.message);
            drawPlaceholder(ctx, CONFIG.LAYOUT.imageA, scale, '1');
        }
    } else {
        drawPlaceholder(ctx, CONFIG.LAYOUT.imageA, scale, '1');
    }
    
    // Draw Player 2 (Image B) with circle mask and stroke
    if (state.selectedImageB) {
        try {
            const imgB = await loadImage(state.selectedImageB);
            const layout = CONFIG.LAYOUT.imageB;
            drawCircularImage(ctx, imgB, layout, scale, layout.strokeColor, layout.strokeWidth);
        } catch (error) {
            console.warn('Image B not loaded:', error.message);
            drawPlaceholder(ctx, CONFIG.LAYOUT.imageB, scale, '2');
        }
    } else {
        drawPlaceholder(ctx, CONFIG.LAYOUT.imageB, scale, '2');
    }
    
    // Draw title text
    const tournament = CONFIG.TOURNAMENTS[state.tournamentType];
    const titleLayout = CONFIG.LAYOUT.title;
    const fontFamily = state.fontsLoaded ? 'IBM Plex Sans' : 'Arial';
    
    // Get font weight from layout config (handle both 'light' and 'IBMPlexSans-Light.ttf' formats)
    const titleFontValue = titleLayout.font || 'regular';
    const titleWeight = titleFontValue.includes('Light') || titleFontValue === 'light' ? '300' :
                        titleFontValue.includes('SemiBold') || titleFontValue === 'semibold' ? '600' : '400';
    
    ctx.font = `${titleWeight} ${titleLayout.fontSize * scale}px ${fontFamily}, sans-serif`;
    ctx.fillStyle = titleLayout.color;
    ctx.textAlign = titleLayout.align;
    ctx.textBaseline = titleLayout.baseline;
    ctx.fillText(
        tournament.title,
        titleLayout.x * scale,
        titleLayout.y * scale
    );
    
    // Draw player names and countries
    if (state.selectedPlayerA) {
        const nameLayout = CONFIG.LAYOUT.playerNameA;
        const countryLayout = CONFIG.LAYOUT.playerCountryA;
        
        // Get font weight from layout config
        const nameWeight = nameLayout.font === 'light' ? '300' : nameLayout.font === 'semibold' ? '600' : '400';
        const countryWeight = countryLayout.font === 'light' ? '300' : countryLayout.font === 'semibold' ? '600' : '400';
        
        ctx.font = `${nameWeight} ${nameLayout.fontSize * scale}px ${fontFamily}, sans-serif`;
        ctx.fillStyle = nameLayout.color;
        ctx.textAlign = nameLayout.align;
        ctx.textBaseline = nameLayout.baseline;
        ctx.fillText(state.selectedPlayerA.name, nameLayout.x * scale, nameLayout.y * scale);
        
        ctx.font = `${countryWeight} ${countryLayout.fontSize * scale}px ${fontFamily}, sans-serif`;
        ctx.fillStyle = countryLayout.color;
        ctx.textAlign = countryLayout.align;
        ctx.textBaseline = countryLayout.baseline;
        ctx.fillText(state.selectedPlayerA.country, countryLayout.x * scale, countryLayout.y * scale);
    }
    
    if (state.selectedPlayerB) {
        const nameLayout = CONFIG.LAYOUT.playerNameB;
        const countryLayout = CONFIG.LAYOUT.playerCountryB;
        
        // Get font weight from layout config
        const nameWeight = nameLayout.font === 'light' ? '300' : nameLayout.font === 'semibold' ? '600' : '400';
        const countryWeight = countryLayout.font === 'light' ? '300' : countryLayout.font === 'semibold' ? '600' : '400';
        
        ctx.font = `${nameWeight} ${nameLayout.fontSize * scale}px ${fontFamily}, sans-serif`;
        ctx.fillStyle = nameLayout.color;
        ctx.textAlign = nameLayout.align;
        ctx.textBaseline = nameLayout.baseline;
        ctx.fillText(state.selectedPlayerB.name, nameLayout.x * scale, nameLayout.y * scale);
        
        ctx.font = `${countryWeight} ${countryLayout.fontSize * scale}px ${fontFamily}, sans-serif`;
        ctx.fillStyle = countryLayout.color;
        ctx.textAlign = countryLayout.align;
        ctx.textBaseline = countryLayout.baseline;
        ctx.fillText(state.selectedPlayerB.country, countryLayout.x * scale, countryLayout.y * scale);
    }
    
    // Draw progress arc
    const arcLayout = CONFIG.LAYOUT.arc;
    const arcColor = state.winner === 'left' ? '#8A3FFC' : state.winner === 'right' ? '#D2A106' : '#D2A106';
    drawProgressArc(ctx, arcLayout, scale, 100, arcColor, state.winner, 0.25);
    drawProgressArc(ctx, arcLayout, scale, state.numericValue, arcColor, state.winner);
    
    // Draw numeric value text
    const textLayout = CONFIG.LAYOUT.text;
    // Get font weight from layout config
    const textWeight = textLayout.font === 'light' ? '300' : textLayout.font === 'semibold' ? '600' : '400';
    ctx.font = `${textWeight} ${textLayout.fontSize * scale}px ${fontFamily}, sans-serif`;
    ctx.fillStyle = arcColor;
    ctx.textAlign = textLayout.align;
    ctx.textBaseline = textLayout.baseline;
    // Apply letter spacing if defined
    if (textLayout.letterSpacing !== undefined) {
        ctx.letterSpacing = `${textLayout.letterSpacing * scale}px`;
    }
    ctx.fillText(
        state.numericValue || '0',
        textLayout.x * scale,
        textLayout.y * scale
    );
    // Reset letter spacing
    ctx.letterSpacing = '0px';
    // Draw percent character
    const textPercentLayout = CONFIG.LAYOUT.characterPercent;
    // Get font weight from layout config
    const percentWeight = textPercentLayout.font === 'light' ? '300' : textPercentLayout.font === 'semibold' ? '600' : '400';
    ctx.font = `${percentWeight} ${textPercentLayout.fontSize * scale}px ${fontFamily}, sans-serif`;
    ctx.fillStyle = arcColor;
    ctx.textAlign = textPercentLayout.align;
    ctx.textBaseline = textPercentLayout.baseline;
    ctx.fillText(
        '%',
        (state.numericValue==100? textPercentLayout.x+30:textPercentLayout.x) * scale,
        textPercentLayout.y * scale
    );

    
    // Draw winner triangle
    if (state.winner) {
        const triangleLayout = CONFIG.LAYOUT.triangle;
        const triangleX = state.winner === 'left'
            ? (textLayout.x - triangleLayout.offsetX) * scale
            : (textLayout.x + triangleLayout.offsetX) * scale;
        drawTriangle(ctx, triangleX, (textLayout.y-20) * scale, triangleLayout.size * scale, state.winner, arcColor, triangleLayout.cornerRadius * scale);
    }
}

// Draw circular image with stroke
function drawCircularImage(ctx, img, layout, scale, strokeColor, strokeWidth) {
    const centerX = (layout.x + layout.width / 2) * scale;
    const centerY = (layout.y + layout.height / 2) * scale;
    const radius = (layout.width / 2) * scale;
    
    ctx.save();
    
    // Draw white background circle first (for transparent images)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    
    // Create circular clipping path
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    
    // Calculate dimensions to fit by height while maintaining aspect ratio
    const imgAspectRatio = img.width / img.height;
    const circleHeight = layout.height * scale;
    const circleWidth = layout.width * scale;
    
    // Fit by height (image height matches circle diameter)
    let drawHeight = circleHeight;
    let drawWidth = drawHeight * imgAspectRatio;
    
    // Center the image horizontally if it's wider than the circle
    let drawX = centerX - drawWidth / 2;
    let drawY = centerY - drawHeight / 2;
    
    // Draw image with aspect ratio preserved, fitted by height
    ctx.drawImage(
        img,
        drawX,
        drawY,
        drawWidth,
        drawHeight
    );
    
    ctx.restore();
    
    // Draw stroke around circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth * scale;
    ctx.stroke();
}

// Draw progress arc
function drawProgressArc(ctx, layout, scale, value, color, winner, opacity = 1) {
    const centerX = layout.x * scale;
    const centerY = layout.y * scale;
    const radius = layout.radius * scale;
    const strokeWidth = layout.strokeWidth * scale;
    
    // Calculate arc angle based on percentage (0-100)
    const percentage = Math.max(0, Math.min(100, value)) / 100;
    const startAngle = -Math.PI / 2; // Start at top
    
    let endAngle;
    if (winner === 'right') {
        // For left winner: arc grows clockwise (to the right and down)
        endAngle = startAngle + (Math.PI * 2 * percentage);
    } else {
        // For right winner: arc grows counter-clockwise (to the left and down)
        endAngle = startAngle - (Math.PI * 2 * percentage);
    }
    
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle, winner !== 'right');
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
}

// Draw triangle indicator with rounded corners
function drawTriangle(ctx, x, y, size, direction, color, cornerRadius = 0) {
    ctx.save();
    ctx.fillStyle = color;
    
    if (cornerRadius > 0) {
        // Draw triangle with rounded corners
        ctx.beginPath();
        
        if (direction === 'left') {
            // Triangle pointing left with rounded corners
            const tipX = x;
            const tipY = y;
            const baseX = x + size;
            const topY = y - size / 2;
            const bottomY = y + size / 2;
            
            // Start from tip
            ctx.moveTo(tipX, tipY);
            // Line to top corner (with rounding)
            ctx.arcTo(baseX, topY, baseX, bottomY, cornerRadius);
            // Line to bottom corner (with rounding)
            ctx.arcTo(baseX, bottomY, tipX, tipY, cornerRadius);
            // Back to tip (with rounding)
            ctx.arcTo(tipX, tipY, baseX, topY, cornerRadius);
        } else {
            // Triangle pointing right with rounded corners
            const tipX = x;
            const tipY = y;
            const baseX = x - size;
            const topY = y - size / 2;
            const bottomY = y + size / 2;
            
            // Start from tip
            ctx.moveTo(tipX, tipY);
            // Line to top corner (with rounding)
            ctx.arcTo(baseX, topY, baseX, bottomY, cornerRadius);
            // Line to bottom corner (with rounding)
            ctx.arcTo(baseX, bottomY, tipX, tipY, cornerRadius);
            // Back to tip (with rounding)
            ctx.arcTo(tipX, tipY, baseX, topY, cornerRadius);
        }
        
        ctx.closePath();
        ctx.fill();
    } else {
        // Draw triangle without rounded corners (original behavior)
        ctx.beginPath();
        
        if (direction === 'left') {
            // Triangle pointing left
            ctx.moveTo(x, y);
            ctx.lineTo(x + size, y - size / 2);
            ctx.lineTo(x + size, y + size / 2);
        } else {
            // Triangle pointing right
            ctx.moveTo(x, y);
            ctx.lineTo(x - size, y - size / 2);
            ctx.lineTo(x - size, y + size / 2);
        }
        
        ctx.closePath();
        ctx.fill();
    }
    
    ctx.restore();
}

// Draw placeholder for missing images
function drawPlaceholder(ctx, layout, scale, label) {
    ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
    ctx.fillRect(
        layout.x * scale,
        layout.y * scale,
        layout.width * scale,
        layout.height * scale
    );
    
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;
    ctx.strokeRect(
        layout.x * scale,
        layout.y * scale,
        layout.width * scale,
        layout.height * scale
    );
    
    ctx.fillStyle = '#666';
    ctx.font = `${40 * scale}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
        `Image ${label}`,
        (layout.x + layout.width / 2) * scale,
        (layout.y + layout.height / 2) * scale
    );
}

// Export PNG at full resolution
async function exportPNG() {
    elements.renderBtn.disabled = true;
    elements.renderBtn.textContent = 'Rendering...';
    
    try {
        const canvas = elements.exportCanvas;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
            throw new Error('Could not get canvas context');
        }
        
        // Set export dimensions
        canvas.width = CONFIG.EXPORT_WIDTH;
        canvas.height = CONFIG.EXPORT_HEIGHT;
        
        // Clear canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        try {
            const bgImage = await loadImage(CONFIG.BACKGROUND_IMAGE);
            ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        } catch (error) {
            console.warn('Background image not available for export:', error.message);
            // Draw a default background
            ctx.fillStyle = '#2C3E50';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        // Draw Player 1 (Image A) with circle mask and stroke
        if (state.selectedImageA) {
            try {
                const imgA = await loadImage(state.selectedImageA);
                const layout = CONFIG.LAYOUT.imageA;
                drawCircularImage(ctx, imgA, layout, 1, layout.strokeColor, layout.strokeWidth);
            } catch (error) {
                console.warn('Image A not available for export:', error.message);
            }
        }
        
        // Draw Player 2 (Image B) with circle mask and stroke
        if (state.selectedImageB) {
            try {
                const imgB = await loadImage(state.selectedImageB);
                const layout = CONFIG.LAYOUT.imageB;
                drawCircularImage(ctx, imgB, layout, 1, layout.strokeColor, layout.strokeWidth);
            } catch (error) {
                console.warn('Image B not available for export:', error.message);
            }
        }
        
        // Draw title text
        const tournament = CONFIG.TOURNAMENTS[state.tournamentType];
        const titleLayout = CONFIG.LAYOUT.title;
        const fontFamily = state.fontsLoaded ? 'IBM Plex Sans' : 'Arial';
        
        // Get font weight from layout config (handle both 'light' and 'IBMPlexSans-Light.ttf' formats)
        const titleFontValue = titleLayout.font || 'regular';
        const titleWeight = titleFontValue.includes('Light') || titleFontValue === 'light' ? '300' :
                            titleFontValue.includes('SemiBold') || titleFontValue === 'semibold' ? '600' : '400';
        
        ctx.font = `${titleWeight} ${titleLayout.fontSize}px ${fontFamily}, sans-serif`;
        ctx.fillStyle = titleLayout.color;
        ctx.textAlign = titleLayout.align;
        ctx.textBaseline = titleLayout.baseline;
        ctx.fillText(tournament.title, titleLayout.x, titleLayout.y);
        
        // Draw player names and countries
        if (state.selectedPlayerA) {
            const nameLayout = CONFIG.LAYOUT.playerNameA;
            const countryLayout = CONFIG.LAYOUT.playerCountryA;
            
            // Get font weight from layout config
            const nameWeight = nameLayout.font === 'light' ? '300' : nameLayout.font === 'semibold' ? '600' : '400';
            const countryWeight = countryLayout.font === 'light' ? '300' : countryLayout.font === 'semibold' ? '600' : '400';
            
            ctx.font = `${nameWeight} ${nameLayout.fontSize}px ${fontFamily}, sans-serif`;
            ctx.fillStyle = nameLayout.color;
            ctx.textAlign = nameLayout.align;
            ctx.textBaseline = nameLayout.baseline;
            ctx.fillText(state.selectedPlayerA.name, nameLayout.x, nameLayout.y);
            
            ctx.font = `${countryWeight} ${countryLayout.fontSize}px ${fontFamily}, sans-serif`;
            ctx.fillStyle = countryLayout.color;
            ctx.textAlign = countryLayout.align;
            ctx.textBaseline = countryLayout.baseline;
            ctx.fillText(state.selectedPlayerA.country, countryLayout.x, countryLayout.y);
        }
        
        if (state.selectedPlayerB) {
            const nameLayout = CONFIG.LAYOUT.playerNameB;
            const countryLayout = CONFIG.LAYOUT.playerCountryB;
            
            // Get font weight from layout config
            const nameWeight = nameLayout.font === 'light' ? '300' : nameLayout.font === 'semibold' ? '600' : '400';
            const countryWeight = countryLayout.font === 'light' ? '300' : countryLayout.font === 'semibold' ? '600' : '400';
            
            ctx.font = `${nameWeight} ${nameLayout.fontSize}px ${fontFamily}, sans-serif`;
            ctx.fillStyle = nameLayout.color;
            ctx.textAlign = nameLayout.align;
            ctx.textBaseline = nameLayout.baseline;
            ctx.fillText(state.selectedPlayerB.name, nameLayout.x, nameLayout.y);
            
            ctx.font = `${countryWeight} ${countryLayout.fontSize}px ${fontFamily}, sans-serif`;
            ctx.fillStyle = countryLayout.color;
            ctx.textAlign = countryLayout.align;
            ctx.textBaseline = countryLayout.baseline;
            ctx.fillText(state.selectedPlayerB.country, countryLayout.x, countryLayout.y);
        }
        
        // Draw progress arc
        const arcLayout = CONFIG.LAYOUT.arc;
        const arcColor = state.winner === 'left' ? '#8A3FFC' : state.winner === 'right' ? '#D2A106' : '#D2A106';
        drawProgressArc(ctx, arcLayout, 1, 100, arcColor, state.winner, 0.25);
        drawProgressArc(ctx, arcLayout, 1, state.numericValue, arcColor, state.winner);
        
        // Draw numeric value text
        const textLayout = CONFIG.LAYOUT.text;
        // Get font weight from layout config
        const textWeight = textLayout.font === 'light' ? '300' : textLayout.font === 'semibold' ? '600' : '400';
        ctx.font = `${textWeight} ${textLayout.fontSize}px ${fontFamily}, sans-serif`;
        ctx.fillStyle = arcColor;
        ctx.textAlign = textLayout.align;
        ctx.textBaseline = textLayout.baseline;
        // Apply letter spacing if defined
        if (textLayout.letterSpacing !== undefined) {
            ctx.letterSpacing = `${textLayout.letterSpacing}px`;
        }
        ctx.fillText(state.numericValue || '0', textLayout.x, textLayout.y);
        // Reset letter spacing
        ctx.letterSpacing = '0px';
        
        // Draw percent character
        const textPercentLayout = CONFIG.LAYOUT.characterPercent;
        // Get font weight from layout config
        const percentWeight = textPercentLayout.font === 'light' ? '300' : textPercentLayout.font === 'semibold' ? '600' : '400';
        ctx.font = `${percentWeight} ${textPercentLayout.fontSize}px ${fontFamily}, sans-serif`;
        ctx.fillStyle = arcColor;
        ctx.textAlign = textPercentLayout.align;
        ctx.textBaseline = textPercentLayout.baseline;
        ctx.fillText(
            '%',
            (state.numericValue==100? textPercentLayout.x+30:textPercentLayout.x),
            textPercentLayout.y
        );
        
        // Draw winner triangle
        if (state.winner) {
            const triangleLayout = CONFIG.LAYOUT.triangle;
            const triangleX = state.winner === 'left'
                ? textLayout.x - triangleLayout.offsetX
                : textLayout.x + triangleLayout.offsetX;
            drawTriangle(ctx, triangleX, textLayout.y, triangleLayout.size, state.winner, arcColor, triangleLayout.cornerRadius);
        }
        
        // Try blob method first
        const blobPromise = new Promise((resolve, reject) => {
            try {
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Blob creation returned null'));
                    }
                }, 'image/png');
            } catch (error) {
                reject(error);
            }
        });
        
        // Add timeout to blob creation
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Blob creation timeout')), 10000);
        });
        
        try {
            const blob = await Promise.race([blobPromise, timeoutPromise]);
            
            // Download using blob
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `template_${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up
            setTimeout(() => URL.revokeObjectURL(url), 100);
            
        } catch (blobError) {
            console.warn('Blob method failed, trying data URL fallback:', blobError.message);
            
            // Fallback to data URL method
            try {
                const dataURL = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = dataURL;
                link.download = `template_${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (dataURLError) {
                throw new Error('Both blob and data URL export methods failed');
            }
        }
        
        elements.renderBtn.disabled = false;
        elements.renderBtn.textContent = 'Render PNG';
        
    } catch (error) {
        console.error('Export failed:', error);
        alert(`Failed to export PNG: ${error.message}\n\nPlease check the browser console for details.`);
        elements.renderBtn.disabled = false;
        elements.renderBtn.textContent = 'Render PNG';
    }
}

// Start the application
init();

// Made with Bob
