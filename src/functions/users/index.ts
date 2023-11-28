import { handlerPath } from '@libs/handler-resolver';
import {
	addUserSchema,
	loginUserSchema,
	updateUserSpotifyCredsSchema,
	updateUserProfileSchema,
	getUsersByUserNameSchema,
	followUserSchema,
	fetchPendingFollowRequestsSchema,
	acceptFollowRequestSchema
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
export const getExactUserByUserName = {
	handler: `${handlerPath(__dirname)}/handler.GET_EXACT_USER_SEARCH`,
	events: [
		{
			http: {
				method: "post",
				path: "rhythmix/user/searchExactUser",
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
	link : https://rkmg39eisf.execute-api.us-east-1.amazonaws.com/dev/user/login
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


