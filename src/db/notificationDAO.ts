import * as dotenv from 'dotenv'
import connectMongo from "./connectMongo";
import { Types } from 'mongoose';
import { ObjectId } from "mongoose/lib/types";


import { default as notificationModel } from "./models/Notification";

dotenv.config()


function notificationDAO() {

    let dao = {

        async createNotification(type: string, fromUser: ObjectId, toUser: ObjectId) {
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
        }

    }
        
    
    return dao
};

export default notificationDAO;