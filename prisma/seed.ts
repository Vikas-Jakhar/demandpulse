/**
 * Seeds the database with the demo account referenced throughout the docs
 * and pre-filled into the login form (admin@demandpulse.io / demopass123).
 * Idempotent via upsert — safe to re-run against an existing database.
 *
 * Run with: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("demopass123", 12);

  const user = await prisma.user.upsert({
    where: { email: "admin@demandpulse.io" },
    update: {},
    create: {
      name: "Priya Shah",
      email: "admin@demandpulse.io",
      passwordHash,
    },
  });

  console.log(`Seeded demo user: ${user.email} (id: ${user.id})`);
  console.log("Login with: admin@demandpulse.io / demopass123");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
