import { Request, Response } from "express";
import Team from "../models/Team.js";
import User from "../models/User.js";
import Message from "../models/Message.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/* ─── Helper ───────────────────────────────────────────────────────────────── */

const countFemales = (members: any[]): number =>
  members.filter((m) => m.gender === "female").length;

/* ─── POST /api/teams/create ───────────────────────────────────────────────── */

export const createTeam = asyncHandler(async (req: Request, res: Response) => {
  const {
    team_name,
    hackathon_name,
    required_skills,
    required_female_members,
    max_team_size,
  } = req.body ?? {};

  if (!team_name?.trim()) return sendError(res, "team_name is required");
  if (!hackathon_name?.trim())
    return sendError(res, "hackathon_name is required");
  if (!max_team_size) return sendError(res, "max_team_size is required");

  const parsedMax = Number(max_team_size);
  const parsedFemale = Number(required_female_members ?? 0);

  if (isNaN(parsedMax) || parsedMax < 2 || parsedMax > 10)
    return sendError(res, "max_team_size must be between 2 and 10");

  if (isNaN(parsedFemale) || parsedFemale < 0)
    return sendError(
      res,
      "required_female_members must be a non-negative number",
    );

  if (parsedFemale >= parsedMax)
    return sendError(
      res,
      "required_female_members must be less than max_team_size",
    );

  const existing = await Team.findOne({
    team_name: team_name.trim(),
    hackathon_name: hackathon_name.trim(),
  });
  if (existing)
    return sendError(
      res,
      `A team named "${team_name}" already exists for "${hackathon_name}"`,
      409,
    );

  const skills: string[] = Array.isArray(required_skills)
    ? required_skills
    : (required_skills ?? "")
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);

  const team = await Team.create({
    team_name: team_name.trim(),
    hackathon_name: hackathon_name.trim(),
    created_by: req.user!._id,
    members: [req.user!._id], // creator auto-joined
    required_skills: skills,
    required_female_members: parsedFemale,
    max_team_size: parsedMax,
  });

  const populated = await team.populate("members", "name avatar gender");
  sendSuccess(res, { data: populated }, 201);
});

/* ─── POST /api/teams/join/:teamId ─────────────────────────────────────────── */

export const joinTeam = asyncHandler(async (req: Request, res: Response) => {
  const team = await Team.findById(req.params.teamId).populate(
    "members",
    "name avatar gender",
  );
  if (!team) return sendError(res, "Team not found", 404);

  const userId = String(req.user!._id);

  // Duplicate member check
  const alreadyMember = team.members.some((m) => String(m._id) === userId);
  if (alreadyMember)
    return sendError(res, "You are already a member of this team", 400);

  // Max size check
  if (team.members.length >= team.max_team_size)
    return sendError(
      res,
      `Team is full (max ${team.max_team_size} members)`,
      400,
    );

  // Female quota check
  if (team.required_female_members > 0) {
    const user = await User.findById(userId).select("gender").lean();
    if (!user) return sendError(res, "User not found", 404);

    const currentFemaleCount = countFemales(team.members as any[]);
    const remainingSlots = team.max_team_size - team.members.length;
    const femaleStillNeeded = team.required_female_members - currentFemaleCount;

    if (
      femaleStillNeeded > 0 &&
      remainingSlots <= femaleStillNeeded &&
      user.gender !== "female"
    )
      return sendError(
        res,
        `Team requires ${femaleStillNeeded} more female member(s). Only female members can join now.`,
        400,
      );
  }

  team.members.push(req.user!._id as any);
  await team.save();

  await team.populate("members", "name avatar gender");
  sendSuccess(res, { data: team });
});

/* ─── DELETE /api/teams/remove/:teamId/:userId ──────────────────────────────── */

export const removeMember = asyncHandler(
  async (req: Request, res: Response) => {
    const team = await Team.findById(req.params.teamId);
    if (!team) return sendError(res, "Team not found", 404);

    // Only creator can remove
    if (String(team.created_by) !== String(req.user!._id))
      return sendError(res, "Only the team creator can remove members", 403);

    // Creator cannot be removed
    if (String(req.params.userId) === String(team.created_by))
      return sendError(
        res,
        "Team creator cannot be removed from the team",
        400,
      );

    // Target must be a member
    const isMember = team.members.some(
      (m) => String(m) === String(req.params.userId),
    );
    if (!isMember)
      return sendError(res, "User is not a member of this team", 404);

    // Guard: removal must not break female quota
    if (team.required_female_members > 0) {
      const leavingUser = await User.findById(req.params.userId)
        .select("gender")
        .lean();
      if (leavingUser?.gender === "female") {
        const populated = await team.populate("members", "gender");
        const femaleCount = countFemales(populated.members as any[]);
        if (femaleCount - 1 < team.required_female_members)
          return sendError(
            res,
            "Cannot remove member: team would fall below required female member count",
            400,
          );
      }
    }

    team.members = team.members.filter(
      (m) => String(m) !== String(req.params.userId),
    ) as any;
    await team.save();

    await team.populate("members", "name avatar gender");
    sendSuccess(res, { message: "Member removed successfully", data: team });
  },
);

/* ─── GET /api/teams/:teamId ────────────────────────────────────────────────── */

export const getTeam = asyncHandler(async (req: Request, res: Response) => {
  const team = await Team.findById(req.params.teamId)
    .populate("members", "name avatar gender department")
    .populate("created_by", "name avatar")
    .lean();

  if (!team) return sendError(res, "Team not found", 404);
  sendSuccess(res, { data: team });
});

/* ─── GET /api/teams/user/my-teams ─────────────────────────────────────────── */

export const getMyTeams = asyncHandler(async (req: Request, res: Response) => {
  const teams = await Team.find({ members: req.user!._id })
    .populate("members", "name avatar gender")
    .populate("created_by", "name avatar")
    .sort({ createdAt: -1 })
    .lean();

  sendSuccess(res, { data: teams, count: teams.length });
});

/* ─── GET /api/teams/:teamId/messages ───────────────────────────────────────── */

export const getTeamMessages = asyncHandler(
  async (req: Request, res: Response) => {
    const team = await Team.findById(req.params.teamId).lean();
    if (!team) return sendError(res, "Team not found", 404);

    // Only team members can read messages
    const isMember = team.members.some(
      (m) => String(m) === String(req.user!._id),
    );
    if (!isMember)
      return sendError(res, "Access denied: not a team member", 403);

    const limit = Math.min(200, parseInt(String(req.query.limit || "100"), 10));
    const before = req.query.before
      ? new Date(String(req.query.before))
      : undefined;

    const query: Record<string, unknown> = { team_id: req.params.teamId };
    if (before) query.timestamp = { $lt: before };

    const messages = await Message.find(query)
      .populate("sender_id", "name avatar")
      .sort({ timestamp: 1 })
      .limit(limit)
      .lean();

    sendSuccess(res, { data: messages });
  },
);

/* ─── DELETE /api/teams/:teamId — disband team (leader only) ────────────────── */

export const deleteTeam = asyncHandler(async (req: Request, res: Response) => {
  const team = await Team.findById(req.params.teamId);
  if (!team) return sendError(res, "Team not found", 404);

  if (String(team.created_by) !== String(req.user!._id))
    return sendError(res, "Only the team creator can delete the team", 403);

  await Message.deleteMany({ team_id: req.params.teamId });
  await team.deleteOne();
  sendSuccess(res, { message: "Team deleted successfully" });
});

/* ─── DELETE /api/teams/leave/:teamId — member leaves voluntarily ───────────── */

export const leaveTeam = asyncHandler(async (req: Request, res: Response) => {
  const team = await Team.findById(req.params.teamId);
  if (!team) return sendError(res, "Team not found", 404);

  const isMember = team.members.some(
    (m) => String(m) === String(req.user!._id),
  );
  if (!isMember)
    return sendError(res, "You are not a member of this team", 400);

  if (String(team.created_by) === String(req.user!._id))
    return sendError(
      res,
      "Team creator cannot leave — delete the team instead",
      400,
    );

  team.members = team.members.filter(
    (m) => String(m) !== String(req.user!._id),
  ) as any;
  await team.save();
  sendSuccess(res, { message: "You have left the team" });
});
