import React, { useState, useEffect } from 'react';
import {
  Link,
  useParams
} from "react-router-dom";
import Cookies from 'js-cookie';
import InfiniteScroll from "react-infinite-scroll-component";
import Album from './album';
import spotifyLogo from '../images/Spotify_Logo_RGB_Green.png'

const querystring = require('querystring');


function Artist({ proxy }) {
  const [name, setName] = useState('');
  const [albums, setAlbums] = useState([]);
  const [selectedAlbums, setSelectedAlbums] = useState([]);
  const [playlistCreated, setPlaylistCreated] = useState(false);
  const [href, setHref] = useState('')
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const [selectAll, setSelectAll] = useState(true);

  let { id } = useParams();

  useEffect(() => {
    const cookieValue = Cookies.get("access_token");

    fetch(proxy + '/api/albums/?' + querystring.stringify({artist_id: id, offset: offset}),
      {
        headers: {"Authorization": `Bearer ${cookieValue}`}
      }
    )
      .then(data => data.json())
      .then(data => {
        if (name === ''){
          setName(data.name);
        }
        const newAlbums = data.albums
        setAlbums(albums.concat(newAlbums));
        if (selectAll){
          setSelectedAlbums(selectedAlbums.concat(newAlbums));
        }
        setHasMore(data.next)
      });
  }, [id, proxy, offset])

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

  const onClickMasterCheckbox = () => {
    if (selectAll){
      // deselect
      setSelectAll(false);
      setSelectedAlbums([]);
    } else {
      setSelectAll(true);
      setSelectedAlbums(albums)
    }
  }

  const createPlaylist = () => {
    const cookieValue = Cookies.get("access_token");

    fetch(proxy + '/api/create/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${cookieValue}`
      },
      body: JSON.stringify({
        artist: name,
        albums: selectedAlbums.map(x => x.id)
      })
    })
      .then(data => data.json())
      .then(data => {
        setPlaylistCreated(true);
        setHref(data.href)
      })

  }

  const fetchMoreAlbums = () => {
    setOffset(offset + 20)
  }

  let list = null;
  if (albums.length > 0) {
    list = albums.map(a =>
      <Album key={a.id}
        name={a.name}
        image={a.image}
        albumId={a.id}
        isSelected={isAlbumSelected(a.id)}
        onClickAlbum={onClickAlbum}
      />)
  }

  let content;
  if (playlistCreated){
    // confirmation
    content = <>
      <div id='confirmation' className='content album-list'>
        <h2>Playlist created</h2>
      </div>
      <div className='content spotify-button'>
        <a href={href} target="_blank" className='text-caps button total-center'>Listen on Spotify</a>
      </div>
      <div className='content artist-button'>
        <Link className='text-caps button total-center' to='/'>Make another playlist</Link>
      </div>
    </>
  } else {
    // album list
    content = <>
      <div className='content master-checkbox'>
        <input type='checkbox' onChange={onClickMasterCheckbox} defaultChecked/>
        <label>select/unselect all</label>
      </div>
      <div className='content album-list'>
        <InfiniteScroll
          dataLength={albums.length}
          next={fetchMoreAlbums}
          hasMore={hasMore}
          loader={<h4>Loading...</h4>}
        >
          {list}
        </InfiniteScroll>
      </div>
      <div className='content artist-button'>
        <button onClick={createPlaylist}>Create playlist</button>
      </div>
    </>
  }


  return(<div id='artist'>
    <header>
      <img className='spotifyLogo' src={spotifyLogo} alt='Spotify logo'/>
      <div className='text-caps'>{name}</div>
    </header>
    {content}

  </div>)
}

export default Artist;
