import MainLayout from "../layout/MainLayout";
import { useState, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";
import { getDishes } from "../api/dish.api";

interface Dish {
    id: number;
    name: string;
    foods: string[];
    calories: number;
    cost: number;
    score?: number;
}

function scoreColor(score: number) {
    if (score > 0.8) return { bg: "#f0fdf4", text: "#16a34a" };
    if (score > 0.7) return { bg: "#eff6ff", text: "#3b82f6" };
    return { bg: "#fef9c3", text: "#a16207" };
}

export default function Dish() {
    const [dishes, setDishes] = useState<Dish[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getDishes()
            .then(res => setDishes(res.data))
            .catch(() => setError("Không thể tải dữ liệu món ăn. Vui lòng thử lại."))
            .finally(() => setLoading(false));
    }, []);

    return (
        <MainLayout>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
                <div>
                    <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.4px" }}>
                        Dish Database
                    </h1>
                    <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
                        {loading ? "Đang tải..." : `${dishes.length} món ăn trong hệ thống`}
                    </p>
                </div>
                <button style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    padding: "10px 18px", borderRadius: "10px",
                    background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                    color: "#fff", border: "none", cursor: "pointer",
                    fontSize: "13.5px", fontWeight: 600,
                    boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
                }}>
                    <Plus size={16} />
                    Thêm món ăn
                </button>
            </div>

            {loading && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "80px 0", gap: "12px" }}>
                    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                    <Loader2 size={20} color="#6366f1" style={{ animation: "spin 1s linear infinite" }} />
                    <span style={{ fontSize: "14px", color: "#64748b" }}>Đang tải dữ liệu...</span>
                </div>
            )}

            {error && !loading && (
                <div style={{
                    background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px",
                    padding: "16px 20px", color: "#b91c1c", fontSize: "14px",
                    display: "flex", alignItems: "center", gap: "10px",
                }}>
                    ⚠️ {error}
                </div>
            )}

            {!loading && !error && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                    {dishes.length === 0 ? (
                        <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px", color: "#94a3b8", fontSize: "14px" }}>
                            Chưa có món ăn nào
                        </div>
                    ) : dishes.map((dish) => {
                        const sc = scoreColor(dish.score ?? 0);
                        return (
                            <div key={dish.id} style={{
                                background: "#fff", borderRadius: "16px",
                                border: "1px solid #e2e8f0", padding: "20px",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                                    <div style={{
                                        width: "44px", height: "44px", borderRadius: "12px",
                                        background: "#f8fafc", border: "1px solid #f1f5f9",
                                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px",
                                    }}>
                                        🍽️
                                    </div>
                                    {dish.score !== undefined && (
                                        <div style={{
                                            fontSize: "12px", fontWeight: 600, padding: "4px 10px",
                                            borderRadius: "20px", background: sc.bg, color: sc.text,
                                        }}>
                                            {dish.score.toFixed(2)}
                                        </div>
                                    )}
                                </div>

                                <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#1e293b", margin: "0 0 4px" }}>
                                    {dish.name}
                                </h3>

                                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", margin: "10px 0 14px" }}>
                                    {(dish.foods ?? []).map(f => (
                                        <span key={f} style={{
                                            padding: "2px 8px", borderRadius: "20px",
                                            fontSize: "11px", background: "#f8fafc",
                                            border: "1px solid #f1f5f9", color: "#64748b",
                                        }}>
                                            {f}
                                        </span>
                                    ))}
                                </div>

                                <div style={{
                                    display: "grid", gridTemplateColumns: "1fr 1fr",
                                    gap: "8px", padding: "12px 0 0",
                                    borderTop: "1px solid #f8fafc",
                                }}>
                                    <div>
                                        <p style={{ fontSize: "11px", color: "#94a3b8", margin: "0 0 2px" }}>Calories</p>
                                        <p style={{ fontSize: "14px", fontWeight: 600, color: "#f59e0b", margin: 0 }}>
                                            {dish.calories} kcal
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: "11px", color: "#94a3b8", margin: "0 0 2px" }}>Chi phí</p>
                                        {/* ĐÃ SỬA: Bảo vệ an toàn tránh lỗi crash nếu cost bị null/undefined */}
                                        <p style={{ fontSize: "14px", fontWeight: 600, color: "#10b981", margin: 0 }}>
                                            {dish.cost != null ? `${dish.cost.toLocaleString("vi-VN")}đ` : "—"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </MainLayout>
    );
}