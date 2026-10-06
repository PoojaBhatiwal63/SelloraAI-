import { useState } from "react";
import {
  Sparkles,
  RefreshCw,
  Trophy,
  Rocket,
  ListChecks,
  AlertTriangle,
  CheckCircle2,
  Circle,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  
  BarChart,
  Bar,

  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import api from "@/utils/axios";

// ==========================================
// TYPES
// ==========================================

interface AnalyticsData {
  partner: {
    id: string;
    name: string;
  };

  summary: {
    totalRevenue: number;
    totalSales: number;
    totalProducts: number;
  };

  products: {
    id: string;
    title: string;
    type: string;
    price: number;
    totalSales: number;
    totalRevenue: number;
  }[];

  orders: {
    productTitle: string;
    partnerAmount: number;
    createdAt: string;
  }[];
}

type InsightType = "positive" | "warning" | "neutral";

interface AIAnalyticsResponse {
  summary: AnalyticsData["summary"];

  charts: {
    productPerformance: {
      productId: string;
      product: string;
      sales: number;
      revenue: number;
    }[];

    revenueTrend: {
      date: string;
      revenue: number;
    }[];

    salesTrend: {
      date: string;
      sales: number;
    }[];
  };

  ai: {
    summary: string;

    insights: {
      type: InsightType;
      title: string;
      description: string;
    }[];

    recommendations: string[];

    topProduct: {
      title: string;
      reason: string;
    };

    growthOpportunity: string;
  };

  model: "gemini" | "groq";
}

// ==========================================
// INSIGHT TYPE -> COLOR / ICON
// ==========================================

const INSIGHT_META: Record<InsightType, { icon: LucideIcon; className: string }> = {
  warning: { icon: AlertTriangle, className: "bg-amber-50 text-amber-700 border-amber-200" },
  neutral: { icon: Circle, className: "bg-slate-50 text-slate-600 border-slate-200" },
  positive: { icon: CheckCircle2, className: "bg-green-50 text-green-700 border-green-200" },
};

function formatDateShort(value: unknown): string {
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value ?? "");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}




// ==========================================
// PROPS
// ==========================================

interface AIAnalyticsProps {
  analyticsData: AnalyticsData;
}

// ==========================================
// COMPONENT
// ==========================================

export default function AIAnalytics({ analyticsData }: AIAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AIAnalyticsResponse | null>(null);

  const [loading, setLoading] = useState(false);

  const [cached, setCached] = useState(false);

  const [expiresIn, setExpiresIn] = useState<number | null>(null);

  // ========================================
  // FETCH AI ANALYTICS
  // ========================================

  const handleAnalytics = async () => {
    try {
      setLoading(true);

      const { data } = await api.post("/api/ai/analytics", analyticsData);

      if (!data.success) {
        toast.error(data.message || "Failed to generate AI analytics");
        return;
      }

      // ====================================
      // SAVE RESPONSE
      // ====================================

      setAnalytics(data.data);

      setCached(data.cached ?? false);

      setExpiresIn(data.expiresIn ?? null);

      // ====================================
      // SUCCESS MESSAGE
      // ====================================

      if (data.cached) {
        toast.success("Latest AI analytics loaded");
      } else {
        toast.success("AI analytics generated successfully");
      }
    } catch (error: any) {
      console.error("AI Analytics Error:", error);

      toast.error(error.response?.data?.message || "Failed to generate AI analytics");
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // FORMAT CACHE TIME
  // ========================================

  const getCacheTime = () => {
    if (expiresIn === null || expiresIn <= 0) {
      return null;
    }

    const minutes = Math.ceil(expiresIn / 60);

    return `${minutes} min`;
  };

  // ========================================
  // UI
  // ========================================

  return (
    <div className="space-y-5">
      {/* ====================================
          HEADER
      ==================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />

            <h3 className="font-semibold text-slate-900">AI Analytics</h3>

            {analytics && (
              <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 uppercase">
               Powered by Groq
              </Badge>
            )}
          </div>

          <p className="text-sm text-slate-500 mt-1">
            Get AI-powered insights about your sales, products and growth.
          </p>
        </div>

        <Button
          onClick={handleAnalytics}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Check AI Analytics
            </>
          )}
        </Button>
      </div>

      {/* ====================================
          CACHE MESSAGE
      ==================================== */}

      {cached && getCacheTime() && (
        <p className="text-xs text-slate-400">
          Showing cached analytics. New data will be generated after{" "}
          <span className="font-medium text-slate-600">{getCacheTime()}</span>.
        </p>
      )}

      {/* ====================================
          EMPTY STATE
      ==================================== */}

      {!analytics && !loading && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <Sparkles className="h-8 w-8 mx-auto text-indigo-500 mb-3" />

            <p className="font-medium text-slate-900">Ready to analyze your store</p>

            <p className="text-sm text-slate-500 mt-1">
              Click &quot;Check AI Analytics&quot; to get AI-powered insights.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ====================================
          FULL RESULT
      ==================================== */}

      {analytics && (
        <div className="space-y-5">
          {/* Revenue Trend + Sales Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
             <Card>
              <CardHeader>
                <CardTitle className="text-base">Sales Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={analytics.charts.salesTrend}>
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity={1} />
                        <stop offset="100%" stopColor="#a5b4fc" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDateShort}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                    <Tooltip
                      labelFormatter={formatDateShort}
                      formatter={(value: any) => [Number(value), "Sales"]}
                      contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
                      cursor={{ fill: "#eef2ff" }}
                    />
                    <Bar
                      dataKey="sales"
                      fill="url(#salesGradient)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Product Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const maxSales = Math.max(
                    1,
                    ...analytics.charts.productPerformance.map((p) => p.sales)
                  );
                  const maxRevenue = Math.max(
                    1,
                    ...analytics.charts.productPerformance.map((p) => p.revenue)
                  );
                  const radarData = analytics.charts.productPerformance.map((p) => ({
                    product: p.product,
                    sales: p.sales,
                    revenue: p.revenue,
                    salesScore: (p.sales / maxSales) * 100,
                    revenueScore: (p.revenue / maxRevenue) * 100,
                  }));

                  return (
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={radarData} outerRadius="70%">
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis
                          dataKey="product"
                          tick={{ fontSize: 11, fill: "#334155" }}
                        />
                        <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
                          formatter={(value: any, name: any, props: any) => {
                            const row = props.payload;
                            if (name === "Sales") return [row.sales, "Sales"];
                            if (name === "Revenue") return [`₹${row.revenue.toFixed(2)}`, "Revenue"];
                            return [value, name];
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Radar
                          name="Sales"
                          dataKey="salesScore"
                          stroke="#4f46e5"
                          fill="#4f46e5"
                          fillOpacity={0.35}
                        />
                        <Radar
                          name="Revenue"
                          dataKey="revenueScore"
                          stroke="#080000"
                          fill="#040000"
                          fillOpacity={0.25}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  );
                })()}
              </CardContent>
            </Card>
          </div>

         

          {/* AI Summary */}
          <Card className="border-indigo-100 bg-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-indigo-900">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                AI Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-indigo-800 text-sm leading-relaxed">{analytics.ai.summary}</p>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analytics.ai.insights.map((insight, index) => {
                const meta = INSIGHT_META[insight.type];
                const Icon = meta.icon;
                return (
                  <div
                    key={index}
                    className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${meta.className}`}
                  >
                    <Icon className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{insight.title}</p>
                      <p className="text-sm opacity-90 mt-0.5">{insight.description}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Top Product + Growth Opportunity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  Top Product
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold text-slate-900">{analytics.ai.topProduct.title}</p>
                <p className="text-sm text-slate-500 mt-1">{analytics.ai.topProduct.reason}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Rocket className="h-4 w-4 text-indigo-600" />
                  Growth Opportunity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {analytics.ai.growthOpportunity}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recommended Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ListChecks className="h-4 w-4 text-indigo-600" />
                Recommended Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analytics.ai.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-4">
                  <span className="shrink-0 h-7 w-7 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold flex items-center justify-center">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm text-slate-600 leading-relaxed pt-0.5">{recommendation}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}