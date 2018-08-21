const stuff = require('./stuff');

module.exports = class{
    constructor(config){
        this.publishOffering = function(offeringModel){
            return {
                isPublished: function(){
                    return true;
                }
            };
        }
        this.stuff = stuff.bind(this);
    }
};
