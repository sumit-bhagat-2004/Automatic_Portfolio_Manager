'use client';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function SkillChart({ repo }) {
  if (!repo.languages || Object.keys(repo.languages).length === 0) {
    return <div className="text-gray-400 text-sm mt-2">No language data</div>;
  }

  const labels = Object.keys(repo.languages);
  const data = Object.values(repo.languages);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Language Usage (bytes)',
        data,
        backgroundColor: [
          '#F87171', '#60A5FA', '#34D399', '#FBBF24', '#A78BFA',
          '#F472B6', '#38BDF8', '#FCD34D', '#4ADE80', '#818CF8',
        ],
        borderColor: '#1F2937',
        borderWidth: 1,
      },
    ],
  };

  // Set a fixed small size for the chart to fit 4 per screen
  const options = {
    responsive: false,
    maintainAspectRatio: false,
    width: 120,
    height: 120,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="bg-gray-900 p-2 rounded-xl mt-4 flex justify-center items-center">
      <Pie data={chartData} width={120} height={120} options={options} />
    </div>
  );
}
