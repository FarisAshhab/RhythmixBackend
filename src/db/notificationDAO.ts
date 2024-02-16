import * as dotenv from 'dotenv'
import connectMongo from "./connectMongo";
import { Types } from 'mongoose';
import { ObjectId } from "mongoose/lib/types";
import {
    formatJSONResponse,
	formatErrorResponse,
	ValidatedEventAPIGatewayProxyEvent,
} from "@libs/api-gateway";

import { default as notificationModel } from "./models/Notification";
import { default as userModel } from "./models/User";


dotenv.config()


function notificationDAO() {

    let dao = {

        async createNotification(type: string, fromUser: string, toUser: string) {
            try {
                // Assuming connectMongo is your function to ensure a database connection
                await connectMongo(); 
        
                const notification = new notificationModel({
                    type,
                    fromUser,
                    toUser,
                    createdAt: new Date() // Optional given your schema defaults to Date.now
                });
        
                await notification.save();
                console.log("Notification created successfully:", notification);
                return notification;
            } catch (e) {
                console.error("Error creating notification:", e);
                throw e; // Rethrow the error or handle it as preferred
            }
        },

        async fetchNotifications(userId: string, limit: number = 10, lastNotificationTimestamp?: string) {
            try {
                await connectMongo();
                const user = await userModel.findById(userId);
                console.log("userrr")
                console.log(user)
                let queryConditions = { toUser: userId };
                if (lastNotificationTimestamp) {
                    console.log(`Filtering notifications before: ${lastNotificationTimestamp}`);
                    queryConditions['createdAt'] = { $lt: new Date(lastNotificationTimestamp) };
                }
                
        
                // Use an aggregate or find query similar to fetchPosts, with added population for fromUser
                const notifications = await notificationModel.find(queryConditions)
                    .sort({ createdAt: -1 })
                    .limit(limit)
                    .populate({
                        path: 'fromUser',
                        select: 'user_name _id' // Adjust fields as needed based on your User model
                    })
                    .exec();
        
                return { notifications }; // Adjust based on how you format responses
            } catch (e) {
                console.error(e);
                // Adjust error handling as needed
                throw e;
            }
        }
        

    }
        
    
    return dao
};

export default notificationDAO;