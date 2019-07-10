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

export default getIpTypes();
