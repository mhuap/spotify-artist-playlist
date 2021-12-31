import React, { useState, useEffect } from 'react';
import {
  Link,
  useParams,
  useHistory
} from "react-router-dom";
import Cookies from 'js-cookie';
import Album from './album';
import Checkbox from './checkbox';
import spotifyLogo from '../images/Spotify_Icon_RGB_White.png';

const querystring = require('querystring');


function Artist({ proxy }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [albums, setAlbums] = useState([]);
  const [selectedAlbums, setSelectedAlbums] = useState([]);
  const [playlistCreated, setPlaylistCreated] = useState(false);
  const [href, setHref] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectAll, setSelectAll] = useState(true);

  let { id } = useParams();
  let history = useHistory();

  useEffect(() => {
    const cookieValue = Cookies.get("access_token");

    async function fetchData() {
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        console.log("fetch");
        let data = await fetch(proxy + '/api/albums/?' + querystring.stringify({artist_id: id, offset: offset}),
          {
            headers: {"Authorization": `Bearer ${cookieValue}`}
          }
        );
        data = await data.json();

        if (name === ''){
          setName(data.name);
        }
        if (url === ''){
          setUrl(data.url);
        }
        const newAlbums = data.albums;
        setAlbums(prevAlbums => [...prevAlbums, ...newAlbums]);
        if (selectAll){
          setSelectedAlbums(prevSelected => [...prevSelected, ...newAlbums]);
        }
        hasMore = data.next;
        offset = offset + 20;
      }

      setLoading(false)
    }

    fetchData();

  }, [id, proxy]);

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

  let list = <h4>No albums found</h4>;
  if (loading) {
    list = <h4>Loading...</h4>
  }
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
  let onClickBack;
  if (playlistCreated){
    // confirmation
    content = <>
      <div id='confirmation' className='content album-list'>
        <h2>Playlist created</h2>
      </div>
      <div className='content spotify-button'>
        <a href={href} target="_blank" className='text-caps button total-center'>
          <img src={spotifyLogo} alt="spotify logo icon"/>
          Listen on Spotify
        </a>
      </div>
      <div className='content artist-button'>
        <Link className='text-caps button total-center' to='/'>Back to search</Link>
      </div>
    </>
    onClickBack = () => setPlaylistCreated(false);
  } else {
    // album list
    content = <>
      <div className="content">
        <a className="text-caps button total-center artist-link" target="_blank" href={url}>
          <img src={spotifyLogo} alt="spotify logo icon"/>
          Listen on Spotify
        </a>
      </div>
      <div className={'content master-checkbox' + (selectAll ? '' : ' unselectedAlbum')}>
        <label>
          <input type='checkbox' onChange={onClickMasterCheckbox} defaultChecked/>
          <Checkbox checked={selectAll} />
          {selectedAlbums.length} selected
        </label>
      </div>
      <div className='content album-list'>
        {list}
      </div>
      <div className='content artist-button'>
        <button onClick={createPlaylist}>Create playlist</button>
      </div>
    </>
    onClickBack = () => history.goBack()
  }

  return(<div id='artist'>
    <header>
      <button className='back-btn' onClick={onClickBack}>←</button>
      <div className='text-caps'>{name}</div>
    </header>

    {content}

  </div>)
}
// <InfiniteScroll
//   dataLength={albums.length}
//   next={fetchMoreAlbums}
//   hasMore={hasMore}
//   loader={<h4>Loading...</h4>}
// >
//
// </InfiniteScroll>

export default Artist;
