# Deployment Exclusions Guide

## Overview
This document explains which files should be excluded from production deployments to Hostinger, ensuring development files don't interfere with the live environment.

## Exclusion Files

### `.ignore`
General ignore file for development files that should never be deployed.

### `.deployignore`
Specific deployment exclusion list for production deployments to Hostinger.

## Critical Exclusions

### **MUST EXCLUDE** (Will break production)
```bash
# Development form handlers
send-audit-request-dev.php      # Development-only form handler
send-audit-request-enhanced.php # Alternative development handler

# Development configuration  
config-local.php               # Local development config
.env.local                     # Local environment variables

# Development logs
logs/                          # All development logs
*.log                          # Any log files
```

### **SHOULD EXCLUDE** (Security/Performance)
```bash
# Backup system
_backups/                      # Local backup storage
scripts/create-backup.sh       # Backup scripts
scripts/restore-backup.sh      # Restore scripts

# Development documentation
docs/AUTDF-*.md               # Framework documentation
docs/DEVELOPMENT-*.md         # Development guides

# Temporary files
temp/                         # Temporary files
tmp/                          # Temporary files
cache/                        # Cache files
```

### **OPTIONAL EXCLUDE** (Space/Clarity)
```bash
# Development scripts (may be useful for maintenance)
scripts/deploy-*.sh           # Deployment automation

# Extended documentation (may be useful for reference)
docs/                         # All documentation

# Node.js development tools (only used for formatting)
node_modules/                 # Development dependencies
package-lock.json             # Lock file
```

## Safe to Deploy

### **Core Application Files**
```bash
# Always deploy these
index.html                    # Main application (with smart detection)
send-audit-request.php        # PRODUCTION form handler (unchanged)
styles.css                    # Styles
images/                       # Images and assets
js/dev-config.js             # Smart environment detection (safe)
```

### **Safe Development Files**
```bash
# These are safe to deploy (auto-detect production)
js/dev-config.js             # Auto-detects production, uses correct endpoints
.gitignore                   # Version control ignore (harmless)
package.json                 # Contains only dev tools (harmless)
```

## Deployment Methods

### **Method 1: Manual FTP/SFTP**
```bash
# Upload only these directories/files:
public_html/index.html
public_html/send-audit-request.php  # ORIGINAL production handler
public_html/styles.css
public_html/images/
public_html/js/dev-config.js        # Safe - auto-detects production
public_html/favicon.ico

# DO NOT upload:
public_html/send-audit-request-dev.php
public_html/config-local.php
public_html/logs/
```

### **Method 2: Rsync with Exclusions**
```bash
# Use .deployignore with rsync
rsync -av \
  --exclude-from=.deployignore \
  public_html/ \
  user@hostinger:/path/to/public_html/
```

### **Method 3: Deployment Script**
Create a deployment script that automatically excludes development files:

```bash
#!/bin/bash
# deploy-to-hostinger.sh

# Create temporary deployment directory
DEPLOY_DIR=$(mktemp -d)

# Copy files excluding development items
rsync -av \
  --exclude-from=.deployignore \
  public_html/ \
  "$DEPLOY_DIR/"

# Upload to Hostinger
rsync -av \
  "$DEPLOY_DIR/" \
  user@hostinger:/path/to/public_html/

# Cleanup
rm -rf "$DEPLOY_DIR"
```

## Verification

### **After Deployment, Verify:**
1. **Form handler**: Only `send-audit-request.php` exists (not `*-dev.php`)
2. **No development logs**: No `logs/` directory
3. **No backups**: No `_backups/` directory
4. **Environment detection**: Visit site, no "DEVELOPMENT MODE" banner
5. **Form works**: Submit form, should send email (not log to files)

### **Test Production Environment**
```bash
# Test that form uses production handler
curl -X POST https://aichemist.agency/send-audit-request.php \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","company":"Test","challenge":"Test"}'

# Should return success and send actual email
```

## Emergency Rollback

If deployment causes issues:

1. **Quick fix**: Upload original `send-audit-request.php` 
2. **Full rollback**: Re-upload previous working version
3. **Check logs**: Review server error logs for issues

## Best Practices

1. **Test locally first**: Always test changes with `php -S localhost:8081 -t public_html`
2. **Use staging**: Deploy to staging environment before production
3. **Keep backups**: Backup production before deploying
4. **Monitor logs**: Check production logs after deployment
5. **Test form**: Always test form submission after deployment

This exclusion system ensures development and production environments remain cleanly separated while maintaining the smart detection system that works seamlessly in both environments.