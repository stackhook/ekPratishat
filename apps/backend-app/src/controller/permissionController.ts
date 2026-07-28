import { DatabaseError, handlePrismaError, prisma } from "@repo/database";
import { AppError } from "@repo/functions";
import { Request, Response } from "express";

export const getAllPermissions = async (req: Request, res: Response) => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ resource: "asc" }, { action: "asc" }],
    });

    // Infer the single item type directly from the array: typeof permissions[number]
    type PermissionItem = (typeof permissions)[number];

    const groupedPermissions = permissions.reduce<
      Record<string, PermissionItem[]>
    >((acc, perm) => {
      // Initializes as empty array if undefined, then pushes
      (acc[perm.resource] ??= []).push(perm);
      return acc;
    }, {});

    return res.json(groupedPermissions);
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

export const getAllDesignations = async (req: Request, res: Response) => {
  try {
    const result = await prisma.designation.findMany({
      include: {
        permissions: true,
      },
    });
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({
      message: "Couldn't fetch designation data",
    });
  }
};

export const assignDesignation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const user = req.user;

    if (!id || Array.isArray(id) || !userId) {
      throw new AppError(400, "Designation ID and User ID are required");
    }

    const designation = await prisma.designation.findUnique({
      where: { id },
      include: { users:true },
    });

    if (!designation) {
      throw new AppError(404, "Designation with the provided Id doesn't exist");
    }

    if (!designation.multipleAssignment) {
      const isAssignedToOtherUser = designation.users.some(
        (u) => u.id !== (userId),
      );

      if (isAssignedToOtherUser) {
        throw new AppError(
          400,
          "This designation can only be assigned to a single user.",
        );
      }
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        designation: true,
        designationAssignedBy: true,
      },
    });

    if (!existingUser) {
      throw new AppError(400, "The user doesn't exist");
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          designationId: designation.id,
          designationAssignedById: user.id,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: user.id,
          actorType: user.role,
          actorName: user.name,
          action: "CREATE",
          entityType: "Designation",
          entityId: designation.id,
          oldValues: {
            oldDesignationId: existingUser.designationId,
            oldDesignationTitle: existingUser?.designation?.title,
            oldDesignationAssigner: existingUser?.designationAssignedBy?.name,
            oldDesignationAssignerId: existingUser?.designationAssignedBy?.id,
          },
          newValues: {
            newDesignationId: designation.id,
            newDesignationTitle: designation.title,
            AssignedBy: `${user.id}_${user.name}`,
          },
        },
      });
    });

    return res.status(200).json({
      message: `${designation.title} assigned to ${existingUser.name} sucessfully!!!`,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.status).json({
        message: error.message,
      });
    }
    try {
      // 🚀 Automatically checks and maps standard Prisma exceptions
      handlePrismaError(error);
    } catch (dbError) {
      // 🎯 Catch the parsed DatabaseError explicitly
      if (dbError instanceof DatabaseError) {
        return res
          .status(dbError.statusCode)
          .json({ message: dbError.message });
      }

      // Generic fallback for non-database unexpected crashes
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};
