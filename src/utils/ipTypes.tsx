import i18n from 'i18next/init';

const getIpTypes = function () {
    return [
        {
            type: 'residential',
            name: i18n.t('offerings/createOffering:ResidentialIP')
        },
        {
            type: 'datacenter',
            name: i18n.t('offerings/createOffering:DataCenterIP')
        },
        {
            type: 'mobile',
            name: i18n.t('offerings/createOffering:СellularMobileIP')
        },
    ];
};

export const ipTypes = getIpTypes();

const getIpTypesAssoc = function () {
    let ipTypesObj = [];
    ipTypes.map(ipType => ipTypesObj[ipType.type] = ipType.name);

    return ipTypesObj;
};

export const ipTypesAssoc = getIpTypesAssoc();
