var electronInstaller = require('electron-winstaller');
resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: './release-builds/MyGallery-win32-ia32',
    outputDirectory: './release-builds/MyGallery-win32-installer',
    authors: 'Genglefr',
    exe: 'MyGallery.exe'
});

resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));