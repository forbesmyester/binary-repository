import { AbsoluteDirectoryPath } from './Types';
export declare function push(rootDir: AbsoluteDirectoryPath, configDir: AbsoluteDirectoryPath): void;
export declare function listUpload(rootDir: AbsoluteDirectoryPath, configDir: AbsoluteDirectoryPath): void;
export declare function upload(rootDir: AbsoluteDirectoryPath, configDir: AbsoluteDirectoryPath): void;
export declare function fetch(rootDir: AbsoluteDirectoryPath, configDir: AbsoluteDirectoryPath): void;
export declare function listDownloadImpl(rootDir: AbsoluteDirectoryPath, configDir: AbsoluteDirectoryPath): any;
export declare function listDownload(rootDir: AbsoluteDirectoryPath, configDir: AbsoluteDirectoryPath): void;
export declare function download(rootDir: AbsoluteDirectoryPath, configDir: AbsoluteDirectoryPath): void;
