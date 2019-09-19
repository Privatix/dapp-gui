export default function (ext: string, fileName: string): string {
    const fileNameExt = fileName.slice(-5);
    ext = '.' + ext;

    if (fileNameExt !== ext) {
        fileName = fileName + ext;
    }

    return fileName;
}
