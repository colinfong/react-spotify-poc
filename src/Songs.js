import React from "react";
function Songs(props) {
    return (
        <div>
            {props.songs && props.songs.map(item => <div> {item} </div>)}
        </div>
        );
}

export default Songs;