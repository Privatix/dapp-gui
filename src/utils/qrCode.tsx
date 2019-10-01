import * as QRCode from 'qrcode';
import * as log from 'electron-log';

export default function (str: string): void {
    const canvas = document.getElementById('qrCode');

    QRCode.toCanvas(canvas, str, {width: 200}, function (error: any) {
        if (error){
            log.error(error);
        }
    });

}
