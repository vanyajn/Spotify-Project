// Function to process raw Spotify streaming data
export function processSpotifyData(rawData) {
    const songStats = {} // store aggregated stats per song
  
    rawData.forEach(entry => {
      const song = entry.trackName
      const artist = entry.artistName
      const msPlayed = entry.msPlayed
  
      // ignore really short plays under 30 seconds
      if (msPlayed < 30 * 1000) return
  
      const key = `${song} - ${artist}` // unique key per song+artist
  
      // initialize stats if first encounter
      if (!songStats[key]) {
        songStats[key] = { song, artist, totalMs: 0, plays: 0 }
      }
  
      // accumulate total play time and count
      songStats[key].totalMs += msPlayed
      songStats[key].plays += 1
    })
  
    // convert total milliseconds to minutes for readability
    const processed = Object.values(songStats).map(stat => ({
      song: stat.song,
      artist: stat.artist,
      minutes: parseFloat((stat.totalMs / (1000 * 60)).toFixed(1)), // 1 decimal
      plays: stat.plays
    }))
  
    return processed // return array of processed song stats
  }