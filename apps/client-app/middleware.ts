// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { jwtVerify } from "jose";

// const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

// export async function middleware(req: NextRequest) {
//   console.log("Middleare ran");
//   const token = req.cookies.get("accessToken")?.value;
//   const { pathname } = req.nextUrl;

//   let isValidToken = false;

//   if (token) {
//     try {
//       await jwtVerify(token, SECRET);
//       isValidToken = true;
//     } catch {
//       isValidToken = false;
//     }
//   }

//   // 🔴 PROTECTED ROUTES (/admin)
//   if (pathname.startsWith("/user")) {
//     if (!isValidToken) {
//       return NextResponse.redirect(new URL("/auth/signin", req.url));
//     }
//     return NextResponse.next();
//   }

//   // 🟢 AUTH ROUTES (/auth/signin)
//   // if (pathname.startsWith("/auth")) {
//   //   if (isValidToken) {
//   //       return NextResponse.redirect(new URL("/", req.url));

//   //   }
//   // }
//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     '/user/:path*',
//   ],
// };

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const accessToken = req.cookies.get("accessToken")?.value;
  const sessionPresent = req.cookies.get("sessionPresent")?.value;

  console.log("USER MIDDLEWARE", {
    pathname,
    accessToken: !!accessToken,
    sessionPresent: !!sessionPresent,
    userAgent: req.headers.get("user-agent"),
    rsc: req.headers.get("rsc"),
    purpose: req.headers.get("purpose"),
    accept: req.headers.get("accept"),
  });

  if (!accessToken && !sessionPresent) {
     console.log("USER MIDDLEWARE -> REDIRECT", pathname);
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/user/:path*',
  ],
};
