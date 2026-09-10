import { Users } from "../models/users.model.js";
import { Apierror } from "../utils/APIerror.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken"

export const verifyjwt = asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        
        if(!token){
            throw new Apierror(401,"Unauthorized request !")
        }
    
        const secret = process.env.ACCESS_TOKEN_SECRET_KEY || process.env.ACCESS_TOKEN_SECRET;
        const decodedtoken = jwt.verify(token, secret)
        const user = await Users.findById(decodedtoken?._id).select("-password -refreshToken")    
    
        if(!user){
            throw new Apierror(401,"Invalid Access Token")
        }
    
        req.user = user
        next()
    } catch (error) {
        throw new Apierror(error?.statusCode || 401, error?.message || "Invalid access token")
    }
})

export const optionalVerifyjwt = asyncHandler(async(req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if (token) {
            const secret = process.env.ACCESS_TOKEN_SECRET_KEY || process.env.ACCESS_TOKEN_SECRET;
            const decodedtoken = jwt.verify(token, secret)
            const user = await Users.findById(decodedtoken?._id).select("-password -refreshToken")
            if (user) {
                req.user = user
            }
        }
        next()
    } catch (error) {
        next()
    }
})