export default function padLeadingZero(len: number, n: number|string): string {
    let r = "" + n;
    while (r.length < len) { r = "0" + r; }
    return r;
};

