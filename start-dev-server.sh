#!/bin/bash

# Start PHP development server
echo "Starting PHP development server on http://localhost:8080"
echo "Press Ctrl+C to stop"

# Check if PHP is installed
if ! command -v php &> /dev/null; then
    echo "PHP is not installed. Please install PHP first."
    exit 1
fi

# Start PHP built-in server
php -S localhost:8080 -t public_html