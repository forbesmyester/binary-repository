import { AbsoluteDirectoryPath, Callback, Filename } from './Types';
export { AbsoluteDirectoryPath } from './Types';
export { Callback } from './Types';
import { Readable } from 'stronger-typed-streams';
import { GlobFunc, RootReadable, Dependencies } from './RootReadable';

import * as glob from 'glob';

export default class RemoteCommitLocalFiles extends RootReadable {

    constructor(deps: Dependencies, localRepo: AbsoluteDirectoryPath, opts = {}) {
        super(
            deps,
            localRepo,
            [],
            'c-*',
            opts
        );
    }

}

