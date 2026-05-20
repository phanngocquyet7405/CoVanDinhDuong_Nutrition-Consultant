import MainLayout from "../layout/MainLayout";
import { useState, useEffect } from "react";
import { UtensilsCrossed, Salad, SlidersHorizontal, FlaskConical, TrendingUp, ArrowUpRight, Loader2 } from "lucide-react";
import { getFoods } from "../api/food.api";
import { getDishes } from "../api/dish.api";
import { getCriteria } from "../api/criteria.api";

interface DishRow {
    id: number;
    name: string;
    calories: number;
    protein?: number;
    cost: number;
    fat?: number;
    score?: number;
}

export default function Dashboard() {
    const [foodCount, setFoodCount] = useState<number | null>(null);
    const [dishes, setDishes] = useState<DishRow[]>([]);
    const [criteriaCount, setCriteriaCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getFoods().then(r => setFoodCount(r.data.length)),
            getDishes().then(r => setDishes(r.data)),
            getCriteria().then(r => setCriteriaCount(r.data.length)),
        ]).catch(err => {
            console.error("Lỗi khi tải dữ liệu dashboard:", err);
        }).finally(() => setLoading(false));
    }, []);

    const sorted = [...dishes].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 5);

    const statCards = [
        {
            label: "Total Foods",
            value: foodCount !== null ? String(foodCount) : "—",
            sub: "Thực phẩm đã nhập",
            icon: <Salad size={20} />,
            color: "#3b82f6", bg: "#eff6ff",
        },
        {
            label: "Total Dishes",
            value: dishes.length > 0 ? String(dishes.length) : "—",
            sub: "Món ăn trong hệ thống",
            icon: <UtensilsCrossed size={20} />,
            color: "#8b5cf6", bg: "#f5f3ff",
        },
        {
            label: "Criteria",
            value: criteriaCount !== null ? String(criteriaCount) : "—",
            sub: "Tiêu chí đánh giá",
            icon: <SlidersHorizontal size={20} />,
            color: "#0ea5e9", bg: "#f0f9ff",
        },
        {
            label: "DSS Methods",
            value: "AHP/TOPSIS",
            sub: "Multi-criteria decision",
            icon: <FlaskConical size={20} />,
            color: "#10b981", bg: "#ecfdf5",
        },
    ];

    return (
        <MainLayout>
            {/* Header */}
            <div style={{ marginBottom: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <div style={{
                        padding: "6px 12px", borderRadius: "20px",
                        background: "#eff6ff", border: "1px solid #bfdbfe",
                        fontSize: "12px", fontWeight: 500, color: "#3b82f6",
                        display: "flex", alignItems: "center", gap: "6px",
                    }}>
                        <TrendingUp size={12} />
                        Hệ thống hoạt động
                    </div>
                </div>
                <h1 style={{ fontSize: "30px", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.5px", margin: "0 0 6px" }}>
                    Nutrition Decision Support
                </h1>
                <p style={{ fontSize: "15px", color: "#64748b", margin: 0 }}>
                    Hệ thống gợi ý dinh dưỡng dựa trên AHP + TOPSIS
                </p>
            </div>

            {/* Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
                {statCards.map(card => (
                    <div key={card.label} style={{
                        background: "#fff", borderRadius: "14px",
                        padding: "20px", border: "1px solid #e2e8f0",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                            <div style={{
                                width: "40px", height: "40px", borderRadius: "10px",
                                background: card.bg, display: "flex", alignItems: "center",
                                justifyContent: "center", color: card.color,
                            }}>
                                {card.icon}
                            </div>
                            <ArrowUpRight size={14} color="#cbd5e1" />
                        </div>
                        {loading && card.value === "—" ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", margin: "0 0 4px" }}>
                                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                                <Loader2 size={16} color="#94a3b8" style={{ animation: "spin 1s linear infinite" }} />
                            </div>
                        ) : (
                            <p style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>
                                {card.value}
                            </p>
                        )}
                        <p style={{ fontSize: "13px", fontWeight: 500, color: "#64748b", margin: "0 0 4px" }}>
                            {card.label}
                        </p>
                        <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0 }}>{card.sub}</p>
                    </div>
                ))}
            </div>

            {/* Recent Dishes Table */}
            <div style={{
                background: "#fff", borderRadius: "16px",
                border: "1px solid #e2e8f0", overflow: "hidden",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}>
                <div style={{
                    padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                    <div>
                        <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#0f172a", margin: "0 0 2px" }}>
                            Món ăn nổi bật
                        </h2>
                        <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>
                            Xếp hạng theo điểm TOPSIS
                        </p>
                    </div>
                    <button style={{
                        fontSize: "12px", padding: "6px 14px", borderRadius: "8px",
                        border: "1px solid #e2e8f0", background: "transparent",
                        color: "#64748b", cursor: "pointer", fontWeight: 500,
                    }}>
                        Xem tất cả
                    </button>
                </div>

                {loading ? (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "48px 0", gap: "12px" }}>
                        <Loader2 size={18} color="#6366f1" style={{ animation: "spin 1s linear infinite" }} />
                        <span style={{ fontSize: "13px", color: "#64748b" }}>Đang tải...</span>
                    </div>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f8fafc" }}>
                                {["Tên món", "Calories", "Protein", "Chi phí", "Chất béo", "Điểm TOPSIS"].map(h => (
                                    <th key={h} style={{
                                        padding: "10px 24px", textAlign: "left",
                                        fontSize: "11px", fontWeight: 600, color: "#64748b",
                                        letterSpacing: "0.05em", textTransform: "uppercase",
                                    }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>
                                        Chưa có dữ liệu món ăn
                                    </td>
                                </tr>
                            ) : sorted.map((item, i) => {
                                const score = item.score ?? 0;
                                const scoreCol = score > 0.8 ? "#10b981" : score > 0.7 ? "#3b82f6" : "#f59e0b";
                                return (
                                    <tr key={item.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                                        <td style={{ padding: "14px 24px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <div style={{
                                                    width: "28px", height: "28px", borderRadius: "8px",
                                                    background: i === 0 ? "#fef9c3" : "#f1f5f9",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    fontSize: "13px", fontWeight: 700,
                                                    color: i === 0 ? "#854d0e" : "#64748b",
                                                }}>
                                                    {i + 1}
                                                </div>
                                                <span style={{ fontSize: "13.5px", fontWeight: 500, color: "#1e293b" }}>
                                                    {item.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: "14px 24px", fontSize: "13px", color: "#475569" }}>{item.calories}</td>
                                        <td style={{ padding: "14px 24px", fontSize: "13px", color: "#475569" }}>
                                            {item.protein !== undefined ? `${item.protein}g` : "—"}
                                        </td>
                                        <td style={{ padding: "14px 24px", fontSize: "13px", color: "#475569" }}>
                                            {/* ĐÃ SỬA: Kiểm tra an toàn trước khi format tiền tệ */}
                                            {item.cost != null ? `${item.cost.toLocaleString("vi-VN")}đ` : "—"}
                                        </td>
                                        <td style={{ padding: "14px 24px", fontSize: "13px", color: "#475569" }}>
                                            {item.fat !== undefined ? `${item.fat}g` : "—"}
                                        </td>
                                        <td style={{ padding: "14px 24px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <div style={{ flex: 1, maxWidth: "80px", height: "5px", borderRadius: "99px", background: "#f1f5f9" }}>
                                                    <div style={{
                                                        width: `${score * 100}%`, height: "100%",
                                                        borderRadius: "99px", background: scoreCol,
                                                    }} />
                                                </div>
                                                <span style={{ fontSize: "12px", fontWeight: 600, color: scoreCol }}>
                                                    {score > 0 ? score.toFixed(2) : "—"}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </MainLayout>
    );
}