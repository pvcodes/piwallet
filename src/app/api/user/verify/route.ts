import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/utils/encryption";
import userService from "@/db/service/user";
import credentialService from "@/db/service/credential";
import { ResponseObject } from "@/utils/helper";

export async function POST(req: NextRequest) {
	try {
		const uid = req.headers.get("x-uid");
		const { masterKey, walletAddress } = await req?.json();

		if (!masterKey || !walletAddress || !uid) {
			return ResponseObject(false, "Data is required", 400);
		}

		const user = await userService.findUserByWalletAddress(
			uid,
			walletAddress
		);
		if (!user?.salt) {
			return ResponseObject(false, "Master key not generated yet", 400);
		}

		try {
			const decryptedWalletAddress = decrypt(
				user.eWalletAddress!, // if salt exists, then eWalletAddress will always exist
				masterKey
			);
			if (decryptedWalletAddress !== user.walletAddress) {
				throw new Error("Invalid master key");
			}
		} catch (error) {
			console.log(error);
			return ResponseObject(false, "Invalid master key", 400);
		}

		const credentials = await credentialService.retrieveCredentialAll(uid);
		return ResponseObject(true, { credentials });
	} catch (error) {
		console.log(error);
		return ResponseObject(false, "Error verifying master key", 500);
	}
}
