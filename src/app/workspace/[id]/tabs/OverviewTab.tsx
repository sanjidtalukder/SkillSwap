export function OverviewTab({ project }: { project: any }) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Workspace Overview</h2>
      <p className="text-muted-foreground">{project.description}</p>
    </div>
  );
}
