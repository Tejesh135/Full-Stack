import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/projects", label: "Projects" },
  { to: "/tasks", label: "Tasks" },
  { to: "/activity", label: "Activity Logs" },
  { to: "/team-members", label: "Team Members", adminOnly: true },
  { to: "/profile", label: "Profile" }
];

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();

  return (
    <>
      {open ? <button className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={onClose} /> : null}
      <aside
        className={`fixed left-0 top-0 z-40 h-full w-64 -translate-x-full bg-slate-900 text-white transition-transform md:static md:translate-x-0 ${
          open ? "translate-x-0" : ""
        }`}
      >
      <div className="border-b border-slate-700 p-4 text-xl font-bold">Team Task Manager</div>
      <nav className="p-3">
        {navItems
          .filter((item) => !item.adminOnly || user?.role === "Admin")
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `mb-1 block rounded px-3 py-2 text-sm ${isActive ? "bg-blue-600" : "hover:bg-slate-800"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
      </nav>
      </aside>
    </>
  );
};

export default Sidebar;
