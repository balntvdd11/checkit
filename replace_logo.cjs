const fs = require('fs');

const filesToUpdate = [
    'c:/CheckIT/checkit/src/styles/AnimatedBackground.css',
    'c:/CheckIT/checkit/src/main.tsx',
    'c:/CheckIT/checkit/src/app/pages/Landing/Landing.tsx',
    'c:/CheckIT/checkit/src/app/pages/EVENTSCode/EVENTSCode.tsx',
    'c:/CheckIT/checkit/src/app/components/shared/COAccessLogo.tsx'
];

filesToUpdate.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(/checkITlogo\.png/g, 'coalogo.png');
        content = content.replace(/checkITLogo(Img)?/g, 'coaLogo');
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated:', file);
    }
});
