import { Request, Response } from "express";

export const clearAuthCookies = (res: Response) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production" ? "none" as const : "lax" as const,
    domain:
      process.env.NODE_ENV === "production"
        ? ".ekpratishat.com"
        : "localhost",
  };

  res.clearCookie("accessToken", {
    ...cookieOptions,
    path: "/",
  });

  res.clearCookie("refreshToken", {
    ...cookieOptions,
    path: "/auth/refresh",
  });
};