import { NextFunction, Request, Response } from "express";

import { verifyToken } from "../utils/jwt.js";
import { prisma } from "@repo/database";

export const checkAuthentication = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let token: string | undefined;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
  }

  // 2️⃣ Try cookies (web)
  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({
      message: "Not Authorized, Missing Token",
    });
  }

  try {
    const payload = verifyToken(token);
    if (!payload.sessionId) {
      return res.status(401).json({
        message: "Session expired.",
      });
    }

     const checkSession = await prisma.session.findUnique({
      where: {
        id: payload.sessionId,
        userId: payload.userId,
      },
    });

    if (
      !checkSession ||
      checkSession.revokedAt !== null ||
      checkSession.expiresAt <= new Date()
    ) {
      return res.status(401).json({
        message: "Session expired.",
      });
    }

    // const checkUser = await prisma.user.findUnique({
    //   where: { id: payload.userId },
    // });
    // if (!checkUser || !checkUser.isActive) {
    //   res.clearCookie("accessToken", {
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === "production",
    //     sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    //     path: "/",
    //     domain:
    //       process.env.NODE_ENV === "production"
    //         ? ".ekpratishat.com"
    //         : "localhost",
    //   });

    //   return res.status(401).json({
    //     message: "Account is Deactivated!!!",
    //   });
    // }
    req.user = {
      id: payload.userId,
      role: payload.role,
      name: payload.name,
      perms: payload?.perms || [],
      sessionId: payload.sessionId,
    };
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Session expired.... Please log in again.",
    });
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
};

export const requireAdminOrStaff = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!["admin", "staff"].includes(req.user?.role)) {
    return res.status(403).json({ message: "Admin or Staff only" });
  }
  next();
};
