#!/bin/bash

# AUTDF Assessment Agent Deployment Script
# Deploys and runs the Frontend Assessment Specialist Agent

set -e

echo "🚀 Deploying AUTDF Assessment Agent"

# Configuration
PROJECT_ROOT="/home/jgatlit/projects/aichemist.agency"
AGENT_PROMPT="$PROJECT_ROOT/scripts/autdf-assessment-agent-prompt.md"
REPORTS_DIR="$PROJECT_ROOT/reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create reports directory if it doesn't exist
mkdir -p "$REPORTS_DIR"

# Validate agent prompt exists
if [ ! -f "$AGENT_PROMPT" ]; then
    echo "❌ Agent prompt file not found: $AGENT_PROMPT"
    exit 1
fi

echo "📋 Agent Configuration:"
echo "  - Project Root: $PROJECT_ROOT"
echo "  - Agent Prompt: $AGENT_PROMPT"
echo "  - Reports Dir: $REPORTS_DIR"
echo "  - Timestamp: $TIMESTAMP"

# Read the agent prompt
PROMPT_CONTENT=$(cat "$AGENT_PROMPT")

echo ""
echo "🔍 Launching Frontend Assessment Specialist Agent..."
echo "   This will analyze all frontend files and generate improvement recommendations"
echo ""

# Launch the assessment agent
# Note: This would be executed within Claude Code interface
echo "Execute this command in Claude Code:"
echo ""
echo "Task:"
echo "  description: 'AUTDF Frontend Assessment'"
echo "  subagent_type: 'general-purpose'"
echo "  prompt: |"
echo "    $PROMPT_CONTENT"
echo ""
echo "    SPECIFIC TASK:"
echo "    Perform comprehensive frontend assessment of aichemist.agency project."
echo "    Focus on files in public_html/ directory and subdirectories."
echo "    Generate prioritized improvement recommendations for 2-week sprint cycle."
echo "    Include specific file paths, line numbers, and implementation steps."
echo ""

echo "📊 Assessment Results will be available in:"
echo "  - Console output from agent"
echo "  - $REPORTS_DIR/autdf-assessment-$TIMESTAMP.md"
echo ""

echo "🎯 Next Steps After Assessment:"
echo "  1. Review agent recommendations"
echo "  2. Prioritize improvements for sprint planning"
echo "  3. Execute high-priority fixes"
echo "  4. Validate improvements"
echo "  5. Schedule next assessment cycle"
echo ""

echo "✅ AUTDF Agent deployment instructions ready"
echo "   Copy the Task command above and execute in Claude Code interface"