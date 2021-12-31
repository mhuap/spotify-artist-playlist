import React, { useState } from 'react';
import {
  Link,
  useHistory
} from "react-router-dom";
import Cookies from 'js-cookie';
import '../styles/Search.scss';
import filler from '../images/Portrait_Placeholder.png';


const querystring = require('querystring');

function Search({ username, proxy }) {
  const [artists, setArtists] = useState([])
  const [artistInput, setArtistInput] = useState('')

  let history = useHistory();

  const searchArtist = (e) => {
    e.preventDefault();
    const cookieValue = Cookies.get("access_token");
    console.log(cookieValue)
    if (cookieValue) {
      fetch(proxy + '/api/search-artist/?' + querystring.stringify({artist: artistInput}),
        {
          headers: {"Authorization": `Bearer ${cookieValue}`}
        }
      )
        .then(data => data.json())
        .then(data => {
          setArtists(data)
        });
    } else {
      console.log("no cookie. sadge.");
      history.go(0);
    }


  }

  const handleArtistInputChange = (e) => {
    setArtistInput(e.target.value);
  }

  const handleLogout = (e) => {
    e.preventDefault();

    Cookies.remove("access_token");
    history.go(0);
  }


  let list = null;
  if (artists.length > 0) {
    list = artists.map(a => <li key={a.id}>
      <Link to={'/artist/' + a.id}>
        <img src={a.image ? a.image : filler} alt={a.name}/>
        {a.name}
      </Link></li>)
  }
  return (
    <div id='search'>
      <header>
        <div className='content text-caps'>Welcome {username}</div>
        <div className='content logout' onClick={handleLogout}>Log out</div>
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
