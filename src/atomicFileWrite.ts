import * as fs from 'fs';
import { AbsoluteFilePath } from './Types';

export interface AtomicFileWrite {
    (tmpPath: AbsoluteFilePath, finalPath: AbsoluteFilePath, contents: string[]): Promise<AbsoluteFilePath>;
}

export default function atomicFileWrite(tmpPath: AbsoluteFilePath, finalPath: AbsoluteFilePath, contents: string[]): Promise<AbsoluteFilePath> {
    return new Promise((resolve, reject) => {
        fs.writeFile(tmpPath, contents.join("\n"), { encoding: 'utf8' }, (err) => {
            if (err) { return reject(err); }
            fs.rename(tmpPath, finalPath, (err) => {
                if (err) { return reject(err); }
                resolve(finalPath);
            });
        });
    });
}
