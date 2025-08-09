import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, FileText, Building2, Package } from "lucide-react";

const Billing = () => {
  const [showAll, setShowAll] = useState(false);
  const summary = [
    {
      title: "Outstanding Balance",
      value: "$8,920",
      change: "+3.1% this week",
      icon: DollarSign,
    },
    {
      title: "Claims Submitted",
      value: "142",
      change: "+12 this month",
      icon: FileText,
    },
    {
      title: "Payments Received",
      value: "$21,450",
      change: "+6.4% this month",
      icon: TrendingUp,
    },
  ];

  const recentTransactions = [
    { id: "CLM-10231", patient: "Sarah Mitchell", gpAttendance: "23", excision: "30071", amount: "$240.00", status: "Pending" },
    { id: "CLM-10230", patient: "James Wilson", gpAttendance: "36", excision: "30075", amount: "$1,120.00", status: "Paid" },
    { id: "CLM-10229", patient: "Emma Thompson", gpAttendance: "23", excision: "-", amount: "$85.00", status: "Denied" },
    { id: "CLM-10228", patient: "Robert Chen", gpAttendance: "44", excision: "30067", amount: "$460.00", status: "In Review" },
  ];

  const allTransactions = [
    ...recentTransactions,
    { id: "CLM-10227", patient: "Michael Brown", gpAttendance: "36", excision: "30071", amount: "$320.00", status: "Paid" },
    { id: "CLM-10226", patient: "Lisa Anderson", gpAttendance: "23", excision: "-", amount: "$75.00", status: "Pending" },
    { id: "CLM-10225", patient: "David Kim", gpAttendance: "36", excision: "30075", amount: "$540.00", status: "Paid" },
    { id: "CLM-10224", patient: "Anna Rodriguez", gpAttendance: "44", excision: "30067", amount: "$210.00", status: "In Review" },
    { id: "CLM-10223", patient: "Peter Wong", gpAttendance: "23", excision: "-", amount: "$130.00", status: "Denied" },
    { id: "CLM-10222", patient: "Grace Lee", gpAttendance: "36", excision: "30071", amount: "$980.00", status: "Paid" },
    { id: "CLM-10221", patient: "Tom Hughes", gpAttendance: "23", excision: "-", amount: "$410.00", status: "Pending" },
    { id: "CLM-10220", patient: "Nina Patel", gpAttendance: "36", excision: "30075", amount: "$270.00", status: "Paid" },
    { id: "CLM-10219", patient: "Olivia Chen", gpAttendance: "23", excision: "-", amount: "$150.00", status: "Denied" },
    { id: "CLM-10218", patient: "Ethan Park", gpAttendance: "44", excision: "30067", amount: "$625.00", status: "Paid" },
  ];

  const transactionsToShow = showAll ? allTransactions : recentTransactions;

  const expenseSummary = [
    {
      title: "Rent (This Month)",
      value: "$4,500",
      note: "Due on the 1st",
      icon: Building2,
    },
    {
      title: "Supplies (This Month)",
      value: "$1,280",
      note: "Pending PO approvals",
      icon: Package,
    },
  ];

  const expenses = [
    { date: "2025-08-01", category: "Rent", vendor: "Clinic Landlord LLC", amount: "$4,500.00", status: "Paid" },
    { date: "2025-08-08", category: "Supplies", vendor: "MedSupply Co.", amount: "$320.00", status: "Pending" },
    { date: "2025-08-03", category: "Supplies", vendor: "DermaKits Inc.", amount: "$460.00", status: "Paid" },
    { date: "2025-07-01", category: "Rent", vendor: "Clinic Landlord LLC", amount: "$4,500.00", status: "Paid" },
    { date: "2025-07-15", category: "Supplies", vendor: "MedSupply Co.", amount: "$500.00", status: "Paid" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {summary.map((item, idx) => (
          <Card key={idx} className="clinical-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{item.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{item.change}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-medical-primary/10 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-medical-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="clinical-shadow">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                {showAll ? "All billing activity" : "Latest claims and payment activity"}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAll((v) => !v)}>
                {showAll ? "Show Recent Only" : "View All History"}
              </Button>
              <Button variant="outline" size="sm">Export CSV</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead className="text-right">GP Attendance</TableHead>
                <TableHead className="text-right">Excision</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionsToShow.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">{tx.id}</TableCell>
                  <TableCell>{tx.patient}</TableCell>
                  <TableCell className="text-right">{tx.gpAttendance}</TableCell>
                  <TableCell className="text-right">{tx.excision}</TableCell>
                  <TableCell className="text-right">{tx.amount}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={
                      tx.status === "Paid" ? "default" :
                      tx.status === "Denied" ? "destructive" : "secondary"
                    }>
                      {tx.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 text-xs text-muted-foreground">
            Showing {transactionsToShow.length} {transactionsToShow.length === 1 ? "entry" : "entries"}
          </div>
        </CardContent>
      </Card>

      {/* Operational Expenses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {expenseSummary.map((item, idx) => (
          <Card key={idx} className="clinical-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{item.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{item.note}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-medical-primary/10 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-medical-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="clinical-shadow">
        <CardHeader>
          <CardTitle>Operational Expenses</CardTitle>
          <CardDescription>Rent and supplies history</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((e, i) => (
                <TableRow key={`${e.date}-${i}`}>
                  <TableCell className="font-medium">{e.date}</TableCell>
                  <TableCell>{e.category}</TableCell>
                  <TableCell>{e.vendor}</TableCell>
                  <TableCell className="text-right">{e.amount}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={
                      e.status === "Paid" ? "default" :
                      e.status === "Pending" ? "secondary" : "outline"
                    }>
                      {e.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Billing;


