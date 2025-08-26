import React, { useState, useRef } from 'react'
import { Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

// Register Chart.js components and datalabels plugin
ChartJS.register(ArcElement, Tooltip, Legend, Title, ChartDataLabels)

function App() {
  const [uniqueSongs, setUniqueSongs] = useState([]) // store unique songs after filtering
  const chartRef = useRef(null) // ref for the Pie chart

  // Handle JSON file upload from user
  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)

        // Filter out plays under 30 seconds
        const filtered = data.filter(entry => entry.msPlayed >= 30 * 1000)

        // Keep only unique songs
        const seen = new Set()
        const unique = filtered.filter(entry => {
          const songKey = entry.trackName + '___' + entry.artistName
          if (seen.has(songKey)) return false
          seen.add(songKey)
          return true
        })

        setUniqueSongs(unique) // update state with unique songs
      } catch (err) {
        console.error('Invalid JSON file', err)
        alert('Please upload a valid Spotify JSON file')
      }
    }
    reader.readAsText(file)
  }

  // Prepare Pie chart data
  const pieData = React.useMemo(() => {
    const artistCount = {}
    uniqueSongs.forEach(song => {
      artistCount[song.artistName] = (artistCount[song.artistName] || 0) + 1
    })

    // Sort artists by song count descending
    const sortedArtists = Object.entries(artistCount).sort((a, b) => b[1] - a[1])
    const topArtists = sortedArtists.slice(0, 5) // top 5 artists
    const otherCount = sortedArtists.slice(5).reduce((sum, a) => sum + a[1], 0) // sum remaining as "Other"

    // Labels and data for chart
    const labels = topArtists.map(a => a[0])
    const dataValues = topArtists.map(a => a[1])
    if (otherCount > 0) {
      labels.push('Other')
      dataValues.push(otherCount)
    }

    // Slice colors
    const backgroundColors = ['#4CAF50', '#FF9800', '#2196F3', '#E91E63', '#9C27B0', '#B0BEC5']

    return {
      labels,
      datasets: [
        {
          data: dataValues,
          backgroundColor: backgroundColors,
          borderColor: '#fff',
          borderWidth: 1,
          hoverOffset: 20,
          borderRadius: 10 // round slice edges
        }
      ]
    }
  }, [uniqueSongs])

  // Pie chart display options
  const pieOptions = {
    plugins: {
      title: {
        display: true,
        text: 'Top 5 Most Streamed Artists',
        font: { size: 22, weight: 'bold' },
        padding: { top: 10, bottom: 20 } // spacing around title
      },
      legend: {
        position: 'right',
        labels: { boxWidth: 20, padding: 15, font: { size: 14 } } // style legend
      },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold', size: 14 },
        formatter: (value, context) => {
          const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0)
          return ((value / total) * 100).toFixed(1) + '%' // show percentage
        },
        anchor: 'center', // place label inside slice
        align: 'center'   // center label in slice
      }
    },
    responsive: true,
    maintainAspectRatio: false
  }

  return (
    <div style={{
      maxWidth: '900px',
      margin: '40px auto',
      padding: '20px',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      borderRadius: '12px'
    }}>
      <h1 style={{ marginBottom: '30px' }}>Spotify Stream History</h1>

      {/* File upload section */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '10px' }}>Upload your Spotify JSON</h2>
        <input type="file" accept=".json" onChange={handleFileUpload} /> 
      </div>

      {/* Display total unique songs */}
      {uniqueSongs.length > 0 && (
        <p style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '500' }}>
          Total unique songs: {uniqueSongs.length} 
        </p>
      )}

      {/* Render Pie chart if there are songs */}
      {uniqueSongs.length > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '900px',
          height: '700px',
          margin: 'auto'
        }}>
          <div style={{ flex: 1 }}>
            <Pie ref={chartRef} data={pieData} options={pieOptions} />
          </div>
        </div>
      )}
    </div>
  )
}

export default App