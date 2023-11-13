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