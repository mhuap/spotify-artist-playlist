import React from 'react';

import '../styles/Login.scss';

function Login({ proxy }) {
  return (<div id='login'>
    <div id='login-image'>
    </div>

    <div className='content'>
      <div id='login-title'>
        <h1>Discograph</h1>
      </div>

      <p className='text-grey'>
        Create a playlist of an artist’s entire discography - with one click
      </p>

      <a className='text-caps button total-center'
        href={`${proxy}/login`}>Login with Spotify</a>
    </div>
  </div>
  )
}

export default Login;
