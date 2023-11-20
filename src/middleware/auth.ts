import { verify } from "jsonwebtoken";
import * as crypto from 'crypto';
import AwsService from "../service/Aws/AwsService"

const awsService = AwsService()
const IV_LENGTH = 16

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

export const encrypt = async (text: any) => {
	try {
        console.log("encrypting text")
        console.log(text)
        const ENCRYPTION_KEY = await awsService.fetchCredential("ENCRYPTION_KEY");
		let iv = crypto.randomBytes(IV_LENGTH);
        let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
        let encrypted = cipher.update(text);

        encrypted = Buffer.concat([encrypted, cipher.final()]);

        return iv.toString('hex') + ':' + encrypted.toString('hex');
	} catch (e) {
		console.log("Error in encrypting");
        console.log(e)
        return "Error in encrypting"
	}
};


export const decrypt = async (text: any) => {
	try {
        const ENCRYPTION_KEY = await awsService.fetchCredential("ENCRYPTION_KEY");
		let textParts = text.split(':');
        let iv = Buffer.from(textParts.shift(), 'hex');
        let encryptedText = Buffer.from(textParts.join(':'), 'hex');
        let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
        let decrypted = decipher.update(encryptedText);

        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted.toString();
	} catch (e) {
		console.log("Error decrypting");
        console.log(e)
        return 'Error decrypting'
	}
};