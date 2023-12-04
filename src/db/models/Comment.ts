import { Document, Model, model, models, ObjectId, Schema } from "mongoose";

interface IComment extends Document {
    post_id: ObjectId;
    user_id: ObjectId;
    text: string;
    created_at: Date;
}

const commentSchema: Schema = new Schema(
    {
        post_id: { 
            type: Schema.Types.ObjectId, 
            ref: 'Post', 
            required: true 
        },
        user_id: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        text: {
            type: String,
            required: true
        },
        created_at: { 
            type: Date, 
            default: Date.now 
        }
    },
    {
        collection: "comments"
    }
);

export default (models.comment
    ? models.comment
    : model("comment", commentSchema)) as Model<IComment>;
