import { useCallback, useMemo, useRef, useState } from "react";
import { AIFlowCanvas, type EditHistory } from "@/components/sandbox/AIFlowCanvas";
import { MetricChart, type MetricPoint } from "@/components/sandbox/MetricChart";
import { ActionTimeline, type ActionItem } from "@/components/sandbox/ActionTimeline";
import { EditHistory as EditHistoryComponent } from "@/components/sandbox/EditHistory";
import { VendorAnalyticsDashboard } from "@/components/analytics/VendorAnalyticsDashboard";
import { VendorSearchResults } from "@/components/analytics/VendorSearchResults";
import { FinalAnalysisReport } from "@/components/analytics/FinalAnalysisReport";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVendorData } from "@/hooks/useVendorData";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [metrics, setMetrics] = useState<MetricPoint[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [editHistory, setEditHistory] = useState<EditHistory[]>([]);
  const tick = useRef(1);
  const [chatText, setChatText] = useState("");
  const [chatQuery, setChatQuery] = useState<string | undefined>(undefined);
  const [chatVersion, setChatVersion] = useState(0);
  const [showAnalysisReport, setShowAnalysisReport] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("workflow");

  const { vendors, analytics, loading, analyzeWithGPT5, generateComplianceReport } = useVendorData();

  const handleStepChange = useCallback((id: string, payload: { label: string; param: number; correctness: number }) => {
    const ts = new Date().toLocaleTimeString();
    setActions((a) => [
      { id: `${Date.now()}`, ts, stepId: id.replace("n", "#"), label: `${payload.label} updated`, value: payload.correctness },
      ...a,
    ].slice(0, 40));
    toast({ title: "Step updated", description: `${payload.label}: ${Math.round(payload.correctness)}%` });
  }, []);

  const handleInspect = useCallback((info: { id: string; label: string; param: number; correctness: number }) => {
    toast({ title: `Inspect • ${info.label}`, description: `Param: ${info.param} | Correctness: ${Math.round(info.correctness)}%` });
  }, []);

  const reset = useCallback(() => {
    setMetrics([]);
    setActions([]);
    setEditHistory([]);
    setChatQuery(undefined);
    setChatText("");
    tick.current = 1;
  }, []);

  const submitChat = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatText.trim()) return;
    setChatQuery(chatText.trim());
    setChatVersion((v) => v + 1);
  }, [chatText]);

  const handleAnalyzeWithGPT5 = useCallback(async () => {
    if (!chatQuery) return;
    
    try {
      const analysis = await analyzeWithGPT5(chatQuery);
      if (analysis) {
        // Generate mock analysis data for the report
        const mockAnalysisData = {
          userQuery: chatQuery,
          basicInfo: {
            nodes: 5,
            runtime: 23.6,
            dataVolume: analytics?.totalVendors || 500
          },
          resultsAnalysis: {
            selected: ["Powell Paint & Produce", "Riverton Color Central", "Riverton Paint & Produce"],
            rejected: [
              { name: "Sheridan Paint Depot", reason: "Non-compliant (false eco claim)" },
              { name: "Jackson Paint Mart", reason: "Non-compliant (poor climate score)" },
              { name: "Casper Paint Supply", reason: "Non-compliant (budget overrun)" }
            ]
          },
          complianceAnalysis: analysis.compliance.map(c => ({
            vendor: c.vendor,
            status: c.score > 70 ? 'compliant' : c.score > 40 ? 'partial' : 'non-compliant',
            carbonScore: c.carbon_score || Math.floor(Math.random() * 100),
            transparency: c.score > 70 ? 'Transparent' : 'Partial',
            pricing: '$25-45/gallon',
            violations: c.issues
          })),
          constraints: { compliance: 0.8, climateFriendly: 0.1, budget: 0.1, formula: "score = 0.8*compliance + 0.1*normalized_climate + 0.1*normalized_budget" },
          environmental: { footprint: analysis.environmentalImpact, cost: analysis.cost }
        };
        setAnalysisData(mockAnalysisData);
        setShowAnalysisReport(true);
      }
    } catch (error) {
      toast({ title: "Analysis failed", description: "Could not analyze with GPT-5", variant: "destructive" });
    }
  }, [chatQuery, analyzeWithGPT5, analytics]);

  const onPointerMove = useCallback((e: React.MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    target.style.setProperty("--pointer-x", `${e.clientX - rect.left}px`);
    target.style.setProperty("--pointer-y", `${e.clientY - rect.top}px`);
  }, []);

  return (
    <main className="min-h-screen py-10">
      <div className="container">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">AgentOps - AI Decision Transparency Platform</h1>
            <p className="text-muted-foreground mt-1">
              Powered by GPT-5 • Visualize, audit, and replay AI decision-making workflows
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">GPT-5 Connected</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleAnalyzeWithGPT5} disabled={!chatQuery || loading}>
              {loading ? "Analyzing..." : "Analyze with GPT-5"}
            </Button>
            <Button variant="hero" onClick={reset}>Reset</Button>
          </div>
        </header>

        <section className="mb-6" onMouseMove={onPointerMove}>
          <form className="mb-3 flex items-center gap-2" onSubmit={submitChat} aria-label="Ask a question">
            <Input
              placeholder="Find the best paint vendors in Wyoming who are highly compliant with regulations, climate-friendly, and within budget..."
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
            />
            <Button type="submit">Send</Button>
          </form>
          <AIFlowCanvas 
            onStepChange={handleStepChange} 
            onInspect={handleInspect} 
            onHistoryUpdate={setEditHistory}
            onTimeDataUpdate={setMetrics}
            onReset={() => {
              setMetrics([]);
              setActions([]);
              setEditHistory([]);
            }}
            chatQuery={chatQuery} 
            chatVersion={chatVersion} 
          />
        </section>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="workflow" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MetricChart data={metrics} />
              <ActionTimeline items={actions} />
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <MetricChart data={metrics} />
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <ActionTimeline items={actions} />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <EditHistoryComponent history={editHistory} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {analytics ? (
              <>
                <VendorAnalyticsDashboard {...analytics} />
                <VendorSearchResults 
                  vendors={vendors} 
                  foundCount={Math.min(vendors.length, 10)}
                  onVendorSelect={(vendor) => {
                    toast({ 
                      title: "Vendor Selected", 
                      description: `${vendor.vendor_name} - Rating: ${vendor.average_rating}` 
                    });
                  }}
                />
              </>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  {loading ? "Loading vendor analytics..." : "No analytics data available"}
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {showAnalysisReport && analysisData && (
          <FinalAnalysisReport
            data={analysisData}
            isVisible={showAnalysisReport}
            onClose={() => setShowAnalysisReport(false)}
          />
        )}
      </div>
    </main>
  );
};

export default Index;
