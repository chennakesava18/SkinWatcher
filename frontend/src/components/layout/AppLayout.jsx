import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function AppLayout() {
  return (
    <div className="app-shell min-h-screen">
      <Sidebar />
      <main className="min-h-screen lg:pl-72">
        <Topbar />
        <Outlet />
      </main>
    </div>
  );
}

