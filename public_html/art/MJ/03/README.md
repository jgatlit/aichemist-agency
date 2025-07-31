# SPA Landing Page - Chatbot Showcase

A web application for configuring and customizing chatbot appearance using the Flowise embed widget.

## Overview

This is a chatbot customization studio that allows users to:
- Configure chatbot themes and colors
- Fetch themes from external CSS files
- Save and load preset configurations
- Customize various UI elements of the chatbot embed

## Files Structure

- `index.html` - Main HTML interface with configuration panels
- `app.js` - JavaScript application logic for chatbot configuration
- `style.css` - Styling for the configuration interface
- `presets_api.php` - PHP API for saving/loading presets
- `download_css.php` - PHP script for downloading external CSS files
- `data/presets.json` - Storage for saved preset configurations
- `css/mojohealthmentor-styles.css` - Downloaded CSS themes

## Configuration

### Default Settings

- **Feedback**: Enabled by default with blue color (#3B81F6)
  - No UI controls for feedback configuration (hidden from users)
  - Feedback functionality is active in the chatbot

### Theme Customization

The application supports:
- Button colors and icons
- Chat window colors
- Text input styling  
- Tooltip customization
- Disclaimer configuration
- Custom CSS injection

### Usage

1. Open `index.html` in a web browser
2. Configure chatbot appearance using the control panels
3. Use "Fetch Theme" to import colors from external CSS
4. Save configurations as presets for reuse
5. The chatbot preview updates in real-time

## Recent Changes

- Fixed syntax error in `app.js` that prevented chatbot embed from loading
- Enabled feedback by default without showing configuration UI
- Removed feedback-related UI references while keeping functionality active

## Technical Notes

- Uses Flowise embed widget from CDN
- Requires PHP server for preset management and CSS downloading
- Compatible with WSL2 environment