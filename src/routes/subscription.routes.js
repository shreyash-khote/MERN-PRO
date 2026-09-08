import { Router } from "express";
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} from "../controllers/subscription.controller.js";
import { verifyjwt } from "../middlewares/auth.middelware.js";

const router = Router();

// Apply verifyjwt middleware to all routes in this file
router.use(verifyjwt);

router.route("/c/:channelId")
    .get(getUserChannelSubscribers)
    .post(toggleSubscription);

router.route("/u/:subscriberId").get(getSubscribedChannels);

export default router;
