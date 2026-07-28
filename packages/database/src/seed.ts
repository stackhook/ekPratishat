
// import bcrypt from "bcrypt";
// import { prisma } from "./singletonPrisma.js";

// async function main() {
//   const hashedPassword = await bcrypt.hash("password123", 9);
  
//   await prisma.user.create({
//     data: {
//       email: "test@gmail.com",
//       password: hashedPassword,
//       role: "admin",
//       contact: "9811111111",
//       name: "test"
//     },
//   });

//   console.log("Seeding finished.");
// }

// main()
//   .catch((e) => console.error(e))
//   .finally(() => prisma.$disconnect());


import bcrypt from "bcrypt";
import { prisma } from "./singletonPrisma.js";

// 1. Central list of static system permissions
const SYSTEM_PERMISSIONS = [
  // --- Lead Permissions ---
  { resource: 'leads', action: 'create', scope: 'all' },
  { resource: 'leads', action: 'read',   scope: 'own' },
  { resource: 'leads', action: 'read',   scope: 'all' },
  { resource: 'leads', action: 'update', scope: 'own' },
  { resource: 'leads', action: 'update', scope: 'all' },
  { resource: 'leads', action: 'delete', scope: 'all' },

  // --- Property Permissions ---
  { resource: 'properties', action: 'create', scope: 'all' },
  { resource: 'properties', action: 'read',   scope: 'own' },
  { resource: 'properties', action: 'read',   scope: 'all' },
  { resource: 'properties', action: 'update', scope: 'own' },
  { resource: 'properties', action: 'update', scope: 'all' },
  { resource: 'properties', action: 'delete', scope: 'all' },
];

async function main() {
  console.log("🌱 Starting seed...");

  // 2. Sync Permissions
  console.log("🔄 Syncing permissions...");
  for (const perm of SYSTEM_PERMISSIONS) {
    await prisma.permission.upsert({
      where: {
        resource_action_scope: {
          resource: perm.resource,
          action: perm.action,
          scope: perm.scope,
        },
      },
      update: {}, // No updates if permission already exists
      create: {
        resource: perm.resource,
        action: perm.action,
        scope: perm.scope,
      },
    });
  }
  console.log("✅ Permissions synced.");

  // 3. Create Admin User (using upsert to prevent duplicate key errors on re-run)
  const hashedPassword = await bcrypt.hash("password123", 9);

  await prisma.user.upsert({
    where: { email: "test@gmail.com" },
    update: {},
    create: {
      email: "test@gmail.com",
      password: hashedPassword,
      role: "admin",
      contact: "9811111111",
      name: "test",
    },
  });
  console.log("✅ Admin user ready.");

  console.log("🎉 Seeding finished.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });