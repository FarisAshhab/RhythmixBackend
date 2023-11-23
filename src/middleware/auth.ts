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
        console.error("Error in encryption:", e);
        throw new Error('Encryption error');
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
        console.error("Error in decryption:", e);
        throw new Error('decryption error');
    }
};


/**
 * Generates a random string of specified length.
 * This is used for generating a state parameter in the Spotify login process
 * to prevent CSRF attacks.
 *
 * @param {number} length - The desired length of the random string.
 * @returns {string} A random string of the specified length.
 */
export const generateRandomString = (length: number): string => {
    try {
        return crypto.randomBytes(Math.ceil(length / 2))
            .toString('hex')  // Convert to hexadecimal format
            .slice(0, length);  // Return the required number of characters
    } catch (e) {
        console.error("Error generating random string:", e);
        throw new Error('Failed to generate random string');
    }
};