const fs = require('fs');
const tparser = require('typescript-parser');
console.log(tparser);
const parser = new tparser.TypescriptParser();

const offerToCheck = {
    additionalParams: '{}'
   ,agent: 'hahaha'
   ,billingInterval: 10
   // ,billingType: 20
};

// or a filepath
const src = fs.readFileSync('./def.ts', {encoding: 'utf8'});
parser.parseFile('./def.ts', 'workspace root')
      .then(parsed => {
        // console.log(JSON.stringify(parsed.declarations, null, '\t'));

        // тут мы импортим нужные декларации
        const declarations = {};
        parsed.declarations.forEach(declaration => {
            if("properties" in declaration){
                declaration.properties.forEach(prop => {
                    prop.src = src.substring(prop.start, prop.end);
                    console.log(`^\s*${prop.name}\s*\?`);
                    const regExp = new RegExp(`^\\s*${prop.name}\\s*\\?`);
                    prop.required = !regExp.test(prop.src);
                });
            }
            declarations[declaration.name] = declaration;
        });


        // тут мы хотим передать объект, имя интерфейса и узнать, соответствует ли объект этому интерфейсу
        console.log(JSON.stringify(declarations, null, '\t'));
        console.log('CHECK!!!', isAppropriate(offerToCheck, 'Offering', declarations));
      });

const isAppropriate = function(obj, declarationName, declarations){
    // тут проверка на то что declaration - InterfaceDeclaration
    const declaration = declarations[declarationName];
    const scalars = ['string', 'boolean', 'number'];

    if(declaration instanceof tparser.InterfaceDeclaration){
        console.log('INTERFACE!!!', declarationName);
        return declaration.properties.every(prop => {
            if(!(prop.name in obj)){
                if(prop.required){
                    console.log('REQUIRED!!!', prop.name);
                    return false;
                }else{
                    return true;
                }
            }
            console.log('PROP IN OBJECT: ', prop.name);
            if(scalars.includes(prop.type)){
                console.log('SCALAR!!!', prop.name);
                return typeof obj[prop.name] === prop.type;
            }
            if(prop.type in declarations){
                return isAppropriate(obj[prop.name], prop.type, declarations)
            }
        });
    }else if(declaration instanceof tparser.EnumDeclaration){
        console.log('ENUM!!!', declarationName);
        return declaration.members.includes(obj);
    }


};
