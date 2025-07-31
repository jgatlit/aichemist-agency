// Development Configuration
// This file automatically detects local development and switches endpoints

(function() {
    // Check if we're running locally
    const isLocalDev = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.port === '8081' ||
                       window.location.port === '8080';

    if (isLocalDev) {
        console.log('🔧 Development mode detected - using dev endpoints');
        
        // Override form submission endpoint for development
        window.DEV_CONFIG = {
            formEndpoint: 'send-audit-request-dev.php',
            debug: true,
            environment: 'development'
        };

        // Add development banner to page
        const banner = document.createElement('div');
        banner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #ff4444;
            color: white;
            padding: 5px 10px;
            text-align: center;
            font-weight: bold;
            font-size: 12px;
            z-index: 10000;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        `;
        banner.innerHTML = '🔧 DEVELOPMENT MODE - Form submissions logged to files';
        document.body.appendChild(banner);

        // Adjust body padding to account for banner
        document.body.style.paddingTop = '30px';
        
    } else {
        // Production configuration
        window.DEV_CONFIG = {
            formEndpoint: 'send-audit-request.php',
            debug: false,
            environment: 'production'
        };
    }

    // Helper function to get the correct endpoint
    window.getFormEndpoint = function() {
        return window.DEV_CONFIG ? window.DEV_CONFIG.formEndpoint : 'send-audit-request.php';
    };

    // Helper function to check if debug mode
    window.isDebugMode = function() {
        return window.DEV_CONFIG && window.DEV_CONFIG.debug;
    };

    if (window.isDebugMode()) {
        console.log('📋 Dev Config loaded:', window.DEV_CONFIG);
    }
})();