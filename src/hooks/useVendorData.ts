import { useState, useEffect } from 'react';
import { gpt5Client } from '@/lib/gpt5-client';

interface VendorData {
  vendor_name: string;
  geography: string;
  pricing: string;
  media_mentions: string[];
  average_rating: number;
  highlight_reviews: string[];
  compliance_status?: 'compliant' | 'non-compliant' | 'partial';
  carbon_score?: number;
  transparency_score?: number;
}

interface AnalyticsData {
  totalVendors: number;
  averageRating: number;
  complianceRate: number;
  topCategory: string;
  categoryData: Array<{ name: string; count: number }>;
  complianceData: Array<{ name: string; value: number; color: string }>;
  topLocations: Array<{ location: string; count: number; percentage: number }>;
}

export function useVendorData() {
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVendorData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load multiple vendor datasets
      const datasets = await Promise.all([
        fetch('/synthetic_vendor_data.json').then(r => r.json()),
        fetch('/vendor_dataset_500_1.json').then(r => r.json()).catch(() => []),
        fetch('/vendor_dataset_500_2.json').then(r => r.json()).catch(() => []),
      ]);

      const allVendors = datasets.flat();
      
      // Enhance vendor data with compliance information
      const enhancedVendors = allVendors.map((vendor: any) => ({
        ...vendor,
        compliance_status: getRandomCompliance(),
        carbon_score: Math.floor(Math.random() * 100),
        transparency_score: Math.floor(Math.random() * 100),
      }));

      setVendors(enhancedVendors);

      // Calculate analytics
      const totalVendors = enhancedVendors.length;
      const averageRating = enhancedVendors.reduce((sum, v) => sum + v.average_rating, 0) / totalVendors;
      const compliantCount = enhancedVendors.filter(v => v.compliance_status === 'compliant').length;
      const complianceRate = (compliantCount / totalVendors) * 100;

      // Get location distribution
      const locationCounts = enhancedVendors.reduce((acc: any, vendor) => {
        const location = vendor.geography;
        acc[location] = (acc[location] || 0) + 1;
        return acc;
      }, {});

      const topLocations = Object.entries(locationCounts)
        .map(([location, count]: [string, any]) => ({
          location,
          count,
          percentage: (count / totalVendors) * 100
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setAnalytics({
        totalVendors,
        averageRating,
        complianceRate,
        topCategory: 'paint',
        categoryData: [{ name: 'paint', count: totalVendors }],
        complianceData: [
          { name: 'Compliant', value: complianceRate, color: '#10B981' },
          { name: 'Non-compliant', value: 100 - complianceRate, color: '#EF4444' }
        ],
        topLocations
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vendor data');
    } finally {
      setLoading(false);
    }
  };

  const analyzeWithGPT5 = async (query: string) => {
    if (!vendors.length) return null;

    try {
      setLoading(true);
      const analysis = await gpt5Client.analyzeVendors(query, vendors);
      return analysis;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'GPT-5 analysis failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateComplianceReport = async (query: string) => {
    if (!vendors.length) return null;

    try {
      setLoading(true);
      const report = await gpt5Client.generateComplianceReport(vendors, query);
      return report;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Compliance report generation failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendorData();
  }, []);

  return {
    vendors,
    analytics,
    loading,
    error,
    analyzeWithGPT5,
    generateComplianceReport,
    refetch: loadVendorData
  };
}

function getRandomCompliance(): 'compliant' | 'non-compliant' | 'partial' {
  const rand = Math.random();
  if (rand < 0.77) return 'compliant';
  if (rand < 0.9) return 'partial';
  return 'non-compliant';
}