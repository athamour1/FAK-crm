/**
 * Seed — runs after `prisma migrate deploy` on first boot.
 * Env vars:
 *   SEED_ADMIN_EMAIL    (default: admin@ouchtracker.local)
 *   SEED_ADMIN_PASSWORD (default: Admin1234!)
 *   SEED_ADMIN_NAME     (default: System Admin)
 */
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env['DATABASE_URL'] });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail    = process.env['SEED_ADMIN_EMAIL']    ?? 'admin@ouchtracker.local';
  const adminPassword = process.env['SEED_ADMIN_PASSWORD'] ?? 'Admin1234!';
  const adminName     = process.env['SEED_ADMIN_NAME']     ?? 'System Admin';

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    await prisma.user.create({
      data: {
        email:    adminEmail,
        password: await bcrypt.hash(adminPassword, 12),
        fullName: adminName,
        role:     Role.ADMIN,
      },
    });
    console.log(`[seed] Admin user created: ${adminEmail}`);
  } else {
    console.log(`[seed] Admin user already exists: ${adminEmail} — skipping`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
