import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import { Helmet } from "react-helmet";
import Cookies from 'js-cookie';
import Search from './components/search';
import Artist from './components/artist';
import Login from './components/login';

let proxy = ''
if (process.env.NODE_ENV !== 'production') {
  proxy = 'http://localhost:5000'
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false); // access_token cookie
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  // check if logged in
  useEffect(() => {
    const cookieValue = Cookies.get("access_token")

    if (cookieValue) {
      console.log('access_token in cookie')
      // console.log(username)
      if (!username){
        fetch('/api/me',{
            headers: {"Authorization": `Bearer ${cookieValue}`}
          })
          .then(data => data.json())
          .then(data => {
            setUsername(data.display_name);
            setLoggedIn(true);
            setLoading(false)
          });
      } else {
        console.log(username);
        setLoggedIn(true);
        setLoading(false)
      }
    } else {
      setLoggedIn(false);
      setLoading(false);
    }

  }, [username]);

  const search = <Search username={username} proxy={proxy}/>;
  const login = <Login proxy={proxy}/>


  let content;
  if (loading){
    content = <div id='container' className='total-center'><p>Loading...</p></div>
  } else {
    content =
      <div id='container'>
        <Router>
          <Switch>
            <Route exact path="/"
              render={() => loggedIn ? search : login}
            />
            <Route path="/artist/:id"
              render={() => loggedIn ? <Artist proxy={proxy}/> : <Redirect to='/'/>}
            />

          </Switch>
        </Router>
      </div>
  }

  return (
    <>
      <Helmet>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
        <link rel="manifest" href="/site.webmanifest"/>
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5"/>
        <meta name="msapplication-TileColor" content="#00a300"/>
        <meta name="theme-color" content="#ffffff"/>
      </Helmet>
      {content}
    </>
  )

}

export default App;
