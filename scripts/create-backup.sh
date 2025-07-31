#!/bin/bash

# AUTDF Pre-Execution Backup Script
# Creates complete backup of project before making any changes

set -e

# Configuration
PROJECT_ROOT="/home/jgatlit/projects/aichemist.agency"
BACKUP_BASE_DIR="$PROJECT_ROOT/_backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$BACKUP_BASE_DIR/backup_$TIMESTAMP"
EXCLUDE_PATTERNS=("node_modules" ".git" "*.log" "*.tmp" "_backups")

echo "🔄 Creating AUTDF Pre-Execution Backup"
echo "   Timestamp: $TIMESTAMP"
echo "   Source: $PROJECT_ROOT"
echo "   Destination: $BACKUP_DIR"

# Create backup directory structure
mkdir -p "$BACKUP_DIR"

# Create exclusion file for rsync
EXCLUDE_FILE=$(mktemp)
for pattern in "${EXCLUDE_PATTERNS[@]}"; do
    echo "$pattern" >> "$EXCLUDE_FILE"
done

echo "📦 Backing up project files..."

# Create complete backup using rsync
rsync -av \
    --exclude-from="$EXCLUDE_FILE" \
    --exclude="_backups" \
    "$PROJECT_ROOT/" \
    "$BACKUP_DIR/" \
    --progress

# Clean up temporary file
rm "$EXCLUDE_FILE"

# Create backup manifest
echo "📋 Creating backup manifest..."
cat > "$BACKUP_DIR/BACKUP_MANIFEST.md" << EOF
# Backup Manifest

**Created**: $(date)
**Timestamp**: $TIMESTAMP
**Source**: $PROJECT_ROOT
**Backup Method**: rsync with exclusions

## Excluded Patterns
$(printf "- %s\n" "${EXCLUDE_PATTERNS[@]}")

## Backup Contents
\`\`\`
$(find "$BACKUP_DIR" -type f | head -20)
... ($(find "$BACKUP_DIR" -type f | wc -l) total files)
\`\`\`

## File Counts by Type
- HTML: $(find "$BACKUP_DIR" -name "*.html" | wc -l)
- CSS: $(find "$BACKUP_DIR" -name "*.css" | wc -l)
- JavaScript: $(find "$BACKUP_DIR" -name "*.js" | wc -l)
- PHP: $(find "$BACKUP_DIR" -name "*.php" | wc -l)
- Images: $(find "$BACKUP_DIR" -name "*.png" -o -name "*.jpg" -o -name "*.gif" | wc -l)

## Restore Instructions
To restore this backup:
\`\`\`bash
cd $PROJECT_ROOT
rm -rf public_html/ docs/ scripts/ (BE VERY CAREFUL)
cp -r $BACKUP_DIR/* ./
\`\`\`

Or use the restore script:
\`\`\`bash
./scripts/restore-backup.sh $TIMESTAMP
\`\`\`
EOF

# Calculate backup size
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)

# Update backup index
BACKUP_INDEX="$BACKUP_BASE_DIR/backup_index.md"
echo "## Backup: $TIMESTAMP" >> "$BACKUP_INDEX"
echo "- **Created**: $(date)" >> "$BACKUP_INDEX"
echo "- **Size**: $BACKUP_SIZE" >> "$BACKUP_INDEX"
echo "- **Files**: $(find "$BACKUP_DIR" -type f | wc -l)" >> "$BACKUP_INDEX"
echo "- **Path**: $BACKUP_DIR" >> "$BACKUP_INDEX"
echo "" >> "$BACKUP_INDEX"

# Cleanup old backups (keep last 10)
echo "🧹 Cleaning up old backups (keeping last 10)..."
cd "$BACKUP_BASE_DIR"
ls -dt backup_* | tail -n +11 | xargs rm -rf 2>/dev/null || true

echo "✅ Backup completed successfully!"
echo ""
echo "📊 Backup Summary:"
echo "   Location: $BACKUP_DIR"
echo "   Size: $BACKUP_SIZE"
echo "   Files: $(find "$BACKUP_DIR" -type f | wc -l)"
echo ""
echo "🔧 To restore this backup:"
echo "   ./scripts/restore-backup.sh $TIMESTAMP"
echo ""
echo "📋 View all backups:"
echo "   cat $BACKUP_INDEX"

# Return backup timestamp for use by other scripts
echo "$TIMESTAMP"