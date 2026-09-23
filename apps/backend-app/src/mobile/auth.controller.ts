import { userSigninSchema } from "@repo/validators";
import { Request, Response } from "express";
import { authenticateUser } from "../services/auth.services.js";
import { generateRefreshToken, generateToken, hashRefreshToken, verifyToken } from "../utils/jwt.js";
import { AppError } from "@repo/functions";
import { DatabaseError, handlePrismaError, prisma } from "@repo/database";

export async function mobileAuthController(req: Request, res: Response) {
  const result = userSigninSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: "Validation Failed!!!" });
  }
  const { contact, password } = result.data;
  const userAgent = req.get("user-agent") ?? undefined;
  const ipAddress = req.ip ?? undefined;

  try {
    const user = await authenticateUser({ contact, password,userAgent, ipAddress });
    const token = generateToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      profileImageUrl: user.profileImageUrl,
      sessionId: user.sessionId,
    });

    return res.status(200).json({
      accessToken: token,
      refreshToken: user.refreshToken,
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
  try {
    const userInfo = req.user;
    const user = await prisma.user.findUnique({
      where: { id: userInfo.id, isActive: true },
      select: {
        id: true,
        name: true,
        role: true,
        profileImageUrl: true,
      },
    });

    if (!user) {
      return res.status(200).json({
        user: null,
      });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        profileImageUrl: user.profileImageUrl,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}


export const mobileSignOut = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    await prisma.session.update({
      where: { id: user.sessionId },
      data: {
        revokedAt: new Date(),
      },
    });

    return res.status(200).json({
      ok: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
