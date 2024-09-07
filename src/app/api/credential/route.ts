import credentialService from "@/db/service/credential";
import userService from "@/db/service/user";
import { ResponseObject } from "@/utils/helper";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const uid = req.headers.get("x-uid");
		const { walletAddress, credential } = await req.json();
		if (!walletAddress) {
			return ResponseObject(false, "Missing walletAddress", 400);
		}
		credential.userId = uid;
		const cred = await credentialService.storeCredential(credential);
		return ResponseObject(true, { credential: cred });
	} catch (error) {
		return ResponseObject(false, (error as Error).message);
	}
}

export async function PUT(req: NextRequest) {
	try {
		const uid = req.headers.get("x-uid");
		const { walletAddress, credential, id } = await req.json();
		if (!walletAddress || !uid) {
			return ResponseObject(false, "Missing walletAddress", 400);
		}

		// validation for credentials
		const cred = await credentialService.updateCredential(
			uid,
			id,
			credential
		);
		return ResponseObject(true, { credential: cred });
	} catch (error) {
		console.log(error);
		return ResponseObject(false, (error as Error).message);
	}
}

export async function DELETE(req: NextRequest) {
	try {
		const uid = req.headers.get("x-uid");
		const id = req.nextUrl.searchParams.get("id");
		if (!id || !uid) {
			return ResponseObject(false, "Invalid Request", 400);
		}
		const cred = await credentialService.deleteCredential(uid, id);
		return ResponseObject(true, { credential: cred });
	} catch (error) {
		console.log(error);
		return ResponseObject(false, (error as Error).message);
	}
}
