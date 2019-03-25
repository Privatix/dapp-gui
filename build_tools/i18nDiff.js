const path = require('path');

const en = require(path.join(__dirname, '../src/i18next/vocabulary/en.json'));

// console.log(Object.keys(en));

const fs = require('fs');

fs.readdir(path.join(__dirname, '../src/i18next/vocabulary'), (err, files) => {
    // console.log(err, files);
  files.forEach(file => {
      if(file === 'en.json' | file.substr(-5) !== '.json'){
          return;
      }
      const voc = require(path.join(__dirname, `../src/i18next/vocabulary/${file}`));
      const currentKeys = Object.keys(voc);
      const notDeleted = Object.keys(voc).map(key => key in en ? false : key).filter(key => key);
      notDeleted.forEach(key => {
          delete voc[key];
      });

      Object.keys(voc).forEach(key => {
          if('object' !== typeof en[key]){
              return;
          }
          const notDeleted = Object.keys(voc[key]).map(dkey => dkey in en[key] ? false : dkey).filter(key => key);
          notDeleted.forEach(delKey => {
              delete voc[key][delKey];
          });
      });
      fs.writeFileSync(path.join(__dirname, `../src/i18next/vocabulary/${file}`), JSON.stringify(voc, null, '    '));
      console.log(file);
      console.log(notDeleted);
  });
});

// const langs = 
