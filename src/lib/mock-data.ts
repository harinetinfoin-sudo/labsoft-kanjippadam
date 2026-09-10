export type RoleName =
  | "Super Admin"
  | "Laboratory Admin"
  | "Receptionist"
  | "Lab Technician"
  | "Pathologist/Doctor"
  | "Accountant"
  | "Inventory Manager";

export const roles: Array<{ name: RoleName; description: string }> = [
  { name: "Super Admin", description: "Full platform access and security controls" },
  { name: "Laboratory Admin", description: "Operational oversight and staff management" },
  { name: "Receptionist", description: "Patient intake and scheduling" },
  { name: "Lab Technician", description: "Sample handling and result entry" },
  { name: "Pathologist/Doctor", description: "Review and verification of reports" },
  { name: "Accountant", description: "Billing, payments, and financial controls" },
  { name: "Inventory Manager", description: "Stock monitoring and procurement" },
];

export const stats = [
  { label: "Patients today", value: "184", change: "+12.4%", tone: "cyan" },
  { label: "Orders pending", value: "36", change: "+4.8%", tone: "amber" },
  { label: "Tests verified", value: "129", change: "+18.1%", tone: "emerald" },
  { label: "Revenue", value: "$48.2K", change: "+9.3%", tone: "violet" },
];

export const patients = [
  { id: "PT-1001", name: "Sarah Okafor", age: 34, doctor: "Dr. Adebayo", status: "In review", priority: "Routine" },
  { id: "PT-1002", name: "Michael Chen", age: 52, doctor: "Dr. Hassan", status: "Collected", priority: "Urgent" },
  { id: "PT-1003", name: "Aisha Yusuf", age: 41, doctor: "Dr. Nwosu", status: "Verified", priority: "Routine" },
  { id: "PT-1004", name: "Daniel Smith", age: 29, doctor: "Dr. Bell", status: "Waiting", priority: "Priority" },
  { id: "PT-1005", name: "Priya Mehta", age: 46, doctor: "Dr. Adebayo", status: "Completed", priority: "Routine" },
];

export const orders = [
  { id: "ORD-2048", patient: "Sarah Okafor", test: "CBC + Lipid Panel", status: "Sample received", amount: "$145.00" },
  { id: "ORD-2049", patient: "Michael Chen", test: "LFT / Renal Profile", status: "In progress", amount: "$210.00" },
  { id: "ORD-2050", patient: "Aisha Yusuf", test: "HbA1c + Full Blood Count", status: "Verified", amount: "$182.00" },
  { id: "ORD-2051", patient: "Daniel Smith", test: "COVID PCR", status: "Pending collection", amount: "$95.00" },
  { id: "ORD-2052", patient: "Priya Mehta", test: "Thyroid + Vitamin D", status: "Report ready", amount: "$260.00" },
];

export const tests = [
  { code: "CBC01", name: "Complete Blood Count", category: "Hematology", price: "$45.00", turnaround: "4 hrs" },
  { code: "CHE02", name: "Liver Function Test", category: "Chemistry", price: "$68.00", turnaround: "6 hrs" },
  { code: "MIC03", name: "Urine Culture", category: "Microbiology", price: "$90.00", turnaround: "24 hrs" },
  { code: "MO4", name: "HbA1c", category: "Endocrinology", price: "$52.00", turnaround: "8 hrs" },
  { code: "IMM05", name: "Vitamin D Panel", category: "Immunology", price: "$120.00", turnaround: "12 hrs" },
];

export const inventory = [
  { item: "EDTA tubes", stock: 240, reorder: 80, supplier: "MedSupply Ltd." },
  { item: "Serum separator tubes", stock: 180, reorder: 70, supplier: "TissueCare" },
  { item: "Culture media", stock: 54, reorder: 40, supplier: "BioQuest" },
  { item: "PCR kits", stock: 22, reorder: 25, supplier: "Alpha Diagnostics" },
  { item: "Gloves (box)", stock: 130, reorder: 60, supplier: "SafeHands" },
];

export const billing = [
  { invoice: "INV-1024", patient: "Sarah Okafor", amount: "$425.50", status: "Partial payment" },
  { invoice: "INV-1025", patient: "Michael Chen", amount: "$680.00", status: "Paid" },
  { invoice: "INV-1026", patient: "Aisha Yusuf", amount: "$235.75", status: "Outstanding" },
  { invoice: "INV-1027", patient: "Priya Mehta", amount: "$512.00", status: "Paid" },
];

export const audits = [
  { time: "08:42 AM", action: "Result verification", user: "Dr. Nwosu", record: "ORD-2050" },
  { time: "09:10 AM", action: "Inventory adjustment", user: "E. Okoye", record: "PCR kits" },
  { time: "11:35 AM", action: "Invoice issued", user: "M. Johnson", record: "INV-1027" },
  { time: "01:05 PM", action: "Patient registration", user: "L. Ade", record: "PT-1005" },
];

export const dashboardMetrics = {
  totalRevenue: "$48,200",
  collectionsToday: "$9,450",
  pendingReports: 16,
  archivedSamples: 42,
};
