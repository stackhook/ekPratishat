import { DatabaseError, handlePrismaError, prisma } from "@repo/database";
import { comparePassword } from "../utils/hash.js";
import { AppError } from "@repo/functions";

export async function authenticateUser({
  contact,
  password,
}: {
  contact: string;
  password: string;
}) {
  try {
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
      throw new AppError(401,"Invalid credentials");
    };

    if (!user.isActive) {
      throw new AppError(403,"User is inactive");
    }

     if (user.role === "partner" || user.role === "staff") {
      if (!user.isVerified) {
        throw new AppError(403,"Pending Account Verification");
      }
    }

    return user;

    
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
