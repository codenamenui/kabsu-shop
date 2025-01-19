"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Download } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchAdminDashboardData } from "./data";
import { BarChartComponent } from "@/components/bar-chart";
import { PieChartComponent } from "@/components/pie-chart";
import { createClient } from "@/supabase/clients/createClient";

// Utility function to export data to CSV
const exportToCSV = (data, filename) => {
  // Format the data for CSV
  console.log(data);
  const csvData = data.map((item) => ({
    "ORDER ID": item.id,
    "ORDER DATE": item.created_at,
    "USER ID": item.profiles.id,
    "USER FIRST NAME": item.profiles.first_name,
    "USER LAST NAME": item.profiles.last_name,
    "USER EMAIL": item.profiles.email,
    "PAYMENT METHOD": item.online_payment ? "Online" : "COD",
    "MERCH ID": item.merchandises.id,
    "MERCH NAME": item.merchandises.name,
    "VARIANT ID": item.variants.id,
    "VARIANT NAME": item.variants.name,
    QUANTITY: item.quantity,
    PRICE: item.price,
    STATUS: item.order_statuses.received
      ? "Received"
      : item.order_statuses.paid
        ? "Paid"
        : item.order_statuses.cancelled
          ? "Cancelled"
          : "Pending",
    "CANCEL DATE": item.order_statuses.cancelled_at ?? "",
    "CANCEL REASON": item.order_statuses.cancel_reason ?? "",
  }));

  // Create CSV headers
  const headers = Object.keys(csvData[0]);
  const csvContent = [
    headers.join(","),
    ...csvData.map((row) =>
      headers.map((header) => `"${row[header]}"`).join(","),
    ),
  ].join("\n");

  // Create and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export default function AdminDashboard({
  params,
}: {
  params: { shopId: string };
}) {
  const [dashboardData, setDashboardData] = useState<{
    shopOverview: any[];
    orderStatus: any[];
    topSellingMerchandise: any[];
    collegeOrderSummary: any[];
  }>();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await fetchAdminDashboardData(parseInt(params.shopId));
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      }
    };

    loadDashboardData();
  }, [params.shopId]);

  const handleExport = () => {
    const exportData = async () => {
      const supabase = createClient();
      const { data: orders, error } = await supabase
        .from("orders")
        .select(
          "id, created_at, quantity, price, online_payment, profiles(id, first_name, last_name, email), merchandises(id, name), variants(id, name), order_statuses(received, paid, cancelled, cancelled_at, cancel_reason)",
        );
      if (error) {
        console.error("Failed to fetch orders for export:", error);
        return;
      }
      exportToCSV(
        orders,
        `sales-report-${new Date().toISOString().split("T")[0]}.csv`,
      );
    };
    exportData();
  };

  if (!dashboardData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button onClick={handleExport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export to CSV
        </Button>
      </div>

      {/* Shop Overview Cards */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
            <CardDescription>Shop Performance</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-3xl font-bold">
              {dashboardData.shopOverview[0]?.totalOrders || 0}
            </span>
            <TrendingUp className="text-green-500" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>Sales Performance</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-3xl font-bold">
              ₱
              {dashboardData.shopOverview[0]?.totalRevenue.toLocaleString() ||
                0}
            </span>
            <TrendingUp className="text-green-500" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Orders</CardTitle>
            <CardDescription>Awaiting Action</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-3xl font-bold">
              {dashboardData.shopOverview[0]?.pendingOrders || 0}
            </span>
            <TrendingUp className="text-yellow-500" />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <BarChartComponent
          orders={dashboardData.collegeOrderSummary.map((college) => ({
            college: college.collegeName,
            orders: college.totalOrders,
          }))}
        />

        <PieChartComponent
          orders={dashboardData.orderStatus.map((status) => ({
            status: status.status,
            quantities: status.count,
          }))}
        />
      </div>

      {/* Top Selling Merchandise Table */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Top Selling Merchandise</CardTitle>
            <CardDescription>Best Performing Products</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">Product</th>
                <th className="p-2 text-right">Total Quantity</th>
                <th className="p-2 text-right">Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.topSellingMerchandise.map((merch) => (
                <tr key={merch.order_id} className="border-b">
                  <td className="p-2">{merch.name}</td>
                  <td className="p-2 text-right">{merch.totalQuantity}</td>
                  <td className="p-2 text-right">
                    ₱{merch.totalRevenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
