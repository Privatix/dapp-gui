module.exports = function(timeout, times){
    return function(handler){
        let attempt = 0;
        
        return new Promise(function(resolve, reject){
            const checker = () => {
                const res = handler();
                attempt++;
                Promise.resolve(res)
                       .then(val => {
                           if(val){
                               resolve(val);
                           }else{
                               if(attempt < times){
                                   setTimeout(checker, timeout);
                               }else{
                                   reject();
                               }
                           }
                       })
            };
            setTimeout(checker, timeout);
        });
    };
};
