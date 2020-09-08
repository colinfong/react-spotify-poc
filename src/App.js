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

-Paginate on >20 playlist pages
*/


// Application client ID, redirect URI, and scopes
const clientId = process.env.REACT_APP_CLIENT_ID;
const redirectUri = "http://localhost:3000";
const scopes = [
  "user-read-currently-playing",
  "user-read-playback-state",
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

  getUserPlaylists(token, id) {
    return new Promise((resolve,reject) => {
      $.ajax({
        url: `https://api.spotify.com/v1/users/${id}/playlists`,
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

  async getCurUser(token) {
    let v, c
    v = await this.getCurrentUser(token)
    c = await this.getUserPlaylists(token, v)
    return c["items"][0]["id"]
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
