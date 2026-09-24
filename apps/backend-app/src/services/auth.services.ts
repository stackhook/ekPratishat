import { DatabaseError, handlePrismaError, prisma } from "@repo/database";
import { comparePassword } from "../utils/hash.js";
import { AppError } from "@repo/functions";
import { generateRefreshToken, hashRefreshToken } from "../utils/jwt.js";

export async function authenticateUser({
  contact,
  password,
  userAgent,
  ipAddress,
  deviceName,
}: {
  contact: string;
  password: string;
  userAgent?: string;
  ipAddress?: string;
  deviceName?: string;
}) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await prisma.user.findUnique({
        where: {
          contact,
        },
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
      });
      if (!user || !(await comparePassword(password, user.password))) {
        throw new AppError(403, "Invalid credentials");
      }

      if (!user.isActive) {
        throw new AppError(403, "User is inactive");
      }

      if (user.role === "partner" || user.role === "staff") {
        if (!user.isVerified) {
          throw new AppError(403, "Pending Account Verification");
        }
      }

      const refreshToken = generateRefreshToken();
      const refreshTokenHash = hashRefreshToken(refreshToken);
      const session = await tx.session.create({
        data: {
          userId: user.id,
          refreshTokenHash: refreshTokenHash,
          expiresAt:
            user.role !== "client"
              ? new Date(Date.now() + 12 * 60 * 60 * 1000)
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          userAgent: userAgent ?? null,
          ipAddress: ipAddress ?? null,
          deviceName: deviceName ?? null,
        },
      });

      return {
        ...user,
        sessionId: session.id,
        refreshToken,
      };
    });

    return result;
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
