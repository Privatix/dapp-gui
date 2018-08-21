// имеем явно три вида тестов - неавторизованные на одном приложении - тестим визард, авторизацию, обращаемся неавторизованно в эндпоинтам
// авторизованные засетапленные на одном приложении
// авторизованные засетапленные на двух приложениях

const assert = require('assert');
const fetch = require('node-fetch');
const config = require('./config');
const App = require('./app');
console.log(App);
const check = require('./until');
const until = check(1000, 3); // timeout 1sec, check no more then 3 times)

// const app1 = App(config.app[0]);
const agent = new App();

const api = function(endpoint, options){
        if(!options.headers){
           options.headers = {};
        }
        if(!options.headers.Authorization){
            options.headers.Authorization = 'Basic ' + Buffer.from(`username:${config.pwd}`).toString('base64');   
        }
        return fetch(endpoint, options);
};

describe('dappctrl tests', function() {

  describe('#auth', function() {

    it('authorization: right password', function(done) {
        const options = {method: 'get'};
        api(`${config.apiEndpoint}/products`, options)
            .then(res => {
                if(res.status === 200){
                    done();
                }else {
                    // TODO error handling
                    done(new Error('not authorized'));
                }
            });
    });

    it('authorization: wrong password', function(done) {
        const options = {method: 'get'};
        options.headers = {};
        options.headers.Authorization = 'Basic ' + Buffer.from(`username:${config.pwd}_`).toString('base64');
        fetch(`${config.apiEndpoint}/products`, options)
            .then(res => {
                if(res.status === 200){
                    done(new Error('authorized with wrong password'));
                }else {
                    done();
                }
            });
    });
  });

  describe('#accounts', function() {

    it('accounts are settled', function(done) {
        const options = {method: 'get'};
        api(`${config.apiEndpoint}/accounts`, options)
            .then(async res => {
                return res.json();
            })
            .then(accounts => {
                if(accounts.length){
                    done();
                }else {
                    done(new Error('there is not any accounts'));
                }
            });
    });

  });

  describe('#products', function() {

    it('products are settled', function(done) {
        const options = {method: 'get'};
        api(`${config.apiEndpoint}/products`, options)
            .then(async res => {
                return res.json();
            })
            .then(products => {
                if(products.length){
                    done();
                }else {
                    done(new Error('there is not any products'));
                }
            });
    });

  });

  describe('#templates', function() {

    it('templates are settled', function(done) {
        const options = {method: 'get'};
        api(`${config.apiEndpoint}/templates`, options)
            .then(async res => {
                return res.json();
            })
            .then(templates => {
                if(templates.length){
                    done();
                }else {
                    done(new Error('there is not any templates'));
                }
            });
    });

  });

  describe('#publish offering', function() {

    it('should create new offering', async function(){
        return new Promise(function(resolve, reject){
            (async function worker (){
                const body = [{
                    'key': 'user.isagent',
                    'value': false,
                    'description': 'Specifies user role. "true" - agent. "false" - client.',
                    'name': 'user role is agent'
                }];

                await api(`${config.apiEndpoint}/settings`, {method: 'put', body: JSON.stringify(body)});

                const options = {method: 'get'};
                const accounts = await (await api(`${config.apiEndpoint}/accounts`, options)).json();
                const products = await (await api(`${config.apiEndpoint}/products`, options)).json();
                const product = products[0];

                const account = accounts.find((account) => account.isDefault);


                const payload = {
                    serviceName: 'test'
                   ,description: 'test'
                   ,country: 'UA'
                   ,supply: 100
                   ,unitName: 'MB'
                   ,unitType: 'units'
                   ,unitPrice: 0.1
                   ,billingType: 'prepaid'
                   ,maxBillingUnitLag: 1800
                   ,minUnits: 10
                   ,maxUnit: 20
                   ,maxSuspendTime: 1800
                   ,maxInactiveTimeSec: 1800
                };

                payload.product = product.id;
                payload.agent = account.id;
                payload.template = product.offerTplID;
                payload.deposit = payload.supply * payload.unitPrice * payload.minUnits;
                payload.billingInterval = 1;
                payload.billingType = 'postpaid';
                payload.additionalParams = Buffer.from('{}').toString('base64');

                console.log('PAYLOAD', payload);

                const response = await (await api(`${config.apiEndpoint}/offerings`, {method: 'post', body: payload})).json();
                if(!response.length){
                    reject(new Error('offering did\'t created'));
                    return;
                }
                const createdOffering = response[0];

                const retrievedOfferings = await (await api(`${config.apiEndpoint}/offerings?id=${createdOffering.id}`, options)).json();
                if(!retrievedOfferings.length){
                    reject(new Error('offering not found'));
                    return;
                }
                const retrievedOffering = retrievedOfferings[0];
                    console.log(retrievedOffering, createdOffering);
                if(!retrievedOffering.id != createdOffering.id){
                    reject(new Error('offerings not the same'));
                    return;
                }else{
                    resolve();
                }
            })();
        });

    });

    it('should change status of offering when published', async function() {
        this.timeout(20000);
        // это тест проверяет только изменение статуса в базе при публикации офферинга
        // ничего больше. То что офферинг реально ушел в чейн проверяется в парном тесте
        // получением офферинга на клиенте

        // app2.authorise();
        // const agent = app2.switchToAgent();
    //-------------- эта часть должна уйти в beforeeach? или в глобал и делать один раз для всех парных тестов?
        const offeringModel = await agent.stuff.generateSomeOffering();
        console.log(offeringModel);
        const agentOffering = await agent.publishOffering(offeringModel);
        // await until(agentOffering.isPublished)

        assert.equal(agentOffering.isPublished(), true);
    });

/*
    it('should return -1 when the value is not present', async function() {
        app1.authorise(); // как? он должен знать пароль, аппликуха должна быть засетаплена (кошелек с деньгами и приксами)
        const client = app1.switchToClient();

        app2.authorise();
        const agent = app2.switchToAgent();
    //-------------- эта часть должна уйти в beforeeach? или в глобал и делать один раз для всех парных тестов?
        const offeringModel = stuff.generateSomeOffering();

        const agentOffering = agent.publishOffering(offeringModel);
        await until(agentOffering.isPublished);
        await until(client.canSeeTheOffering(agentOffering));

        // возвращаем результат ожидания клиента
        assert.equal([1,2,3].indexOf(4), -1);
    });
 */
  });
});
