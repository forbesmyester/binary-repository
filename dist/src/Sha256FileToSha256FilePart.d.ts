import { ByteOffset, ByteCount, IsLast, Sha256File, Sha256FilePart, FilePartIndex } from './Types';
import { Transform } from 'streamdash';
export declare type Triple = [ByteOffset, ByteCount, IsLast, FilePartIndex, ByteCount];
export declare class Sha256FileToSha256FilePart extends Transform<Sha256File, Sha256FilePart> {
    private filePartByteCountThreshold;
    constructor(filePartByteCountThreshold: ByteCount, opts?: {});
    _transform(a: Sha256File, encoding: any, cb: any): void;
    static parts(length: ByteCount, filePartByteCountThreshold: ByteCount): Triple[];
}
