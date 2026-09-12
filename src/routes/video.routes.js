import { Router } from "express";
import {
    getAllVideos,
    publishAVideo,
    getVideoById,
    incrementVideoViews,
    updateVideo,
    deleteVideo,
    togglePublishStatus
} from "../controllers/video.controller.js";
import { verifyjwt, optionalVerifyjwt } from "../middlewares/auth.middelware.js";
import { upload } from "../middlewares/multer.middelware.js";

const router = Router();

router.route("/")
    .get(optionalVerifyjwt, getAllVideos)
    .post(
        verifyjwt,
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1
            },
            {
                name: "thumbnail",
                maxCount: 1
            }
        ]),
        publishAVideo
    );

router.route("/:videoId")
    .get(optionalVerifyjwt, getVideoById)
    .delete(verifyjwt, deleteVideo)
    .patch(verifyjwt, upload.single("thumbnail"), updateVideo);

router.route("/views/:videoId").patch(incrementVideoViews);
router.route("/toggle/publish/:videoId").patch(verifyjwt, togglePublishStatus);

export default router;
