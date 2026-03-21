// Types
export type Gender = "Male" | "Female" | "Other";
export type Skill = "Novice" | "Intermediate" | "Advance";

export type Player = {
  id: string;
  name: string;
  gender: Gender;
  skill: Skill;
  matches: number; // matches played
  status: "pool" | "ready" | "playing"; // determines where they appear
};

export type Court = {
  id: string;
  name: string;
  playingIds: string[]; // 4 ids when a game is active
  startedAt?: number | null;
};

export type PlayerSnapshot = {
  name: string;
  gender: Gender;
  skill: Skill;
  matches?: number;
};

export type PlayerGroup = {
  id: string;
  name: string;
  players: PlayerSnapshot[];
  createdAt: number;
  updatedAt: number;
};
