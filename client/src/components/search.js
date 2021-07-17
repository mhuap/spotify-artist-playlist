import React, { useState } from 'react';
import {
  Link
} from "react-router-dom";
import Cookies from 'js-cookie';
import '../styles/Search.scss';

const querystring = require('querystring');

function Search({ username, proxy }) {
  const [artists, setArtists] = useState([])
  const [artistInput, setArtistInput] = useState('')

  const searchArtist = (e) => {
    e.preventDefault();
    const cookieValue = Cookies.get("access_token");
    console.log(cookieValue)

    fetch(proxy + '/api/search-artist/?' + querystring.stringify({artist: artistInput}),
    {credentials: 'include'})
      .then(data => data.json())
      .then(data => {
        console.log(data)
        setArtists(data)
      });
  }

  const handleArtistInputChange = (e) => {
    setArtistInput(e.target.value);
  }

  let list = null;
  if (artists.length > 0) {
    list = artists.map(a => <li key={a.id}><Link to={'/artist/' + a.id}><img src={a.image}/>{a.name}</Link></li>)
  }
  return (
    <div id='search'>
      <header>
        <div className='content text-caps'>Welcome {username}</div>
      </header>
      <div className='content'>
        <form action='#' onSubmit={searchArtist}>
          <label>Search for an artist</label>
          <input type="text" name="artist" value={artistInput} onChange={handleArtistInputChange} required/>
          <button type="submit">Search</button>
        </form>

        <ul>
          {list}
        </ul>
      </div>
    </div>
  )
}

export default Search;
