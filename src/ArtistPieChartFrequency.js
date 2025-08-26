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

ChartJS.register(ArcElement, Tooltip, Legend, Title, ChartDataLabels);

function App() {
  const [uniqueSongs, setUniqueSongs] = useState([]);
  const chartRef = useRef(null);

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const filtered = data.filter(entry => entry.msPlayed >= 30 * 1000);

        const seen = new Set();
        const unique = filtered.filter(entry => {
          const songKey = entry.trackName + '___' + entry.artistName;
          if (seen.has(songKey)) return false;
          seen.add(songKey);
          return true;
        });

        setUniqueSongs(unique);
      } catch (err) {
        console.error('Invalid JSON file', err);
        alert('Please upload a valid Spotify JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Pie chart data
  const pieData = React.useMemo(() => {
    const artistCount = {};
    uniqueSongs.forEach(song => {
      artistCount[song.artistName] = (artistCount[song.artistName] || 0) + 1;
    });

    const sortedArtists = Object.entries(artistCount).sort((a, b) => b[1] - a[1]);
    const topArtists = sortedArtists.slice(0, 5);
    const otherCount = sortedArtists.slice(5).reduce((sum, a) => sum + a[1], 0);

    const labels = topArtists.map(a => a[0]);
    const dataValues = topArtists.map(a => a[1]);
    if (otherCount > 0) {
      labels.push('Other');
      dataValues.push(otherCount);
    }

    const backgroundColors = ['#4CAF50', '#FF9800', '#2196F3', '#E91E63', '#9C27B0', '#B0BEC5'];

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

  // Pie chart options
  const pieOptions = {
    plugins: {
      title: {
        display: true,
        text: 'Top 5 Most Streamed Artists',
        font: { size: 22, weight: 'bold' },
        padding: { top: 10, bottom: 20 }
      },
      legend: {
        position: 'right',
        labels: { boxWidth: 20, padding: 15, font: { size: 14 } }
      },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold', size: 14 },
        formatter: (value, context) => {
          const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
          return ((value / total) * 100).toFixed(1) + '%';
        },
        anchor: 'center',  // inside slice
        align: 'end',      // move toward outer edge of slice
        offset: 30         // adjust distance toward edge
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

      {/* File upload */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '10px' }}>Upload your Spotify JSON</h2>
        <input type="file" accept=".json" onChange={handleFileUpload} />
      </div>

      {/* Total unique songs */}
      {uniqueSongs.length > 0 && (
        <p style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '500' }}>
          Total unique songs: {uniqueSongs.length}
        </p>
      )}

      {/* Pie chart with legend on the right */}
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
          <div style={{ flex: 1, maxWidth: '700px', height: '700px' }}>
            <Pie ref={chartRef} data={pieData} options={pieOptions} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;