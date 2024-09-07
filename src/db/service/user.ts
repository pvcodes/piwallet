import { User } from "@prisma/client";
import prisma from "@/db";
import { deriveMasterKey, encrypt, generateSalt } from "@/utils/encryption";

async function findOrAddUser(walletAddress: string): Promise<User> {
	let user = await prisma.user.findUnique({ where: { walletAddress } });
	if (user) {
		return user;
	}

	user = await prisma.user.create({
		data: {
			walletAddress,
		},
	});

	return user;
}

async function generateMasterKey(
	id: string,
	walletAddress: string,
	passphrase: string
): Promise<{ masterkey: string; salt: string } | null> {
	const data: any = {};
	let masterkey = "";
	if (passphrase) {
		const salt = generateSalt(16);
		masterkey = deriveMasterKey(passphrase, salt).toString("hex");
		data.salt = salt;
		data.eWalletAddress = encrypt(walletAddress, masterkey);
	}
	const user = await prisma.user.update({
		where: { walletAddress, id },
		data,
		select: { salt: true },
	});

	return {
		salt: user.salt!, // if it came here, salt has been generated
		masterkey,
	};
}

async function findUserByWalletAddress(
	id: string,
	walletAddress: string
): Promise<User | null> {
	return prisma.user.findUnique({
		where: { id, walletAddress },
	});
}

async function deleteUserByWalletAddress(
	id: string,
	walletAddress: string
): Promise<User | null> {
	return prisma.user.delete({
		where: { id, walletAddress },
	});
}

const userService = {
	findOrAddUser,
	generateMasterKey,
	findUserByWalletAddress,
	deleteUserByWalletAddress,
};

export default userService;
