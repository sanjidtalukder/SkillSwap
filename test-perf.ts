import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const dbUser = await prisma.user.findFirst();
  if (!dbUser) {
    console.log("No users found to test.");
    return;
  }

  console.log(`Testing with user ${dbUser.id}...`);

  // Measure Sequential
  const startSeq = performance.now();
  
  await prisma.userSkill.count({ where: { userId: dbUser.id } });
  await prisma.project.count({
    where: { status: "active", OR: [{ ownerId: dbUser.id }, { members: { some: { userId: dbUser.id } } }] }
  });
  await prisma.matchRequest.count({
    where: { status: "accepted", OR: [{ senderId: dbUser.id }, { receiverId: dbUser.id }] }
  });
  await prisma.matchRequest.count({
    where: { receiverId: dbUser.id, status: "pending" }
  });
  await prisma.projectJoinRequest.count({
    where: { project: { ownerId: dbUser.id }, status: "pending" }
  });
  await prisma.project.findMany({
    where: { status: "active", ownerId: { not: dbUser.id } },
    include: { owner: { include: { profile: true } }, _count: { select: { members: true } } },
    orderBy: { createdAt: "desc" },
    take: 3
  });
  await prisma.matchRequest.findMany({
    where: { status: "accepted", OR: [{ senderId: dbUser.id }, { receiverId: dbUser.id }] },
    include: { sender: { include: { profile: true } }, receiver: { include: { profile: true } } },
    orderBy: { updatedAt: "desc" },
    take: 3
  });
  await prisma.notification.findMany({
    where: { recipientId: dbUser.id },
    orderBy: { createdAt: "desc" },
    take: 3
  });

  const endSeq = performance.now();
  
  // Measure Concurrent
  const startConc = performance.now();
  await Promise.all([
    prisma.userSkill.count({ where: { userId: dbUser.id } }),
    prisma.project.count({
      where: { status: "active", OR: [{ ownerId: dbUser.id }, { members: { some: { userId: dbUser.id } } }] }
    }),
    prisma.matchRequest.count({
      where: { status: "accepted", OR: [{ senderId: dbUser.id }, { receiverId: dbUser.id }] }
    }),
    prisma.matchRequest.count({
      where: { receiverId: dbUser.id, status: "pending" }
    }),
    prisma.projectJoinRequest.count({
      where: { project: { ownerId: dbUser.id }, status: "pending" }
    }),
    prisma.project.findMany({
      where: { status: "active", ownerId: { not: dbUser.id } },
      include: { owner: { include: { profile: true } }, _count: { select: { members: true } } },
      orderBy: { createdAt: "desc" },
      take: 3
    }),
    prisma.matchRequest.findMany({
      where: { status: "accepted", OR: [{ senderId: dbUser.id }, { receiverId: dbUser.id }] },
      include: { sender: { include: { profile: true } }, receiver: { include: { profile: true } } },
      orderBy: { updatedAt: "desc" },
      take: 3
    }),
    prisma.notification.findMany({
      where: { recipientId: dbUser.id },
      orderBy: { createdAt: "desc" },
      take: 3
    })
  ]);
  const endConc = performance.now();

  console.log(`Sequential execution time: ${(endSeq - startSeq).toFixed(2)} ms`);
  console.log(`Concurrent execution time: ${(endConc - startConc).toFixed(2)} ms`);
  console.log(`Improvement: ${(((endSeq - startSeq) - (endConc - startConc)) / (endSeq - startSeq) * 100).toFixed(2)}%`);
}

run()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
