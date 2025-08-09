import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Camera, 
  Smartphone, 
  QrCode, 
  MapPin, 
  Upload, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Eye,
  Maximize,
  Share2,
  Download
} from "lucide-react";

const ImagingWorkflow = () => {
  const [selectedLesion, setSelectedLesion] = useState<number | null>(null);

  const workflowSteps = [
    {
      step: 1,
      title: "Generate QR Code",
      description: "Create secure link for mobile capture",
      icon: QrCode,
      status: "completed",
      time: "30 seconds"
    },
    {
      step: 2,
      title: "Mobile Capture",
      description: "Patient scan & dermatoscopic imaging",
      icon: Smartphone,
      status: "in-progress",
      time: "2-3 minutes"
    },
    {
      step: 3,
      title: "Body Map Tagging",
      description: "Precise anatomical location mapping",
      icon: MapPin,
      status: "pending",
      time: "1 minute"
    },
    {
      step: 4,
      title: "Auto Upload",
      description: "Secure transfer to patient record",
      icon: Upload,
      status: "pending",
      time: "15 seconds"
    }
  ];

  const recentImages = [
    {
      id: 1,
      patient: "Sarah Mitchell",
      location: "Left shoulder blade",
      timestamp: "2 minutes ago",
      size: "8mm x 6mm",
      risk: "Medium",
      changes: "Stable",
      images: 3
    },
    {
      id: 2,
      patient: "James Wilson", 
      location: "Right forearm",
      timestamp: "15 minutes ago",
      size: "4mm x 4mm",
      risk: "Low",
      changes: "New lesion",
      images: 2
    },
    {
      id: 3,
      patient: "Emma Thompson",
      location: "Upper back",
      timestamp: "1 hour ago",
      size: "12mm x 8mm", 
      risk: "High",
      changes: "Growing",
      images: 5
    }
  ];

  const bodyMapRegions = [
    { region: "Head & Neck", lesions: 12, newToday: 2 },
    { region: "Chest", lesions: 8, newToday: 1 },
    { region: "Back", lesions: 15, newToday: 3 },
    { region: "Arms", lesions: 6, newToday: 0 },
    { region: "Legs", lesions: 9, newToday: 1 }
  ];

  return (
    <div className="space-y-6">
      {/* Workflow Status */}
      <Card className="clinical-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-medical-primary" />
            Active Imaging Session
          </CardTitle>
          <CardDescription>
            Patient: Sarah Mitchell | Age: 45 | Session ID: #IMG-2024-001
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {workflowSteps.map((step) => (
              <div 
                key={step.step}
                className={`p-4 rounded-lg border transition-all ${
                  step.status === 'completed' ? 'bg-clinical-success/10 border-clinical-success' :
                  step.status === 'in-progress' ? 'bg-medical-primary/10 border-medical-primary' :
                  'bg-surface-secondary border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.status === 'completed' ? 'bg-clinical-success text-white' :
                    step.status === 'in-progress' ? 'bg-medical-primary text-white' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {step.status === 'completed' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <step.icon className="w-4 h-4" />
                    )}
                  </div>
                  <Badge 
                    variant={
                      step.status === 'completed' ? 'default' :
                      step.status === 'in-progress' ? 'secondary' : 'outline'
                    }
                    className="text-xs"
                  >
                    {step.status === 'completed' ? 'Done' :
                     step.status === 'in-progress' ? 'Active' : 'Pending'}
                  </Badge>
                </div>
                <h4 className="font-medium text-sm mb-1">{step.title}</h4>
                <p className="text-xs text-muted-foreground mb-2">{step.description}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {step.time}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Captures */}
        <div className="lg:col-span-2">
          <Card className="clinical-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-medical-primary" />
                  Recent Captures
                </span>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export All
                </Button>
              </CardTitle>
              <CardDescription>Today's dermatoscopic images</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentImages.map((image) => (
                  <div 
                    key={image.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      selectedLesion === image.id ? 'border-medical-primary bg-medical-primary/5' : 'border-border'
                    }`}
                    onClick={() => setSelectedLesion(image.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-lg bg-medical-primary/10 flex items-center justify-center">
                          <Camera className="w-6 h-6 text-medical-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{image.patient}</p>
                          <p className="text-sm text-muted-foreground">{image.location} • {image.timestamp}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={
                            image.risk === 'High' ? 'destructive' : 
                            image.risk === 'Medium' ? 'default' : 'secondary'
                          }
                          className="text-xs"
                        >
                          {image.risk} Risk
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {image.images} images
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Size</p>
                        <p className="font-medium">{image.size}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Changes</p>
                        <p className={`font-medium ${
                          image.changes === 'Growing' ? 'text-clinical-danger' :
                          image.changes === 'New lesion' ? 'text-clinical-warning' :
                          'text-clinical-success'
                        }`}>
                          {image.changes}
                        </p>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm">
                          <Maximize className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Body Map Summary */}
        <Card className="clinical-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-medical-primary" />
              Body Map Summary
            </CardTitle>
            <CardDescription>Lesion distribution today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bodyMapRegions.map((region, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-surface-secondary">
                  <div>
                    <p className="font-medium text-foreground">{region.region}</p>
                    <p className="text-sm text-muted-foreground">{region.lesions} total lesions</p>
                  </div>
                  <div className="text-right">
                    {region.newToday > 0 ? (
                      <Badge className="bg-medical-primary text-white">
                        +{region.newToday} new
                      </Badge>
                    ) : (
                      <Badge variant="outline">No new</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-medical-primary/10 to-medical-secondary/10 border border-medical-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-medical-primary" />
                <span className="font-medium text-medical-primary">Quick Actions</span>
              </div>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <QrCode className="w-4 h-4" />
                  Generate New QR Code
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Camera className="w-4 h-4" />
                  Start New Session
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImagingWorkflow;