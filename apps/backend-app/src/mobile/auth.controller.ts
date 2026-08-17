import { userSigninSchema } from "@repo/validators";
import { Request, Response } from "express";
import { authenticateUser } from "../services/auth.services.js";
import { generateToken, verifyToken } from "../utils/jwt.js";
import { AppError } from "@repo/functions";

export async function mobileAuthController(req: Request, res: Response) {
  const result = userSigninSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues });
  }
  const { contact, password } = result.data;

  try {
    const user = await authenticateUser({ contact, password });
    const token = generateToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      profileImageUrl: user.profileImageUrl,
    });

    return res.status(200).json({
      accessToken: token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        profileImageUrl: user.profileImageUrl,
      },
    });

  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.status).json({
        message: error.message,
      });
    }
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

export async function getMyInfo(req: Request, res: Response) {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
  }

  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  // Instead of 401, we return 200 with ok: false or user: null
  if (!token) {
    return res.status(200).json({
      user: null,
    });
  }

  try {
    const decodedToken = verifyToken(token);
    return res.status(200).json({
      user: {
        id: decodedToken.userId,
        name: decodedToken.name,
        role: decodedToken.role,
        profileImageUrl: decodedToken.profileImageUrl,
      },
    });
  } catch (error) {
    return res.status(200).json({
      user: null,
    });
  }
}