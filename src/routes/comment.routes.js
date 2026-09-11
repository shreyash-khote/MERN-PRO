import { Router } from "express";
import {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
} from "../controllers/comment.controller.js";
import { verifyjwt, optionalVerifyjwt } from "../middlewares/auth.middelware.js";

const router = Router();

router.route("/:videoId")
    .get(optionalVerifyjwt, getVideoComments)
    .post(verifyjwt, addComment);

router.route("/c/:commentId")
    .patch(verifyjwt, updateComment)
    .delete(verifyjwt, deleteComment);

export default router;
