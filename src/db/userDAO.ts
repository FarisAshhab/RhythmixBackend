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
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";

import { default as userModel } from "./models/User";

dotenv.config()
const DB_BASE = MONGO_URL


function userDAO() {

    let dao = {
      
      async createUser(body: any) {
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
                first_name: body?.first_name, 
                last_name: body?.last_name,
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
                data.spotify_credentials.access_token = body?.access_token
                data.spotify_credentials.refresh_token = body?.refresh_token
            }
            // if s3 image_url is present (profile_pic) - add it
            if (body?.profile_pic){
                data.profile_pic = body.profilePic;
            }
            // if bio is present - add it
            if (body?.bio){
                data.bio = body.bio;
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

            console.log(body.email);
            const userFound = await userModel.findOne({
                email: body.email.toLowerCase(),
            });

            console.log(userFound);
            
            if (!userFound) {
                return formatErrorResponse(404, "Email Not Found");
            }

            const match = await compare(body.password, userFound.password);

            if (typeof match !== "boolean") {
                return formatErrorResponse(400, "Bcrypt Error: Password Checking");
            }

            if (!match) {
                return formatErrorResponse(401, "Password not authorized");
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
                        first_name: 1,
                        last_name: 1,
                        display_name: 1,
                        user_name: 1,
                        profile_type: 1,
                        profile_pic: 1,
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
      }
      
    }

    return dao
}

export default userDAO;