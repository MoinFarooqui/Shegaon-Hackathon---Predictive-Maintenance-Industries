import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const data = [
  { name: "Day 1", health: 90 },
  { name: "Day 2", health: 85 },
  { name: "Day 3", health: 80 },
  { name: "Day 4", health: 70 },
  { name: "Day 5", health: 60 },
];

const Chart = () => {
  return (
<div className="backdrop-blur-lg bg-white/10 border border-white/20 p-4 rounded-2xl shadow-lg">      <h2 className="font-bold mb-4">Machine Health</h2>

      <LineChart width={500} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="health" />
      </LineChart>
    </div>
  );
};

export default Chart;