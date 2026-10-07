import { Router } from "express";
import { installSystem } from "../controller/index.js";
const router = Router();

router.post("/", installSystem);

export default router;
