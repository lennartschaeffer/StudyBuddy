"use client";;
import { BookOpen, Home, MapPin, User, UserPlus, Users } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";

export function NavMain() {
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
