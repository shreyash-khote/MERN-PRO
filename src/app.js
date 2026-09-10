import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app = express();

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(url => url.trim().replace(/\/$/, ''))
  : [];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        const cleanOrigin = origin.replace(/\/$/, '');
        if (allowedOrigins.length === 0 || allowedOrigins.includes('*') || allowedOrigins.includes(cleanOrigin)) {
            callback(null, origin);
        } else {
            callback(null, origin);
        }
    },
    credentials: true
}));
app.use(express.json({limit: "10kb"}));
app.use(express.urlencoded({extended:true,limit:"10kb"}));
app.use(express.static("public"));
app.use(cookieParser());

import userRouter from "./routes/user.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import likeRouter from "./routes/like.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import commentRouter from "./routes/comment.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";
import videoRouter from "./routes/video.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/videos", videoRouter);

export {app};

