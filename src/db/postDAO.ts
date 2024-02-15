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

dotenv.config()


function postDAO() {

    let dao = {
        async createPost(userId: string, songData: any) {
            try {
                await connectMongo();
                console.log("song data:::")
                console.log(songData)
                // Check if the song exists in the songs collection
                let song = await songModel.findOne({ trackId: songData.trackId });
        
                if (!song) {
                    // If song does not exist, add it to the songs collection
                    song = new songModel({
                        trackId: songData.trackId,
                        trackName: songData.trackName,
                        previewUrl: songData.previewUrl,
                        spotifyTrackUrl: songData.spotifyTrackUrl,
                        artists: songData.artists,
                        images: songData.images
                    });
                    await song.save();
                }
        
                // Now, create the post with a reference to the song's _id
                const postData = {
                    user_id: new ObjectId(userId),
                    typeOfPost: "dailyRandomPost", // or determine based on some logic
                    created_at: new Date(),
                    song: song._id
                    // Add other fields as necessary
                };
        
                const newPost = new postModel(postData);
                await newPost.save();
        
                console.log("Post created successfully.");
                return formatJSONResponse({ message: "Post created successfully", post: newPost });
            } catch (e) {
                console.error(e);
                return formatJSONResponse({
                    messages: [{ error: e.message || "An error occurred during the post creation process" }]
                });
            }
        },

        // this will be used for user feed
        async fetchPosts(userId: string, lastPostTimestamp: string, limit: number = 20) {
            try {
                await connectMongo();
                const user = await userModel.findById(userId);
        
                if (!user) {
                    return formatErrorResponse(404, "User not found");
                }
        
                // Define match conditions
                let matchConditions: { [key: string]: any } = {
                    user_id: { $in: user.following.map(id => new ObjectId(id)) }
                };
                if (lastPostTimestamp) {
                    matchConditions['created_at'] = { $lt: new Date(lastPostTimestamp) };
                }
        
                // Perform the aggregation
                const posts = await postModel.aggregate([
                    { $match: matchConditions },
                    { $sort: { created_at: -1 } },
                    { $limit: limit },
                    {
                        $lookup: {
                            from: "songs", 
                            localField: "song",
                            foreignField: "_id",
                            as: "songDetails"
                        }
                    },
                    { $unwind: "$songDetails" },
                    {
                        $lookup: {
                            from: "user",
                            localField: "user_id",
                            foreignField: "_id",
                            as: "userDetails"
                        }
                    },
                    { $unwind: "$userDetails" },
                    {
                        $project: {
                            _id: 1,
                            caption: 1,
                            typeOfPost: 1,
                            created_at: 1,
                            likes: 1,
                            songDetails: 1,
                            user_id: 1,
                            "user_name": "$userDetails.user_name",
                            "display_name": "$userDetails.display_name"
                        }
                    }
                ]);
        
                return formatJSONResponse({ posts });
            } catch (e) {
                console.error(e);
                return formatJSONResponse({
                    messages: [{ error: e.message || "An error occurred while fetching posts" }]
                });
            }
        },

        // this will be used for user profile
        async fetchUserPosts(userId: string, lastPostTimestamp: string, limit: number = 20) {
            try {
                await connectMongo();
        
                // Fetch the user's details for username and display name
                const user = await userModel.findById(userId);
                if (!user) {
                    return formatErrorResponse(404, "User not found");
                }
        
                // Define match conditions
                let matchConditions: { [key: string]: any } = {
                    user_id: new ObjectId(userId)
                };
                if (lastPostTimestamp) {
                    matchConditions['created_at'] = { $lt: new Date(lastPostTimestamp) };
                }
        
                // Perform the aggregation
                const posts = await postModel.aggregate([
                    { $match: matchConditions },
                    { $sort: { created_at: -1 } },
                    { $limit: limit },
                    {
                        $lookup: {
                            from: "songs", 
                            localField: "song",
                            foreignField: "_id",
                            as: "songDetails"
                        }
                    },
                    { $unwind: { path: "$songDetails", preserveNullAndEmptyArrays: true } },
                    {
                        $project: {
                            _id: 1,
                            caption: 1,
                            typeOfPost: 1,
                            created_at: 1,
                            likes: 1,
                            songDetails: 1,
                            user_name: user.user_name,
                            display_name: user.display_name,
                            userId: user._id
                        }
                    }
                ]);
        
                return formatJSONResponse({ posts });
            } catch (e) {
                console.error(e);
                return formatJSONResponse({
                    messages: [{ error: e.message || "An error occurred while fetching user's posts" }]
                });
            }
        },

        // db/postDAO.ts

        // Function to like a post
        async likePost(userId: string, postId: string) {
            try {
                await connectMongo();
                const post = await postModel.findByIdAndUpdate(
                    postId,
                    { $addToSet: { likes: userId } }, // Use $addToSet to prevent duplicate likes
                    { new: true }
                );
                if (!post) {
                    return { error: "Post not found" };
                }
                return { message: "Post liked successfully", post };
            } catch (e) {
                console.error(e);
                return { error: e.message || "An error occurred while liking the post" };
            }
        },

        // Function to unlike a post
        async unlikePost(userId: string, postId: string) {
            try {
                await connectMongo();
                const post = await postModel.findByIdAndUpdate(
                    postId,
                    { $pull: { likes: userId } }, // Use $pull to remove the user's like
                    { new: true }
                );
                if (!post) {
                    return { error: "Post not found" };
                }
                return { message: "Post unliked successfully", post };
            } catch (e) {
                console.error(e);
                return { error: e.message || "An error occurred while unliking the post" };
            }
        }
        
    
    }
    return dao
};

export default postDAO;