const EmptyState = ({ title, description }) => (
  <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
  </div>
);

export default EmptyState;
