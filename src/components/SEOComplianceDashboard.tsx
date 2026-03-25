import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Search, 
  Globe, 
  Shield, 
  Zap, 
  Target, 
  TrendingUp,
  Users,
  Clock,
  Image,
  Link,
  Settings,
  BarChart3,
  FileText,
  Smartphone,
  Lock,
  Eye,
  RefreshCw
} from "lucide-react";
import { useGoogleSEOCompliance } from "@/hooks/use-google-seo-compliance";

interface SEOComplianceDashboardProps {
  pageData: any;
}

export default function SEOComplianceDashboard({ pageData }: SEOComplianceDashboardProps) {
  const [complianceReport, setComplianceReport] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const { runComplianceCheck, fixSEOIssues, generateSEOReport } = useGoogleSEOCompliance(pageData);

  useEffect(() => {
    checkCompliance();
  }, [pageData]);

  const checkCompliance = async () => {
    setIsChecking(true);
    try {
      const report = generateSEOReport();
      setComplianceReport(report);
    } catch (error) {
      console.error('SEO compliance check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const fixAllIssues = async () => {
    if (!complianceReport?.issues) return;
    
    try {
      await fixSEOIssues(complianceReport.issues);
      await checkCompliance(); // Re-check after fixing
    } catch (error) {
      console.error('Failed to fix SEO issues:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return "bg-green-100";
    if (score >= 75) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getIcon = (status: 'passed' | 'failed' | 'warning') => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (!complianceReport) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO Compliance Check
          </CardTitle>
          <CardDescription>
            Analyzing your page against Google Search Console requirements...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Google SEO Compliance Score
            </div>
            <Button 
              onClick={checkCompliance} 
              disabled={isChecking}
              variant="outline"
              size="sm"
            >
              {isChecking ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Recheck
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${getScoreBgColor(complianceReport.score)}`}>
                  <span className={`text-2xl font-bold ${getScoreColor(complianceReport.score)}`}>
                    {complianceReport.score}%
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold">{complianceReport.status}</h3>
                  <p className="text-sm text-gray-600">
                    {complianceReport.passed.length} of {complianceReport.total} checks passed
                  </p>
                </div>
              </div>
              <Badge variant={complianceReport.score >= 90 ? "default" : complianceReport.score >= 75 ? "secondary" : "destructive"}>
                {complianceReport.status}
              </Badge>
            </div>
            <Progress value={complianceReport.score} className="h-2" />
            
            {complianceReport.issues.length > 0 && (
              <div className="flex gap-2">
                <Button onClick={fixAllIssues} size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Auto-Fix Issues
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  View Report
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <Tabs defaultValue="technical" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="technical">Technical SEO</TabsTrigger>
          <TabsTrigger value="content">Content SEO</TabsTrigger>
          <TabsTrigger value="experience">User Experience</TabsTrigger>
          <TabsTrigger value="gsc">Search Console</TabsTrigger>
        </TabsList>

        <TabsContent value="technical" className="space-y-4">
          <div className="grid gap-4">
            {[
              { key: 'titleOptimization', label: 'Title Optimization', icon: FileText, description: 'Meta title length and keywords' },
              { key: 'descriptionOptimization', label: 'Description Optimization', icon: FileText, description: 'Meta description length and keywords' },
              { key: 'canonicalURL', label: 'Canonical URL', icon: Link, description: 'Proper canonical URL setup' },
              { key: 'robotsTxt', label: 'Robots.txt', icon: Shield, description: 'Robots.txt configuration' },
              { key: 'sitemapSubmission', label: 'Sitemap', icon: Globe, description: 'XML sitemap submission' },
              { key: 'structuredData', label: 'Structured Data', icon: Code, description: 'Schema.org markup' },
              { key: 'imageOptimization', label: 'Image Optimization', icon: Image, description: 'Alt text and image optimization' },
              { key: 'httpsSecurity', label: 'HTTPS Security', icon: Lock, description: 'SSL certificate and HTTPS' },
            ].map(({ key, label, icon: Icon, description }) => (
              <Card key={key}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-gray-600" />
                      <div>
                        <h4 className="font-medium">{label}</h4>
                        <p className="text-sm text-gray-600">{description}</p>
                      </div>
                    </div>
                    {getIcon(complianceReport.passed.includes(key) ? 'passed' : 'failed')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid gap-4">
            {[
              { key: 'contentQuality', label: 'Content Quality', icon: FileText, description: 'Unique, valuable content' },
              { key: 'keywordOptimization', label: 'Keyword Optimization', icon: Target, description: 'Proper keyword usage and density' },
              { key: 'readabilityScore', label: 'Readability', icon: Eye, description: 'Content readability score' },
              { key: 'internalLinking', label: 'Internal Linking', icon: Link, description: 'Internal link structure' },
              { key: 'externalLinking', label: 'External Linking', icon: Globe, description: 'Authoritative external links' },
              { key: 'headingStructure', label: 'Heading Structure', icon: FileText, description: 'Proper H1, H2, H3 hierarchy' },
              { key: 'contentLength', label: 'Content Length', icon: FileText, description: 'Sufficient word count' },
              { key: 'duplicateContent', label: 'Duplicate Content', icon: AlertTriangle, description: 'No duplicate content issues' },
            ].map(({ key, label, icon: Icon, description }) => (
              <Card key={key}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-gray-600" />
                      <div>
                        <h4 className="font-medium">{label}</h4>
                        <p className="text-sm text-gray-600">{description}</p>
                      </div>
                    </div>
                    {getIcon(complianceReport.passed.includes(key) ? 'passed' : 'failed')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="experience" className="space-y-4">
          <div className="grid gap-4">
            {[
              { key: 'coreWebVitals', label: 'Core Web Vitals', icon: Zap, description: 'LCP, FID, CLS metrics' },
              { key: 'mobileUsability', label: 'Mobile Usability', icon: Smartphone, description: 'Mobile-friendly design' },
              { key: 'mobileFriendly', label: 'Mobile Friendly', icon: Smartphone, description: 'Responsive design' },
              { key: 'safeBrowsing', label: 'Safe Browsing', icon: Shield, description: 'No malware or phishing' },
              { key: 'httpsUsage', label: 'HTTPS Usage', icon: Lock, description: 'Secure connection' },
              { key: 'noIntrusiveInterstitials', label: 'No Intrusive Interstitials', icon: AlertTriangle, description: 'No annoying pop-ups' },
            ].map(({ key, label, icon: Icon, description }) => (
              <Card key={key}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-gray-600" />
                      <div>
                        <h4 className="font-medium">{label}</h4>
                        <p className="text-sm text-gray-600">{description}</p>
                      </div>
                    </div>
                    {getIcon(complianceReport.passed.includes(key) ? 'passed' : 'failed')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="gsc" className="space-y-4">
          <div className="grid gap-4">
            {[
              { key: 'indexability', label: 'Indexability', icon: Search, description: 'Page can be indexed by Google' },
              { key: 'crawlability', label: 'Crawlability', icon: Globe, description: 'Page can be crawled by Google' },
              { key: 'sitemapCoverage', label: 'Sitemap Coverage', icon: FileText, description: 'URL included in sitemap' },
              { key: 'robotsDirectives', label: 'Robots Directives', icon: Shield, description: 'Proper robots meta tags' },
              { key: 'canonicalConsistency', label: 'Canonical Consistency', icon: Link, description: 'Consistent canonical URLs' },
              { key: 'nofollowLinks', label: 'Nofollow Links', icon: Link, description: 'Proper nofollow usage' },
              { key: 'redirectChains', label: 'Redirect Chains', icon: RefreshCw, description: 'No redirect chains' },
              { key: 'soft404s', label: 'Soft 404s', icon: AlertTriangle, description: 'No soft 404 errors' },
              { key: 'serverErrors', label: 'Server Errors', icon: XCircle, description: 'No 5xx server errors' },
            ].map(({ key, label, icon: Icon, description }) => (
              <Card key={key}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-gray-600" />
                      <div>
                        <h4 className="font-medium">{label}</h4>
                        <p className="text-sm text-gray-600">{description}</p>
                      </div>
                    </div>
                    {getIcon(complianceReport.passed.includes(key) ? 'passed' : 'failed')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Recommendations */}
      {complianceReport.recommendations && complianceReport.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              SEO Recommendations
            </CardTitle>
            <CardDescription>
              Actionable recommendations to improve your SEO score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {complianceReport.recommendations.map((recommendation: string, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
