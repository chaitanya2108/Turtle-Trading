"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Settings, Save, RotateCcw, Info } from "lucide-react";

export function StrategyConfig() {
  const [config, setConfig] = useState({
    // Entry Rules
    longBreakout: 20,
    shortBreakout: 10,

    // Exit Rules
    longExit: 10,
    shortExit: 20,

    // Position Sizing
    riskPerTrade: 2,
    maxPositions: 4,

    // Risk Management
    stopLoss: 2,
    useTrailingStop: true,
    trailingStopATR: 2,

    // Filters
    minVolume: 1000000,
    minPrice: 5,
    maxPrice: 1000,

    // Advanced
    atrPeriod: 20,
    useVolatilityFilter: false,
    maxVolatility: 30,
  });

  const handleConfigChange = (key: string, value: number | boolean) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = () => {
    setConfig({
      longBreakout: 20,
      shortBreakout: 10,
      longExit: 10,
      shortExit: 20,
      riskPerTrade: 2,
      maxPositions: 4,
      stopLoss: 2,
      useTrailingStop: true,
      trailingStopATR: 2,
      minVolume: 1000000,
      minPrice: 5,
      maxPrice: 1000,
      atrPeriod: 20,
      useVolatilityFilter: false,
      maxVolatility: 30,
    });
  };

  const saveConfig = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/strategy-config",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(config),
        }
      );

      const result = await response.json();

      if (response.ok) {
        console.log("Configuration saved successfully:", result);
        // Show success message
      } else {
        console.error("Error saving configuration:", result.error);
      }
    } catch (error) {
      console.error("Error saving configuration:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Turtle Trading Strategy Configuration</span>
          </CardTitle>
          <CardDescription>
            Customize the turtle trading parameters to optimize your strategy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-6">
            <Button
              onClick={saveConfig}
              className="bg-primary hover:bg-primary/90"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
            <Button variant="outline" onClick={resetToDefaults}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="entry" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="entry">Entry Rules</TabsTrigger>
          <TabsTrigger value="exit">Exit Rules</TabsTrigger>
          <TabsTrigger value="risk">Risk Management</TabsTrigger>
          <TabsTrigger value="filters">Filters</TabsTrigger>
        </TabsList>

        <TabsContent value="entry" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Entry Signal Configuration</CardTitle>
              <CardDescription>
                Configure the breakout periods for entry signals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center space-x-2 mb-2">
                      <span>Long Entry Breakout Period</span>
                      <Badge variant="outline">
                        {config.longBreakout} days
                      </Badge>
                    </Label>
                    <Slider
                      value={[config.longBreakout]}
                      onValueChange={(value) =>
                        handleConfigChange("longBreakout", value[0])
                      }
                      max={55}
                      min={10}
                      step={5}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter long when price breaks above {config.longBreakout}
                      -day high
                    </p>
                  </div>

                  <div>
                    <Label className="flex items-center space-x-2 mb-2">
                      <span>Short Entry Breakout Period</span>
                      <Badge variant="outline">
                        {config.shortBreakout} days
                      </Badge>
                    </Label>
                    <Slider
                      value={[config.shortBreakout]}
                      onValueChange={(value) =>
                        handleConfigChange("shortBreakout", value[0])
                      }
                      max={25}
                      min={5}
                      step={5}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter short when price breaks below {config.shortBreakout}
                      -day low
                    </p>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Classic Turtle Rules</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Original turtle traders used 20-day breakouts for entries
                    and 10-day breakouts for failure signals. The system is
                    designed to catch major trends early.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Exit Signal Configuration</CardTitle>
              <CardDescription>
                Configure exit rules and stop loss parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center space-x-2 mb-2">
                      <span>Long Exit Period</span>
                      <Badge variant="outline">{config.longExit} days</Badge>
                    </Label>
                    <Slider
                      value={[config.longExit]}
                      onValueChange={(value) =>
                        handleConfigChange("longExit", value[0])
                      }
                      max={25}
                      min={5}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label className="flex items-center space-x-2 mb-2">
                      <span>Short Exit Period</span>
                      <Badge variant="outline">{config.shortExit} days</Badge>
                    </Label>
                    <Slider
                      value={[config.shortExit]}
                      onValueChange={(value) =>
                        handleConfigChange("shortExit", value[0])
                      }
                      max={55}
                      min={10}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label className="flex items-center space-x-2 mb-2">
                      <span>Stop Loss (ATR Multiple)</span>
                      <Badge variant="outline">{config.stopLoss}x</Badge>
                    </Label>
                    <Slider
                      value={[config.stopLoss]}
                      onValueChange={(value) =>
                        handleConfigChange("stopLoss", value[0])
                      }
                      max={5}
                      min={1}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="trailing-stop">Use Trailing Stop</Label>
                    <Switch
                      id="trailing-stop"
                      checked={config.useTrailingStop}
                      onCheckedChange={(checked) =>
                        handleConfigChange("useTrailingStop", checked)
                      }
                    />
                  </div>

                  {config.useTrailingStop && (
                    <div>
                      <Label className="flex items-center space-x-2 mb-2">
                        <span>Trailing Stop ATR</span>
                        <Badge variant="outline">
                          {config.trailingStopATR}x
                        </Badge>
                      </Label>
                      <Slider
                        value={[config.trailingStopATR]}
                        onValueChange={(value) =>
                          handleConfigChange("trailingStopATR", value[0])
                        }
                        max={5}
                        min={1}
                        step={0.5}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Management</CardTitle>
              <CardDescription>
                Configure position sizing and risk parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center space-x-2 mb-2">
                      <span>Risk Per Trade</span>
                      <Badge variant="outline">{config.riskPerTrade}%</Badge>
                    </Label>
                    <Slider
                      value={[config.riskPerTrade]}
                      onValueChange={(value) =>
                        handleConfigChange("riskPerTrade", value[0])
                      }
                      max={5}
                      min={0.5}
                      step={0.5}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Maximum percentage of portfolio to risk per trade
                    </p>
                  </div>

                  <div>
                    <Label className="flex items-center space-x-2 mb-2">
                      <span>Maximum Positions</span>
                      <Badge variant="outline">{config.maxPositions}</Badge>
                    </Label>
                    <Slider
                      value={[config.maxPositions]}
                      onValueChange={(value) =>
                        handleConfigChange("maxPositions", value[0])
                      }
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Position Sizing Formula</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Position Size = (Account Value × Risk%) / (ATR × ATR
                    Multiple)
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>• Account Value: $100,000</div>
                    <div>• Risk Per Trade: {config.riskPerTrade}%</div>
                    <div>• ATR Multiple: {config.stopLoss}x</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="filters" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stock Filters</CardTitle>
              <CardDescription>
                Set criteria for stock selection and filtering
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="min-volume">Minimum Daily Volume</Label>
                    <Input
                      id="min-volume"
                      type="number"
                      value={config.minVolume}
                      onChange={(e) =>
                        handleConfigChange(
                          "minVolume",
                          Number.parseInt(e.target.value)
                        )
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="min-price">Minimum Price ($)</Label>
                    <Input
                      id="min-price"
                      type="number"
                      value={config.minPrice}
                      onChange={(e) =>
                        handleConfigChange(
                          "minPrice",
                          Number.parseFloat(e.target.value)
                        )
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="max-price">Maximum Price ($)</Label>
                    <Input
                      id="max-price"
                      type="number"
                      value={config.maxPrice}
                      onChange={(e) =>
                        handleConfigChange(
                          "maxPrice",
                          Number.parseFloat(e.target.value)
                        )
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center space-x-2 mb-2">
                      <span>ATR Period</span>
                      <Badge variant="outline">{config.atrPeriod} days</Badge>
                    </Label>
                    <Slider
                      value={[config.atrPeriod]}
                      onValueChange={(value) =>
                        handleConfigChange("atrPeriod", value[0])
                      }
                      max={50}
                      min={10}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="volatility-filter">
                      Use Volatility Filter
                    </Label>
                    <Switch
                      id="volatility-filter"
                      checked={config.useVolatilityFilter}
                      onCheckedChange={(checked) =>
                        handleConfigChange("useVolatilityFilter", checked)
                      }
                    />
                  </div>

                  {config.useVolatilityFilter && (
                    <div>
                      <Label className="flex items-center space-x-2 mb-2">
                        <span>Max Volatility</span>
                        <Badge variant="outline">{config.maxVolatility}%</Badge>
                      </Label>
                      <Slider
                        value={[config.maxVolatility]}
                        onValueChange={(value) =>
                          handleConfigChange("maxVolatility", value[0])
                        }
                        max={100}
                        min={10}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
