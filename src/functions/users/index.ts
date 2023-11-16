import { handlerPath } from '@libs/handler-resolver';
import {
	addUserSchema,
	loginUserSchema
} from "./schema";

export const addUser = {
	handler: `${handlerPath(__dirname)}/handler.ADD_USER`,
	events: [
		{
			http: {
				method: "post",
				path: "rhythmix/addUser",
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

export const getUserByToken = {
	handler: `${handlerPath(__dirname)}/handler.GET_USER`,
	events: [
		{
			http: {
				method: "get",
				path: "rhythmix/getUser/{token}",
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
	post method to login a user
	link : https://rkmg39eisf.execute-api.us-east-1.amazonaws.com/dev/user/login
*/
export const loginUser = {
	handler: `${handlerPath(__dirname)}/handler.LOGIN`,
	events: [
		{
			http: {
				method: "post",
				path: "rhythmix/login",
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




