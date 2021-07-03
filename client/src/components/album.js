import React from 'react';

import '../styles/Artist.scss';
function Album({ name, albumId, isSelected, onClickAlbum, image }) {
  // useEffect(() => {
  //   fetch(proxy + '/api/albums/?' + querystring.stringify({artist_id: id}))
  //     .then(data => data.json())
  //     .then(data => {
  //       setName(data.name);
  //       setAlbums(data.albums);
  //     });
  // }, [])

  return(<div id='album'>
    <label>
      <span>
        <input type='checkbox' checked={isSelected} value={albumId} onChange={onClickAlbum}/>
        {name}
      </span>
      <img src={image}/>
    </label>
  </div>)
}

export default Album;
