import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";
import Skeleton from "../components/Skeleton";
import { getActivities } from "../services/activityService";

const ActivityPage = () => {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, totalPages: 1 });

  const load = async (nextPage = pagination.page) => {
    try {
      setLoading(true);
      const response = await getActivities({ page: nextPage, limit: pagination.limit });
      setActivity(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error("Failed to load activity");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900">
      <h2 className="mb-4 text-lg font-semibold">Activity Logs</h2>
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, idx) => (
            <Skeleton key={idx} className="h-14" />
          ))}
        </div>
      ) : !activity.length ? (
        <EmptyState title="No activity found" description="Actions across the app will show up here." />
      ) : (
        <>
          <div className="space-y-2">
            {activity.map((item) => (
              <div key={item._id} className="rounded border p-3 dark:border-slate-700">
                <p className="text-sm font-medium">{item.message}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {item.performedBy?.name || "User"} • {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={load} />
        </>
      )}
    </div>
  );
};

export default ActivityPage;
