import {asyncHandler} from "../utils/asynchandler.js";
import { Apierror } from "../utils/APIerror.js";
import { Users } from "../models/users.model.js";
import { uploadoncloudinary } from "../utils/cloudinary.js";
import { APIresponce } from "../utils/APIresponce.js";
import jwt, { decode } from "jsonwebtoken";
import mongoose from "mongoose";
const generateAccessandRefreshToken = async(userId)=>{
    try {
        const user = await Users.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})
        return {accessToken,refreshToken}

    } catch (error) {
        throw new Apierror(500,"something went wrong while grenerating refresh and access token!")
    }
}

const registerUser = asyncHandler(async(req,res)=>{
    const {fullname,email,username,password} = req.body

    if([fullname,email,username,password].some((field)=>field?.trim()==="")){
        throw new Apierror(400,"All fields are required")
    }
    const existedUser = await Users.findOne({
        $or:[{ username },{ email }]
    })
    if(existedUser){
        throw new Apierror(409,"user with email or username already exist")
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverimageLocalPath;
    if(req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length > 0){
        coverimageLocalPath = req.files.coverimage[0].path
    }
    if(!avatarLocalPath){
        throw new Apierror(400,"Avatar file is required")
    }
    const avatar = await uploadoncloudinary(avatarLocalPath)
    const coverimage= await uploadoncloudinary(coverimageLocalPath)

    if(!avatar){
        throw new Apierror(400,"avatar file is required")
    }

    const user = await Users.create({
        fullname,
        avatar:avatar.url,
        coverimage:coverimage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser = await Users.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new Apierror(500,"Something went wrong while creating user")
    }
    return res.status(201).json(
        new APIresponce(200,createdUser,"user ragistered successfully")

    )
})

const loginuser = asyncHandler(async(req,res)=>{
    const {email,username,password} = req.body
    if(!username && !email){
        throw new Apierror(400,"username or password is required !!")
    }

    const user = await Users.findOne({
        $or:[{username},{email}]
    })
    
    if(!user){
        throw new Apierror(400,"user not found")        
    }

    const ispasswordvalid = await user.isPasswordCorrect(password)

    if(!ispasswordvalid){
        throw new Apierror(400,"invalid credentials!")
    }

    const {accessToken,refreshToken} = await generateAccessandRefreshToken(user._id)

    const loggedInUser = await Users.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new APIresponce(200,{
            user:loggedInUser,accessToken,refreshToken
        },"User logged in successfully !")
    )

})

const logoutuser = asyncHandler(async(req,res)=>{
    await Users.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options).json(
        new APIresponce(200,"User deleted successfully")
    )
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken

    if(!incomingRefreshToken){
        throw new Apierror(401,"unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET_KEY
        )
    
        const user = await Users.findById(decodedToken?._id)
    
        if(!user){
            throw new Apierror(401,"Invalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new Apierror(401,"Refresh token expired or used")
    
        }
    
        const options={
            httpOnly:true,
            secure:true
        }
    
       const {accessToken, refreshToken} = await generateAccessandRefreshToken(user._id)
    
       return res.status(200)
       .cookie("accessToken",accessToken,options)
       .cookie("refreshToken",refreshToken,options)
       .json(
        new APIresponce(200,{accessToken,refreshToken},"Access token refreshed successfully !")
       )
    } catch (error) {
        throw new Apierror(401,error?.message || "Invalid refreshtoken")
    }
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldpassword,newpassword,confpassword} = req.body
    
    if(!oldpassword || !newpassword || !confpassword){
        throw new Apierror(400, "All password fields are required!")
    }

    if(newpassword !== confpassword){
        throw new Apierror(400, "New password and confirm password do not match!")
    }

    const user = await Users.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldpassword)

    if(!isPasswordCorrect){
        throw new Apierror(400,"Invalid old password!")
    }

    user.password = newpassword
    await user.save({validateBeforeSave:false})
    
    return res.status(200).json(
        new APIresponce(200, {}, "Password changed successfully!")
    )
})

const getCurrentuser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new APIresponce(200,req.user,"current user fetched successully !"))
})

const updateaccountdetails=asyncHandler(async(req,res)=>{
    const {fullname,email} = req.body
    if(!fullname || !email){
        throw new Apierror(400,"All fields are required!")
    }

    const user = await Users.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname,
                email:email
            }
        },
        {new : true}
    ).select("-password")

    return res.status(200).json(
        new APIresponce(200,user,"Account details updated successfully!")
    )
})

const updateUserAvatar = asyncHandler(async(req,res)=>{
   const avatarlocalpath= req.file?.path
   if(!avatarlocalpath){
    throw new Apierror(400,"Avatar file is missing!")
   }

   const avatar = await uploadoncloudinary(avatarlocalpath)

   if(!avatar.url){
    throw new Apierror(400,"Error while uploading the avatar!")

   }

   const user =await Users.findByIdAndUpdate(
    req.user?._id,
    {
        $set:{
            avatar:avatar.url
        }
    },
    {new:true}
   ).select("-password")

   return res.status(200).json(
    new APIresponce(
        200,
        user,
        "avatar image updated successfully!"
    )
   )
})

const updateUsercoverimage = asyncHandler(async(req,res)=>{
   const coverimagelocalpath= req.file?.path
   if(!coverimagelocalpath){
    throw new Apierror(400,"coverimage file is missing!")
   }

   const coverimage = await uploadoncloudinary(coverimagelocalpath)

   if(!coverimage.url){
    throw new Apierror(400,"Error while uploading the coverimage!")

   }

   const user = await Users.findByIdAndUpdate(
    req.user?._id,
    {
        $set:{
            coverimage:coverimage.url
        }
    },
    {new:true}
   ).select("-password")

   return res.status(200).json(
    new APIresponce(
        200,
        user,
        "Cover image updated successfully!"
    )
   )
})

const getuserchannelprofile = asyncHandler(async(req,res)=>{
    const {username} = req.params

    if(!username.trim()){
        throw new Apierror(400,"username is missing!")

    }

    const channel = await Users.aggregate([
        {
            $match:{
                username: username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscriberscount:{
                    $size:"$subscribers"
                },
                channelsSubscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    },
                }
            }
        },
        {
            $project:{
                fullname:1,
                username:1,
                subscriberscount:1,
                channelsSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverimage:1,
                email:1
            }
        }
    ])
    if(!channel?.length){
        throw new Apierror(404,"channel does not exists!")
    }

    return res
    .status(200)
    .json(
        new APIresponce(200,channel[0],"User channel fetched successfully!")
    )
})

const getwatchhistory = asyncHandler(async(req,res)=>{
    const user = await Users.aggregate([
        {
            $match:{
                _id :new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new APIresponce(
            200,
            user[0]?.watchHistory || [],
            "watch history fetched successfully!!"
        )
    )
})

export {registerUser,
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
}
