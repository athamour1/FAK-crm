/**
 * Prisma seed script — creates an initial Admin user and a few catalog items.
 * Run with:  npx ts-node prisma/seed.ts
 * Or add to package.json:  "prisma": { "seed": "ts-node prisma/seed.ts" }
 */
import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env['DATABASE_URL'] });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── Seed admin user ──────────────────────────────────────────────────────────
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@fakcrm.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin1234!';

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: await bcrypt.hash(adminPassword, 12),
        fullName: 'System Admin',
        role: Role.ADMIN,
      },
    });
    console.log(`✔ Admin user created: ${adminEmail}`);
  } else {
    console.log(`— Admin user already exists: ${adminEmail}`);
  }

  // ── Seed item catalog ────────────────────────────────────────────────────────
  const catalogItems = [
    { name: 'Surgical Mask',         category: 'Personal Protection',   unit: 'pcs' },
    { name: 'Nitrile Gloves (pair)', category: 'Personal Protection',   unit: 'pairs' },
    { name: 'Digital Thermometer',   category: 'Diagnostic Equipment',  unit: 'pcs' },
    { name: 'Pulse Oximeter',        category: 'Diagnostic Equipment',  unit: 'pcs' },
    { name: 'Adhesive Bandages',     category: 'Wound Care',            unit: 'pcs' },
    { name: 'Sterile Gauze Pad',     category: 'Wound Care',            unit: 'pcs' },
    { name: 'Antiseptic Wipes',      category: 'Wound Care',            unit: 'pcs' },
    { name: 'Elastic Bandage',       category: 'Wound Care',            unit: 'pcs' },
    { name: 'Paracetamol 500mg',     category: 'Medication',            unit: 'tablets' },
    { name: 'Ibuprofen 400mg',       category: 'Medication',            unit: 'tablets' },
    { name: 'Burn Gel',              category: 'Medication',            unit: 'tubes' },
    { name: 'Eye Wash Solution',     category: 'Medication',            unit: 'ml' },
    { name: 'CPR Face Shield',       category: 'Resuscitation',         unit: 'pcs' },
    { name: 'Emergency Blanket',     category: 'Emergency Supplies',    unit: 'pcs' },
    { name: 'Trauma Scissors',       category: 'Tools',                 unit: 'pcs' },
    { name: 'Tweezers',              category: 'Tools',                 unit: 'pcs' },
    { name: 'Safety Pins',           category: 'Tools',                 unit: 'pcs' },
  ];

  let created = 0;
  for (const item of catalogItems) {
    await prisma.itemCatalog.upsert({
      where: { name: item.name },
      update: {},
      create: item,
    });
    created++;
  }
  console.log(`✔ Catalog seeded with ${created} items`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
