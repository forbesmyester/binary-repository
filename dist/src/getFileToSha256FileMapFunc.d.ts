import { Callback, AbsoluteFilePath, AbsoluteDirectoryPath, Sha256, File, Sha256File } from './Types';
import { CmdArgument, CmdSpawner } from './CmdRunner';
import { MapFunc } from 'streamdash';
import { SingleLineCmdResult } from './singleLineCmdRunner';
export declare function getRunner({cmdSpawner}: {
    cmdSpawner: CmdSpawner;
}): (inArg: CmdArgument, next: Callback<SingleLineCmdResult>) => void;
export declare function getFileToSha256FileMapFunc({runner}: {
    runner: MapFunc<AbsoluteFilePath, Sha256>;
}, rootPath: AbsoluteDirectoryPath): MapFunc<File, Sha256File>;
