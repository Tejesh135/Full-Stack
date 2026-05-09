import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";
import Skeleton from "../components/Skeleton";
import { getUsers } from "../services/userService";
import useDebounce from "../hooks/useDebounce";

const TeamMembersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });

  const load = async (nextPage = pagination.page) => {
    try {
      setLoading(true);
      const response = await getUsers({ page: nextPage, limit: pagination.limit, search: debouncedSearch });
      setUsers(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, [debouncedSearch]);

  return (
    <div className="space-y-4">
      <input
        className="w-full max-w-sm rounded border bg-white p-2 dark:border-slate-700 dark:bg-slate-900"
        placeholder="Search team members..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="overflow-x-auto rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} className="h-12" />
            ))}
          </div>
        ) : !users.length ? (
          <EmptyState title="No users found" description="Try another search term." />
        ) : (
          <>
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((member) => (
                  <tr key={member._id} className="border-t dark:border-slate-800">
                    <td className="p-3">{member.name}</td>
                    <td className="p-3">{member.email}</td>
                    <td className="p-3">{member.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={load} />
          </>
        )}
      </div>
    </div>
  );
};

export default TeamMembersPage;
