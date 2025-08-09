import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import NewPatientDialog from "@/components/NewPatientDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ImagingWorkflow from "@/components/ImagingWorkflow";
import AppointmentsCalendar from "@/components/AppointmentsCalendar";
import PatientManagement from "@/components/PatientManagement";
import type { Patient } from "@/types/patient";
import Billing from "@/components/Billing";
import { 
  Calendar, 
  Users, 
  Camera, 
  FileText, 
  DollarSign, 
  TrendingUp,
  Bell,
  Settings,
  Search,
  Plus,
  Activity,
  Shield,
  Clock,
  MapPin
} from "lucide-react";

type DashboardView = "dashboard" | "patients" | "appointments" | "imaging" | "billing";

interface DashboardLayoutProps {
  initialView?: DashboardView;
}

const DashboardLayout = ({ initialView = "dashboard" }: DashboardLayoutProps) => {
  const [activeView, setActiveView] = useState<DashboardView>(initialView);
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: 1,
      name: "Sarah Mitchell",
      age: 45,
      gender: "Female",
      phone: "+61 404 123 456",
      email: "sarah.mitchell@email.com",
      medicare: "2942 8573 4",
      lastVisit: "Today",
      nextAppointment: "3 weeks",
      riskLevel: "High",
      totalLesions: 8,
      newLesions: 2,
      status: "Active",
      skinType: "Type II",
      familyHistory: "Yes",
    },
    {
      id: 2,
      name: "James Wilson",
      age: 67,
      gender: "Male",
      phone: "+61 404 789 012",
      email: "james.wilson@email.com",
      medicare: "2847 6391 7",
      lastVisit: "Today",
      nextAppointment: "6 months",
      riskLevel: "Medium",
      totalLesions: 12,
      newLesions: 0,
      status: "Active",
      skinType: "Type III",
      familyHistory: "No",
    },
    {
      id: 3,
      name: "Emma Thompson",
      age: 32,
      gender: "Female",
      phone: "+61 404 345 678",
      email: "emma.thompson@email.com",
      medicare: "2749 5682 1",
      lastVisit: "2 days ago",
      nextAppointment: "12 months",
      riskLevel: "Low",
      totalLesions: 3,
      newLesions: 1,
      status: "Active",
      skinType: "Type IV",
      familyHistory: "No",
    },
    {
      id: 4,
      name: "Robert Chen",
      age: 58,
      gender: "Male",
      phone: "+61 404 567 890",
      email: "robert.chen@email.com",
      medicare: "2658 7294 9",
      lastVisit: "1 week ago",
      nextAppointment: "Follow-up needed",
      riskLevel: "High",
      totalLesions: 15,
      newLesions: 3,
      status: "Follow-up",
      skinType: "Type I",
      familyHistory: "Yes",
    },
  ]);

  const API_BASE = "/api";

  // Load patients from server on mount (falls back to seeded list on error)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/patients`);
        if (!res.ok) return; // keep local seed
        const json = await res.json();
        if (Array.isArray(json.patients)) {
          setPatients(json.patients);
        }
      } catch {
        // ignore and keep seed
      }
    })();
  }, []);

  const addPatient = async (data: { name: string; age: number; gender: string; phone: string; email: string; medicare: string }) => {
    try {
      const res = await fetch(`${API_BASE}/patients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          age: data.age,
          gender: data.gender,
          phone: data.phone,
          email: data.email,
          medicare: data.medicare,
          lastVisit: "New",
          nextAppointment: "Not scheduled",
          riskLevel: "Low",
          totalLesions: 0,
          newLesions: 0,
          status: "Active",
          skinType: "Unknown",
          familyHistory: "Unknown",
        }),
      });
      if (res.ok) {
        const created: Patient = await res.json();
        setPatients((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
      } else {
        // fallback to local add
        setPatients((prev) => {
          const nextId = prev.length ? Math.max(...prev.map((p) => p.id)) + 1 : 1;
          const newPatient: Patient = {
            id: nextId,
            name: data.name,
            age: data.age,
            gender: data.gender,
            phone: data.phone,
            email: data.email,
            medicare: data.medicare,
            lastVisit: "New",
            nextAppointment: "Not scheduled",
            riskLevel: "Low",
            totalLesions: 0,
            newLesions: 0,
            status: "Active",
            skinType: "Unknown",
            familyHistory: "Unknown",
          };
          return [newPatient, ...prev];
        });
      }
    } catch {
      // offline fallback
      setPatients((prev) => {
        const nextId = prev.length ? Math.max(...prev.map((p) => p.id)) + 1 : 1;
        const newPatient: Patient = {
          id: nextId,
          name: data.name,
          age: data.age,
          gender: data.gender,
          phone: data.phone,
          email: data.email,
          medicare: data.medicare,
          lastVisit: "New",
          nextAppointment: "Not scheduled",
          riskLevel: "Low",
          totalLesions: 0,
          newLesions: 0,
          status: "Active",
          skinType: "Unknown",
          familyHistory: "Unknown",
        };
        return [newPatient, ...prev];
      });
    }
    setActiveView("patients");
  };

  const updatePatient = async (updated: Patient) => {
    try {
      const res = await fetch(`${API_BASE}/patients/${encodeURIComponent(String(updated.id))}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const saved: Patient = await res.json();
        setPatients((prev) => prev.map((p) => (p.id === saved.id ? { ...p, ...saved } : p)));
        return;
      }
      if (res.status === 404) {
        // If patient not found on server, create it
        const createRes = await fetch(`${API_BASE}/patients`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        });
        if (createRes.ok) {
          const created: Patient = await createRes.json();
          setPatients((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
          return;
        }
      }
    } catch {
      // ignore
    }
    // fallback local update
    setPatients((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
  };

  const updatePhotos = async (patientId: number, photos: string[]) => {
    try {
      const res = await fetch(`${API_BASE}/patients/${encodeURIComponent(String(patientId))}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photos }),
      });
      if (res.ok) {
        const saved: Patient = await res.json();
        setPatients((prev) => prev.map((p) => (p.id === saved.id ? { ...p, ...saved } : p)));
        return;
      }
      if (res.status === 404) {
        // If patient not found, create from current local copy with photos
        const local = patients.find((p) => p.id === patientId);
        if (local) {
          const createRes = await fetch(`${API_BASE}/patients`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...local, photos }),
          });
          if (createRes.ok) {
            const created: Patient = await createRes.json();
            setPatients((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
            return;
          }
        }
      }
    } catch {
      // ignore
    }
    // fallback local update
    setPatients((prev) => prev.map((p) => (p.id === patientId ? { ...p, photos } : p)));
  };

  const stats = [
    {
      title: "Today's Appointments",
      value: "23",
      change: "+2 from yesterday",
      icon: Calendar,
      trend: "up"
    },
    {
      title: "Active Patients",
      value: "1,847",
      change: "+15 this week",
      icon: Users,
      trend: "up"
    },
    {
      title: "Images Captured",
      value: "89",
      change: "Today",
      icon: Camera,
      trend: "neutral"
    },
    {
      title: "Claims Processed",
      value: "$12,430",
      change: "+8.2% this month",
      icon: DollarSign,
      trend: "up"
    }
  ];

  const recentPatients = [
    { name: "Sarah Mitchell", age: "45", lastVisit: "Today 2:30 PM", status: "In Progress" },
    { name: "James Wilson", age: "67", lastVisit: "Today 1:15 PM", status: "Completed" },
    { name: "Emma Thompson", age: "32", lastVisit: "Today 11:45 AM", status: "Completed" },
    { name: "Robert Chen", age: "58", lastVisit: "Today 10:30 AM", status: "Follow-up" },
  ];

  const upcomingAppointments = [
    { time: "3:00 PM", patient: "Michael Brown", type: "Full Body Check", duration: "30 min" },
    { time: "3:30 PM", patient: "Lisa Anderson", type: "Lesion Review", duration: "15 min" },
    { time: "4:00 PM", patient: "David Kim", type: "Initial Consultation", duration: "45 min" },
    { time: "4:45 PM", patient: "Anna Rodriguez", type: "Follow-up", duration: "20 min" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-surface-primary clinical-shadow">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-medical-primary to-medical-secondary flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">DermPx</h1>
                <p className="text-sm text-muted-foreground">Skin Cancer Practice Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <NewPatientDialog variant="outline" size="sm" className="gap-2" onCreate={addPatient}>
                <Plus className="w-4 h-4" />
                New Patient
              </NewPatientDialog>
              
              <Button variant="outline" size="sm" className="gap-2">
                <Camera className="w-4 h-4" />
                Capture Image
              </Button>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Bell className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="w-5 h-5" />
                </Button>
                <Avatar className="w-8 h-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-medical-primary text-white text-sm">DR</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b bg-surface-secondary">
        <div className="container mx-auto px-6">
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as DashboardView)} className="w-full">
            <TabsList className="h-12 bg-transparent border-none p-0">
              <TabsTrigger 
                value="dashboard" 
                className="px-6 py-3 data-[state=active]:bg-surface-primary data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-medical-primary"
              >
                <Activity className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="patients"
                className="px-6 py-3 data-[state=active]:bg-surface-primary data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-medical-primary"
              >
                <Users className="w-4 h-4 mr-2" />
                Patients
              </TabsTrigger>
              <TabsTrigger 
                value="appointments"
                className="px-6 py-3 data-[state=active]:bg-surface-primary data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-medical-primary"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Appointments
              </TabsTrigger>
              <TabsTrigger 
                value="imaging"
                className="px-6 py-3 data-[state=active]:bg-surface-primary data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-medical-primary"
              >
                <Camera className="w-4 h-4 mr-2" />
                Imaging
              </TabsTrigger>
              <TabsTrigger 
                value="billing"
                className="px-6 py-3 data-[state=active]:bg-surface-primary data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-medical-primary"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Billing
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Content */}
            <TabsContent value="dashboard" className="mt-6 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <Card key={index} className="clinical-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                          <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                          <p className="text-sm text-muted-foreground mt-1">{stat.change}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-medical-primary/10 flex items-center justify-center">
                          <stat.icon className="w-6 h-6 text-medical-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Patients */}
                <Card className="clinical-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-medical-primary" />
                      Recent Patients
                    </CardTitle>
                    <CardDescription>Today's patient activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentPatients.map((patient, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-surface-secondary">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-medical-primary/10 text-medical-primary">
                                {patient.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">{patient.name}</p>
                              <p className="text-sm text-muted-foreground">Age {patient.age} • {patient.lastVisit}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {patient.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Appointments */}
                <Card className="clinical-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-medical-primary" />
                      Upcoming Appointments
                    </CardTitle>
                    <CardDescription>Next appointments today</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingAppointments.map((appointment, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-surface-secondary">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-lg bg-medical-primary flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">{appointment.time.split(':')[0]}</span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{appointment.patient}</p>
                              <p className="text-sm text-muted-foreground">{appointment.type} • {appointment.duration}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {appointment.time}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Other tab contents would go here */}
            <TabsContent value="patients" className="mt-6">
              <PatientManagement
                patients={patients}
                onCreatePatient={addPatient}
                onUpdatePatient={updatePatient}
                onUpdatePhotos={updatePhotos}
              />
            </TabsContent>

            <TabsContent value="appointments" className="mt-6">
              <AppointmentsCalendar />
            </TabsContent>

            <TabsContent value="imaging" className="mt-6">
              <ImagingWorkflow />
            </TabsContent>
            <TabsContent value="billing" className="mt-6">
              <Billing />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
