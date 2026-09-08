import mongoose from "mongoose"
import { Videos } from "../models/videos.model.js"
import { Subscription } from "../models/subscriptions.model.js"
import { Like } from "../models/like.model.js"
import { Apierror } from "../utils/APIerror.js"
import { APIresponce } from "../utils/APIresponce.js"
import { asyncHandler } from "../utils/asynchandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    if (!userId) {
        throw new Apierror(401, "Unauthorized request")
    }

    // Get total subscribers
    const totalSubscribers = await Subscription.countDocuments({
        channel: userId
    })

    // Get total videos and total views
    const videoStats = await Videos.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" }
            }
        }
    ])

    // Get total likes across all videos of the channel
    const totalLikes = await Like.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoInfo"
            }
        },
        {
            $unwind: "$videoInfo"
        },
        {
            $match: {
                "videoInfo.owner": new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $count: "totalLikes"
        }
    ])

    const stats = {
        totalSubscribers,
        totalVideos: videoStats[0]?.totalVideos || 0,
        totalViews: videoStats[0]?.totalViews || 0,
        totalLikes: totalLikes[0]?.totalLikes || 0
    }

    return res
        .status(200)
        .json(new APIresponce(200, stats, "Channel stats fetched successfully"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    if (!userId) {
        throw new Apierror(401, "Unauthorized request")
    }

    const videos = await Videos.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ])

    return res
        .status(200)
        .json(new APIresponce(200, videos, "Channel videos fetched successfully"))
})

export {
    getChannelStats,
    getChannelVideos
}