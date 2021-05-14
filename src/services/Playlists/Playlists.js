import React from "react";
function Playlist(props) {
    // var os = props.playlists
    // os = props.playlists.map(item => <div> {item} </div>)
    // console.log(Array.isArray(os))
    // console.log(os)


    return (
        <div>
            {props.playlists && props.playlists.map(item => <div> {item} </div>)}
        </div>
        );
}

export default Playlist;