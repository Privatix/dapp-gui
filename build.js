const fs = require('fs');
const config = require('./package');
config.devDependencies = {};
config.main = './main.js';
const start = config.scripts.start;
config.scripts = {start};
config.private = false;

fs.writeFileSync('./build/package.json', JSON.stringify(config, null, 4));
