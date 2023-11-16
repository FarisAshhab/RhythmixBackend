
/*
	This schema is to be followed when a user is created
*/
export const addUserSchema = {
	type: "object",
	properties: {
		first_name: { type: "string" },
		last_name: { type: "string" },
        display_name: { type: "string" },
		user_name: { type: "string" },
		profile_type: { type: "string" },
		email: { type: "string", format: "email" },
		phone_number: { type: "string" },
		password: { type: "string" },
        bio: { type:"string" }
	},
	required: [
		"first_name",
		"last_name",
        "display_name",
        "user_name",
		"email",
		"password",
        "profile_type"
	],
} as const;


/*
	This schema is to be followed when a user is logging in
*/
export const loginUserSchema = {
	type: "object",
	properties: {
		email: { type: "string", format: "email" },
		password: { type: "string" },
	},
	required: ["email", "password"],
} as const;