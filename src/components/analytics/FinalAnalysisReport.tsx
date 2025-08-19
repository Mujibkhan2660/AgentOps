import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, Download, Share, CheckCircle, XCircle, AlertTriangle, Leaf, DollarSign } from "lucide-react";

interface AnalysisData {
  userQuery: string;
  basicInfo: {
    nodes: number;
    runtime: number;
    dataVolume: number;
  };
  resultsAnalysis: {
    selected: string[];
    rejected: Array<{ name: string; reason: string }>;
  };
  complianceAnalysis: Array<{
    vendor: string;
    status: 'compliant' | 'non-compliant' | 'partial';
    carbonScore: number;
    transparency: string;
    pricing: string;
    violations?: string[];
  }>;
  constraints: {
    compliance: number;
    climateFriendly: number;
    budget: number;
    formula: string;
  };
  environmental: {
    footprint: number;
    cost: number;
  };
}

interface FinalAnalysisReportProps {
  data: AnalysisData;
  isVisible: boolean;
  onClose: () => void;
}

export function FinalAnalysisReport({ data, isVisible, onClose }: FinalAnalysisReportProps) {
  if (!isVisible) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'non-compliant': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'partial': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'non-compliant': return 'bg-red-100 text-red-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Final Analysis Report</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* User Query */}
          <Card>
            <CardHeader>
              <CardTitle>User Query</CardTitle>
            </CardHeader>
            <CardContent>
              <blockquote className="border-l-4 border-primary pl-4 italic">
                "{data.userQuery}"
              </blockquote>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Number of nodes in workflow</p>
                  <p className="text-2xl font-bold">{data.basicInfo.nodes} nodes</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End-to-end runtime</p>
                  <p className="text-2xl font-bold">{data.basicInfo.runtime} seconds</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data volume processed</p>
                  <p className="text-2xl font-bold">{data.basicInfo.dataVolume} vendor records</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Results Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Results Selected:</h4>
                <div className="flex flex-wrap gap-2">
                  {data.resultsAnalysis.selected.map((vendor, index) => (
                    <Badge key={index} className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {vendor}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Results Rejected:</h4>
                <div className="space-y-2">
                  {data.resultsAnalysis.rejected.map((item, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-900">{item.name}</p>
                        <p className="text-sm text-red-700">{item.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.complianceAnalysis.map((vendor, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{vendor.vendor}</h4>
                      <Badge className={getStatusColor(vendor.status)}>
                        {getStatusIcon(vendor.status)}
                        {vendor.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Carbon Score</p>
                        <p className="font-medium">{vendor.carbonScore}/100</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Transparency</p>
                        <p className="font-medium">{vendor.transparency}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Pricing</p>
                        <p className="font-medium">{vendor.pricing}</p>
                      </div>
                    </div>

                    {vendor.violations && vendor.violations.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-muted-foreground mb-1">Violations:</p>
                        <div className="flex flex-wrap gap-1">
                          {vendor.violations.map((violation, idx) => (
                            <Badge key={idx} variant="destructive" className="text-xs">
                              {violation}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Constraints & Weights */}
          <Card>
            <CardHeader>
              <CardTitle>Constraints & Weights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Compliance</p>
                    <p className="text-xl font-bold">{data.constraints.compliance}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Climate Friendly</p>
                    <p className="text-xl font-bold">{data.constraints.climateFriendly}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="text-xl font-bold">{data.constraints.budget}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Formula:</p>
                  <code className="bg-muted p-2 rounded text-sm block">
                    {data.constraints.formula}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environmental and Monetary Cost */}
          <Card>
            <CardHeader>
              <CardTitle>Environmental and Monetary Cost of AI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Leaf className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated environmental footprint</p>
                    <p className="text-xl font-bold">{data.environmental.footprint} kg CO2e</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated monetary cost</p>
                    <p className="text-xl font-bold">${data.environmental.cost}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}