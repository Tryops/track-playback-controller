'use strict';
/*
    Remember to add the external <script> tags from the services to your page when using embed-controller.js
    
    <script src="https://www.youtube.com/iframe_api"></script>
    <script src="https://w.soundcloud.com/player/api.js"></script>
    <script src="https://sdk.scdn.co/spotify-player.js"></script>
*/

// width and height for all embeds:
const width = 300;
const height = 200;

class Controller { // abstract class
    constructor(insertTagId = 'service-insert-element-id-here') {
        this.insertTagId = insertTagId;

        if (this.constructor == Controller) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }

    onTrackEnd() { // fires when track ends, firing must be implemented in subclasses with listeners
        console.log(this.insertTagId + ' track ended');
    }

    setOnTrackEnd(callback) { // is inherited and used to set the next() function to run when a track ended in playlist.js
        this.onTrackEnd = callback;
    }

    async init() {
        // first initialisations and return promise
        throw new Error("Method 'init()' must be implemented.");
    }

    // service_id: the id the service uses for songs
    // also automatically starts to play the video with this.play()
    load(service_id) {
        throw new Error("Method 'load()' must be implemented.");
    }

    play() {
        throw new Error("Method 'play()' must be implemented.");
    }

    pause() {
        throw new Error("Method 'pause()' must be implemented.");
    }

    // vol: 0-100
    setVolume(vol) {
        throw new Error("Method 'setVolume()' must be implemented.");
    }

    skipTo(seconds) {
        throw new Error("Method 'skipTo()' must be implemented.");
    }
}

class YoutubeController extends Controller {
    // see https://developers.google.com/youtube/iframe_api_reference
    constructor(insertTagId = 'youtube') {
        super(insertTagId);
    }

    async init() {
        return new Promise((resolve, reject) => {
            YT.ready(() => {
                this.player = new YT.Player(this.insertTagId, {
                    height: height, // set to 0
                    width: width,
                    videoId: 'CVDHQokn7mQ', // default video (cassette sound) so that iframe can load
                    events: {
                        'onReady': () => { console.log('init(): Youtube Iframe ready'); resolve(); },
                        'onError': reject,
                        'onStateChange': event => {
                            if(event.data === 0) {
                                this.onTrackEnd(); // fired when video ends
                            }
                        }
                    }
                })
            });
        })
    }

    load(service_id) {
        //this.play();
        this.player.loadVideoById(service_id);
        this.pause();
        //this.play();
    }

    play() {
        this.player.unMute();
        this.player.playVideo();
    }

    pause() {
        this.player.pauseVideo();
    }

    setVolume(vol) {
        this.player.setVolume(vol);
    }

    skipTo(seconds) {
        this.player.seekTo(seconds, true);
    }
}

class SoundcloudController extends Controller {
    // see https://developers.soundcloud.com/docs/api/html5-widget
    constructor(insertTagId = 'soundcloud') {
        super(insertTagId);
    }

    async init() {
        const tagid = this.insertTagId;
        return new Promise(((resolve, reject) => {
            const parent = document.getElementById(tagid);
            parent.innerHTML = `<iframe id="soundcloud_widget"
                                src="https://w.soundcloud.com/player/?url=https://soundcloud.com/tonemanufacture/cassette-tone-preview&show_artwork=false&liking=false&sharing=false&auto_play=false"
                                width="${width}"
                                height="${height}"
                                allow="autoplay"
                                frameborder="no"></iframe>`;
            this.player = SC.Widget(parent.firstElementChild);

            this.player.bind(SC.Widget.Events.READY, () => {
                console.log('init(): Soundcloud Iframe ready');
                resolve();
            });
            this.player.bind(SC.Widget.Events.ERROR, () => {
                reject();
            });
            this.player.bind(SC.Widget.Events.FINISH, () => { // fires when track ends
                this.onTrackEnd();
            });
        }).bind(this));
    }

    async load(service_id) { // async function because loading takes some time and user should not be able to skip through playlist during this
        return new Promise(resolve => {
            this.player.load('https://soundcloud.com/' + service_id, {callback: () => { // no preceding '/' in id, service_id is like: artist/trackname
                //this.play();
                this.pause();
                //setTimeout(() => this.play(), 2000); // if somehow still loading
                resolve();
            }});
        });
    }

    play() {
        this.player.getCurrentSound(sound => this.player.play());
        // this.player.play();
    }

    pause() {
        this.player.pause();
    }

    setVolume(vol) {
        this.player.setVolume(vol);
    }

    skipTo(seconds) {
        this.player.seekTo(seconds*1000);
    }

    // because Soundcloud API key registration is now locked, only way to access track-metadata is via the embeds -> use second embed on page to fetch metadata when adding link (slower of course)
    async getTrackInfo(service_id) { // warning: do not use with normal track player, only to et infos to track!
        return new Promise(resolve => {
            this.player.load('https://soundcloud.com/' + service_id, {callback: () => {
                    //setTimeout(() => this.play(), 2000); // if somehow still loading
                    this.player.getCurrentSound(sound => resolve(sound));
                }});
        });
    }
}

class SpotifyController extends Controller {
    // see https://developer.spotify.com/documentation/web-playback-sdk/quick-start
    // also https://developer.spotify.com/documentation/web-playback-sdk/reference/#playing-a-spotify-uri

    constructor(insertTagId = 'spotify') {
        super(insertTagId);
        this.access_token = 'access-token-not-set';
        this.device_id = 'device-id-not-set';
    }

    // page must be accessed via https (not just locahost/http), otherwise spotify drm does not work
    async waitForSpotifyPlaybackReady() { // because of weird behavior when spotify script is already loaded
        return new Promise(resolve => {
            if (window.Spotify) {
                resolve(window.Spotify);
            } else {
                window.onSpotifyWebPlaybackSDKReady = () => {
                    resolve(window.Spotify);
                };
            }
        });
    };

    async init(access_token) { // the access_token of the user obtained after the user authorised your spotify application with the required scopes
        const tagid = this.insertTagId;
        return new Promise(async (resolve, reject) => {
            await this.waitForSpotifyPlaybackReady();

            this.access_token = access_token;

            this.player = new Spotify.Player({
                name: 'Embed Controller',
                getOAuthToken: cb => { cb(this.access_token); }
            });

            // Error handling
            this.player.addListener('initialization_error', ({ message }) => { /*console.error(message);*/ reject('Spotify Initialization: ' + message); });
            this.player.addListener('authentication_error', ({ message }) => { /*console.error(message);*/ reject('Spotify Authentication: ' + message); });
            this.player.addListener('account_error', ({ message }) => { /*console.error(message);*/ reject('Spotify Account: ' + message); });
            this.player.addListener('playback_error', ({ message }) => { /*console.error(message); reject(message);*/ }); // many unnecessary console.errors

            // Playback status updates
            this.player.addListener('player_state_changed', state => {
                console.log(state);
                // workaround for track ended event: https://github.com/spotify/web-playback-sdk/issues/35
                if (
                    this.state
                    && state.track_window.previous_tracks.find(x => x.id === state.track_window.current_track.id)
                    && !this.state.paused
                    && state.paused
                ) {
                    this.onTrackEnd();
                }
                this.state = state;
            });

            // Ready
            this.player.addListener('ready', ({ device_id }) => {
                console.log('init(): Spotify Playback ready');
                this.device_id = device_id;
                // console.log('Ready with Device ID', device_id);
                resolve();
            });

            // Not Ready
            this.player.addListener('not_ready', ({ device_id }) => {
                // console.log('Device ID has gone offline', device_id);
                reject('not_ready: Device ID has gone offline ' + device_id);
            });

            // Connect to the player!
            this.player.connect();
        });
    }

    async load(service_id) {
        const spotify_uri = 'spotify:track:' + service_id;
        // Play new song, must be dont via api endpoint:
        await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${this.device_id}`, {
            method: 'PUT',
            body: JSON.stringify({ uris: [spotify_uri] }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.access_token}`
            }
        });
        this.pause();
    }

    play() {
        // Resume current song:
        this.player.resume().then(() => {
        });
    }

    pause() {
        // Pause current song:
        this.player.pause().then(() => {
        });
    }

    setVolume(vol) {
        // Set volume of player:
        this.player.setVolume(vol/100).then(() => {
        });
    }

    skipTo(seconds) {
        // Seek to seconds of currently playing song:
        this.player.seek(seconds * 1000).then(() => {
        });
    }
}