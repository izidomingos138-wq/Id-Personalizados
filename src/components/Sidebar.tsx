/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Receipt, 
  Users, 
  Tag, 
  BarChart3, 
  Settings, 
  LogOut, 
  X,
  Store
} from "lucide-react";
import { StoreTheme } from "../types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentTheme: StoreTheme;
  onLogout: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
  currentTheme,
  onLogout
}: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "vitrine", label: "Vitrine (Loja)", icon: Store },
    { id: "produtos", label: "Produtos", icon: ShoppingBag },
    { id: "pedidos", label: "Pedidos", icon: Receipt },
    { id: "clientes", label: "Clientes", icon: Users },
    { id: "promocoes", label: "Promoções", icon: Tag },
    { id: "relatorios", label: "Relatórios", icon: BarChart3 },
    { id: "configuracoes", label: "Configurações", icon: Settings },
  ];

  const handleMenuClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpen(false); // Close mobile sidebar automatically
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          id="sidebar-overlay"
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        id="sidebar-panel"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-850 shadow-2xl transition-transform duration-300 transform lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header Header Gradient */}
        <div className={`p-6 bg-gradient-to-br ${currentTheme.gradientFrom} ${currentTheme.gradientTo} text-white relative`}>
          {/* Close button for Mobile */}
          <button
            id="close-sidebar-mobile"
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white lg:hidden transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Admin Avatar & Store Info */}
          <div className="flex flex-col items-start mt-2">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner mb-4">
              <Store className="w-7 h-7 text-white" />
            </div>
            
            <h1 className="font-display font-bold text-2xl tracking-tight leading-none text-white drop-shadow-xs">
              ID Personalizados
            </h1>
            <p className="text-white/70 text-sm mt-1 font-medium font-sans">
              Administrador
            </p>
          </div>
        </div>

        {/* Menu Listings */}
        <nav className="p-4 flex-1 flex flex-col justify-between h-[calc(100vh-175px)] overflow-y-auto">
          <ul className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    id={`menu-item-${item.id}`}
                    onClick={() => handleMenuClick(item.id)}
                    className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-medium text-[15px] transition-all sidebar-item ${
                      isActive
                        ? `bg-indigo-500/10 text-[#818cf8] border-l-4 font-semibold active`
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    }`}
                    style={isActive ? { borderLeftColor: "#818cf8" } : {}}
                  >
                    <Icon className={`w-5 h-5 transition-transform ${
                      isActive ? "scale-110" : ""
                    }`} style={isActive ? { color: "#818cf8" } : {}} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Logout Section */}
          <div className="pt-4 border-t border-slate-800 mt-auto">
            <button
               id="logout-button"
               onClick={onLogout}
               className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-rose-405 hover:bg-rose-500/10 font-medium text-[15px] transition-all text-rose-400"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair do Painel</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}
