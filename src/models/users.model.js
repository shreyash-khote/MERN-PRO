import { Schema } from "mongoose";
import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new Schema(
    {
        username:{
            type:String,
            required : true,
            unique : true,
            lowercase:true,  
            trim:true,
            index:true
        },
        email:{
            type:String,
            required : true,
            unique : true,
            lowecase:true,
            trim:true,
        },
        fullname:{
            type:String,
            required : true,
            trim:true,
            index:true
        },
        avatar:{
            type:String,
            required : true
        },
        coverimage:{
            type:String
        },
        watchHistory:[{
            type:Schema.Types.ObjectId,
            ref:"video"
        }],
        password:{
            type:String,
            required:[true,"password is required"]
        },
        refreshToken:{
            type:String
        }

    },
    {
        timestamps:true
    }
)

userSchema.pre("save",async function (next) {
    if(!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password,10)
})

userSchema.methods.isPasswordCorrect = async function (password){
   return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET_KEY || process.env.ACCESS_TOKEN_SECRET || "default_access_token_secret_key_987654321",
        {
            expiresIn: process.env.ACESS_TOKEN_EXPIRY || process.env.ACCESS_TOKEN_EXPIRY || "1d"
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET_KEY || process.env.REFRESH_TOKEN_SECRET || "default_refresh_token_secret_key_987654321",
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10d"
        }
    )
}



export const Users = mongoose.model("Users",userSchema)