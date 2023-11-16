import { verify } from "jsonwebtoken";
import AwsService from "../service/Aws/AwsService"

const awsService = AwsService()

interface JWTData {
	user: {
		id: string;
	};
}

export const auth = async (event) => {
	try {
		let decoded;
        const secretKey = await awsService.fetchCredential("JWT_SECRETKEY");
		if (event.httpMethod === "GET") {
			decoded = verify(event.pathParameters.token, secretKey);
			event.body = (decoded as JWTData).user.id;
		} else {
			decoded = verify(event.body.token, secretKey);
			event.body.user = (decoded as JWTData).user.id;
		}
	} catch (error) {
		console.log("Unauthorized Token");
	}
	return event;
};