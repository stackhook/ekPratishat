import { userSigninSchema } from "@repo/validators";
import { Request, Response } from "express";
import { authenticateUser } from "../services/auth.services.js";
import { generateToken } from "../utils/jwt.js";
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
      error: "Internal Server Error",
    });
  }
}
