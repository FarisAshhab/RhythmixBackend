import { handlerPath } from '@libs/handler-resolver';
import {
	refreshUserSpotifyTokenSchema,
    fetchMostRecentSongSchema,
	fetchProfileSpotifyInfoSchema,
	fetchTopArtistsAndGenresSchema
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
	link : 
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

/*
	post method to fetch users top 5 tracks of the week
	link : 
*/
export const fetchTopWeeklyTracks = {
	handler: `${handlerPath(__dirname)}/handler.FETCH_TOP_WEEKLY_TRACKS`,
	events: [
		{
			http: {
				method: "post",
				path: "rhythmix/spotify/fetchTopWeeklyTracks",
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

/*
	post method to fetch users top artists and genres
	link : 
*/
export const fetchWeeklyTopArtistsAndGenres = {
	handler: `${handlerPath(__dirname)}/handler.FETCH_TOP_ARTISTS_GENRES`,
	events: [
		{
			http: {
				method: "post",
				path: "rhythmix/spotify/fetchTopArtistsGenres",
				cors: true,
				request: {
					schemas: {
						"application/json": fetchTopArtistsAndGenresSchema,
					},
				},
			},
		},
	],
};


/*
	post method to fetch users info from spotify account to pre populate sign up form
	link : 
*/
export const fetchProfileSpotifyInfo = {
	handler: `${handlerPath(__dirname)}/handler.FETCH_PROFILE_SPOTIFY_INFO`,
	events: [
		{
			http: {
				method: "post",
				path: "rhythmix/spotify/fetchProfileSpotifyInfo",
				cors: true,
				request: {
					schemas: {
						"application/json": fetchProfileSpotifyInfoSchema,
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


export const spotifyCallback = {
	handler: `${handlerPath(__dirname)}/handler.SPOTIFY_CALLBACK`,
	events: [
	  {
		http: {
		  method: 'get',
		  path: 'rhythmix/spotify/callback',
		  cors: true
		},
	  },
	],
};