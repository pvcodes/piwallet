import { NextRequest, NextResponse } from "next/server";
import {
	findOrAddUser,
	findUserByWalletAddress,
	verifyUser,
	deleteUserByWalletAddress,
	updateUser,
} from "@/db/service/user";

export async function POST(req: NextRequest) {
	try {
		const { walletAddress } = await req.json();
		if (!walletAddress) {
			return NextResponse.json(
				{
					success: false,
					error: "Missing walletAddress",
				},
				{ status: 400 }
			);
		}
		const user = await findOrAddUser(walletAddress);
		return NextResponse.json(
			{ success: true, data: user },
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

export async function GET(req: NextRequest) {
	try {
		const url = new URL(req.url);
		const walletAddress = url.searchParams.get("walletAddress");
		if (!walletAddress || typeof walletAddress !== "string") {
			return NextResponse.json(
				{ success: false, error: "Missing or invalid walletAddress" },
				{ status: 400 }
			);
		}
		const user = await findUserByWalletAddress(walletAddress);
		if (!user) {
			return NextResponse.json(
				{ success: false, error: "User not found" },
				{ status: 404 }
			);
		}
		return NextResponse.json(
			{ success: true, data: user },
			{ status: 200 }
		);
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ success: false, error: "Error finding user" },
			{ status: 500 }
		);
	}
}

export async function PUT(req: NextRequest) {
	try {
		const { walletAddress, passphrase } = await req.json();
		if (!walletAddress || !passphrase) {
			return NextResponse.json(
				{
					success: false,
					error: "Missing walletAddress, or passphrase",
				},
				{ status: 400 }
			);
		}
		const user = await updateUser(walletAddress, { passphrase });
        console.log(user, 1123, 'user-123')
		if (!user) {
			return NextResponse.json(
				{ success: false, error: "User not found" },
				{ status: 404 }
			);
		}
		return NextResponse.json(
			{ success: true, data: user },
			{ status: 200 }
		);
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ success: false, error: "Error updating user" },
			{ status: 500 }
		);
	}
}

export async function DELETE(req: NextRequest) {
	try {
		const url = new URL(req.url);
		const walletAddress = url.searchParams.get("walletAddress");
		if (!walletAddress || typeof walletAddress !== "string") {
			return NextResponse.json(
				{ success: false, error: "Missing or invalid walletAddress" },
				{ status: 400 }
			);
		}
		const user = await deleteUserByWalletAddress(walletAddress);
		if (!user) {
			return NextResponse.json(
				{ success: false, error: "User not found" },
				{ status: 404 }
			);
		}
		return NextResponse.json(
			{ success: true, data: user },
			{ status: 200 }
		);
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ success: false, error: "Error deleting user" },
			{ status: 500 }
		);
	}
}

export async function PATCH(req: NextRequest) {
	try {
		const { walletAddress, passphrase } = await req.json();
		if (!walletAddress || !passphrase) {
			return NextResponse.json(
				{
					success: false,
					error: "Missing walletAddress or passphrase",
				},
				{ status: 400 }
			);
		}
		const isValid = await verifyUser(walletAddress, passphrase);
		return NextResponse.json(
			{ success: true, data: { valid: isValid } },
			{ status: 200 }
		);
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ success: false, error: "Error verifying user" },
			{ status: 500 }
		);
	}
}
