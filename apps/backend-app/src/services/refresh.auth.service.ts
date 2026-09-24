import { DatabaseError, handlePrismaError, prisma } from "@repo/database";
import {
  generateRefreshToken,
  generateToken,
  hashRefreshToken,
} from "../utils/jwt.js";
import { AppError } from "@repo/functions";

export async function refreshSession(refreshToken: string) {
  try {
    const refreshTokenHash = hashRefreshToken(refreshToken);

    const session = await prisma.session.findUnique({
      where: {
        refreshTokenHash,
      },
      include: {
        user: {
          include: {
            designation: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new AppError(401, "Invalid refresh token");
    }

    if (session.revokedAt !== null) {
      throw new AppError(401, "Session has been revoked");
    }

    if (session.expiresAt <= new Date()) {
      throw new AppError(401, "Refresh session expired");
    }

    if (!session.user.isActive) {
      throw new AppError(401, "User is inactive");
    }

    // Generate new refresh token
    const newRefreshToken = generateRefreshToken();
    const newRefreshTokenHash = hashRefreshToken(newRefreshToken);

    // Build staff permissions
    let compactPermissions: string[] = [];

    if (session.user.role === "staff" && session.user.designation) {
      compactPermissions = session.user.designation.permissions.map((dp) => {
        const p = dp.permission;

        return `${p.resource}:${p.action}:${p.scope}`;
      });
    }

    // Generate new access token
    const accessToken = generateToken({
      sessionId: session.id,
      userId: session.user.id,
      role: session.user.role,
      name: session.user.name,
      profileImageUrl: session.user.profileImageUrl,
      ...(session.user.role === "staff" && {
        perms: compactPermissions,
      }),
    });

    // Rotate refresh token
    await prisma.session.update({
      where: {
        id: session.id,
      },
      data: {
        refreshTokenHash: newRefreshTokenHash,
        expiresAt: new Date(
          Date.now() +
            (session.user.role !== "client"
              ? 30 * 60 * 1000
              : 30 * 24 * 60 * 60 * 1000),
        ),
        lastUsedAt: new Date(),
      },
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      sessionId: session.id,
      user: session.user,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    try {
      handlePrismaError(error);
    } catch (dbError) {
      if (dbError instanceof DatabaseError) {
        throw new AppError(dbError.statusCode, dbError.message);
      }

      throw new AppError(500, "Internal Server Error");
    }
  }
}
