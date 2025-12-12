import React, { useState, useRef, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { FiUpload, FiMusic, FiHeadphones, FiBarChart2 } from 'react-icons/fi';
import './App.css';

// Register Chart.js components and plugins to be used.
ChartJS.register(ArcElement, Tooltip, Legend, Title, ChartDataLabels);

function App() {
  // State to store the list of unique songs, initialized as an empty array.
  const [uniqueSongs, setUniqueSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadHover, setUploadHover] = useState(false);
  // Ref to access the chart instance directly, if needed.
  const chartRef = useRef(null);

  // Add animation class when component mounts
  useEffect(() => {
    document.body.classList.add('loaded');
    return () => {
      document.body.classList.remove('loaded');
    };
  }, []);

  /**
   * Handles the file upload event.
   * Reads the uploaded JSON file and processes the data to find unique songs.
   * A song is considered "played" if its duration (msPlayed) is at least 30 seconds.
   */
  const handleFileUpload = (event) => {
    setIsLoading(true);
    const file = event.target.files[0];
    if (!file) {
      setIsLoading(false);
      return;
    }

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
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
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
    <div className="app-container">
      <header className="header">
        <div className="header-icon">
          <FiHeadphones size={40} />
        </div>
        <h1>Spotify Stream History</h1>
        <p>Discover your listening patterns and explore your favorite artists in style</p>
      </header>

      <div className="upload-section">
        <div className="upload-icon">
          <FiUpload size={32} />
        </div>
        <h2>Upload Your Listening Data</h2>
        <p>Simply upload your <code>StreamingHistory.json</code> file to unlock your personalized music insights</p>
        <div className="file-input">
          <input 
            type="file" 
            id="file-upload" 
            accept=".json" 
            onChange={handleFileUpload}
            disabled={isLoading}
          />
          <label 
            htmlFor="file-upload"
            onMouseEnter={() => setUploadHover(true)}
            onMouseLeave={() => setUploadHover(false)}
            className={isLoading ? 'loading' : ''}
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                <FiUpload size={18} style={{ 
                  transform: uploadHover ? 'translateX(3px)' : 'none',
                  transition: 'transform 0.3s ease'
                }} />
                <span>Choose JSON File</span>
              </>
            )}
          </label>
          <p className="file-hint">Find this file in your Spotify data download</p>
        </div>
      </div>

      {uniqueSongs.length > 0 && (
        <>
          <div className="stats-container">
            <div className="stats-card">
              <div className="stat-icon">
                <FiMusic size={24} />
              </div>
              <h3>Unique Songs</h3>
              <p>{uniqueSongs.length.toLocaleString()}</p>
              <div className="stat-badge">
                <span>Total</span>
              </div>
            </div>
            
            <div className="stats-card">
              <div className="stat-icon">
                <FiBarChart2 size={24} />
              </div>
              <h3>Top Artists</h3>
              <p>{new Set(uniqueSongs.map(song => song.artistName)).size}</p>
              <div className="stat-badge">
                <span>Unique</span>
              </div>
            </div>
          </div>

          <div className="chart-container">
            <Pie 
              ref={chartRef} 
              data={pieData} 
              options={{
                ...pieOptions,
                plugins: {
                  ...pieOptions.plugins,
                  legend: {
                    ...pieOptions.plugins.legend,
                    labels: {
                      ...pieOptions.plugins.legend.labels,
                      color: '#b3b3b3',
                      font: {
                        size: 14,
                        family: 'Circular, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
                      }
                    }
                  },
                  title: {
                    ...pieOptions.plugins.title,
                    color: '#ffffff',
                    font: {
                      size: 22,
                      weight: 'bold',
                      family: 'Circular, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
                    }
                  }
                }
              }} 
            />
          </div>
        </>
      )}
    </div>
  );
}

export default App;