import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import NewPatientDialog from "@/components/NewPatientDialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Plus, 
  Filter, 
  Users, 
  Calendar, 
  Camera, 
  FileText, 
  Phone, 
  Mail,
  MapPin,
  AlertTriangle,
  Clock,
  Star,
  Edit,
  Eye
} from "lucide-react";
import type { Patient } from "@/types/patient";
import EditPatientDialog from "@/components/EditPatientDialog";
import ManagePatientPhotosDialog from "@/components/ManagePatientPhotosDialog";

type PatientManagementProps = {
  patients: Patient[];
  onCreatePatient?: (data: { name: string; age: number; gender: string; phone: string; email: string; medicare: string }) => void;
  onUpdatePatient?: (updated: Patient) => void;
  onUpdatePhotos?: (patientId: number, photos: string[]) => void;
};

const PatientManagement = ({ patients, onCreatePatient }: PatientManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);

  const recentActivity = [
    { patient: "Sarah Mitchell", action: "Images captured", time: "15 min ago", type: "imaging" },
    { patient: "James Wilson", action: "Consultation completed", time: "1 hour ago", type: "consultation" },
    { patient: "Emma Thompson", action: "Appointment scheduled", time: "2 hours ago", type: "appointment" },
    { patient: "Robert Chen", action: "Biopsy results received", time: "3 hours ago", type: "results" }
  ];

  const filteredPatients = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return patients.filter(
      (patient) => patient.name.toLowerCase().includes(term) || patient.medicare.includes(searchTerm)
    );
  }, [patients, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <Card className="clinical-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Patient Management</h2>
            <div className="flex items-center space-x-2">
              <NewPatientDialog className="gap-2" onCreate={onCreatePatient}
              >
                <Plus className="w-4 h-4" />
                New Patient
              </NewPatientDialog>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search patients by name or Medicare number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="lg:col-span-2">
          <Card className="clinical-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-medical-primary" />
                Patient Records ({filteredPatients.length})
              </CardTitle>
              <CardDescription>Active patient database</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPatients.map((patient) => (
                  <div 
                    key={patient.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      selectedPatient === patient.id ? 'border-medical-primary bg-medical-primary/5' : 'border-border'
                    }`}
                    onClick={() => setSelectedPatient(patient.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-medical-primary/10 text-medical-primary">
                            {patient.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{patient.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {patient.gender}, {patient.age} • Medicare: {patient.medicare}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={
                            patient.riskLevel === 'High' ? 'destructive' : 
                            patient.riskLevel === 'Medium' ? 'default' : 'secondary'
                          }
                          className="text-xs"
                        >
                          {patient.riskLevel} Risk
                        </Badge>
                        <Badge 
                          variant={patient.status === 'Follow-up' ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {patient.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Last Visit</p>
                        <p className="font-medium">{patient.lastVisit}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Next Appointment</p>
                        <p className="font-medium">{patient.nextAppointment}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Lesions</p>
                        <p className="font-medium">{patient.totalLesions}</p>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <EditPatientDialog
                          patient={patient}
                          onSave={(p) => onUpdatePatient?.(p)}
                          trigger={<Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>}
                        />
                        <ManagePatientPhotosDialog
                          patient={patient}
                          onSave={(photos) => onUpdatePhotos?.(patient.id, photos)}
                          trigger={<Button variant="ghost" size="sm"><Camera className="w-4 h-4" /></Button>}
                        />
                      </div>
                    </div>
                    
                    {patient.newLesions > 0 && (
                      <div className="mt-3 p-2 rounded bg-clinical-warning/10 border border-clinical-warning/20">
                        <div className="flex items-center gap-2 text-sm text-clinical-warning">
                          <AlertTriangle className="w-4 h-4" />
                          {patient.newLesions} new lesion{patient.newLesions > 1 ? 's' : ''} documented
                        </div>
                      </div>
                    )}

                    {Array.isArray(patient.photos) && patient.photos.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs text-muted-foreground mb-2">Photos ({patient.photos.length})</div>
                        <div className="grid grid-cols-3 gap-2">
                          {patient.photos.slice(0, 6).map((src, idx) => (
                            <img key={idx} src={src} alt="patient photo" className="w-full h-16 object-cover rounded border" />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient Details & Activity */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="clinical-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Patient Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-surface-secondary">
                  <p className="text-2xl font-bold text-medical-primary">{patients.length}</p>
                  <p className="text-sm text-muted-foreground">Total Patients</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-surface-secondary">
                  <p className="text-2xl font-bold text-clinical-danger">
                    {patients.filter(p => p.riskLevel === 'High').length}
                  </p>
                  <p className="text-sm text-muted-foreground">High Risk</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-surface-secondary">
                  <p className="text-2xl font-bold text-clinical-warning">
                    {patients.filter(p => p.status === 'Follow-up').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Follow-ups</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-surface-secondary">
                  <p className="text-2xl font-bold text-clinical-success">
                    {patients.reduce((sum, p) => sum + p.newLesions, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">New Lesions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="clinical-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-medical-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-surface-secondary transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'imaging' ? 'bg-medical-primary/10' :
                      activity.type === 'consultation' ? 'bg-clinical-success/10' :
                      activity.type === 'appointment' ? 'bg-clinical-info/10' :
                      'bg-clinical-warning/10'
                    }`}>
                      {activity.type === 'imaging' ? <Camera className="w-4 h-4 text-medical-primary" /> :
                       activity.type === 'consultation' ? <FileText className="w-4 h-4 text-clinical-success" /> :
                       activity.type === 'appointment' ? <Calendar className="w-4 h-4 text-clinical-info" /> :
                       <AlertTriangle className="w-4 h-4 text-clinical-warning" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.patient}</p>
                      <p className="text-xs text-muted-foreground">{activity.action}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientManagement;