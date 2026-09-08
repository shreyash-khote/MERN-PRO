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
import { verifyjwt } from "../middlewares/auth.middelware.js";
import { upload } from "../middlewares/multer.middelware.js";

const router = Router();

// Apply verifyjwt middleware to all routes in this file
router.use(verifyjwt);

router.route("/")
    .get(getAllVideos)
    .post(
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
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), updateVideo);

router.route("/views/:videoId").patch(incrementVideoViews);
router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;
