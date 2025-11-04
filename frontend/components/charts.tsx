import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import axios from "axios";

type ChartStatus = "pending" | "success" | "failed";

type Props = {
  // Optional prop. If provided, Charts will show data for that status and hide the select.
  status?: ChartStatus;
};

export default function Charts({ status }: Props) {
  const [data, setData] = useState<any[]>([]);
  const [selected, setSelected] = useState<ChartStatus>("pending"); // local fallback selection

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/payments/dashboard`)
      .then((res) => setData(res.data.monthlySummary || []))
      .catch((err) => console.error(err));
  }, []);

  // If the parent passes `status`, use it; otherwise use the local select value.
  const active: ChartStatus = (status as ChartStatus) ?? selected;

  // The backend field names may use `cleared` for successful payments. Map accordingly.
  const dataKey = active === "success" ? "cleared" : active;

  const color = active === "success" ? "#22c55e" : active === "failed" ? "#ef4444" : "#f59e0b";

  return (
    <div >
      <div className="flex justify-between items-center mb-3">
       

        {!status && (
          <select
            className="border rounded-md px-3 py-1"
            value={selected}
            onChange={(e) => setSelected(e.target.value as ChartStatus)}
          >
            <option value="pending">Pending</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
        )}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey={dataKey} stroke={color} fillOpacity={0.3} fill={color} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
