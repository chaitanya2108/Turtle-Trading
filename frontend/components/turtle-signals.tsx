"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowUp,
  ArrowDown,
  Minus,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

interface TurtleSignalsProps {
  symbol: string;
}

interface Signal {
  type: "buy" | "sell" | "hold";
  strength: "strong" | "moderate" | "weak";
  price: number;
  date: string;
  reason: string;
}

export function TurtleSignals({ symbol }: TurtleSignalsProps) {
  const [currentSignal, setCurrentSignal] = useState<Signal | null>(null);
  const [recentSignals, setRecentSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const fetchSignals = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/signals/${symbol}?timeframe=1Y`
        );
        const result = await response.json();

        if (response.ok) {
          setCurrentSignal(result.current_signal);
          setRecentSignals(result.recent_signals);
        } else {
          console.error("Error fetching signals:", result.error);
          // Fallback to mock data
          const signals = generateTurtleSignals(symbol);
          setCurrentSignal(signals[0]);
          setRecentSignals(signals.slice(1, 6));
        }
      } catch (error) {
        console.error("Error fetching signals:", error);
        // Fallback to mock data
        const signals = generateTurtleSignals(symbol);
        setCurrentSignal(signals[0]);
        setRecentSignals(signals.slice(1, 6));
      } finally {
        setLoading(false);
      }
    };

    fetchSignals();
  }, [symbol]);

  const generateTurtleSignals = (symbol: string): Signal[] => {
    const basePrice = getBasePrice(symbol);
    const signals: Signal[] = [];

    // Generate current signal
    const signalTypes: Signal["type"][] = ["buy", "sell", "hold"];
    const strengths: Signal["strength"][] = ["strong", "moderate", "weak"];

    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const type = signalTypes[Math.floor(Math.random() * signalTypes.length)];
      const strength = strengths[Math.floor(Math.random() * strengths.length)];
      const priceVariation = (Math.random() - 0.5) * 0.1;
      const price = basePrice * (1 + priceVariation);

      const reasons = {
        buy: [
          "Price broke above 20-day high",
          "Strong momentum detected",
          "Volume surge confirmed",
          "Trend reversal signal",
        ],
        sell: [
          "Price fell below 10-day low",
          "Stop loss triggered",
          "Momentum weakening",
          "Risk management exit",
        ],
        hold: [
          "Price within trading range",
          "Waiting for breakout",
          "Consolidation phase",
          "No clear signal",
        ],
      };

      signals.push({
        type,
        strength,
        price: Math.round(price * 100) / 100,
        date: date.toISOString().split("T")[0],
        reason: reasons[type][Math.floor(Math.random() * reasons[type].length)],
      });
    }

    return signals;
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

  const getSignalIcon = (type: Signal["type"]) => {
    switch (type) {
      case "buy":
        return <ArrowUp className="h-4 w-4" />;
      case "sell":
        return <ArrowDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getSignalColor = (type: Signal["type"]) => {
    switch (type) {
      case "buy":
        return "bg-green-500 text-white";
      case "sell":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStrengthColor = (strength: Signal["strength"]) => {
    switch (strength) {
      case "strong":
        return "border-green-500 text-green-700";
      case "moderate":
        return "border-yellow-500 text-yellow-700";
      default:
        return "border-gray-500 text-gray-700";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Turtle Signals</CardTitle>
          <CardDescription>Analyzing {symbol}...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Turtle Signals</span>
        </CardTitle>
        <CardDescription>Current trading signals for {symbol}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Signal */}
        {currentSignal && (
          <div className="p-4 border rounded-lg bg-card">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div
                  className={`p-2 rounded-full ${getSignalColor(
                    currentSignal.type
                  )}`}
                >
                  {getSignalIcon(currentSignal.type)}
                </div>
                <div>
                  <div className="font-semibold capitalize">
                    {currentSignal.type} Signal
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ${currentSignal.price}
                  </div>
                </div>
              </div>
              <Badge
                variant="outline"
                className={getStrengthColor(currentSignal.strength)}
              >
                {currentSignal.strength}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {currentSignal.reason}
            </p>
            <div className="mt-3">
              <Button
                size="sm"
                className={
                  currentSignal.type === "buy"
                    ? "bg-green-600 hover:bg-green-700"
                    : currentSignal.type === "sell"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gray-600 hover:bg-gray-700"
                }
              >
                {currentSignal.type === "buy"
                  ? "Execute Buy"
                  : currentSignal.type === "sell"
                  ? "Execute Sell"
                  : "Monitor"}
              </Button>
            </div>
          </div>
        )}

        {/* Recent Signals */}
        <div>
          <h4 className="font-medium mb-3 flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Recent Signals</span>
          </h4>
          <div className="space-y-2">
            {recentSignals.map((signal, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 border rounded"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-1 rounded ${getSignalColor(signal.type)}`}>
                    {getSignalIcon(signal.type)}
                  </div>
                  <div>
                    <div className="text-sm font-medium capitalize">
                      {signal.type}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {signal.date}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">${signal.price}</div>
                  <Badge
                    variant="outline"
                    size="sm"
                    className={getStrengthColor(signal.strength)}
                  >
                    {signal.strength}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
