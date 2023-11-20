import querystring from 'querystring';
import axios, { AxiosResponse } from 'axios';
import { SPOTIFY_ACCOUNT_URL, SPOTIFY_USER_URL } from '../../config/apiURL.js'
import AwsService from "../Aws/AwsService"
import {
    formatJSONResponse,
	formatErrorResponse,
	ValidatedEventAPIGatewayProxyEvent,
} from "@libs/api-gateway";

const awsService = AwsService()

function SpotifyService() {

    let sv = {
        // Function to refresh the Spotify access token
        async refreshSpotifyToken(refreshToken: string): Promise<any> {
            const client_id = await awsService.fetchCredential("CLIENT_ID_SPOTIFY");
            const client_secret = await awsService.fetchCredential("CLIENT_SECRET_SPOTIFY");
            const tokenAuth = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
            const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${tokenAuth}`
            };
        
            try {
                const response: AxiosResponse = await axios.post(`${SPOTIFY_ACCOUNT_URL}/token`, querystring.stringify({
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken
                }), { headers });
            
                return {
                    access_token: response.data.access_token,
                    refresh_token: response.data.refresh_token || refreshToken // Use the new refresh token if provided, else the old one
                };
            } catch (e) {
                console.error('Error refreshing Spotify token:', e);
                throw new Error('Failed to refresh Spotify token');
            }
        },

        // Function to get the most recently played song
        async getMostRecentlyPlayedSong(accessToken: string): Promise<any> {
            const headers = {
            'Authorization': `Bearer ${accessToken}`
            };
        
            try {
                const response: AxiosResponse = await axios.get(`${SPOTIFY_USER_URL}/player/recently-played?limit=1`, { headers });
            
                const trackInfo = response.data.items[0].track;
                return {
                    trackInfo
                    // name: trackInfo.name,
                    // artists: trackInfo.artists.map((artist: any) => artist.name).join(', '),
                    // album: trackInfo.album.name,
                    // // Add other track details you need here
                };
            } catch (e) {
                console.error('Error fetching recently played song:', e);
                throw new Error('Failed to fetch recently played song');
            }
        }


    }
    return sv
}

export default SpotifyService; 