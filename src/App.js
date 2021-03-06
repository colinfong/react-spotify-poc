import React, { Component } from 'react';
import logo from './logo.svg';
import './css/App.css';
import { render } from "@testing-library/react";

import * as $ from "jquery";
import Player from "./services/Player/Player";
import Playlist from "./services/Playlists/Playlists"
import Songs from './services/Songs/Songs';

export const authEndpoint = 'https://accounts.spotify.com/authorize';

/*
TODO:
-Inspect the .bind line
-When do I actually need semicolons? function name?
-camel vs snake case

-have authentication on site only
-Paginate on >20 playlist pages
  - I only get 21 playlists total?
-Paginate on getArtist Tracks (max 100)
-Paginate on playlist songs
-fail behavior
-ajax -> fetch, jquery is done away with with fetch or axios
*/

// Application client ID, redirect URI, and scopes
const clientId = process.env.REACT_APP_SPOTIFY_API_KEY;
const redirectUri = "http://localhost:3000";
const scopes = [
  "user-read-currently-playing",
  "user-read-playback-state"
];

//Get the hash of the url
const urlHash = window.location.hash
  .substring(1)
  .split("&")
  .reduce(function(initial, item) {
    if (item) {
      let parts = item.split("=");
      initial[parts[0]] = decodeURIComponent(parts[1]);
    }
    return initial;
  }, {});

window.location.hash = "";

//TODO: Clean state & no_data -> has_data. Delete constructor if not calling member function to initialize state. Functional components - functions without state (replace playlists and songs)

class App extends Component {
  constructor() {
    super();
    this.state = {
      token: null,
      item: {
        album: {
          images: [{ url: "" }]
        },
        name: "",
        artists: [{ name: "" }],
        duration_ms:0,
      },
      is_playing: "Paused",
      progress_ms: 0,
      no_data: false,
      playlists: null,
      songs: null
    };
  }

/*
TODO: have separate user and playlist services
app lives in components directory, views directory, service directory
1 entry point is app.js

component cares about action dispatch

getThirdCallData(firstCallData, secondCallData) {
 return thirdAPICall(transform(firstCallData, secondCallData))
} // but put transform above return w/o explicit call
transform can go inside component if it's not used in much places
transform lives in app.js

index.js - would be in top
src/
   -- components/ (playlist, user, songs - contains their methods)
   -- services/ transformation of data
   -- utils/ getting data
   -- css/
   -- index.js
   -- index.css
-- routes/
-- queries/
/tests/



*/

  async componentDidMount() {
    //Set token
    let _token = urlHash.access_token
    let userId, playlistIds, percentages

    this.getCurrentlyPlaying(_token)
    userId = await this.getCurrentUserID(_token)
    playlistIds = await this.getUserPlaylistIds(_token, userId)
    percentages = await this.getAllPlaylistTracks(_token, playlistIds)

    this.setState({
      token: _token,
      playlists: this.getPlaylistsNames(playlistIds),
      songs: this.printTrackPop(this.orderTracksByPop(percentages[0]["items"]))
    })
  }

//TODO: log error, npm install prettier & or ESLint -> format ;s

  // Get the user's id for playlists
  getCurrentUserID(token) {
    return $.ajax({
        url: "https://api.spotify.com/v1/me",
        headers: {'Authorization': `Bearer ${token}`}
    }).then(data => data.id)
    .fail(error => {})
  }

  //TODO: fix this eajaz like the one above
  // Use the user's id to get their playlists
  //
  getUserPlaylistIds(token, userId) {
    return new Promise((resolve,reject) => {
      $.ajax({
        url: `https://api.spotify.com/v1/users/${userId}/playlists?limit=20`,
        type: "GET",
        beforeSend: (xhr) => {
          xhr.setRequestHeader("Authorization", "Bearer " + token);
        },
        success: (data) => {
          resolve(data["items"])
        },
        error: (error) => {
          reject(error)
        }
      })
    })
  }

  getPlaylistsNames(playlistIds) {
    return playlistIds.map(playlistData => playlistData["name"])
  }

  // Use a playlist id to get its tracks
  getPlaylistTracks(token, playlistId) {
    return new Promise((resolve,reject) => {
      $.ajax({
        url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        type: "GET",
        beforeSend: (xhr) => {
          xhr.setRequestHeader("Authorization", "Bearer " + token);
        },
        success: (data) => {
          resolve(data)
        },
        error: (error) => {
          reject(error)
        }
      })
    })
  }

  // Use an artistId from tracks to get data on the artist
  getArtist(token, artistId) {
    return new Promise((resolve,reject) => {
      $.ajax({
        url: `https://api.spotify.com/v1/artists/${artistId}`,
        type: "GET",
        beforeSend: (xhr) => {
          xhr.setRequestHeader("Authorization", "Bearer " + token);
        },
        success: (data) => {
          resolve(data)
        },
        error: (error) => {
          reject(error)
        }
      })
    })
  }

  // Use 50 artist ids max in an API call
  getArtists(token, artistIds) {
    return new Promise((resolve,reject) => {
      let url = 'https://api.spotify.com/v1/artists?ids='
      let comp = ""
      console.log(artistIds)
      for (let i = 0; i < artistIds.length; i++) {
        if (i === 0) {
          comp = artistIds[i]
        } else {
          comp = comp.concat(",", artistIds[i])
        }
      }
      $.ajax({
        url: url.concat(encodeURIComponent(comp)),
        type: "GET",
        beforeSend: (xhr) => {
          xhr.setRequestHeader("Authorization", "Bearer " + token);
        },
        success: (data) => {
          console.log(data)
          resolve(data)
        },
        error: (error) => {
          reject(error)
        }
      })
    })
  }

  // Takes a list of map of genres and counts and turns those counts into percentages
  genrePercentage(genres, count) {
    console.log(count)
    for (let [key, value] of genres) {
      genres.set(key, value/count)
    }
    return genres
  }

  // Takes a list of artists and extracts their associated genres into a map
  genreCount(artists) {
    let genres = new Map()
    let count = 0
    for (let artist of artists) {
      const iter = artist["genres"].values()
      let result = iter.next()
      while (!result.done) {
        if (!(result.value in genres)) {
          genres.set(result.value, 0)
        }
        genres.set(result.value, genres.get(result.value) + 1)
        count += 1
        result = iter.next()
      }
    }
    return this.genrePercentage(genres, count)
  }
  
  // Take a list of tracks and get their top artist's genres
  async getArtistGenres(token, tracks) {
    console.log(tracks.length)
    let limit = 50
    let artistBatches = [[]]
    tracks.forEach((track) => {
      if(artistBatches[limit/50 - 1].length == 50) {
        limit += 50
        artistBatches.push([])
      }
      artistBatches[limit/50 - 1].push(track["track"]["artists"][0]["id"])
    })
    

    //Need to turn this array of 50 artists per item back to an array of all artists
    return Promise.all(
      artistBatches.map(async (batch) => {
        const artists = await this.getArtists(token, batch)
        // return this.genreCount(artists)
        return artists
      })
    )
  }

  async getPlaylistGenrePerc(token, playlistId) {
    let tracks, genres, percentage
    tracks = await this.getPlaylistTracks(token, playlistId)
    genres = await this.getArtistGenres(token, tracks["items"])
    return await this.genreCount(genres)
  }

  getAllPlaylistGenrePerc(token, playlistIds) {
    return Promise.all(
      playlistIds.map(async (playlist) => {
        const playlistId = playlist["id"]
        return await [playlist["name"], this.getPlaylistGenrePerc(token, playlistId)]
      })
    )
  }
  //TODO: remove playlist maker logic + make code one line

  getAllPlaylistTracks(token, playlistIds) {
    return Promise.all(
      playlistIds.map(playlist => this.getPlaylistTracks(token, playlist["id"]))
    )
  }

  comparePop(trackA, trackB) {
    let popA = trackA["track"]["popularity"]
    let popB = trackB["track"]["popularity"]
    if(popA < popB) {
      return -1
    }
    if(popA > popB) {
      return 1
    }
    return 0
  }

  orderTracksByPop(tracks) {
    const sorted_tracks = [...tracks]
    sorted_tracks.sort(this.comparePop)
    return tracks
  }


  printTrackPop(tracks) {
    let orderedPop = []
    tracks.forEach(function (value) {
      orderedPop.push([value["track"]["name"], value["track"]["popularity"]])
    })
    return orderedPop //return tracks.map instead of foreach and push
  } 

  getCurrentlyPlaying(token) {
    // Make a call using the token
    console.log("calling player API")
    $.ajax({
      url: "https://api.spotify.com/v1/me/player",
      type: "GET",
      beforeSend: (xhr) => {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
      },
      success: (data) => {
        if(!data) {
          this.setState({
            no_data: true,
          });
          return;
        }
        this.setState({
          item: data.item,
          is_playing: data.is_playing,
          progress_ms: data.progress_ms,
          no_data: false,
          songs: ""
        });
      }
    });
  }

  //header typically has css files and such, not render, pull out
  //playlists variable doesn't need brackets

/*
component based arch: view is as simple as possible
anchor tag could be abstracted out to leave view super simple, can build it in state
  is in render code
  single source of auth changes (maintainable)

render link in a conditional if

data no data - you know it in the state
*/

//TODO: make authendpoint a function and call it here

/*
Routing for login vs playlist & song page
Playlist & songs could go together
redux manages app state
view persistence - global store redux
*/
  render() {
    return ( 
      <div className="App">
        <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        {!this.state.token && (
          <a
            className="btn btn--loginApp-link"
            href=
      {`${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join("%20")}&response_type=token&show_dialog=true`}
          >
            Login to spotify
          </a>
        )}
          <Playlist
            playlists={this.state.playlists}
          />
          <Songs
            songs={this.state.songs}
          />
        {this.state.no_data && (
          <p>
            You need to be playing a song on Spotify for something to appear here.
          </p>
        )}
        </header>
      </div>
    );
  }
}

export default App;
