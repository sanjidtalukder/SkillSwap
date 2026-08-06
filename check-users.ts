import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' } // Keep oldest
  });
  console.log('Total users:', users.length);
  
  const uidMap = new Map();
  for (const user of users) {
    if (uidMap.has(user.firebaseUid)) {
      console.log('Duplicate firebaseUid found:', user.firebaseUid);
      await prisma.user.delete({ where: { id: user.id } });
      console.log('Deleted duplicate user with id:', user.id);
    } else {
      uidMap.set(user.firebaseUid, user.id);
    }
  }

  const emailMap = new Map();
  const currentUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' }
  });
  for (const user of currentUsers) {
    if (emailMap.has(user.email)) {
      console.log('Duplicate email found:', user.email);
      try {
        await prisma.user.delete({ where: { id: user.id } });
        console.log('Deleted duplicate user with id:', user.id);
      } catch (e) {
      }
    } else {
      emailMap.set(user.email, user.id);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
