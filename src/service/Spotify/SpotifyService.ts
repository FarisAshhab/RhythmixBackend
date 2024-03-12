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

// Type definition for artist and image data
type ArtistInfo = {
    name: string;
    id: string;
    spotifyUrl: string;
};

type ImageInfo = {
    url: string;
    height: number;
    width: number;
};

// Extended TrackInfo type to include necessary fields for the response
type TrackInfo = {
    trackId: string;
    trackName: string;
    previewUrl: string;
    spotifyTrackUrl: string;
    artists: ArtistInfo[];
    images: ImageInfo[];
    count: number;
};

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
                    albumName: track.album.name, // Added album name here
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

        async getTop5RecentlyPlayedTracks(accessToken: string): Promise<TrackInfo[]> {
            const ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
            const headers = {
                'Authorization': `Bearer ${accessToken}`
            };
        
            const timeframeStart = Date.now() - ONE_WEEK_IN_MS;
            let allTracks: any[] = [];
            let url = `${SPOTIFY_USER_URL}/player/recently-played?limit=50`;
        
            try {
                // Fetch all tracks up to now
                while (url) {
                    const response = await axios.get(url, { headers });
                    console.log("response:::::")
                    console.log(response)
                    // Ensure there are items before attempting to access them
                    if (response.data.items.length === 0) {
                        break; // Exit the loop if there are no items
                    }
                    allTracks = allTracks.concat(response.data.items);
                    if (new Date(response.data.items[response.data.items.length - 1].played_at).getTime() < timeframeStart) {
                        // If the last item in this batch is older than our timeframe start, stop fetching more
                        break;
                    }
                    url = response.data.next;
                }
        
                // Filter tracks to only include those within the desired timeframe
                const filteredTracks = allTracks.filter(item => {
                    const playedAt = new Date(item.played_at).getTime();
                    return playedAt >= timeframeStart;
                });
        
                let trackDetails: Record<string, TrackInfo> = {};
        
                // Process filtered tracks
                filteredTracks.forEach((item: any) => {
                    const track = item.track;
                    if (!trackDetails[track.id]) {
                        trackDetails[track.id] = {
                            trackId: track.id,
                            trackName: track.name,
                            previewUrl: track.preview_url,
                            spotifyTrackUrl: track.external_urls.spotify,
                            artists: track.artists.map((artist: any) => ({
                                name: artist.name,
                                id: artist.id,
                                spotifyUrl: artist.external_urls.spotify
                            })),
                            images: track.album.images.map((image: any) => ({
                                url: image.url,
                                height: image.height,
                                width: image.width
                            })),
                            count: 1
                        };
                    } else {
                        trackDetails[track.id].count++;
                    }
                });
        
                // Sort by play count and return top 5 tracks
                const sortedTracks: TrackInfo[] = Object.values(trackDetails)
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);
        
                return sortedTracks;
        
            } catch (e) {
                console.error('Error fetching and processing recently played tracks:', e);
                throw new Error('Failed to fetch and process recently played tracks');
            }
        },


        // Function to get user top artists - will be shown on each users profile page (saved in DB but refreshed every week)
        async getTopArtistsAndGenres(accessToken: string): Promise<any> {
            const headers = {
                'Authorization': `Bearer ${accessToken}`
            };
        
            try {
                const response: AxiosResponse = await axios.get(`${SPOTIFY_USER_URL}/top/artists?time_range=short_term`, { headers });
                
                const top3Genres: Array<string> = await this.getTopGenres(response.data); 
                const top3Artists = response.data.items.slice(0, 3);
                // Select specific fields for each artist
                const formattedArtists = top3Artists.map(artist => ({
                    name: artist.name,
                    spotifyUrl: artist.external_urls.spotify,
                    imageUrl: artist.images[0]?.url  // Use the first image's URL, if available
                }));
        
                return {
                    topArtists: formattedArtists,
                    topGenres: top3Genres
                };
            } catch (e) {
                console.error('Error fetching top artists:', e);
                throw new Error('Failed to fetch top artists');
            }
        },

        // function to retrieve users top genres based on the artists they listen to --> there is no direct spotify API to retrieve this info
        async getTopGenres(spotifyData: any): Promise<any> {
            const genreCounts: { [genre: string]: number } = {};
        
            spotifyData.items.forEach(artist => {
                artist.genres.forEach(genre => {
                    if (genreCounts[genre]) {
                        genreCounts[genre]++;
                    } else {
                        genreCounts[genre] = 1;
                    }
                });
            });
        
            const sortedGenres = Object.keys(genreCounts).sort((a, b) => genreCounts[b] - genreCounts[a]);
        
            return sortedGenres.slice(0, 3);
        },

        // Function to get the spotify profile information - to pre populate create account form after spotify auth
        async getProfileSpotifyInfo(accessToken: string): Promise<any> {
            const headers = {
            'Authorization': `Bearer ${accessToken}`
            };
        
            try {
                const response: AxiosResponse = await axios.get(`${SPOTIFY_USER_URL}`, { headers });
            
                const displayName = response.data.display_name;
                const externalURL= response.data.external_urls.spotify;
                const userEmail= response.data.email;
                
                return {
                    spotifyDisplayName: displayName,
                    spotifyURL: externalURL,
                    email: userEmail
                };
            } catch (e) {
                console.error('Error fetching recently played song:', e);
                throw new Error('Failed to fetch recently played song');
            }
        },


        async createLoginURL(state: string): Promise<any> {
            const client_id = await awsService.fetchCredential("CLIENT_ID_SPOTIFY");
            const scope = 'user-read-private user-read-email user-read-recently-played user-top-read';
            try {
                const spotifyAuthUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
                    response_type: 'code',
                    client_id: client_id, 
                    scope: scope,
                    redirect_uri: process.env.SPOTIFY_REDIRECT_URL,
                    state: state
                })}`;
            
                return spotifyAuthUrl;
            } catch (e) {
                console.error('Error generating spotify login url', e);
                throw new Error('Failed to create login url');
            }
        },

        // In spotifyService.ts
        async exchangeCodeForTokens(code: string): Promise<{ access_token: string, refresh_token: string }> {
            try {
                const client_id = await awsService.fetchCredential("CLIENT_ID_SPOTIFY");
                const client_secret = await awsService.fetchCredential("CLIENT_SECRET_SPOTIFY");
                
                const response = await axios.post(
                    'https://accounts.spotify.com/api/token',
                    querystring.stringify({
                    code: code,
                    redirect_uri: process.env.SPOTIFY_REDIRECT_URL,
                    grant_type: 'authorization_code',
                    }),
                    {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`,
                    },
                    }
            );
        
            return response.data; // Contains access_token and refresh_token
            } catch (e) {
                console.error('Error exchanging code for tokens:', e);
                throw new Error('Failed to exchange code for tokens');
            }
        }


    }
    return sv
}

export default SpotifyService; 