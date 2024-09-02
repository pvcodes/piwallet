import prisma from "@/db";
import { deriveMasterKey, encrypt, decrypt } from "@/utils/encryption"; // Assuming your encryption functions are in a file named crypto.ts

async function storeCredential(
	userId: string,
	credential: {
		name: string;
		url: string;
		username: string;
		password: string;
		notes?: string;
	}
) {
	return await prisma.credential.create({
		data: { ...credential, userId },
	});
}

async function retrieveCredential(
	userId: string,
	credentialId: string
): Promise<Credential | null> {
	return prisma.credential.findUnique({
		where: { id: credentialId, userId },
	});
}

async function retrieveCredentialAll(userId: string) {
	return prisma.credential.findMany({ where: { userId } });
}

async function updateCredential(id, userId, credential) {
	return prisma.credential.update({
		where: {
			id,
			userId,
		},
		data: { ...credential },
	});
}

async function deleteCredential(id, userId) {
	return prisma.credential.delete({
		where: {
			id,
			userId,
		},
	});
}

export {
	storeCredential,
	retrieveCredential,
	retrieveCredentialAll,
	updateCredential,
	deleteCredential,
};
