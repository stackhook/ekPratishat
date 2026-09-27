import { prisma } from "@repo/database";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import pLimit from "p-limit";
import { createPropertySchema, CreatePropertySchema } from "@repo/validators";
import { AppError } from "../error.js";
import { randomUUID } from "crypto";
import { UploadedFile } from "../authFunctions/addUserFunction.js";

const IMAGE_DIR = "/var/www/ekPratisatMonorepo/images/propertyImage";
const MAX_CONCURRENT_IMAGES = 5; // limit parallel Sharp processes

export async function createListingFunction({
  body,
  imageFiles,
}: {
  body: any;
  imageFiles: UploadedFile[];
}) {
  const parsed = createPropertySchema.safeParse(body);
  // if (!parsed.success) throw new AppError(422, "Validation Failed!!!");

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    const formatted: Record<string, string> = {};

    (Object.keys(fieldErrors) as (keyof typeof fieldErrors)[]).forEach(
      (key) => {
        const msg = fieldErrors[key]?.[0];
        if (msg) formatted[key as string] = msg;
      },
    );

    throw new AppError(422, "Validation failed", formatted);
  }

  // Limit parallel processing to avoid CPU spikes
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
    })
  )
);

  const { images: _images, lat, lng, ...data } = parsed.data;
  

  try {
    const listing = await prisma.$transaction(async (tx) => {
      // Generate id in app (since we're doing raw insert)
      const propertyId = randomUUID();
      // Insert property with geoPoint using PostGIS
      // NOTE: ST_MakePoint takes (lng, lat)
      const inserted = await tx.$queryRaw<any[]>`
  INSERT INTO "public"."Property" (
    "id",
    "title",
    "description",
    "negotiable",
    "price",
    "type",
    "categoryId",
    "userId",
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
    "createdAt",
    "updatedAt",
    "floorLevel",
    "tole",
    "geoPoint",
    "features",
    "handlerId"
  )
  VALUES (
    ${propertyId},
    ${data.title},
    ${data.description},
    ${data.negotiable},
    ${data.price},
    ${data.type}::"SaleType",
    ${data.categoryId},
    ${body.userId},
    ${data.noOfBedRooms},
    ${data.noOfRestRooms},
    ${data.landArea},
    ${data.noOfFloors},
    ${data.propertyAge},
    ${data.facingDirection},
    ${data.floorArea},
    ${data.roadSize},
    ${data.verified ?? false},
    ${data.locationId},
    NOW(),
    NOW(),
    ${data.floorLevel},
    ${data.tole},
    ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
    ${data.features ? JSON.parse(data.features) : null},
    ${body.handlerId ?? null}

  )
  RETURNING
    "id",
    "title",
    "description",
    "price",
    "type",
    "categoryId",
    "userId",
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
    "createdAt",
    "updatedAt",
    "floorLevel",
    "tole";
`;
      if (!inserted.length) {
        throw new AppError(404, "Property creation failed!!!");
      }
      const propertyRow = inserted[0];

      // Insert images referencing the new property
      if (imageUrls.length) {
        await tx.image.createMany({
          data: imageUrls.map((url) => ({
            url,
            propertyId: propertyRow.id,
          })),
        });
      }

      if (data.amenities && Array.isArray(data.amenities) && data.amenities.length > 0) {
      await tx.property.update({
        where: { id: propertyRow.id },
        data: {
          amenities: {
            connect: data.amenities.map((id: string) => ({ id })),
          },
        },
      });
    }

      return propertyRow;
    });
    return {
      message: "Listing added successfully",
      listing,
      status: 200,
    };
  } catch (error) {
 
    // Optionally: clean up images from disk if DB fails
    imageUrls.forEach((url) => {
      const filePath = path.join(IMAGE_DIR, path.basename(url));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });
    throw new AppError(500, "Failed to create listing");
  }
}
