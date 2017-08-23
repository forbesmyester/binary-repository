import { BASE_TLID_TIMESTAMP, BASE_TLID_UNIQUENESS, Filename } from './Types';
import * as getTlidEncoderDecoder from 'get_tlid_encoder_decoder';

let tlidEncoderDecoder = getTlidEncoderDecoder(BASE_TLID_TIMESTAMP, BASE_TLID_UNIQUENESS);

// TODO: Write tests for this.

export default function(a: Filename, b: Filename): number {
    let tlidRe = /.*\/(.*)\-.*\.commit$/;
    let ap = a.path.match(tlidRe);
    let bp = b.path.match(tlidRe);
    if ((!ap) || (!bp)) {
        return 0;
    }
    return tlidEncoderDecoder.sort(ap[1], bp[1]);
}
