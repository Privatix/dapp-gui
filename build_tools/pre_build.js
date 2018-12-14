const fs = require('fs');

fs.readdir('./src/i18next/vocabulary', (err, files) => {
  if(err){
    console.log("Can't read vocabulary files");
    process.exit(1);
  }
  const langs = files.filter(file => (/\.json$/).test(file))
                     .map(file => ({value: file.replace(/\.json$/, ''), label: require(`../src/i18next/vocabulary/${file}`).lang}));
  langsSource = langs.map(lang => `{value: '${lang.value}', label:'${lang.label}'}`).join(',\n');
  fs.writeFileSync('./src/i18next/langs.ts', `
// it's generated code, don't try to change it
// look in /build_tools/pre_build.js instead

export const langsList = [
    ${langsSource}
];
`, {encoding: 'utf8'});
})
