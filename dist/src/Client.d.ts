import { RemotePendingCommitStatRecordDecided, Callback } from './Types';
declare const _default: {
    constructFilepartFilename: (sha256: string, filePartIndex: [number, number], filePartByteCountThreshold: number, gpgKey: string) => string;
    constructFilepartLocalLocation: (configDir: string, gpgKey: string, rec: RemotePendingCommitStatRecordDecided) => string;
    infoFromCommitFilename(filename: string): {
        createdAt: Date;
        commitId: string;
        clientId: string;
        gpgKey: string;
    };
    constructCommitFilename: (commitId: string, commitGpgKey: string, clientId: string) => string;
    decrypt: (gpgKey: string, tmpfile: string, src: string, dst: string, next: Callback<void>) => void;
};
export default _default;
