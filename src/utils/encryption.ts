import crypto from "crypto";

export const deriveMasterKey = (passphrase: string, salt: string): Buffer => {
	return crypto.pbkdf2Sync(passphrase, salt, 100000, 32, "sha256");
};

export const encrypt = (text: string, key: string): string => {
	const iv = crypto.randomBytes(16); // Generate a random IV
	const cipher = crypto.createCipheriv(
		"aes-256-cbc",
		Buffer.from(key, "hex"),
		iv
	);
	let encrypted = cipher.update(text, "utf8", "hex");
	encrypted += cipher.final("hex");
	return iv.toString("hex") + ":" + encrypted; // Store IV with encrypted text
};

export const decrypt = (encryptedText: string, key: string): string => {
	const textParts = encryptedText.split(":");
	const iv = Buffer.from(textParts.shift() as string, "hex"); // Extract IV
	const encrypted = textParts.join(":");
	const decipher = crypto.createDecipheriv(
		"aes-256-cbc",
		Buffer.from(key, "hex"),
		iv
	);
	let decrypted = decipher.update(encrypted, "hex", "utf8");
	decrypted += decipher.final("utf8");
	return decrypted;
};

export const generateSalt = (randombyteSize: number): string => {
	return crypto.randomBytes(randombyteSize).toString("hex");
};

export const verifyMasterKey = (
	passphrase: string,
	salt: string,
	masterKey: string
): boolean => {
	const derivedKey = deriveMasterKey(passphrase, salt);
	return crypto.timingSafeEqual(
		Buffer.from(derivedKey),
		Buffer.from(masterKey, "hex")
	);
};
