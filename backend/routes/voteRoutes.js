import { Router } from "express";
import { castVote, streamResults } from "../controllers/voteController.js";
const router = Router();

router.post("/polls/:id/vote", castVote);
router.get("/polls/:id/stream", streamResults); // SSE

export default router;
