import { prisma, Prisma } from "@repo/database";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import pLimit from "p-limit";
import { UploadedFile } from "../authFunctions/addUserFunction.js";
import { AppError } from "../error.js";

interface UserProp {
  userRole: string;
  userId: string;
  scope: "all" | "own";
}

const IMAGE_DIR = "/var/www/ekPratisatMonorepo/images/propertyImage";
const MAX_CONCURRENT_IMAGES = 5; // limit parallel Sharp processes

export async function updateListingFunction({
  body,
  imageFiles,
  userInfo,
}: {
  body: any;
  imageFiles: UploadedFile[];
  userInfo: UserProp;
}) {
  const limit = pLimit(MAX_CONCURRENT_IMAGES);

  const imageUrls = await Promise.all(
    imageFiles.map((file) =>
      limit(async () => {
        const ext = path.extname(file.originalname);

        const baseName = path
          .basename(file.originalname, ext)
          .replace(/\s+/g, "-")
          .replace(/[^a-zA-Z0-9-_]/g, "")
          .toLowerCase();

        const finalFilename = `${Date.now()}-${baseName || "property-image"}.webp`;
        const filePath = path.join(IMAGE_DIR, finalFilename);

        const fileSizeMB = file.size / (1024 * 1024);

        let sharpInstance = sharp(Buffer.from(file.buffer));

        // Always convert to webp
        // Only resize/compress aggressively if file > 1MB
        if (fileSizeMB > 1) {
          sharpInstance = sharpInstance.resize(1600);
        }

        await sharpInstance
          .toFormat("webp", {
            quality: fileSizeMB > 1 ? 85 : 90,
          })
          .toFile(filePath);

        return `/image/propertyImage/${finalFilename}`;
      }),
    ),
  );

  const data = body;
  const deleteImageIds: string[] = Array.isArray(body.deleteImageIds)
    ? body.deleteImageIds
    : [];
  const deletedImageUrls: string[] = [];
  const geoPointQuery =
    data.lat && data.lng
      ? Prisma.sql`ST_SetSRID(ST_MakePoint(${data.lng}, ${data.lat}), 4326)`
      : Prisma.sql`"geoPoint"`;
  try {
    const whereCondition = {
      id: body.propertyId,
      ...(userInfo.scope === "own" &&
        (userInfo.userRole === "client"
          ? { userId: userInfo.userId }
          : { handlerId: userInfo.userId })), 
    };
    const checkPropertyOwner = await prisma.property.findUnique({
      where: whereCondition,
    });

    if (!checkPropertyOwner) {
      throw new AppError(
        404,
        "Property not found or you do not have permission to edit it",
      );
    }

    // if (
    //   checkPropertyOwner.userId !== userInfo.userId &&
    //   userInfo.userRole !== "admin"
    // ) {
    //   throw new AppError(403, "You are not authorized to edit the property");
    // }

    const listing = await prisma.$transaction(async (tx) => {
      const updated = await tx.$queryRaw<any[]>`
  UPDATE "public"."Property"
  SET
    "title" = ${data.title},
    "description" = ${data.description},
    "price" = ${data.price},
    "type" = ${data.type}::"SaleType",
    "noOfBedRooms" = ${data.noOfBedRooms},
    "noOfRestRooms" = ${data.noOfRestRooms},
    "landArea" = ${data.landArea},
    "noOfFloors" = ${data.noOfFloors},
    "propertyAge" = ${data.propertyAge},
    "facingDirection" = ${data.facingDirection},
    "floorArea" = ${data.floorArea},
    "roadSize" = ${data.roadSize},
    "verified" = ${data.verified ?? false},
    "locationId" = ${data.locationId},
    "floorLevel" = ${data.floorLevel},
    "tole" = ${data.tole},
    "updatedAt" = NOW(),
    "geoPoint" = ${geoPointQuery},
    "negotiable"=${data.negotiable},
    "features" = ${data.features ? JSON.parse(data.features) : null}
  WHERE "id" = ${body.propertyId}
  RETURNING 
  "id",
  "title",
  "description",
  "price",
  "type",
  "noOfBedRooms",
  "noOfRestRooms",
  "landArea",
  "noOfFloors",
  "propertyAge",
  "facingDirection",
  "floorArea",
  "roadSize",
  "verified",
  "locationId",
  "floorLevel",
  "tole",
  "updatedAt",
  ST_AsText("geoPoint") as "geoPoint";
`;

      if (!updated.length) {
        throw new AppError(404, "Property not found or update failed");
      }
      const propertyRow = updated[0];

      const currentImages = await tx.image.findMany({
        where: { propertyId: body.propertyId },
        select: { id: true, url: true },
      });

      if (deleteImageIds.length) {
        await tx.image.deleteMany({
          where: {
            id: { in: deleteImageIds },
            propertyId: body.propertyId,
          },
        });
        deletedImageUrls.push(
          ...currentImages
            .filter((img) => deleteImageIds.includes(img.id))
            .map((img) => img.url),
        );
      }

      // 6. Add new uploaded images
      if (imageUrls.length) {
        await tx.image.createMany({
          data: imageUrls.map((url) => ({
            url,
            propertyId: body.propertyId,
          })),
        });
      }

      const targetingAmenities: string[] = Array.isArray(data.amenities)
        ? data.amenities
        : [];

      await tx.property.update({
        where: { id: body.propertyId },
        data: {
          amenities: {
            set: targetingAmenities.map((id: string) => ({ id })),
          },
        },
      });

      return propertyRow;
    });

    await Promise.all(
      deletedImageUrls.map(async (url) => {
        const filePath = path.join(IMAGE_DIR, path.basename(url));
        try {
          await fs.promises.unlink(filePath);
        } catch {}
      }),
    );

    return {
      message: "Listing Updated Successfully!!!",
      listing,
      status: 200,
      ownerId: checkPropertyOwner.userId,
    };
  } catch (error) {
    imageUrls.forEach((url) => {
      const filePath = path.join(IMAGE_DIR, path.basename(url));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });
    if (error instanceof AppError) throw error;
    throw new AppError(500, "Failed to update listing");
  }
}
