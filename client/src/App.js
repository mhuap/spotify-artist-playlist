import React, { useState, useEffect } from 'react';

import logo from './logo.svg';
import Cookies from 'js-cookie';
import './App.css';

let proxy = ''
if (process.env.NODE_ENV !== 'production') {
  proxy = 'http://localhost:5000'
}

/**
 * Obtains parameters from the hash of the URL
 * @return Object
 */
function getHashParams() {
  var hashParams = {};
  var e, r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
  while ( e = r.exec(q)) {
     hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false); // access_token cookie
  const [username, setUsername] = useState('');

  useEffect(() => {
    const cookieValue = Cookies.get("access_token")

    if (cookieValue) {
      console.log('access_token in cookie')
      setLoggedIn(true)
      if (!username){
        fetch('/api/me')
          .then(data => data.json())
          .then(data => {
            setUsername(data.display_name);
          });
      }
      return;
    }

    const params = getHashParams();
    if (params.error) {
      alert('There was an error during the authentication');
    } else if (params.access_token) {
      console.log('access_token in url');
      setLoggedIn(true)
      fetch('/api/me')
        .then(data => data.json())
        .then(data => {
          setUsername(data.display_name);
        });
      Cookies.set("access_token", params.access_token);
      return;
    }

    setLoggedIn(false);

  }, []);

  let content;
  if (loggedIn) {
    content = <h1>Welcome {username}!</h1>
  } else {
    content = <a href={`${proxy}/login`}>Login with Spotify</a>
  }

  return (
    <div>
      {content}
    </div>
  );
}

export default App;
