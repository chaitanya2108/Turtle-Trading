"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Target,
  BarChart3,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface PerformanceMetricsProps {
  symbol: string;
}

interface Metric {
  name: string;
  value: number;
  benchmark: number;
  unit: string;
  status: "good" | "warning" | "poor";
}

export function PerformanceMetrics({ symbol }: PerformanceMetricsProps) {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [equityCurve, setEquityCurve] = useState<any[]>([]);
  const [riskMetrics, setRiskMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const fetchPerformanceData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/performance/${symbol}?timeframe=1Y`
        );
        const result = await response.json();

        if (response.ok) {
          setMetrics(result.metrics);
          setEquityCurve(result.equity_curve);
          setRiskMetrics(result.risk_metrics);
        } else {
          console.error("Error fetching performance data:", result.error);
          // Fallback to mock data
          const mockMetrics = generatePerformanceMetrics();
          const mockEquityCurve = generateEquityCurve();
          const mockRiskMetrics = generateRiskMetrics();
          setMetrics(mockMetrics);
          setEquityCurve(mockEquityCurve);
          setRiskMetrics(mockRiskMetrics);
        }
      } catch (error) {
        console.error("Error fetching performance data:", error);
        // Fallback to mock data
        const mockMetrics = generatePerformanceMetrics();
        const mockEquityCurve = generateEquityCurve();
        const mockRiskMetrics = generateRiskMetrics();
        setMetrics(mockMetrics);
        setEquityCurve(mockEquityCurve);
        setRiskMetrics(mockRiskMetrics);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, [symbol]);

  const generatePerformanceMetrics = (): Metric[] => {
    return [
      {
        name: "Total Return",
        value: Math.round((Math.random() * 40 - 10) * 100) / 100,
        benchmark: 12,
        unit: "%",
        status: "good",
      },
      {
        name: "Sharpe Ratio",
        value: Math.round((Math.random() * 2 + 0.5) * 100) / 100,
        benchmark: 1.0,
        unit: "",
        status: "good",
      },
      {
        name: "Max Drawdown",
        value: Math.round((Math.random() * 20 + 5) * 100) / 100,
        benchmark: 15,
        unit: "%",
        status: "warning",
      },
      {
        name: "Win Rate",
        value: Math.round((Math.random() * 30 + 45) * 100) / 100,
        benchmark: 50,
        unit: "%",
        status: "good",
      },
      {
        name: "Profit Factor",
        value: Math.round((Math.random() * 2 + 1) * 100) / 100,
        benchmark: 1.5,
        unit: "",
        status: "good",
      },
      {
        name: "Average Trade",
        value: Math.round((Math.random() * 200 - 50) * 100) / 100,
        benchmark: 100,
        unit: "$",
        status: "warning",
      },
    ];
  };

  const generateEquityCurve = () => {
    const data = [];
    let equity = 100000;

    for (let i = 0; i < 252; i++) {
      // Trading days in a year
      const dailyReturn = (Math.random() - 0.48) * 0.02; // Slight positive bias
      equity = equity * (1 + dailyReturn);

      const date = new Date();
      date.setDate(date.getDate() - (252 - i));

      data.push({
        date: date.toISOString().split("T")[0],
        equity: Math.round(equity),
        benchmark: 100000 * Math.pow(1.08, i / 252), // 8% annual return
      });
    }

    return data;
  };

  const generateRiskMetrics = () => {
    return [
      { name: "Low Risk", value: 35, color: "#10b981" },
      { name: "Medium Risk", value: 45, color: "#f59e0b" },
      { name: "High Risk", value: 20, color: "#ef4444" },
    ];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "good":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      default:
        return "text-red-600";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Loading performance data...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {metric.name}
                </h3>
                {getStatusIcon(metric.status)}
              </div>
              <div className="flex items-baseline space-x-2">
                <span
                  className={`text-2xl font-bold ${getStatusColor(
                    metric.status
                  )}`}
                >
                  {metric.unit === "$" ? "$" : ""}
                  {metric.value}
                  {metric.unit === "%" ? "%" : metric.unit === "$" ? "" : ""}
                </span>
                <span className="text-sm text-muted-foreground">
                  vs {metric.benchmark}
                  {metric.unit}
                </span>
              </div>
              <Progress
                value={Math.min(100, (metric.value / metric.benchmark) * 100)}
                className="mt-2"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Equity Curve */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Equity Curve</span>
          </CardTitle>
          <CardDescription>
            Portfolio value over time vs benchmark
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={equityCurve}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString()
                  }
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString()
                  }
                  formatter={(value: number, name: string) => [
                    `$${value.toLocaleString()}`,
                    name === "equity" ? "Portfolio" : "Benchmark",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="equity"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="benchmark"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Risk Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Risk Distribution</span>
            </CardTitle>
            <CardDescription>Portfolio risk breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskMetrics}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskMetrics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, "Allocation"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              {riskMetrics.map((metric, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: metric.color }}
                  />
                  <span className="text-sm">{metric.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Performance Summary</span>
            </CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Best Month</span>
              <Badge variant="default" className="bg-green-600">
                +12.4%
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Worst Month</span>
              <Badge variant="destructive">-8.2%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Avg Monthly Return
              </span>
              <span className="font-medium">+2.1%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Volatility</span>
              <span className="font-medium">14.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Beta</span>
              <span className="font-medium">0.85</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Alpha</span>
              <span className="font-medium text-green-600">+3.2%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
