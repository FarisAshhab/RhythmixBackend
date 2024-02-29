import type { AWS } from '@serverless/typescript';

import hello from '@functions/hello';
import { 
  addUser,
  getUserByToken,
  loginUser,
  updateUserSpotifyCreds,
  updateUserProfile,
  getUsersByUserName,
  getExactUserById,
  checkIfUserNameExists,
  checkIfEmailExists,
  followUser,
  unfollowUser,
  fetchPendingFollowRequests,
  acceptFollowRequest,
  getUserFollowers,
  getUserFollowing,
  fetchPosts,
  fetchUserProfilePosts,
  rejectFollowRequest,
  cancelFollowRequest,
  likePost,
  unLikePost,
  commentOnPost,
  fetchUserNotifications,
  patchUserHeaderImage,
  getRecommendedUsers
 } from '@functions/users';

 import { 
  refreshUserSpotifyToken,
  fetchMostRecentSong,
  spotifyLogin,
  spotifyCallback,
  fetchProfileSpotifyInfo
 } from '@functions/spotify';

const serverlessConfiguration: AWS = {
  service: 'rhythmix-backend',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs16.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
  },
  // import the function via paths
  functions: { 
    hello,
    addUser,
    getUserByToken,
    loginUser,
    updateUserSpotifyCreds,
    refreshUserSpotifyToken,
    fetchMostRecentSong,
    spotifyLogin,
    spotifyCallback,
    fetchProfileSpotifyInfo,
    updateUserProfile,
    getUsersByUserName,
    getExactUserById,
    checkIfUserNameExists,
    checkIfEmailExists,
    followUser,
    unfollowUser,
    fetchPendingFollowRequests,
    acceptFollowRequest,
    getUserFollowers,
    getUserFollowing,
    fetchPosts,
    fetchUserProfilePosts,
    rejectFollowRequest,
    cancelFollowRequest,
    likePost,
    unLikePost,
    commentOnPost,
    fetchUserNotifications,
    patchUserHeaderImage,
    getRecommendedUsers
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
