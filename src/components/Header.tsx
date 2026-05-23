/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Menu, 
  Search, 
  Bell, 
  Calendar as CalIcon,
  Sparkles,
  CheckCircle,
  Clock
} from "lucide-react";
import { StoreTheme } from "../types";

interface HeaderProps {
  activeTab: string;
  setSidebarOpen: (open: boolean) => void;
  currentTheme: StoreTheme;
  globalSearch: string;
  setGlobalSearch: (search: string) => void;
}

export default function Header({
  activeTab,
  setSidebarOpen,
  currentTheme,
  globalSearch,
  setGlobalSearch
}: HeaderProps) {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [time, setTime] = useState("");

  const getPageTitle = () => {
    switch (activeTab) {
      case "dashboard": return "Resumo do Painel";
      case "produtos": return "Catálogo de Produtos";
      case "pedidos": return "Gestão de Pedidos";
      case "clientes": return "Diretório de Clientes";
      case "promocoes": return "Cupons & Promoções";
      case "relatorios": return "Análise & Relatórios";
      case "configuracoes": return "Configurações da Loja";
      default: return "Painel Administrativo";
    }
  };

  const getPageSubtitle = () => {
    switch (activeTab) {
      case "dashboard": return "Visão geral das vendas e status dos pedidos recentes.";
      case "produtos": return "Gerencie os itens disponíveis, estoque e personalizações.";
      case "pedidos": return "Monitore fluxos de produção, pagamentos e envios.";
      case "clientes": return "Fidelidade e histórico de compras dos seus compradores.";
      case "promocoes": return "Crie descontos para engajar e reverter carrinhos vazios.";
      case "relatorios": return "Métricas e estatísticas consolidadas de desempenho.";
      case "configuracoes": return "Ajuste CNPJ, prazos de confecção e layouts de cor.";
      default: return "Bem-vindo de volta, Administrador.";
    }
  };

  // Build the formatted string
  useEffect(() => {
    // Standard PT-BR date representation for May 23, 2026
    const ptBrDate = "Sábado, 23 de Maio de 2026";
    const ptBrTime = "11:28"; // Static anchor
    setTime(`${ptBrDate} - ${ptBrTime}`);
  }, []);

  const mockNotifications = [
    { id: 1, text: "Novo pedido de Beatriz Santos (#ORD-2045) recebido!", time: "Há 2 min", type: "order" },
    { id: 2, text: "Estoque crítico: Copo Térmico Inox possui apenas 23 unidades.", time: "Há 1h", type: "warning" },
    { id: 3, text: "Pedido #ORD-2044 enviado para correios.", time: "Há 4h", type: "info" }
  ];

  return (
    <header 
      id="app-header"
      className="h-[84px] bg-slate-900 border-b border-slate-850 flex items-center justify-between px-6 lg:px-8 shrink-0 relative"
    >
      {/* Left Part: Mobile burger & Title info */}
      <div className="flex items-center gap-4">
        {/* Burger Button for Mobile */}
        <button
          id="sidebar-toggle-mobile"
          onClick={() => setSidebarOpen(true)}
          className="p-2 border border-slate-800 rounded-xl bg-slate-950/60 text-slate-400 hover:text-slate-200 lg:hidden hover:shadow-xs transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dynamic Headers */}
        <div className="hidden sm:block">
          <h2 className="font-display font-bold text-xl lg:text-2xl text-slate-100 tracking-tight leading-dense">
            {getPageTitle()}
          </h2>
          <p className="text-slate-400 text-xs mt-0.5 font-medium leading-none">
            {getPageSubtitle()}
          </p>
        </div>
      </div>

      {/* Right Part: Search input, notifications dropdown, and Date Pill */}
      <div className="flex items-center gap-4">
        {/* Dynamic Search Pill */}
        <div className="relative max-w-xs hidden md:block">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Buscar em todo painel..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-56 lg:w-64 pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/25 focus:border-slate-700 transition-all placeholder:text-slate-500 font-sans"
          />
        </div>

        {/* Date Ticker Indicator */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-950/60 border border-slate-850 px-3.5 py-1.5 rounded-full font-sans text-xs text-slate-400 font-medium">
          <CalIcon className="w-3.5 h-3.5 text-slate-500" />
          <span>{time}</span>
        </div>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            id="notification-bell-button"
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="p-2.5 border border-slate-800 rounded-xl bg-slate-950/40 hover:bg-slate-850 hover:text-slate-100 text-slate-400 hover:shadow-xs transition-colors relative"
          >
            <Bell className="w-5 h-5 pointer-events-none" />
            <span 
              className="absolute top-1 right-1 w-2 h-2 rounded-full ring-2 ring-slate-900"
              style={{ backgroundColor: "#818cf8" }}
            />
          </button>

          {/* Notifications List Card */}
          {notificationOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setNotificationOpen(false)} 
              />
              <div 
                id="notifications-card"
                className="absolute right-0 mt-3.5 w-80 glass-card bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-4 font-sans animate-in fade-in slide-in-from-top-3 duration-200"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h4 className="font-semibold text-slate-200 font-display text-sm">Notificações</h4>
                  <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">Atual</span>
                </div>
                <div className="mt-2 divide-y divide-slate-800 max-h-72 overflow-y-auto">
                  {mockNotifications.map((notif) => (
                    <div key={notif.id} className="py-2.5 flex gap-2.5 items-start text-xs text-slate-400 hover:bg-white/5 p-1.5 rounded-lg transition-colors">
                      <div className="mt-0.5 shrink-0">
                        {notif.type === "order" ? (
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        ) : notif.type === "warning" ? (
                          <span className="w-2 h-2 rounded-full bg-rose-500 block" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-300 leading-normal">{notif.text}</p>
                        <span className="text-[10px] text-slate-500 block mt-0.5">{notif.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-2.5 pb-1 border-t border-slate-800 justify-center flex">
                  <button 
                    onClick={() => setNotificationOpen(false)}
                    className="text-slate-400 hover:text-slate-200 text-[11px] font-semibold tracking-wide hover:underline"
                  >
                    Fechar painel
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Admin Profile Details */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center font-display font-bold text-white shadow-md select-none bg-gradient-to-br from-indigo-500 to-purple-600">
            AD
          </div>
          <div className="flex flex-col text-left hidden sm:flex">
            <span className="font-semibold text-sm text-slate-200 leading-none">Administrador</span>
            <span className="text-[11px] text-slate-500 mt-1">ID Personalizados</span>
          </div>
        </div>
      </div>
    </header>
  );
}
