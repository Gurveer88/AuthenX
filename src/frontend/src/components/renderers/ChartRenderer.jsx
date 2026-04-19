import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

export function ChartRenderer({ data }) {
  if (!data) return <div className="text-red-400">Invalid Chart Data</div>;

  let chartData = data;
  if (typeof data === 'string') {
    chartData = {
      chart_type: "bar",
      title: "Raw Output Fallback",
      data: {
        labels: ["Raw Output"],
        datasets: [{ label: "Error", data: [0], backgroundColor: ["#e15759"] }]
      },
      metadata: { source: "AI generated raw text instead of structured data." }
    };
  }

  if (!chartData.chart_type) return <div className="text-red-400">Invalid Chart Data</div>;

  const typeMap = {
    bar: 'bar',
    line: 'line',
    pie: 'pie',
    doughnut: 'doughnut',
    scatter: 'scatter',
    radar: 'radar',
    bubble: 'bubble'
  };

  const chartType = typeMap[chartData.chart_type] || 'bar';

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#a3a3a3' }
      },
      title: {
        display: !!chartData.title,
        text: chartData.title,
        color: '#f0ece8',
        font: { size: 16 }
      },
    },
    scales: (chartType === 'pie' || chartType === 'doughnut' || chartType === 'radar') ? {} : {
      x: {
        title: {
          display: !!chartData.options?.x_axis?.label,
          text: chartData.options?.x_axis?.label,
          color: '#a3a3a3'
        },
        ticks: { color: '#a3a3a3' },
        grid: { color: '#333' }
      },
      y: {
        title: {
          display: !!chartData.options?.y_axis?.label,
          text: chartData.options?.y_axis?.label,
          color: '#a3a3a3'
        },
        ticks: { color: '#a3a3a3' },
        grid: { color: '#333' }
      }
    }
  };

  return (
    <div className="w-full h-80 bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-4">
      <Chart type={chartType} data={chartData.data} options={options} />
      {chartData.metadata?.source && (
        <p className="text-[10px] text-neutral-500 text-center mt-2">Source: {chartData.metadata.source}</p>
      )}
    </div>
  );
}
