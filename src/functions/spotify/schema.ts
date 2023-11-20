/*
	This schema is to be followed when a user's spotify creds are refreshed in database'
*/
export const refreshUserSpotifyTokenSchema = {
	type: "object",
	properties: {
		refresh_token: { type: "string" },
		user: { type: "string" }
	},
	required: [
        "refresh_token",
		"user"
	],
} as const;


/*
	This schema is to be followed when a fetching user's most recent played song
*/
export const fetchMostRecentSongSchema = {
	type: "object",
	properties: {
		access_token: { type: "string" },
		user: { type: "string" }
	},
	required: [
        "access_token",
		"user"
	],
} as const;