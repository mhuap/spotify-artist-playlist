const express = require('express');
const bodyParser = require('body-parser');
var cors = require('cors');
var SpotifyWebApi = require('spotify-web-api-node');
const path = require('path');
var querystring = require('querystring');
require('dotenv').config();

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
var stateKey = 'spotify_auth_state';

const scopes = ['user-read-private', 'user-read-email']

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));
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
      // Set the access token
      spotifyApi.setAccessToken(data.body['access_token']);
      spotifyApi.setRefreshToken(refresh_token);

      res.redirect(`${proxy}/#` +
        querystring.stringify({
          access_token: access_token
        }));
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
})

app.get('/api/search-artist', (req, res) => {
  console.log('GET /api/search-artist');

  const artist = req.body.artist;

  spotifyApi
    .searchArtists(artist)
    .then(function(data) {
      res.json(data.body)
    }, function(err) {
      console.error(err);
    });
})

app.listen(process.env.PORT || port, () => {
  console.log(`Listening at http://localhost:${port}`)
})
