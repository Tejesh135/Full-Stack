import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import ConfirmDialog from "../components/ConfirmDialog";
import Modal from "../components/Modal";
import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";
import { useAuth } from "../context/AuthContext";
import { getProjects } from "../services/projectService";
import { addTaskComment, createTask, deleteTask, getTaskById, getTasks, updateTask } from "../services/taskService";
import { getUsers } from "../services/userService";
import useDebounce from "../hooks/useDebounce";

const taskSchema = z.object({
  title: z.string().min(2, "Task title is required"),
  description: z.string().min(4, "Task description is required"),
  priority: z.enum(["Low", "Medium", "High"]),
  status: z.enum(["Todo", "In Progress", "Completed"]),
  dueDate: z.string().min(1, "Due date is required"),
  assignedTo: z.string().min(1, "Assignee is required"),
  projectId: z.string().min(1, "Project is required")
});

const initialFilters = { status: "", priority: "", assignedTo: "", dueDate: "", search: "" };

const TasksPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [taskDetails, setTaskDetails] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const [comment, setComment] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const debouncedSearch = useDebounce(filters.search, 350);
  const [pagination, setPagination] = useState({ page: 1, limit: 8, totalPages: 1 });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "Medium",
      status: "Todo",
      dueDate: "",
      assignedTo: "",
      projectId: ""
    }
  });

  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  const loadData = async (nextPage = pagination.page) => {
    try {
      setLoading(true);
      const [taskResponse, projectResponse, userResponse] = await Promise.all([
        getTasks({ ...filters, search: debouncedSearch, page: nextPage, limit: pagination.limit }),
        getProjects({ page: 1, limit: 200 }),
        isAdmin ? getUsers({ page: 1, limit: 200 }) : Promise.resolve({ data: [] })
      ]);
      setTasks(taskResponse.data);
      setPagination(taskResponse.pagination);
      setProjects(projectResponse.data || []);
      setUsers(userResponse.data || []);
    } catch (error) {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
  }, [debouncedSearch, filters.status, filters.priority, filters.assignedTo, filters.dueDate]);

  const activeUsers = useMemo(() => (isAdmin ? users : [user].filter(Boolean)), [users, user, isAdmin]);

  const openCreateModal = () => {
    setEditingTask(null);
    reset({
      title: "",
      description: "",
      priority: "Medium",
      status: "Todo",
      dueDate: "",
      assignedTo: "",
      projectId: ""
    });
    setIsManageModalOpen(true);
  };

  const startEdit = (task) => {
    setEditingTask(task);
    setValue("title", task.title);
    setValue("description", task.description);
    setValue("priority", task.priority);
    setValue("status", task.status);
    setValue("dueDate", task.dueDate?.slice(0, 10));
    setValue("assignedTo", task.assignedTo?._id || "");
    setValue("projectId", task.projectId?._id || "");
    setIsManageModalOpen(true);
  };

  const saveTask = async (values) => {
    try {
      if (editingTask) {
        await updateTask(editingTask._id, values);
        toast.success("Task updated");
      } else {
        await createTask(values);
        toast.success("Task created");
      }
      setIsManageModalOpen(false);
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save task");
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteTask(deleteId);
      setDeleteId(null);
      toast.success("Task deleted");
      await loadData();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const openTaskDetails = async (taskId) => {
    try {
      const data = await getTaskById(taskId);
      setTaskDetails(data);
      setIsTaskModalOpen(true);
    } catch (error) {
      toast.error("Failed to load task details");
    }
  };

  const submitComment = async () => {
    if (!comment.trim() || !taskDetails) return;
    try {
      setIsCommentSubmitting(true);
      const newComment = await addTaskComment(taskDetails._id, { message: comment.trim() });
      setTaskDetails({ ...taskDetails, comments: [...(taskDetails.comments || []), newComment] });
      setComment("");
      toast.success("Comment added");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add comment");
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900">
        <div className="grid gap-3 md:grid-cols-6">
          <input
            className="rounded border p-2 dark:border-slate-700 dark:bg-slate-900"
            placeholder="Search title/description"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select className="rounded border p-2 dark:border-slate-700 dark:bg-slate-900" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All status</option>
            {["Todo", "In Progress", "Completed"].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select className="rounded border p-2 dark:border-slate-700 dark:bg-slate-900" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
            <option value="">All priority</option>
            {["Low", "Medium", "High"].map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
          <input
            className="rounded border p-2 dark:border-slate-700 dark:bg-slate-900"
            type="date"
            value={filters.dueDate}
            onChange={(e) => setFilters({ ...filters, dueDate: e.target.value })}
          />
          <select
            className="rounded border p-2 dark:border-slate-700 dark:bg-slate-900"
            value={filters.assignedTo}
            onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
          >
            <option value="">All assignees</option>
            {activeUsers.map((member) => (
              <option key={member._id || member.id} value={member._id || member.id}>
                {member.name}
              </option>
            ))}
          </select>
          {isAdmin ? (
            <button className="rounded bg-blue-600 px-4 py-2 text-white" onClick={openCreateModal}>
              New Task
            </button>
          ) : (
            <button className="rounded border px-4 py-2 dark:border-slate-700" onClick={() => setFilters(initialFilters)}>
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900">
          {Array.from({ length: 8 }).map((_, idx) => (
            <Skeleton key={idx} className="h-12" />
          ))}
        </div>
      ) : !tasks.length ? (
        <EmptyState title="No tasks found" description="Try adjusting filters or create a new task." />
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm dark:bg-slate-900">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Project</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Priority</th>
                <th className="p-3 text-left">Due Date</th>
                <th className="p-3 text-left">Assigned To</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task._id} className="border-t dark:border-slate-800">
                  <td className="p-3">
                    <button className="text-left font-medium text-blue-600" onClick={() => openTaskDetails(task._id)}>
                      {task.title}
                    </button>
                  </td>
                  <td className="p-3">{task.projectId?.title}</td>
                  <td className="p-3">{task.status}</td>
                  <td className="p-3">{task.priority}</td>
                  <td className="p-3">{new Date(task.dueDate).toLocaleDateString()}</td>
                  <td className="p-3">{task.assignedTo?.name}</td>
                  <td className="p-3">
                    {isAdmin ? (
                      <div className="flex gap-2">
                        <button className="text-blue-600" onClick={() => startEdit(task)}>
                          Edit
                        </button>
                        <button className="text-red-600" onClick={() => setDeleteId(task._id)}>
                          Delete
                        </button>
                      </div>
                    ) : (
                      <select
                        className="rounded border p-1 dark:border-slate-700 dark:bg-slate-900"
                        value={task.status}
                        onChange={async (e) => {
                          try {
                            await updateTask(task._id, { status: e.target.value });
                            toast.success("Status updated");
                            await loadData();
                          } catch (error) {
                            toast.error("Update failed");
                          }
                        }}
                      >
                        {["Todo", "In Progress", "Completed"].map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4">
            <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={loadData} />
          </div>
        </div>
      )}

      <Modal
        open={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        title={editingTask ? "Edit Task" : "Create Task"}
        footer={
          <div className="flex justify-end gap-2">
            <button className="rounded border px-4 py-2 text-sm dark:border-slate-700" onClick={() => setIsManageModalOpen(false)}>
              Cancel
            </button>
            <button className="rounded bg-blue-600 px-4 py-2 text-sm text-white" onClick={handleSubmit(saveTask)} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Task"}
            </button>
          </div>
        }
      >
        <div className="grid gap-3">
          <input className="rounded border p-2 dark:border-slate-700 dark:bg-slate-900" placeholder="Task title" {...register("title")} />
          {errors.title ? <p className="text-xs text-red-500">{errors.title.message}</p> : null}
          <textarea className="rounded border p-2 dark:border-slate-700 dark:bg-slate-900" placeholder="Task description" {...register("description")} />
          {errors.description ? <p className="text-xs text-red-500">{errors.description.message}</p> : null}
          <div className="grid gap-3 md:grid-cols-2">
            <select className="rounded border p-2 dark:border-slate-700 dark:bg-slate-900" {...register("priority")}>
              {["Low", "Medium", "High"].map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
            <select className="rounded border p-2 dark:border-slate-700 dark:bg-slate-900" {...register("status")}>
              {["Todo", "In Progress", "Completed"].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <input className="rounded border p-2 dark:border-slate-700 dark:bg-slate-900" type="date" {...register("dueDate")} />
          {errors.dueDate ? <p className="text-xs text-red-500">{errors.dueDate.message}</p> : null}
          <select className="rounded border p-2 dark:border-slate-700 dark:bg-slate-900" {...register("projectId")}>
            <option value="">Select project</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.title}
              </option>
            ))}
          </select>
          {errors.projectId ? <p className="text-xs text-red-500">{errors.projectId.message}</p> : null}
          <select className="rounded border p-2 dark:border-slate-700 dark:bg-slate-900" {...register("assignedTo")}>
            <option value="">Assign user</option>
            {activeUsers.map((member) => (
              <option key={member._id || member.id} value={member._id || member.id}>
                {member.name}
              </option>
            ))}
          </select>
          {errors.assignedTo ? <p className="text-xs text-red-500">{errors.assignedTo.message}</p> : null}
        </div>
      </Modal>

      <Modal open={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title={taskDetails?.title || "Task Details"}>
        {!taskDetails ? (
          <Skeleton className="h-24" />
        ) : (
          <div className="space-y-4">
            <div className="rounded border p-3 text-sm dark:border-slate-700">
              <p>{taskDetails.description}</p>
              <p className="mt-2 text-slate-500 dark:text-slate-400">
                Status: {taskDetails.status} | Priority: {taskDetails.priority}
              </p>
            </div>
            <div>
              <h4 className="font-semibold">Comments</h4>
              <div className="mt-2 max-h-60 space-y-2 overflow-y-auto">
                {(taskDetails.comments || []).length ? (
                  taskDetails.comments.map((item) => (
                    <div key={item._id} className="rounded border p-2 text-sm dark:border-slate-700">
                      <p>{item.message}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {item.user?.name || "User"} - {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No comments yet.</p>
                )}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  className="flex-1 rounded border p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  placeholder="Write a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button className="rounded bg-blue-600 px-3 py-2 text-sm text-white" onClick={submitComment} disabled={isCommentSubmitting}>
                  {isCommentSubmitting ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete task?"
        description="This action cannot be undone."
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default TasksPage;
