const {
	ipcRenderer,
	remote
} = require('electron');
const path = require('path');
const applescript = require('applescript');

var wrapper = document.getElementsByClassName("wrapper")[0];
var win = remote.getCurrentWindow();
var artwork = document.getElementById("artwork");
artwork.onload = function() {
	win.setSize(300, wrapper.scrollHeight + 44);
}
var artist = document.getElementById("artist");
var track = document.getElementById("track");
var album = document.getElementById("album");
var number = document.getElementById("number");

var tilNextTrack;
var playerState;

// am i really writing a vanilla js get function with es 6 standards? yes, yes i am
var get_artwork = (track_id) => {
	var query_id = track_id.split(":")[2];
	var base_url = "https://api.spotify.com/v1/tracks/";

	var XHR = new XMLHttpRequest();
	XHR.onreadystatechange = function() {
		if (XHR.readyState == XMLHttpRequest.DONE) {
			if (XHR.status == 200) {
				// console.log(JSON.parse(XHR.responseText));
				var json = JSON.parse(XHR.responseText);
				artwork.setAttribute("src", json['album']['images'][1]['url']);
				artist.setAttribute("href", json['artists'][0]['uri']);
				album.setAttribute("href", json['album']['uri']);
			}
			else if (XHR.status == 400) {
				// oh well
			}
			else {
				// wow
			}
		}
	};
	XHR.open("GET", base_url + query_id, true);
	XHR.send();
}

var refresh_view = () => {
	applescript.execFile(`${path.join(__dirname, 'blackbird.applescript')}`, (err, resp) => {
		console.log(err, resp);
		console.log(process);
		console.log(__dirname, path.join(__dirname, ''));
		if (err) {
			// oh well
		}
		else {
			/*
			resp:
				0: track id
				1: artist
				2: track
				3: album
				4: track number
				5: current position (s)
				6: track duration (ms)
				7: player state (playing/paused)
			*/
			if (Array.isArray(resp)) {
				get_artwork(resp[0]);
				artist.innerText = resp[1];
				track.innerText = resp[2];
				album.innerText = resp[3];
				number.innerText = resp[4].toString();

				playerState = resp[7];
				set_play_button(playerState);

				if (tilNextTrack) {
					clearTimeout(tilNextTrack);
				}
				tilNextTrack = setTimeout(() => {
					refresh_view();
				}, resp[6] - resp[5]*1000);
			}
		}
	});
}

var set_play_button = (state) => {
	var button = document.getElementById("play").childNodes[0];
	if (state == "playing") {
		button.setAttribute("class", "fi-pause");
	}
	else if (state == "paused") {
		button.setAttribute("class", "fi-play");
	}
}

document.getElementById("rewind").addEventListener('click', () => {
	applescript.execFile(`${path.join(__dirname, 'applescript/rewind.applescript')}`, (err, resp) => {
		refresh_view();
	});
});

var toggle_play_button = () => {
	playerState = (playerState == "playing" ? "paused" : "playing");
	set_play_button(playerState);
}

document.getElementById("play").addEventListener('click', () => {
	applescript.execFile(`${path.join(__dirname, 'applescript/play.applescript')}`, (err, resp) => {
		toggle_play_button();
	});
});

document.getElementById("forward").addEventListener('click', () => {
	applescript.execFile(`${path.join(__dirname, 'applescript/forward.applescript')}`, (err, resp) => {
		refresh_view();
	});
});

ipcRenderer.on('window-opened', (event, arg) => {
	refresh_view();
});

// try getting lyrics in there? https://www.musixmatch.com/lyrics/Alex-Turner/It-s-Hard-to-Get-Around-the-Wind