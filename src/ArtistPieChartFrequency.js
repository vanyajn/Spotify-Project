import React, { useRef, useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title);

/**
 * Displays a pie chart of the top 5 artists by song frequency.
 * All other artists are grouped into an 'Other' category.
 */
function ArtistPieChartFrequency({ songs }) {
  const chartRef = useRef(null);

  // Prepare chart data, recalculating only when 'songs' changes
  const pieData = useMemo(() => {
    // Count how many songs each artist has
    const artistCount = {};
    songs.forEach(song => {
      artistCount[song.artistName] = (artistCount[song.artistName] || 0) + 1;
    });

    // Sort artists by number of songs (highest first)
    const sortedArtists = Object.entries(artistCount).sort((a, b) => b[1] - a[1]);

    // Take top 5 artists, combine the rest as "Other"
    const topArtists = sortedArtists.slice(0, 5);
    const otherCount = sortedArtists.slice(5).reduce((sum, a) => sum + a[1], 0);

    // Prepare chart labels and values
    const labels = topArtists.map(([artist]) => artist);
    const dataValues = topArtists.map(([, count]) => count);
    if (otherCount > 0) {
      labels.push('Other');
      dataValues.push(otherCount);
    }

    // Set slice colors
    const backgroundColors = [
      '#4CAF50', '#FF9800', '#2196F3', '#E91E63', '#9C27B0', '#B0BEC5'
    ];

    return {
      labels,
      datasets: [
        {
          data: dataValues,
          backgroundColor: backgroundColors,
          borderColor: '#fff',
          borderWidth: 1,
          hoverOffset: 20
        }
      ]
    };
  }, [songs]);

  // Chart options
  const pieOptions = {
    plugins: {
      title: {
        display: true,
        text: 'Top 5 Most Frequent Artists',
        font: { size: 20, weight: 'bold' }
      },
      legend: {
        position: 'right',
        labels: {
          boxWidth: 20,
          padding: 15
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  return (
    <div style={{ width: '100%', maxWidth: '700px', margin: 'auto' }}>
      <Pie ref={chartRef} data={pieData} options={pieOptions} />
    </div>
  );
}

export default ArtistPieChartFrequency;
