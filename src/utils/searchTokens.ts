/**
 * Generates normalized search keywords for efficient Firestore array-contains queries.
 * Handles lowercasing, prefix generation, and deduplication across Name, Skill, Department, and Semester.
 */
export function generateSearchKeywords(
  fullName: string,
  skillsOffered: string[] = [],
  skillsWanted: string[] = [],
  department?: string,
  semester?: string
): string[] {
  const keywords = new Set<string>();

  // 1. Process Name Tokens (Word prefixes)
  if (fullName) {
    const nameClean = fullName.toLowerCase().trim();
    const words = nameClean.split(/\s+/);

    // Full name and individual words
    keywords.add(nameClean);
    words.forEach((word) => {
      keywords.add(word);
      // Generate prefixes for live search typing (min 2 chars)
      for (let i = 2; i <= word.length; i++) {
        keywords.add(word.substring(0, i));
      }
    });
  }

  // 2. Process Skills Offered & Wanted Tokens
  skillsOffered.forEach((skill) => {
    if (skill) keywords.add(skill.toLowerCase().trim());
  });
  skillsWanted.forEach((skill) => {
    if (skill) keywords.add(skill.toLowerCase().trim());
  });

  // 3. Process Department & Semester Tokens
  if (department) keywords.add(department.toLowerCase().trim());
  if (semester) keywords.add(semester.toLowerCase().trim());

  return Array.from(keywords).filter((token) => token.length > 0);
}
