import Sidebar from "../components/sidebar";
import type { ReactNode } from "react";

interface MainLayoutProps {
    children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
            <Sidebar />
            <div style={{
                flex: 1,
                padding: "40px 48px",
                background: "#f1f5f9",
                minHeight: "100vh",
                overflowY: "auto",
            }}>
                {children}
            </div>
        </div>
    );
}