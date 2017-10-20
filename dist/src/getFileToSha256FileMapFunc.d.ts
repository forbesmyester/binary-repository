import { Callback, AbsoluteFilePath, AbsoluteDirectoryPath, Sha256, File, Sha256File } from './Types';
import { CmdSpawner } from './CmdRunner';
import { MapFunc } from 'streamdash';
export declare function getRunner({cmdSpawner}: {
    cmdSpawner: CmdSpawner;
}): (inArg: string, next: Callback<string>) => void;
export declare function getFileToSha256FileMapFunc({runner}: {
    runner: MapFunc<AbsoluteFilePath, Sha256>;
}, rootPath: AbsoluteDirectoryPath): MapFunc<File, Sha256File>;
