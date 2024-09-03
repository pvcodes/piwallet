import { User } from "@prisma/client";
import prisma from "@/db";
import { deriveMasterKey, encrypt, generateSalt } from "@/utils/encryption"; // Assuming your encryption functions are in a file named crypto.ts

// Create a new user with wallet address
async function findOrAddUser(walletAddress: string): Promise<User> {
	// Check if the user already exists
	let user = await findUserByWalletAddress(walletAddress);
	console.log(2342, user, "user");
	if (user) {
		return user;
	}

	// Create a new user without passphrase
	user = await prisma.user.create({
		data: {
			walletAddress,
		},
	});

	return user;
}

async function updateUser(
	walletAddress: string,
	dataToUpdate: any
): Promise<User | null> {
	const data: any = {};
	let key;
	if (dataToUpdate?.passphrase) {
		const salt = generateSalt(16);
		key = deriveMasterKey(dataToUpdate?.passphrase, salt);
		data.salt = salt;
		data.eWalletAddress = encrypt(walletAddress, key.toString("hex"));
	}
	const updatedUser = await prisma.user.update({
		where: { walletAddress },
		data,
	});

	return {
		...updatedUser,
		masterkey: key.toString("hex"),
	};
}

// ... existing code ...

// Find a user by wallet address
async function findUserByWalletAddress(
	walletAddress: string
): Promise<User | null> {
	return prisma.user.findUnique({
		where: { walletAddress },
	});
}

// Verify user's passphrase by deriving the key and comparing with stored data
async function verifyUser(
	walletAddress: string,
	passphrase: string
): Promise<boolean> {
	const user = await findUserByWalletAddress(walletAddress);
	if (!user) return false;

	try {
		const key = deriveMasterKey(passphrase, user.salt);
		// If the key derivation does not throw an error, the passphrase is correct
		return !!key;
	} catch (error) {
		return false;
	}
}

// Delete a user by wallet address
async function deleteUserByWalletAddress(
	walletAddress: string
): Promise<User | null> {
	return prisma.user.delete({
		where: { walletAddress },
	});
}

export {
	findOrAddUser,
	updateUser,
	findUserByWalletAddress,
	verifyUser,
	deleteUserByWalletAddress,
};
