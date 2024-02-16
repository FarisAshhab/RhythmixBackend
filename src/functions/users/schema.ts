
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
	This schema is to be followed when searching for a users followers list
*/
export const getUserFollowersSchema = {
	type: "object",
	properties: {
		userId: { type: "string" }, 
		token: { type: "string" }
	},
	required: [
		"userId",
		"token"
	],
} as const;

/*
	This schema is to be followed when searching for a users following list
*/
export const getUserFollowingSchema = {
	type: "object",
	properties: {
		userId: { type: "string" }, 
		token: { type: "string" }
	},
	required: [
		"userId",
		"token"
	],
} as const;

/*
	This schema is to be followed when searching for users by usernames or displaynames'
*/
export const getExactUserByIdSchema = {
	type: "object",
	properties: {
		getUser: { type: "string" }, 
		token: { type: "string" }
	},
	required: [
		"getUser",
		"token"
	],
} as const;


/*
	This schema is to be followed when following/unfollowing a user
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


/*
    This schema is to be followed when fetching posts for a user
*/
export const fetchPostsSchema = {
    type: "object",
    properties: {
        userID: { type: "string" }, // ID of the user whose feed is being fetched
        lastPostTimestamp: { type: "string", format: "date-time" }, // Optional, used for pagination
        limit: { type: "number" }, // Optional, number of posts to fetch
        token: { type: "string" }
    },
    required: [
        "token",
        "userID"
    ],
} as const;


/*
    This schema is to be followed when liking or unliking a post
*/
export const likeUnlikePostSchema = {
    type: "object",
    properties: {
        userId: { type: "string" }, // ID of the user liking/unliking the post
        postId: { type: "string" }, // ID of the post being liked/unliked
		token: { type: "string" }
    },
    required: ["userId", "postId", "token"],
} as const;

/*
    This schema is to be followed when commenting on a post
*/
export const commentPostSchema = {
    type: "object",
    properties: {
        userId: { type: "string" },
        postId: { type: "string" },
        text: { type: "string" },
		token: { type: "string" }
    },
    required: ["userId", "postId", "text", "token"],
} as const;


/*
    This schema is to be followed when fetching notifications for a user
*/
export const fetchNotificationsSchema = {
    type: "object",
    properties: {
        userID: { type: "string" }, // ID of the user whose notifications are being fetched
        lastNotificationTimestamp: { type: "string", format: "date-time" }, // Optional, used for pagination to fetch older notifications
        limit: { type: "number" }, // Optional, number of notifications to fetch, defaulting to a predefined value if not specified
        token: { type: "string" } // Authentication token to verify the user's identity
    },
    required: [
        "token",
        "userID"
    ],
} as const;

