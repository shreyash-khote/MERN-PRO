import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { Videos } from "../models/videos.model.js"
import { Apierror } from "../utils/APIerror.js"
import { APIresponce } from "../utils/APIresponce.js"
import { asyncHandler } from "../utils/asynchandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!isValidObjectId(videoId)) {
        throw new Apierror(400, "Invalid video ID")
    }

    const video = await Videos.findById(videoId)
    if (!video) {
        throw new Apierror(404, "Video not found")
    }

    const commentsAggregate = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
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
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likes"
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" },
                likesCount: { $size: "$likes" },
                isLiked: {
                    $in: [req.user?._id, "$likes.likedBy"]
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ])

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }

    const comments = await Comment.aggregatePaginate(commentsAggregate, options)

    return res
        .status(200)
        .json(new APIresponce(200, comments, "Comments fetched successfully"))
})

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { content } = req.body

    if (!isValidObjectId(videoId)) {
        throw new Apierror(400, "Invalid video ID")
    }

    if (!content || content.trim() === "") {
        throw new Apierror(400, "Comment content is required")
    }

    const video = await Videos.findById(videoId)
    if (!video) {
        throw new Apierror(404, "Video not found")
    }

    const comment = await Comment.create({
        content: content.trim(),
        video: videoId,
        owner: req.user?._id
    })

    if (!comment) {
        throw new Apierror(500, "Failed to add comment")
    }

    return res
        .status(201)
        .json(new APIresponce(201, comment, "Comment added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { content } = req.body

    if (!isValidObjectId(commentId)) {
        throw new Apierror(400, "Invalid comment ID")
    }

    if (!content || content.trim() === "") {
        throw new Apierror(400, "Comment content is required")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new Apierror(404, "Comment not found")
    }

    if (comment.owner?.toString() !== req.user?._id?.toString()) {
        throw new Apierror(403, "You do not have permission to update this comment")
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: content.trim()
            }
        },
        { new: true }
    )

    return res
        .status(200)
        .json(new APIresponce(200, updatedComment, "Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!isValidObjectId(commentId)) {
        throw new Apierror(400, "Invalid comment ID")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new Apierror(404, "Comment not found")
    }

    if (comment.owner?.toString() !== req.user?._id?.toString()) {
        throw new Apierror(403, "You do not have permission to delete this comment")
    }

    await Comment.findByIdAndDelete(commentId)

    return res
        .status(200)
        .json(new APIresponce(200, {}, "Comment deleted successfully"))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}