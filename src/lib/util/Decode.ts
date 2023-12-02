import CryptoJS from 'crypto-js';

// ???
const KEY = 'AeyTest';

export function decrypt(str: string): string {
	return CryptoJS.AES.decrypt(str, KEY).toString(CryptoJS.enc.Utf8);
}

export async function decryptResponseAsJson(res: Response): any {
	if (!res.ok) {
		throw new Error('');
	}

	const encrypted = await res.text();
	const decrypted = decrypt(encrypted);
	return JSON.parse(decrypted);
}
