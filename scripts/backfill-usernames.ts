import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateBaseUsername(fullName: string) {
  return fullName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || "user";
}

async function main() {
  const profiles = await prisma.profile.findMany();
  for (const profile of profiles) {
    if (!profile.username) {
      let username = generateBaseUsername(profile.fullName);
      let counter = 1;
      while (true) {
        const exists = await prisma.profile.findUnique({ where: { username } });
        if (!exists) break;
        counter++;
        username = `${generateBaseUsername(profile.fullName)}-${counter}`;
      }
      await prisma.profile.update({
        where: { id: profile.id },
        data: { username }
      });
      console.log(`Updated ${profile.fullName} -> ${username}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
