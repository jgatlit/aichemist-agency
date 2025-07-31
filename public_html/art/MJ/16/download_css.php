<?php
// Define the URL of the remote CSS file
$remoteCssUrl = isset($_GET['url']) ? $_GET['url'] : '';

// Validate the URL
if (empty($remoteCssUrl)) {
    echo "Error: No URL provided.";
    exit();
}

// Define the local path where the CSS file will be saved
// Ensure the 'css' directory exists and is writable by the web server
$localCssPath = __DIR__ . '/css/mojohealthmentor-styles.css';

// Create the 'css' directory if it doesn't exist
if (!is_dir(dirname($localCssPath))) {
    mkdir(dirname($localCssPath), 0755, true);
}

// Fetch the content of the remote CSS file
$cssContent = @file_get_contents($remoteCssUrl);

if ($cssContent === false) {
    echo "Error: Could not fetch CSS from " . $remoteCssUrl;
} else {
    // Save the content to the local file
    $bytesWritten = @file_put_contents($localCssPath, $cssContent);

    if ($bytesWritten === false) {
        echo "Error: Could not save CSS to " . $localCssPath . ". Check directory permissions.";
    } else {
        echo "CSS file saved successfully to " . $localCssPath;
    }
}
?>