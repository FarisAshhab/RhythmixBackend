import { Document, Model, model, models, ObjectId, Schema } from "mongoose";
/*
	Used for new users, whenever a new user is created, this schema is used, all fields except phone_number, bio, and profile_pic are required
*/

interface ISpotifyCredentials {
    access_token?: string;
    refresh_token?: string;
}

interface ITopArtist {
    name: string;
    spotifyUrl: string;
    imageUrl: string;
}

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
		spotify_url: {
			type: String
		},
        profile_pic: {
			type: String
		},
		spotify_credentials: {
            access_token: {
                type: String,
                required: false
            },
            refresh_token: {
                type: String,
                required: false 
            }
        },
		topArtists: [
            {
                name: String,
                spotifyUrl: String,
                imageUrl: String,
            },
        ],
        topGenres: [String],
		followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
		following: [{ type: Schema.Types.ObjectId, ref: 'User' }]
	},
	{
		collection: "user",
		minimize: false,
	}
);

interface IUser extends Document {
	email: string;
	password: string;
	display_name: string;
	user_name: string;
	profile_type: string;
	created_at: Date,
    phone_number?: string;
    bio?: string;
    profile_pic?:string;
	spotify_url?:string
	spotify_credentials?: ISpotifyCredentials;
	topArtists?: ITopArtist[];
    topGenres?: string[];
	followers?: ObjectId[];
    following?: ObjectId[];
}

export default (models.user
	? models.user
	: model("user", userSchema)) as Model<IUser>;