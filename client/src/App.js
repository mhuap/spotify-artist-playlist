import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
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

  if (loading){
    return <div id='container' className='total-center'><p>Loading...</p></div>
  } else {
    return (
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
    );
  }

}

export default App;
