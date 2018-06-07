import { BASE_TLID_UNIQUENESS, BASE_TLID_TIMESTAMP } from './Types';

import * as getTlidEncoderDecoder from 'get_tlid_encoder_decoder';

let tLIdEncoderDecoder = getTlidEncoderDecoder(
    BASE_TLID_TIMESTAMP,
    BASE_TLID_UNIQUENESS
);



export default function commitIdGenerator(d: Date) {
    return tLIdEncoderDecoder.encode(d.getTime());
}

