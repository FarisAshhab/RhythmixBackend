import {
    formatJSONResponse,
	formatErrorResponse,
	ValidatedEventAPIGatewayProxyEvent,
} from "@libs/api-gateway";
import { middyfy } from '@libs/lambda';
import { auth, decrypt, encrypt } from "src/middleware/auth";
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import AwsService from "../../service/Aws/AwsService"
import userDAO from "src/db/userDAO";
import followRequestsDAO from "src/db/followRequestDAO";
import SpotifyService from "../../service/Spotify/SpotifyService"
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
	fetchPostsSchema,
	likeUnlikePostSchema,
	commentPostSchema,
	fetchNotificationsSchema,
	patchUserHeaderImageSchema
} from './schema';
import postDAO from "src/db/postDAO";
import commentDAO from "src/db/commentDAO";
import notificationDAO from "src/db/notificationDAO";

const userDao = userDAO()
const postDao = postDAO()
const commentDao = commentDAO()
const notificationDao = notificationDAO()
const followRequestsDao = followRequestsDAO()
const awsService = AwsService()
const spotifyService = SpotifyService()


const addUser: ValidatedEventAPIGatewayProxyEvent<
	typeof addUserSchema
> = async (event, context) => {
	try {
		context.callbackWaitsForEmptyEventLoop = false;
		console.log(event.body);
		let topArtistsAndGenres: object
		let mostRecentSong: any
		let postCreated: any
		// if spotify_creds --> add them
		if (event.body?.access_token){
			topArtistsAndGenres = await spotifyService.getTopArtistsAndGenres(event.body?.access_token);
			mostRecentSong = await spotifyService.getMostRecentlyPlayedSong(event.body?.access_token);
			console.log(mostRecentSong)
		}
		const userFound = await userDao.createUser(event.body, topArtistsAndGenres)
		console.log(userFound)
		let userInfo = JSON.parse(userFound.body)
		const payload = {
			user: {
				id: userInfo.savedUser._id,
			},
		};
		postCreated = await postDao.createPost(userInfo.savedUser._id, mostRecentSong)
		const secretKey = await awsService.fetchCredential("JWT_SECRETKEY");
		const token = await sign(payload, secretKey, {
			expiresIn: '7d', // will change to '365d' after we test a shorter timeframe for token and make sure it works
		});
		console.log("token being printed under");
		console.log(token)

		if (typeof token !== "string") {
			return formatErrorResponse(400, "JWT Error: Tokenizing");
		}

		return formatJSONResponse({ token });
	} catch (e) {
		console.log(e);
		return formatJSONResponse({
		messages: [{ error: e }]
		});
	}
};


/*
	tasks: fetches user 
	returns: user object or error
	params: event and context
*/
const getUserByToken: ValidatedEventAPIGatewayProxyEvent<any> = async (
	event,
	context
) => {
	try {
		const authenticatedEvent = await auth(event);
		if (!authenticatedEvent || !authenticatedEvent.body) {
			return formatErrorResponse(401, "Token is not valid");
		}
		context.callbackWaitsForEmptyEventLoop = false;
		const userFound = await userDao.getUserById(authenticatedEvent.body)
		return formatJSONResponse({ user: userFound });
	} catch (e) {
		console.log(e);
		return formatJSONResponse({
		messages: [{ error: e }]
		});
	}
};

/*
	tasks: fetches users valid under certain username passed in
	returns: user objects or error
	params: event and context
*/
const getUsersByUserName: ValidatedEventAPIGatewayProxyEvent<
typeof getUsersByUserNameSchema
> = async (event, context) => {
	try {
		const authenticatedEvent = await auth(event);
		if (!authenticatedEvent || !authenticatedEvent.body) {
			return formatErrorResponse(401, "Token is not valid");
		}
		context.callbackWaitsForEmptyEventLoop = false;
		const usersFound = await userDao.findUsersByUsername(authenticatedEvent.body.name)
		return formatJSONResponse({ users: usersFound });
	} catch (e) {
		console.log(e);
		return formatJSONResponse({
		messages: [{ error: e }]
		});
	}
};

/*
	tasks: fetches all followers for a specific user and returns minimal info for each
	returns: user objects or error
	params: event and context
*/
const getUserFollowers: ValidatedEventAPIGatewayProxyEvent<
typeof getUserFollowersSchema
> = async (event, context) => {
	try {
		const authenticatedEvent = await auth(event);
		if (!authenticatedEvent || !authenticatedEvent.body) {
			return formatErrorResponse(401, "Token is not valid");
		}
		context.callbackWaitsForEmptyEventLoop = false;
		const followersFound = await userDao.getFollowersOfUserList(authenticatedEvent.body.userId)
		return formatJSONResponse({ followersFound });
	} catch (e) {
		console.log(e);
		return formatJSONResponse({
		messages: [{ error: e }]
		});
	}
};

/*
	tasks: fetches all followers for a specific user and returns minimal info for each
	returns: user objects or error
	params: event and context
*/
const getRecommendedUsers: ValidatedEventAPIGatewayProxyEvent<
typeof getUserFollowersSchema
> = async (event, context) => {
	try {
		const authenticatedEvent = await auth(event);
		if (!authenticatedEvent || !authenticatedEvent.body) {
			return formatErrorResponse(401, "Token is not valid");
		}
		context.callbackWaitsForEmptyEventLoop = false;
		const recommendedUsers = await userDao.fetchRecommendedUsers(authenticatedEvent.body.userId, 5)
		console.log("Recommended Users")
		console.log(recommendedUsers)
		return formatJSONResponse({ recommendedUsers });
	} catch (e) {
		console.log(e);
		return formatJSONResponse({
		messages: [{ error: e }]
		});
	}
};


/*
	tasks: fetches all followers for a specific user and returns minimal info for each
	returns: user objects or error
	params: event and context
*/
const getUserFollowing: ValidatedEventAPIGatewayProxyEvent<
typeof getUserFollowingSchema
> = async (event, context) => {
	try {
		const authenticatedEvent = await auth(event);
		if (!authenticatedEvent || !authenticatedEvent.body) {
			return formatErrorResponse(401, "Token is not valid");
		}
		context.callbackWaitsForEmptyEventLoop = false;
		const followingFound = await userDao.getUserFollowingList(authenticatedEvent.body.userId)
		return formatJSONResponse({ followingFound });
	} catch (e) {
		console.log(e);
		return formatJSONResponse({
		messages: [{ error: e }]
		});
	}
};


/*
	tasks: 
	returns: user objects or error
	params: event and context
*/
const getExactUserById: ValidatedEventAPIGatewayProxyEvent<
typeof getExactUserByIdSchema
> = async (event, context) => {
	try {
		const authenticatedEvent = await auth(event);
		if (!authenticatedEvent || !authenticatedEvent.body) {
			return formatErrorResponse(401, "Token is not valid");
		}
		context.callbackWaitsForEmptyEventLoop = false;
		const userFound = await userDao.getExactUserById(authenticatedEvent.body.getUser, authenticatedEvent.body.user)
		return formatJSONResponse({ user: userFound });
	} catch (e) {
		console.log(e);
		return formatJSONResponse({
		messages: [{ error: e }]
		});
	}
};

const loginUser: ValidatedEventAPIGatewayProxyEvent<
	typeof loginUserSchema
> = async (event, context) => {
	try {
		context.callbackWaitsForEmptyEventLoop = false;
		const userFound = await userDao.loginUser(event.body)
		let userInfo = JSON.parse(userFound.body)
		// Check if the user information is correctly retrieved
		if (!userInfo || !userInfo.userFound || !userInfo.userFound._id) {
			// Return a 401 Unauthorized response if the user is not found or the structure is incorrect
			return formatErrorResponse(401, "Authentication failed: Incorrect credentials");
		}
		const payload = {
			user: {
				id: userInfo.userFound._id,
			},
		};

		const secretKey = await awsService.fetchCredential("JWT_SECRETKEY");
		const token = await sign(payload, secretKey, {
			expiresIn: '7d', // will change to '365d' after we test a shorter timeframe for token and make sure it works
		});

		if (typeof token !== "string") {
			return formatErrorResponse(400, "JWT Error: Tokenizing");
		}

		// we need to log that a user logged in and at what time, will have to create a logging API for this - Not crucial now
		return formatJSONResponse({ token });

	} catch (e) {
		console.log(e);
		
		// Check if the error is due to incorrect password
		if (e && e.statusCode === 401) {
			// Return a specific error response for incorrect password
			return formatErrorResponse(401, "Authentication failed: Incorrect password");
		}
	
		// Handle other errors
		return formatErrorResponse(500, "An error occurred during the login process");
	}
};


const updateUserSpotifyCreds: ValidatedEventAPIGatewayProxyEvent<
	typeof updateUserSpotifyCredsSchema
> = async (event, context) => {
	try {
		const authenticatedEvent = await auth(event);
		if (!authenticatedEvent || !authenticatedEvent.body) {
			return formatErrorResponse(401, "Token is not valid");
		}
		context.callbackWaitsForEmptyEventLoop = false;
		let encryptedAccess_token: string;
		let encryptedRefresh_token: string;
		if (event.body && event.body.access_token){
			encryptedAccess_token = await encrypt(authenticatedEvent.body.access_token);
		}
		if (event.body && event.body.refresh_token){
			encryptedRefresh_token = await encrypt(authenticatedEvent.body.refresh_token);
		}
		
		const userUpdated = await userDao.updateUserSpotifyCreds(authenticatedEvent.body.user, encryptedAccess_token, encryptedRefresh_token);
		let userInfo = JSON.parse(userUpdated.body);
		return formatJSONResponse({ user: userInfo.msg });
	} catch (e) {
		console.log(e);
		return formatJSONResponse({
		messages: [{ error: e }]
		});
	}
};

const updateUserProfile: ValidatedEventAPIGatewayProxyEvent<
	typeof updateUserProfileSchema
> = async (event, context) => {
	try {
		const authenticatedEvent = await auth(event);
		if (!authenticatedEvent || !authenticatedEvent.body) {
			return formatErrorResponse(401, "Token is not valid");
		}
		context.callbackWaitsForEmptyEventLoop = false;
		const userUpdated = await userDao.updateUserInfo(authenticatedEvent.body.user, authenticatedEvent.body.data);
		let userInfo = JSON.parse(userUpdated.body);
		return formatJSONResponse({ user: userInfo.msg });
	} catch (e) {
		console.log(e);
		return formatJSONResponse({
		messages: [{ error: e }]
		});
	}
};


/*
	tasks: follow a user/ will send a follow request if user profile is private
	returns: 
	params: event and context
*/
// const followUser: ValidatedEventAPIGatewayProxyEvent<
// 	typeof followUserSchema
// > = async (event, context) => {
// 	try {
// 		const authenticatedEvent = await auth(event);
// 		if (!authenticatedEvent || !authenticatedEvent.body) {
// 			return formatErrorResponse(401, "Token is not valid");
// 		}
// 		if ( authenticatedEvent.body.user !== authenticatedEvent.body.fromUser) {
// 			return formatErrorResponse(401, "Incorrect fromUser passed");
// 		}
// 		context.callbackWaitsForEmptyEventLoop = false;
// 		const follow = await followRequestsDao.handleFollowRequest(authenticatedEvent.body.fromUser, authenticatedEvent.body.toUser);
// 		let response = JSON.parse(follow.body);
// 		return formatJSONResponse({ user: response.msg });
// 	} catch (e) {
// 		console.log(e);
// 		return formatJSONResponse({
// 		messages: [{ error: e }]
// 		});
// 	}
// };

const followUser: ValidatedEventAPIGatewayProxyEvent<typeof followUserSchema> = async (event, context) => {
    try {
        const authenticatedEvent = await auth(event);
        if (!authenticatedEvent || !authenticatedEvent.body) {
            return formatErrorResponse(401, "Token is not valid");
        }

        const { fromUser, toUser } = authenticatedEvent.body;
        const followResult = await followRequestsDao.handleFollowRequest1(fromUser, toUser);

        // Check if operation was successful and for public profiles
        if (followResult.success && !followResult.isPrivate) {
            await notificationDao.createNotification('newFollower', fromUser, toUser);
            return formatJSONResponse({ message: "User successfully followed." });
        } else if (followResult.success && followResult.isPrivate) {
			await notificationDao.createNotification('followRequest', fromUser, toUser);
            return formatJSONResponse({ message: "Follow request sent." });
        } else {
            // Handle error or unsuccessful operation
            return formatErrorResponse(400, followResult.error || "An error occurred during the follow operation.");
        }
    } catch (e) {
        console.log(e);
        return formatJSONResponse({
            messages: [{ error: e.message || 'An unexpected error occurred' }]
        });
    }
};



/*
    tasks: unfollow a user
    returns: 
    params: event and context
*/
const unfollowUser: ValidatedEventAPIGatewayProxyEvent<
	typeof followUserSchema
> = async (event, context) => {
    try {
        const authenticatedEvent = await auth(event);
        if (!authenticatedEvent || !authenticatedEvent.body) {
            return formatErrorResponse(401, "Token is not valid");
        }
        context.callbackWaitsForEmptyEventLoop = false;

        const unfollow = await followRequestsDao.handleUnfollowRequest(authenticatedEvent.body.fromUser, authenticatedEvent.body.toUser);
        let response = JSON.parse(unfollow.body);
        return formatJSONResponse({ user: response.msg });
    } catch (e) {
        console.log(e);
        return formatJSONResponse({
            messages: [{ error: e }]
        });
    }
};


/*
	tasks: fetches all pending follow requests for a user with a private account
	returns: 
	params: event and context
*/
const fetchPendingFollowRequests: ValidatedEventAPIGatewayProxyEvent<
	typeof fetchPendingFollowRequestsSchema
> = async (event, context) => {
    try {
        const authenticatedEvent = await auth(event);
        if (!authenticatedEvent || !authenticatedEvent.body) {
			return formatErrorResponse(401, "Token is not valid");
		}
		if ( authenticatedEvent.body.user !== authenticatedEvent.body.userFetching) {
			return formatErrorResponse(401, "Incorrect userFetching passed, doesnt match token user");
		}
        const userId = authenticatedEvent.body.user;

        context.callbackWaitsForEmptyEventLoop = false;
        const pendingRequests = await followRequestsDao.getPendingFollowRequests(userId);
        return formatJSONResponse({ requests: pendingRequests });
    } catch (e) {
        console.log(e);
        return formatJSONResponse({
            messages: [{ error: e.message || 'An error occurred while fetching follow requests' }]
        });
    }
};


/*
    tasks: accepts a follow request and adds users as following/followers
    returns: 
    params: event and context
*/
const acceptFollowRequest: ValidatedEventAPIGatewayProxyEvent<
    typeof acceptFollowRequestSchema
> = async (event, context) => {
    try {
        const authenticatedEvent = await auth(event);
        if (!authenticatedEvent || !authenticatedEvent.body) {
            return formatErrorResponse(401, "Token is not valid");
        }

        const userId = authenticatedEvent.body.user;
        const requestId = authenticatedEvent.body.requestId;
        context.callbackWaitsForEmptyEventLoop = false;
        const result = await followRequestsDao.acceptFollowRequest(requestId, userId);
        return formatJSONResponse({ message: result });
    } catch (e) {
        console.log(e);
        return formatJSONResponse({
            messages: [{ error: e.message || 'An error occurred while accepting the follow request' }]
        });
    }
};

/*
    tasks: rejects a follow request and updates its status to "denied"
    returns: 
    params: event and context
*/
const rejectFollowRequest: ValidatedEventAPIGatewayProxyEvent<
    typeof acceptFollowRequestSchema
> = async (event, context) => {
	try {
        const authenticatedEvent = await auth(event);
        if (!authenticatedEvent || !authenticatedEvent.body) {
            return formatErrorResponse(401, "Token is not valid");
        }

        const userId = authenticatedEvent.body.user;
        const requestId = authenticatedEvent.body.requestId;
        context.callbackWaitsForEmptyEventLoop = false;
        const result = await followRequestsDao.rejectFollowRequest(requestId, userId);
        return formatJSONResponse({ message: result });
    } catch (e) {
        console.log(e);
        return formatJSONResponse({
            messages: [{ error: e.message || 'An error occurred while rejecting the follow request' }]
        });
    }
};

/*
    tasks: cancels a follow request and updates its status to "cancelled"
    returns: 
    params: event and context
*/
const cancelFollowRequest: ValidatedEventAPIGatewayProxyEvent<
    typeof acceptFollowRequestSchema
> = async (event, context) => {
    try {
        const authenticatedEvent = await auth(event);
        if (!authenticatedEvent || !authenticatedEvent.body) {
            return formatErrorResponse(401, "Token is not valid");
        }

        const userId = authenticatedEvent.body.user;
        const requestId = authenticatedEvent.body.requestId;
        context.callbackWaitsForEmptyEventLoop = false;
        const result = await followRequestsDao.cancelFollowRequest(requestId, userId);
        return formatJSONResponse({ message: result });
    } catch (e) {
        console.log(e);
        return formatJSONResponse({
            messages: [{ error: e.message || 'An error occurred while cancelling the follow request' }]
        });
    }
};


/*
	tasks: checks if email is already being used
	returns: boolean
	params: event and context
*/
const checkIfEmailExists: ValidatedEventAPIGatewayProxyEvent<any> = async (
	event,
	context
) => {
	try {
		context.callbackWaitsForEmptyEventLoop = false;
		// Access email from path parameters
		const email = event.pathParameters.email;
		const check = await userDao.checkEmailExists(email);
		return formatJSONResponse({ exists: check });
	} catch (e) {
		console.log(e);
		return formatJSONResponse({
		messages: [{ error: e }]
		});
	}
};

/*
	tasks: checks if username is already being used
	returns: boolean
	params: event and context
*/
const checkIfUserNameExists: ValidatedEventAPIGatewayProxyEvent<any> = async (
	event,
	context
) => {
	try {
		context.callbackWaitsForEmptyEventLoop = false;
		// Access email from path parameters
		const username = event.pathParameters.username;
		const check = await userDao.checkUsernameExists(username);
		return formatJSONResponse({ exists: check });
	} catch (e) {
		console.log(e);
		return formatJSONResponse({
		messages: [{ error: e }]
		});
	}
};

/*
    tasks: fetches posts for a user's feed
    returns: 
    params: event and context
*/
const fetchPosts: ValidatedEventAPIGatewayProxyEvent<
    typeof fetchPostsSchema
> = async (event, context) => {
    try {
		console.log(event)
        const authenticatedEvent = await auth(event);
        if (!authenticatedEvent || !authenticatedEvent.body) {
            return formatErrorResponse(401, "Token is not valid");
        }
	
        const userId = authenticatedEvent.body.userID;
        const lastPostTimestamp = authenticatedEvent.body.lastPostTimestamp;
        const limit = authenticatedEvent.body.limit || 20;

        context.callbackWaitsForEmptyEventLoop = false;
        const posts = await postDao.fetchPosts(userId, lastPostTimestamp, limit);
        return formatJSONResponse({ posts });
    } catch (e) {
        console.log(e);
        return formatJSONResponse({
            messages: [{ error: e.message || 'An error occurred while fetching posts' }]
        });
    }
};

/*
    tasks: likes a post
    returns: 
    params: event and context
*/
const likePost: ValidatedEventAPIGatewayProxyEvent<
    typeof likeUnlikePostSchema 
> = async (event, context) => {
    try {
		const authenticatedEvent = await auth(event);
        if (!authenticatedEvent || !authenticatedEvent.body) {
            return formatErrorResponse(401, "Token is not valid");
        }
	
        const userId = authenticatedEvent.body.userId;
        const postId = authenticatedEvent.body.postId;
        const result = await postDao.likePost(userId, postId);
        if (result.error) {
            return formatErrorResponse(404, result.error);
        }
		console.log("result")
		console.log(result.post.user_id)
		const addNotification = await notificationDao.createNotification('like', userId.toString(), (result.post.user_id).toString());
        console.log(addNotification)
        return formatJSONResponse(result);
    } catch (e) {
        console.log(e);
        return formatJSONResponse({
            messages: [{ error: e.message || 'An error occurred while liking the post' }]
        });
    }
};


/*
    tasks: unlikes a post
    returns: 
    params: event and context
*/
const unLikePost: ValidatedEventAPIGatewayProxyEvent<
    typeof likeUnlikePostSchema 
> = async (event, context) => {
    try {
		const authenticatedEvent = await auth(event);
        if (!authenticatedEvent || !authenticatedEvent.body) {
            return formatErrorResponse(401, "Token is not valid");
        }
	
        const userId = authenticatedEvent.body.userId;
        const postId = authenticatedEvent.body.postId;
		console.log("userId")
		console.log(userId)
		console.log("postId")
		console.log(postId)
        const result = await postDao.unlikePost(userId, postId);
        if (result.error) {
            return formatErrorResponse(404, result.error);
        }
        return formatJSONResponse(result);
    } catch (e) {
        console.log(e);
        return formatJSONResponse({
            messages: [{ error: e.message || 'An error occurred while liking the post' }]
        });
    }
};


/*
    tasks: fetches posts for a user's profile
    returns: 
    params: event and context
*/
const fetchUserProfilePosts: ValidatedEventAPIGatewayProxyEvent<
    typeof fetchPostsSchema
> = async (event, context) => {
    try {
        const authenticatedEvent = await auth(event);
        if (!authenticatedEvent || !authenticatedEvent.body) {
            return formatErrorResponse(401, "Token is not valid");
        }
	
        const userId = authenticatedEvent.body.userID;
        const lastPostTimestamp = authenticatedEvent.body.lastPostTimestamp;
        const limit = authenticatedEvent.body.limit || 20;

        context.callbackWaitsForEmptyEventLoop = false;
        const posts = await postDao.fetchUserPosts(userId, lastPostTimestamp, limit);
        return formatJSONResponse({ posts });
    } catch (e) {
        console.log(e);
        return formatJSONResponse({
            messages: [{ error: e.message || 'An error occurred while fetching posts' }]
        });
    }
};


/*
    tasks: comments on a post
    returns: 
    params: event and context
*/
// const commentOnPost: ValidatedEventAPIGatewayProxyEvent<
//     typeof commentPostSchema 
// > = async (event, context) => {
//     try {
//         const authenticatedEvent = await auth(event);
//         if (!authenticatedEvent || !authenticatedEvent.body) {
//             return formatErrorResponse(401, "Token is not valid");
//         }
    
//         const { userId, postId, text } = authenticatedEvent.body;
// 		console.log("bodyy")
// 		console.log(userId)
// 		console.log(postId)
// 		console.log(text)
//         const result = await commentDao.commentPost(userId, postId, text);
//         if (result.error) {
//             return formatErrorResponse(404, result.error);
//         }
//         return formatJSONResponse(result);
//     } catch (e) {
//         console.log(e);
//         return formatJSONResponse({
//             messages: [{ error: e.message || 'An error occurred while adding the comment' }]
//         });
//     }
// };

const commentOnPost: ValidatedEventAPIGatewayProxyEvent<typeof commentPostSchema> = async (event, context) => {
    try {
        const authenticatedEvent = await auth(event);
        if (!authenticatedEvent || !authenticatedEvent.body) {
            return formatErrorResponse(401, "Token is not valid");
        }
    
        const { userId, postId, text } = authenticatedEvent.body;
        const result = await commentDao.commentPost(userId, postId, text);
        if (result.error) {
            return formatErrorResponse(404, result.error);
        }

        // If the comment was added successfully, proceed to create a notification
        if (result.postOwnerId) {
            await notificationDao.createNotification('comment', userId, result.postOwnerId);
        }

        return formatJSONResponse(result);
    } catch (e) {
        console.log(e);
        return formatJSONResponse({
            messages: [{ error: e.message || 'An error occurred while adding the comment' }]
        });
    }
};


const fetchUserNotifications: ValidatedEventAPIGatewayProxyEvent<typeof fetchNotificationsSchema> = async (event, context) => {
    try {
        // Authenticate the request
        const authenticatedEvent = await auth(event);
        if (!authenticatedEvent || !authenticatedEvent.body) {
            return formatErrorResponse(401, "Token is not valid");
        }

        // Extract parameters from the event body
        const { userID, lastNotificationTimestamp, limit } = authenticatedEvent.body;

		console.log("authhh")
		console.log(authenticatedEvent.body.user)
        // // Ensure the authenticated user matches the userID for which notifications are being fetched
        // if (authenticatedEvent.userID !== userId) {
        //     return formatErrorResponse(403, "Forbidden: You can only fetch your own notifications");
        // }

        // Fetch notifications with optional pagination and limit
		console.log(userID)
		console.log(limit)
		console.log(lastNotificationTimestamp)
        const notificationsResult = await notificationDao.fetchNotifications(userID, limit, lastNotificationTimestamp);
        
        // Check for errors or empty results in notificationsResult if necessary

        return formatJSONResponse({ notifications: notificationsResult });
    } catch (e) {
        console.error(e);
        return formatJSONResponse({
            status: 500,
            messages: [{ error: e.message || 'An error occurred while fetching notifications' }]
        });
    }
};

// const patchUserHeaderImage: ValidatedEventAPIGatewayProxyEvent<
//     typeof patchUserHeaderImageSchema
// > = async (event, context) => {
//     const authenticatedEvent = await auth(event);
//     if (!authenticatedEvent || !authenticatedEvent.body) {
//         return formatErrorResponse(401, "Token is not valid");
//     }
//     context.callbackWaitsForEmptyEventLoop = false;
    
//     let arr: any = Object.values(authenticatedEvent.body.data);
//     let url: string;
//     let res: any;
//     try {
//         res = await awsService.uploadToBucket(
//             `userId_${authenticatedEvent.body.user}.png`,
//             Buffer.from(arr), 
//             `rhythmix-dev-userprofilepics`,
//             'image/jpeg'
//         );
//         url = res.Location;


//         // Prepare the update data
//         const updateData = {
//             profile_pic: url 
//         };

//         // Call the updateUserInfo method
//         await userDao.updateUserInfo(authenticatedEvent.body.user, updateData);

//     } catch (e) {
//         console.log(e);
//         return formatErrorResponse(500, "An error occurred while uploading the image");
//     }

//     return formatJSONResponse({
//         message: "User header image updated successfully",
//         data: { user: authenticatedEvent.body.user, imageUrl: url }
//     });
// };

const patchUserHeaderImage: ValidatedEventAPIGatewayProxyEvent<
    typeof patchUserHeaderImageSchema
> = async (event, context) => {
    const authenticatedEvent = await auth(event);
    if (!authenticatedEvent || !authenticatedEvent.body) {
        return formatErrorResponse(401, "Token is not valid");
    }
    context.callbackWaitsForEmptyEventLoop = false;
    
    let url: string;
    let res: any;
    try {
        res = await awsService.generatePreSignedURL(
            `userId_${authenticatedEvent.body.user}.png`,
            `rhythmix-dev-userprofilepics`,
            'image/png'
        );
		console.log(`pre signed result for userId: ${authenticatedEvent.body.user}`)
		console.log(res)
        url = res;

    } catch (e) {
        console.log(e);
        return formatErrorResponse(500, "An error occurred while uploading the image");
    }

    return formatJSONResponse({
        message: "Pre Signed URL for profile pic created",
        data: { preSignedUrl: url }
    });
};


export const ADD_USER = middyfy(addUser);
export const GET_USER = middyfy(getUserByToken);
export const CHECK_EMAIL_EXISTS = middyfy(checkIfEmailExists);
export const CHECK_USERNAME_EXISTS = middyfy(checkIfUserNameExists);
export const GET_USERS_SEARCH = middyfy(getUsersByUserName);
export const FOLLOW_USER = middyfy(followUser);
export const UNFOLLOW_USER = middyfy(unfollowUser);
export const FETCH_PENDING_FOLLOW_REQUESTS = middyfy(fetchPendingFollowRequests);
export const FETCH_POSTS = middyfy(fetchPosts);
export const FETCH_NOTIFICATIONS = middyfy(fetchUserNotifications);
export const LIKE_POST = middyfy(likePost);
export const UNLIKE_POST = middyfy(unLikePost);
export const COMMENT_POST = middyfy(commentOnPost);
export const FETCH_USER_PROFILE_POSTS = middyfy(fetchUserProfilePosts);
export const ACCEPT_FOLLOW_REQUEST = middyfy(acceptFollowRequest);
export const REJECT_FOLLOW_REQUEST = middyfy(rejectFollowRequest);
export const CANCEL_FOLLOW_REQUEST = middyfy(cancelFollowRequest);
export const GET_USER_FOLLOWERS = middyfy(getUserFollowers);
export const GET_USER_FOLLOWING = middyfy(getUserFollowing);
export const GET_EXACT_USER_SEARCH = middyfy(getExactUserById);
export const LOGIN = middyfy(loginUser);
export const UPDATE_USER_SPOTIFY_CREDS = middyfy(updateUserSpotifyCreds);
export const UPDATE_USER_ACCOUNT = middyfy(updateUserProfile);
export const ADD_USER_PROFILEPIC = middyfy(patchUserHeaderImage);
export const FETCH_RECOMMENDED_USERS = middyfy(getRecommendedUsers);