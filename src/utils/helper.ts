import { NextResponse } from "next/server";

function cn(...classes: (string | undefined | false)[]) {
	return classes.filter(Boolean).join(" ");
}

const ResponseObject = async (
	success: boolean,
	data: object | null | string = null,
	statusCode?: number
) => {
	return NextResponse.json(
		{ success, [success ? "data" : "error"]: parseErrorMessage(data) },
		{ status: statusCode || (!success ? 400 : 200) }
	);
};

export { cn, ResponseObject };

// Helper's Helper Functions
function parseErrorMessage(
	message: string | object | null
): string | object | null {
	if (typeof message === "string") {
		try {
			return JSON.parse(message);
		} catch {
			return message;
		}
	}
	return message;
}
