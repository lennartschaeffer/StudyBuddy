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
import { Link } from "react-router-dom";

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
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
      <SidebarMenuButton>
          <Home className="h-4 w-4" />
          <Link to={"/home"}>Home</Link>
        </SidebarMenuButton>
        <SidebarMenuButton>
          <BookOpen className="h-4 w-4" />
          <Link to={"/studysession"}>Sessions</Link>
        </SidebarMenuButton>
        <SidebarMenuButton>
          <Users className="h-4 w-4" />
          <Link to={"/studygroups"}>Study Groups</Link>
        </SidebarMenuButton>
        <SidebarMenuButton>
          <User className="h-4 w-4" />
          <Link to={"/profile"}>Profile</Link>
        </SidebarMenuButton>
        <SidebarMenuButton>
          <UserPlus className="h-4 w-4" />
          <Link to={"/findbuddies"}>Find Buddies</Link>
        </SidebarMenuButton>
        <SidebarMenuButton>
          <MapPin className="h-4 w-4" />
          <Link to={"/map"}>Map</Link>
        </SidebarMenuButton>
      </SidebarMenu>
    </SidebarGroup>
  );
}
