import React, { useState, useEffect } from 'react';
import {
  Link,
  useParams
} from "react-router-dom";
import Album from './album'

const querystring = require('querystring');


function Artist({ proxy }) {
  const [name, setName] = useState('');
  const [albums, setAlbums] = useState([]);
  const [selectedAlbums, setSelectedAlbums] = useState([]);
  const [playlistCreated, setPlaylistCreated] = useState(false);

  let { id } = useParams();


  useEffect(() => {
    fetch(proxy + '/api/albums/?' + querystring.stringify({artist_id: id}))
      .then(data => data.json())
      .then(data => {
        setName(data.name);
        setAlbums(data.albums);
        setSelectedAlbums(data.albums);
      });
  }, [id, proxy])

  // useEffect(() => console.log(selectedAlbums), [selectedAlbums])

  const select = id => {
    const albumObject = albums.filter(x => x.id === id)[0];
    const newSelection = selectedAlbums.concat([albumObject])
    setSelectedAlbums(newSelection);
  }

  const unselect = id => {
    const newSelection = selectedAlbums.filter(x => x.id !== id);
    setSelectedAlbums(newSelection);
  }

  const isAlbumSelected = id => {
    return selectedAlbums.some(x => x.id === id);
  }

  const onClickAlbum = (e) => {
    const albumId = e.target.value;

    if (isAlbumSelected(albumId)){
      unselect(albumId);
    } else {
      select(albumId);
    }
  }

  const createPlaylist = () => {
    fetch(proxy + '/api/create/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        artist: name,
        albums: selectedAlbums.map(x => x.id)
      })
    })
    setPlaylistCreated(true);
  }

  let list = <p>No albums</p>
  if (albums.length > 0) {
    list = albums.map(a =>
      <Album key={a.id}
        name={a.name}
        albumId={a.id}
        isSelected={isAlbumSelected(a.id)}
        onClickAlbum={onClickAlbum}
        />)
  }

  let content;
  if (playlistCreated){
    content = <div id='confirmation' className='content'>
      <h1>playlist created</h1>
      <Link className='text-caps button total-center' to='/'>Yay</Link>
    </div>
  } else {
    content = <div className='content'>
      {list}
      <button onClick={createPlaylist}>Create playlist</button>
    </div>
  }


  return(<div id='artist'>
    <header>
      <div className='content text-caps'>{name}</div>
    </header>
    {content}
  </div>)
}

export default Artist;
