import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function measureProjectsContains(search: string, insensitive: boolean) {
  const start = performance.now();
  
  const where = {
    status: "active",
    OR: [
      { title: insensitive ? { contains: search, mode: "insensitive" as const } : { contains: search } },
      { description: insensitive ? { contains: search, mode: "insensitive" as const } : { contains: search } },
      { requiredSkills: { hasSome: [search] } },
      { technologies: { hasSome: [search] } },
    ]
  };

  await Promise.all([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      take: 10,
      select: { id: true, title: true }
    })
  ]);

  return performance.now() - start;
}

async function main() {
  console.log("--- Measuring mode: insensitive vs Sensitive ---");
  
  // Warm up
  await measureProjectsContains("React", true);

  const timeInsensitive = await measureProjectsContains("React", true);
  console.log(`Insensitive (Current): ${timeInsensitive.toFixed(2)} ms`);
  
  const timeSensitive = await measureProjectsContains("React", false);
  console.log(`Sensitive (Optimized): ${timeSensitive.toFixed(2)} ms`);
  
  console.log(`Improvement: ${(((timeInsensitive - timeSensitive) / timeInsensitive) * 100).toFixed(2)}%`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
