import { AbsoluteFilePath } from './Types';
export interface AtomicFileWrite {
    (tmpPath: AbsoluteFilePath, finalPath: AbsoluteFilePath, contents: string[]): Promise<AbsoluteFilePath>;
}
export default function atomicFileWrite(tmpPath: AbsoluteFilePath, finalPath: AbsoluteFilePath, contents: string[]): Promise<AbsoluteFilePath>;
