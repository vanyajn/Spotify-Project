export function processSpotifyData(rawData) {
    const songStats = {};
  
    rawData.forEach(entry => {
      const song = entry.trackName;
      const artist = entry.artistName;
      const msPlayed = entry.msPlayed;
  
      // Ignore really short plays (<30s)
      if (msPlayed < 30 * 1000) return;
  
      const key = `${song} - ${artist}`;
      if (!songStats[key]) {
        songStats[key] = { song, artist, totalMs: 0, plays: 0 };
      }
  
      songStats[key].totalMs += msPlayed;
      songStats[key].plays += 1;
    });
  
    // Convert ms → minutes for readability
    const processed = Object.values(songStats).map(stat => ({
      song: stat.song,
      artist: stat.artist,
      minutes: parseFloat((stat.totalMs / (1000 * 60)).toFixed(1)),
      plays: stat.plays,
    }));
  
    return processed;
  }
  