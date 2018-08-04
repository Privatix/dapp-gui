const p = require('child_process');
const fs = require('fs');
const config = require('./package');

async function start(){
    const originConfig = Object.assign({},config);
    const currentBranch = (await exec('git rev-parse --abbrev-ref HEAD', 'Get release branch')).trim();
    const release = currentBranch.match(/^release\/(.*)/);
    if (!release){
        console.log('Current branch "'+currentBranch+'" is not release branch');
        process.exit(1);
    };
    if (config.version == release[1]){
        console.log('Version is same with package.json');
        process.exit(1);
    }
    config.version = release[1];
    try{
        fs.writeFileSync('./package.json', JSON.stringify(config, null, 4));
        const diff = await exec('git diff ./package.json');
        if (diff.trim() == ''){
            console.log('package.json with this version already committed');
            process.exit();
        }
    }catch(err){
        console.log(err);
        fs.writeFileSync('./package.json', JSON.stringify(originConfig, null, 4));
    }
}



const exec = async function(command, message){
    return new Promise((resolve, reject) => {
        if (message) console.log(message);
        p.exec(command,function(err, stdout){
            if (err){
                reject(err);
                return;
            }
            resolve(stdout);
        })
    });
};

start();