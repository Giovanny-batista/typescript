import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

// Tipos
type Artist = {
  name: string;
  image: {
    '#text': string;
  }[];
};

type Album = {
  name: string;
  artist: string;
};

type ArtistInfo = {
  name: string;
  
};

type SimilarArtist = {
  name: string;
};

type TopTrack = {
  name: string;
  artist: {
    name: string;
  };
};

type TopAlbum = {
  name: string;
  artist: {
    name: string;
  };
};

type AppState = {
  query: string;
  searchType: string;
  searchResults: (Artist | Album)[];
  selectedArtist: ArtistInfo | null;
  similarArtists: SimilarArtist[];
  topTracks: TopTrack[];
  topAlbums: TopAlbum[];
};

type AppProps = {
  apiKey: string;
};

function App({ apiKey }: AppProps) {
  const [query, setQuery] = useState<string>('');
  const [searchType, setSearchType] = useState<string>('artist');
  const [searchResults, setSearchResults] = useState<(Artist | Album)[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<ArtistInfo | null>(null);
  const [similarArtists, setSimilarArtists] = useState<SimilarArtist[]>([]);
  const [topTracks, setTopTracks] = useState<TopTrack[]>([]);
  const [topAlbums, setTopAlbums] = useState<TopAlbum[]>([]);

  const searchLastFM = async () => {
    try {
      const method = searchType === 'artist' ? 'artist.search' : 'album.search';
      const response = await axios.get(
        `http://ws.audioscrobbler.com/2.0/?method=${method}&${searchType}=${query}&api_key=&format=json`
      );

      const resultKey = searchType === 'artist' ? 'artistmatches' : 'albummatches';
      const results = response.data.results[resultKey][searchType];
      setSearchResults(results);
      setSelectedArtist(null);
      setSimilarArtists([]);
      setTopTracks([]);
      setTopAlbums([]);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  const getArtistInfo = async (artistName: string) => {
    try {
      const response = await axios.get(
        `http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${artistName}&api_key=&format=json`
      );
      const artistInfo = response.data.artist as ArtistInfo;

      setSelectedArtist(artistInfo);
      setSimilarArtists([]);
      setTopTracks([]);
      setTopAlbums([]);
    } catch (error) {
      console.error('Erro ao buscar informações do artista:', error);
    }
  };

  const getSimilarArtistsLastFM = async (artistName: string) => {
    try {
      const response = await axios.get(
        `http://ws.audioscrobbler.com/2.0/?method=artist.getSimilar&artist=${artistName}&api_key=&format=json`
      );
      const similarArtists = response.data.similarartists.artist as SimilarArtist[];
      setSimilarArtists(similarArtists);
    } catch (error) {
      console.error('Erro ao buscar artistas similares:', error);
    }
  };

  const getTopTracksLastFM = async (artistName: string) => {
    try {
      const response = await axios.get(
        `http://ws.audioscrobbler.com/2.0/?method=artist.getTopTracks&artist=${artistName}&api_key=&format=json`
      );
      const topTracks = response.data.toptracks.track as TopTrack[];
      setTopTracks(topTracks);
    } catch (error) {
      console.error('Erro ao buscar as principais faixas do artista:', error);
    }
  };

  const getTopAlbumsLastFM = async (artistName: string) => {
    try {
      const response = await axios.get(
        `http://ws.audioscrobbler.com/2.0/?method=artist.getTopAlbums&artist=${artistName}&api_key=&format=json`
      );
      const topAlbums = response.data.topalbums.album as TopAlbum[];
      setTopAlbums(topAlbums);
    } catch (error) {
      console.error('Erro ao buscar os principais álbuns do artista:', error);
    }
  };

  return (
    <div className="App">
      <h1>Last.fm</h1>
      <div>
        <input
          type="text"
          placeholder="Pesquisar artistas ou álbuns"
          onChange={(e) => setQuery(e.target.value)}
        />
        <select onChange={(e) => setSearchType(e.target.value)}>
          <option value="artist">Artista</option>
          <option value="album">Álbum</option>
        </select>
        <button onClick={searchLastFM}>Pesquisar</button>
      </div>
      <div className="results">
        {searchType === 'artist' &&
          searchResults.map((artist) => (
            <div key={artist.name} className="result-item">
              <h2>{artist.name}</h2>
              {artist.image[2] && artist.image[2]['#text'] && (
                <img src={artist.image[2]['#text']} alt={artist.name} />
              )}
              <div className="artist-info">
                <button onClick={() => getArtistInfo(artist.name)}>Ver Mais</button>
              </div>
            </div>
          ))}
        {searchType === 'album' &&
          searchResults.map((album) => (
            <div key={album.name} className="result-item">
              <h2>{album.name}</h2>
              <p>Artista: {album.artist}</p>
            </div>
          ))}
      </div>
      {selectedArtist && (
        <div className="additional-info">
          <h2>{selectedArtist.name}</h2>
          <div className="info-tabs">
            <button onClick={() => getSimilarArtistsLastFM(selectedArtist.name)}>Artistas Similares</button>
            <button onClick={() => getTopTracksLastFM(selectedArtist.name)}>Principais Faixas</button>
            <button onClick={() => getTopAlbumsLastFM(selectedArtist.name)}>Principais Álbuns</button>
          </div>
          {similarArtists.length > 0 && (
            <div>
              <h2>Artistas Similares:</h2>
              <ul>
                {similarArtists.map((similarArtist, index) => (
                  <li key={index}>{similarArtist.name}</li>
                ))}
              </ul>
            </div>
          )}
          {topTracks.length > 0 && (
            <div>
              <h2>Principais Faixas:</h2>
              <ol>
                {topTracks.map((track, index) => (
                  <li key={index}>
                    <strong>{track.name}</strong> - {track.artist.name}
                  </li>
                ))}
              </ol>
            </div>
          )}
          {topAlbums.length > 0 && (
            <div>
              <h2>Principais Álbuns:</h2>
              <ul>
                {topAlbums.map((album, index) => (
                  <li key={index}>
                    <strong>{album.name}</strong> - {album.artist.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
