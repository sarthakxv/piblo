import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PROFILE_PRESENT_COOKIE } from "@/features/learner-profile/profile-schema.ts";

export function middleware(request: NextRequest) {
    if (request.cookies.get(PROFILE_PRESENT_COOKIE)?.value === "1") {
        return NextResponse.redirect(new URL("/library", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/",
};
