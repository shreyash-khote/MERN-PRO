import mongoose, { isValidObjectId } from "mongoose";
import { Videos } from "../models/videos.model.js";
import { Users } from "../models/users.model.js";
import { Apierror } from "../utils/APIerror.js";
import { APIresponce } from "../utils/APIresponce.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { uploadoncloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    const matchStage = { isPublished: true };

    if (query) {
        matchStage.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];
    }

    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new Apierror(400, "Invalid user ID");
        }
        matchStage.owner = new mongoose.Types.ObjectId(userId);
    }

    const pipeline = [
        {
            $match: matchStage
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullname: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" }
            }
        }
    ];

    if (sortBy && sortType) {
        pipeline.push({
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1
            }
        });
    } else {
        pipeline.push({
            $sort: { createdAt: -1 }
        });
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    const aggregate = Videos.aggregate(pipeline);
    const videos = await Videos.aggregatePaginate(aggregate, options);

    return res
        .status(200)
        .json(new APIresponce(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body

    if ([title, description].some((field) => field?.trim() === "")) {
        throw new Apierror(400, "Title and description are required")
    }

    const videoFileLocalPath = req.files?.videoFile?.[0]?.path || req.files?.videofile?.[0]?.path
    const thumbnailFileLocalPath = req.files?.thumbnail?.[0]?.path

    if (!videoFileLocalPath) {
        throw new Apierror(400, "Video file is missing")
    }

    if (!thumbnailFileLocalPath) {
        throw new Apierror(400, "Thumbnail file is missing")
    }

    const videofile = await uploadoncloudinary(videoFileLocalPath)
    const thumbnailfile = await uploadoncloudinary(thumbnailFileLocalPath)

    if (!videofile) {
        throw new Apierror(500, "Video file failed to upload on Cloudinary")
    }
    if (!thumbnailfile) {
        throw new Apierror(500, "Thumbnail file failed to upload on Cloudinary")
    }

    const video = await Videos.create({
        title,
        description,
        videoFile: videofile.url,
        thumbnail: thumbnailfile.url,
        duration: videofile.duration || 0,
        owner: req.user?._id
    })

    return res
        .status(201)
        .json(new APIresponce(201, video, "Video published successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new Apierror(400, "Invalid Video ID");
    }

    const video = await Videos.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullname: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" }
            }
        }
    ]);

    if (!video?.length) {
        throw new Apierror(404, "Video not found!");
    }

    if (req.user?._id) {
        await Users.findByIdAndUpdate(
            req.user._id,
            {
                $addToSet: { watchHistory: videoId }
            }
        );
    }

    return res  
        .status(200)
        .json(new APIresponce(200, video[0], "Video fetched successfully!"));
});

const incrementVideoViews = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new Apierror(400, "Invalid Video ID");
    }

    const video = await Videos.findByIdAndUpdate(
        videoId,
        { $inc: { views: 1 } },
        { new: true }
    );

    if (!video) {
        throw new Apierror(404, "Video not found!");
    }

    if (req.user?._id) {
        await Users.findByIdAndUpdate(
            req.user._id,
            {
                $addToSet: { watchHistory: videoId }
            }
        );
    }

    return res
        .status(200)
        .json(new APIresponce(200, { views: video.views }, "Video view count updated successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new Apierror(400, "Invalid Video ID");
    }

    const video = await Videos.findById(videoId);

    if (!video) {
        throw new Apierror(404, "Video not found!");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new Apierror(403, "You do not have permission to update this video");
    }

    const thumbnailLocalPath = req.file?.path;
    let thumbnailUrl = video.thumbnail;

    if (thumbnailLocalPath) {
        const thumbnail = await uploadoncloudinary(thumbnailLocalPath);
        if (!thumbnail || !thumbnail.url) {
            throw new Apierror(500, "Error uploading thumbnail");
        }
        thumbnailUrl = thumbnail.url;
    }

    const updatedVideo = await Videos.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: title || video.title,
                description: description || video.description,
                thumbnail: thumbnailUrl
            }
        },
        { new: true }
    );

    return res
        .status(200)
        .json(new APIresponce(200, updatedVideo, "Video details updated successfully!"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new Apierror(400, "Invalid Video ID");
    }

    const video = await Videos.findById(videoId);

    if (!video) {
        throw new Apierror(404, "Video not found!");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new Apierror(403, "You do not have permission to delete this video");
    }

    await Videos.findByIdAndDelete(videoId);

    return res
        .status(200)
        .json(new APIresponce(200, {}, "Video deleted successfully!"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new Apierror(400, "Invalid Video ID");
    }

    const video = await Videos.findById(videoId);

    if (!video) {
        throw new Apierror(404, "Video not found!");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new Apierror(403, "You do not have permission to toggle publish status");
    }

    video.isPublished = !video.isPublished;
    await video.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new APIresponce(
                200,
                { isPublished: video.isPublished },
                "Publish status toggled successfully!"
            )
        );
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    incrementVideoViews,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};