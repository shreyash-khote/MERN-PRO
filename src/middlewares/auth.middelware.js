import { Users } from "../models/users.model.js";
import { Apierror } from "../utils/APIerror.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken"

export const verifyjwt = asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        
        if(!token){
            throw new Apierror(400,"Unauthorized request !")
        }
    
        const decodedtoken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET_KEY)
        const user = await Users.findById(decodedtoken?._id).select("-password -refreshToken")    
    
        if(!user){
            throw new Apierror(401,"Invalid Access Token")
        }
    
        req.user = user
        next()
    } catch (error) {
        throw new Apierror(500,error?.message || "Invalid access token")
    }
})