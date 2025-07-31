# Production-Safe Development Workflow

## Smart Development Detection System

### Overview
The smart development detection system automatically switches between development and production form handlers without requiring code changes when deploying to production.

### How It Works

#### 1. Environment Detection
The system detects the environment based on:
- **Development**: `localhost`, `127.0.0.1`, or ports `8080`/`8081`
- **Production**: Any other hostname (aichemist.agency, etc.)

#### 2. Automatic Endpoint Switching
- **Development**: Uses `send-audit-request-dev.php` (logs to files)
- **Production**: Uses `send-audit-request.php` (sends actual emails)

#### 3. Visual Indicators
- **Development**: Red banner showing "DEVELOPMENT MODE"
- **Production**: No banner, normal appearance

### Files Involved

#### Core Files
```
public_html/
├── send-audit-request.php          # PRODUCTION (unchanged)
├── send-audit-request-dev.php      # DEVELOPMENT (file logging)
├── js/dev-config.js               # Auto-detection script
├── index.html                     # Modified with dynamic endpoint
└── logs/
    ├── audit-requests.log         # JSON log file
    └── audit-requests-readable.txt # Human-readable log
```

#### Configuration
- **`js/dev-config.js`**: Auto-detects environment and sets endpoints
- **`config-local.php`**: Optional local development configuration

### Usage

#### Development (Automatic)
1. **Start local server**: `php -S localhost:8081 -t public_html`
2. **Access site**: http://localhost:8081
3. **Visual confirmation**: Red "DEVELOPMENT MODE" banner appears
4. **Form submissions**: Automatically logged to `logs/audit-requests.log`

#### Production (Automatic)
1. **Deploy files**: Upload to Hostinger (excluding `*-dev.php` files)
2. **Access site**: https://aichemist.agency
3. **Visual confirmation**: No development banner
4. **Form submissions**: Sent via email using original handler

### Production Safety Features

#### Zero Production Changes
- **Production handler unchanged**: `send-audit-request.php` remains exactly as-is
- **No deployment conflicts**: Development files have `-dev` suffix
- **Automatic detection**: No manual configuration needed

#### Safe Deployment Process
```bash
# Files to deploy (normal deployment)
public_html/
├── index.html                 # ✅ Deploy (includes smart detection)
├── js/dev-config.js          # ✅ Deploy (safe - auto-detects production)
├── send-audit-request.php    # ✅ Deploy (unchanged production handler)
├── styles.css                # ✅ Deploy
└── images/                   # ✅ Deploy

# Files to exclude from deployment
├── send-audit-request-dev.php      # ❌ Don't deploy (dev only)
├── config-local.php               # ❌ Don't deploy (dev only)
└── logs/                          # ❌ Don't deploy (dev only)
```

### Testing

#### Development Testing
```bash
# 1. Submit form via browser at localhost:8081
# 2. Check logs
cat public_html/logs/audit-requests-readable.txt

# 3. Or test via curl
curl -X POST http://localhost:8081/send-audit-request-dev.php \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","company":"Test Co","challenge":"Test"}'
```

#### Production Testing
```bash
# Test production endpoint (when deployed)
curl -X POST https://aichemist.agency/send-audit-request.php \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","company":"Test Co","challenge":"Test"}'
```

### Debugging

#### Check Environment Detection
```javascript
// In browser console
console.log('Environment:', window.DEV_CONFIG.environment);
console.log('Endpoint:', window.getFormEndpoint());
console.log('Debug mode:', window.isDebugMode());
```

#### Log Monitoring
```bash
# Watch development logs in real-time
tail -f public_html/logs/audit-requests.log

# View human-readable logs
cat public_html/logs/audit-requests-readable.txt
```

### Benefits

#### For Development
- ✅ **Instant feedback**: Form submissions logged immediately
- ✅ **No email setup needed**: Works without sendmail/SMTP
- ✅ **Visual confirmation**: Clear development mode indicator
- ✅ **Debug information**: Console logging in debug mode

#### For Production
- ✅ **Zero changes**: Production code remains untouched
- ✅ **Zero risk**: No chance of breaking existing functionality
- ✅ **Automatic**: No manual configuration required
- ✅ **Backward compatible**: Works with existing deployment process

#### For Deployment
- ✅ **Safe deployment**: Development files can't interfere with production
- ✅ **No configuration**: Auto-detects production environment
- ✅ **Easy rollback**: Original production handler unchanged
- ✅ **Standard process**: Normal deployment workflow unchanged

### Troubleshooting

#### Form Not Working in Development
1. Check browser console for errors
2. Verify `js/dev-config.js` is loading
3. Check if development banner appears
4. Verify `send-audit-request-dev.php` exists

#### Form Not Working in Production
1. Verify `send-audit-request.php` is deployed
2. Check if development banner appears (shouldn't in production)
3. Verify environment detection: should use production endpoint
4. Check server error logs

#### Development/Production Mix-up
```javascript
// Force production mode for testing
window.DEV_CONFIG = { formEndpoint: 'send-audit-request.php', debug: false };

// Force development mode for testing
window.DEV_CONFIG = { formEndpoint: 'send-audit-request-dev.php', debug: true };
```

This system ensures safe, seamless development while maintaining production stability.