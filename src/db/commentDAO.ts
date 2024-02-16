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
import notificationDAO from "./notificationDAO";

dotenv.config()
const notificationDao = notificationDAO()

function commentDAO() {

    let dao = {

        // async commentPost(userId: string, postId: string, text: string) {
        //     try {
        //         await connectMongo();
        //         const comment = new commentModel({
        //             post_id: new ObjectId(postId),
        //             user_id: new ObjectId(userId),
        //             text: text,
        //             // created_at: new Date(), // Or rely on default value defined in schema
        //         });

        //         await comment.save();
                
        //         return { message: "Comment added successfully", comment };
        //     } catch (e) {
        //         console.error(e);
        //         return { error: e.message || "An error occurred while adding the comment" };
        //     }
        // }
        async commentPost(userId: string, postId: string, text: string) {
            try {
                await connectMongo();
                
                // First, let's fetch the post to get the owner's userId
                const post = await postModel.findById(new ObjectId(postId));
                if (!post) {
                    console.error("Post not found");
                    return { error: "Post not found" };
                }
        
                // Proceed to save the comment
                const comment = new commentModel({
                    post_id: new ObjectId(postId),
                    user_id: new ObjectId(userId),
                    text: text,
                });
        
                await comment.save();
                
                // Return both the comment and post owner's userId
                return { 
                    message: "Comment added successfully", 
                    comment,
                    postOwnerId: post.user_id.toString(), // Assuming you want the userId as a string
                };
            } catch (e) {
                console.error(e);
                return { error: e.message || "An error occurred while adding the comment" };
            }
        }
        

    }
        
    
    return dao
};

export default commentDAO;
