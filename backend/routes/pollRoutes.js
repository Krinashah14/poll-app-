import { Router } from "express";
import { createPoll, getPoll, getResults } from "../controllers/pollController.js";
const router = Router();

router.post("/polls", createPoll);
router.get("/polls/:id", getPoll);
router.get("/polls/:id/results", getResults);

export default router;
