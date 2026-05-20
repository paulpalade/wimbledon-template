# Assets Guide

This directory should contain all image assets used by the PNG Template Generator.

## Required Assets

### Background Image

- **Filename**: `background.png`
- **Purpose**: Base layer for the generated image
- **Recommended Size**: 3840×2160 pixels (will be scaled if different)
- **Format**: PNG (supports transparency)

### Image Set A (Dropdown A)

- `image-a1.png`
- `image-a2.png`
- `image-a3.png`

**Specifications**:

- **Recommended Size**: 800×800 pixels (or proportional)
- **Format**: PNG (supports transparency)
- **Position**: Left side of canvas (x: 500, y: 400)

### Image Set B (Dropdown B)

- `image-b1.png`
- `image-b2.png`
- `image-b3.png`

**Specifications**:

- **Recommended Size**: 800×800 pixels (or proportional)
- **Format**: PNG (supports transparency)
- **Position**: Right side of canvas (x: 2500, y: 400)

## Creating Placeholder Images

If you don't have assets ready, you can create simple placeholder images:

### Using ImageMagick (Command Line)

```bash
# Background (3840x2160)
convert -size 3840x2160 gradient:blue-lightblue background.png

# Image A set (800x800)
convert -size 800x800 xc:red -pointsize 100 -fill white -gravity center -annotate +0+0 "A1" image-a1.png
convert -size 800x800 xc:green -pointsize 100 -fill white -gravity center -annotate +0+0 "A2" image-a2.png
convert -size 800x800 xc:blue -pointsize 100 -fill white -gravity center -annotate +0+0 "A3" image-a3.png

# Image B set (800x800)
convert -size 800x800 xc:orange -pointsize 100 -fill white -gravity center -annotate +0+0 "B1" image-b1.png
convert -size 800x800 xc:purple -pointsize 100 -fill white -gravity center -annotate +0+0 "B2" image-b2.png
convert -size 800x800 xc:cyan -pointsize 100 -fill white -gravity center -annotate +0+0 "B3" image-b3.png
```

### Using Python (PIL/Pillow)

```python
from PIL import Image, ImageDraw, ImageFont

# Background
bg = Image.new('RGB', (3840, 2160), color='#4A90E2')
bg.save('background.png')

# Image A set
for i, color in enumerate(['#FF6B6B', '#4ECDC4', '#45B7D1'], 1):
    img = Image.new('RGB', (800, 800), color=color)
    draw = ImageDraw.Draw(img)
    draw.text((400, 400), f'A{i}', fill='white', anchor='mm')
    img.save(f'image-a{i}.png')

# Image B set
for i, color in enumerate(['#FFA07A', '#98D8C8', '#F7DC6F'], 1):
    img = Image.new('RGB', (800, 800), color=color)
    draw = ImageDraw.Draw(img)
    draw.text((400, 400), f'B{i}', fill='white', anchor='mm')
    img.save(f'image-b{i}.png')
```

### Using Online Tools

1. **Canva** (https://www.canva.com)
   - Create custom sized images
   - Export as PNG

2. **Photopea** (https://www.photopea.com)
   - Free online Photoshop alternative
   - Supports layers and transparency

3. **Figma** (https://www.figma.com)
   - Design tool with export capabilities
   - Great for creating consistent assets

## Image Optimization Tips

1. **File Size**: Keep images reasonably sized (< 5MB each) for faster loading
2. **Format**: Use PNG for images with transparency, JPG for photos
3. **Resolution**: Match or exceed the display size for best quality
4. **Naming**: Use descriptive, lowercase names with hyphens
5. **Consistency**: Keep similar images at the same dimensions

## Adding More Images

To add more images to the dropdowns:

1. Add your image files to this directory
2. Edit `app.js` and update the configuration:

```javascript
IMAGE_SET_A: [
  { id: "image-a1", name: "Option 1", path: "assets/image-a1.png" },
  { id: "image-a2", name: "Option 2", path: "assets/image-a2.png" },
  { id: "your-new-image", name: "Your Image", path: "assets/your-image.png" },
];
```

## Current Layout Positions

Based on the default configuration:

```
Canvas: 3840 × 2160 pixels

┌─────────────────────────────────────────────────┐
│                                                 │
│                                                 │
│     ┌────────┐                   ┌────────┐    │
│     │        │                   │        │    │
│     │Image A │                   │Image B │    │
│     │ 800x800│                   │ 800x800│    │
│     │        │                   │        │    │
│     └────────┘                   └────────┘    │
│     x:500                        x:2500        │
│     y:400                        y:400         │
│                                                 │
│                                                 │
│                  [Text: 1920, 1800]            │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Troubleshooting

**Images not appearing?**

- Check file names match exactly (case-sensitive)
- Verify files are in the correct directory
- Check browser console for loading errors

**Images look distorted?**

- Ensure source images have correct aspect ratio
- Adjust width/height in CONFIG.LAYOUT if needed

**Slow loading?**

- Optimize image file sizes
- Consider using WebP format for better compression
- Reduce image dimensions if possible
