## Popularify
An application used to filter your Spotify playlists for their most popular songs. Made for those moments you realize your musical taste could be too eclectic to share with the room. Currently built with React and will ultimately live in Node.js.

## Project Status

Proof of concept completed. Application is able to authenticate with a user's Spotify account(with implicit grant flow), retreieve their playlists, and order songs in their first playlist by their popularity.

Next steps are to move the logic to the backend in Node and create a simple UI

## Installation and Setup Instructions
Clone down this repository. You will need node and npm installed globally on your machine.

Create Required Files:

Installation:
`npm install`

Start server:
`npm start`

Visit App:
1. Run `http://localhost:3000` in your browser. 
2. Start playing a Spotify song(Note: Application will not work without a song playing)
3. Authenticate
4. Boom! You should see one of your playlists' songs in the order of least played to most played.

Reflection:
* Project idea started as an app to recommend what playlists to sort songs into from 'Liked Songs'. I found there was too much variation in users' decisions of where to put songs and the method I used(recommending playlists by similar genere to an uncategorized song) was too simplistic and would not save very much effort for a user over doing that themselves. In addition, a UI for these recommendations would just clutter the user with decisions of where to put songs. Looking to solve a real problem, I found that I hesitate to play my playlists when I feel it's too eclectic for the room and opted to use Spotify's popularity rating of songs to make that decision easier.

* Served as a good review of ES6 and application of setting the state of React Components

Spotify player react code forked from: https://github.com/JoeKarlsson/react-spotify-player
