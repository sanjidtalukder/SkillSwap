export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface UserSkillSwap {
  offeredSkills: string[];
  desiredSkills: string[];
}
