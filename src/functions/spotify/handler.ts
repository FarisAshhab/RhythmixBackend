import {
    formatJSONResponse,
	formatErrorResponse,
	ValidatedEventAPIGatewayProxyEvent,
} from "@libs/api-gateway";
import { middyfy } from '@libs/lambda';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AwsService from "../../service/Aws/AwsService"
import SpotifyService from "../../service/Spotify/SpotifyService"
import { auth, decrypt, encrypt, generateRandomString } from "src/middleware/auth";
import userDAO from "src/db/userDAO";
import postDAO from "src/db/postDAO";
import {
    refreshUserSpotifyTokenSchema,
    fetchMostRecentSongSchema,
	fetchProfileSpotifyInfoSchema,
	fetchTopArtistsAndGenresSchema
} from './schema';

const userDao = userDAO()
const spotifyService = SpotifyService()
const postDao = postDAO()


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
		return formatJSONResponse({ user: userInfo.msg, accessToken: encryptedAccess_token });
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
		const postCreated = await postDao.createPost(event.body.user, mostRecentSong)

		return formatJSONResponse({ post: postCreated });
	} catch (e) {
		console.log(e);
		return formatJSONResponse({
		messages: [{ error: e }]
		});
	}
};

const fetchWeeklyTopArtistsAndGenres: ValidatedEventAPIGatewayProxyEvent<
	typeof fetchTopArtistsAndGenresSchema
> = async (event, context) => {
	try {
        // *we don't need session auth check here since we will be calling this from separate backend - not from frontend*
        const decryptedAccessToken = await decrypt(event.body.access_token);
		const topArtistsAndGenres = await spotifyService.getTopArtistsAndGenres(decryptedAccessToken);
        console.log(topArtistsAndGenres)
        console.log(event.body.user)
		const userUpdated = await userDao.updateUserInfo(event.body.user, topArtistsAndGenres);
		let userInfo = JSON.parse(userUpdated.body);
		return formatJSONResponse({ updatedUserArtistsAndGenres: userInfo.msg });
	} catch (e) {
		console.log(e);
		return formatJSONResponse({
		messages: [{ error: e }]
		});
	}
};

const fetchProfileSpotifyInfo: ValidatedEventAPIGatewayProxyEvent<
	typeof fetchProfileSpotifyInfoSchema
> = async (event, context) => {
	try {
        // *we don't need session auth check here since we will be calling this prior to having the account created in db so we wont have a session*
		// spotify token won't be encrypted when passed into here from frontend since it will be called directly after the user authorizes spotify
		const profileInfo = await spotifyService.getProfileSpotifyInfo(event.body.access_token);
        console.log(profileInfo);
		return formatJSONResponse({ profile: profileInfo });
	} catch (e) {
		console.log(e);
		return formatJSONResponse({
		messages: [{ error: e }]
		});
	}
};

const spotifyLogin: ValidatedEventAPIGatewayProxyEvent<any> = async (): Promise<APIGatewayProxyResult> => {
    try {
      const state = generateRandomString(16);
      const spotifyAuthUrl = await spotifyService.createLoginURL(state);
  
      return {
        statusCode: 302,
        headers: {
          'Set-Cookie': `spotify_auth_state=${state}; Secure; HttpOnly; Path=/; Max-Age=3600`,
          Location: spotifyAuthUrl
        },
        body: JSON.stringify({}) // Body is required, even if it's empty
      };
    } catch (error) {
      console.error('Login Error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Internal Server Error' })
      };
    }
  };

  const spotifyCallback: ValidatedEventAPIGatewayProxyEvent<any> = async (event): Promise<APIGatewayProxyResult> => {
	try {
	  const code = event.queryStringParameters?.code || '';
	  const state = event.queryStringParameters?.state || '';
  
	  //logic to verify the state value
	  const tokens = await spotifyService.exchangeCodeForTokens(code);
	  
	  
  
	  return {
		statusCode: 302,
		headers: {
		  Location: `http://localhost:8888/register/#access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`,
		},
		body: JSON.stringify({})
	  };
	} catch (error) {
	  console.error('Callback Error:', error);
	  return {
		statusCode: 500,
		body: JSON.stringify({ error: 'Internal Server Error' })
	  };
	}
  };
  


export const REFRESH_USER_SPOTIFY_CREDS = middyfy(refreshUserSpotifyToken);
export const FETCH_MOST_RECENT_SONG = middyfy(fetchMostRecentSong);
export const FETCH_TOP_ARTISTS_GENRES = middyfy(fetchWeeklyTopArtistsAndGenres);
export const FETCH_PROFILE_SPOTIFY_INFO = middyfy(fetchProfileSpotifyInfo);
export const SPOTIFY_LOGIN = middyfy(spotifyLogin);
export const SPOTIFY_CALLBACK = middyfy(spotifyCallback);