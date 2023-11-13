import { handlerPath } from '@libs/handler-resolver';
import {
	addUserSchema
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

