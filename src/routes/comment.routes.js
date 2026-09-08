import { Router } from "express";
import {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
} from "../controllers/comment.controller.js";
import { verifyjwt } from "../middlewares/auth.middelware.js";

const router = Router();

// Apply verifyjwt middleware to all routes in this file
router.use(verifyjwt);

router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/c/:commentId").patch(updateComment).delete(deleteComment);

export default router;
