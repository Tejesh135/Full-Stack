import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const AppLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100 md:flex">
      <Sidebar open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="flex-1 p-4 md:p-6">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-white p-4 shadow-sm dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <button className="rounded border px-3 py-2 text-sm md:hidden dark:border-slate-700" onClick={() => setIsSidebarOpen(true)}>
              Menu
            </button>
            <div>
              <h1 className="text-lg font-semibold">Welcome, {user?.name}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Role: {user?.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded border px-3 py-2 text-sm dark:border-slate-700" onClick={toggleTheme}>
              {theme === "dark" ? "Light" : "Dark"}
            </button>
            <button className="rounded bg-slate-900 px-4 py-2 text-sm text-white dark:bg-blue-600" onClick={logout}>
              Logout
            </button>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
