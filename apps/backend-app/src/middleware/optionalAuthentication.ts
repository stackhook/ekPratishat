import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.js";
import { prisma } from "@repo/database";


export const optionalAuthentication = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  console.log("TOken", token);
  // Genuine guest
  if (!token) {
    return res.status(401).json({
      message: "No token provided.",
    })
  }

  try {
    const payload = verifyToken(token);

    if (!payload.sessionId) {
      return res.status(401).json({
        message: "Invalid session.",
      });
    }

    const session = await prisma.session.findUnique({
      where: {
        id: payload.sessionId,
        userId: payload.userId,
      },
    });

    if (
      !session ||
      session.revokedAt !== null ||
      session.expiresAt <= new Date()
    ) {
      return res.status(401).json({
        message: "Session expired.",
      });
    }

    req.user = {
      id: payload.userId,
      role: payload.role,
      name: payload.name,
      perms: payload.perms ?? [],
      sessionId: payload.sessionId,
    };

    return next();
  } catch {
    return res.status(401).json({
      message: "Session expired.",
    });
  }
};