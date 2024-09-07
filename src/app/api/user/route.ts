import { NextRequest, NextResponse } from "next/server";
import userService from "@/db/service/user";
import { SignJWT } from "jose";
import { ResponseObject } from "@/utils/helper";

export async function POST(req: NextRequest) {
	try {
		const { walletAddress } = await req.json();
		if (!walletAddress) {
			return ResponseObject(false, "walletAddress is found");
		}
		const user = await userService.findOrAddUser(walletAddress);

		const secretKey = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
		const token = await new SignJWT({ uid: user.id })
			.setProtectedHeader({ alg: "HS256" })
			.sign(secretKey);

		return ResponseObject(true, {
			token,
			hasMasterKey: Boolean(user.salt),
		});
	} catch (error) {
		return ResponseObject(false, (error as Error).message);
	}
}

export async function GET(req: NextRequest) {
	try {
		const uid = req.headers.get("x-uid") ?? undefined;
		const walletAddress = req.nextUrl.searchParams.get("walletAddress");

		if (!walletAddress || !uid) {
			return ResponseObject(
				false,
				"Missing or invalid walletAddress",
				400
			);
		}
		const user = await userService.findUserByWalletAddress(
			uid,
			walletAddress
		);
		if (!user) {
			return ResponseObject(false, "Invalid access");
		}
		return ResponseObject(true, { user });
	} catch (error) {
		return ResponseObject(false, (error as Error).message);
	}
}

export async function PUT(req: NextRequest) {
	try {
		const uid = req.headers.get("x-uid");
		const { walletAddress, passphrase } = await req.json();
		if (!walletAddress || !passphrase || !uid) {
			return ResponseObject(
				false,
				"Missing walletAddress or passphrase",
				400
			);
		}
		const user = await userService.generateMasterKey(
			uid,
			walletAddress,
			passphrase
		);
		if (!user) {
			return ResponseObject(false, "Invalid access", 404);
		}
		return ResponseObject(true, {
			masterkey: user?.masterkey,
			hasMasterKey: Boolean(user.salt),
		});
	} catch (error) {
		console.log(error);
		return ResponseObject(false, (error as Error).message, 500);
	}
}

export async function DELETE(req: NextRequest) {
	try {
		const uid = req.headers.get("x-uid");
		const walletAddress = req.nextUrl.searchParams.get("walletAddress");
		if (!walletAddress || !uid) {
			return ResponseObject(
				false,
				"Missing or invalid walletAddress",
				400
			);
		}
		const user = await userService.deleteUserByWalletAddress(
			uid,
			walletAddress
		);
		if (!user) {
			return ResponseObject(false, "User not found", 404);
		}
		return ResponseObject(true, user);
	} catch (error) {
		console.log(error);
		return ResponseObject(false, (error as Error).message, 500);
	}
}

export async function PATCH(req: NextRequest) {
	try {
		const { walletAddress, passphrase } = await req.json();
		if (!walletAddress || !passphrase) {
			return ResponseObject(
				false,
				"Missing walletAddress or passphrase",
				400
			);
		}
		const isValid = await userService.verifyUser(walletAddress, passphrase);
		return ResponseObject(true, { valid: isValid });
	} catch (error) {
		console.log(error);
		return ResponseObject(false, (error as Error).message, 500);
	}
}
