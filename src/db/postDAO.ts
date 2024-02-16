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
        async fetchPosts(userId: string, lastPostTimestamp: string, limit: number = 10) {
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
                        $lookup: {
                            from: "comments",
                            localField: "_id",
                            foreignField: "post_id",
                            as: "comments"
                        }
                    },
                    { $unwind: { path: "$comments", preserveNullAndEmptyArrays: true } }, // Adjusted
                    {
                        $lookup: {
                            from: "user",
                            localField: "comments.user_id",
                            foreignField: "_id",
                            as: "comments.userDetails"
                        }
                    },
                    { $unwind: { path: "$comments.userDetails", preserveNullAndEmptyArrays: true } },
                    // Project and format the comment user details
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
                            "display_name": "$userDetails.display_name",
                            "comments.text": 1,
                            "comments.created_at": 1,
                            "comments.display_name": "$comments.userDetails.display_name",
                        }
                    },
                    // Group the comments back into their respective posts
                    {
                        $group: {
                            _id: "$_id",
                            caption: { $first: "$caption" },
                            typeOfPost: { $first: "$typeOfPost" },
                            created_at: { $first: "$created_at" },
                            likes: { $first: "$likes" },
                            songDetails: { $first: "$songDetails" },
                            user_id: { $first: "$user_id" },
                            user_name: { $first: "$user_name" },
                            display_name: { $first: "$display_name" },
                            comments: { $push: "$comments" }
                        }
                    },
                    {
                        $sort: { created_at: -1 } // Reapply sorting to maintain order
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
        async fetchUserPosts(userId: string, lastPostTimestamp: string, limit: number = 10) {
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
                        $lookup: {
                            from: "comments",
                            localField: "_id",
                            foreignField: "post_id",
                            as: "comments"
                        }
                    },
                    // Optional: Limit the number of comments here if desired
                    {
                        $lookup: {
                            from: "user",
                            localField: "comments.user_id",
                            foreignField: "_id",
                            as: "commentUserDetails"
                        }
                    },
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
                            userId: user._id,
                            comments: {
                                $map: {
                                    input: "$comments",
                                    as: "comment",
                                    in: {
                                        text: "$$comment.text",
                                        created_at: "$$comment.created_at",
                                        user_id: "$$comment.user_id",
                                        display_name: {
                                            $arrayElemAt: [
                                                "$commentUserDetails.display_name",
                                                { $indexOfArray: ["$commentUserDetails._id", "$$comment.user_id"] }
                                            ]
                                        }
                                    }
                                }
                            }
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
                console.log("userId")
                console.log(userId)
                await connectMongo();
                const post = await postModel.findById(postId);
        
                if (!post) {
                    return { error: "Post not found" };
                }
        
                // Convert userId from string to ObjectId
                const userIdObjectId = new ObjectId(userId);
        
                // Check if the user has already liked the post to avoid duplicates
                // Note: You might need to convert post.likes elements to string if they are ObjectId
                // to ensure accurate comparison
                if (!post.likes.map(id => id.toString()).includes(userIdObjectId.toString())) {
                    post.likes.push(userIdObjectId);
                    await post.save();
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
                const post = await postModel.findById(postId);
        
                if (!post) {
                    return { error: "Post not found" };
                }
        
                // Convert userId from string to ObjectId for comparison and removal
                const userIdObjectId = new ObjectId(userId);
        
                // Check if the user has already liked the post to ensure operation is necessary
                // Note: You might need to convert post.likes elements to string if they are ObjectId
                // to ensure accurate comparison
                if (post.likes.map(id => id.toString()).includes(userIdObjectId.toString())) {
                    // Remove the user's like
                    post.likes = post.likes.filter(id => id.toString() !== userIdObjectId.toString());
                    await post.save();
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