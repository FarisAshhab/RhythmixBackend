import {
    formatJSONResponse,
	formatErrorResponse,
	ValidatedEventAPIGatewayProxyEvent,
} from "@libs/api-gateway";
import { middyfy } from '@libs/lambda';
import { auth } from "src/middleware/auth";
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import AwsService from "../../service/Aws/AwsService"
import userDAO from "src/db/userDAO";
import {
	addUserSchema,
	loginUserSchema
} from './schema';

const userDao = userDAO()
const awsService = AwsService()


const addUser: ValidatedEventAPIGatewayProxyEvent<
	typeof addUserSchema
> = async (event, context) => {
	try {
		context.callbackWaitsForEmptyEventLoop = false;
		console.log(event.body);
		const userFound = await userDao.createUser(event.body)
		console.log(userFound)
		let userInfo = JSON.parse(userFound.body)
		console.log("userInfo")
		console.log(userInfo)
		const payload = {
			user: {
				id: userInfo.savedUser._id,
			},
		};
		const secretKey = await awsService.fetchCredential("JWT_SECRETKEY");
		const token = await sign(payload, secretKey, {
			expiresIn: '7d', // will change to '365d' after we test a shorter timeframe for token and make sure it works
		});
		console.log("token being printed under");
		console.log(token)

		if (typeof token !== "string") {
			return formatErrorResponse(400, "JWT Error: Tokenizing");
		}

		return formatJSONResponse({ token });
	} catch (e) {
		console.log(e);
		return formatJSONResponse({
		messages: [{ error: e }]
		});
	}
};


/*
	tasks: fetches user 
	returns: user object or error
	params: event and context
*/
const getUserByToken: ValidatedEventAPIGatewayProxyEvent<any> = async (
	event,
	context
) => {
	try {
		const authenticatedEvent = await auth(event);
		if (!authenticatedEvent || !authenticatedEvent.body) {
			return formatErrorResponse(401, "Token is not valid");
		}
		context.callbackWaitsForEmptyEventLoop = false;
		const userFound = await userDao.getUserById(authenticatedEvent.body)
		return formatJSONResponse({ user: userFound });
	} catch (e) {
		console.log(e);
		return formatJSONResponse({
		messages: [{ error: e }]
		});
	}
};

const loginUser: ValidatedEventAPIGatewayProxyEvent<
	typeof loginUserSchema
> = async (event, context) => {
	try {
		context.callbackWaitsForEmptyEventLoop = false;
		const userFound = await userDao.loginUser(event.body)
		console.log("userFound::::")
		console.log(userFound)
		let userInfo = JSON.parse(userFound.body)
		const payload = {
			user: {
				id: userInfo.userFound._id,
			},
		};

		const secretKey = await awsService.fetchCredential("JWT_SECRETKEY");
		const token = await sign(payload, secretKey, {
			expiresIn: '7d', // will change to '365d' after we test a shorter timeframe for token and make sure it works
		});
		console.log("token being printed under");
		console.log(token)

		if (typeof token !== "string") {
			return formatErrorResponse(400, "JWT Error: Tokenizing");
		}

		// we need to log that a user logged in and at what time, will have to create a logging API for this - Not crucial now
		return formatJSONResponse({ token });

	} catch (e) {
		console.log(e);
		return formatJSONResponse({
		messages: [{ error: e }]
		});
	}
};


export const ADD_USER = middyfy(addUser);
export const GET_USER = middyfy(getUserByToken);
export const LOGIN = middyfy(loginUser);