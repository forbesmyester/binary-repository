import { AbsoluteDirectoryPath, Callback, Filename } from './Types';
import { RootReadable, GlobFunc } from './RootReadable';
export { GlobFunc } from './RootReadable';
import { join } from 'path';
import * as glob from 'glob';

export class RemotePendingCommitReadable extends RootReadable {

    protected globPattern: string = '/*.commit';

    constructor({glob}: {glob: GlobFunc}, rootPath: AbsoluteDirectoryPath, opts = {}) {

        super(
            { glob },
            join(rootPath, '.ebak', 'remote-transactions'),
            [],
            Object.assign({objectMode: true}, opts)
        );

    }
}
