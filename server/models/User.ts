import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

// ─── Enums ────────────────────────────────────────────────────────────────────
export type AvailabilityStatus = "available" | "busy" | "away";
export type UserRole = "student" | "faculty" | "judge" | "admin";
export type Gender = "male" | "female" | "other" | "prefer_not_to_say";

export const BRANCHES = [
  // Computer Science variants
  "CSE",
  "CS",
  "CSIT",
  "CSE-AI",
  "CSE(AI)",
  "CSE-DS",
  "CSE(AIML)",
  // Other engineering
  "IT",
  "ECE",
  "EEE",
  "ME",
  "CE",
  // Post-graduate / management
  "MBA",
  "MCA",
  "Other",
] as const;
export type Branch = (typeof BRANCHES)[number];

/**
 * Derive current academic year (1–4) from a passout (graduation) calendar year.
 * Academic session in India starts in July.
 *
 * Examples (current date: Feb 2026)
 *   passout 2027 → 3rd year   (2025-26 session)
 *   passout 2028 → 2nd year
 *   passout 2029 → 1st year
 *
 * Returns 0 if not yet enrolled, 5+ encodes 'Graduated'.
 */
export function computeAcademicYear(passoutYear: number): number {
  const now = new Date();
  const cal = now.getFullYear();
  const mon = now.getMonth() + 1; // 1–12
  const sessionStart = mon >= 7 ? cal : cal - 1; // July = new academic year
  return 5 - (passoutYear - sessionStart); // e.g. 5 - (2027-2025) = 3
}

// ─── Interface ────────────────────────────────────────────────────────────────
export interface IUser extends Document {
  // Identification
  name: string;
  email: string;
  password: string;
  avatar: string;
  role: UserRole;

  // Profile
  gender: Gender;
  branch: Branch | string;
  /** Graduation / passout calendar year e.g. 2027. Store this; derive academicYear from it. */
  passout_year: number;
  department: string; // kept for faculty / non-student users
  bio: string;

  // Derived (virtual — NOT stored in DB)
  /** Current academic year (1–4) computed from passout_year and today's date. */
  readonly academicYear: number;

  // Skills & interests
  skills: string[];
  interests: string[];
  // Social links
  github_url: string;
  linkedin_url: string;
  website_url: string;
  // Status
  availability_status: AvailabilityStatus;
  lastActive: Date;

  // Gamification
  points: number;
  badges: string[];

  comparePassword(candidate: string): Promise<boolean>;
}

// ─── Schema ───────────────────────────────────────────────────────────────────
const UserSchema = new Schema<IUser>(
  {
    // Identification
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v: string) => v.endsWith("@kiet.edu"),
        message: "Email must end with @kiet.edu",
      },
    },
    password: { type: String, required: true, minlength: 6, select: false },
    avatar: { type: String, default: "" },
    role: {
      type: String,
      enum: ["student", "faculty", "judge", "admin"] as UserRole[],
      default: "student",
      index: true,
    },

    // Profile
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"] as Gender[],
      default: "prefer_not_to_say",
    },
    branch: { type: String, trim: true, default: "" },
    /**
     * The calendar year the student expects to graduate.
     * e.g. 2027 for a student currently in 3rd year (as of 2025-26 session).
     * Academic year (1-4) is derived dynamically via the `academicYear` virtual.
     */
    passout_year: {
      type: Number,
      default: new Date().getFullYear() + 1,
      min: [
        new Date().getFullYear() - 10,
        "Passout year seems too far in the past",
      ],
      max: [
        new Date().getFullYear() + 10,
        "Passout year seems too far in the future",
      ],
    },
    department: { type: String, trim: true, default: "" },
    bio: { type: String, default: "", maxlength: 1000 },

    // Skills & interests
    skills: { type: [String], default: [] },
    interests: { type: [String], default: [] },

    // Social links
    github_url: { type: String, default: "" },
    linkedin_url: { type: String, default: "" },
    website_url: { type: String, default: "" },

    // Status
    availability_status: {
      type: String,
      enum: ["available", "busy", "away"] as AvailabilityStatus[],
      default: "available",
      index: true,
    },
    lastActive: { type: Date, default: Date.now },

    // Gamification
    points: { type: Number, default: 0, min: 0 },
    badges: { type: [String], default: [] },
  },
  {
    timestamps: true,
    // include virtuals (e.g. academicYear) when converting to JSON / Object
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── Hooks ────────────────────────────────────────────────────────────────────
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

// ─── Virtuals ─────────────────────────────────────────────────────────────────
/**
 * Dynamically computes the current academic year (1–4) from `passout_year`.
 * Returns 0 = not yet enrolled, ≥5 = graduated.
 * Because it is a virtual it is recalculated on every access — no migration needed
 * when the calendar year rolls over.
 */
UserSchema.virtual("academicYear").get(function (this: IUser): number {
  return computeAcademicYear(this.passout_year);
});

// ─── Methods ──────────────────────────────────────────────────────────────────
UserSchema.methods.comparePassword = function (
  candidate: string,
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

// ─── Indexes ──────────────────────────────────────────────────────────────────
UserSchema.index({ skills: 1, availability_status: 1 });
UserSchema.index({ branch: 1, passout_year: 1 });

export default mongoose.model<IUser>("User", UserSchema);
