import { Crown, Shield, Sprout } from "lucide-react";
import type { Skill } from "../types";

export function SkillIcon({ skill, className = "" }: { skill: Skill; className?: string }) {
  return skill === "Novice" ? (
    <Sprout size={18} className={`text-emerald-600 ${className}`} />
  ) : skill === "Intermediate" ? (
    <Shield size={18} className={`text-indigo-600 ${className}`} />
  ) : (
    <Crown size={18} className={`text-amber-600 ${className}`} />
  );
}
