#!/bin/bash

# AUTDF Backup Restore Script
# Restores project from a specific backup timestamp

set -e

# Check if timestamp provided
if [ -z "$1" ]; then
    echo "❌ Error: Backup timestamp required"
    echo ""
    echo "Usage: $0 <timestamp>"
    echo ""
    echo "Available backups:"
    cat /home/jgatlit/projects/aichemist.agency/_backups/backup_index.md 2>/dev/null || echo "No backups found"
    exit 1
fi

TIMESTAMP="$1"
PROJECT_ROOT="/home/jgatlit/projects/aichemist.agency"
BACKUP_BASE_DIR="$PROJECT_ROOT/_backups"
BACKUP_DIR="$BACKUP_BASE_DIR/backup_$TIMESTAMP"

# Validate backup exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Error: Backup not found: $BACKUP_DIR"
    echo ""
    echo "Available backups:"
    ls -la "$BACKUP_BASE_DIR" | grep "backup_" || echo "No backups found"
    exit 1
fi

echo "⚠️  WARNING: This will overwrite current project files!"
echo "   Backup to restore: $TIMESTAMP"
echo "   Backup location: $BACKUP_DIR"
echo "   Target location: $PROJECT_ROOT"
echo ""
echo "📋 Backup manifest:"
cat "$BACKUP_DIR/BACKUP_MANIFEST.md" | head -20
echo ""

# Safety confirmation
read -p "Are you sure you want to restore this backup? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Restore cancelled"
    exit 1
fi

echo "🔄 Creating current state backup before restore..."
CURRENT_BACKUP_TIMESTAMP=$(./scripts/create-backup.sh | tail -1)
echo "   Current state backed up as: $CURRENT_BACKUP_TIMESTAMP"

echo "📦 Restoring backup: $TIMESTAMP"

# Create temporary restore directory
TEMP_RESTORE=$(mktemp -d)
echo "   Using temporary directory: $TEMP_RESTORE"

# Copy backup to temporary location
cp -r "$BACKUP_DIR"/* "$TEMP_RESTORE/"

# Remove backup manifest from restore
rm -f "$TEMP_RESTORE/BACKUP_MANIFEST.md"

# Perform restore (excluding _backups directory to avoid recursion)
echo "   Restoring files..."
rsync -av \
    --exclude="_backups" \
    --delete \
    "$TEMP_RESTORE/" \
    "$PROJECT_ROOT/" \
    --progress

# Cleanup temporary directory
rm -rf "$TEMP_RESTORE"

echo "✅ Backup restored successfully!"
echo ""
echo "📊 Restore Summary:"
echo "   Restored from: $TIMESTAMP"
echo "   Current state backed up as: $CURRENT_BACKUP_TIMESTAMP"
echo "   Files restored: $(find "$PROJECT_ROOT" -name "*.html" -o -name "*.css" -o -name "*.js" -o -name "*.php" | wc -l)"
echo ""
echo "🔧 To undo this restore:"
echo "   ./scripts/restore-backup.sh $CURRENT_BACKUP_TIMESTAMP"