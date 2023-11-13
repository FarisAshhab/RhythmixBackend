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
        
            // const payload = {
            //     user: {
            //         id: savedUser.id,
            //     },
            // };
        
            // const token = await sign(payload, KEYS["secretKey"], {
            //     expiresIn: 36000,
            // });
        
            // if (typeof token !== "string") {
            //     return formatErrorResponse(400, "JWT Error: Tokenizing");
            // }
        
            // return formatJSONResponse({ token });
            return formatJSONResponse({ savedUser });
        
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