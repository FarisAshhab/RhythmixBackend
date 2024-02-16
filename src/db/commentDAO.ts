import * as dotenv from 'dotenv'
import connectMongo from "./connectMongo";
import { Types } from 'mongoose';
import { ObjectId } from "mongoose/lib/types";
import {
    formatJSONResponse,
	formatErrorResponse,
	ValidatedEventAPIGatewayProxyEvent,
} from "@libs/api-gateway";

import { default as songModel } from "./models/Song";
import { default as postModel } from "./models/Post";
import { default as userModel } from "./models/User";
import { default as commentModel } from "./models/Comment";

dotenv.config()


function commentDAO() {

    let dao = {

        async commentPost(userId: string, postId: string, text: string) {
            try {
                await connectMongo();
                const comment = new commentModel({
                    post_id: new ObjectId(postId),
                    user_id: new ObjectId(userId),
                    text: text,
                    // created_at: new Date(), // Or rely on default value defined in schema
                });

                await comment.save();

                return { message: "Comment added successfully", comment };
            } catch (e) {
                console.error(e);
                return { error: e.message || "An error occurred while adding the comment" };
            }
        }

    }
        
    
    return dao
};

export default commentDAO;
