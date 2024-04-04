import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { asyncWrapper } from "../../utilities/app/async.wrapper";
import { StatusCodes } from "http-status-codes";

import supabase from "../../utilities/app/supabase-client";

export const createUserController = asyncWrapper(async (req: Request, res: Response) => {
    const { username, password, email } = req.body;

    // Check if username, password, and email are provided
    if (!username || !password || !email) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: "Username, password, and email are required.",
        });
    }

    try {
        // Check if the username or email already exists
        const { data: existingUsers, error: queryError } = await supabase
            .from("users")
            .select("*")
            .or(`username.eq.${username}, email.eq.${email}`);

        if (queryError) {
            throw new Error(queryError.message);
        }

        if (existingUsers && existingUsers.length > 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: "Username or email already exists",
            });
        }

        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        const { data: newUser, error: insertError } = await supabase
            .from("users")
            .insert([{ username, password: hashedPassword, email }])
            .select();
        if (insertError) {
            throw new Error(insertError.message);
        }

        // Generate an access token using JWT
        const accessToken = jwt.sign({ user_id: newUser[0].user_id }, process.env.JWT_SECRET_TOKEN as string, {
            expiresIn: "40s",
        });

        return res.status(StatusCodes.CREATED).json({
            user_id: newUser[0].user_id,
            access_token: accessToken,
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: (error as any).message,
        });
    }
});
