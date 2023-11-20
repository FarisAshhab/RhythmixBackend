import {
    formatJSONResponse,
	formatErrorResponse,
	ValidatedEventAPIGatewayProxyEvent,
} from "@libs/api-gateway";
import { middyfy } from '@libs/lambda';
import AwsService from "../../service/Aws/AwsService"
import SpotifyService from "../../service/Spotify/SpotifyService"
import { auth, decrypt, encrypt } from "src/middleware/auth";
import userDAO from "src/db/userDAO";
import {
    refreshUserSpotifyTokenSchema,
    fetchMostRecentSongSchema
} from './schema';

const userDao = userDAO()
const spotifyService = SpotifyService()


const refreshUserSpotifyToken: ValidatedEventAPIGatewayProxyEvent<
	typeof refreshUserSpotifyTokenSchema
> = async (event, context) => {
	try {
        // *we don't need session auth check here since we will be calling this from separate backend - not from frontend*
		// const authenticatedEvent = await auth(event);
		// if (!authenticatedEvent || !authenticatedEvent.body) {
		// 	return formatErrorResponse(401, "Token is not valid");
		// }
		// context.callbackWaitsForEmptyEventLoop = false;
		// console.log(event.body);
        const decryptedRefreshToken = await decrypt(event.body.refresh_token);
		const refreshedToken = await spotifyService.refreshSpotifyToken(decryptedRefreshToken);
        let encryptedAccess_token: string;
		let encryptedRefresh_token: string;
		if (refreshedToken.access_token){
			encryptedAccess_token = await encrypt(refreshedToken.access_token);
		}
		if (refreshedToken.refresh_token){
			encryptedRefresh_token = await encrypt(refreshedToken.refresh_token);
		}
		
		const userUpdated = await userDao.updateUserSpotifyCreds(event.body.user, encryptedAccess_token, encryptedRefresh_token);
		let userInfo = JSON.parse(userUpdated.body)
		return formatJSONResponse({ user: userInfo.msg });
	} catch (e) {
		console.log(e);
		return formatJSONResponse({
		messages: [{ error: e }]
		});
	}
};


const fetchMostRecentSong: ValidatedEventAPIGatewayProxyEvent<
	typeof fetchMostRecentSongSchema
> = async (event, context) => {
	try {
        // *we don't need session auth check here since we will be calling this from separate backend - not from frontend*
        const decryptedAccessToken = await decrypt(event.body.access_token);
		const mostRecentSong = await spotifyService.getMostRecentlyPlayedSong(decryptedAccessToken);
        console.log(mostRecentSong)
        console.log(event.body.user)
        // check if song is in db --> add it if not
		// create post Object in Database
		return formatJSONResponse({ mostRecentSong: mostRecentSong });
	} catch (e) {
		console.log(e);
		return formatJSONResponse({
		messages: [{ error: e }]
		});
	}
};

export const REFRESH_USER_SPOTIFY_CREDS = middyfy(refreshUserSpotifyToken);
export const FETCH_MOST_RECENT_SONG = middyfy(fetchMostRecentSong);