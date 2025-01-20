"use client";

import { BookOpen, ChevronRight, GroupIcon, Home, MapPin, User, UserPlus, Users, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Link, useNavigate } from "react-router-dom";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const navigate = useNavigate();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
      <SidebarMenuButton onClick={() => navigate('/home')}>
          <Home className="h-4 w-4" />
          Home
        </SidebarMenuButton>
        <SidebarMenuButton onClick={() => navigate('/studysession')}>
          <BookOpen className="h-4 w-4" />
          Sessions
        </SidebarMenuButton>
        <SidebarMenuButton onClick={() => navigate('/studygroups')}>
          <Users className="h-4 w-4" />
          Study Groups
        </SidebarMenuButton>
        <SidebarMenuButton onClick={() => navigate('/profile')}>
          <User className="h-4 w-4" />
          Profile
        </SidebarMenuButton>
        <SidebarMenuButton onClick={() => navigate('/findbuddies')}>
          <UserPlus className="h-4 w-4" />
          Find Buddies
        </SidebarMenuButton>
        <SidebarMenuButton onClick={() => navigate('/map')}>
          <MapPin className="h-4 w-4" />
          Map
        </SidebarMenuButton>
      </SidebarMenu>
    </SidebarGroup>
  );
}
