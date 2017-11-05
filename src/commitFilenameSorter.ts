import { BASE_TLID_TIMESTAMP, BASE_TLID_UNIQUENESS, Filename } from './Types';
import * as getTlidEncoderDecoder from 'get_tlid_encoder_decoder';
import Client from './Client';

let tlidEncoderDecoder = getTlidEncoderDecoder(BASE_TLID_TIMESTAMP, BASE_TLID_UNIQUENESS);

// TODO: Write tests for this.

export default function(a: Filename, b: Filename): number {
    let api = Client.infoFromCommitFilename(a.path);
    let bpi = Client.infoFromCommitFilename(b.path);
    if ((!api.commitId) || (!bpi.commitId)) {
        console.log("NO SORT!");
        throw new Error(`Could not decode a filename ${a} or ${b}`);
    }
    return tlidEncoderDecoder.sort(api.commitId, bpi.commitId);
}
