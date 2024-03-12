import { Document, Model, model, models, ObjectId, Schema } from "mongoose";

interface IArtist {
    name: string;
    id: string;
    spotifyUrl: string;
}

interface IImage {
    url: string;
    height: number;
    width: number;
}

interface ISong extends Document {
    trackId: string;
    trackName: string;
    previewUrl: string;
    albumName: string;
    spotifyTrackUrl: string;
    artists: IArtist[];
    images: IImage[];
}

const songSchema: Schema = new Schema(
    {
        trackId: {
            type: String,
            required: true,
            unique: true
        },
        trackName: {
            type: String,
            required: true
        },
        previewUrl: {
            type: String
        },
        albumName: { 
            type: String, 
            required: true 
        }, // Add this line
        spotifyTrackUrl: {
            type: String,
            required: true
        },
        artists: [
            {
                name: String,
                id: String,
                spotifyUrl: String
            }
        ],
        images: [
            {
                url: String,
                height: Number,
                width: Number
            }
        ]
    },
    {
        collection: "songs"
    }
);

export default (models.song
    ? models.song
    : model("song", songSchema)) as Model<ISong>;
