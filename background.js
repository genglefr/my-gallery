chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('app/index.html', {
        'outerBounds': {
            'width': 600,
            'height': 900
        }
    });
});