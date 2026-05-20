import MainLayout from "../layout/MainLayout";
import { useState, useEffect } from "react";
import { Plus, Search, Filter, Loader2 } from "lucide-react";
import { getFoods } from "../api/food.api";

interface Food {
    id: number;
    name: string;
    category: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    unit?: string;
}

const categoryColors: Record<string, { bg: string; text: string; emoji: string }> = {
    "Protein": { bg: "#eff6ff", text: "#3b82f6", emoji: "🥩" },
    "Tinh bột": { bg: "#fef9c3", text: "#a16207", emoji: "🍚" },
    "Rau củ": { bg: "#f0fdf4", text: "#16a34a", emoji: "🥬" },
};

function getCategory(cat: string) {
    return categoryColors[cat] ?? { bg: "#f1f5f9", text: "#64748b", emoji: "🍴" };
}

export default function Food() {
    const [foods, setFoods] = useState<Food[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        // REMOVED: setLoading(true) and setError(null) from here
        // because they are already set to their correct initial values above.
        getFoods()
            .then(res => setFoods(res.data))
            .catch(() => setError("Không thể tải dữ liệu thực phẩm. Vui lòng thử lại."))
            .finally(() => setLoading(false));
    }, []);

    const filtered = foods.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <MainLayout>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
                <div>
                    <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.4px" }}>
                        Food Database
                    </h1>
                    <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
                        {loading ? "Đang tải..." : `Quản lý ${foods.length} thực phẩm trong cơ sở dữ liệu`}
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
                    Thêm thực phẩm
                </button>
            </div>

            <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
                    <Search size={15} color="#94a3b8" style={{ position: "absolute", left: "14px" }} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm thực phẩm..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            width: "100%", padding: "10px 14px 10px 38px",
                            borderRadius: "10px", border: "1px solid #e2e8f0",
                            background: "#fff", fontSize: "13.5px",
                            color: "#1e293b", outline: "none", boxSizing: "border-box",
                        }}
                    />
                </div>
                <button style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    padding: "10px 16px", borderRadius: "10px",
                    border: "1px solid #e2e8f0", background: "#fff",
                    color: "#64748b", cursor: "pointer", fontSize: "13px", fontWeight: 500,
                }}>
                    <Filter size={14} />
                    Bộ lọc
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
                <div style={{
                    background: "#fff", borderRadius: "16px",
                    border: "1px solid #e2e8f0", overflow: "hidden",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f8fafc" }}>
                                {["Thực phẩm", "Phân loại", "Calories", "Protein", "Chất béo", "Carbs", ""].map(h => (
                                    <th key={h} style={{
                                        padding: "12px 20px", textAlign: "left",
                                        fontSize: "11px", fontWeight: 600, color: "#64748b",
                                        letterSpacing: "0.05em", textTransform: "uppercase",
                                        borderBottom: "1px solid #f1f5f9",
                                    }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: "48px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>
                                        Không tìm thấy thực phẩm nào
                                    </td>
                                </tr>
                            ) : filtered.map((food, i) => {
                                const cat = getCategory(food.category);
                                return (
                                    <tr key={food.id} style={{ borderTop: i === 0 ? "none" : "1px solid #f8fafc" }}>
                                        <td style={{ padding: "14px 20px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <div style={{
                                                    width: "32px", height: "32px", borderRadius: "9px",
                                                    background: cat.bg, display: "flex",
                                                    alignItems: "center", justifyContent: "center", fontSize: "14px",
                                                }}>
                                                    {cat.emoji}
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: "13.5px", fontWeight: 500, color: "#1e293b", margin: 0 }}>
                                                        {food.name}
                                                    </p>
                                                    <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0 }}>
                                                        per {food.unit ?? "100g"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: "14px 20px" }}>
                                            <span style={{
                                                display: "inline-block", padding: "3px 10px",
                                                borderRadius: "20px", fontSize: "11.5px", fontWeight: 500,
                                                background: cat.bg, color: cat.text,
                                            }}>
                                                {food.category}
                                            </span>
                                        </td>
                                        <td style={{ padding: "14px 20px", fontSize: "13.5px" }}>
                                            <span style={{ fontWeight: 600, color: "#f59e0b" }}>{food.calories}</span>
                                            <span style={{ fontSize: "11px", color: "#94a3b8" }}> kcal</span>
                                        </td>
                                        <td style={{ padding: "14px 20px", fontSize: "13.5px", color: "#475569" }}>{food.protein}g</td>
                                        <td style={{ padding: "14px 20px", fontSize: "13.5px", color: "#475569" }}>{food.fat}g</td>
                                        <td style={{ padding: "14px 20px", fontSize: "13.5px", color: "#475569" }}>{food.carbs}g</td>
                                        <td style={{ padding: "14px 20px" }}>
                                            <button style={{
                                                fontSize: "12px", padding: "5px 12px", borderRadius: "7px",
                                                border: "1px solid #e2e8f0", background: "transparent",
                                                color: "#64748b", cursor: "pointer",
                                            }}>
                                                Sửa
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div style={{
                        padding: "12px 20px", borderTop: "1px solid #f1f5f9",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}>
                        <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>
                            Hiển thị {filtered.length} / {foods.length} thực phẩm
                        </p>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}