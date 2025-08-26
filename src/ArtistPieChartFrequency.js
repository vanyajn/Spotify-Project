import React, { useRef } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register Chart.js components and plugin
ChartJS.register(ArcElement, Tooltip, Legend, Title, ChartDataLabels);

function ArtistPieChartFrequency({ songs }) {
  const chartRef = useRef(null);

  // Count number of songs per artist
  const artistCount = {};
  songs.forEach(song => {
    artistCount[song.artistName] = (artistCount[song.artistName] || 0) + 1;
  });

  // Sort artists by count
  const sortedArtists = Object.entries(artistCount)
    .sort((a, b) => b[1] - a[1]);

  // Take top 5 artists, group the rest as "Other"
  const topArtists = sortedArtists.slice(0, 5);
  const otherCount = sortedArtists.slice(5).reduce((sum, a) => sum + a[1], 0);

  const labels = topArtists.map(a => a[0]);
  const dataValues = topArtists.map(a => a[1]);
  if (otherCount > 0) {
    labels.push('Other');
    dataValues.push(otherCount);
  }

  const data = {
    labels: labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: [
          '#4CAF50', '#FF9800', '#2196F3', '#E91E63', '#9C27B0', '#B0BEC5'
        ],
        borderColor: '#fff',
        borderWidth: 1,
        hoverOffset: 20,
        borderRadius: 10
      }
    ]
  };

  const options = {
    plugins: {
      title: {
        display: true,
        text: 'Top 5 Most Streamed Artists',
        font: { size: 20, weight: 'bold' },
        padding: { top: 10, bottom: 20 }
      },
      legend: {
        position: 'right',
        labels: { boxWidth: 20, padding: 15 }
      },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold', size: 14 },
        formatter: (value, context) => {
          const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
          return ((value / total) * 100).toFixed(1) + '%';
        },
        anchor: 'end',  // moves label towards the outer edge of the slice
        align: 'start',  // positions label above the center (toward outer edge)
        offset: -20     // optional: fine-tune distance; negative moves inside slice
      }
    }
  };

  return <Pie ref={chartRef} data={data} options={options} />;
}

export default ArtistPieChartFrequency;