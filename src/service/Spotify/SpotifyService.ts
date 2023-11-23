import querystring from 'querystring';
import axios, { AxiosResponse } from 'axios';
import { SPOTIFY_ACCOUNT_URL, SPOTIFY_USER_URL } from '../../config/apiURL.js'
import AwsService from "../Aws/AwsService"
import {
    formatJSONResponse,
	formatErrorResponse,
	ValidatedEventAPIGatewayProxyEvent,
} from "@libs/api-gateway";
import * as dotenv from 'dotenv'

dotenv.config()


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
            
                const track = response.data.items[0].track;
                const artists = track.artists.map((artist: any) => ({
                    name: artist.name,
                    id: artist.id,
                    spotifyUrl: artist.external_urls.spotify
                }));

                const images = track.album.images.map((image: any) => ({
                    url: image.url,
                    height: image.height,
                    width: image.width
                }));

                return {
                    trackId: track.id,
                    trackName: track.name,
                    previewUrl: track.preview_url,
                    spotifyTrackUrl: track.external_urls.spotify,
                    artists: artists,
                    images: images
                };
            } catch (e) {
                console.error('Error fetching recently played song:', e);
                throw new Error('Failed to fetch recently played song');
            }
        },

        async createLoginURL(state: string): Promise<any> {
            const client_id = await awsService.fetchCredential("CLIENT_ID_SPOTIFY");
            try {
                const spotifyAuthUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
                    response_type: 'code',
                    client_id: client_id, 
                    scope: 'user-read-private user-read-email',
                    redirect_uri: process.env.SPOTIFY_REDIRECT_URL,
                    state: state
                })}`;
            
                return spotifyAuthUrl;
            } catch (e) {
                console.error('Error generating spotify login url', e);
                throw new Error('Failed to create login url');
            }
        },


    }
    return sv
}

export default SpotifyService; 