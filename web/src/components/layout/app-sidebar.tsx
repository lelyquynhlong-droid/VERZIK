"use client";
import * as React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  IconChartBar, IconDashboard, IconDatabase, IconHelp,
  IconListDetails, IconReport, IconSearch, IconSettings,
  IconUsers, IconFlask, IconTrafficCone, IconRobot,
} from "@tabler/icons-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  CustomSidebar, SidebarHeader, SidebarContent, SidebarFooter,
  SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenuItem,
} from "@/components/layout/custom-sidebar";
import { NavUser } from "@/components/layout/nav-user";
import { motion } from "framer-motion";
import { PAGE_TITLES } from "@/lib/app-constants";

const u = (p: string, page: string) => (p ? `/${p}/${page}` : `/${page}`);

function buildNavMain(p: string) {
  return [
    { title: PAGE_TITLES.DASHBOARD, url: u(p, "dashboard"), icon: IconDashboard },
    { title: "Giám sát lưu lượng", url: u(p, "traffic"), icon: IconTrafficCone },
    { title: "Phân tích mô hình", url: u(p, "models"), icon: IconRobot },
    { title: "Nhật ký hệ thống", url: u(p, "logs"), icon: IconListDetails },
  ];
}

function buildNavReports(p: string) {
  return [
    { name: "Báo cáo ngày", url: u(p, "reports/daily"), icon: IconReport },
    { name: "Thống kê tháng", url: u(p, "reports/monthly"), icon: IconChartBar },
    { name: "Dữ liệu thô", url: u(p, "reports/raw"), icon: IconDatabase },
  ];
}

/**
 * XỬ LÝ PHÂN QUYỀN MENU
 * Chỉ Owner mới được thấy Settings và Team
 */
function buildNavSecondary(p: string, role: string) {
  const items = [
    { title: PAGE_TITLES.SEARCH, url: u(p, "search"), icon: IconSearch },
    { title: PAGE_TITLES.HELP, url: u(p, "help"), icon: IconHelp },
  ];

  if (role === 'owner') {
    items.push(
      { title: PAGE_TITLES.TEAM, url: u(p, "team"), icon: IconUsers },
      { title: PAGE_TITLES.SETTINGS, url: u(p, "settings"), icon: IconSettings }
    );
  }
  return items;
}

export function AppSidebar() {
  const { pathname } = useLocation();
  const { routePrefix, role } = useAuth();
  const p = routePrefix;

  return (
    <CustomSidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-3 font-bold text-lg">
          <IconTrafficCone className="text-primary" /> VIETFUTURE
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Hệ thống</SidebarGroupLabel>
          <SidebarGroupContent>
            {buildNavMain(p).map((item) => (
              <SidebarMenuItem key={item.url} as={NavLink} to={item.url} icon={<item.icon className="size-4" />} label={item.title} isActive={pathname === item.url} />
            ))}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-2">
          <SidebarGroupLabel>Báo cáo</SidebarGroupLabel>
          <SidebarGroupContent>
            {buildNavReports(p).map((item) => (
              <SidebarMenuItem key={item.url} as={NavLink} to={item.url} icon={<item.icon className="size-4" />} label={item.name} isActive={pathname === item.url} />
            ))}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto pt-2 border-t">
          <SidebarGroupLabel>Cấu hình</SidebarGroupLabel>
          <SidebarGroupContent>
            {buildNavSecondary(p, role).map((item) => (
              <SidebarMenuItem key={item.url} as={NavLink} to={item.url} icon={<item.icon className="size-4" />} label={item.title} isActive={pathname === item.url} />
            ))}
          </SidebarGroupContent>
        </SidebarGroup>

        {import.meta.env.DEV && role === "owner" && (
          <SidebarGroup className="pt-2 border-t">
            <SidebarGroupLabel>Dev</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenuItem as={NavLink} to={u(p, "sandbox")} icon={<IconFlask className="size-4" />} label="Sandbox" isActive={pathname === u(p, "sandbox")} />
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </CustomSidebar>
  );
}