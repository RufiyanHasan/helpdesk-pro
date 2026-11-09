export const LOGO_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];

export const MAX_LOGO_BYTES = 1024 * 1024;

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// Checks the file's contents really match its type, instead of trusting the header the browser sent.
export function isLogoFile(type: string, data: Buffer): boolean {
    if (type === 'image/png') {
        return data.subarray(0, 8).equals(PNG_SIGNATURE);
    }
    if (type === 'image/jpeg') {
        return data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;
    }
    if (type === 'image/svg+xml') {
        return /<svg[\s>]/i.test(data.toString('utf8'));
    }
    return false;
}
