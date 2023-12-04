import { Document, Model, model, models, ObjectId, Schema } from "mongoose";

interface IPost extends Document {
    user_id: ObjectId;
    caption?: string;
    typeOfPost: string;
    created_at: Date;
    likes: ObjectId[];
    song: ObjectId; // Assuming you have a Song model
}

const postSchema: Schema = new Schema(
    {
        user_id: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        caption: {
            type: String,
        },
        typeOfPost: {
            type: String,
            enum: ['dailyRandomPost', 'weeklyRecapPost'], // Add more types as needed
            required: true
        },
        created_at: { 
            type: Date, 
            default: Date.now 
        },
        likes: [
            { 
                type: Schema.Types.ObjectId, 
                ref: 'User' 
            }
        ],
        song: {
            type: Schema.Types.ObjectId, 
            ref: 'Song' // Replace with your Song model
        }
    },
    {
        collection: "posts"
    }
);

export default (models.post
    ? models.post
    : model("post", postSchema)) as Model<IPost>;
