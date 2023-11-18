import React, {useState, useMemo, useCallback, useEffect, useRef,}from "react";
  import { Chart, ChartData, ChartOptions, } from "chart.js/auto";
  import axios from "axios";
  
  interface GraphData {
    labels: string[];
    datasets: Chart.ChartDataSets[];
  }
  
  interface ChartProps {
    type: Chart.ChartType;
    data: ChartData<
      | "line"
      | "bar"
      | "scatter"
      | "bubble"
      | "pie"
      | "doughnut"
      | "polarArea"
      | "radar",
      (number | Chart.ChartPoint | Chart.BubbleDataPoint | null)[]
    >;
    options?: ChartOptions;
  }
  
  const GraphChart = ({ type, data, options }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef();
  
    useEffect(() => {
      if (chartRef.current) {
        chartInstance.current = new Chart(chartRef.current, {
          type,
          data,
          options,
        });
      }
      return () => {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
      };
    }, [type, data, options]);
  
    useEffect(() => {
      if (chartInstance.current) {
        chartInstance.current.data = data;
        chartInstance.current.update();
      }
    }, [data]);
  
    return <canvas ref={chartRef} />;
  };
  
  const Graph = () => {
    const [graphData, setGraphData] = useState({ labels: [], datasets: [] });
    const [apiLink, setApiLink] = useState("");
  
    const chartRef = useRef(null);
  
    const handleApiLinkChange = (event) => {
      setApiLink(event.target.value);
    };
  
    const handleSubmit = async (event) => {
      event.preventDefault();
      try {
        const response = await axios.get(apiLink);
        const { data } = response.data;
  
        const graphLabels = data.map((item) => item.date_start);
        const graphDataSets = [
          {
            label: "Impressions",
            data: data.map((item) => item.impressions),
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
          {
            label: "Clicks",
            data: data.map((item) => item.clicks),
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ];
  
        setGraphData({
          labels: graphLabels,
          datasets: graphDataSets,
        });
      } catch (error) {
        console.error(error);
      }
    };

    return (
        <div>
          <form onSubmit={handleSubmit}>
            <label htmlFor="apiLink">API Link:</label>
            <input
              type="text"
              id="apiLink"
              value={apiLink}
              onChange={handleApiLinkChange}
            />
            <button type="submit">Gerar Gráfico</button>
          </form>
          <GraphChart type="line" data={graphData} />
        </div>
      );
};
export default Graph;