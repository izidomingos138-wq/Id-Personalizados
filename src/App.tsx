/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  ChevronRight, 
  Coins, 
  Phone, 
  MapPin, 
  Mail, 
  Info, 
  Save, 
  ShoppingBag, 
  Check, 
  X, 
  Eye, 
  Ticket, 
  PlusCircle, 
  BadgePercent,
  TrendingDown,
  Gift,
  Sparkles,
  HelpCircle
} from "lucide-react";

import { 
  INITIAL_PRODUCTS, 
  INITIAL_ORDERS, 
  INITIAL_CUSTOMERS, 
  INITIAL_PROMOTIONS, 
  INITIAL_STORE_CONFIG, 
  THEME_PRESETS 
} from "./mockData";
import { Product, Order, Customer, Promotion, StoreConfig, StoreTheme } from "./types";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import MercadoPagoSimulator from "./components/MercadoPagoSimulator";
import StorefrontView from "./components/StorefrontView";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Map colors corresponding to each order status safely for Recharts
const STATUS_COLORS: Record<string, string> = {
  "Pago": "#10b981",       // emerald-500
  "Produção": "#f59e0b",   // amber-500
  "Enviado": "#3b82f6",    // blue-500
  "Entregue": "#06b6d4",   // cyan-500
  "Cancelado": "#64748b",  // slate-500
};

// Custom tooltip component for professional interactive chart highlights
const CustomStatusTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-950/95 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-xs font-bold text-slate-100 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full block animate-pulse" style={{ backgroundColor: STATUS_COLORS[data.name] || "#a78bfa" }} />
          {data.name}
        </p>
        <p className="text-[11px] font-mono text-indigo-305 text-indigo-300 font-bold mt-1.5">
          {data.value} {data.value === 1 ? 'pedido' : 'pedidos'}
        </p>
      </div>
    );
  }
  return null;
};

// Helper for formatting currency in PT-BR style securely
const formatBRL = (val: number) => {
  return "R$ " + val.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function App() {
  // Page and UI state
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [globalSearch, setGlobalSearch] = useState<string>("");

  // Live entity states
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [promotions, setPromotions] = useState<Promotion[]>(INITIAL_PROMOTIONS);
  const [storeConfig, setStoreConfig] = useState<StoreConfig>(INITIAL_STORE_CONFIG);
  const [currentTheme, setCurrentTheme] = useState<StoreTheme>(THEME_PRESETS[0]);

  // Selected entities for actions
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Modals visibility toggles
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  // Form states
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    description: "",
    category: "Cadernos",
    price: 0,
    stock: 50,
    salesCount: 0,
    imageColor: "from-indigo-500 to-purple-600",
    customizableFields: ["Nome na Capa"]
  });

  const [newOrder, setNewOrder] = useState({
    customerName: "",
    customerEmail: "",
    productId: INITIAL_PRODUCTS[0]?.id || "",
    quantity: 1,
    customNote: ""
  });

  const [newPromo, setNewPromo] = useState<Partial<Promotion>>({
    code: "",
    discountType: "percentage",
    value: 10,
    minPurchase: 50,
    maxUses: 100,
    expiryDate: "31/12/2026"
  });

  // Filter handlers
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>("Todos");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("Todos");

  // Custom Field Form Input helper
  const [customFieldInput, setCustomFieldInput] = useState("");

  // Logout message simulation
  const handleLogout = () => {
    alert("Sessão finalizada com sucesso! Esta é uma demonstração administrativa para o ID Personalizados.");
  };

  // Live Analytics Calculations based on current state
  const metrics = useMemo(() => {
    // Basic dynamic total computation
    const totalOrderValue = orders
      .filter(o => o.status !== "Cancelado")
      .reduce((acc, o) => acc + o.totalPrice, 0);

    // Initial Flutter mockup Vendas is R$ 12.450 + dynamic added values
    const staticBaseline = 12450.00;
    const computedRevenue = staticBaseline + (totalOrderValue - INITIAL_ORDERS.reduce((acc, o) => acc + o.totalPrice, 0));

    // Calculate count values
    const pendingOrders = orders.filter(o => o.status === "Pago" || o.status === "Produção").length;
    const completeOrders = orders.filter(o => o.status === "Enviado" || o.status === "Entregue").length;

    return {
      revenue: Math.max(computedRevenue, staticBaseline),
      ordersCount: orders.length,
      customersCount: customers.length,
      productsCount: products.length,
      pendingOrders,
      completeOrders
    };
  }, [products, orders, customers]);

  // Compute active order status breakdown for Recharts donut chart
  const orderStatusDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      "Pago": 0,
      "Produção": 0,
      "Enviado": 0,
      "Entregue": 0,
      "Cancelado": 0,
    };
    orders.forEach(o => {
      if (counts[o.status] !== undefined) {
        counts[o.status]++;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [orders]);

  // Handle adding products
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      alert("Por favor, preencha o nome e o preço.");
      return;
    }

    const randomID = "P" + Math.floor(100 + Math.random() * 900);
    const backgroundGradients = [
      "from-violet-500 to-indigo-600",
      "from-blue-500 to-cyan-500",
      "from-pink-500 to-rose-500",
      "from-emerald-500 to-teal-600",
      "from-amber-500 to-orange-600"
    ];
    const pickedGradient = backgroundGradients[Math.floor(Math.random() * backgroundGradients.length)];

    const created: Product = {
      id: randomID,
      name: newProduct.name,
      description: newProduct.description || "Sem descrição disponível.",
      category: newProduct.category as any,
      price: Number(newProduct.price),
      stock: Number(newProduct.stock || 0),
      salesCount: 0,
      imageColor: pickedGradient,
      customizableFields: newProduct.customizableFields && newProduct.customizableFields.length > 0
        ? newProduct.customizableFields
        : ["Capa Personalizada"]
    };

    setProducts([created, ...products]);
    setIsProductModalOpen(false);

    // reset fields
    setNewProduct({
      name: "",
      description: "",
      category: "Cadernos",
      price: 0,
      stock: 50,
      salesCount: 0,
      imageColor: "from-indigo-500 to-purple-600",
      customizableFields: ["Nome na Capa"]
    });
    setCustomFieldInput("");
  };

  // Adjust stock
  const adjustStock = (productId: string, amount: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const nextStock = Math.max(0, p.stock + amount);
        return { ...p, stock: nextStock };
      }
      return p;
    }));
  };

  // Delete product
  const deleteProduct = (pId: string) => {
    if (confirm("Tem certeza que deseja remover este produto do catálogo?")) {
      setProducts(prev => prev.filter(p => p.id !== pId));
    }
  };

  // Handle simulating simulated client orders
  const handleSimulateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.customerName || !newOrder.customerEmail) {
      alert("Identifique o comprador com nome e e-mail.");
      return;
    }

    const matchedProduct = products.find(p => p.id === newOrder.productId);
    if (!matchedProduct) return;

    const orderPrice = matchedProduct.price * newOrder.quantity;
    const randomOrderID = "ORD-" + Math.floor(2050 + Math.random() * 50);

    const generatedOrder: Order = {
      id: randomOrderID,
      customerName: newOrder.customerName,
      customerEmail: newOrder.customerEmail,
      productName: matchedProduct.name,
      productId: matchedProduct.id,
      quantity: newOrder.quantity,
      totalPrice: orderPrice,
      status: "Pago",
      date: new Date().toLocaleDateString("pt-BR"),
      customNote: newOrder.customNote || "Nenhuma gravação solicitada."
    };

    // Update orders list
    setOrders([generatedOrder, ...orders]);

    // Update salesCount for product
    setProducts(prev => prev.map(p => {
      if (p.id === matchedProduct.id) {
        return { 
          ...p, 
          stock: Math.max(0, p.stock - newOrder.quantity),
          salesCount: p.salesCount + newOrder.quantity
        };
      }
      return p;
    }));

    // Register customer if not already exists
    const hasCustomer = customers.some(c => c.email.toLowerCase() === newOrder.customerEmail.toLowerCase());
    if (!hasCustomer) {
      const generatedCustomer: Customer = {
        id: "CLI-" + Math.floor(490 + Math.random() * 100),
        name: newOrder.customerName,
        email: newOrder.customerEmail,
        phone: "(11) 9" + Math.floor(70000000 + Math.random() * 20000000),
        ordersCount: 1,
        totalSpent: orderPrice,
        joinDate: new Date().toLocaleDateString("pt-BR"),
        location: "São Paulo - SP"
      };
      setCustomers([...customers, generatedCustomer]);
    } else {
      setCustomers(prev => prev.map(c => {
        if (c.email.toLowerCase() === newOrder.customerEmail.toLowerCase()) {
          return {
            ...c,
            ordersCount: c.ordersCount + 1,
            totalSpent: c.totalSpent + orderPrice
          };
        }
        return c;
      }));
    }

    setIsOrderModalOpen(false);
    setNewOrder({
      customerName: "",
      customerEmail: "",
      productId: products[0]?.id || "",
      quantity: 1,
      customNote: ""
    });
  };

  // Change status of existing orders
  const changeOrderStatus = (orderId: string, nextStatus: Order["status"]) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, status: nextStatus };
      }
      return o;
    }));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: nextStatus } : null);
    }
  };

  // Create customized coupons/promotions
  const handleAddPromotion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromo.code || !newPromo.value) {
      alert("Preencha o código do cupom e o valor de desconto.");
      return;
    }

    const generatedPromo: Promotion = {
      id: "PRM-" + Math.floor(105 + Math.random() * 100),
      code: newPromo.code.toUpperCase().replace(/\s+/g, ""),
      discountType: newPromo.discountType as any,
      value: Number(newPromo.value),
      minPurchase: Number(newPromo.minPurchase || 0),
      usageCount: 0,
      maxUses: Number(newPromo.maxUses || 100),
      status: "Ativo",
      expiryDate: newPromo.expiryDate || "31/12/2026"
    };

    setPromotions([generatedPromo, ...promotions]);
    setIsPromoModalOpen(false);
    setNewPromo({
      code: "",
      discountType: "percentage",
      value: 10,
      minPurchase: 50,
      maxUses: 100,
      expiryDate: "31/12/2026"
    });
  };

  // Toggle promo status
  const togglePromoStatus = (promoId: string) => {
    setPromotions(prev => prev.map(p => {
      if (p.id === promoId) {
        return { ...p, status: p.status === "Ativo" ? "Inativo" : "Ativo" };
      }
      return p;
    }));
  };

  // Search filtering logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(globalSearch.toLowerCase()) || 
                          p.description.toLowerCase().includes(globalSearch.toLowerCase());
      const matchCategory = productCategoryFilter === "Todos" || p.category === productCategoryFilter;
      return matchSearch && matchCategory;
    });
  }, [products, globalSearch, productCategoryFilter]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSearch = o.customerName.toLowerCase().includes(globalSearch.toLowerCase()) || 
                          o.productName.toLowerCase().includes(globalSearch.toLowerCase()) ||
                          o.id.toLowerCase().includes(globalSearch.toLowerCase());
      const matchStatus = orderStatusFilter === "Todos" || o.status === orderStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, globalSearch, orderStatusFilter]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      return c.name.toLowerCase().includes(globalSearch.toLowerCase()) || 
             c.email.toLowerCase().includes(globalSearch.toLowerCase()) || 
             c.location.toLowerCase().includes(globalSearch.toLowerCase());
    });
  }, [customers, globalSearch]);

  const filteredPromotions = useMemo(() => {
    return promotions.filter(p => {
      return p.code.toLowerCase().includes(globalSearch.toLowerCase());
    });
  }, [promotions, globalSearch]);


  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden font-sans relative antialiased">
      
      {/* Absolute Decorative Glows */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] pointer-events-none -z-10"></div>
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-purple-600/5 blur-[120px] pointer-events-none -z-10"></div>

      {/* LEFT DRAWER/SIDEBAR */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        currentTheme={currentTheme}
        onLogout={handleLogout}
      />

      {/* MAIN CONTAINER */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen max-w-full overflow-hidden">
        
        {/* UPPER HEADER */}
        <Header 
          activeTab={activeTab} 
          setSidebarOpen={setSidebarOpen} 
          currentTheme={currentTheme}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
        />

        {/* INNER CONTENT GRID */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 max-h-[calc(100vh-84px)]">
          
          {/* TAB 1: DASHBOARD VIEW */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Resumo Geral Header Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-medium text-slate-500 tracking-wider text-xs uppercase">Métricas de Produção</h3>
                  <h2 className="font-display font-bold text-3xl text-white tracking-tight mt-1">Resumo Geral</h2>
                </div>
                <div className="flex gap-2.5 flex-wrap">
                  <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-[#818cf8] border border-indigo-500/20 rounded-full text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 block animate-pulse"></span>
                    Mercado Pago PIX: Sandbox
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-405 bg-emerald-400 block animate-pulse"></span>
                    Conexão Ativa
                  </div>
                </div>
              </div>

              {/* Grid cards for general summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* CARD 1: VENDAS */}
                <div className="glass-card glass-card-hover p-6 rounded-3xl relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 accent-gradient opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest block">Receita Total</span>
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/15 flex items-center justify-center text-[#818cf8]">
                      <Coins className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-display font-bold tracking-tight text-white">
                    {formatBRL(metrics.revenue)}
                  </h3>
                  <div className="mt-3 flex items-center text-emerald-400 text-xs font-semibold leading-none">
                    <TrendingUp className="w-3.5 h-3.5 mr-1" />
                    <span>+12.5% vs mês anterior</span>
                  </div>
                </div>

                {/* CARD 2: PEDIDOS */}
                <div className="glass-card glass-card-hover p-6 rounded-3xl relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500 opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity"></div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest block">Pedidos Totais</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-display font-bold tracking-tight text-white">
                    {metrics.ordersCount}
                  </h3>
                  <div className="mt-3 flex items-center text-slate-400 text-xs font-medium leading-none italic">
                    <span>Aguardando produção: {metrics.pendingOrders}</span>
                  </div>
                </div>

                {/* CARD 3: CLIENTES */}
                <div className="glass-card glass-card-hover p-6 rounded-3xl relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-pink-500 opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity"></div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest block">Clientes Ativos</span>
                    <div className="w-8 h-8 rounded-xl bg-pink-500/15 flex items-center justify-center text-pink-400">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-display font-bold tracking-tight text-white">
                    {metrics.customersCount}
                  </h3>
                  <div className="mt-3 flex items-center text-indigo-400 text-xs font-semibold leading-none">
                    <span>Retenção de 84% de recompra</span>
                  </div>
                </div>

                {/* CARD 4: PRODUTOS */}
                <div className="glass-card glass-card-hover p-6 rounded-3xl relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500 opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity"></div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest block">Itens Ativos</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                      <Gift className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-display font-bold tracking-tight text-white">
                    {metrics.productsCount}
                  </h3>
                  <div className="mt-3 flex items-center text-indigo-400 text-xs font-semibold leading-none">
                    <span>5 categorias registradas</span>
                  </div>
                </div>

              </div>

              {/* Recent Orders List - HTML Conversion Card */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="font-display font-bold text-xl text-white">Pedidos Recentes</h3>
                    <p className="text-slate-400 text-xs mt-1">Lista consolidada de pedidos e solicitações customizadas.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab("pedidos")}
                    className="text-indigo-400 hover:text-[#818cf8] text-xs font-bold uppercase tracking-widest hover:underline transition-all"
                  >
                    Ver todos ({orders.length})
                  </button>
                </div>

                <div className="glass-card rounded-3xl overflow-hidden shadow-2xl">
                  {/* Styled Header Table bar */}
                  <div className="hidden md:grid grid-cols-4 gap-4 px-8 py-5 bg-slate-900/60 font-display text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-white/5">
                    <div>Cliente</div>
                    <div>Produto Solicitado</div>
                    <div>Status de Produção</div>
                    <div className="text-right">Ações / Valor</div>
                  </div>

                  {/* Orders Row Items */}
                  <div className="divide-y divide-white/5 font-sans">
                    {orders.slice(0, 4).map((order) => {
                      // Initials helper
                      const initials = order.customerName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                      
                      // Status colors helper
                      let statusBadgeStyle = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
                      if (order.status === "Pago") statusBadgeStyle = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                      if (order.status === "Enviado") statusBadgeStyle = "bg-blue-500/10 text-blue-400 border border-blue-500/20";
                      if (order.status === "Entregue") statusBadgeStyle = "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
                      if (order.status === "Cancelado") statusBadgeStyle = "bg-slate-800 text-slate-400 border border-slate-700/50";

                      return (
                        <div 
                          key={order.id} 
                          className="flex flex-col md:grid md:grid-cols-4 gap-4 px-6 md:px-8 py-5 hover:bg-white/5 transition-colors items-center"
                        >
                          {/* Col 1: Customer */}
                          <div className="flex items-center gap-3 w-full">
                            <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-300 font-display flex items-center justify-center font-bold text-xs shadow-inner">
                              {initials}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-200">{order.customerName}</p>
                              <p className="text-[10px] text-slate-500">{order.customerEmail}</p>
                            </div>
                          </div>

                          {/* Col 2: Product info */}
                          <div className="w-full text-slate-350 text-slate-400">
                            <p className="font-medium text-slate-300 md:truncate">{order.productName}</p>
                            <span className="text-[10px] text-slate-500 font-mono">{order.id} • Qtd: {order.quantity}</span>
                          </div>

                          {/* Col 3: Status widget */}
                          <div className="w-full flex md:block mt-2 md:mt-0">
                            <span className={`status-badge ${statusBadgeStyle} font-semibold px-3 py-1 rounded-full text-xs`}>
                              {order.status}
                            </span>
                          </div>

                          {/* Col 4: Valor & quick interactive trigger */}
                          <div className="w-full text-right flex items-center justify-between md:justify-end gap-3 mt-4 md:mt-0">
                            <span className="md:hidden text-xs text-slate-500">Valor total:</span>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-indigo-300 font-bold text-sm">
                                {formatBRL(order.totalPrice)}
                              </span>
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="p-1.5 rounded-lg bg-slate-900 border border-white/5 hover:bg-slate-800 text-indigo-400 hover:text-indigo-205 py-2 px-3 hover:text-indigo-300 text-xs flex items-center gap-1.5 transition-all"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Detalhes</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Customizable Tips Info block */}
              <div className="glass-card p-6 rounded-3xl bg-slate-900/40 relative border border-white/5">
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-indigo-500/10 text-[#818cf8] rounded-2xl shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-white text-base">Controle de Confecção Customizada</h3>
                    <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
                      Lembre-se que cada pedido em status <span className="text-amber-400">Produção</span> deve seguir os parâmetros de gravação estipulados no detalhamento do cliente. O prazo acordado nas configurações gerais da loja atualmente é de <span className="font-semibold text-slate-200">{storeConfig.leadTimeDays} dias úteis</span>.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 8: CLIENT VITRINE (LOJA DO CLIENTE) */}
          {activeTab === "vitrine" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="font-display font-bold text-2xl text-white">Vitrine do Cliente (Simulação)</h2>
                <p className="text-slate-400 text-sm">Navegue, escolha e compre como um cliente real para testar o fluxo de Webhooks!</p>
              </div>
              <StorefrontView 
                products={products}
                promotions={promotions}
                storeConfig={storeConfig}
                onAddOrder={(ord) => setOrders(prev => [ord, ...prev])}
                onAddCustomer={(cust) => setCustomers(prev => {
                  const exists = prev.find(c => c.email.toLowerCase() === cust.email.toLowerCase());
                  if (exists) {
                    return prev.map(c => {
                      if (c.email.toLowerCase() === cust.email.toLowerCase()) {
                        return { 
                          ...c, 
                          ordersCount: c.ordersCount + 1, 
                          totalSpent: c.totalSpent + cust.totalSpent 
                        };
                      }
                      return c;
                    });
                  }
                  return [...prev, cust];
                })}
              />
            </div>
          )}

          {/* TAB 2: PRODUTOS VIEW */}
          {activeTab === "produtos" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Filter and action header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display font-bold text-2xl text-white">Catálogo de Produtos</h2>
                  <p className="text-slate-400 text-sm">Controle de estoque, preços e tipos de personalização admitidos.</p>
                </div>
                
                <button
                  onClick={() => setIsProductModalOpen(true)}
                  className="accent-gradient font-bold text-xs uppercase tracking-wider text-white py-3 px-5 rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:opacity-95 transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  Novo Produto
                </button>
              </div>

              {/* Horizontal Category selectors */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {["Todos", "Cadernos", "Apostilas", "Canecas", "Planners", "Outros"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setProductCategoryFilter(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                      productCategoryFilter === cat 
                        ? "bg-indigo-600/20 text-[#818cf8] border-indigo-500/40" 
                        : "bg-slate-900/60 text-slate-400 border-white/5 hover:border-white/10 hover:text-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Grid lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((p) => (
                  <div 
                    key={p.id} 
                    className="glass-card rounded-3xl overflow-hidden flex flex-col justify-between group relative shadow-lg"
                  >
                    {/* Top graphic indicator with category badge */}
                    <div className={`h-40 bg-gradient-to-br ${p.imageColor} relative p-6 flex flex-col justify-between`}>
                      <span className="bg-slate-900/80 backdrop-blur-xs text-[10px] text-slate-100 uppercase tracking-widest font-extrabold px-3 py-1 rounded-full self-start">
                        {p.category}
                      </span>
                      
                      <div className="absolute right-4 bottom-4 bg-slate-950/80 backdrop-blur-md border border-white/10 text-slate-100 font-mono font-bold py-1 px-3 rounded-full text-xs">
                        Código: {p.id}
                      </div>
                    </div>

                    {/* Meta info area */}
                    <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-display font-bold text-lg text-white group-hover:text-indigo-400 transition-colors">
                            {p.name}
                          </h4>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                          {p.description}
                        </p>
                      </div>

                      {/* Customizable Field tags list */}
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">Campos de Confecção:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {p.customizableFields.map((field, i) => (
                            <span 
                              key={i} 
                              className="text-[10px] bg-indigo-500/5 text-indigo-300 border border-indigo-500/10 px-2 py-0.5 rounded-lg"
                            >
                              • {field}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Interactive inventory control */}
                      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 block">Estoque Disponível</span>
                          <div className="flex items-center gap-2 mt-1">
                            <button 
                              onClick={() => adjustStock(p.id, -5)}
                              className="w-6 h-6 rounded-md bg-slate-900 border border-white/5 flex items-center justify-center font-bold text-xs text-slate-400 hover:bg-slate-800 transition-all"
                            >
                              -
                            </button>
                            <span className={`font-mono text-xs font-bold ${p.stock < 15 ? 'text-rose-450 text-rose-450 font-bold text-rose-400' : 'text-slate-200'}`}>
                              {p.stock} un
                            </span>
                            <button 
                              onClick={() => adjustStock(p.id, 5)}
                              className="w-6 h-6 rounded-md bg-slate-900 border border-white/5 flex items-center justify-center font-bold text-xs text-slate-400 hover:bg-slate-800 transition-all"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-500 block">Preço de Venda</span>
                          <span className="font-mono text-base font-bold text-[#818cf8] mt-0.5 block">
                            {formatBRL(p.price)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Lower delete / actions stripe */}
                    <div className="bg-slate-900/40 px-6 py-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-slate-500 text-[10px] font-mono">
                        Vendido {p.salesCount} vezes
                      </span>
                      
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer"
                        title="Deletar produto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                ))}

                {filteredProducts.length === 0 && (
                  <div className="col-span-full py-12 text-center glass-card rounded-2xl flex flex-col items-center justify-center">
                    <ShoppingBag className="w-12 h-12 text-slate-600 mb-3" />
                    <p className="text-slate-400 text-sm">Nenhum produto correspondente aos filtros foi localizado.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: PEDIDOS VIEW & CONTROLLER */}
          {activeTab === "pedidos" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Header and simulation button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display font-bold text-2xl text-white">Gestão de Pedidos</h2>
                  <p className="text-slate-400 text-sm">Gerenciamento e rastreamento do funil produtivo.</p>
                </div>
                
                <button
                  onClick={() => setIsOrderModalOpen(true)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 text-indigo-400 border border-indigo-500/20 rounded-xl flex items-center justify-center gap-2 font-semibold text-xs ml-auto sm:ml-0 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  Simular Novo Pedido
                </button>
              </div>

              {/* Status workflow filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {["Todos", "Pago", "Produção", "Enviado", "Entregue", "Cancelado"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setOrderStatusFilter(status)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs leading-none font-semibold transition-all ${
                      orderStatusFilter === status
                        ? "bg-[#818cf8] text-white"
                        : "bg-slate-900 border border-white/5 text-slate-450 text-slate-400 hover:border-slate-800"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Orders visual queue tables */}
              <div className="glass-card rounded-3xl overflow-hidden">
                <table className="w-full text-left font-sans text-slate-200">
                  <thead className="bg-slate-900/60 border-b border-white/5 font-display text-xs text-slate-450 text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">ID/Data</th>
                      <th className="px-6 py-4">Cliente</th>
                      <th className="px-6 py-4">Ítem</th>
                      <th className="px-6 py-4">Fase Atual</th>
                      <th className="px-6 py-4 text-right">Valor</th>
                      <th className="px-6 py-4 text-center">Controles</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-white/5 transition-colors text-xs">
                        {/* ID Date col */}
                        <td className="px-6 py-4 font-mono">
                          <span className="font-bold text-white block">{order.id}</span>
                          <span className="text-[10px] text-slate-500">{order.date}</span>
                        </td>

                        {/* Customer col */}
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-200">{order.customerName}</p>
                          <p className="text-[10px] text-slate-400">{order.customerEmail}</p>
                        </td>

                        {/* Product col */}
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-350 text-slate-300">{order.productName}</p>
                          <p className="text-[10px] text-slate-500 font-medium">Quantidade: {order.quantity}</p>
                        </td>

                        {/* Fase atual status col */}
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => changeOrderStatus(order.id, e.target.value as any)}
                            className="bg-slate-950 text-slate-200 border border-slate-800 rounded-lg py-1 px-2.5 text-[11px] font-semibold focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                          >
                            <option value="Pago">Pago</option>
                            <option value="Produção">Produção</option>
                            <option value="Enviado">Enviado</option>
                            <option value="Entregue">Entregue</option>
                            <option value="Cancelado">Cancelado</option>
                          </select>
                        </td>

                        {/* Valor Col */}
                        <td className="px-6 py-4 text-right font-mono font-bold text-indigo-300">
                          {formatBRL(order.totalPrice)}
                        </td>

                        {/* Controles Col */}
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-600 transition-all font-semibold py-1 px-3 rounded-lg mr-2"
                          >
                            Analisar
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-500 text-sm">
                          Nenhum pedido localizado neste status de funil.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 4: CLIENTES DIRECTORY */}
          {activeTab === "clientes" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              <div>
                <h2 className="font-display font-bold text-2xl text-white">Clientes & Faturamento</h2>
                <p className="text-slate-400 text-sm">Acompanhamento de engajamento por comprador e distribuição geográfica.</p>
              </div>

              {/* CRM Card lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCustomers.map((c) => {
                  const initials = c.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                  
                  return (
                    <div 
                      key={c.id}
                      className="glass-card p-6 rounded-3xl relative flex flex-col justify-between"
                    >
                      {/* Top Header details */}
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-505 bg-indigo-500/10 text-[#818cf8] font-display font-extrabold text-sm flex items-center justify-center shadow-lg border border-indigo-500/15">
                          {initials}
                        </div>
                        <div>
                          <h4 className="font-display font-semibold text-white tracking-tight">{c.name}</h4>
                          <span className="text-[10px] text-slate-505 font-mono text-slate-500">{c.id} • Desde: {c.joinDate}</span>
                        </div>
                      </div>

                      {/* Contact metadata */}
                      <div className="mt-4 pt-4 border-t border-white/5 space-y-2 text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{c.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{c.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{c.location}</span>
                        </div>
                      </div>

                      {/* Expenditure indicator metrics */}
                      <div className="mt-4 pt-4 border-t border-white/5 bg-slate-900/30 p-3 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-505 text-slate-500 uppercase block font-bold leading-none">Total Compras</span>
                          <span className="font-mono text-white text-xs font-bold block mt-1">{c.ordersCount} pedidos</span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-505 text-slate-505 text-slate-500 uppercase block font-bold leading-none">Total Gasto</span>
                          <span className="font-mono text-[#818cf8] font-bold text-xs block mt-1">
                            {formatBRL(c.totalSpent)}
                          </span>
                        </div>
                      </div>

                    </div>
                  );
                })}

                {filteredCustomers.length === 0 && (
                  <div className="col-span-full py-12 text-center text-slate-500 text-sm">
                    Nenhum cliente atende a pesquisa global.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 5: PROMOÇÕES VIEW */}
          {activeTab === "promocoes" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Promo section head */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display font-bold text-2xl text-white">Promoções & Descontos</h2>
                  <p className="text-slate-400 text-sm">Gerenciamento de cupons de marketing para alavancar faturamento.</p>
                </div>
                
                <button
                  onClick={() => setIsPromoModalOpen(true)}
                  className="accent-gradient text-white text-xs uppercase tracking-wider font-semibold py-3 px-5 rounded-2xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Criar Novo Cupom
                </button>
              </div>

              {/* Promo grids displaying active items */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPromotions.map((p) => {
                  
                  return (
                    <div 
                      key={p.id}
                      className="glass-card rounded-2xl p-6 flex flex-col justify-between border border-white/5 relative overflow-hidden"
                    >
                      {/* Sticker background cut outs */}
                      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/5 rounded-full border border-indigo-500/10 flex items-center justify-center font-display text-2xl tracking-widest text-indigo-500 font-extrabold rotate-12 select-none pointer-events-none">
                        VOUCH
                      </div>

                      {/* Top Code row */}
                      <div className="flex items-center justify-between">
                        <div className="px-3.5 py-1.5 rounded-xl bg-indigo-500/10 text-[#818cf8] border border-indigo-500/20 font-mono font-bold text-base tracking-wide uppercase">
                          {p.code}
                        </div>
                        <button
                          onClick={() => togglePromoStatus(p.id)}
                          className={`status-badge text-[10px] uppercase font-extrabold tracking-widest leading-none pointer-events-auto cursor-pointer ${
                            p.status === "Ativo"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {p.status}
                        </button>
                      </div>

                      {/* Promo details */}
                      <div className="my-6 space-y-2.5 text-xs text-slate-305 text-slate-400">
                        <div className="flex justify-between">
                          <span>Desconto aplicado:</span>
                          <span className="font-bold text-white">
                            {p.discountType === "percentage" ? `${p.value}% OFF` : `R$ ${p.value.toFixed(2).replace('.', ',')} OFF`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Mínimo de Compra:</span>
                          <span className="font-mono text-slate-300">R$ {p.minPurchase.toFixed(2).replace('.', ',')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Validade:</span>
                          <span className="font-mono text-slate-300">{p.expiryDate}</span>
                        </div>
                      </div>

                      {/* Limit analysis loading bars representing percentage used */}
                      <div className="pt-4 border-t border-white/5 text-xs text-slate-450 text-slate-400">
                        <div className="flex justify-between mb-1.5 font-medium">
                          <span>Fidelidade de Utilização</span>
                          <span>{p.usageCount} / {p.maxUses} vezes</span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-indigo-505 bg-indigo-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (p.usageCount / p.maxUses) * 100)}%` }}
                          />
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 6: RELATÓRIOS & ANALYTICS SECTION */}
          {activeTab === "relatorios" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              <div>
                <h2 className="font-display font-bold text-2xl text-white">Análise de Desempenho</h2>
                <p className="text-slate-400 text-sm">Acompanhamento analítico de receitas e faturamento em tempo real.</p>
              </div>

              {/* Simulated SVGs Charts for visual brilliance */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Analytical Card 1: Revenue progress chart */}
                <div className="glass-card p-6 rounded-3xl lg:col-span-2">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h4 className="font-display font-semibold text-white">Faturamento Histórico (Simulação Semanal)</h4>
                      <p className="text-xs text-slate-500">Fluxo semanal consolidado em milhares de Reais (R$).</p>
                    </div>
                    <span className="text-xs bg-indigo-500/10 text-indigo-400 font-mono font-bold px-2 py-0.5 rounded-full">2026</span>
                  </div>

                  {/* SVG Line / Area Graph */}
                  <div className="w-full h-64 bg-slate-950/40 rounded-2xl relative p-4 flex items-end justify-between border border-white/5">
                    {/* Background horizontal guideline loops */}
                    <div className="absolute inset-x-0 top-1/4 border-b border-white/5"></div>
                    <div className="absolute inset-x-0 top-2/4 border-b border-white/5"></div>
                    <div className="absolute inset-x-0 top-3/4 border-b border-white/5"></div>

                    {/* Bars or coordinates */}
                    {[
                      { week: "Semana 1", rev: 1800, h: "35%" },
                      { week: "Semana 2", rev: 2900, h: "52%" },
                      { week: "Semana 3", rev: 3100, h: "58%" },
                      { week: "Semana 4", rev: 4200, h: "82%" },
                      { week: "Semana 5 (Atual)", rev: metrics.revenue / 2.5, h: "94%" }
                    ].map((step, i) => (
                      <div key={i} className="flex flex-col items-center flex-1 z-10 w-full group">
                        <div className="text-[10px] text-indigo-400 font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                          R$ {step.rev.toFixed(0)}
                        </div>
                        <div 
                          className="w-8 md:w-12 bg-gradient-to-t from-indigo-600 to-[#818cf8] rounded-t-xl group-hover:opacity-90 transition-all duration-1000 shadow-lg shadow-indigo-600/10 select-none pb-0 cursor-pointer"
                          style={{ height: step.h }}
                        />
                        <span className="text-[10px] text-slate-500 font-mono mt-3 uppercase">{step.week}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Analytical Card 2: Sales distribution per category */}
                <div className="glass-card p-6 rounded-3xl">
                  <h4 className="font-display font-semibold text-white mb-6">Frequência Por Categoria</h4>
                  
                  <div className="space-y-5">
                    {[
                      { category: "Cadernos", percent: "38%", count: 112 },
                      { category: "Apostilas", percent: "25%", count: 70 },
                      { category: "Canecas", percent: "18%", count: 148 },
                      { category: "Planners", percent: "14%", count: 165 },
                      { category: "Outros", percent: "5%", count: 55 }
                    ].map((row, i) => (
                      <div key={i} className="text-xs">
                        <div className="flex justify-between text-slate-400 mb-1.5 font-medium">
                          <span className="text-white font-bold">{row.category}</span>
                          <span>{row.percent} ({row.count} vendas)</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full"
                            style={{ width: row.percent }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Analytical Card 3: Donut Chart for Order status distribution (Recharts) */}
              <div className="glass-card p-6 rounded-3xl flex flex-col justify-between">
                <div className="flex border-b border-white/5 pb-4 mb-4 items-center justify-between">
                  <div>
                    <h4 className="font-display font-semibold text-white">Distribuição dos Status de Pedidos</h4>
                    <p className="text-xs text-slate-400 mt-1">Percentual atualizado em tempo real com base no fluxo de vendas.</p>
                  </div>
                  <span className="text-xs bg-indigo-500/10 text-[#818cf8] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase border border-indigo-500/10">
                    Recharts Live
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-2">
                  {/* Donut Chart Canvas Container */}
                  <div className="w-full h-56 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={orderStatusDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={85}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {orderStatusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || "#a78bfa"} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomStatusTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    {/* Inner counter representing total orders */}
                    <div className="absolute flex flex-col items-center justify-center font-sans pointer-events-none select-none">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Total</span>
                      <span className="text-3xl font-bold font-mono text-white leading-none mt-1">{orders.length}</span>
                      <span className="text-[10px] text-slate-400 mt-1 font-medium">Pedidos</span>
                    </div>
                  </div>

                  {/* Customized Status Legend list with percentage bars & interactive layout */}
                  <div className="space-y-4 pr-2">
                    <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-1.5 mb-1">
                      Métricas por Categoria de Status
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                      {orderStatusDistribution.map((entry) => {
                        const pct = orders.length > 0 ? (entry.value / orders.length) * 100 : 0;
                        const color = STATUS_COLORS[entry.name] || "#cbd5e1";
                        return (
                          <div key={entry.name} className="text-xs space-y-1.5 p-3 bg-slate-950/40 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                            <div className="flex justify-between items-center text-slate-450 font-medium">
                              <div className="flex items-center gap-1.5 font-bold text-slate-200">
                                <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: color }} />
                                <span>{entry.name}</span>
                              </div>
                              <span className="font-mono text-indigo-300 font-bold">{entry.value}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-slate-500">
                              <span>Proporção</span>
                              <span className="font-mono text-slate-400">{pct.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%`, backgroundColor: color }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary KPIs Row grids */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                
                <div className="glass-card p-6 rounded-2xl border border-white/5">
                  <span className="text-xs text-slate-505 text-slate-400 font-bold uppercase tracking-wider block">Ticket Médio por Venda</span>
                  <p className="text-2xl font-bold font-mono text-indigo-300 mt-2">R$ 51,20</p>
                  <span className="text-[10px] text-slate-500 block mt-2 leading-none">Média aritmética calculada das transações</span>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-white/5">
                  <span className="text-xs text-slate-505 text-slate-400 font-bold uppercase tracking-wider block">Eficiência de Envio</span>
                  <p className="text-2xl font-bold font-mono text-emerald-400 mt-2">91%</p>
                  <span className="text-[10px] text-slate-500 block mt-2 leading-none">Status despachado dentro do lead-time ideal</span>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-white/5">
                  <span className="text-xs text-slate-505 text-slate-400 font-bold uppercase tracking-wider block">Meta de Vendas Mensal</span>
                  <p className="text-2xl font-bold font-mono text-[#818cf8] mt-2">83% Atingida</p>
                  <span className="text-[10px] text-slate-500 block mt-2 leading-none">Progresso em relação a R$ 15.000,00</span>
                </div>

              </div>

            </div>
          )}

          {/* TAB 7: CONFIGURAÇÕES & PRESET THEMING SELECTOR */}
          {activeTab === "configuracoes" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              <div>
                <h2 className="font-display font-bold text-2xl text-white">Configurações Gerais</h2>
                <p className="text-slate-400 text-sm">Informaçoes tributárias CNPJ, suporte ao usuário, e painéis de cor visual.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Visual Palette Selector block */}
                <div className="glass-card p-6 rounded-3xl lg:col-span-1 space-y-6">
                  <div>
                    <h3 className="font-display font-semibold text-white">Aparência & Identidade Visual</h3>
                    <p className="text-xs text-slate-500 mt-1">Selecione o esquema de cores para os botões e paineis superiores.</p>
                  </div>

                  <div className="space-y-3">
                    {THEME_PRESETS.map((theme) => {
                      const isSelected = currentTheme.id === theme.id;
                      
                      return (
                        <div
                          key={theme.id}
                          onClick={() => setCurrentTheme(theme)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected 
                              ? "bg-slate-900 border-indigo-500/40 text-white" 
                              : "bg-slate-950/40 border-white/5 hover:border-slate-800 text-slate-400"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Color circle visual preview */}
                            <div className="flex -space-x-1 items-center">
                              <span className="w-4.5 h-4.5 rounded-full accent-gradient border border-white/10 block bg-indigo-500"></span>
                            </div>
                            <span className="text-xs font-semibold leading-none">{theme.name}</span>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Aesthetic preview bar */}
                  <div className="p-4 bg-slate-950/80 border border-white/5 rounded-2xl text-center text-xs">
                    <span className="text-slate-500 block mb-2">Visual do Botão Principal:</span>
                    <button className={`py-2 px-4 rounded-xl ${currentTheme.accent} font-bold text-[11px] uppercase tracking-wider transition-all`}>
                      Salvar Cupom
                    </button>
                  </div>
                </div>

                {/* Tributary metadata parameters forms */}
                <div className="lg:col-span-2 glass-card p-6 rounded-3xl space-y-6">
                  <div>
                    <h3 className="font-display font-semibold text-white">Identificação da Loja Comercial</h3>
                    <p className="text-xs text-slate-500 mt-1">Alterações no cabeçalho ou dados oficiais de contato.</p>
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      alert("Configurações oficiais da ID Personalizados atualizadas com sucesso!");
                    }}
                    className="space-y-4 text-xs font-sans"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 animate-in">
                        <label className="text-slate-400 font-bold block">Nome Comercial Oficial</label>
                        <input 
                          type="text" 
                          value={storeConfig.storeName}
                          onChange={(e) => setStoreConfig({ ...storeConfig, storeName: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-slate-100 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                        />
                      </div>

                      <div className="space-y-1.5 animate-in">
                        <label className="text-slate-400 font-bold block">CNPJ Governamental</label>
                        <input 
                          type="text" 
                          value={storeConfig.cnpj}
                          onChange={(e) => setStoreConfig({ ...storeConfig, cnpj: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-slate-100 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 animate-in">
                        <label className="text-slate-400 font-bold block">E-mail Comercial (Atendimento)</label>
                        <input 
                          type="email" 
                          value={storeConfig.email}
                          onChange={(e) => setStoreConfig({ ...storeConfig, email: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-slate-100 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                        />
                      </div>

                      <div className="space-y-1.5 animate-in">
                        <label className="text-slate-400 font-bold block">Telefone / WhatsApp</label>
                        <input 
                          type="text" 
                          value={storeConfig.phone}
                          onChange={(e) => setStoreConfig({ ...storeConfig, phone: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-slate-100 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 animate-in">
                        <label className="text-slate-400 font-bold block">Dias Úteis de Confecção (Lead-Time)</label>
                        <input 
                          type="number" 
                          value={storeConfig.leadTimeDays}
                          onChange={(e) => setStoreConfig({ ...storeConfig, leadTimeDays: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-slate-100 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-mono"
                        />
                      </div>

                      <div className="space-y-1.5 animate-in">
                        <label className="text-slate-400 font-bold block">Valor Mínimo para Frete Grátis (R$)</label>
                        <input 
                          type="number" 
                          value={storeConfig.freeShippingThreshold}
                          onChange={(e) => setStoreConfig({ ...storeConfig, freeShippingThreshold: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-slate-100 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-mono"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex justify-end">
                      <button
                        type="submit"
                        className={`flex items-center gap-2 font-bold uppercase tracking-wider py-2.5 px-5 rounded-xl ${currentTheme.accent}`}
                      >
                        <Save className="w-4 h-4" />
                        Salvar Alterações
                      </button>
                    </div>

                  </form>
                </div>

              </div>

              {/* INTEGRATION SANDBOX */}
              <div className="mt-8">
                <MercadoPagoSimulator 
                  onPaymentSuccess={(amount, desc) => {
                    const randomOrderID = "ORD-MP" + Math.floor(6000 + Math.random() * 900);
                    const generatedOrder: Order = {
                      id: randomOrderID,
                      customerName: "Comprador App Mobile",
                      customerEmail: "cliente.app@mercado.com",
                      productName: desc,
                      productId: "P001",
                      quantity: 1,
                      totalPrice: amount,
                      status: "Pago",
                      date: new Date().toLocaleDateString("pt-BR"),
                      customNote: "Pedido gerado via chamada de API Mercado Pago Pix SDK no aplicativo."
                    };
                    
                    setOrders(prev => [generatedOrder, ...prev]);
                    
                    const generatedCustomer: Customer = {
                      id: "CLI-MP" + Math.floor(800 + Math.random() * 100),
                      name: "Comprador App Mobile",
                      email: "cliente.app@mercado.com",
                      phone: "(11) 98123-4567",
                      ordersCount: 1,
                      totalSpent: amount,
                      joinDate: new Date().toLocaleDateString("pt-BR"),
                      location: "Rio de Janeiro - RJ"
                    };
                    setCustomers(prev => [...prev, generatedCustomer]);
                    
                    alert(`[MERCADO PAGO WEBHOOK] Notificação de pagamento aprovada! R$ ${amount.toFixed(2).replace('.', ',')} recebidos. Pedido ${randomOrderID} criado com sucesso contendo status de "Pago" no painel!`);
                  }}
                />
              </div>

            </div>
          )}

        </main>
        
        {/* Floating action button (FAB) matching the original Flutter design */}
        <button
          onClick={() => {
            // Open product modal
            setIsProductModalOpen(true);
          }}
          className="fixed bottom-6 right-6 flex items-center gap-2 accent-gradient px-5 py-3 rounded-full text-xs font-bold text-white shadow-2xl hover:scale-105 active:scale-95 transition-all z-40 cursor-pointer shadow-indigo-500/20 uppercase tracking-widest"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Produto</span>
        </button>

      </div>

      {/* ======================================= */}
      {/* MODAL WINDOWS                           */}
      {/* ======================================= */}

      {/* MODAL 1: PREVIEW DETALHADA RECENT ORDER */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div 
            onClick={() => setSelectedOrder(null)} 
            className="absolute inset-0"
          />
          <div 
            id="order-detail-popup"
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 font-sans relative z-10 animate-in zoom-in-95 duration-200 shadow-2xl"
          >
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-white/5 pb-4">
              <h3 className="font-display font-extrabold text-xl text-white">Análise do Pedido</h3>
              <p className="text-slate-500 text-xs font-mono mt-1">Identificação: {selectedOrder.id}</p>
            </div>

            <div className="my-6 space-y-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-2">
                <p className="text-[10px] uppercase font-bold text-slate-400 leading-none">Comprador</p>
                <p className="font-bold text-white text-sm">{selectedOrder.customerName}</p>
                <p className="text-slate-400">{selectedOrder.customerEmail}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-3 rounded-xl border border-white/5">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Produto</p>
                  <p className="font-bold text-slate-200 mt-1">{selectedOrder.productName}</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-white/5">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Faturamento</p>
                  <p className="font-mono font-bold text-indigo-400 text-sm mt-1">{formatBRL(selectedOrder.totalPrice)}</p>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-1.5">
                <p className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Gravação / Nota de Confecção</p>
                <p className="italic text-slate-300 leading-relaxed">
                  "{selectedOrder.customNote || "Esse produto não exige observações personalizadas."}"
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Rastreamento de Processo</span>
              <div className="flex gap-1.5">
                {["Produção", "Enviado", "Entregue"].includes(selectedOrder.status) && (
                  <button
                    onClick={() => {
                      const next = selectedOrder.status === "Pago" ? "Produção" : (selectedOrder.status === "Produção" ? "Enviado" : "Entregue");
                      changeOrderStatus(selectedOrder.id, next as any);
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-bold text-xs leading-none transition-colors"
                  >
                    Avançar Etapa
                  </button>
                )}
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-755 text-slate-300 hover:text-white rounded-lg font-bold text-xs leading-none transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CRIAR NOVO PRODUTO (Vía FAB ou Tab) */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div 
            onClick={() => setIsProductModalOpen(false)} 
            className="absolute inset-0"
          />
          <form 
            onSubmit={handleAddProduct}
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 font-sans relative z-10 animate-in zoom-in-95 duration-200 shadow-2xl space-y-4"
          >
            <div className="border-b border-white/5 pb-3">
              <h3 className="font-display font-extrabold text-xl text-white">Novo Item do Catálogo</h3>
              <p className="text-slate-500 text-xs">Crie um novo material ou acessório com parâmetros de gravação.</p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold block">Nome do Produto</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Agenda Executiva de Bambu"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-slate-100 placeholder:text-slate-600 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold block">Categoria</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-slate-105 cursor-pointer text-slate-200"
                  >
                    <option value="Cadernos">Cadernos</option>
                    <option value="Apostilas">Apostilas</option>
                    <option value="Canecas">Canecas</option>
                    <option value="Planners">Planners</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold block">Preço de Venda (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    placeholder="45.90"
                    value={newProduct.price || ""}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-slate-100 placeholder:text-slate-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold block">Estoque Inicial (unidades)</label>
                  <input 
                    type="number" 
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-slate-100 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold block">Campo Customizável Mínimo</label>
                  <div className="flex gap-1">
                    <input 
                      type="text" 
                      placeholder="Ex: Nome do aluno"
                      value={customFieldInput}
                      onChange={(e) => setCustomFieldInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-slate-100 placeholder:text-slate-600 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customFieldInput) {
                          setNewProduct({
                            ...newProduct,
                            customizableFields: [...(newProduct.customizableFields || []), customFieldInput]
                          });
                          setCustomFieldInput("");
                        }
                      }}
                      className="px-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl font-bold uppercase text-[10px]"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {newProduct.customizableFields?.map((field, index) => (
                  <span 
                    key={index} 
                    className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-lg text-[10px] flex items-center gap-1.5"
                  >
                    {field}
                    <button 
                      type="button" 
                      onClick={() => {
                        setNewProduct({
                          ...newProduct,
                          customizableFields: newProduct.customizableFields?.filter((_, i) => i !== index)
                        });
                      }}
                      className="text-rose-400 hover:text-rose-200"
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold block">Descrição</label>
                <textarea 
                  rows={2}
                  placeholder="Descreva detalhes estruturais do item..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-slate-100 placeholder:text-slate-600 focus:outline-hidden resize-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-755 text-slate-305 text-slate-300 hover:text-white rounded-xl font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`py-2.5 px-5 font-bold uppercase tracking-wider rounded-xl ${currentTheme.accent}`}
              >
                Cadastrar Item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: SIMULAR NOVO PEDIDO (Vía Pedidos Tab) */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div 
            onClick={() => setIsOrderModalOpen(false)} 
            className="absolute inset-0"
          />
          <form 
            onSubmit={handleSimulateOrder}
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 font-sans relative z-10 animate-in zoom-in-95 duration-200 shadow-2xl space-y-4"
          >
            <div className="border-b border-white/5 pb-3">
              <h3 className="font-display font-extrabold text-xl text-white">Simular Pedido do Cliente</h3>
              <p className="text-slate-500 text-xs">Crie uma nova compra simulada para testar o painel produtivo.</p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold block">Nome do Comprador</label>
                <input 
                  type="text" 
                  required
                  placeholder="Nome do cliente"
                  value={newOrder.customerName}
                  onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-slate-100 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold block">E-mail de Contato</label>
                <input 
                  type="email" 
                  required
                  placeholder="ex: cliente@email.com"
                  value={newOrder.customerEmail}
                  onChange={(e) => setNewOrder({ ...newOrder, customerEmail: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-slate-100 focus:outline-hidden font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold block">Selecione o Produto</label>
                  <select
                    value={newOrder.productId}
                    onChange={(e) => setNewOrder({ ...newOrder, productId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-slate-200 cursor-pointer text-slate-100"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({formatBRL(p.price)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold block">Quantidade</label>
                  <input 
                    type="number" 
                    min="1"
                    max="10"
                    required
                    value={newOrder.quantity}
                    onChange={(e) => setNewOrder({ ...newOrder, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-slate-100 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold block">Observações de Confecção (Gravação personalizada)</label>
                <textarea 
                  rows={2}
                  placeholder="Ex: Nome gravado 'Beatriz' em Hotstamping dourado."
                  value={newOrder.customNote}
                  onChange={(e) => setNewOrder({ ...newOrder, customNote: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-slate-100 focus:outline-hidden resize-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsOrderModalOpen(false)}
                className="px-4 py-2.5 bg-slate-800 text-slate-300 hover:text-white rounded-xl font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`py-2.5 px-5 font-bold uppercase tracking-wider rounded-xl ${currentTheme.accent}`}
              >
                Confirmar Compra
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: CRIAR NOVO CUPOM / PROMOÇÃO */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div 
            onClick={() => setIsPromoModalOpen(false)} 
            className="absolute inset-0"
          />
          <form 
            onSubmit={handleAddPromotion}
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 font-sans relative z-10 animate-in zoom-in-95 duration-200 shadow-2xl space-y-4"
          >
            <div className="border-b border-white/5 pb-3">
              <h3 className="font-display font-extrabold text-xl text-white">Criar Cupom de Desconto</h3>
              <p className="text-slate-500 text-xs">Crie um cupom de validade por tempo limitado para seu público.</p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold block">Código do Cupom (Código único)</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: MAISARTE15"
                  value={newPromo.code}
                  onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-slate-100 focus:outline-hidden font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold block">Tipo de Redução</label>
                  <select
                    value={newPromo.discountType}
                    onChange={(e) => setNewPromo({ ...newPromo, discountType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-slate-200 cursor-pointer select-none"
                  >
                    <option value="percentage">Porcentagem (%)</option>
                    <option value="fixed">Valor Fixo (R$)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold block">Valor do Cupom</label>
                  <input 
                    type="number" 
                    required
                    placeholder="Ex: 15"
                    value={newPromo.value}
                    onChange={(e) => setNewPromo({ ...newPromo, value: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-slate-100 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold block font-mono">Limite de Usos Totais</label>
                  <input 
                    type="number" 
                    value={newPromo.maxUses}
                    onChange={(e) => setNewPromo({ ...newPromo, maxUses: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-slate-100 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold block">Compra Mínima (R$)</label>
                  <input 
                    type="number" 
                    value={newPromo.minPurchase}
                    onChange={(e) => setNewPromo({ ...newPromo, minPurchase: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-slate-100 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold block">Expiração (Ex: DD/MM/AAAA)</label>
                <input 
                  type="text" 
                  value={newPromo.expiryDate}
                  onChange={(e) => setNewPromo({ ...newPromo, expiryDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-slate-100 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsPromoModalOpen(false)}
                className="px-4 py-2.5 bg-slate-800 text-slate-300 hover:text-white rounded-xl font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`py-2.5 px-5 font-bold uppercase tracking-wider rounded-xl ${currentTheme.accent}`}
              >
                Liberar Cupom
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
