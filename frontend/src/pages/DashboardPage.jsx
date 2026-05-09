import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import toast from "react-hot-toast";
import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import { getDashboardStats } from "../services/dashboardService";

const COLORS = ["#2563eb", "#16a34a", "#ea580c", "#dc2626"];

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-24" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const cards = [
    { label: "Total Projects", value: stats.totalProjects },
    { label: "Total Tasks", value: stats.totalTasks },
    { label: "Completed Tasks", value: stats.completedTasks },
    { label: "Pending Tasks", value: stats.pendingTasks },
    { label: "Overdue Tasks", value: stats.overdueTasks }
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <h2 className="mb-4 font-semibold">Tasks by Status</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.tasksByStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Tasks" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <h2 className="mb-4 font-semibold">Tasks by Priority</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.tasksByPriority} dataKey="value" nameKey="name" outerRadius={100} label>
                  {stats.tasksByPriority.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <h2 className="mb-4 font-semibold">Task Creation Trend</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyTaskTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="tasks" stroke="#16a34a" fill="#16a34a33" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <h2 className="mb-4 font-semibold">Recent Activity</h2>
          {!stats.recentActivities?.length ? (
            <EmptyState title="No activity yet" description="Actions on tasks and projects will appear here." />
          ) : (
            <div className="space-y-3">
              {stats.recentActivities.map((item) => (
                <div key={item._id} className="rounded border p-3 text-sm dark:border-slate-700">
                  <p className="font-medium">{item.message}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
