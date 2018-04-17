const mocks = [
    {endpoint: /\/auth/, method: 'post', res: [true]}
//   ,{endpoint: /\/accounts/, method: 'post', res: [true]}
    // {endpoint: /\/templates/, method: 'get', res: [template1, template2]}
//   {endpoint: /\/templates\?/, method: 'get', res: [template1]}
//   ,{endpoint: /\/offerings\?/, method: 'get', res: [{title: 'second offering', id: 2}, {title: 'third offering', id: 3}]}
//   ,{endpoint: /\/offerings\/\d+\/status/, method: 'get', res: {code: 200, status: 'OK!'}}
//   ,{endpoint: /\/offerings/, method: 'get', res: [{title: 'first offering', id: 1}, {title: 'second offering', id: 2}, {title: 'third offering', id: 3}]}
//   ,{endpoint: /\/channels\/\d+\/status/, method: 'get', res: {code: 200, status: 'channel OK!'}}
   ,{endpoint: /\/product\/.*\/status/, method: 'get', res: {code: 200, status: 'mocked!!!'}}
//   ,{endpoint: /\/products/, method: 'get', res: [{title: 'first product', id: 1}, {title: 'second product', id: 2}, {title: 'third product', id: 3}]}
//   ,{endpoint: /\/endpoints/, method: 'get', res: {id: 17, src: '{"test_prop": "test_val"}'}}
//   ,{endpoint: /\/settings/, method: 'get', res: [{name: 'option1', value: 'some value', desc: 'some desc'}, {name: 'option2', value: 'some value', desc: 'some desc'}, {name: 'option3', value: 'some value', desc: 'some desc'}]}
//   ,{endpoint: /\/channels\?/, method: 'get', res: [{title: 'second channel', id: 2}, {title: 'third channel', id: 3}]}
//   ,{endpoint: /\/channels/, method: 'get', res: [{title: 'first channel', id: 1}, {title: 'second channel', id: 2}, {title: 'third channel', id: 3}]}
//   ,{endpoint: /\/sessions/, method: 'get', res: [{title: 'first session', id: 1}, {title: 'second session', id: 2}, {title: 'third session', id: 3}]}
 //  ,{endpoint: /\/products/, method: 'get', res: [{title: 'first product', id: 1}, {title: 'second product', id: 2}, {title: 'third product', id: 3}]}

];

export default {
    has: function(req: any){
        const is = mock => mock.endpoint.test(req.endpoint) && req.options.method.toLowerCase() === mock.method.toLowerCase();
        return mocks.some(is);
    },
    get: function(req: any){
        const is = mock => mock.endpoint.test(req.endpoint) && req.options.method.toLowerCase() === mock.method.toLowerCase();
        const res = mocks.map(mock => is(mock) ? mock.res : undefined ).filter(res => res);
        if(res.length < 1){
            console.log('have no response for request: ', req);
            process.exit(1);
        }
        return res[0];
    }
};
