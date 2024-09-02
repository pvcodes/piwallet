import {
	deleteCredential,
	storeCredential,
	updateCredential,
} from "@/db/service/credential";
import { findOrAddUser, findUserByWalletAddress } from "@/db/service/user";
import { NextApiRequest } from "next";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const { walletAddress, credential } = await req.json();
		if (!walletAddress) {
			return NextResponse.json(
				{
					success: false,
					error: "Missing walletAddress",
				},
				{ status: 400 }
			);
		}
		const user = await findUserByWalletAddress(walletAddress);

		console.log(234, user);

		// validation for credentials
		const cred = await storeCredential(user?.id, credential);
		console.log(23424, cred, "cred");
		return NextResponse.json(
			{ success: true, data: cred },
			{ status: 200 }
		);
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ success: false, error: "Error adding user" },
			{ status: 500 }
		);
	}
}

export async function PUT(req: NextRequest) {
	try {
		const { walletAddress, credential, id } = await req.json();
		if (!walletAddress) {
			return NextResponse.json(
				{
					success: false,
					error: "Missing walletAddress",
				},
				{ status: 400 }
			);
		}
		const user = await findUserByWalletAddress(walletAddress);

		console.log(234, user);

		// validation for credentials
		const cred = await updateCredential(id, user?.id, credential);
		console.log(cred, "credUpadte");
		return NextResponse.json(
			{ success: true, data: cred },
			{ status: 200 }
		);
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ success: false, error: "Error adding user" },
			{ status: 500 }
		);
	}
}

export async function DELETE(req: NextRequest) {
	try {
		const walletAddress = req.nextUrl.searchParams.get("walletAddress");
		const id = req.nextUrl.searchParams.get("id");
		console.log(234, walletAddress, id, "delete");
		if (!walletAddress) {
			return NextResponse.json(
				{
					success: false,
					error: "Missing walletAddress",
				},
				{ status: 400 }
			);
		}
		const user = await findUserByWalletAddress(walletAddress);

		console.log(234, user);

		// validation for credentials
		const cred = await deleteCredential(id, user?.id);
		return NextResponse.json(
			{ success: true, data: cred },
			{ status: 200 }
		);
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ success: false, error: "Error adding user" },
			{ status: 500 }
		);
	}
}
