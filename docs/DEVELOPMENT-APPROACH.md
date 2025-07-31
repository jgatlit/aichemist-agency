# AIchemist Agency Development Approach

## Technology Stack

This project uses a minimal tech stack for maximum compatibility with Hostinger web hosting:

- **HTML5** - Structure and content
- **CSS3** - Styling and layout
- **Vanilla JavaScript** - Client-side functionality (no frameworks)
- **PHP** - Server-side processing
- **No Node.js runtime dependencies** - Only development tools

## Key Principles

1. **Hostinger Compatibility First**
   - All code must run on standard shared hosting
   - No Node.js, Python, or other runtime requirements
   - PHP version should match Hostinger's offering (typically 7.4+ or 8.0+)

2. **Minimal Dependencies**
   - No JavaScript frameworks (React, Vue, etc.)
   - No CSS frameworks unless absolutely necessary
   - No build processes required for production

3. **Simple Deployment**
   - Direct file upload via FTP/SFTP
   - No build step required
   - No server configuration needed

## Development Environment

### Required Tools
- **PHP** (matching Hostinger version)
- **Git** (for version control)
- **Text editor/IDE**

### Optional Tools
- **npm** (ONLY for development tools like Prettier)
- **Browser developer tools**

### Starting Development Server
```bash
# Using the provided script
./start-dev-server.sh

# Or directly with PHP
php -S localhost:8080 -t public_html
```

## File Structure
```
aichemist.agency/
├── public_html/          # All web-accessible files
│   ├── index.html       # Main entry point
│   ├── styles.css       # Global styles
│   ├── images/          # Static assets
│   ├── art/             # Application subdirectories
│   └── *.php            # PHP endpoints
├── docs/                # Documentation
├── scripts/             # Development scripts
├── .gitignore          # Git ignore rules
└── package.json        # Dev tools only (optional)
```

## Deployment Process

1. Test locally with PHP built-in server
2. Upload `public_html/` contents to Hostinger's public_html directory
3. Set appropriate file permissions (755 for directories, 644 for files)
4. Configure .htaccess if needed

## Best Practices

1. **Backup Protocol (CRITICAL)**
   - **ALWAYS create backup before changes**: `./scripts/create-backup.sh`
   - Verify backup creation and note timestamp
   - Keep backup reference for rollback capability
   - Use `./scripts/restore-backup.sh <timestamp>` if needed

2. **Performance**
   - Minimize HTTP requests
   - Optimize images before upload
   - Use browser caching headers
   - Minify CSS/JS manually or with online tools

3. **Security**
   - Validate all PHP inputs
   - Use prepared statements for database queries
   - Never expose sensitive configuration
   - Keep PHP version updated

4. **Compatibility**
   - Test on multiple browsers
   - Use progressive enhancement
   - Ensure mobile responsiveness
   - Avoid modern JS features without polyfills

## Configuration

For environment-specific settings, use:
```php
// config.php
<?php
$config = [
    'db_host' => getenv('DB_HOST') ?: 'localhost',
    'api_key' => getenv('API_KEY') ?: 'default_key'
];
?>
```

## Important Notes

- **NO npm install in production** - package.json is for dev tools only
- **NO build process** - What you write is what gets deployed
- **PHP includes** - Use for code reuse instead of JS bundlers
- **Direct file references** - No module loaders or bundlers

This approach ensures maximum compatibility, minimal complexity, and easy maintenance for small business hosting environments.