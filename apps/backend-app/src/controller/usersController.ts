import {
  DatabaseError,
  handlePrismaError,
  Prisma,
  prisma,
} from "@repo/database";
import { AppError } from "@repo/functions";
import { Request, Response } from "express";




export async function getStaff(req: Request, res: Response) {
  try {
    const result = await prisma.user.findMany({
      where: {
        role: "staff",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        contact: true,
        isVerified: true,
        createdAt: true,
        secondContact: true,
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: "Couldn't fetch data" });
  }
}

export async function getUsers(req: Request, res: Response) {
  try {
    const queries = req.query;
    const page = Math.max(1, Number(queries.page || 1));
    const pageSize = Math.min(100, Math.max(1, Number(queries.pageSize || 20)));

    const validRoles = ["client", "staff", "partner"];
    const roleQuery = String(queries.role || "")
      .toLowerCase()
      .trim();
    const filterRole = validRoles.includes(roleQuery)
      ? (roleQuery as "client" | "staff" | "partner")
      : undefined;

    const isVerifiedQuery = queries.isVerified;
    const filterVerified =
      isVerifiedQuery === "true"
        ? true
        : isVerifiedQuery === "false"
          ? false
          : undefined;

    const isActiveQuery = queries.isActive;
    const filterActive =
      isActiveQuery === "true"
        ? true
        : isActiveQuery === "false"
          ? false
          : undefined;

    const q = String(queries.q || "")
      .toLowerCase()
      .trim();

    const where: Prisma.UserWhereInput = {
      role: {
        not: "admin",
      },
      ...(filterVerified !== undefined && { isVerified: filterVerified }),
      ...(filterActive !== undefined && { isActive: filterActive }),
      ...(q && { name: { contains: q, mode: "insensitive" } }),
      ...(filterRole && { role: filterRole }),
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.user.count({ where }),
    ]);

    return res.status(200).json({
      items,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error!!!",
    });
  }
}

export async function getAdminOrStaff(req: Request, res: Response) {
  const user = req.user;
  try {
    const result = await prisma.user.findMany({
      where: {
        OR: [{ role: "admin" }, { role: "staff" }],
      },
      select: {
        id: true,
        name: true,
        role: true,
      },
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch users",
    });
  }
}

export async function getTotalValuation(req: Request, res: Response) {
  try {
    const user = req.user;
    const result = await prisma.property.groupBy({
      by: ["type"],
      where: {
        handlerId: user.id,
        isSold: false, // if you don't want sold properties
        isActive: true,
      },
      _sum: {
        price: true,
      },
      _count: {
        id: true,
      },
    });

    // res.setHeader("Cache-Control", "private, max-age=7200");
    return res.status(200).json(result);
  } catch (error) {
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
}

//Create designation
