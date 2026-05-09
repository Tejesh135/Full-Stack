import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-4 text-center dark:bg-slate-950">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="mt-2 text-slate-600">Page not found</p>
      <Link to="/dashboard" className="mt-4 rounded bg-blue-600 px-4 py-2 text-white">
        Go to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;
