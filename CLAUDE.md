# AIchemist Agency - Claude Development Notes

## Technology Stack Requirements

**CRITICAL: This project uses HTML/CSS/JS/PHP only - NO Node.js runtime dependencies**

- **HTML5, CSS3, Vanilla JavaScript, PHP only**
- **Hostinger shared hosting compatible**
- **No frameworks, no build processes, no npm dependencies in production**
- **Modern 2025 web standards with progressive enhancement**

## Development Environment

### Required
- PHP (matching Hostinger version 7.4+ or 8.0+)
- Git for version control

### Optional Dev Tools
- npm (ONLY for Prettier formatting)
- package.json contains dev tools only - NOT for production

### Start Development Server
```bash
./start-dev-server.sh
# OR
php -S localhost:8080 -t public_html
```

## Key Commands
- `npm run serve` - Start PHP dev server
- `npm run format` - Format code (optional)
- `scripts/deploy-mvp.sh <name>` - Deploy MVP application

## Project Structure
- `public_html/` - All web files (upload this to Hostinger)
  - `app/` - Main SPA application
  - `api/v1/` - REST API endpoints
  - `mvp/` - MVP applications and prototypes
  - `forms/` - Interactive form applications
  - `proposals/` - Interactive proposal system
  - `assets/` - Shared resources (CSS, JS, images)
- `docs/` - Comprehensive documentation
- `scripts/` - Development and deployment scripts

## Application Types & Patterns

### 1. Single Page Applications (SPA)
- **Client-side routing** with vanilla JS
- **Progressive enhancement** approach
- **Core Web Vitals** optimization
- See: `docs/MODERN-WEB-DEPLOYMENT.md`

### 2. MVP Applications
- **Single-file deployment** pattern for rapid testing
- **Feature flags** for A/B testing
- **Analytics integration** built-in
- See: `docs/MVP-DEPLOYMENT-PATTERNS.md`

### 3. Interactive Forms
- **Real-time validation** with HTML5 + custom JS
- **Progressive enhancement** for accessibility
- **Webhook integration** for external services

### 4. API Integration
- **RESTful endpoints** in PHP
- **Webhook handling** with security
- **MCP (Model Context Protocol)** support
- **Rate limiting** and security headers

## Modern 2025 Best Practices

### Performance
- **Critical CSS inlining** for above-fold content
- **Progressive image loading** with native lazy loading
- **Intersection Observer API** for animations
- **Web Components** for reusable elements

### Security
- **Content Security Policy** headers
- **Input validation** and sanitization
- **CSRF protection** for forms
- **Rate limiting** for APIs

### SEO & Accessibility
- **Semantic HTML5** structure
- **Progressive enhancement** layers
- **Core Web Vitals** optimization
- **Mobile-first responsive design**

## Important Constraints
1. **MANDATORY BACKUP** before any code changes - run `./scripts/create-backup.sh`
2. **NO Node.js runtime** in production
3. **NO build process** required
4. **Direct file upload deployment** to Hostinger
5. **PHP built-in server** for local development
6. **Vanilla JS only** - no frameworks
7. **Progressive enhancement** - works without JS

## Documentation

### Core Guides
- `docs/DEVELOPMENT-APPROACH.md` - Development philosophy and constraints
- `docs/MODERN-WEB-DEPLOYMENT.md` - 2025 deployment patterns and best practices
- `docs/MVP-DEPLOYMENT-PATTERNS.md` - Rapid MVP deployment strategies

### Application Patterns
- **Landing Pages** - Core Web Vitals optimized
- **SPAs** - Client-side routing without bundlers
- **Forms** - Interactive with real-time validation
- **Proposals** - Digital signature and approval system
- **APIs** - RESTful PHP endpoints with security
- **Webhooks** - External service integration
- **MCPs** - Model Context Protocol support

## Deployment Strategy

### Development
```bash
./start-dev-server.sh  # Local PHP server
```

### Production
```bash
# Direct upload to Hostinger
rsync -av public_html/ user@host:/path/to/public_html/

# Or use FTP/SFTP client
# Upload public_html/ contents to hosting provider
```

### MVP Deployment
```bash
scripts/deploy-mvp.sh my-new-feature
# Creates: public_html/mvp/my-new-feature/
```

This approach ensures maximum compatibility, performance, and maintainability while leveraging modern web standards and best practices for 2025.