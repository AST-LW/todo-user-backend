import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { asyncWrapper } from "../../utilities/app/async.wrapper";
import { StatusCodes } from "http-status-codes";

export const fetchAccessTokenController = asyncWrapper(async (req: Request, res: Response) => {
    const { userID } = req.params; // Assuming the user ID is passed in the request parameters
    const xApiKey = req.headers["x-api-key"];

    if (!userID) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: "User ID is required.",
        });
    }

    if (xApiKey !== process.env.X_API_KEY) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            error: "Invalid x-api-key.",
        });
    }

    try {
        // Generate a new access token using JWT
        const accessToken = jwt.sign({ user_id: userID }, process.env.JWT_SECRET_TOKEN as string, {
            expiresIn: "40s",
        });

        return res.status(StatusCodes.OK).json({
            access_token: accessToken,
            expires_in: "40 sec",
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: (error as any).message,
        });
    }
});
