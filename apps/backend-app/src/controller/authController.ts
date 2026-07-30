import { DatabaseError, handlePrismaError, prisma } from "@repo/database";
import { userSigninSchema, userSignupSchema } from "@repo/validators";
import { Request, Response } from "express";
import { comparePassword, hashPassword } from "../utils/hash.js";
import { generateToken, verifyToken } from "../utils/jwt.js";
import { AppError, createUser } from "@repo/functions";
import { triggerFrontendUpdate } from "../utils/revalidator.js";


interface CreateDesignationBody {
  title: string;
  description?: string;
  permissionIds: string[];
  multipleAssignment:boolean;
}

export const signIn = async (req: Request, res: Response) => {
  try {
    const result = userSigninSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
    }
    const { contact, password } = result.data;

    const user = await prisma.user.findUnique({
      where: {
        contact,
      },
      include: {
        designation: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
      
    });

    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    if (!user.isActive) {
      return res
        .status(403)
        .json({ error: "Account is deactivated. Please contact support." });
    }
    if (user.role === "partner" || user.role === "staff") {
      if (!user.isVerified) {
        return res
          .status(403)
          .json({ error: "Pending account verification!!!" });
      }
    }

    if (user.role === "staff" && !user.designationId){
      return res.status(403).json({
        error:"You are not yet permitted!!!"
      })
    };


    let compactPermissions: string[] = [];
    if (user.role === "staff" && user.designation) {
      compactPermissions = user.designation.permissions.map((dp) => {
        const p = dp.permission;
        return `${p.resource}:${p.action}:${p.scope}`;
      });
    }


    const token = generateToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      profileImageUrl: user.profileImageUrl,
      ...(user.role === "staff" && { perms: compactPermissions })
    });

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: (user.role !== "client") ? 2 * 60 * 60 * 1000 : 24 * 30 * 60 * 60 * 1000,
      path: "/", // cookie available for entire domain
      domain:
        process.env.NODE_ENV === "production"
          ? ".ekpratishat.com"
          : "localhost",
    });

    return res.status(201).json({
      ok: true,
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        profileImageUrl: user.profileImageUrl,
        designation:user.designation?.title ?? null
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Internal Server Error!!!",
    });
  }
};

export const createClientUser = async (req: Request, res: Response) => {
  try {
    const adaptedFiles = (req.files as Express.Multer.File[]).map((file) => ({
      fieldname: file.fieldname,
      buffer: file.buffer,
      mimetype: file.mimetype,
      originalname: file.originalname,
      size: file.size,
    }));
    // 🔥 CALL SERVICE (IMPORTANT)
    const result = await createUser({
      body: req.body,
      files: adaptedFiles,
    });

    const token = generateToken({
      userId: result.user.id,
      role: result.user.role,
      name: result.user.name,
      profileImageUrl: result.user.profileImageUrl,
    });

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 30 * 60 * 60 * 1000,
      path: "/", // cookie available for entire domain
      domain:
        process.env.NODE_ENV === "production"
          ? ".ekpratishat.com"
          : "localhost",
    });

    return res.status(201).json({
      ok: true,
      result,
    });
  } catch (err: any) {
    // 🔥 HANDLE VALIDATION ERRORS (from Zod)
    if (err instanceof AppError) {
      return res.status(err.status).json({
        error: err.message,
        fieldErrors: err.fieldErrors || null,
      });
    }

    return res.status(500).json({
      error: "Internal Server Error!!!",
    });
  }
};

export const createAgentAdminStaff = async (req: Request, res: Response) => {
  try {
    const user = req.user; // from JWT middleware

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const role = req.body.role;

    // 🔥 ROLE LOGIC
    if (["admin", "partner", "staff"].includes(role)) {
      if (user.role !== "admin") {
        return res.status(403).json({
          error: "Only admin can create staff/partner/admin",
        });
      }

      req.body.createdById = user.id;

      if (req.body.isVerified === "true") {
        req.body.verifiedById = user.id;
      }
    }

    const adaptedFiles = (req.files as Express.Multer.File[]).map((file) => ({
      fieldname: file.fieldname,
      buffer: file.buffer,
      mimetype: file.mimetype,
      originalname: file.originalname,
      size: file.size,
    }));
    // 🔥 CALL SERVICE (IMPORTANT)
    const result = await createUser({
      body: req.body,
      files: adaptedFiles,
    });

    return res.status(201).json({
      ok: true,
      result,
    });
  } catch (err: any) {
    // 🔥 HANDLE VALIDATION ERRORS (from Zod)
    if (err instanceof AppError) {
      return res.status(err.status).json({
        error: err.message,
        fieldErrors: err.fieldErrors || null,
      });
    }

    return res.status(500).json({
      error: "Internal Server Error!!!",
    });
  }
};

export const verifyAgent = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    const { userId, isVerified } = req.body;

    const result = await prisma.user.update({
      where: { id: userId },
      data: {
        isVerified: !isVerified,
        verifiedById: isVerified ? null : user.id,
        documents: {
          updateMany: {
            where: { userId },
            data: {
              isVerified: !isVerified,
              verifiedById: isVerified ? null : user.id,
            },
          },
        },
      },
    });

    return res.status(200).json({
      ok: true,
      result,
    });
  } catch (err) {
    console.error("Error verifying agent:", err);
    return res.status(500).json({
      message: "Internal Server Error!!!",
    });
  }
};

export const signOut = (req: Request, res: Response) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    domain:
      process.env.NODE_ENV === "production" ? ".ekpratishat.com" : "localhost",
  });

  return res.status(200).json({
    ok: true,
    message: "Logged Out!!!",
  });
};

export const myInfo = async (req: Request, res: Response) => {
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
      ok: false,
      user: null,
      message: "Guest session",
    });
  }

  try {
    const payload = verifyToken(token);

    const checkUser = await prisma.user.findUnique({
      where: { id: payload.userId, isActive: true },
      select: {
        id:true,
        name:true,
        role:true,
        profileImageUrl:true,
        isActive: true,
        designation: {
          select: {
            title:true,
          }
        },
        _count: {
          select: {
            notificationReceive: {
              where: {isRead: false}
            }
          }
        }
      }
    });
    if (!checkUser || !checkUser.isActive) {
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        domain:
          process.env.NODE_ENV === "production"
            ? ".ekpratishat.com"
            : "localhost",
      });
      return res.status(200).json({
        user: null,
        ok: false,
        message: "Account deactivated",
      });
    }
    return res.status(200).json({
      ok: true,
      user: {
        id: checkUser.id,
        role: checkUser.role,
        name: checkUser.name,
        profileImageUrl: checkUser.profileImageUrl,
        notification: checkUser._count.notificationReceive,
        designation:checkUser.designation?.title ?? null
      },
    });
  } catch (err) {
    // If the token is invalid/expired, we still send 200 but null the user
    // This forces the frontend to clear any old 'Admin' UI
    return res.status(200).json({
      ok: false,
      user: null,
      message: "Session expired",
    });
  }
};

export const toggleActive = async (req: Request, res: Response) => {
  try {
    const { agentId, activeStatus } = req.body;
    const { id: userId } = req.user;

    if (activeStatus) {
      const result = await prisma.$transaction([
        prisma.agentGeoZone.deleteMany({
          where: { agentId },
        }),
        prisma.user.update({
          where: { id: agentId },
          data: {
            isActive: false,
            isVerified: false,
            verifiedById: null,
            documents: {
              updateMany: {
                where: { userId: agentId },
                data: {
                  isVerified: false,
                  verifiedById: null,
                },
              },
            },
            properties: {
              updateMany: {
                where: { userId: agentId },
                data: {
                  isActive: false,
                  verified: false,
                  isFeatured: false,
                },
              },
            },
          },
        }),
      ]);
      triggerFrontendUpdate({tag: "properties"});
    } else if (!activeStatus) {
      const result = await prisma.user.update({
        where: { id: agentId },
        data: {
          isVerified: true,
          isActive: true,
          verifiedById: userId,
          documents: {
            updateMany: {
              where: { userId: agentId },
              data: {
                isVerified: true,
                verifiedById: userId,
              },
            },
          },
          properties: {
            updateMany: {
              where: { userId: agentId },
              data: {
                isActive: true,
              },
            },
          },
        },
      });
      triggerFrontendUpdate({tag: "properties"});
    }

    return res.status(200).json({
      ok: true,
    });
  } catch (err) {
    console.error("Error removing agent:", err);
    return res.status(500).json({
      message: "Internal Server Error!!!",
    });
  }
};

export async function changeUserRole(req: Request, res: Response) {
  try {
    const { role } = req.body;
    const adminUser = req.user;
    const { id: userId } = req.params;

    if (!userId || typeof userId !== "string") {
      throw new AppError(400, "Invalid User ID");
    }

    if (adminUser.role !== "admin") {
      return res.status(403).json({ message: "Forbidden!!!" });
    }

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role: role,
      },
      select: {
        id: true,
        name: true,
        contact: true,
        isVerified: true,
        role: true,
        createdAt: true,
        secondContact: true,
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "User role updated successfully!!!",
      ok: true,
      user,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("Error changing user role:", error);
    return res.status(500).json({
      message: "Internal Server Error!!!",
    });
  }
}


export const createDesignation = async (
  req: Request<{}, {}, CreateDesignationBody>,
  res: Response
) => {
  try {
    const { title, description, permissionIds, multipleAssignment } = req.body;

    if (!title || !Array.isArray(permissionIds)) {
      throw new AppError(400,"Title and permissionIds array are required", );
    }

    const designation = await prisma.designation.create({
      data: {
        title:title.trim().toUpperCase(),
        description,
        multipleAssignment,
        permissions: {
          create: permissionIds.map((permissionId) => ({
            permission: {
              connect: { id: permissionId },
            },
          })),
        },
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return res.status(201).json({
      designation,
      message: "Designation Created Successfully"
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.status).json({
        message: error.message,
      });
    }

    try {
      handlePrismaError(error);
    } catch (dbError) {
      if (dbError instanceof DatabaseError) {
        return res
          .status(dbError.statusCode)
          .json({ message: dbError.message });
      }
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};