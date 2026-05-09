import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required")
});

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" }
  });

  const onSubmit = async (values) => {
    try {
      await login(values);
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 dark:bg-slate-950">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md rounded-xl bg-white p-6 shadow dark:bg-slate-900">
        <h1 className="mb-5 text-2xl font-bold">Login</h1>
        <input className="w-full rounded border p-2 dark:border-slate-700 dark:bg-slate-900" type="email" placeholder="Email" {...register("email")} />
        {errors.email ? <p className="mt-1 text-xs text-red-500">{errors.email.message}</p> : null}
        <input
          className="mt-3 w-full rounded border p-2 dark:border-slate-700 dark:bg-slate-900"
          type="password"
          placeholder="Password"
          {...register("password")}
        />
        {errors.password ? <p className="mt-1 text-xs text-red-500">{errors.password.message}</p> : null}
        <button className="mt-4 w-full rounded bg-blue-600 py-2 text-white" disabled={isSubmitting}>
          {isSubmitting ? "Please wait..." : "Login"}
        </button>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          Do not have an account?{" "}
          <Link className="text-blue-600" to="/signup">
            Signup
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
