'use strict';

/* Setup */

const list = [
    { service: 'soundcloud', id: 'koan-sound/hustle-hammer' },  // id = last part of soundcloud url: https://soundcloud.com/*the-id-is-here*
    { service: 'youtube', id: 'zNTaVTMoNTk' },   // id = last part of youtube url: https://www.youtube.com/watch?v=*the-id-is-here*
    { service: 'soundcloud', id: 'billwurtz/outside' },
    { service: 'youtube', id: '2ubIhBZG9NA' },
    { service: 'soundcloud', id: 'angrysausage/toby-fox-undertale-64' },
    { service: 'youtube', id: 'ng5NA-j7y7A' },
    { service: 'spotify', id: '4MsC3bu5B8WQGHQjOoH2NG' }, // id = last part of spotify_track_uri: spotify:track:*the-id-is-here* (spotify not available in this example)
];

let index = 0;
let active = null;

/*
    Spotify is not working in this example, an external spotify authentication process with backend is needed to obtain a user access_token 
    (e.g. https://github.com/jwilsson/spotify-web-api-php)

    Examples:
    https://github.com/jwilsson/spotify-web-api-php/blob/adcea818d7a850dc42202def000f818c0207b512/docs/examples/access-token-with-authorization-code-flow.md
    https://github.com/jwilsson/spotify-web-api-php/blob/adcea818d7a850dc42202def000f818c0207b512/docs/examples/access-token-with-pkce-flow.md
*/
const spotify_access_token = 'insert-or-fetch-spotify-access-token-for-user-playback-here';

const youtube = new YoutubeController();
const soundcloud = new SoundcloudController();
const spotify = new SpotifyController();

init().then(() => {  // async
    document.querySelector('.buttons').hidden = false;
    document.querySelector('.loading').hidden = true;
    console.log('Ready!');
});

/* Functions */

async function init() {
    try {
        await youtube.init();
        await soundcloud.init();
        await spotify.init();
    } catch(e) {
        console.error(e); // mainly because of spotify authentication error or not a spotify premium account
        if (e.includes('Spotify Authentication') || e.includes('Spotify Account')) {
            console.info('Spotify Account not available');
        }
    }

    youtube.setVolume(100);
    youtube.setOnTrackEnd(next);
    soundcloud.setVolume(100);
    soundcloud.setOnTrackEnd(next);
    spotify.setVolume(100);
    spotify.setOnTrackEnd(next);

    await load();

    document.querySelector('#prev').addEventListener('click', e => {
        prev();
    });

    document.querySelector('#play').addEventListener('click', e => {
        play();
    });

    document.querySelector('#pause').addEventListener('click', e => {
        pause();
    });

    document.querySelector('#next').addEventListener('click', e => {
        next();
    });
}

async function load() {
    switch (list[index].service) {
        case 'youtube':
            active = youtube;
            break;

        case 'soundcloud':
            active = soundcloud;
            break;

        case 'spotify':
            active = spotify;
            break;

        default:
            console.error(`Service '${service}' not supported`);
            // active = null;
            break;
    }
    await active.load(list[index].id);
}

async function prev() {
    index = index <= 0 ? list.length - 1 : index - 1;
    pause();
    await load();
    play();
}

function play() {
    active.play();
}

function pause() {
    active.pause();
}

async function next() {
    index = index >= list.length - 1 ? 0 : index + 1;
    pause();
    await load();
    play();
}
