const fs = require('fs');
const config = require('../package');

const packager = config.devDependencies['electron-packager'];
config.devDependencies = {};
config.dependencies = {'electron-packager': packager};
config.main = './main.js';
config.private = false;

const p = [];
const settings = require('../build/settings');

p.push(new Promise((resolve, reject) => {
    require('child_process').exec('git rev-parse HEAD', function(err, stdout) {
        settings.commit  = stdout.trim();
        resolve();
    })
}));
p.push(new Promise((resolve, reject) => {
    require('child_process').exec('git tag -l --points-at HEAD', function(err, stdout) {
        settings.release = stdout.trim();
        resolve();
    })
}));

Promise.all(p).then(()=> {
    fs.writeFileSync(__dirname + '/../build/settings.json', JSON.stringify(settings, null, 4));
});

fs.writeFileSync(__dirname + '/../build/package.json', JSON.stringify(config, null, 4));
