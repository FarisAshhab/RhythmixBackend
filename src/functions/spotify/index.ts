import { handlerPath } from '@libs/handler-resolver';
import {
	refreshUserSpotifyTokenSchema,
    fetchMostRecentSongSchema
} from "./schema";

/*
	post method to refresh a user spotify creds
	link : https://rkmg39eisf.execute-api.us-east-1.amazonaws.com/dev/user/login
*/
export const refreshUserSpotifyToken = {
	handler: `${handlerPath(__dirname)}/handler.REFRESH_USER_SPOTIFY_CREDS`,
	events: [
		{
			http: {
				method: "post",
				path: "rhythmix/spotify/refreshUserSpotifyCreds",
				cors: true,
				request: {
					schemas: {
						"application/json": refreshUserSpotifyTokenSchema,
					},
				},
			},
		},
	],
};


/*
	post method to fetch users most recent played song
	link : https://rkmg39eisf.execute-api.us-east-1.amazonaws.com/dev/user/login
*/
export const fetchMostRecentSong = {
	handler: `${handlerPath(__dirname)}/handler.FETCH_MOST_RECENT_SONG`,
	events: [
		{
			http: {
				method: "post",
				path: "rhythmix/spotify/fetchMostRecentSong",
				cors: true,
				request: {
					schemas: {
						"application/json": fetchMostRecentSongSchema,
					},
				},
			},
		},
	],
};


export const spotifyLogin = {
    handler: `${handlerPath(__dirname)}/handler.SPOTIFY_LOGIN`,
    events: [
      {
        http: {
          method: 'get',
          path: 'rhythmix/spotify/login',
          cors: true
        },
      },
    ],
  };