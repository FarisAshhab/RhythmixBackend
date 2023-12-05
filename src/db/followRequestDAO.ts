import * as dotenv from 'dotenv'
import connectMongo from "./connectMongo";
import { Types } from 'mongoose';
import { ObjectId } from "mongoose/lib/types";
import {
    formatJSONResponse,
	formatErrorResponse,
	ValidatedEventAPIGatewayProxyEvent,
} from "@libs/api-gateway";

import { default as userModel } from "./models/User";
import { default as followRequestModel } from "./models/FollowRequests";

dotenv.config()


function folowRequestsDAO() {

    let dao = {

        async handleFollowRequest(fromUserId: string, toUserId: string) {
            try {
                await connectMongo(); // Assuming you have a similar setup for database connection
        
                const toUser = await userModel.findById(toUserId as ObjectId);
                if (!toUser) {
                    return formatErrorResponse(404, "User to follow not found");
                }
        
                if (toUser.profile_type === 'private') {
                    // Create follow request for private accounts
                    await followRequestModel.create({ fromUser: fromUserId, toUser: toUserId });
                    // Optional: Create notification for follow request
                    return formatJSONResponse({
                        msg: "Follow request sent",
                    });
                } else {
                    // For public accounts, add followers and following
                    toUser.followers.push(fromUserId as ObjectId);
                    const fromUser = await userModel.findById(fromUserId);
                    if (!fromUser) {
                        return formatErrorResponse(404, "From user not found");
                    }
        
                    fromUser.following.push(toUserId as ObjectId);
                    await toUser.save();
                    await fromUser.save();
                    // Optional: Create notification for new follower
                    return formatJSONResponse({
                        msg: "User successfully followed",
                    });
                }
            } catch (e) {
                console.error(e);
                return formatJSONResponse({
                    messages: [{ error: e.message || 'An error occurred during the follow request process' }]
                });
            }
        },

        async getPendingFollowRequests(userId: string) {
            try {
                await connectMongo();
                return await followRequestModel.aggregate([
                    { $match: { toUser: new Types.ObjectId(userId), status: 'pending' } },
                    {
                        $lookup: {
                            from: 'user', // the collection name in MongoDB
                            localField: 'fromUser',
                            foreignField: '_id',
                            as: 'requestorDetails'
                        }
                    },
                    {
                        $unwind: '$requestorDetails'
                    },
                    {
                        $project: {
                            _id: 1,
                            status: 1,
                            createdAt: 1,
                            toUser: 1,
                            fromUser: 1,
                            'requestorDetails.user_name': 1,
                            'requestorDetails.display_name': 1,
                            'requestorDetails.profile_pic': 1
                        }
                    }
                ]).exec();
            } catch (e) {
                console.error(e);
                throw new Error('Error fetching pending follow requests');
            }
        },

        async acceptFollowRequest(requestId: string, userId: string) {
            try {
                await connectMongo();
                const request = await followRequestModel.findById(requestId as ObjectId);
                if (!request || request.status !== 'pending') {
                    throw new Error('Request not found or already handled');
                }
        
                // Validate that the authenticated user is the intended recipient of the request
                if (request.toUser.toString() !== userId) {
                    throw new Error('Unauthorized to accept this follow request');
                }
        
                // Add to followers and following
                const toUser = await userModel.findById(request.toUser);
                const fromUser = await userModel.findById(request.fromUser);
                if (!toUser || !fromUser) {
                    throw new Error('User not found');
                }
        
                toUser.followers.push(request.fromUser);
                fromUser.following.push(request.toUser);
        
                await toUser.save();
                await fromUser.save();
        
                // Update request status
                request.status = 'accepted';
                await request.save();
        
                return 'Follow request accepted';
            } catch (e) {
                console.error(e);
                throw new Error('Error accepting follow request');
            }
        },

        async rejectFollowRequest(requestId: string, userId: string) {
            try {
                await connectMongo();
                const request = await followRequestModel.findById(requestId as ObjectId);
                if (!request || request.status !== 'pending') {
                    throw new Error('Request not found or already handled');
                }
        
                // Validate that the authenticated user is the intended recipient of the request
                if (request.toUser.toString() !== userId) {
                    throw new Error('Unauthorized to reject this follow request');
                }
        
                request.status = 'rejected';
                await request.save();
        
                return 'Follow request rejected';
            } catch (e) {
                console.error(e);
                throw new Error('Error rejecting follow request');
            }
        },
        
        async cancelFollowRequest(requestId: string, userId: string) {
            try {
                await connectMongo();
                const request = await followRequestModel.findById(requestId as ObjectId);
                if (!request || request.status !== 'pending') {
                    throw new Error('Request not found or already handled');
                }
        
                // Validate that the authenticated user is the sender of the request
                if (request.fromUser.toString() !== userId) {
                    throw new Error('Unauthorized to cancel this follow request');
                }
        
                request.status = 'cancelled';
                await request.save();
        
                return 'Follow request cancelled';
            } catch (e) {
                console.error(e);
                throw new Error('Error cancelling follow request');
            }
        }
        
        
        
        
        
    }
    return dao
};

export default folowRequestsDAO;