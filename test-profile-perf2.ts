import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function runSequential(dbUser: any, skillsHave: string[], skillsNeed: string[]) {
  const start = performance.now();
  
  await prisma.userSkill.deleteMany({ where: { userId: dbUser.id } });
  for (const skillName of skillsHave) {
    const skill = await prisma.skill.upsert({
      where: { name: skillName },
      create: { name: skillName },
      update: {}
    });
    await prisma.userSkill.create({
      data: { userId: dbUser.id, skillId: skill.id, level: "Intermediate" }
    });
  }

  await prisma.userSkillNeed.deleteMany({ where: { userId: dbUser.id } });
  for (const skillName of skillsNeed) {
    const skill = await prisma.skill.upsert({
      where: { name: skillName },
      create: { name: skillName },
      update: {}
    });
    await prisma.userSkillNeed.create({
      data: { userId: dbUser.id, skillId: skill.id }
    });
  }
  
  return performance.now() - start;
}

async function runBulk(dbUser: any, skillsHave: string[], skillsNeed: string[]) {
  const start = performance.now();
  
  const allSkillNames = Array.from(new Set([...skillsHave, ...skillsNeed]));
  
  await Promise.all(
    allSkillNames.map(skillName => 
      prisma.skill.upsert({
        where: { name: skillName },
        create: { name: skillName },
        update: {}
      })
    )
  );

  const dbSkills = await prisma.skill.findMany({
    where: { name: { in: allSkillNames } },
    select: { id: true, name: true }
  });
  const skillNameToId = new Map(dbSkills.map((s: any) => [s.name, s.id]));

  // Transaction safety wrapper around the bulk operations
  await prisma.$transaction([
    prisma.userSkill.deleteMany({ where: { userId: dbUser.id } }),
    ...(skillsHave.length > 0 ? [prisma.userSkill.createMany({
      data: skillsHave.map(name => ({ userId: dbUser.id, skillId: skillNameToId.get(name)!, level: "Intermediate" })),
      skipDuplicates: true
    })] : []),
    prisma.userSkillNeed.deleteMany({ where: { userId: dbUser.id } }),
    ...(skillsNeed.length > 0 ? [prisma.userSkillNeed.createMany({
      data: skillsNeed.map(name => ({ userId: dbUser.id, skillId: skillNameToId.get(name)! })),
      skipDuplicates: true
    })] : [])
  ]);
  
  return performance.now() - start;
}

async function main() {
  const dbUser = await prisma.user.findFirst();
  if (!dbUser) {
    console.log("No user found.");
    return;
  }
  
  console.log(`Starting Profile Save Performance Test for user: ${dbUser.id}\n`);
  
  const tests = [
    { count: 5, prefix: "S5" },
    { count: 10, prefix: "S10" },
    { count: 20, prefix: "S20" },
    { count: 50, prefix: "S50" }
  ];

  for (const t of tests) {
    // Generate skill arrays, intentionally adding a duplicate to test deduplication
    const have = Array.from({length: Math.floor(t.count/2)}, (_, i) => `${t.prefix}_Have_${i}`);
    const need = Array.from({length: Math.ceil(t.count/2)}, (_, i) => `${t.prefix}_Need_${i}`);
    have.push(have[0]); // Add duplicate
    
    const haveSeq = Array.from(new Set(have));
    const needSeq = Array.from(new Set(need));
    
    console.log(`--- Test: ${t.count} Skills ---`);
    const timeSeq = await runSequential(dbUser, haveSeq, needSeq);
    console.log(`Sequential Time: ${timeSeq.toFixed(2)} ms`);
    
    const timeBulk = await runBulk(dbUser, have, need);
    console.log(`Bulk CreateMany Time: ${timeBulk.toFixed(2)} ms`);
    console.log(`Improvement: ${(((timeSeq - timeBulk) / timeSeq) * 100).toFixed(2)}%\n`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
