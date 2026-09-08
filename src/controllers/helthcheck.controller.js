import { APIresponce } from "../utils/APIresponce.js"
import { asyncHandler } from "../utils/asynchandler.js"

const healthcheck = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new APIresponce(200, { status: "OK" }, "Health check passed successfully"))
})

export {
    healthcheck
}

