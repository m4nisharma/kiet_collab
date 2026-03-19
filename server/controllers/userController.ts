import { Request, Response } from "express";
import User from "../models/User.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  extractPublicId,
  deleteFromCloudinary,
} from "../utils/cloudinaryHelper.js";

// ─── GET /api/users/me ──────────────────────────────────────────────────────
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  // req.user is attached by protect middleware (no password)
  const user = await User.findById(req.user!._id).select("-password -__v");
  if (!user) return sendError(res, "User not found", 404);
  sendSuccess(res, { data: user });
});

// ─── PUT /api/users/me ──────────────────────────────────────────────────────
/**
 * Full profile update.
 *
 * Plain fields:  name, bio, department, branch, passout_year,
 *               gender, availability_status
 *
 * Skill / interest management:
 *   addSkills    {string[]}  — append items that are not already present
 *   removeSkills {string[]}  — remove exact matches
 *   skills       {string[]}  — replace the entire array (if provided)
 *   addInterests / removeInterests / interests — same pattern
 *
 * Avatar:  multipart field "avatar" (handled by multer before this handler)
 */
export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body ?? {};

  // ── Basic scalar fields ─────────────────────────────────────────────────
  const SCALAR = [
    "name",
    "bio",
    "department",
    "branch",
    "passout_year",
    "gender",
    "availability_status",
    "github_url",
    "linkedin_url",
    "website_url",
  ] as const;
  const updates: Record<string, unknown> = {};
  for (const key of SCALAR) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  // ── Avatar upload via Cloudinary ──────────────────────────────────────
  if ((req as any).file?.path) {
    if (req.user?.avatar) {
      await deleteFromCloudinary(extractPublicId(req.user.avatar));
    }
    updates.avatar = (req as any).file.path;
  }

  // ── Skills management ───────────────────────────────────────────────
  if (body.skills !== undefined) {
    // Full replacement
    updates.skills = normaliseArray(body.skills);
  } else {
    const toAdd = normaliseArray(body.addSkills);
    const toRemove = normaliseArray(body.removeSkills).map((s: string) =>
      s.toLowerCase(),
    );
    if (toAdd.length || toRemove.length) {
      const current: string[] = (req.user as any).skills ?? [];
      let merged = [...current];
      if (toAdd.length) merged = [...new Set([...merged, ...toAdd])];
      if (toRemove.length)
        merged = merged.filter((s) => !toRemove.includes(s.toLowerCase()));
      updates.skills = merged;
    }
  }

  // ── Interests management ─────────────────────────────────────────────
  if (body.interests !== undefined) {
    updates.interests = normaliseArray(body.interests);
  } else {
    const toAdd = normaliseArray(body.addInterests);
    const toRemove = normaliseArray(body.removeInterests).map((s: string) =>
      s.toLowerCase(),
    );
    if (toAdd.length || toRemove.length) {
      const current: string[] = (req.user as any).interests ?? [];
      let merged = [...current];
      if (toAdd.length) merged = [...new Set([...merged, ...toAdd])];
      if (toRemove.length)
        merged = merged.filter((s) => !toRemove.includes(s.toLowerCase()));
      updates.interests = merged;
    }
  }

  const user = await User.findByIdAndUpdate(req.user!._id, updates, {
    new: true,
    runValidators: true,
  }).select("-password -__v");

  sendSuccess(res, { data: user });
});

// ─── GET /api/users/search ────────────────────────────────────────────────────
/**
 * Search / filter users with full pagination.
 *
 * Query params (all optional):
 *   skills            comma-separated  — users who have ANY of these skills
 *   gender            male | female | other | prefer_not_to_say
 *   branch            e.g. CSE, IT …
 *   passout_year      e.g. 2027
 *   availability_status   available | busy | away
 *   q                 free-text search on name (case-insensitive)
 *   page              default 1
 *   limit             default 20, max 50
 *   sortBy            matchScore | points | lastActive  (default matchScore)
 */
export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = {};

  // ── Skills filter ───────────────────────────────────────────────────────────
  const skillsParam = String(req.query.skills ?? "").trim();
  const requestedSkills = skillsParam
    ? skillsParam
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    : [];
  if (requestedSkills.length) {
    // Case-insensitive skill match using regex array
    query.skills = {
      $in: requestedSkills.map((s) => new RegExp(`^${escapeRegex(s)}$`, "i")),
    };
  }

  // ── Scalar filters ──────────────────────────────────────────────────────────
  if (req.query.gender) query.gender = req.query.gender;
  if (req.query.branch) query.branch = req.query.branch;
  if (req.query.passout_year)
    query.passout_year = Number(req.query.passout_year);
  if (req.query.availability_status)
    query.availability_status = req.query.availability_status;

  // ── Free-text name search ──────────────────────────────────────────────────
  if (req.query.q) {
    query.name = { $regex: escapeRegex(String(req.query.q)), $options: "i" };
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .select("-password -__v")
      .sort({ points: -1, lastActive: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ]);

  // Attach match score when skill filtering is active
  const results = users.map((u) => {
    if (!requestedSkills.length) return u;
    const userSkills = u.skills.map((s: string) => s.toLowerCase());
    const matching = requestedSkills.filter((s) => userSkills.includes(s));
    return { ...u, matchScore: matching.length / requestedSkills.length };
  });

  if (requestedSkills.length) {
    (results as any[]).sort((a, b) => b.matchScore - a.matchScore);
  }

  sendSuccess(res, {
    data: results,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// ─── GET /api/users/:id ─────────────────────────────────────────────────────
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select("-password -__v");
  if (!user) return sendError(res, "User not found", 404);
  sendSuccess(res, { data: user });
});

// ─── GET /api/users  (admin — paginated list) ────────────────────────────────
export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find().select("-password -__v").skip(skip).limit(limit).lean(),
    User.countDocuments(),
  ]);

  sendSuccess(res, {
    data: users,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// ─── DELETE /api/users/:id  (admin only) ─────────────────────────────────────
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return sendError(res, "User not found", 404);
  sendSuccess(res, { message: "User deleted" });
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Coerce a value to a trimmed, non-empty string array */
function normaliseArray(val: unknown): string[] {
  if (!val) return [];
  const arr = Array.isArray(val) ? val : String(val).split(",");
  return arr.map((s: unknown) => String(s).trim()).filter(Boolean);
}

/** Escape special regex characters for safe $regex queries */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
