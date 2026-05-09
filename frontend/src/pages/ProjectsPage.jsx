import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import ConfirmDialog from "../components/ConfirmDialog";
import Modal from "../components/Modal";
import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";
import { useAuth } from "../context/AuthContext";
import { createProject, deleteProject, getProjects, updateProject } from "../services/projectService";
import { getUsers } from "../services/userService";
import useDebounce from "../hooks/useDebounce";

const schema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().min(4, "Description is required"),
  status: z.enum(["Active", "Completed", "On Hold"]),
  teamMembers: z.array(z.string()).default([])
});

const ProjectsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [pagination, setPagination] = useState({ page: 1, limit: 8, totalPages: 1 });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "", status: "Active", teamMembers: [] }
  });

  const loadData = async (nextPage = pagination.page) => {
    try {
      setLoading(true);
      const [projectsResponse, usersResponse] = await Promise.all([
        getProjects({ page: nextPage, limit: pagination.limit, search: debouncedSearch }),
        isAdmin ? getUsers({ page: 1, limit: 100 }) : Promise.resolve({ data: [] })
      ]);
      setProjects(projectsResponse.data);
      setPagination(projectsResponse.pagination);
      setUsers(usersResponse.data || []);
    } catch (error) {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
  }, [debouncedSearch]);

  const openCreateModal = () => {
    setEditingProject(null);
    reset({ title: "", description: "", status: "Active", teamMembers: [] });
    setIsModalOpen(true);
  };

  const startEdit = (project) => {
    setEditingProject(project);
    setValue("title", project.title);
    setValue("description", project.description);
    setValue("status", project.status);
    setValue(
      "teamMembers",
      project.teamMembers.map((member) => member._id)
    );
    setIsModalOpen(true);
  };

  const handleSaveProject = async (values) => {
    try {
      if (editingProject) {
        await updateProject(editingProject._id, values);
        toast.success("Project updated");
      } else {
        await createProject(values);
        toast.success("Project created");
      }
      setIsModalOpen(false);
      reset({ title: "", description: "", status: "Active", teamMembers: [] });
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save project");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProject(deleteId);
      setDeleteId(null);
      toast.success("Project deleted");
      await loadData();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900">
        <input
          className="w-full max-w-sm rounded border p-2 dark:border-slate-700 dark:bg-slate-900"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {isAdmin ? (
          <button className="rounded bg-blue-600 px-4 py-2 text-sm text-white" onClick={openCreateModal}>
            New Project
          </button>
        ) : null}
      </div>

      {loading ? (
        <div className="space-y-2 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-12" />
          ))}
        </div>
      ) : !projects.length ? (
        <EmptyState title="No projects found" description="Try a different search or create a new project." />
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm dark:bg-slate-900">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Status</th>
                <th className="p-3">Team Size</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project._id} className="border-t dark:border-slate-800">
                  <td className="p-3 font-medium">
                    <Link className="text-blue-600" to={`/projects/${project._id}`}>
                      {project.title}
                    </Link>
                  </td>
                  <td className="p-3">{project.status}</td>
                  <td className="p-3">{project.teamMembers.length}</td>
                  <td className="p-3">
                    {isAdmin ? (
                      <div className="flex gap-2">
                        <button className="text-blue-600" onClick={() => startEdit(project)}>
                          Edit
                        </button>
                        <button className="text-red-600" onClick={() => setDeleteId(project._id)}>
                          Delete
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400">View only</span>
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
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? "Edit Project" : "Create Project"}
        footer={
          <div className="flex justify-end gap-2">
            <button className="rounded border px-4 py-2 text-sm dark:border-slate-700" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button className="rounded bg-blue-600 px-4 py-2 text-sm text-white" onClick={handleSubmit(handleSaveProject)} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Project"}
            </button>
          </div>
        }
      >
        <div className="grid gap-3">
          <input className="rounded border p-2 dark:border-slate-700 dark:bg-slate-900" placeholder="Title" {...register("title")} />
          {errors.title ? <p className="text-xs text-red-500">{errors.title.message}</p> : null}
          <textarea className="rounded border p-2 dark:border-slate-700 dark:bg-slate-900" placeholder="Description" {...register("description")} />
          {errors.description ? <p className="text-xs text-red-500">{errors.description.message}</p> : null}
          <select className="rounded border p-2 dark:border-slate-700 dark:bg-slate-900" {...register("status")}>
            {["Active", "Completed", "On Hold"].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            multiple
            className="min-h-24 rounded border p-2 dark:border-slate-700 dark:bg-slate-900"
            {...register("teamMembers")}
          >
            {users.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name} ({member.role})
              </option>
            ))}
          </select>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete project?"
        description="This will delete the project and all associated tasks."
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default ProjectsPage;
