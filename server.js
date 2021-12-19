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
app.use(cors({credentials: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));
app.use(cookieParser());
app.use(express.static(__dirname + static));


app.get('/login', function(req, res) {

  console.log('GET/login')
  const spotifyApi = new SpotifyWebApi({
    redirectUri: redirect_uri,
    clientId: client_id,
    clientSecret: client_secret
  });
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

  const spotifyApi = new SpotifyWebApi({
    redirectUri: redirect_uri,
    clientId: client_id,
    clientSecret: client_secret
  });
  spotifyApi
    .authorizationCodeGrant(code)
    .then(data => {
      const access_token = data.body['access_token'];
      const refresh_token = data.body['refresh_token'];
      console.log('Retrieved access token', access_token);
      console.log('The token expires in ' + data.body['expires_in']);
      // Set the access token
      // spotifyApi.setAccessToken(data.body['access_token']);
      // spotifyApi.setRefreshToken(refresh_token);

      res.cookie('access_token', access_token, {maxAge: 3600000});
      res.redirect(proxy+'/');
    })
});

app.get('/api/me', (req, res) => {
  console.log('GET /api/me');

  const access_token = req.headers['authorization'].split(' ')[1]
  const spotifyApi = new SpotifyWebApi({
    accessToken: access_token
  });

  spotifyApi
    .getMe()
    .then(data => {
      const me = data.body
      res.json(me);
    })
    .catch(err => {
      console.log(err)
    })
})

app.get('/api/search-artist', (req, res) => {
  console.log('GET /api/search-artist');

  const artist = req.query.artist;

  const access_token = req.headers['authorization'].split(' ')[1]
  const spotifyApi = new SpotifyWebApi({
    accessToken: access_token
  });

  spotifyApi
    .searchArtists(artist)
    .then(data => {
      const items = data.body.artists.items.map(x => {
        return {
          name: x.name,
          id: x.id,
          image: x.images.length === 0 ? '' : x.images.slice(-1)[0].url
        };
      })

      res.json(items)
    })
    .catch(err => console.error(err))
})

app.get('/api/albums', (req, res) => {
  console.log('GET /api/albums');

  const artist_id = req.query.artist_id;
  const offset = req.query.offset;
  let filtered = [];
  let next = true;
  // .then(data => res.json(data.body))
  const access_token = req.headers['authorization'].split(' ')[1]
  const spotifyApi = new SpotifyWebApi({
    accessToken: access_token
  });

  spotifyApi
    .getArtistAlbums(artist_id, {include_groups: 'album,compilation', limit: 20, market: 'CA', offset: offset })
    .then(data => {
      if (data.body.next == null){
        next = false;
      }

      const items = data.body.items.map(x => {

        return {
          name: x.name,
          id: x.id,
          image: x.images.slice(-1)[0].url
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
      // console.log(next)
      res.json({
        name: data.body.name,
        image: data.body.images.length === 0 ? '' : data.body.images[0].url,
        albums: filtered,
        next: next
      })
    })
    .catch(err => console.error(err))
})

app.post('/api/create', (req,res) => {
  console.log('GET /api/create');

  const artist = req.body.artist;
  const albums = req.body.albums; // ['5U4W9E5WsYb2jUQWePT8Xm', '3KyVcddATClQKIdtaap4bV']
  let playlist_id;
  let uris;
  const access_token = req.headers['authorization'].split(' ')[1]
  const spotifyApi = new SpotifyWebApi({
    accessToken: access_token
  });

  spotifyApi
    .createPlaylist(artist + ' Discography')
    .then(data => playlist_id = data.body.id)
    .then(async id => {
      let allAlbums = [];
      while (albums.length > 0){
        const batch = albums.splice(0, 20);
        try {
          const getAlbums = await spotifyApi.getAlbums(batch);
          allAlbums = allAlbums.concat(getAlbums.body.albums);
        } catch(err) {
          console.error("Error getting album information");
        }
      }
      return allAlbums;
    })
    .then(all => all.map(a => a.tracks.items).flat())
    .then(tracks => uris = tracks.map(t => t.uri))
    .then(data => {
      while (uris.length > 0) {
        const batch = uris.splice(0, 50);
        spotifyApi.addTracksToPlaylist(playlist_id, batch)
        .catch(err => {
          console.log(err)
          console.error("Error adding tracks to playlist");
        });
      }
    })
    .then(data => spotifyApi.getPlaylist(playlist_id))
    .then(playlist => {
        res.json({
          href: playlist.body.external_urls.spotify
        })
      })
    .catch(err => {
      console.error(err);
      console.log(access_token);
    })
})

app.listen(process.env.PORT || port, () => {
  console.log(`Listening at http://localhost:${port}`)
})
