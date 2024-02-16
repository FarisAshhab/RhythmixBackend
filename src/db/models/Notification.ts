import { Document, Model, model, models, ObjectId, Schema } from "mongoose";

interface INotification extends Document {
    type: string;
    fromUser: ObjectId;
    toUser: ObjectId;
    createdAt: Date;
}

const notificationSchema: Schema = new Schema(
    {
        type: {
            type: String,
            enum: ['followRequest', 'newFollower', 'like', 'comment'],
            required: true
        },
        fromUser: { 
            type: Schema.Types.ObjectId, 
            ref: 'user'
        },
        toUser: { 
            type: Schema.Types.ObjectId, 
            ref: 'user', 
            required: true 
        },
        createdAt: { 
            type: Date, 
            default: Date.now 
        }
    },
    {
        collection: "notifications"
    }
);

export default (models.notification
    ? models.notification
    : model("notification", notificationSchema)) as Model<INotification>;
