import { Router } from "express";
import {
    getChannelStats,
    getChannelVideos
} from "../controllers/dashboard.controller.js";
import { verifyjwt } from "../middlewares/auth.middelware.js";

const router = Router();

// Apply verifyjwt middleware to all routes in this file
router.use(verifyjwt);

router.route("/stats").get(getChannelStats);
router.route("/videos").get(getChannelVideos);

export default router;
