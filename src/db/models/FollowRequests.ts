import { Document, Model, model, models, ObjectId, Schema } from "mongoose";

interface IFollowRequest extends Document {
    fromUser: ObjectId;
    toUser: ObjectId;
    status: string;
    createdAt: Date;
}

const followRequestSchema: Schema = new Schema(
    {
        fromUser: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        toUser: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        status: { 
            type: String, 
            enum: ['pending', 'accepted', 'rejected', 'cancelled'], 
            default: 'pending' 
        },
        createdAt: { 
            type: Date, 
            default: Date.now 
        }
    },
    {
        collection: "follow_requests"
    }
);

export default (models.followRequest
    ? models.followRequest
    : model("followRequest", followRequestSchema)) as Model<IFollowRequest>;
