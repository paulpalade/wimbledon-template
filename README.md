# PNG Template Generator

A web-based application for generating high-resolution PNG graphics for tennis tournament finals. This tool allows you to create professional-looking match preview images with player photos, names, countries, and win probability indicators.

## 🎯 Features

- **Tournament Selection**: Support for both Men's and Women's Singles Finals
- **Player Selection**: Searchable dropdown menus with extensive player databases
- **Win Probability**: Visual representation with percentage and arc indicators
- **High-Resolution Export**: Generates 4K (3840x2160) PNG images
- **Live Preview**: Real-time canvas preview of the final output
- **Responsive Design**: Built with IBM Carbon Design System
- **Custom Fonts**: Uses IBM Plex Sans font family

## 📋 Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- Python 3 (recommended) or Python 2 for running the local server
- Alternatively: Node.js, PHP, or any other HTTP server

## 🚀 Quick Start

### Option 1: Using the Startup Script (Recommended)

1. Clone or download this repository
2. Open a terminal in the project directory
3. Make the script executable (first time only):
   ```bash
   chmod +x start-server.sh
   ```
4. Run the startup script:
   ```bash
   ./start-server.sh
   ```
5. The browser will automatically open to `http://localhost:8000`

### Option 2: Manual Server Setup

**Using Python 3:**

```bash
python3 -m http.server 8000
```

**Using Python 2:**

```bash
python -m SimpleHTTPServer 8000
```

**Using Node.js:**

```bash
npx http-server -p 8000
```

**Using PHP:**

```bash
php -S localhost:8000
```

Then open your browser and navigate to `http://localhost:8000`

## 📖 Usage

1. **Select Tournament Type**: Choose between Men's Final or Women's Final
2. **Select Player 1**: Use the searchable dropdown to find and select the first player
3. **Select Player 2**: Use the searchable dropdown to find and select the second player
4. **Choose Winner**: Select which player is predicted to win (Left or Right)
5. **Set Win Probability**: Enter a percentage between 50-99 for the likelihood of winning
6. **Generate Image**: Click the "Render PNG" button to create and download the image

## 🗂️ Project Structure

```
.
├── index.html              # Main HTML file
├── app.js                  # Application logic and canvas rendering
├── styles.css              # Custom styles and Carbon Design overrides
├── tournaments.json        # Player database for men's and women's tournaments
├── start-server.sh         # Server startup script
├── .gitignore             # Git ignore rules
├── assets/
│   ├── background.png     # Background template image
│   ├── fonts/             # IBM Plex Sans font files
│   │   ├── IBMPlexSans-Light.ttf
│   │   ├── IBMPlexSans-Regular.ttf
│   │   └── IBMPlexSans-SemiBold.ttf
│   ├── men/               # Men's player images
│   └── women/             # Women's player images
└── README.md              # This file
```

## 🎨 Technical Details

### Canvas Specifications

- **Export Resolution**: 3840 x 2160 pixels (4K)
- **Preview Aspect Ratio**: 16:9
- **Image Format**: PNG with transparency support

### Layout Configuration

The application uses precise positioning for all elements:

- **Title**: Centered at top
- **Player Images**: 1022x1022px with colored borders
  - Player 1 (Left): Purple border (#8A3FFC)
  - Player 2 (Right): Gold border (#D2A106)
- **Player Names**: IBM Plex Sans Light, 90px
- **Country Codes**: IBM Plex Sans Regular, 34px
- **Win Percentage**: Large centered display with arc indicator
- **Triangle Indicator**: Points to the predicted winner

### Technologies Used

- **HTML5 Canvas API**: For image rendering and composition
- **IBM Carbon Design System**: UI components and styling
- **Vanilla JavaScript**: No framework dependencies
- **Custom Fonts**: IBM Plex Sans family

## 🔧 Configuration

The application can be customized by modifying the `CONFIG` object in `app.js`:

```javascript
const CONFIG = {
  EXPORT_WIDTH: 3840,
  EXPORT_HEIGHT: 2160,
  BACKGROUND_IMAGE: "assets/background.png",
  TOURNAMENTS_JSON: "tournaments.json",
  // ... additional configuration
};
```

## 📝 Adding New Players

To add new players to the database:

1. Open `tournaments.json`
2. Add a new player object to either the `men.players` or `women.players` array:
   ```json
   {
     "name": "Player Name",
     "country": "COUNTRY_CODE",
     "image": "assets/men/Player Name_COUNTRY_CODE.png"
   }
   ```
3. Add the corresponding player image to the appropriate assets folder
4. Image naming convention: `Player Name_COUNTRY_CODE.png`

## 🖼️ Image Requirements

Player images should:

- Be in PNG format
- Have dimensions of approximately 1022x1022 pixels (or similar square aspect ratio)
- Have a transparent or white background
- Be named following the pattern: `FirstName LastName_COUNTRY.png`

## 🐛 Troubleshooting

### CORS Errors

If you see CORS-related errors in the browser console:

- Make sure you're running a local server (not opening the HTML file directly)
- Use the provided `start-server.sh` script or one of the manual server options

### Images Not Loading

- Verify that all image paths in `tournaments.json` are correct
- Check that image files exist in the specified directories
- Ensure image filenames match exactly (case-sensitive)

### Fonts Not Rendering

- Confirm that all font files are present in `assets/fonts/`
- Check browser console for font loading errors
- Clear browser cache and reload

## 🤝 Contributing

To contribute to this project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is provided as-is for tournament graphics generation purposes.

## 🙏 Acknowledgments

- **IBM Carbon Design System**: For the UI components and design language
- **IBM Plex Sans**: For the beautiful typography
- Tennis player images and data sources

## 📞 Support

For issues, questions, or suggestions:

- Check the troubleshooting section above
- Review the browser console for error messages
- Ensure all prerequisites are met

---

**Made with Bob** 🤖
