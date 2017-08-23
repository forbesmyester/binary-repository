import { AbsoluteDirectoryPath, ByteOffset, ByteCount, IsLast, File, Sha256File, Sha256FilePart, Callback, FilePartIndex } from  './Types';
import { Transform } from 'streamdash';
import { open, read } from 'fs';
import { join } from 'path';
import { addIndex, adjust, range, map, pipe, merge } from 'ramda';

export type Triple = [ByteOffset, ByteCount, IsLast, FilePartIndex];

export class Sha256FileToSha256FilePart extends Transform<Sha256File, Sha256FilePart> {


    constructor(private rootPath: AbsoluteDirectoryPath, private length: ByteCount, opts = {}) {
        super(Object.assign({objectMode: true}, opts));
    }

    _transform(a: Sha256File, encoding, cb) {

        let mapper = ([offset, length, isLast, part]: Triple): Sha256FilePart => {
            return merge(a, { offset, length, isLast, part });
        };


        let r = map(
            mapper,
            Sha256FileToSha256FilePart.parts(a.fileByteCount, this.length)
        );

        r.forEach(this.push.bind(this));

        cb(null);

    }

    public static parts(length: ByteCount, partSize: ByteCount): Triple[] {
        let steps = Math.floor((length - 1) / partSize) + 1;
        let mapIndexed = addIndex(map);
        let f = pipe(
            range(0),
            mapIndexed((n: number, ind): Triple => {
                let start = (n * partSize);
                let isLast = (start + partSize) < length;
                return [
                    start,
                    isLast ? partSize : -1,
                    !isLast,
                    [ind + 1, steps]
                ];
            })
        );
        return f(steps);
    }

}
