tell application "Spotify"
	set playingArtist to artist of current track as string
	set playingTrack to name of current track as string
	set playingAlbum to album of current track as string
	set trackId to id of current track as string
	set trackNumber to track number of current track as integer
	set currentPosition to player position as integer
	set trackDuration to duration of current track as integer
	set playerState to player state as string
	return {trackId, playingArtist, playingTrack, playingAlbum, trackNumber, currentPosition, trackDuration, playerState}
end tell