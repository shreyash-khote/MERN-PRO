import { Router } from "express";
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js";
import { verifyjwt, optionalVerifyjwt } from "../middlewares/auth.middelware.js";

const router = Router();

router.route("/").post(verifyjwt, createPlaylist);

router.route("/:playlistId")
    .get(optionalVerifyjwt, getPlaylistById)
    .patch(verifyjwt, updatePlaylist)
    .delete(verifyjwt, deletePlaylist);

router.route("/add/:playlistId/:videoId").patch(verifyjwt, addVideoToPlaylist);
router.route("/remove/:playlistId/:videoId").patch(verifyjwt, removeVideoFromPlaylist);

router.route("/user/:userId").get(optionalVerifyjwt, getUserPlaylists);

export default router;
