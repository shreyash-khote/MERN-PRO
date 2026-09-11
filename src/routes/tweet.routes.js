import { Router } from "express";
import {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
} from "../controllers/tweet.contrller.js";
import { verifyjwt, optionalVerifyjwt } from "../middlewares/auth.middelware.js";

const router = Router();

router.route("/").post(verifyjwt, createTweet);
router.route("/user/:userId").get(optionalVerifyjwt, getUserTweets);
router.route("/:tweetId").patch(verifyjwt, updateTweet).delete(verifyjwt, deleteTweet);

export default router;
