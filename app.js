// Configuration
const CONFIG = {
    EXPORT_WIDTH: 3840,
    EXPORT_HEIGHT: 2160,
    PREVIEW_ASPECT_RATIO: 16 / 9,
    
    // Asset paths
    BACKGROUND_IMAGE: 'assets/background.png',
    
    // Font paths
    FONTS: {
        light: 'assets/fonts/IBMPlexSans-Light.ttf',
        regular: 'assets/fonts/IBMPlexSans-Regular.ttf',
        semibold: 'assets/fonts/IBMPlexSans-SemiBold.ttf'
    },
    
    // Tournament configurations
    TOURNAMENTS: {
        men: {
            title: "Gentlemen's Singles Final",
            players: [
                { id: 'men-1', name: 'Novak Djokovic', country: 'SER', path: 'assets/men/Novak Djokovic.png' },
                { id: 'men-2', name: 'Carlos Alcaraz', country: 'SPN', path: 'assets/men/Carlos Alcaraz.png' },
                { id: 'men-3', name: 'Jannik Sinner', country: 'ITA', path: 'assets/men/Jannik Sinner.png' },
                { id: 'men-4', name: 'Daniil Medvedev', country: 'RUS', path: 'assets/men/default.png' },
                { id: 'men-5', name: 'Alexander Zverev', country: 'GER', path: 'assets/men/default.png' },
                { id: 'men-6', name: 'Stefanos Tsitsipas', country: 'GRE', path: 'assets/men/default.png' }
            ]
        },
        women: {
            title: "Ladies' Singles Final",
            players: [
                { id: 'women-1', name: 'Naomi Osaka', country: 'JPN', path: 'assets/women/Naomi Osaka.png' },
                { id: 'women-2', name: 'Aryna Sabalenka', country: 'BEL', path: 'assets/women/Aryna Sabalenka.png' },
                { id: 'women-3', name: 'Amanda Anisimova', country: 'USA', path: 'assets/women/Amanda Anisimova.png' },
                { id: 'women-4', name: 'Jessica Pegula', country: 'USA', path: 'assets/Jessica Pegula.png' },
                { id: 'women-5', name: 'Elena Rybakina', country: 'KAZ', path: 'assets/women/default.png' },
                { id: 'women-6', name: 'Ons Jabeur', country: 'TUN', path: 'assets/women/default.png' }
            ]
        }
    },
    
    // Layout configuration for image positioning
    LAYOUT: {
        title: { x: 1920, y: 105, fontSize: 50, color: '#000000', align: 'center', baseline: 'middle', font: 'semibold' },
        imageA: { x: 259, y: 716, width: 1010, height: 1010, strokeColor: '#8A3FFC', strokeWidth: 16 },
        imageB: { x: 2578, y: 716, width: 1010, height: 1010, strokeColor: '#D2A106', strokeWidth: 16 },
        playerNameA: { x: 760, y: 1825, fontSize: 90, color: '#000000', align: 'center', baseline: 'middle', font: 'light' },
        playerCountryA: { x: 760, y: 1905, fontSize: 34, color: '#000000', align: 'center', baseline: 'middle', font: 'regular' },
        playerNameB: { x: 3079, y: 1825, fontSize: 90, color: '#000000', align: 'center', baseline: 'middle', font: 'light' },
        playerCountryB: { x: 3079, y: 1905, fontSize: 34, color: '#000000', align: 'center', baseline: 'middle', font: 'regular' },
        text: { x: 1920, y: 1240, fontSize: 218,  align: 'center', baseline: 'middle', font: 'regular' },
        characterPercent: { x: 2070, y: 1260, fontSize: 128,  align: 'left', baseline: 'middle', font: 'light' },
        arc: { x: 1920, y: 1215, radius: 350, strokeWidth: 30 },
        triangle: { size: 90, offsetX: 440 }
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
    isInitializing: true
};

// DOM elements
const elements = {
    tournamentType: document.getElementById('tournament-type'),
    dropdownA: document.getElementById('dropdown-a'),
    dropdownB: document.getElementById('dropdown-b'),
    winnerSelect: document.getElementById('winner-select'),
    numericInput: document.getElementById('numeric-input'),
    renderBtn: document.getElementById('render-btn'),
    previewCanvas: document.getElementById('preview-canvas'),
    exportCanvas: document.getElementById('export-canvas')
};

// Initialize the application
function init() {
    loadFonts();
    populateDropdowns();
    setupEventListeners();
    preloadImages();
    // Don't call updatePreview here - let it be called after fonts and images load
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
    
    // Clear existing options 
    elements.dropdownA.innerHTML = '';
    elements.dropdownB.innerHTML = '';
    
    // Populate both dropdowns with the same player list
    tournament.players.forEach((player, index) => {
        // Add to Player 1 dropdown
        const optionA = document.createElement('option');
        optionA.value = player.id;
        optionA.textContent = player.name;
        optionA.dataset.path = player.path;
        optionA.dataset.name = player.name;
        optionA.dataset.country = player.country;
        // Select first player by default
        if (index === 0) optionA.selected = true;
        elements.dropdownA.appendChild(optionA);
        
        // Add to Player 2 dropdown
        const optionB = document.createElement('option');
        optionB.value = player.id;
        optionB.textContent = player.name;
        optionB.dataset.path = player.path;
        optionB.dataset.name = player.name;
        optionB.dataset.country = player.country;
        // Select second player by default
        if (index === 1) optionB.selected = true;
        elements.dropdownB.appendChild(optionB);
    });
    
    // Set default selections to first two players
    if (tournament.players.length >= 2) {
        const player1 = tournament.players[0];
        const player2 = tournament.players[1];
        
        state.selectedImageA = player1.path;
        state.selectedPlayerA = {
            name: player1.name,
            country: player1.country
        };
        
        state.selectedImageB = player2.path;
        state.selectedPlayerB = {
            name: player2.name,
            country: player2.country
        };
    } else {
        // Reset selections if not enough players
        state.selectedImageA = null;
        state.selectedImageB = null;
        state.selectedPlayerA = null;
        state.selectedPlayerB = null;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Tournament type change
    elements.tournamentType.addEventListener('change', (e) => {
        state.tournamentType = e.target.value;
        populateDropdowns();
        preloadImages();
        updatePreview();
    });
    
    elements.dropdownA.addEventListener('change', (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        state.selectedImageA = selectedOption.dataset.path || null;
        state.selectedPlayerA = selectedOption.value ? {
            name: selectedOption.dataset.name,
            country: selectedOption.dataset.country
        } : null;
        updatePreview();
    });
    
    elements.dropdownB.addEventListener('change', (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        state.selectedImageB = selectedOption.dataset.path || null;
        state.selectedPlayerB = selectedOption.value ? {
            name: selectedOption.dataset.name,
            country: selectedOption.dataset.country
        } : null;
        updatePreview();
    });
    
    elements.winnerSelect.addEventListener('change', (e) => {
        state.winner = e.target.value || null;
        updatePreview();
    });
    
    elements.numericInput.addEventListener('input', (e) => {
        let value = parseInt(e.target.value) || 0;
        // Clamp value between 0 and 100
        value = Math.max(0, Math.min(100, value));
        e.target.value = value;
        state.numericValue = value;
        updatePreview();
    });
    
    elements.renderBtn.addEventListener('click', exportPNG);
    
    // Handle window resize for responsive preview
    window.addEventListener('resize', updatePreview);
}

// Preload images for better performance
function preloadImages() {
    const tournament = CONFIG.TOURNAMENTS[state.tournamentType];
    const imagesToLoad = [
        CONFIG.BACKGROUND_IMAGE,
        ...tournament.players.map(player => player.path)
    ];
    
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
    if (state.isInitializing && state.fontsLoaded && Object.keys(state.loadedImages).length > 0) {
        state.isInitializing = false;
        updatePreview();
    }
}

// Load an image and return a promise
function loadImage(src) {
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
    
    ctx.font = `600 ${titleLayout.fontSize * scale}px ${fontFamily}, sans-serif`;
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
        
        ctx.font = `300 ${nameLayout.fontSize * scale}px ${fontFamily}, sans-serif`;
        ctx.fillStyle = nameLayout.color;
        ctx.textAlign = nameLayout.align;
        ctx.textBaseline = nameLayout.baseline;
        ctx.fillText(state.selectedPlayerA.name, nameLayout.x * scale, nameLayout.y * scale);
        
        ctx.font = `400 ${countryLayout.fontSize * scale}px ${fontFamily}, sans-serif`;
        ctx.fillStyle = countryLayout.color;
        ctx.textAlign = countryLayout.align;
        ctx.textBaseline = countryLayout.baseline;
        ctx.fillText(state.selectedPlayerA.country, countryLayout.x * scale, countryLayout.y * scale);
    }
    
    if (state.selectedPlayerB) {
        const nameLayout = CONFIG.LAYOUT.playerNameB;
        const countryLayout = CONFIG.LAYOUT.playerCountryB;
        
        ctx.font = `300 ${nameLayout.fontSize * scale}px ${fontFamily}, sans-serif`;
        ctx.fillStyle = nameLayout.color;
        ctx.textAlign = nameLayout.align;
        ctx.textBaseline = nameLayout.baseline;
        ctx.fillText(state.selectedPlayerB.name, nameLayout.x * scale, nameLayout.y * scale);
        
        ctx.font = `400 ${countryLayout.fontSize * scale}px ${fontFamily}, sans-serif`;
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
    ctx.font = `400 ${textLayout.fontSize * scale}px ${fontFamily}, sans-serif`;
    ctx.fillStyle = arcColor;
    ctx.textAlign = textLayout.align;
    ctx.textBaseline = textLayout.baseline;
    ctx.fillText(
        state.numericValue || '0',
        textLayout.x * scale,
        textLayout.y * scale
    );
    // Draw percent character
    const textPercentLayout = CONFIG.LAYOUT.characterPercent;
    ctx.font = `400 ${textPercentLayout.fontSize * scale}px ${fontFamily}, sans-serif`;
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
        drawTriangle(ctx, triangleX, (textLayout.y-20) * scale, triangleLayout.size * scale, state.winner, arcColor);
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

// Draw triangle indicator
function drawTriangle(ctx, x, y, size, direction, color) {
    ctx.save();
    ctx.fillStyle = color;
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
        
        ctx.font = `600 ${titleLayout.fontSize}px ${fontFamily}, sans-serif`;
        ctx.fillStyle = titleLayout.color;
        ctx.textAlign = titleLayout.align;
        ctx.textBaseline = titleLayout.baseline;
        ctx.fillText(tournament.title, titleLayout.x, titleLayout.y);
        
        // Draw player names and countries
        if (state.selectedPlayerA) {
            const nameLayout = CONFIG.LAYOUT.playerNameA;
            const countryLayout = CONFIG.LAYOUT.playerCountryA;
            
            ctx.font = `300 ${nameLayout.fontSize}px ${fontFamily}, sans-serif`;
            ctx.fillStyle = nameLayout.color;
            ctx.textAlign = nameLayout.align;
            ctx.textBaseline = nameLayout.baseline;
            ctx.fillText(state.selectedPlayerA.name, nameLayout.x, nameLayout.y);
            
            ctx.font = `400 ${countryLayout.fontSize}px ${fontFamily}, sans-serif`;
            ctx.fillStyle = countryLayout.color;
            ctx.textAlign = countryLayout.align;
            ctx.textBaseline = countryLayout.baseline;
            ctx.fillText(state.selectedPlayerA.country, countryLayout.x, countryLayout.y);
        }
        
        if (state.selectedPlayerB) {
            const nameLayout = CONFIG.LAYOUT.playerNameB;
            const countryLayout = CONFIG.LAYOUT.playerCountryB;
            
            ctx.font = `300 ${nameLayout.fontSize}px ${fontFamily}, sans-serif`;
            ctx.fillStyle = nameLayout.color;
            ctx.textAlign = nameLayout.align;
            ctx.textBaseline = nameLayout.baseline;
            ctx.fillText(state.selectedPlayerB.name, nameLayout.x, nameLayout.y);
            
            ctx.font = `400 ${countryLayout.fontSize}px ${fontFamily}, sans-serif`;
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
        ctx.font = `400 ${textLayout.fontSize}px ${fontFamily}, sans-serif`;
        ctx.fillStyle = arcColor;
        ctx.textAlign = textLayout.align;
        ctx.textBaseline = textLayout.baseline;
        ctx.fillText(state.numericValue || '0', textLayout.x, textLayout.y);
        
        // Draw winner triangle
        if (state.winner) {
            const triangleLayout = CONFIG.LAYOUT.triangle;
            const triangleX = state.winner === 'left'
                ? textLayout.x - triangleLayout.offsetX
                : textLayout.x + triangleLayout.offsetX;
            drawTriangle(ctx, triangleX, textLayout.y, triangleLayout.size, state.winner, arcColor);
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
