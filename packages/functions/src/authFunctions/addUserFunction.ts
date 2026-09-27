import { prisma } from "@repo/database";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import bcrypt from "bcrypt";
import pLimit from "p-limit";
import { AppError } from "../error.js";
import { userSignupSchema, UserSingUpSchema } from "@repo/validators";

const PROFILE_IMAGE_DIR = "/var/www/ekPratisatMonorepo/images/profileImage";
const DOCUMENT_IMAGE_DIR = "/var/www/ekPratisatMonorepo/images/idDocument";

type DocType =
  | "CITIZENSHIP_FRONT"
  | "CITIZENSHIP_BACK"
  | "PAN"
  | "PASSPORT"
  | "OTHER";

export type UploadedFile = {
  fieldname: string;
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size:number;
};

export async function createUser({
  body,
  files,
}: {
  body: any;
  files: UploadedFile[];
}) {
  // --- 1️⃣ Extract fields
  const credentials: Partial<UserSingUpSchema> = {
    name: body.name,
    contact: body.contact,
    password: body.password,
    email: body.email,
    role: body.role ?? "client",
    isVerified: body.isVerified === "true",
    createdById: body.createdById ?? null,
    verifiedById: body.verifiedById ?? null,
  };

  // profile image
  const profileImageFile = files.find((f) => f.fieldname === "profileImage");

  if (profileImageFile) {
    credentials.profileImage = profileImageFile as any;
  }

  // documents
  const documentEntries: { type: string; image: UploadedFile }[] = [];

  const documentsFromBody = body.document || [];

  documentsFromBody.forEach((doc: any, index: number) => {
    const imageFile = files.find(
      (f) => f.fieldname === `document[${index}][image]`,
    );

    if (doc?.type && imageFile) {
      documentEntries.push({
        type: doc.type,
        image: imageFile,
      });
    }
  });

  if (documentEntries.length) {
    credentials.document = documentEntries as any;
  }
 

  // --- 3️⃣ Validate
  const result = userSignupSchema.safeParse(credentials);

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;

    const formatted: Record<string, string> = {};

    (Object.keys(fieldErrors) as (keyof typeof fieldErrors)[]).forEach(
      (key) => {
        const msg = fieldErrors[key]?.[0];
        if (msg) formatted[key as string] = msg;
      },
    );

    throw new AppError(422, "Validation failed", formatted);
  }

  const userData = result.data;

  // --- 4️⃣ File processing setup
  const uploadedFiles: string[] = [];
  const limit = pLimit(3);

  async function optimizeAndSave(file: UploadedFile, destDir: string) {
    const filename = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.webp`;

    const filePath = path.join(destDir, filename);

    const optimized = await sharp(file.buffer)
      .resize(1200)
      .toFormat("webp", { quality: 90 })
      .toBuffer();

    await fs.promises.writeFile(filePath, optimized);

    uploadedFiles.push(filePath);

    return `/image/${path.basename(destDir)}/${filename}`;
  }

  // --- 5️⃣ Upload images
  let profileImageUrl: string | undefined;
  const documentUrls: { type: string; imageUrl: string }[] = [];

  const uploadPromises: Promise<void>[] = [];

  if (userData.profileImage) {
    uploadPromises.push(
      limit(async () => {
        profileImageUrl = await optimizeAndSave(
          userData.profileImage as any,
          PROFILE_IMAGE_DIR,
        );
      }),
    );
  }

  if (userData.document?.length) {
    for (const doc of userData.document as any[]) {
      uploadPromises.push(
        limit(async () => {
          const imageUrl = await optimizeAndSave(doc.image, DOCUMENT_IMAGE_DIR);
          documentUrls.push({
            type: doc.type,
            imageUrl,
          });
        }),
      );
    }
  }

  try {
    await Promise.all(uploadPromises);
  } catch (err) {
    await Promise.allSettled(uploadedFiles.map((f) => fs.promises.unlink(f)));
    throw new AppError(500, "Image processing failed");
  }

  // --- 6️⃣ DB transaction
  try {
    const response = await prisma.$transaction(async (tx) => {
      const existing = await tx.user.findFirst({
        where: {
          OR: [{ contact: userData.contact }, { email: userData.email }],
        },
      });

      if (existing) {
        const field =
          existing.contact === userData.contact ? "contact" : "email";
        const msg = `${field === "contact" ? "Contact" : "Email"} already in use`;

        throw new AppError(400, msg, { [field]: msg });
      }

      const hashedPassword = await bcrypt.hash(userData.password, 9);

      const user = await tx.user.create({
        data: {
          name: userData.name,
          contact: userData.contact,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          isVerified: userData.isVerified,
          profileImageUrl: profileImageUrl ?? null,
          verifiedById: userData.verifiedById,
          createdById: userData.createdById,
          documents: documentUrls.length
            ? {
                create: documentUrls.map((doc) => ({
                  type: doc.type as DocType,
                  url: doc.imageUrl,
                  isVerified: userData.isVerified,
                  verifiedById: userData.isVerified
                    ? userData.verifiedById
                    : null,
                })),
              }
            : undefined,
        },
      });

      return {
        status: 200,
        user: {
          id: user.id,
          role: user.role,
          name: user.name,
          profileImageUrl:user.profileImageUrl
        },
      };
    });

    return response;
  } catch (error) {
    await Promise.allSettled(uploadedFiles.map((f) => fs.promises.unlink(f)));
    if (error instanceof AppError) throw error;

    throw new AppError(500, "Internal server error!!!");
  }
}
