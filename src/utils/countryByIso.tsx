import countries from './countries';

export default function (iso: string) {
    const country = countries.filter((country:any) => country.id === iso.toUpperCase());
    return country[0] ? country[0].name : '';
}
