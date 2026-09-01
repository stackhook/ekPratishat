import { prisma } from "@repo/database";
import { AppError } from "@repo/functions";
import { Request, Response } from "express";

export async function getMobileListing(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      throw new AppError(400, "Invalid property id");
    }

    const userId = req.user?.id;

    const result = await prisma.property.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        type: true,
        tole: true,
        verified: true,
        createdAt: true,
        noOfBedRooms: true,
        noOfRestRooms: true,

        handler: {
          select: {
            id: true,
            name: true,
            email: true,
            contact: true,
            profileImageUrl: true,
          },
        },

        negotiable: true,
        landArea: true,
        noOfFloors: true,
        propertyAge: true,
        facingDirection: true,
        isActive: true,
        floorArea: true,
        roadSize: true,
        propertyCode: true,
        floorLevel: true,
        amenities: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
        isFeatured: true,

        images: {
          select: {
            url: true,
          },
        },

        coverImage: {
          select: {
            url: true,
          },
        },

        category: {
          select: {
            name: true,
          },
        },

        location: {
          select: {
            name: true,
            municipality: {
              select: {
                name: true,
                district: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!result) {
      throw new AppError(404, "Property not found");
    }

    let isFavourite = false;

    if (userId) {
      const favourite = await prisma.favourite.findUnique({
        where: {
          userId_propertyId: {
            userId,
            propertyId: id,
          },
        },
        select: {
          id: true,
        },
      });

      isFavourite = !!favourite;
    }

    return res.status(200).json({
      ...result,
      isFavourite,
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

export const fetchFavourites = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    const result = await prisma.favourite.findMany({
      where: {
        userId: user?.id,
      },
      select: {
        property: {
          select: {
            id: true,
            title: true,
            price: true,
            type: true,
            tole: true,
            propertyCode: true,
            isFeatured: true,
            verified: true,
            images: {
              select: {
                url: true,
              },
            },
            category: {
              select: {
                name: true,
              },
            },
            createdAt: true,
          },
        },
      },
    });

    const properties = result.map((favourite) => favourite.property);

    return res.status(200).json(properties);
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
