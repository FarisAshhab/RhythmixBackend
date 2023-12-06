import { handlerPath } from '@libs/handler-resolver';
import {
	addUserSchema,
	loginUserSchema,
	updateUserSpotifyCredsSchema,
	updateUserProfileSchema,
	getUsersByUserNameSchema,
	followUserSchema,
	fetchPendingFollowRequestsSchema,
	acceptFollowRequestSchema,
	getExactUserByIdSchema,
	getUserFollowersSchema,
	getUserFollowingSchema,
	fetchPostsSchema
} from "./schema";

export const addUser = {
	handler: `${handlerPath(__dirname)}/handler.ADD_USER`,
	events: [
		{
			http: {
				method: "post",
				path: "rhythmix/user/addUser",
				cors: true,
				request: {
					schemas: {
						"application/json": addUserSchema,
					},
				},
			},
		},
	],
};

/*
	get method to fetch user by session token (current user)
	link : 
*/
export const getUserByToken = {
	handler: `${handlerPath(__dirname)}/handler.GET_USER`,
	events: [
		{
			http: {
				method: "get",
				path: "rhythmix/user/getUser/{token}",
				cors: true,
				request: {
					parameters: {
						paths: {
							token: true,
						},
					},
				},
			},
		},
	],
};

/*
	post method to fetch users by username
	link : 
*/
export const getUsersByUserName = {
	handler: `${handlerPath(__dirname)}/handler.GET_USERS_SEARCH`,
	events: [
		{
			http: {
				method: "post",
				path: "rhythmix/user/searchUsers",
				cors: true,
				request: {
					schemas: {
						"application/json": getUsersByUserNameSchema,
					},
				},
			},
		},
	],
};

/*
	post method to fetch users by username
	link : 
*/
export const getExactUserById = {
	handler: `${handlerPath(__dirname)}/handler.GET_EXACT_USER_SEARCH`,
	events: [
		{
			http: {
				method: "post",
				path: "rhythmix/user/searchExactUser",
				cors: true,
				request: {
					schemas: {
						"application/json": getExactUserByIdSchema,
					},
				},
			},
		},
	],
};

/*
	post method to login a user
	link : https://rkmg39eisf.execute-api.us-east-1.amazonaws.com/dev/user/login
*/
export const loginUser = {
	handler: `${handlerPath(__dirname)}/handler.LOGIN`,
	events: [
		{
			http: {
				method: "post",
				path: "rhythmix/user/login",
				cors: true,
				request: {
					schemas: {
						"application/json": loginUserSchema,
					},
				},
			},
		},
	],
};

/*
	post method to update a user spotify creds
	link : https://rkmg39eisf.execute-api.us-east-1.amazonaws.com/dev/user/login
*/
export const updateUserSpotifyCreds = {
	handler: `${handlerPath(__dirname)}/handler.UPDATE_USER_SPOTIFY_CREDS`,
	events: [
		{
			http: {
				method: "post",
				path: "rhythmix/user/updateSpotifyCreds",
				cors: true,
				request: {
					schemas: {
						"application/json": updateUserSpotifyCredsSchema,
					},
				},
			},
		},
	],
};


/*
	post method to follow a user
	link : https://rkmg39eisf.execute-api.us-east-1.amazonaws.com/dev/user/login
*/
export const followUser = {
	handler: `${handlerPath(__dirname)}/handler.FOLLOW_USER`,
	events: [
		{
			http: {
				method: "post",
				path: "rhythmix/user/followUser",
				cors: true,
				request: {
					schemas: {
						"application/json": followUserSchema,
					},
				},
			},
		},
	],
};

/*
	post method to unfollow a user
	link : https://rkmg39eisf.execute-api.us-east-1.amazonaws.com/dev/user/login
*/
export const unfollowUser = {
	handler: `${handlerPath(__dirname)}/handler.UNFOLLOW_USER`,
	events: [
		{
			http: {
				method: "post",
				path: "rhythmix/user/unfollowUser",
				cors: true,
				request: {
					schemas: {
						"application/json": followUserSchema,
					},
				},
			},
		},
	],
};

/*
	post method fetch all pending requests for a user
	link : https://rkmg39eisf.execute-api.us-east-1.amazonaws.com/dev/user/login
*/
export const fetchPendingFollowRequests = {
	handler: `${handlerPath(__dirname)}/handler.FETCH_PENDING_FOLLOW_REQUESTS`,
	events: [
		{
			http: {
				method: "post",
				path: "rhythmix/user/fetchPendingRequests",
				cors: true,
				request: {
					schemas: {
						"application/json": fetchPendingFollowRequestsSchema,
					},
				},
			},
		},
	],
};

/*
	post method to accept a follow request to a private user by requestId
	link : 
*/
export const acceptFollowRequest = {
	handler: `${handlerPath(__dirname)}/handler.ACCEPT_FOLLOW_REQUEST`,
	events: [
		{
			http: {
				method: "post",
				path: "rhythmix/user/acceptFollowRequest",
				cors: true,
				request: {
					schemas: {
						"application/json": acceptFollowRequestSchema,
					},
				},
			},
		},
	],
};


/*
	post method to reject a follow request
	link : 
*/
export const rejectFollowRequest = {
	handler: `${handlerPath(__dirname)}/handler.REJECT_FOLLOW_REQUEST`,
	events: [
		{
			http: {
				method: "post",
				path: "rhythmix/user/rejectFollowRequest",
				cors: true,
				request: {
					schemas: {
						"application/json": acceptFollowRequestSchema,
					},
				},
			},
		},
	],
};

/*
	post method to cancel a follow request
	link : 
*/
export const cancelFollowRequest = {
	handler: `${handlerPath(__dirname)}/handler.CANCEL_FOLLOW_REQUEST`,
	events: [
		{
			http: {
				method: "post",
				path: "rhythmix/user/cancelFollowRequest",
				cors: true,
				request: {
					schemas: {
						"application/json": acceptFollowRequestSchema,
					},
				},
			},
		},
	],
};

/*
	post method to fetch users followers
	link : 
*/
export const getUserFollowers = {
	handler: `${handlerPath(__dirname)}/handler.GET_USER_FOLLOWERS`,
	events: [
		{
			http: {
				method: "post",
				path: "rhythmix/user/getUserFollowers",
				cors: true,
				request: {
					schemas: {
						"application/json": getUserFollowersSchema,
					},
				},
			},
		},
	],
};

/*
	post method to fetch users following
	link : 
*/
export const getUserFollowing = {
	handler: `${handlerPath(__dirname)}/handler.GET_USER_FOLLOWING`,
	events: [
		{
			http: {
				method: "post",
				path: "rhythmix/user/getUserFollowing",
				cors: true,
				request: {
					schemas: {
						"application/json": getUserFollowingSchema,
					},
				},
			},
		},
	],
};


/*
	post method to update a user object in DB
	link : https://rkmg39eisf.execute-api.us-east-1.amazonaws.com/dev/user/login
*/
export const updateUserProfile = {
	handler: `${handlerPath(__dirname)}/handler.UPDATE_USER_ACCOUNT`,
	events: [
		{
			http: {
				method: "post",
				path: "rhythmix/user/updateAccountInfo",
				cors: true,
				request: {
					schemas: {
						"application/json": updateUserProfileSchema,
					},
				},
			},
		},
	],
};


/*
	get method to check if email passed exists
	link : 
*/
export const checkIfEmailExists = {
	handler: `${handlerPath(__dirname)}/handler.CHECK_EMAIL_EXISTS`,
	events: [
		{
			http: {
				method: "get",
				path: "rhythmix/user/checkEmail/{email}",
				cors: true,
				request: {
					parameters: {
						paths: {
							email: true,
						},
					},
				},
			},
		},
	],
};


/*
	get method to check if username passed exists
	link : 
*/
export const checkIfUserNameExists = {
	handler: `${handlerPath(__dirname)}/handler.CHECK_USERNAME_EXISTS`,
	events: [
		{
			http: {
				method: "get",
				path: "rhythmix/user/checkUserName/{username}",
				cors: true,
				request: {
					parameters: {
						paths: {
							username: true,
						},
					},
				},
			},
		},
	],
};


/*
    post method to fetch posts for a user's feed
    link : [your API link]
*/
export const fetchPosts = {
    handler: `${handlerPath(__dirname)}/handler.FETCH_POSTS`,
    events: [
        {
            http: {
                method: "post",
                path: "rhythmix/user/fetchPosts",
                cors: true,
                request: {
                    schemas: {
                        "application/json": fetchPostsSchema,
                    },
                },
            },
        },
    ],
};


/*
    post method to fetch posts for a user's profile
    link : [your API link]
*/
export const fetchUserProfilePosts = {
    handler: `${handlerPath(__dirname)}/handler.FETCH_USER_PROFILE_POSTS`,
    events: [
        {
            http: {
                method: "post",
                path: "rhythmix/user/fetchUserProfilePosts",
                cors: true,
                request: {
                    schemas: {
                        "application/json": fetchPostsSchema,
                    },
                },
            },
        },
    ],
};


