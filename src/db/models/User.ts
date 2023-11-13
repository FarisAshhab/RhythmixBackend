import { Document, Model, model, models, ObjectId, Schema } from "mongoose";
/*
	Used for new users, whenever a new user is created, this schema is used, all fields except phone_number, bio, and profile_pic are required
*/

const userSchema: Schema = new Schema(
	{
		email: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		first_name: {
			type: String,
			required: true,
		},
		last_name: {
			type: String,
			required: true,
		},
		display_name: {
			type: String,
			required: true,
		},
        user_name: {
			type: String,
			required: true,
		},
        profile_type: {
			type: String,
            required: true,
		},
		created_at: {
			type: Date,
            required: true,
		},
		phone_number: {
			type: String,
		},
        bio: {
			type: String
		},
        profile_pic: {
			type: String
		}
	},
	{
		collection: "user",
		minimize: false,
	}
);

interface IUser extends Document {
	email: string;
	password: string;
	first_name: string;
	last_name: string;
	display_name: string;
	user_name: string;
	profile_type: string;
	created_at: Date,
    phone_number?: string;
    bio?: string;
    profile_pic?:string
	
}

export default (models.user
	? models.user
	: model("user", userSchema)) as Model<IUser>;