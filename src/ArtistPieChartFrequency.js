import React, { useRef } from 'react'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend)

function ArtistPieChartFrequency({ songs }) {
  const chartRef = useRef(null) // ref for the Pie chart

  // Count number of songs per artist
  const artistCount = {}
  songs.forEach(song => {
    artistCount[song.artistName] = (artistCount[song.artistName] || 0) + 1
  })

  // Prepare chart data
  const data = {
    labels: Object.keys(artistCount), // artist names as labels
    datasets: [
      {
        data: Object.values(artistCount), // number of songs per artist
        backgroundColor: [
          "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
          "#FF9F40", "#E7E9ED", "#8B0000", "#00FF00", "#FFD700"
        ] // colors for slices
      }
    ]
  }

  return <Pie ref={chartRef} data={data} /> // render Pie chart
}

export default ArtistPieChartFrequency