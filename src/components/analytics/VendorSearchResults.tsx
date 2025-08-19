import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Search, Star, MapPin, DollarSign, Shield, AlertTriangle } from "lucide-react";

interface Vendor {
  vendor_name: string;
  geography: string;
  pricing: string;
  average_rating: number;
  media_mentions: string[];
  highlight_reviews: string[];
  compliance_status?: 'compliant' | 'non-compliant' | 'partial';
  carbon_score?: number;
  transparency_score?: number;
}

interface VendorSearchResultsProps {
  vendors: Vendor[];
  foundCount: number;
  onVendorSelect?: (vendor: Vendor) => void;
}

export function VendorSearchResults({ vendors, foundCount, onVendorSelect }: VendorSearchResultsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100);
  const [locationFilter, setLocationFilter] = useState("");
  const [compliantOnly, setCompliantOnly] = useState(false);

  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor => {
      const matchesSearch = vendor.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vendor.geography.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRating = vendor.average_rating >= minRating;
      const priceValue = parseFloat(vendor.pricing.replace(/[^0-9.]/g, ''));
      const matchesPrice = priceValue <= maxPrice;
      const matchesLocation = !locationFilter || vendor.geography.toLowerCase().includes(locationFilter.toLowerCase());
      const matchesCompliance = !compliantOnly || vendor.compliance_status === 'compliant';

      return matchesSearch && matchesRating && matchesPrice && matchesLocation && matchesCompliance;
    });
  }, [vendors, searchTerm, minRating, maxPrice, locationFilter, compliantOnly]);

  const getComplianceColor = (status?: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'non-compliant': return 'bg-red-100 text-red-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceIcon = (status?: string) => {
    switch (status) {
      case 'compliant': return <Shield className="h-4 w-4" />;
      case 'non-compliant': return <AlertTriangle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-primary" />
            </div>
            Category Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">paint</span>
              <span className="text-sm text-muted-foreground">{vendors.length} vendors (97.0%)</span>
            </div>
            <Progress value={97} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Found Vendors ({foundCount})</CardTitle>
          <p className="text-sm text-muted-foreground">Vendors discovered through the AI workflow</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors by name, location, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button>Search</Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Min Rating</label>
              <Input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Max Price</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input
                placeholder="e.g., Wyoming"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="compliant-only"
                checked={compliantOnly}
                onCheckedChange={(checked) => setCompliantOnly(checked as boolean)}
              />
              <label htmlFor="compliant-only" className="text-sm font-medium">
                Compliant Only
              </label>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">Found {filteredVendors.length} vendors</p>
        </CardContent>
      </Card>

      {/* Vendor Results */}
      <div className="space-y-4">
        {filteredVendors.map((vendor, index) => (
          <Card key={vendor.vendor_name} className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onVendorSelect?.(vendor)}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{vendor.vendor_name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{vendor.average_rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {vendor.geography}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {vendor.pricing}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={getComplianceColor(vendor.compliance_status)}>
                      {getComplianceIcon(vendor.compliance_status)}
                      {vendor.compliance_status || 'Unknown'}
                    </Badge>
                    {vendor.carbon_score && (
                      <Badge variant="outline">
                        Carbon: {vendor.carbon_score}/100
                      </Badge>
                    )}
                    {vendor.transparency_score && (
                      <Badge variant="outline">
                        Transparency: {vendor.transparency_score}/100
                      </Badge>
                    )}
                  </div>

                  {vendor.highlight_reviews && vendor.highlight_reviews.length > 0 && (
                    <blockquote className="text-sm italic text-muted-foreground border-l-2 border-muted pl-3 mb-3">
                      "{vendor.highlight_reviews[0]}"
                    </blockquote>
                  )}

                  {vendor.media_mentions && vendor.media_mentions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {vendor.media_mentions.map((mention, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {mention}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}