import {
    formatJSONResponse,
	formatErrorResponse,
	ValidatedEventAPIGatewayProxyEvent,
} from "@libs/api-gateway";
import { middyfy } from '@libs/lambda';
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import AwsService from "../../service/Aws/AwsService"
import {addUserSchema} from './schema';
import userDAO from "src/db/userDAO";

const userDao = userDAO()
const awsService = AwsService()


const addUser: ValidatedEventAPIGatewayProxyEvent<
	typeof addUserSchema
> = async (event, context) => {
	
	context.callbackWaitsForEmptyEventLoop = false;
    console.log(event.body);
	const userFound = await userDao.createUser(event.body)
    console.log(userFound)
	// await connectMongo();
	
	// const userFound = await userModel.findOne({
	// 	email: event.body.email.toLowerCase(),
	// });

	// if (userFound) {
	// 	return formatErrorResponse(409, "User Already Exists");
	// }

	// const passwordhash = await hash(event.body.password, 10);

	// if (typeof passwordhash !== "string") {
	// 	return formatErrorResponse(400, "Bcrypt Error: Password hashing");
	// }

    // const savedUser = await userModel.findOne({
	// 	email: event.body.email.toLowerCase(),
	// });

	// if (!savedUser) {
	// 	return formatErrorResponse(500, "Server Error. Please try logging in.");
	// }

	// const payload = {
	// 	user: {
	// 		id: savedUser.id,
	// 	},
	// };

	// const token = await sign(payload, KEYS["secretKey"], {
	// 	expiresIn: 36000,
	// });

	// if (typeof token !== "string") {
	// 	return formatErrorResponse(400, "JWT Error: Tokenizing");
	// }

	return formatJSONResponse({ user: userFound });
};

export const ADD_USER = middyfy(addUser);