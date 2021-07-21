import React from 'react';

import '../styles/Artist.scss';
function Album({ name, albumId, isSelected, onClickAlbum, image }) {

  return(<div id='album'>
    <label>
      <span>
        <input type='checkbox' checked={isSelected} value={albumId} onChange={onClickAlbum}/>
        {name}
      </span>
      <img src={image} alt={'Album cover of ' + name}/>
    </label>
  </div>)
}

export default Album;
