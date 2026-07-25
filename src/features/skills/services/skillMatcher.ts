import { UserDocument } from "@/types/firestore";

export interface SkillMatchResult {
  candidate: UserDocument;
  matchScore: number; // 0 to 100%
  complementaryScore: number; // 0.0 to 1.0
  sharedScore: number; // 0.0 to 1.0
  matchedOfferedSkills: string[]; // Skills B has that A needs
  matchedWantedSkills: string[]; // Skills A has that B needs
  sharedOfferedSkills: string[]; // Skills both A and B have
  isMutualSwap: boolean; // True if A->B and B->A both have matches
}

/**
 * Deterministic Skill Matching Engine v2
 * Computes exact mathematical match percentage based on Complementary Skills, Shared Skills,
 * and 2-way Mutual Swap Potential.
 */
export function calculateSkillMatch(userA: UserDocument, userB: UserDocument): SkillMatchResult {
  // Normalize skill sets to lowercase sets for exact set operations
  const O_A = new Set((userA.skillsOffered || []).map((s) => s.toLowerCase().trim()));
  const W_A = new Set((userA.skillsWanted || []).map((s) => s.toLowerCase().trim()));

  const O_B = new Set((userB.skillsOffered || []).map((s) => s.toLowerCase().trim()));
  const W_B = new Set((userB.skillsWanted || []).map((s) => s.toLowerCase().trim()));

  // 1. Calculate Complementary Matches
  // Matched Offered Skills: Skills B offers that A wants (B -> A)
  const matchedOfferedSkills = (userB.skillsOffered || []).filter((skill) =>
    W_A.has(skill.toLowerCase().trim())
  );

  // Matched Wanted Skills: Skills A offers that B wants (A -> B)
  const matchedWantedSkills = (userA.skillsOffered || []).filter((skill) =>
    W_B.has(skill.toLowerCase().trim())
  );

  // Shared Offered Skills: Skills both A and B can teach
  const sharedOfferedSkills = (userB.skillsOffered || []).filter((skill) =>
    O_A.has(skill.toLowerCase().trim())
  );

  // 2. Ratios Calculation
  const R_A_from_B = W_A.size > 0 ? matchedOfferedSkills.length / W_A.size : 0;
  const R_B_from_A = W_B.size > 0 ? matchedWantedSkills.length / W_B.size : 0;

  // Complementary Score C (Weighted: 60% A's needs, 40% B's needs)
  const complementaryScore = 0.6 * R_A_from_B + 0.4 * R_B_from_A;

  // 3. Shared Skills Score S (Jaccard Similarity on Offered Skills)
  const unionOffered = new Set([...O_A, ...O_B]);
  const sharedScore = unionOffered.size > 0 ? sharedOfferedSkills.length / unionOffered.size : 0;

  // 4. Mutual Swap Bonus (15% bonus if 2-way swap possible)
  const isMutualSwap = matchedOfferedSkills.length > 0 && matchedWantedSkills.length > 0;
  const mutualBonus = isMutualSwap ? 0.15 : 0.0;

  // 5. Composite Match Score
  const rawScore = 0.7 * complementaryScore + 0.15 * sharedScore + mutualBonus;
  const matchScore = Math.min(100, Math.round(rawScore * 100));

  return {
    candidate: userB,
    matchScore,
    complementaryScore,
    sharedScore,
    matchedOfferedSkills,
    matchedWantedSkills,
    sharedOfferedSkills,
    isMutualSwap,
  };
}

/**
 * Deterministic Multi-Tier Ranking & Tie-Breaking Engine
 * Sorts candidates using a strict 5-tier comparison vector to guarantee 100% reproducible order.
 */
export function rankSkillMatches(
  userA: UserDocument,
  candidates: UserDocument[]
): SkillMatchResult[] {
  const matchResults = candidates
    .filter((candidate) => candidate.uid !== userA.uid) // Exclude self
    .map((candidate) => calculateSkillMatch(userA, candidate));

  return matchResults.sort((a, b) => {
    // Tier 1: Final Match Score (DESC)
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }

    // Tier 2: Direct Matched Offered Skills Count (DESC)
    if (b.matchedOfferedSkills.length !== a.matchedOfferedSkills.length) {
      return b.matchedOfferedSkills.length - a.matchedOfferedSkills.length;
    }

    // Tier 3: Candidate Rating (DESC)
    const ratingA = a.candidate.rating ?? 5.0;
    const ratingB = b.candidate.rating ?? 5.0;
    if (ratingB !== ratingA) {
      return ratingB - ratingA;
    }

    // Tier 4: Completed Swaps Count (DESC)
    const swapsA = a.candidate.completedSwaps ?? 0;
    const swapsB = b.candidate.completedSwaps ?? 0;
    if (swapsB !== swapsA) {
      return swapsB - swapsA;
    }

    // Tier 5: Deterministic Lexicographical UID Sort (ASC)
    return a.candidate.uid.localeCompare(b.candidate.uid);
  });
}
