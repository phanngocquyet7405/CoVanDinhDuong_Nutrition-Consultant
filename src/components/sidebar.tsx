import {
    LayoutDashboard,
    Utensils,
    Salad,
    SlidersHorizontal,
    Brain,
    Sparkles
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
    const location = useLocation();

    const menus = [
        { name: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/", desc: "Tổng quan" },
        { name: "Food", icon: <Salad size={18} />, path: "/food", desc: "Cơ sở dữ liệu" },
        { name: "Dish", icon: <Utensils size={18} />, path: "/dish", desc: "Món ăn" },
        { name: "Criteria", icon: <SlidersHorizontal size={18} />, path: "/criteria", desc: "Tiêu chí AHP" },
        { name: "Recommend", icon: <Brain size={18} />, path: "/recommend", desc: "Gợi ý AHP/TOPSIS" },
    ];

    return (
        <div style={{
            width: "256px",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            background: "linear-gradient(180deg, #0f172a 0%, #1a2540 100%)",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            flexShrink: 0,
        }}>
            {/* Logo */}
            <div style={{ padding: "32px 24px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
                    <div style={{
                        width: "34px", height: "34px", borderRadius: "10px",
                        background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
                    }}>
                        <Sparkles size={16} color="white" />
                    </div>
                    <span style={{
                        fontWeight: 700, fontSize: "17px", color: "#f1f5f9",
                        letterSpacing: "-0.3px",
                    }}>
                        Nutrition DSS
                    </span>
                </div>
                <p style={{ fontSize: "11px", color: "#475569", marginLeft: "46px", marginTop: "2px" }}>
                    AHP · TOPSIS Engine
                </p>
            </div>

            <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "0 20px 12px" }} />

            {/* Nav */}
            <nav style={{ flex: 1, padding: "4px 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
                {menus.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            style={{
                                display: "flex", alignItems: "center", gap: "12px",
                                padding: "10px 14px", borderRadius: "10px",
                                transition: "all 0.18s ease",
                                background: active ? "rgba(99,102,241,0.15)" : "transparent",
                                border: `1px solid ${active ? "rgba(99,102,241,0.28)" : "transparent"}`,
                                textDecoration: "none",
                            }}
                        >
                            <span style={{ color: active ? "#818cf8" : "#64748b", flexShrink: 0 }}>
                                {item.icon}
                            </span>
                            <div style={{ flex: 1 }}>
                                <p style={{
                                    fontSize: "13.5px", fontWeight: active ? 600 : 400,
                                    color: active ? "#e2e8f0" : "#94a3b8",
                                    margin: 0, lineHeight: 1.3,
                                }}>
                                    {item.name}
                                </p>
                                <p style={{
                                    fontSize: "11px",
                                    color: active ? "#818cf8" : "#475569",
                                    margin: 0, lineHeight: 1.2,
                                }}>
                                    {item.desc}
                                </p>
                            </div>
                            {active && (
                                <div style={{
                                    width: "6px", height: "6px", borderRadius: "50%",
                                    background: "#6366f1", flexShrink: 0,
                                }} />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div style={{ padding: "16px 24px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <p style={{ fontSize: "11px", color: "#334155", margin: 0 }}>
                    v1.0 · Decision Support System
                </p>
            </div>
        </div>
    );
}