export default function safeSize(n: number) {
    if (n < 1024) { return false; }
    if (n < 1024 * 1024) {
        if (n % 1024 == 0) { return true; }
        return false;
    }
    if (n <= (1024 * 1024 * 1024)) {
        if (n % (1024 * 1024) == 0) { return true; }
        return false;
    }
    return false;
}

