import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
  ServiceAccount,
} from "firebase-admin/app";
import { getFirestore, Timestamp, WriteBatch } from "firebase-admin/firestore";

type Department = "CSE" | "SWE" | "EEE" | "BBA" | "English";

interface DemoUserSeed {
  fullName: string;
  email: string;
  avatar: string;
  bio: string;
  department: Department;
  semester: number;
  university: string;
  skillsHave: string[];
  skillsNeed: string[];
  availability: string;
  github: string;
  linkedin: string;
  isDemoUser: true;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const DEMO_USER_COUNT = 100;
const USERS_COLLECTION = "users";

const envPath = resolve(process.cwd(), ".env.local");
loadEnvFile(envPath);

const projectId = requireEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID");

const departments: Department[] = ["CSE", "SWE", "EEE", "BBA", "English"];

const universities = [
  "Daffodil International University",
  "BRAC University",
  "North South University",
  "East West University",
  "American International University-Bangladesh",
  "United International University",
  "Independent University, Bangladesh",
  "Ahsanullah University of Science and Technology",
  "University of Dhaka",
  "Jahangirnagar University",
  "Khulna University of Engineering & Technology",
  "Rajshahi University of Engineering & Technology",
];

const availabilityOptions = [
  "Weekdays after 7 PM",
  "Weekends only",
  "Friday and Saturday evenings",
  "3 days per week after classes",
  "Flexible remote collaboration",
  "Sunday to Thursday evenings",
  "Available for short sprint projects",
  "Morning study sessions and weekend projects",
];

const skills = [
  "React",
  "Next.js",
  "Vue",
  "HTML",
  "CSS",
  "Tailwind",
  "Node.js",
  "Express",
  "NestJS",
  "Laravel",
  "MongoDB",
  "PostgreSQL",
  "Firebase",
  "MySQL",
  "C",
  "C++",
  "Java",
  "Python",
  "JavaScript",
  "TypeScript",
  "Machine Learning",
  "TensorFlow",
  "PyTorch",
  "OpenCV",
  "Figma",
  "UI/UX",
  "Photoshop",
  "Flutter",
  "React Native",
  "Docker",
  "AWS",
  "Git",
  "GitHub",
];

const names = [
  "Sakib Hasan",
  "Arafat Hossain",
  "Nusrat Jahan",
  "Tanjim Ahmed",
  "Fahim Rahman",
  "Mehedi Hasan",
  "Tanjila Akter",
  "Nayeem Islam",
  "Sadia Rahman",
  "Mahmudul Hasan",
  "Rafiul Islam",
  "Maliha Tabassum",
  "Tanvir Hasan",
  "Jannatul Ferdous",
  "Rakibul Islam",
  "Sumaiya Akter",
  "Nahid Hasan",
  "Farzana Yasmin",
  "Shahriar Kabir",
  "Mushfiqur Rahman",
  "Tasnim Jahan",
  "Sabbir Ahmed",
  "Nabila Rahman",
  "Arifur Rahman",
  "Fariha Islam",
  "Imran Hossain",
  "Lamisa Chowdhury",
  "Hasibul Hasan",
  "Mst Ritu Akter",
  "Rashedul Islam",
  "Samia Sultana",
  "Minhaz Uddin",
  "Ishrat Jahan",
  "Jahid Hasan",
  "Rumana Akter",
  "Ashikur Rahman",
  "Sanjida Islam",
  "Rifat Ahmed",
  "Nafisa Tasnim",
  "Shuvo Das",
  "Afia Tabassum",
  "Towhidul Islam",
  "Sharmin Akter",
  "Abrar Fahim",
  "Mahiya Chowdhury",
  "Raihan Uddin",
  "Tahsina Ahmed",
  "Siam Hossain",
  "Labiba Islam",
  "Anik Saha",
  "Shakil Ahmed",
  "Nusrat Tasnim",
  "Omar Faruk",
  "Zarin Tasnim",
  "Moinul Islam",
  "Raisa Rahman",
  "Abdullah Al Noman",
  "Mim Akter",
  "Saif Hassan",
  "Tithi Sarker",
  "Khalid Mahmud",
  "Israt Jahan",
  "Rubel Mia",
  "Mariya Islam",
  "Zahidul Islam",
  "Sadia Sultana",
  "Sourav Roy",
  "Tania Akter",
  "Foysal Ahmed",
  "Roksana Akter",
  "Jubayer Hossain",
  "Nishat Rahman",
  "Maruf Hasan",
  "Priyanka Saha",
  "Al Amin",
  "Humaira Tasnim",
  "Adnan Chowdhury",
  "Mahin Ahmed",
  "Nazia Jahan",
  "Rony Hossain",
  "Sabrina Akter",
  "Sifat Rahman",
  "Khadija Akter",
  "Raiyan Islam",
  "Farhan Ahmed",
  "Bushra Rahman",
  "Fardin Islam",
  "Jui Akter",
  "Samiul Hasan",
  "Tuba Islam",
  "Muntasir Rahman",
  "Ayesha Siddika",
  "Rakib Hasan",
  "Faiza Chowdhury",
  "Sohanur Rahman",
  "Rafia Sultana",
  "Tahmid Hasan",
  "Noshin Jahan",
  "Naimur Rahman",
  "Anika Islam",
];

function loadEnvFile(path: string) {
  if (!existsSync(path)) {
    return;
  }

  const envFile = readFileSync(path, "utf8");

  for (const line of envFile.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");

    process.env[key] ??= value;
  }
}

function requireEnv(key: string) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

function getServiceAccountCredential() {
  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (serviceAccountBase64) {
    const decoded = Buffer.from(serviceAccountBase64, "base64").toString("utf8");
    return cert(JSON.parse(decoded) as ServiceAccount);
  }

  if (serviceAccountJson) {
    return cert(JSON.parse(serviceAccountJson) as ServiceAccount);
  }

  return applicationDefault();
}

function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    return;
  }

  initializeApp({
    credential: getServiceAccountCredential(),
    projectId,
  });
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function pickCount(index: number, min: number, max: number) {
  return min + (index % (max - min + 1));
}

function pickSkills(index: number, count: number, offset: number) {
  const picked: string[] = [];
  let cursor = (index * 7 + offset) % skills.length;

  while (picked.length < count) {
    const skill = skills[cursor % skills.length];
    if (!picked.includes(skill)) {
      picked.push(skill);
    }
    cursor += 5;
  }

  return picked;
}

function createSearchKeywords(user: {
  fullName: string;
  email: string;
  department: Department;
  semester: number;
  university: string;
  skillsHave: string[];
  skillsNeed: string[];
}) {
  const tokens = [
    user.fullName,
    ...user.fullName.split(/\s+/),
    user.email,
    user.department,
    `semester ${user.semester}`,
    user.university,
    ...user.skillsHave,
    ...user.skillsNeed,
  ];

  return Array.from(new Set(tokens.map((token) => token.trim().toLowerCase()).filter(Boolean)));
}

function createBio(fullName: string, skillsHave: string[], skillsNeed: string[], department: string) {
  const primarySkill = skillsHave[0];
  const secondarySkill = skillsHave[1] ?? skillsHave[0];
  const targetSkill = skillsNeed[0];

  const templates = [
    `I enjoy building practical projects with ${primarySkill} and ${secondarySkill}, and I am looking for teammates interested in ${targetSkill}.`,
    `I am a ${department} student focused on hands-on learning, clean teamwork, and improving my skills in ${targetSkill}.`,
    `I like turning class ideas into real products and want to collaborate with students who can help me grow in ${targetSkill}.`,
    `I enjoy solving problems, sharing what I know about ${primarySkill}, and joining projects where I can learn ${targetSkill}.`,
    `I am interested in portfolio-ready projects and would love to work with teammates who care about ${targetSkill} and good execution.`,
  ];

  return templates[fullName.length % templates.length];
}

function buildDemoUsers() {
  const now = Timestamp.now();

  return names.slice(0, DEMO_USER_COUNT).map((fullName, index): DemoUserSeed & Record<string, unknown> => {
    const number = index + 1;
    const department = departments[index % departments.length];
    const semester = (index % 12) + 1;
    const skillsHave = pickSkills(index, pickCount(index, 3, 6), 0);
    const skillsNeed = pickSkills(index, pickCount(index, 2, 4), 11).filter(
      (skill) => !skillsHave.includes(skill)
    );
    const normalizedSkillsNeed =
      skillsNeed.length >= 2 ? skillsNeed : pickSkills(index + 13, 3, 19).filter((skill) => !skillsHave.includes(skill));
    const emailSlug = slugify(fullName);
    const email = `${emailSlug}${String(number).padStart(3, "0")}@skillswap.demo`;

    const user = {
      uid: `demo-user-${String(number).padStart(3, "0")}`,
      fullName,
      email,
      avatar: `https://i.pravatar.cc/150?img=${(index % 70) + 1}`,
      avatarUrl: `https://i.pravatar.cc/150?img=${(index % 70) + 1}`,
      bio: createBio(fullName, skillsHave, normalizedSkillsNeed, department),
      department,
      semester,
      university: universities[index % universities.length],
      skillsHave,
      skillsNeed: normalizedSkillsNeed.slice(0, pickCount(index, 2, 4)),
      skillsOffered: skillsHave,
      skillsWanted: normalizedSkillsNeed.slice(0, pickCount(index, 2, 4)),
      availability: availabilityOptions[index % availabilityOptions.length],
      github: `https://github.com/${emailSlug}`,
      linkedin: `https://www.linkedin.com/in/${emailSlug}`,
      isDemoUser: true as const,
      rating: 5.0,
      completedSwaps: index % 9,
      isOnline: index % 3 === 0,
      createdAt: now,
      updatedAt: now,
    };

    return {
      ...user,
      searchKeywords: createSearchKeywords(user),
    };
  });
}

async function commitInChunks(batchItems: Array<{ id: string; data: Record<string, unknown> }>) {
  const db = getFirestore();
  const chunkSize = 450;

  for (let index = 0; index < batchItems.length; index += chunkSize) {
    const batch: WriteBatch = db.batch();
    const chunk = batchItems.slice(index, index + chunkSize);

    for (const item of chunk) {
      batch.set(db.collection(USERS_COLLECTION).doc(item.id), item.data);
    }

    await batch.commit();
  }
}

async function seedDemoUsers() {
  initializeFirebaseAdmin();

  const db = getFirestore();
  const demoUsers = buildDemoUsers();
  const usersToInsert: Array<{ id: string; data: Record<string, unknown> }> = [];
  let skipped = 0;

  console.log(`Starting SkillSwap demo user seed for project "${projectId}"...`);
  console.log(`Checking ${demoUsers.length} deterministic demo user documents...`);

  for (const user of demoUsers) {
    const id = String(user.uid);
    const docRef = db.collection(USERS_COLLECTION).doc(id);
    const existingDoc = await docRef.get();

    if (existingDoc.exists || existingDoc.data()?.isDemoUser === true) {
      skipped += 1;
      continue;
    }

    usersToInsert.push({ id, data: user });
  }

  if (usersToInsert.length > 0) {
    await commitInChunks(usersToInsert);
  }

  console.log(`✓ Inserted ${usersToInsert.length} demo users`);
  console.log(`✓ Skipped ${skipped} existing users`);
  console.log("Done.");
}

seedDemoUsers().catch((error) => {
  console.error("Failed to seed demo users.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
