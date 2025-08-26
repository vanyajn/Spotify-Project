import React, { useState, useRef } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register Chart.js components and plugins to be used.
ChartJS.register(ArcElement, Tooltip, Legend, Title, ChartDataLabels);

function App() {
  // State to store the list of unique songs, initialized as an empty array.
  const [uniqueSongs, setUniqueSongs] = useState([]);
  // Ref to access the chart instance directly, if needed.
  const chartRef = useRef(null);

  /**
   * Handles the file upload event.
   * Reads the uploaded JSON file and processes the data to find unique songs.
   * A song is considered "played" if its duration (msPlayed) is at least 30 seconds.
   */
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // Parse the JSON content from the file.
        const data = JSON.parse(e.target.result);
        // Filter out songs played for less than 30 seconds (30,000 milliseconds).
        const filtered = data.filter(entry => entry.msPlayed >= 30 * 1000);

        // Use a Set to efficiently track and filter for unique songs.
        const seen = new Set();
        const unique = filtered.filter(entry => {
          // Create a unique key for each song based on its name and artist.
          const songKey = entry.trackName + '___' + entry.artistName;
          if (seen.has(songKey)) return false; // If seen, skip it.
          seen.add(songKey); // Otherwise, add it to the Set.
          return true;
        });

        // Update the state with the list of unique songs.
        setUniqueSongs(unique);
      } catch (err) {
        // Log and alert the user if the file is not a valid JSON.
        console.error('Invalid JSON file', err);
        alert('Please upload a valid Spotify JSON file.');
      }
    };
    reader.readAsText(file); // Start reading the file as text.
  };

  /**
   * Memoized pie chart data.
   * This hook re-computes the data only when the uniqueSongs state changes.
   * It counts the number of unique songs per artist and groups the top 5.
   */
  const pieData = React.useMemo(() => {
    // Count occurrences of each artist.
    const artistCount = {};
    uniqueSongs.forEach(song => {
      artistCount[song.artistName] = (artistCount[song.artistName] || 0) + 1;
    });

    // Sort artists by song count in descending order.
    const sortedArtists = Object.entries(artistCount).sort((a, b) => b[1] - a[1]);
    // Get the top 5 artists.
    const topArtists = sortedArtists.slice(0, 5);
    // Sum the counts of all other artists to be grouped as 'Other'.
    const otherCount = sortedArtists.slice(5).reduce((sum, a) => sum + a[1], 0);

    // Prepare labels and data values for the chart.
    const labels = topArtists.map(a => a[0]);
    const dataValues = topArtists.map(a => a[1]);
    if (otherCount > 0) {
      labels.push('Other');
      dataValues.push(otherCount);
    }

    // Define a set of colors for the chart slices.
    const backgroundColors = ['#4CAF50', '#FF9800', '#2196F3', '#E91E63', '#9C27B0', '#B0BEC5'];

    // Return the formatted data object for the Pie chart component.
    return {
      labels,
      datasets: [
        {
          data: dataValues,
          backgroundColor: backgroundColors,
          borderColor: '#fff',
          borderWidth: 1,
          hoverOffset: 20,
          borderRadius: 10
        }
      ]
    };
  }, [uniqueSongs]);

  // Options for the pie chart, including title, legend, and data label customization.
  const pieOptions = {
    plugins: {
      title: {
        display: true,
        text: 'Top 5 Most Streamed Artists',
        font: { size: 22, weight: 'bold' },
        padding: { top: 10, bottom: 20 }
      },
      legend: {
        position: 'right', // Position the legend on the right side of the chart.
        labels: { boxWidth: 20, padding: 15, font: { size: 14 } }
      },
      datalabels: {
        color: '#fff', // Color of the data labels.
        font: { weight: 'bold', size: 14 },
        formatter: (value, context) => {
          // Format the label as a percentage.
          const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
          return ((value / total) * 100).toFixed(1) + '%';
        },
        anchor: 'center',  // Position the label inside the slice.
        align: 'end',      // Align the label toward the outer edge.
        offset: 30         // Push the label 30 pixels from the center.
      }
    },
    responsive: true,
    maintainAspectRatio: true
  };

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

      {/* Display total unique songs count if data is loaded */}
      {uniqueSongs.length > 0 && (
        <p style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '500' }}>
          Total unique songs: {uniqueSongs.length}
        </p>
      )}

      {/* Pie chart display section */}
      {uniqueSongs.length > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '900px',
          margin: 'auto'
        }}>
          {/* Chart container with responsive sizing */}
          <div style={{ flex: 1, maxWidth: '700px', height: '700px' }}>
            <Pie ref={chartRef} data={pieData} options={pieOptions} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;