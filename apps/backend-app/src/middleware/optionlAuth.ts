import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { verifyToken } from "../utils/jwt.js";

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    // No token → continue as anonymous
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return next();
    }

    try {
      const payload = verifyToken(token);

      req.user = {
        id: payload.userId,
        role: payload.role,
        name: payload.name,
        perms: payload?.perms || [],
      };

      return next();
    } catch {
      // Invalid/expired token → treat request as anonymous
      return next();
    }
  } catch {
    // Any unexpected authentication problem should not
    // prevent access to this public endpoint.
    return next();
  }
}
