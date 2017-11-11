import { AbsoluteDirectoryPath } from './Types';
export { AbsoluteDirectoryPath } from './Types';
export { Callback } from './Types';
import { RootReadable, Dependencies } from './RootReadable';

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

