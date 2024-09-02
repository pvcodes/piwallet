import { NextRequest, NextResponse } from "next/server";

import { decrypt, verifyMasterKey } from "@/utils/encryption";
import { findUserByWalletAddress } from "@/db/service/user";
import {
	retrieveCredential,
	retrieveCredentialAll,
} from "@/db/service/credential";

export async function POST(req: NextRequest) {
	try {
		const url = new URL(req.url);
		const { masterKey, walletAddress } = await req?.json();
		// const masterkey = url.searchParams.get("masterkey");

		if (!masterKey || !walletAddress) {
			return NextResponse.json(
				{ success: false, error: "Data is required" },
				{ status: 400 }
			);
		}

		const user = await findUserByWalletAddress(walletAddress);
		if (!user?.salt) {
			return NextResponse.json(
				{ success: false, error: "Master key not generated yet" },
				{ status: 400 }
			);
		}

		const credentials = await retrieveCredentialAll(user.id);

		// checking if masterkey is valid
		if (!credentials.length) {
			return NextResponse.json(
				{ success: true, data: credentials },
				{ status: 200 }
			);
		}
		const credential = credentials[0];
		try {
			decrypt(credential.username, masterKey);
		} catch (error) {
			console.log(error);
			return NextResponse.json(
				{ success: false, error: "Invalid master key" },
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{
				success: true,
				message: "Fetched all credentials",
				data: credentials,
			},
			{ status: 200 }
		);
		// Replace this with your actual verification logic
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ success: false, error: "Error verifying master key" },
			{ status: 500 }
		);
	}
}
