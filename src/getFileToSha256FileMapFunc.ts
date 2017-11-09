import { Callback, AbsoluteFilePath, AbsoluteDirectoryPath, Sha256, File, Sha256File } from  './Types';
import { CmdArgument, CmdSpawner } from './CmdRunner';
import { MapFunc } from 'streamdash';
import { SingleLineCmdResult, singleLineCmdRunner } from './singleLineCmdRunner';
import { join } from 'path';

export function getRunner({ cmdSpawner }: {cmdSpawner: CmdSpawner}): (inArg: CmdArgument, next: Callback<SingleLineCmdResult>) => void {
    return singleLineCmdRunner({ cmdSpawner }, "sha256sum", /^([a-z0-9]{64})/);
}

export function getFileToSha256FileMapFunc({ runner }: { runner: MapFunc<AbsoluteFilePath, Sha256> }, rootPath: AbsoluteDirectoryPath): MapFunc<File, Sha256File> {
    return function(f: File, next) {

        let fullPath: AbsoluteFilePath = join(rootPath, f.path);

        if (f.fileByteCount === 0) {
            return next(
                null,
                Object.assign(
                    { sha256: "0000000000000000000000000000000000000000000000000000000000000000" },
                    f
                )
            );
        }

        runner(fullPath, (err, sha256: Sha256) => {
            if (err) { return next(err); }
            next(null, Object.assign({ sha256 }, f));
        });

    };
}
