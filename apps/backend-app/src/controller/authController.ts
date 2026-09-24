import { DatabaseError, handlePrismaError, prisma } from "@repo/database";
import { userSigninSchema, userSignupSchema } from "@repo/validators";
import { Request, Response } from "express";
import { comparePassword, hashPassword } from "../utils/hash.js";
import {
  generateRefreshToken,
  generateToken,
  hashRefreshToken,
  verifyToken,
} from "../utils/jwt.js";
import { AppError, createUser } from "@repo/functions";
import { triggerFrontendUpdate } from "../utils/revalidator.js";
import { authenticateUser } from "../services/auth.services.js";
import { promises as fs } from "fs";
import fsSync from "fs";
import path from "path";
import sharp from "sharp";
import { refreshSession } from "../services/refresh.auth.service.js";
import { clearAuthCookies } from "../utils/clear.auth.cookies.js";

interface CreateDesignationBody {
  title: string;
  description?: string;
  permissionIds: string[];
  multipleAssignment: boolean;
}

const IMAGE_DIR = "/var/www/ekPratisatMonorepo/images/profileImage";

export const signIn = async (req: Request, res: Response) => {
  try {
    const result = userSigninSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
    }
    const { contact, password } = result.data;

    const userAgent = req.get("user-agent") ?? undefined;
    const ipAddress = req.ip ?? undefined;

    const user = await authenticateUser({
      contact,
      password,
      userAgent,
      ipAddress,
    });

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
      ...(user.role === "staff" && { perms: compactPermissions }),
      sessionId: user.sessionId,
    });

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: "/", // cookie available for entire domain
      domain:
        process.env.NODE_ENV === "production"
          ? ".ekpratishat.com"
          : "localhost",
    });

    res.cookie("sessionPresent", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge:  user.role !== "client"
          ? 30 * 60 * 1000
          : 30 * 24 * 60 * 60 * 1000,
      path: "/",
      domain:
        process.env.NODE_ENV === "production"
          ? ".ekpratishat.com"
          : "localhost",
    });

    res.cookie("refreshToken", user.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge:
        user.role === "admin" || user.role === "staff"
          ? 30 * 60 * 1000
          : 30 * 24 * 60 * 60 * 1000,
      path: "/auth/refresh",
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
        designation: user.designation?.title ?? null,
      },
    });
  } catch (err) {
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

export const createClientUser = async (req: Request, res: Response) => {
  try {
    const isMobileSignup = req.query.isMobileSignup === "true" ? true : false;

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

    // if (!isMobileSignup) {
    //   const token = generateToken({
    //     sessionId: "aa",
    //     userId: result.user.id,
    //     role: result.user.role,
    //     name: result.user.name,
    //     profileImageUrl: result.user.profileImageUrl,
    //   });

    //   res.cookie("accessToken", token, {
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === "production",
    //     sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    //     maxAge: 24 * 30 * 60 * 60 * 1000,
    //     path: "/", // cookie available for entire domain
    //     domain:
    //       process.env.NODE_ENV === "production"
    //         ? ".ekpratishat.com"
    //         : "localhost",
    //   });
    // }
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

export const signOut = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    await prisma.session.update({
      where: { id: user.sessionId },
      data: {
        revokedAt: new Date(),
      },
    });

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

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/auth/refresh",
      domain:
        process.env.NODE_ENV === "production"
          ? ".ekpratishat.com"
          : "localhost",
    });

    res.clearCookie("sessionPresent", {
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
      ok: true,
      message: "Logged Out!!!",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const myInfo = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(200).json({
        user: null,
      });
    }

    const checkUser = await prisma.user.findUnique({
      where: { id: user.id, isActive: true },
      select: {
        id: true,
        name: true,
        role: true,
        profileImageUrl: true,
        isActive: true,
        designation: {
          select: {
            title: true,
          },
        },
        _count: {
          select: {
            notificationReceive: {
              where: { isRead: false },
            },
          },
        },
      },
    });
    if (!checkUser) {
      return res.status(401).json({
        message: "User not found",
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
        designation: checkUser.designation?.title ?? null,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
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

        prisma.session.updateMany({
          where: { userId: agentId, revokedAt: null },
          data: {
            revokedAt: new Date(),
          },
        }),
      ]);
      triggerFrontendUpdate({ tag: "properties" });
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
      triggerFrontendUpdate({ tag: "properties" });
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
  res: Response,
) => {
  try {
    const { title, description, permissionIds, multipleAssignment } = req.body;

    if (!title || !Array.isArray(permissionIds)) {
      throw new AppError(400, "Title and permissionIds array are required");
    }

    const designation = await prisma.designation.create({
      data: {
        title: title.trim().toUpperCase(),
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
      message: "Designation Created Successfully",
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

export const updateDesignation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const { title, description, permissionIds, multipleAssignment } = req.body;

    if (!title || !Array.isArray(permissionIds)) {
      throw new AppError(400, "Title and permissionIds array are required");
    }

    await prisma.$transaction(async (tx) => {
      const designation = await tx.designation.update({
        where: { id: id as string },
        data: {
          title: title.trim(),
          description: description ?? null,
          multipleAssignment: Boolean(multipleAssignment),
        },
      });

      // Step B: Wipe all existing permissions associated with this designation
      await tx.designationPermission.deleteMany({
        where: { designationId: id as string },
      });

      // Step C: Bulk-insert the newly selected permissions (if array is not empty)
      if (permissionIds.length > 0) {
        await tx.designationPermission.createMany({
          data: permissionIds.map((permissionId: string) => ({
            designationId: id as string,
            permissionId,
          })),
        });
      }

      await tx.auditLog.create({
        data: {
          actorType: user.role,
          actorId: user.id,
          actorName: user.name,
          action: "UPDATE",
          entityType: "Designation",
          entityId: designation.id,
        },
      });
    });

    return res.status(200).json({
      message: "Position updated Successfully",
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

//my-profile

export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    const myProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        name: true,
        contact: true,
        email: true,
        profileImageUrl: true,
      },
    });

    if (!myProfile) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(myProfile);
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

//change profile image
export async function updateProfileImage(req: Request, res: Response) {
  const user = req.user;
  const file = req.file
    ? {
        fieldname: req.file.fieldname,
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        originalname: req.file.originalname,
        size: req.file.size,
      }
    : null;

  let imageUrl = "";
  let absoluteUploadedPath = "";

  try {
    const userInfo = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!userInfo) {
      return res.status(404).json({ message: "User not found" });
    }

    if (file) {
      const filename = `${Date.now()}-${file.originalname}`;
      const outputFormat = "webp";
      const cleanFilename = filename.replace(
        path.extname(filename),
        `.${outputFormat}`,
      );

      absoluteUploadedPath = path.join(IMAGE_DIR, cleanFilename);

      const optimizedBuffer = await sharp(file.buffer)
        .resize(1200)
        .toFormat(outputFormat, { quality: 100 })
        .toBuffer();

      // Non-blocking async file system write
      await fs.writeFile(absoluteUploadedPath, optimizedBuffer);
      imageUrl = `/image/profileImage/${cleanFilename}`;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userInfo.id },
      data: { profileImageUrl: imageUrl ? imageUrl : null },
    });

    if (userInfo.profileImageUrl) {
      const oldAbsoluteFilePath = path.join(
        IMAGE_DIR,
        path.basename(userInfo.profileImageUrl),
      );
      if (fsSync.existsSync(oldAbsoluteFilePath)) {
        await fs
          .unlink(oldAbsoluteFilePath)
          .catch((err) => console.error("Failed to delete legacy file:", err));
      }
    }

    return res.status(200).json({
      message: "Profile image updated successfully",
      profileImageUrl: updatedUser.profileImageUrl,
    });
  } catch (error) {
    if (absoluteUploadedPath && fsSync.existsSync(absoluteUploadedPath)) {
      try {
        fsSync.unlinkSync(absoluteUploadedPath);
      } catch (e) {
        console.error("Failed to remove orphaned file in rollback step:", e);
      }
    }
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

//change password via old password

export async function changePassword(req: Request, res: Response) {
  const user = req.user;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Old and new passwords are required" });
  }

  try {
    const userInfo = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!userInfo) {
      return res.status(404).json({ message: "User not found" });
    }

    const isOldPasswordValid = await comparePassword(
      oldPassword,
      userInfo.password,
    );
    if (!isOldPasswordValid) {
      return res.status(403).json({ message: "Old password is incorrect" });
    }

    const hashedNewPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userInfo.id },
      data: { password: hashedNewPassword },
    });

    await prisma.session.updateMany({
      where: {
        userId: user.id,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

export async function refreshAccessToken(req: Request, res: Response) {
  const isMobile = req.query.isMobile === "true";

  try {
    const refreshToken = isMobile
      ? req.body?.refreshToken
      : req.cookies?.refreshToken;


    if (!refreshToken) {
      throw new AppError(401, "Refresh token missing!!!");
    }
    const result = await refreshSession(refreshToken);

    if (isMobile) {
      return res.status(200).json({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    }

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: "/", // cookie available for entire domain
      domain:
        process.env.NODE_ENV === "production"
          ? ".ekpratishat.com"
          : "localhost",
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge:
        result.user.role !== "client"
          ? 30 * 60 * 1000
          : 30 * 24 * 60 * 60 * 1000,
      path: "/auth/refresh",
      domain:
        process.env.NODE_ENV === "production"
          ? ".ekpratishat.com"
          : "localhost",
    });
    res.cookie("sessionPresent", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge:
        result.user.role !== "client"
          ? 30 * 60 * 1000
          : 30 * 24 * 60 * 60 * 1000,
      path: "/",
      domain:
        process.env.NODE_ENV === "production"
          ? ".ekpratishat.com"
          : "localhost",
    });

    return res.status(200).json({
      ok: true,
      message: "Access token refreshed successfully",
    });
  } catch (error) {
    if (!isMobile) {
      console.log("Clearing cookies due to refresh token failure.");
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

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/auth/refresh",
        domain:
          process.env.NODE_ENV === "production"
            ? ".ekpratishat.com"
            : "localhost",
      });
      res.clearCookie("sessionPresent", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        domain:
          process.env.NODE_ENV === "production"
            ? ".ekpratishat.com"
            : "localhost",
      });
    }
    if (error instanceof AppError) {
      return res.status(error.status).json({ message: error.message });
    }
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
