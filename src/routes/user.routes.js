import { Router } from "express";
import {
    registerUser,
    loginuser,
    logoutuser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentuser,
    updateaccountdetails,
    updateUserAvatar,
    updateUsercoverimage,
    getwatchhistory,
    getuserchannelprofile
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middelware.js";
import { verifyjwt } from "../middlewares/auth.middelware.js";
const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverimage",
            maxCount: 1
        }
    ]),
    registerUser)

router.route("/login").post(upload.none(),loginuser)

router.route("/logout").post(verifyjwt, logoutuser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyjwt, upload.none(), changeCurrentPassword)

router.route("/current-user").get(verifyjwt, getCurrentuser)

router.route("/update-account").patch(verifyjwt, upload.none(), updateaccountdetails)

router.route("/avatar").patch(verifyjwt, upload.single("avatar"), updateUserAvatar)

router.route("/cover-image").patch(verifyjwt, upload.single("coverimage"), updateUsercoverimage)

router.route("/c/:username").get(verifyjwt, getuserchannelprofile)

router.route("/history").get(verifyjwt, getwatchhistory)

export default router