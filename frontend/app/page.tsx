"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StockChart } from "@/components/stock-chart"
import { TurtleSignals } from "@/components/turtle-signals"
import { BacktestResults } from "@/components/backtest-results"
import { PerformanceMetrics } from "@/components/performance-metrics"
import { StrategyConfig } from "@/components/strategy-config"
import { TrendingUp, Target } from "lucide-react"

export default function TurtleTradingDashboard() {
  const [selectedStock, setSelectedStock] = useState("AAPL")
  const [timeframe, setTimeframe] = useState("1Y")
  const [isBacktesting, setIsBacktesting] = useState(false)

  const popularStocks = ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN", "NVDA", "META", "NFLX"]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Turtle Trading</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">Professional</Badge>
              <div className="h-8 w-8 bg-muted rounded-full" />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stock Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Stock Selection & Analysis</span>
            </CardTitle>
            <CardDescription>Choose a stock symbol and timeframe to analyze turtle trading signals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Stock Symbol</label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter symbol (e.g., AAPL)"
                    value={selectedStock}
                    onChange={(e) => setSelectedStock(e.target.value.toUpperCase())}
                    className="flex-1"
                  />
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1M">1 Month</SelectItem>
                      <SelectItem value="3M">3 Months</SelectItem>
                      <SelectItem value="6M">6 Months</SelectItem>
                      <SelectItem value="1Y">1 Year</SelectItem>
                      <SelectItem value="2Y">2 Years</SelectItem>
                      <SelectItem value="5Y">5 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={() => setIsBacktesting(!isBacktesting)} className="bg-primary hover:bg-primary/90">
                {isBacktesting ? "Stop Analysis" : "Start Analysis"}
              </Button>
            </div>

            {/* Popular Stocks */}
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Popular stocks:</p>
              <div className="flex flex-wrap gap-2">
                {popularStocks.map((stock) => (
                  <Button
                    key={stock}
                    variant={selectedStock === stock ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedStock(stock)}
                  >
                    {stock}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Dashboard */}
        <Tabs defaultValue="analysis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="backtest">Backtest</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="strategy">Strategy</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Price Chart */}
              <div className="lg:col-span-2">
                <StockChart symbol={selectedStock} timeframe={timeframe} />
              </div>

              {/* Turtle Signals */}
              <div>
                <TurtleSignals symbol={selectedStock} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="backtest" className="space-y-6">
            <BacktestResults symbol={selectedStock} timeframe={timeframe} />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <PerformanceMetrics symbol={selectedStock} />
          </TabsContent>

          <TabsContent value="strategy" className="space-y-6">
            <StrategyConfig />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
