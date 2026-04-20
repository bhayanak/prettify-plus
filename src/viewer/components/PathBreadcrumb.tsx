interface PathBreadcrumbProps {
  path: string;
}

export function PathBreadcrumb({ path }: PathBreadcrumbProps) {
  return (
    <div className="breadcrumb">
      <span>Path: </span>
      <strong>{path}</strong>
    </div>
  );
}
