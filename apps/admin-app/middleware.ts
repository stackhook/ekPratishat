// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { jwtVerify } from "jose";

// const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

// export async function middleware(req: NextRequest) {
//   const token = req.cookies.get("accessToken")?.value;

//   const { pathname } = req.nextUrl;

//   // protect only admin routes
//   if (pathname.startsWith("/admin")) {
//     if (!token) {
//       return NextResponse.redirect(new URL("/auth/signin", req.url));
//     }

//     try {
//       await jwtVerify(token, SECRET);
//       return NextResponse.next();
//     } catch (err) {
//       return NextResponse.redirect(new URL("/auth/signin", req.url));
//     }
//   }

//   return NextResponse.next();
// }

// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { jwtVerify } from "jose";

// const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

// export async function middleware(req: NextRequest) {
//   console.log("Middleare ran");
//   const token = req.cookies.get("accessToken")?.value;
//   const { pathname } = req.nextUrl;

//   let isValidToken = false;
//   let role = null;

//   // 1️⃣ verify token once
//   if (token) {
//     try {
//       const res = await jwtVerify(token, SECRET);
//       role = res.payload.role;
//       isValidToken = true;
//     } catch {
//       isValidToken = false;
//     }
//   }

//   // 🔴 PROTECTED ROUTES (/admin)
//   if (pathname.startsWith("/admin")) {
//     if (!isValidToken || (role !== "admin" && role !== "staff")) {
//       return NextResponse.redirect(new URL("/auth/signin", req.url));
//     }
//     return NextResponse.next();
//   }

//   // 🟢 AUTH ROUTES (/auth/signin)
//   // if (pathname.startsWith("/auth")) {
//   //   if (pathname === "/auth/signin" && isValidToken) {
//   //     // If they are an admin or staff, send them to the dashboard
//   //     if (role === "admin" || role === "staff") {
//   //       return NextResponse.redirect(new URL("/admin/dashboard", req.url));
//   //     }
//   //   }
//   // }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      * - All images/icons (svg, png, jpg, etc.)
//      */
//     '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
//   ],
// };


import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get("accessToken")?.value;
  const sessionPresent = req.cookies.get("sessionPresent")?.value;

  if (!accessToken && !sessionPresent) {
    return NextResponse.redirect(
      new URL("/auth/signin", req.url),
    );
  }

  return NextResponse.next();
}