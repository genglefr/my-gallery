var electronInstaller = require('electron-winstaller');
resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: './release-builds/MyGallery-win32-ia32',
    loadingGif : './build/spikeseed_white_loading.gif',
    outputDirectory: './release-builds/MyGallery-win32-installer',
    authors: 'Genglefr',
    exe: 'MyGallery.exe',
    setupIcon : './build/spikeseed_vXb_icon.ico'
});

resultPromise.then(() => console.log("Done."), (e) => console.log(`Error: ${e.message}`));