const express = require('express');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cors = require('cors');
const path = require('path');
var querystring = require('querystring');
require('dotenv').config();

var SpotifyWebApi = require('spotify-web-api-node');

const port = 5000;

// production
let proxy = ''
let static = '/client/build'
console.log(process.env.NODE_ENV)
if (process.env.NODE_ENV !== 'production') {
  // development
  proxy = 'http://localhost:3000'
  let static = '/public'
}

var client_id = process.env.CLIENT_ID; // Your client id
var client_secret = process.env.CLIENT_SECRET; // Your secret
// var redirect_uri = 'http://localhost:5000/callback/';
var redirect_uri = 'https://spotify-artist-playlist.herokuapp.com/callback/'

const scopes = ['user-read-private', 'user-read-email', 'playlist-modify-public', 'playlist-modify-private']

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));
app.use(cookieParser());
app.use(express.static(__dirname + static));

const spotifyApi = new SpotifyWebApi({
  redirectUri: redirect_uri,
  clientId: client_id,
  clientSecret: client_secret
});


app.get('/login', function(req, res) {

  console.log('GET/login')
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

app.get('/callback', async function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter
  const error = req.query.error;
  const code = req.query.code;
  const state = req.query.state;

  if (error) {
    console.error('Callback Error:', error);
    res.send(`Callback Error: ${error}`);
    return;
  }

  spotifyApi
    .authorizationCodeGrant(code)
    .then(data => {
      const access_token = data.body['access_token'];
      const refresh_token = data.body['refresh_token'];
      console.log('Retrieved access token', access_token);
      console.log('The token expires in ' + data.body['expires_in']);
      // Set the access token
      spotifyApi.setAccessToken(data.body['access_token']);
      spotifyApi.setRefreshToken(refresh_token);

      res.cookie('access_token', access_token, {maxAge: 3600000});
      res.redirect(proxy+'/');
    })
});

app.get('/api/me', (req, res) => {
  console.log('GET /api/me');

  spotifyApi
    .getMe()
    .then(data => {
      const me = data.body
      res.json(me);
    })
    .catch(err => {
      const refresh = spotifyApi.getRefreshToken()
      if (refresh === undefined) {
        res.clearCookie('access_token');
        res.redirect(proxy+'/');
      } else {
        spotifyApi.refreshAccessToken()
          .then(data => spotifyApi.setAccessToken(data.body['access_token']))
      }
    })
})

app.get('/api/search-artist', (req, res) => {
  console.log('GET /api/search-artist');

  const artist = req.query.artist;

  spotifyApi
    .searchArtists(artist)
    .then(data => {
      const items = data.body.artists.items.map(x => {
        return {
          name: x.name,
          id: x.id
        };
      })

      res.json(items)
    })
    .catch(err => console.error(err))
})

app.get('/api/albums', (req, res) => {
  console.log('GET /api/albums');

  const artist_id = req.query.artist_id;
  let filtered = [];
  // .then(data => res.json(data.body))
  spotifyApi
    .getArtistAlbums(artist_id, {include_groups: 'album,compilation', limit: 50, market: 'CA', })
    .then(data => {
      const items = data.body.items.map(x => {
        return {
          name: x.name,
          id: x.id
        };
      })

      filtered = items.filter((album, index, self) =>
        index === self.findIndex(a =>
          (a.name === album.name)
        )
      )
      return spotifyApi.getArtist(artist_id)
    })
    .then(data => {
      res.json({name: data.body.name, albums: filtered})
    })
    .catch(err => console.error(err))
})

app.post('/api/create', (req,res) => {
  console.log('GET /api/create');

  const artist = req.body.artist;
  const albums = req.body.albums; // ['5U4W9E5WsYb2jUQWePT8Xm', '3KyVcddATClQKIdtaap4bV']
  console.log(albums)
  let playlist_id;
  let uris;

  spotifyApi
    .createPlaylist(artist + ' Discography')
    .then(data => playlist_id = data.body.id)
    .then(id => spotifyApi.getAlbums(albums))
    .then(data => data.body.albums.map(a => a.tracks.items).flat())
    .then(tracks => uris = tracks.map(t => t.uri))
    .then(data => {
      while (uris.length > 0) {
        const batch = uris.splice(0, 100);
        spotifyApi.addTracksToPlaylist(playlist_id, batch);
      }
    })



})

app.listen(process.env.PORT || port, () => {
  console.log(`Listening at http://localhost:${port}`)
})
