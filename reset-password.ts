import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function resetPassword() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error("Usage: node reset-password.js <email> <new-password>");
    process.exit(1);
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    console.log(`✅ Password updated successfully for ${user.name} (${user.email})`);
    console.log(`✅ User is ${user.isActive ? 'Active' : 'Inactive'} and ${user.isAdmin ? 'Admin' : 'Not Admin'}`);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
