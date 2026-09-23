// A template re-mounts on every navigation, so each page fades in.
export default function DashboardTemplate({ children }) {
  return <div className="animate-fade-up">{children}</div>;
}
