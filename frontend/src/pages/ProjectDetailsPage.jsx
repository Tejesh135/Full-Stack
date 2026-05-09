import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { getProjectById } from "../services/projectService";
import { getTasks } from "../services/taskService";

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [projectData, taskData] = await Promise.all([getProjectById(id), getTasks({ projectId: id, limit: 50 })]);
        setProject(projectData);
        setTasks(taskData.data || []);
      } catch (error) {
        toast.error("Failed to load project details");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <Loader />;
  if (!project) return <p>Project not found</p>;

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <h2 className="text-xl font-semibold">{project.title}</h2>
        <p className="mt-2 text-slate-600">{project.description}</p>
        <p className="mt-2 text-sm">Status: {project.status}</p>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-sm">
        <h3 className="mb-3 font-semibold">Team Members</h3>
        <div className="grid gap-2 md:grid-cols-2">
          {project.teamMembers.map((member) => (
            <div key={member._id} className="rounded border p-2 text-sm">
              <p className="font-medium">{member.name}</p>
              <p className="text-slate-500">{member.email}</p>
              <p className="text-slate-500">{member.role}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-sm">
        <h3 className="mb-3 font-semibold">Project Tasks</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-2 text-left">Title</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Priority</th>
                <th className="p-2 text-left">Assigned To</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task._id} className="border-t">
                  <td className="p-2">{task.title}</td>
                  <td className="p-2">{task.status}</td>
                  <td className="p-2">{task.priority}</td>
                  <td className="p-2">{task.assignedTo?.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
