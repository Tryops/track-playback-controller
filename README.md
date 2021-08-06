# Track Playback Controller
A small script for a uniform playback of tracks from Youtube, Soundcloud and Spotify in the browser 

I couldn't find a proper library to play tracks from different music streaming services in the browser so I wrote this small one. 
It is used by [cassettify.org](https://www.cassettify.org) and was primarily made to play the playlists containing music tracks from different music streaming services. 

It can play tracks from Youtube, Soundcloud and Spotify. Just supply a serivice ID for a track and let it play! 


## Usage

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

For Youtube tracks:
```js
const youtube = new YoutubeController();
await youtube.init();
youtube.setVolume(100);
await youtube.load('zNTaVTMoNTk');
youtube.play();
setTimeout(() => youtube.pause(), 5000);
```
For Soundcloud tracks:
```js
const soundcloud = new SoundcloudController();
await soundcloud.init();
soundcloud.setVolume(100);
await soundcloud.load('billwurtz/outside');
soundcloud.play();
setTimeout(() => soundcloud.pause(), 5000);
```

For Spotify tracks:
```js
const spotify = new SpotifyController();
await spotify.init('access_token_from_user_here');
spotify.setVolume(100);
await spotify.load('4MsC3bu5B8WQGHQjOoH2NG');
spotify.play();
setTimeout(() => spotify.pause(), 5000);
```

See `examples/main.js` and `examples/index.html` for a more detailed example. 


## Notice for Spotify
Spotify only works when an access_token from an authenticated Spotify Premium account is supplied (access_token given for scope of playing tracks) and a Spotify application is registered. 
This must be done seperately like with https://github.com/jwilsson/spotify-web-api-php for example. 

