## Popularify
An application used to filter your Spotify playlists for their most popular songs. Made for those moments you realize your musical taste could be too eclectic to share with the room. Currently built with React and will ultimately live in Node.js.

## Project Status

Proof of concept completed. Application is able to authenticate with a user's Spotify account(with implicit grant flow), retreieve their playlists, and order songs by their popularity.

Next steps are to move the logic to the backend in Node and create a simple UI

## Installation and Setup Instructions
Clone down this repository. You will need node and npm installed globally on your machine.

Create Required Files:

Installation:
`npm install`

Start server:
`npm start`

Visit App:
Run `http://localhost:3000` in your browser. 

TODO: Login details
TODO: app details

Design Considerations:
-React for...
-Node for...

Reflection:
* Project idea originally began as an app to recommend what playlists to sort songs into from uncategorized 'Liked Songs'. I found there was too much variation in users' decisions of where to put songs and the method I used(recommending playlists by similar genere to an uncategorized song) was too simplistic and the app doesn't save very much effort for a user to do that themselves. In addition, a UI for these recommendations would just clutter the user with decisions of where to put songs. Looking to solve a real problem, I found that I hesitate to share my music because I know it's quite eclectic and opted to use Spotify's popularity rating of songs to make that decision easier.

* ES6 is nice because...

