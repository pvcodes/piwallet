import prisma from "@/db";
import { deriveMasterKey, encrypt, decrypt } from "@/utils/encryption"; // Assuming your encryption functions are in a file named crypto.ts
import { Credential } from "@prisma/client";

async function storeCredential(credential: Credential) {
	return await prisma.credential.create({
		data: credential,
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

async function updateCredential(
	userId: string,
	id: string,
	credential: Credential
) {
	return prisma.credential.update({
		where: {
			id,
			userId,
		},
		data: credential,
	});
}

async function deleteCredential(userId: string, id: string) {
	return prisma.credential.delete({
		where: {
			id,
			userId,
		},
	});
}

const credentialService = {
	storeCredential,
	retrieveCredential,
	retrieveCredentialAll,
	updateCredential,
	deleteCredential,
};

export default credentialService;
