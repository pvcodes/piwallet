import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { ResponseObject } from "./utils/helper";
import { JWT_PAYLOAD } from "./types/misc";

const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

export async function middleware(req: NextRequest) {
	const requestType = req.method;
	const endpoint = req.nextUrl.pathname;

	if (requestType === "POST" && endpoint === "/api/user") {
		return NextResponse.next();
	}

	const auth_token = req.headers.get("Authorization")?.split(" ")[1];
	if (!auth_token) return ResponseObject(false, "unauthorized user");

	try {
		const { payload } = (await jwtVerify(auth_token, secret)) as {
			payload: JWT_PAYLOAD;
		};
		const res = NextResponse.next();
		res.headers.append("x-uid", payload.uid);
		return res;
	} catch (error) {
		return ResponseObject(false, "unauthorized user!");
	}
}

export const config = {
	matcher: "/api/:path*",
};
