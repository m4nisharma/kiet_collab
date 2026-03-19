import { Router } from "express";
import {
  createTeam,
  joinTeam,
  removeMember,
  getTeam,
  getMyTeams,
  getTeamMessages,
  deleteTeam,
  leaveTeam,
} from "../controllers/teamController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// All team routes require authentication
router.use(protect);

// ─── Write ────────────────────────────────────────────────────────────────────
router.post("/create", createTeam);
router.post("/join/:teamId", joinTeam);
router.delete("/remove/:teamId/:userId", removeMember);
router.delete("/leave/:teamId", leaveTeam);
router.delete("/:teamId", deleteTeam);

// ─── Read  ────────────────────────────────────────────────────────────────────
// /user/my-teams MUST be before /:teamId — prevents Express treating
// the literal string "my-teams" as a MongoDB ObjectId.
router.get("/user/my-teams", getMyTeams);
router.get("/:teamId/messages", getTeamMessages);
router.get("/:teamId", getTeam);

export default router;
