module.exports = {
    agent: null,
    generateSomeOffering: function (){
        return {
            serviceName: ''
           ,description: ''
           ,country: ''
           ,supply: ''
           ,unitName: 'MB'
           ,unitType: 'units'
           ,unitPrice: ''
           ,billingType: 'prepaid'
           ,maxBillingUnitLag: ''
           ,minUnits: ''
           ,maxUnit: ''
           ,maxSuspendTime: ''
           ,maxInactiveTimeSec: ''
           ,template: ''
           ,product: ''
        };
    },
    bind: function(holder){
        this.agent = holder;
        return this;
    }
};
