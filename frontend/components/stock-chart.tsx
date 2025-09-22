"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StockChartProps {
  symbol: string;
  timeframe: string;
}

interface StockData {
  date: string;
  price: number;
  high20: number;
  low10: number;
  volume: number;
}

export function StockChart({ symbol, timeframe }: StockChartProps) {
  const [data, setData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);

  // Fetch real data from backend
  useEffect(() => {
    setLoading(true);

    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/stock-data/${symbol}?timeframe=${timeframe}`
        );
        const result = await response.json();

        if (response.ok) {
          setData(result.data);
          setCurrentPrice(result.current_price);
          setPriceChange(result.price_change);
        } else {
          console.error("Error fetching stock data:", result.error);
          // Fallback to mock data if API fails
          const mockData = generateMockData(symbol, timeframe);
          setData(mockData);
          if (mockData.length > 0) {
            const latest = mockData[mockData.length - 1];
            const previous = mockData[mockData.length - 2];
            setCurrentPrice(latest.price);
            setPriceChange(
              ((latest.price - previous.price) / previous.price) * 100
            );
          }
        }
      } catch (error) {
        console.error("Error fetching stock data:", error);
        // Fallback to mock data
        const mockData = generateMockData(symbol, timeframe);
        setData(mockData);
        if (mockData.length > 0) {
          const latest = mockData[mockData.length - 1];
          const previous = mockData[mockData.length - 2];
          setCurrentPrice(latest.price);
          setPriceChange(
            ((latest.price - previous.price) / previous.price) * 100
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol, timeframe]);

  const generateMockData = (symbol: string, timeframe: string): StockData[] => {
    const days =
      timeframe === "1M"
        ? 30
        : timeframe === "3M"
        ? 90
        : timeframe === "6M"
        ? 180
        : timeframe === "1Y"
        ? 365
        : timeframe === "2Y"
        ? 730
        : 1825;
    const basePrice = getBasePrice(symbol);
    const data: StockData[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));

      const volatility = 0.02;
      const trend = Math.sin(i / 50) * 0.001;
      const randomChange = (Math.random() - 0.5) * volatility;
      const price =
        i === 0 ? basePrice : data[i - 1].price * (1 + trend + randomChange);

      // Calculate turtle trading levels
      const recentPrices = data.slice(Math.max(0, i - 20)).map((d) => d.price);
      const high20 =
        recentPrices.length > 0 ? Math.max(...recentPrices, price) : price;
      const low10 =
        recentPrices.slice(-10).length > 0
          ? Math.min(...recentPrices.slice(-10), price)
          : price;

      data.push({
        date: date.toISOString().split("T")[0],
        price: Math.round(price * 100) / 100,
        high20: Math.round(high20 * 100) / 100,
        low10: Math.round(low10 * 100) / 100,
        volume: Math.floor(Math.random() * 10000000) + 1000000,
      });
    }

    return data;
  };

  const getBasePrice = (symbol: string): number => {
    const prices: { [key: string]: number } = {
      AAPL: 175,
      GOOGL: 140,
      MSFT: 380,
      TSLA: 250,
      AMZN: 145,
      NVDA: 450,
      META: 320,
      NFLX: 400,
    };
    return prices[symbol] || 100;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Price Chart</CardTitle>
          <CardDescription>Loading {symbol} data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <span>{symbol}</span>
              <Badge variant={priceChange >= 0 ? "default" : "destructive"}>
                {priceChange >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {priceChange.toFixed(2)}%
              </Badge>
            </CardTitle>
            <CardDescription>
              Current: ${currentPrice.toFixed(2)} • {timeframe} timeframe
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  if (timeframe === "1Y") {
                    // For 1 year, show all months
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      year: "2-digit",
                    });
                  } else if (timeframe === "2Y" || timeframe === "5Y") {
                    // For multi-year charts, show years
                    return date.toLocaleDateString("en-US", {
                      year: "numeric",
                    });
                  } else {
                    // For shorter periods, show month and day
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }
                }}
                interval={
                  timeframe === "1Y"
                    ? Math.floor(data.length / 12)
                    : timeframe === "2Y" || timeframe === "5Y"
                    ? Math.floor(data.length / 8)
                    : "preserveStartEnd"
                }
                minTickGap={
                  timeframe === "1Y"
                    ? 20
                    : timeframe === "2Y" || timeframe === "5Y"
                    ? 40
                    : 30
                }
              />
              <YAxis
                tick={{ fontSize: 12 }}
                domain={["dataMin - 5", "dataMax + 5"]}
              />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number, name: string) => [
                  `$${value.toFixed(2)}`,
                  name === "price"
                    ? "Price"
                    : name === "high20"
                    ? "20-Day High"
                    : "10-Day Low",
                ]}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="high20"
                stroke="#16a34a"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="low10"
                stroke="#dc2626"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium">Current Price</div>
            <div className="text-2xl font-bold">${currentPrice.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-green-600">20-Day High</div>
            <div className="text-lg">
              ${data[data.length - 1]?.high20.toFixed(2)}
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium text-red-600">10-Day Low</div>
            <div className="text-lg">
              ${data[data.length - 1]?.low10.toFixed(2)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
