import { UploadedFile } from "../authFunctions/addUserFunction.js";
import { AppError } from "../index.js";
import { prisma } from "@repo/database";
import path from "path";
import sharp from "sharp";
import fs from "fs";

type Upload = UploadedFile | null;
interface UserProps {
  id: string;
  role: string;
  name: string;
}

const IMAGE_DIR = "/var/www/ekPratisatMonorepo/images/leadImage";

export async function createLead({
  body,
  file,
  user,
}: {
  body: any;
  file: Upload;
  user: UserProps;
}) {
  let imageUrl = "";
  try {
    if (file) {
      const imageFile = file;
      const filename = Date.now() + "-" + imageFile.originalname;
      const outputFormat = "webp";
      const filePath = path.join(
        IMAGE_DIR,
        filename.replace(path.extname(filename), `.${outputFormat}`),
      );

      const optimizedBuffer = await sharp(imageFile.buffer)
        .resize(1200)
        .toFormat(outputFormat, { quality: 100 })
        .toBuffer();

      await fs.promises.writeFile(filePath, optimizedBuffer);

      imageUrl = `/image/leadImage/${path.basename(filePath)}`;
    }

    const result = await prisma.$transaction(async (tx) => {
      const lead = await tx.lead.create({
        data: {
          name: body.name?.trim() ?? null,
          email: body.email?.trim() ?? null,
          contact: body.contact?.trim(),
          coordinates: body.coordinates?.trim() ?? null,
          source: body.source?.trim(),
          clientType: body.clientType,
          propertyId: body.propertyId?.trim() ?? null,
          imageUrl: imageUrl ?? null,
          managedById: body.managedById,
          notes: body.notes ? JSON.parse(body.notes) : null,
          dealType: body.dealType,
          categoryId:body.categoryId
        },
      });

      if (user.role === "staff") {
        // 1. Fetch all admin users
        const admins = await tx.user.findMany({
          where: { role: "admin" },
          select: { id: true, name: true },
        });

        // 2. Create the unified event and distribute it instantly to all admins
        await tx.notificationEvent.create({
          data: {
            senderId: user.id,
            title: `Lead Created by ${user.name}`,
            body: `${user.name} new lead information for ${lead.contact}`,
            link: `/admin/leads/${lead.id}`,

            // Connect everyone dynamically via relational mapping
            recipients: {
              create: admins.map((admin) => ({
                recipientId: admin.id,
              })),
            },
          },
        });
      }

      if (user.role === "admin") {
        const otherAdmins = await tx.user.findMany({
          where: {
            role: "admin",
            id: { not: user.id },
          },
          select: { id: true },
        });

        const recipientSet = new Set<string>(
          otherAdmins.map((admin) => admin.id),
        );

        // ✅ FIX: Only alert the handler if they exist AND they aren't the one who created this lead entry record
        if (lead.managedById && lead.managedById !== user.id) {
          recipientSet.add(lead.managedById);
        }

        const recipientIds = Array.from(recipientSet);

        // 4. Fire the single insert transaction query
        await tx.notificationEvent.create({
          data: {
            senderId: user.id,
            title: `Lead Adjusted by ${user.name}`,
            body: `Admin ${user.name} added new lead: ${lead.contact}`,
            link: `/admin/leads/${lead.id}`,
            recipients: {
              create: recipientIds.map((id) => ({
                recipientId: id,
              })),
            },
          },
        });
      }

      return true;
    });

    return {
      status: 200,
      message: "Lead created successfully",
    };
  } catch (error) {
    if (imageUrl) {
      const filePath = path.join(IMAGE_DIR, path.basename(imageUrl));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    throw new AppError(500, "Something Happened!!! Please try again later.");
  }
}
