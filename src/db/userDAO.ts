import axios from 'axios'
import * as dotenv from 'dotenv'
import { MONGO_URL } from '../config/apiURL.js'
import connectMongo from "./connectMongo";
import mongoose, { connect } from "mongoose";
import { ObjectId } from "mongoose/lib/types";
import {
    formatJSONResponse,
	formatErrorResponse,
	ValidatedEventAPIGatewayProxyEvent,
} from "@libs/api-gateway";
import { compare, hash} from "bcryptjs";
import { decrypt, encrypt } from "src/middleware/auth";
import { sign } from "jsonwebtoken";

import { default as userModel } from "./models/User";

dotenv.config()
const DB_BASE = MONGO_URL


function userDAO() {

    let dao = {
      
        async createUser(body: any, topArtistsAndGenres: any) {
            try {
                await connectMongo();
                console.log(body.email)
                const userFound = await userModel.findOne({
                    email: body.email.toLowerCase(),
                });
                
                console.log("userFOUND printed under")
                console.log(userFound)
                if (userFound) {
                    console.log("Found The Userrrrr")
                    return formatErrorResponse(409, "User Already Exists");
                }
                
                // 10 is the amount of salting with the hashing
                const passwordhash = await hash(body?.password, 10);

                if (typeof passwordhash !== "string") {
                    return formatErrorResponse(400, "Bcrypt Error: Password hashing");
                }
                
                console.log(body)
                let data: any = {
                    display_name: body?.display_name,
                    user_name: body?.user_name,
                    phone_number: body?.phone,
                    email: body?.email.toLowerCase(),
                    password: passwordhash,
                    profile_type: body?.profile_type,
                    created_at: new Date() // Adds the created_at timestamp in UTC - this is a standard when dealing with times in MongoDB
                }
                // if spotify_creds --> add them
                if (body?.access_token && body?.refresh_token){
                    let encryptedAccess_token = await encrypt(body?.access_token);
                    let encryptedRefresh_token = await encrypt(body?.refresh_token);

                    if (!data.spotify_credentials) {
                        data.spotify_credentials = {};
                    }
                    data.spotify_credentials.access_token = encryptedAccess_token
                    data.spotify_credentials.refresh_token = encryptedRefresh_token
                }
                // if user spotify url is present - add it
                if (body?.spotify_url){
                    data.spotify_url = body.spotify_url;
                }
                // if s3 image_url is present (profile_pic) - add it
                if (body?.profile_pic){
                    data.profile_pic = body.profilePic;
                }
                // if bio is present - add it
                if (body?.bio){
                    data.bio = body.bio;
                }

                 // Add topArtists and topGenres if available
                if (topArtistsAndGenres) {
                    data.topArtists = topArtistsAndGenres.topArtists;
                    data.topGenres = topArtistsAndGenres.topGenres;
                }

                const newUser = new userModel(data);

                await newUser.save();

                const savedUser = await userModel.findOne({
                    email: body.email.toLowerCase(),
                });

                if (!savedUser) {
                    return formatErrorResponse(500, "Server Error. Please try logging in.");
                }

                return formatJSONResponse({ savedUser });

            } catch (e) {
                console.log(e);
                return formatJSONResponse({
                messages: [{ error: e }]
                });
            }
        },

        async loginUser(body: any) {
            try {
                await connectMongo();

                // Prepare the query to search by email or username
                const query = {
                    $or: [
                        { email: body.emailOrUsername?.toLowerCase() },
                        { user_name: body.emailOrUsername }
                    ]
                };

                const userFound = await userModel.findOne(query);

                if (!userFound) {
                    return formatErrorResponse(404, "User not found");
                }

                const match = await compare(body.password, userFound.password);

                if (typeof match !== "boolean") {
                    return formatErrorResponse(400, "Bcrypt Error: Password Checking");
                }

                if (!match) {
                    return formatErrorResponse(401, "Incorrect password");
                }

                return formatJSONResponse({ userFound });

            } catch (e) {
                console.log(e);
                return formatJSONResponse({
                    messages: [{ error: e }]
                });
            }
        },
    

        async getUserById(id: string){
            try {
                await connectMongo();
                console.log(id);

                const userFound = await userModel.findById(id as ObjectId);
                console.log("userFound")
                console.log(userFound)
                if (!userFound) {
                    return formatErrorResponse(404, "User Not Found");
                }

                // this is used to filter out any fields we dont want to return like (password), we can also query other collections here if needed moving forward
                const userResultFound = await userModel.aggregate([
                    {
                        $match: {
                            _id: new ObjectId(id as string),
                        },
                    },
                    {
                        $project: {
                            email: 1,
                            display_name: 1,
                            user_name: 1,
                            profile_type: 1,
                            profile_pic: 1,
                            spotify_url: 1,
                            bio: 1
                        },
                    },
                ]);

                if (userResultFound.length === 0) {
                    return formatErrorResponse(404, "User Not Found");
                }

                return formatJSONResponse({ user: userResultFound[0] });
            } catch (e) {
                console.log(e);
                return formatJSONResponse({
                messages: [{ error: e }]
                });
            }
        },

        async findUsersByUsername(username: string) {
            try {
                await connectMongo();
        
                // Regular expression to match the start of the username or display name
                const regex = new RegExp("^" + username, "i"); // "i" for case-insensitive

                const users = await userModel.find(
                    {
                        $or: [
                            { user_name: regex },
                            { display_name: regex }
                        ]
                    },
                    {
                        _id: 1,
                        display_name: 1,
                        user_name: 1,
                        profile_pic: 1
                    } // Projection
                );

        
                if (users.length === 0) {
                    return formatErrorResponse(404, "No users found");
                }
        
                return formatJSONResponse({ users });
            } catch (e) {
                console.log(e);
                return formatErrorResponse(500, "Server Error");
            }
        },

        async getExactUserByUsername(username: string) {
            try {
                await connectMongo();
                console.log(username);
        
                // Case-insensitive search for user_name with specific fields in the projection
                const userFound = await userModel.findOne(
                    { user_name: { $regex: new RegExp("^" + username + "$", "i") } },
                    { 
                        _id: 1,
                        display_name: 1, 
                        user_name: 1, 
                        profile_pic: 1,
                        bio: 1,
                        profile_type: 1,
                        spotify_url: 1,
                        topArtists: 1,
                        topGenres: 1
                    } // Projection
                );

                if (!userFound) {
                    return formatErrorResponse(404, "User Not Found");
                }

                return formatJSONResponse({ user: userFound });
            } catch (e) {
                console.log(e);
                return formatJSONResponse({
                    messages: [{ error: e }]
                });
            }
        },
        
        async updateUserSpotifyCreds(id: string, access_token: string, refresh_token: string){
            try {
                await connectMongo();
                console.log("id printed below");
                console.log(id);

                const userFound = await userModel.findById(id as ObjectId);
                console.log("userFound")
                console.log(userFound)
                if (!userFound) {
                    return formatErrorResponse(404, "User Not Found");
                }

                userFound.spotify_credentials.access_token = access_token;
                userFound.spotify_credentials.refresh_token = refresh_token;

                await userFound.save();

                return formatJSONResponse({
                    msg: "User Spotify Creds Reset",
                });
            } catch (e) {
                console.log(e);
                return formatJSONResponse({
                messages: [{ error: e }]
                });
            }
        },

        async updateUserInfo(userId: string, updateData: any) {
            try {
                await connectMongo();
                console.log("Updating user with ID: ", userId);

                const userFound = await userModel.findById(userId as ObjectId);
                if (!userFound) {
                    return formatErrorResponse(404, "User Not Found");
                }

                // Update fields if they exist in updateData
                if (updateData.display_name !== undefined) {
                    userFound.display_name = updateData.display_name;
                }
                if (updateData.user_name !== undefined) {
                    userFound.user_name = updateData.user_name;
                }
                if (updateData.profile_type !== undefined) {
                    userFound.profile_type = updateData.profile_type;
                }
                if (updateData.spotify_url !== undefined) {
                    userFound.spotify_url = updateData.spotify_url;
                }
                if (updateData.profile_pic !== undefined) {
                    userFound.profile_pic = updateData.profile_pic;
                }
                if (updateData.bio !== undefined) {
                    userFound.bio = updateData.bio;
                }

                // Add more fields as necessary

                await userFound.save();

                return formatJSONResponse({
                    msg: "User Info Updated",
                });
            } catch (e) {
                console.log(e);
                return formatJSONResponse({
                    messages: [{ error: e }]
                });
            }
        },

        async checkEmailExists(email: string) {
            try {
                await connectMongo();
                const emailExists = await userModel.exists({ email: email.toLowerCase() });
                return formatJSONResponse({ emailExists: !!emailExists });
            } catch (e) {
                console.log(e);
                return formatErrorResponse(500, "Server Error");
            }
        },

        async checkUsernameExists(username: string) {
            try {
                await connectMongo();
                const userExists = await userModel.exists({ user_name: new RegExp("^" + username + "$", "i") });
                return formatJSONResponse({ usernameExists: !!userExists });
            } catch (e) {
                console.log(e);
                return formatErrorResponse(500, "Server Error");
            }
        }
        
        
      
    }

    return dao
}

export default userDAO;