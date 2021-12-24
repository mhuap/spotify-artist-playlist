import React from 'react';
// import spotifyLogo from '../images/Spotify_Icon_RGB_White.png';

import '../styles/Artist.scss';
function Album({ name, albumId, isSelected, onClickAlbum, image }) {

  return(<div className='album'>
    <label>
      <span className={isSelected ? '' : 'unselectedAlbum'}>
        <input type='checkbox' checked={isSelected} value={albumId} onChange={onClickAlbum}/>
        {name}
      </span>
      <img src={image} alt={'Album cover of ' + name}/>
    </label>
  </div>)
}

export default Album;
