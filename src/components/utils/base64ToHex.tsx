export default function(base64:string){
    const hex = new Buffer(base64, 'base64').toString('hex');
    return (hex.match(/^0x/)?hex:'0x'+hex);
}
