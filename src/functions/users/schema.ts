
/*
	This schema is to be followed when a user is created
*/
export const addUserSchema = {
	type: "object",
	properties: {
        display_name: { type: "string" },
		user_name: { type: "string" },
		profile_type: { type: "string" },
		email: { type: "string", format: "email" },
		phone_number: { type: "string" },
		password: { type: "string" },
        bio: { type:"string" },
		spotify_url: { type:"string" },
		access_token: { type: "string" },
		refresh_token: { type: "string" }
	},
	required: [
        "display_name",
        "user_name",
		"email",
		"password",
        "profile_type",
		"access_token",
		"refresh_token"
	],
} as const;


/*
	This schema is to be followed when a user is logging in
*/
export const loginUserSchema = {
	type: "object",
	properties: {
		emailOrUsername: { type: "string" },
		password: { type: "string" },
	},
	required: ["emailOrUsername", "password"],
} as const;

/*
	This schema is to be followed when a user's spotify creds are updated in database'
*/
export const updateUserSpotifyCredsSchema = {
	type: "object",
	properties: {
		access_token: { type: "string" },
		refresh_token: { type: "string" },
		token: { type: "string" }
	},
	required: [
		"access_token",
        "refresh_token",
		"token"
	],
} as const;

/*
	This schema is to be followed when searching for users by usernames or displaynames'
*/
export const getUsersByUserNameSchema = {
	type: "object",
	properties: {
		name: { type: "string" }, 
		token: { type: "string" }
	},
	required: [
		"name",
		"token"
	],
} as const;


/*
	This schema is to be followed when following a user
*/
export const followUserSchema = {
	type: "object",
	properties: {
		fromUser: { type: "string" }, 
		toUser: { type: "string" }, 
		token: { type: "string" }
	},
	required: [
		"fromUser",
		"toUser",
		"token"
	],
} as const;


/*
	This schema is to be followed when fetching pending follow requests for a user
*/
export const fetchPendingFollowRequestsSchema = {
	type: "object",
	properties: {
		userFetching: { type: "string" }, 
		token: { type: "string" }
	},
	required: [
		"token",
		"userFetching"
	],
} as const;

/*
	This schema is to be followed when fetching pending follow requests for a user
*/
export const acceptFollowRequestSchema = {
	type: "object",
	properties: {
		requestId: { type: "string" }, 
		token: { type: "string" }
	},
	required: [
		"token",
		"requestId"
	],
} as const;


/*
	This schema is to be followed when a user's profile is updated on rhythmix
*/
export const updateUserProfileSchema = {
	type: "object",
    properties: {
        data: {
            type: "object",
            properties: {
                display_name: { type: "string" },
                user_name: { type: "string" },
                profile_type: { type: "string" },
                spotify_url: { type: "string" },
                profile_pic: { type: "string" },
                bio: { type: "string" }
            },
            minProperties: 1, // Ensure at least one of the properties is present
            additionalProperties: false // Optional: set to true to allow properties not listed above
        },
        token: { type: "string" }
    },
    required: [
        "data",
        "token"
    ],
} as const;