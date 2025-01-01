"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchAdminDashboardData } from "./data";
import { BarChartComponent } from "@/components/bar-chart";
import { PieChartComponent } from "@/components/pie-chart";

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

  if (!dashboardData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>

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
        <CardHeader>
          <CardTitle>Top Selling Merchandise</CardTitle>
          <CardDescription>Best Performing Products</CardDescription>
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
                <tr key={merch.id} className="border-b">
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
