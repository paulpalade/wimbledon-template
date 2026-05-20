# PNG Template Generator Web App

A browser-based web application that generates static PNG images (3840×2160) based on user-selected inputs.

## ⚠️ IMPORTANT: Must Use Local Server

**You MUST run this app through a local web server** to avoid CORS security issues that prevent PNG export.

**DO NOT** open `index.html` directly in your browser (file://) - the export will fail with "Tainted canvas" error!

## Quick Start

```bash
# 1. Generate placeholder images
pip install pillow
python3 generate_placeholders.py

# 2. Start local server (choose one):
./start-server.sh                    # Easy way (macOS/Linux)
python3 -m http.server 8000          # Python
npx http-server -p 8000              # Node.js

# 3. Open http://localhost:8000 in your browser
```

## Features

- **Tournament Selection**: Choose between Men's Final or Women's Final
- **Dynamic Title**: Displays "Gentlemen's Singles Final" or "Ladies' Singles Final" based on selection
- **Dropdown Selection**: Choose from predefined image sets for Image A and Image B (changes based on tournament)
- **Numeric Input**: Enter a numeric value to display on the generated image
- **Custom Fonts**: Uses IBM Plex Sans (Regular and SemiBold) for professional typography
- **Real-time Preview**: See changes instantly in a responsive 16:9 preview canvas
- **High-Resolution Export**: Generate PNG files at 3840×2160 resolution
- **Client-Side Processing**: Runs entirely in the browser (but needs local server for CORS)

## Setup Instructions

### 1. Add Your Assets

Place your image assets in the `assets/` directory structure:

```
assets/
├── background.png              # Background image (3840×2160)
├── fonts/
│   ├── IBMPlexSans-Regular.ttf    # Regular font (already provided)
│   └── IBMPlexSans-SemiBold.ttf   # SemiBold font (already provided)
├── men/                        # Men's tournament images
│   ├── image-a1.png           # Player images for dropdown A
│   ├── image-a2.png
│   ├── image-a3.png
│   ├── image-b1.png           # Player images for dropdown B
│   ├── image-b2.png
│   └── image-b3.png
└── women/                      # Women's tournament images
    ├── image-a1.png           # Player images for dropdown A
    ├── image-a2.png
    ├── image-a3.png
    ├── image-b1.png           # Player images for dropdown B
    ├── image-b2.png
    └── image-b3.png
```

**Note**: You can add more images by editing the `TOURNAMENTS` object in `app.js`.

### 2. Customize Configuration

Edit `app.js` to customize the layout, image sets, and tournament titles:

```javascript
const CONFIG = {
  // Add or modify image sets
  IMAGE_SET_A: [
    { id: "image-a1", name: "Your Image Name", path: "assets/your-image.png" },
    // Add more images...
  ],

  // Adjust positioning and sizing
  LAYOUT: {
    imageA: { x: 500, y: 400, width: 800, height: 800 },
    imageB: { x: 2500, y: 400, width: 800, height: 800 },
    text: {
      x: 1920, // X position (center of 3840px width)
      y: 1800, // Y position
      fontSize: 120, // Font size in pixels
      color: "#ffffff", // Text color
      align: "center",
      baseline: "middle",
    },
  },
};
```

### 3. Run the Application

Simply open `index.html` in a modern web browser:

- **Chrome/Edge**: Recommended for best compatibility
- **Firefox**: Fully supported
- **Safari**: Supported

Or use a local development server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000` in your browser.

## Usage

1. **Select Image A**: Choose an image from the first dropdown
2. **Select Image B**: Choose an image from the second dropdown
3. **Enter Numeric Value**: Type a number in the input field
4. **Preview**: The canvas updates in real-time as you make changes
5. **Render PNG**: Click the "Render PNG" button to export the final image
6. **Save**: Choose a location and filename in the browser's save dialog

## Technical Specifications

- **Output Format**: PNG
- **Resolution**: 3840 × 2160 pixels (4K UHD)
- **Color Space**: RGB
- **Transparency**: Supported (if source assets have transparency)
- **Rendering**: HTML5 Canvas API
- **Export**: Client-side using Canvas.toBlob()

## File Structure

```
.
├── index.html          # Main HTML structure
├── styles.css          # Styling and responsive layout
├── app.js             # Application logic and rendering
├── assets/            # Image assets directory
│   ├── background.png
│   ├── image-a1.png
│   ├── image-a2.png
│   ├── image-a3.png
│   ├── image-b1.png
│   ├── image-b2.png
│   └── image-b3.png
└── README.md          # This file
```

## Customization Guide

### Adding More Images

1. Add your image files to the `assets/` directory
2. Edit `app.js` and update the `IMAGE_SET_A` or `IMAGE_SET_B` arrays:

```javascript
IMAGE_SET_A: [
  { id: "unique-id", name: "Display Name", path: "assets/your-image.png" },
  // Add more...
];
```

### Changing Layout

Modify the `LAYOUT` object in `app.js`:

```javascript
LAYOUT: {
    imageA: {
        x: 500,      // X position in pixels
        y: 400,      // Y position in pixels
        width: 800,  // Width in pixels
        height: 800  // Height in pixels
    },
    // Adjust imageB and text similarly
}
```

### Changing Text Style

Update the text properties in the `LAYOUT.text` object:

```javascript
text: {
    x: 1920,              // Horizontal position
    y: 1800,              // Vertical position
    fontSize: 120,        // Font size
    color: '#ffffff',     // Text color (hex, rgb, or named)
    align: 'center',      // 'left', 'center', 'right'
    baseline: 'middle'    // 'top', 'middle', 'bottom'
}
```

### Using Different Fonts

To use custom fonts, add them to your CSS:

```css
@font-face {
  font-family: "YourFont";
  src: url("fonts/your-font.woff2") format("woff2");
}
```

Then update the font in `app.js` where text is rendered:

```javascript
ctx.font = `${textLayout.fontSize}px YourFont, Arial, sans-serif`;
```

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### Images Not Loading

- Ensure image paths in `app.js` match actual file locations
- Check browser console for error messages
- Verify images are in supported formats (PNG, JPG, WebP)

### Export Not Working

- Check if browser blocks downloads (allow in settings)
- Ensure sufficient memory for 4K image generation
- Try with smaller/fewer images if memory issues occur

### Preview Not Updating

- Check browser console for JavaScript errors
- Ensure all event listeners are properly attached
- Verify image paths are correct

## License

This project is provided as-is for your use and modification.
