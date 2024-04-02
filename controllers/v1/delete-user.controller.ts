import { Request, Response } from "express";
import { asyncWrapper } from "../../utilities/app/async.wrapper";
import { StatusCodes } from "http-status-codes";

import supabase from "../../utilities/app/supabase-client";

export const deleteUserController = asyncWrapper(async (req: Request, res: Response) => {
    const { userID } = req.params; // Assuming the user ID is passed in the request parameters

    if (!userID) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: "User ID is required.",
        });
    }

    try {
        const { data, error } = await supabase.from("users").delete().eq("user_id", userID).select();

        if (error) {
            throw new Error(error.message);
        }

        if (data.length === 0) {
            return res.status(StatusCodes.OK).json({
                message: "User already deleted",
            });
        }

        return res.status(StatusCodes.OK).json({
            message: "User deleted successfully",
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: (error as any).message,
        });
    }
});
