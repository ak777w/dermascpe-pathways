import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ImagingWorkflow from "@/components/ImagingWorkflow";
import PatientManagement from "@/components/PatientManagement";
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

const DashboardLayout = () => {
  const [activeView, setActiveView] = useState("dashboard");

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
    { name: "Sarah Mitchell", age: "45", lastVisit: "Today 2:30 PM", status: "In Progress", risk: "High" },
    { name: "James Wilson", age: "67", lastVisit: "Today 1:15 PM", status: "Completed", risk: "Medium" },
    { name: "Emma Thompson", age: "32", lastVisit: "Today 11:45 AM", status: "Completed", risk: "Low" },
    { name: "Robert Chen", age: "58", lastVisit: "Today 10:30 AM", status: "Follow-up", risk: "High" },
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
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                New Patient
              </Button>
              
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
          <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
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
                            <Badge 
                              variant={patient.risk === 'High' ? 'destructive' : patient.risk === 'Medium' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {patient.risk} Risk
                            </Badge>
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
              <PatientManagement />
            </TabsContent>

            <TabsContent value="appointments" className="mt-6">
              <Card className="clinical-shadow">
                <CardContent className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Appointment Scheduling</h3>
                  <p className="text-muted-foreground">Advanced scheduling with online bookings and SMS reminders.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="imaging" className="mt-6">
              <ImagingWorkflow />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
