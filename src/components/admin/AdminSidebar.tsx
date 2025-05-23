import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNav } from "@/components/ui/sidebar-nav";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from '@/hooks/auth/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  Briefcase,
  Star,
  CalendarDays,
  CreditCard,
  Users,
  MessagesSquare,
  LifeBuoy,
  Settings,
  Database
} from 'lucide-react';

export const AdminSidebar = () => {
  const { toggleSidebar, isSidebarOpen } = useSidebar();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('dashboard');
  const { logout } = useAuth();
  
  useEffect(() => {
    const path = window.location.pathname.split('/')[2] || 'dashboard';
    setActiveItem(path);
  }, []);

  const menuItems = [
    {
      title: 'Tableau de bord',
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: '/admin',
      key: 'dashboard'
    },
    {
      title: 'Logements',
      icon: <Home className="h-5 w-5" />,
      path: '/admin/logements',
      key: 'logements'
    },
    {
      title: 'Offres d\'emploi',
      icon: <Briefcase className="h-5 w-5" />,
      path: '/admin/emplois',
      key: 'emplois'
    },
    {
      title: 'Avis',
      icon: <Star className="h-5 w-5" />,
      path: '/admin/avis',
      key: 'avis'
    },
    {
      title: 'Réservations',
      icon: <CalendarDays className="h-5 w-5" />,
      path: '/admin/reservations',
      key: 'reservations'
    },
    {
      title: 'Paiements',
      icon: <CreditCard className="h-5 w-5" />,
      path: '/admin/paiements',
      key: 'paiements'
    },
    {
      title: 'Utilisateurs',
      icon: <Users className="h-5 w-5" />,
      path: '/admin/utilisateurs',
      key: 'utilisateurs'
    },
    {
      title: 'Messages',
      icon: <MessagesSquare className="h-5 w-5" />,
      path: '/admin/messages',
      key: 'messages'
    },
    {
      title: 'Support',
      icon: <LifeBuoy className="h-5 w-5" />,
      path: '/admin/support',
      key: 'support'
    },
    {
      title: 'Paramètres',
      icon: <Settings className="h-5 w-5" />,
      path: '/admin/parametres',
      key: 'parametres'
    },
    {
      title: 'Test Supabase',
      icon: <Database className="h-5 w-5" />,
      path: '/admin/supabase-test',
      key: 'supabase-test'
    },
    {
      title: 'Test MySQL',
      icon: <Database className="h-5 w-5" />,
      path: '/admin/mysql-test',
      key: 'mysql-test'
    }
  ];

  return (
    <Sheet open={isSidebarOpen} onOpenChange={toggleSidebar}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <LayoutDashboard className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 border-r p-0 pt-6">
        <SidebarNav items={menuItems} activeItem={activeItem} onNavigate={(path) => {
          navigate(path);
          toggleSidebar(false);
          setActiveItem(path.split('/')[2] || 'dashboard');
        }} />
        <div className="p-4">
          <Button variant="outline" className="w-full" onClick={logout}>
            Déconnexion
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
