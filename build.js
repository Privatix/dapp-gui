const fs = require('fs');
const config = require('./package');
config.devDependencies = {};
config.main = './main.js';
const start = config.scripts.start;
config.scripts = {start};
config.private = false;

const p = [];
const settings = require('./build/settings');

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
    fs.writeFileSync('./build/settings.json', JSON.stringify(settings, null, 4));
});

fs.writeFileSync('./build/package.json', JSON.stringify(config, null, 4));
