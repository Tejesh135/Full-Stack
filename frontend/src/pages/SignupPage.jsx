import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const roles = ["Admin", "Member"];

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "At least one uppercase letter")
    .regex(/[a-z]/, "At least one lowercase letter")
    .regex(/\d/, "At least one number")
    .regex(/[^A-Za-z0-9]/, "At least one special character"),
  role: z.enum(["Admin", "Member"])
});

const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "Member"
    }
  });

  const onSubmit = async (values) => {
    try {
      await signup(values);
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 dark:bg-slate-950">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md rounded-xl bg-white p-6 shadow dark:bg-slate-900">
        <h1 className="mb-5 text-2xl font-bold">Signup</h1>
        <input className="w-full rounded border p-2 dark:border-slate-700 dark:bg-slate-900" placeholder="Full name" {...register("name")} />
        {errors.name ? <p className="mt-1 text-xs text-red-500">{errors.name.message}</p> : null}

        <input className="mt-3 w-full rounded border p-2 dark:border-slate-700 dark:bg-slate-900" type="email" placeholder="Email" {...register("email")} />
        {errors.email ? <p className="mt-1 text-xs text-red-500">{errors.email.message}</p> : null}

        <input
          className="mt-3 w-full rounded border p-2 dark:border-slate-700 dark:bg-slate-900"
          type="password"
          placeholder="Password"
          {...register("password")}
        />
        {errors.password ? <p className="mt-1 text-xs text-red-500">{errors.password.message}</p> : null}

        <select className="mt-3 w-full rounded border p-2 dark:border-slate-700 dark:bg-slate-900" {...register("role")}>
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        <button className="mt-4 w-full rounded bg-blue-600 py-2 text-white" disabled={isSubmitting}>
          {isSubmitting ? "Please wait..." : "Create account"}
        </button>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          Already have an account?{" "}
          <Link className="text-blue-600" to="/login">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignupPage;
