import React, { Component } from 'react';
//import hash from "./hash";
import logo from './logo.svg';
import './App.css';
import { render } from "@testing-library/react";

import * as $ from "jquery";
import Player from "./Player";

export const authEndpoint = 'https://accounts.spotify.com/authorize';

/*
TODO:
-Inspect the .bind line
-Create general architecture
-When do I actually need semicolons? function name?
-camel vs snake case

-Paginate on >20 playlist pages
-Paginate on playlist songs
- Dry up URL promises
*/


// Application client ID, redirect URI, and scopes
const clientId = "";
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
      var parts = item.split("=");
      initial[parts[0]] = decodeURIComponent(parts[1]);
    }
    return initial;
  }, {});

window.location.hash = "";

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
    };
    console.log("Attempting to call player API")
    //this.getCurrentlyPlaying = this.getCurrentlyPlaying.bind(this);
    console.log("finished calling API")
  }

  componentDidMount() {
    //Set token
    let _token = urlHash.access_token;
    if (_token) {
      //Set token
      this.setState({
        token: _token
      })
    }
    this.getCurrentlyPlaying(_token);
    console.log("wow")
    console.log(this.getCurUser(_token));
  }

  // Get the user's id for playlists
  getCurrentUser(token) {
    return new Promise((resolve,reject) => {
      $.ajax({
        url: "https://api.spotify.com/v1/me",
        type: "GET",
        beforeSend: (xhr) => {
          xhr.setRequestHeader("Authorization", "Bearer " + token);
        },
        success: (data) => {
          console.log(data.id);
          resolve(data.id)
        },
        error: function (error) {
          reject(error)
        }
      })
    })
  }

  // Use the user's id to get their playlists
  getUserPlaylists(token, userId) {
    return new Promise((resolve,reject) => {
      $.ajax({
        url: `https://api.spotify.com/v1/users/${userId}/playlists`,
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
          console.log(data)
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

  // Take a list of tracks and get their top artist's genres
  getArtistGenres(token, tracks) {
    return Promise.all(
      // Create an array of all artists
      tracks.map(async (track) => {
        const artistId = track["track"]["artists"][0]["id"]
        return await this.getArtist(token, artistId)
      })
    )
  }

  // Takes a list of artists and extracts their associated genres
  // into a map
  genreCount(artists) {
    let genres = new Map()
    let count = 0
    for (var artist of artists) {
      console.log(artist["genres"].values())
      const iter = artist["genres"].values()
      let result = iter.next()
      while (!result.done) {
        console.log(result.value)
        if (!(result.value in genres)) {
          genres[result.value] = 0
        }
        genres[result.value] += 1
        count += 1
        result = iter.next()
      }
    }
    return [genres, count]
  }
  
  // Takes a list of map of genres and counts and turns those cunts into percentages
  genrePercentage(genres, count) {
    for (var genre of genres) {
      var curCount = 
    }
  }

  async getCurUser(token) {
    let v, c, g, r
    v = await this.getCurrentUser(token)
    c = await this.getUserPlaylists(token, v)
    g = await this.getPlaylistTracks(token, c["items"][0]["id"])
    r = await this.getArtistGenres(token, g["items"])
    console.log(this.genreCount(r))
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
        console.log(data);
        this.setState({
          item: data.item,
          is_playing: data.is_playing,
          progress_ms: data.progress_ms,
          no_data: false
        });
      }
    });
  }



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
        {this.state.token && !this.state.no_data && (
          <Player
            item={this.state.item}
            is_playing={this.state.is_playing}
            progress_ms={this.progress_ms}
          />
        )}
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
