# Track Playback Controller
A small wrapper script to play tracks from different music streaming services uniformly in the browser.<br>
It can play tracks from Youtube, Soundcloud and Spotify. Just supply an ID for a track and let it play! 


## Why
I couldn't find a library for exactly these three music streaming services so I made this small wrapper so they can be used in the same way. 
It uses the [Youtube Iframe API](https://developers.google.com/youtube/iframe_api_reference
), [Soundcloud Widget API](https://developers.soundcloud.com/docs/api/html5-widget) and [Spotify Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk/quick-start/), all of which embed iframes to play tracks from their services. 

It was used for [cassettify.org](https://www.cassettify.org) which was a website for collecting music from different music streaming platforms in uniform playlists that you could then listen to and share with others. 


## Usage

### Setup
First include the API scripts for the streaming services on your page:
```html
<script src="https://www.youtube.com/iframe_api"></script>
<script src="https://w.soundcloud.com/player/api.js"></script>
<script src="https://sdk.scdn.co/spotify-player.js"></script>
```

Then add the `src/embed-controller.js` script:

```html
<script src="embed-controller.js"></script>
```

Also add three containers where `embed-controller.js` will insert the iframe embeds to play the tracks:

```html
<div id="youtube"></div>
<div id="soundcloud"></div>
<div id="spotify"></div>
```

_(The `<div id="spotify"></div>` container is not actually needed and could be left out as the Spotify SDK inserts its own hidden iframe at the bottom of the page)_

If you want to hide the iframes, add a `hidden` attribute or set their CSS to `display: none;`.

### Playing tracks
To play Youtube tracks:
```js
const youtube = new YoutubeController();
await youtube.init();
youtube.setVolume(100);
await youtube.load('zNTaVTMoNTk');
youtube.play();
setTimeout(() => youtube.pause(), 5000);
```
To play Soundcloud tracks:
```js
const soundcloud = new SoundcloudController();
await soundcloud.init();
soundcloud.setVolume(100);
await soundcloud.load('billwurtz/outside');
soundcloud.play();
setTimeout(() => soundcloud.pause(), 5000);
```

To play Spotify tracks:
```js
const spotify = new SpotifyController();
await spotify.init('access_token_from_user_here');
spotify.setVolume(100);
await spotify.load('4MsC3bu5B8WQGHQjOoH2NG');
spotify.play();
setTimeout(() => spotify.pause(), 5000);
```

See the `example` folder for a more detailed example. 


## Notice for Spotify
Spotify only works when an `access_token` from an authenticated Spotify Premium account is supplied (`access_token` given for scope of playing tracks, e.g. `streaming`, `user-read-email` and `user-read-private`) and a Spotify application is registered. 
This must be done seperately like with https://github.com/jwilsson/spotify-web-api-php for example. 

Also see [the quickstart guide](https://developer.spotify.com/documentation/web-playback-sdk/quick-start) and [the SDK reference](https://developer.spotify.com/documentation/web-playback-sdk/reference/#playing-a-spotify-uri) for further information on Spotify. 

