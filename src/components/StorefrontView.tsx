/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Heart, 
  ShoppingBag, 
  Search, 
  Check, 
  MessageCircle, 
  ArrowRight, 
  Sparkles, 
  Info, 
  Smartphone,
  ChevronRight,
  Shield,
  Percent,
  X,
  CreditCard,
  QrCode,
  Truck,
  Copy
} from "lucide-react";
import { Product, Order, Customer, Promotion, StoreConfig } from "../types";
import MercadoPagoSimulator from "./MercadoPagoSimulator";

interface StorefrontViewProps {
  products: Product[];
  promotions: Promotion[];
  storeConfig: StoreConfig;
  onAddOrder: (order: Order) => void;
  onAddCustomer: (customer: Customer) => void;
}

export default function StorefrontView({
  products,
  promotions,
  storeConfig,
  onAddOrder,
  onAddCustomer
}: StorefrontViewProps) {
  
  // 1. Static items from user request, with high-fidelity extensions
  const defaultProdutos = [
    {
      id: "SP001",
      name: 'Apostila de Alfabetização',
      price: 29.90,
      image: '📚',
      category: 'Papelaria',
      description: 'Material didático completo com espiral, capa resinada colorida e folhas interativas de aprendizagem.',
      customizableFields: ['Nome do Aluno', 'Série/Ano Escolar']
    },
    {
      id: "SP002",
      name: 'Caderno Personalizado',
      price: 39.90,
      image: '📒',
      category: 'Personalizados',
      description: 'Capa dura personalizada com estampa exclusiva gravada. Ideal para anotações diárias.',
      customizableFields: ['Nome para Capa', 'Esquema de Cores']
    },
    {
      id: "SP003",
      name: 'Caneca Personalizada',
      price: 24.90,
      image: '☕',
      category: 'Brindes',
      description: 'Caneca de cerâmica alto brilho de 325ml. Pode ir ao micro-ondas e lava-louças.',
      customizableFields: ['Foto ou Frase Desejada']
    },
    {
      id: "SP004",
      name: 'Kit Escolar',
      price: 59.90,
      image: '🎒',
      category: 'Escolar',
      description: 'Conjunto completo contendo estojo personalizado, régua, lápis, borracha e agenda estilosa.',
      customizableFields: ['Nome do Aluno', 'Tema do Personagem']
    }
  ];

  // Merge catalogs (static standard items + dynamic catalog items from dashboard)
  const allStoreProducts = useMemo(() => {
    const dynamicConverted = products.map(p => {
      // Choose a fun icon corresponding to its category to keep visual consistent
      let imageSym = '✏️';
      if (p.category === "Cadernos") imageSym = '📔';
      else if (p.category === "Apostilas") imageSym = '📖';
      else if (p.category === "Canecas") imageSym = '🥛';
      else if (p.category === "Planners") imageSym = '📅';

      return {
        id: p.id,
        name: p.name,
        price: p.price,
        image: imageSym,
        category: p.category === "Apostilas" ? "Papelaria" : (p.category === "Canecas" ? "Brindes" : "Personalizados"),
        description: p.description,
        customizableFields: p.customizableFields || []
      };
    });

    // Merge without duplicates (by name)
    const storeItems = [...defaultProdutos];
    dynamicConverted.forEach(dp => {
      if (!storeItems.find(item => item.name.toLowerCase() === dp.name.toLowerCase())) {
        storeItems.push(dp);
      }
    });

    return storeItems;
  }, [products]);

  // States
  const [currentTab, setCurrentTab] = useState<"catalog" | "favorites" | "cart" | "profile">("catalog");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Ver Tudo");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedCheckoutProduct, setSelectedCheckoutProduct] = useState<any | null>(null);
  
  // Custom pre-filled cart matching user's template items exactly
  const [cart, setCart] = useState<{ id: string; name: string; price: number; image: string; category: string; description: string; customizableFields: string[]; quantity: number }[]>([
    {
      id: "SP001",
      name: 'Apostila de Alfabetização',
      price: 29.90,
      image: '📚',
      category: 'Papelaria',
      description: 'Material didático completo com espiral, capa resinada colorida e folhas interativas de aprendizagem.',
      customizableFields: ['Nome do Aluno', 'Série/Ano Escolar'],
      quantity: 2
    },
    {
      id: "SP003",
      name: 'Caneca Personalizada',
      price: 24.90,
      image: '☕',
      category: 'Brindes',
      description: 'Caneca de cerâmica alto brilho de 325ml. Pode ir ao micro-ondas e lava-louças.',
      customizableFields: ['Foto ou Frase Desejada'],
      quantity: 1
    }
  ]);

  // Checkout process variables
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'payment' | 'completed'>('details');
  const [customFields, setCustomFields] = useState<Record<string, string>>({});
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null);
  const [promoError, setPromoError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'whatsapp'>('pix');
  const [whatsappSimOpen, setWhatsappSimOpen] = useState(false);
  const [whatsappMsg, setWhatsappMsg] = useState("");
  const [copiedPix, setCopiedPix] = useState(false);

  // Categories list
  const categories = ["Ver Tudo", "Papelaria", "Personalizados", "Encadernação", "Brindes", "Escolar"];

  // Filter items
  const filteredItems = useMemo(() => {
    return allStoreProducts.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = selectedCategory === "Ver Tudo" || item.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [allStoreProducts, searchTerm, selectedCategory]);

  // Handle heart favorites toggles
  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(prev => prev.filter(f => f !== id));
    } else {
      setFavorites(prev => [...prev, id]);
    }
  };

  // Cart operations
  const handleQuantityChange = (itemId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const handleAddToCartAndGo = (product: any) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        description: product.description,
        customizableFields: product.customizableFields || [],
        quantity: 1
      }];
    });
    setCurrentTab("cart");
  };

  // Cart totals math helper
  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const cartDiscount = useMemo(() => {
    if (!appliedPromo) return 0;
    if (appliedPromo.discountType === "percentage") {
      return cartSubtotal * (appliedPromo.value / 100);
    }
    return appliedPromo.value;
  }, [appliedPromo, cartSubtotal]);

  const cartShipping = useMemo(() => {
    if (cart.length === 0) return 0;
    const shippingThreshold = storeConfig.freeShippingThreshold || 150;
    return cartSubtotal >= shippingThreshold ? 0 : 12.00; // Rs 12.00 exactly as user request template
  }, [cartSubtotal, cart, storeConfig]);

  const cartTotal = useMemo(() => {
    return Math.max(0, cartSubtotal - cartDiscount + cartShipping);
  }, [cartSubtotal, cartDiscount, cartShipping]);

  const handleCheckoutCart = () => {
    if (cart.length === 0) {
      alert("Seu carrinho está vazio!");
      return;
    }
    const compiledName = cart.map(item => `${item.quantity}x ${item.name}`).join(" e ");
    const virtualProduct = {
      id: "CART_FLOW",
      name: compiledName,
      price: cartSubtotal,
      image: "🛒",
      category: "Carrinho",
      description: "Itens selecionados em seu Carrinho de Compras.",
      customizableFields: ["Instruções do Personalizado"]
    };
    startCheckout(virtualProduct);
  };

  // Open checkout draft process for a product
  const startCheckout = (product: any) => {
    setSelectedCheckoutProduct(product);
    setCheckoutStep('details');
    setCustomFields({});
    // Keep typed promo unless expired
    setPromoError("");
    setPaymentMethod('pix');
  };

  // Check discount coupons
  const applyCoupon = () => {
    setPromoError("");
    if (!promoCode) return;

    const codeUpper = promoCode.trim().toUpperCase();
    const found = promotions.find(p => p.code.toUpperCase() === codeUpper && p.status === "Ativo");

    if (!found) {
      setPromoError("Cupom inválido ou expirado.");
      setAppliedPromo(null);
      return;
    }

    const currentSub = selectedCheckoutProduct?.id === "CART_FLOW" ? cartSubtotal : (selectedCheckoutProduct?.price || 0);

    if (currentSub < found.minPurchase) {
      setPromoError(`Compra mínima exigida: R$ ${found.minPurchase.toFixed(2)}`);
      setAppliedPromo(null);
      return;
    }

    setAppliedPromo(found);
  };

  // Calculations for checkout
  const checkoutTotals = useMemo(() => {
    if (!selectedCheckoutProduct) return { subtotal: 0, discount: 0, shipping: 0, total: 0 };

    if (selectedCheckoutProduct.id === "CART_FLOW") {
      return {
        subtotal: cartSubtotal,
        discount: cartDiscount,
        shipping: cartShipping,
        total: cartTotal
      };
    }

    const subtotal = selectedCheckoutProduct.price;
    let discount = 0;

    if (appliedPromo) {
      if (appliedPromo.discountType === "percentage") {
        discount = subtotal * (appliedPromo.value / 100);
      } else {
        discount = appliedPromo.value;
      }
    }

    // Free shipping threshold or flat rate
    const shippingThreshold = storeConfig.freeShippingThreshold || 150;
    const shipping = subtotal >= shippingThreshold ? 0 : 12.00;
    const total = Math.max(0, subtotal - discount + shipping);

    return {
      subtotal,
      discount,
      shipping,
      total
    };
  }, [selectedCheckoutProduct, appliedPromo, storeConfig, cartSubtotal, cartDiscount, cartShipping, cartTotal]);

  // Proceed to payment step
  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !customerPhone) {
      alert("Por favor, preencha todos os campos cadastrais para prosseguir!");
      return;
    }
    setCheckoutStep('payment');
  };

  // Complete orders simulation
  const handlePixSuccess = (amount: number, description: string) => {
    const isCart = selectedCheckoutProduct.id === "CART_FLOW";
    const consolidatedProductsStr = isCart 
      ? cart.map(item => `${item.quantity}x ${item.name}`).join(" + ")
      : selectedCheckoutProduct.name;
    const totalQuantity = isCart
      ? cart.reduce((s, i) => s + i.quantity, 0)
      : 1;

    // Compile custom notes representating customizable fields
    const noteLines = Object.entries(customFields)
      .map(([key, val]) => `${key}: "${val}"`)
      .join(", ");
    const promoNote = appliedPromo ? ` (Cupom ${appliedPromo.code} aplicado)` : "";
    const finalCustomNote = `${isCart ? "[CARRINHO] " : ""}Gravações do Cliente: [${noteLines || "Nenhuma especificada"}]. ${promoNote}`;

    const orderId = "ORD-" + Math.floor(2500 + Math.random() * 500);

    // Build the order to send to state
    const createdOrder: Order = {
      id: orderId,
      customerName,
      customerEmail,
      productName: consolidatedProductsStr,
      productId: selectedCheckoutProduct.id,
      quantity: totalQuantity,
      totalPrice: amount,
      status: "Pago",
      date: new Date().toLocaleDateString("pt-BR"),
      customNote: finalCustomNote
    };

    // Register client and spent totals inside CRM
    const createdCustomer: Customer = {
      id: "CLI-" + Math.floor(500 + Math.random() * 100),
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      ordersCount: 1,
      totalSpent: amount,
      joinDate: new Date().toLocaleDateString("pt-BR"),
      location: isCart ? "Carrinho de Compras" : "Vitrina da Loja (Online)"
    };

    onAddOrder(createdOrder);
    onAddCustomer(createdCustomer);
    
    if (isCart) {
      setCart([]);
    }
    setCheckoutStep('completed');
  };

  // Dynamic WhatsApp order model string
  const testWhatsAppCheckoutMessage = () => {
    const customizableNotes = Object.entries(customFields)
      .map(([key, val]) => `- *${key}*: ${val}`)
      .join("\n");
    
    const isCart = selectedCheckoutProduct.id === "CART_FLOW";
    const itemsDescription = isCart 
      ? cart.map(item => `- *${item.quantity}x ${item.name}* (R$ ${item.price.toFixed(2)})`).join("\n")
      : `🛒 *${selectedCheckoutProduct.name}*\n💵 Valor: R$ ${selectedCheckoutProduct.price.toFixed(2).replace('.', ',')}`;

    const msg = `Olá! Vim através do site *${storeConfig.storeName}* de Orçamentos Gratuitos! ✨
Estou interessado nos seguintes itens:

${itemsDescription}

🚚 Frete de Confecção: ${checkoutTotals.shipping === 0 ? "Grátis" : "R$ 12,00"}
📉 Desconto: R$ ${checkoutTotals.discount.toFixed(2).replace('.', ',')}
💳 *TOTAL FINAL: R$ ${checkoutTotals.total.toFixed(2).replace('.', ',')}*

📋 *Observações / Gravações Personalizadas:*
${customizableNotes || "_Sem observações personalizadas._"}

👤 *Contatos do Solicitante:*
- Nome: ${customerName}
- E-mail: ${customerEmail}
- Telefone: ${customerPhone}

Gostaria de formalizar o envio de faturas e acompanhar a confecção! 🙏`;

    setWhatsappMsg(msg);
    setWhatsappSimOpen(true);
  };

  const handleWhatsappConfirm = () => {
    const isCart = selectedCheckoutProduct.id === "CART_FLOW";
    const orderId = "ORD-WA" + Math.floor(3000 + Math.random() * 900);
    const notes = Object.entries(customFields)
      .map(([key, val]) => `${key}: "${val}"`)
      .join(", ");
    
    const consolidatedProductsStr = isCart 
      ? cart.map(item => `${item.quantity}x ${item.name}`).join(" + ")
      : selectedCheckoutProduct.name;
    const totalQuantity = isCart
      ? cart.reduce((s, i) => s + i.quantity, 0)
      : 1;

    const createdOrder: Order = {
      id: orderId,
      customerName,
      customerEmail,
      productName: consolidatedProductsStr,
      productId: selectedCheckoutProduct.id,
      quantity: totalQuantity,
      totalPrice: checkoutTotals.total,
      status: "Produção", // Placed in Production awaiting WhatsApp communication approval
      date: new Date().toLocaleDateString("pt-BR"),
      customNote: `[ORÇAMENTO WHATSAPP] Contato manual gerado. Gravações: ${notes || "Não especificadas"}`
    };

    const createdCustomer: Customer = {
      id: "CLI-WA" + Math.floor(600 + Math.random() * 100),
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      ordersCount: 1,
      totalSpent: checkoutTotals.total,
      joinDate: new Date().toLocaleDateString("pt-BR"),
      location: isCart ? "Carrinho de Compras" : "Suporte do WhatsApp"
    };

    onAddOrder(createdOrder);
    onAddCustomer(createdCustomer);

    if (isCart) {
      setCart([]);
    }
    setWhatsappSimOpen(false);
    setCheckoutStep('completed');
  };

  return (
    <div className="relative rounded-[40px] overflow-hidden bg-gradient-to-b from-slate-100 to-purple-100 min-h-[85vh] text-slate-800 font-sans shadow-2xl border border-purple-200/50 flex flex-col justify-between max-w-lg mx-auto pb-20">
      
      {/* Top Mobile Status Header bar */}
      <div className="bg-purple-950 text-white/50 px-6 py-2.5 flex items-center justify-between text-xs font-mono">
        <span className="flex items-center gap-1">
          <Smartphone className="w-3.5 h-3.5" /> preview_mobile_host
        </span>
        <div className="flex items-center gap-1 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse block"></span>
          <span>Online</span>
        </div>
      </div>

      {/* HEADER */}
      <header className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-500 text-white p-6 rounded-b-[40px] shadow-2xl relative shrink-0">
        <div className="flex items-center justify-between">
          {currentTab === "catalog" && (
            <div>
              <h1 className="text-3xl font-extrabold tracking-wide drop-shadow-sm flex items-center gap-2">
                ID PERSONALIZADOS <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse fill-yellow-300" />
              </h1>
              <p className="text-white/80 mt-1 italic text-xs font-semibold">
                {storeConfig.storeName || "Personalizados com qualidade premium"}
              </p>
            </div>
          )}

          {currentTab === "favorites" && (
            <div>
              <h1 className="text-3xl font-extrabold tracking-wide drop-shadow-sm flex items-center gap-2">
                Favoritos ❤️
              </h1>
              <p className="text-white/80 mt-1 text-xs">
                Seus itens salvos e favoritos
              </p>
            </div>
          )}

          {currentTab === "cart" && (
            <div>
              <h1 className="text-3xl font-extrabold tracking-wide drop-shadow-sm flex items-center gap-2">
                Meu Carrinho 🛒
              </h1>
              <p className="text-white/80 mt-1 text-xs">
                Revise seus produtos antes de pagar
              </p>
            </div>
          )}

          {currentTab === "profile" && (
            <div>
              <h1 className="text-3xl font-extrabold tracking-wide drop-shadow-sm flex items-center gap-2">
                Meu Perfil 👤
              </h1>
              <p className="text-white/80 mt-1 text-xs">
                Sandbox temporária do comprador
              </p>
            </div>
          )}

          <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg backdrop-blur-md relative shrink-0 select-none">
            {currentTab === "catalog" && "🛍️"}
            {currentTab === "favorites" && "❤️"}
            {currentTab === "cart" && "🛒"}
            {currentTab === "profile" && "👤"}
            {currentTab === "catalog" && favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {favorites.length}
              </span>
            )}
          </div>
        </div>

        {/* PESQUISA only displayed on dynamic catalog tab */}
        {currentTab === "catalog" && (
          <div className="mt-6 bg-white rounded-2xl p-3 flex items-center gap-2.5 shadow-xl border border-purple-100/50 animate-in slide-in-from-top-3 duration-300">
            <Search className="w-4 h-4 text-gray-400 font-bold" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar produtos..."
              className="w-full outline-hidden text-gray-755 text-xs placeholder:text-gray-400 font-medium bg-transparent border-none focus:outline-hidden focus:ring-0 text-slate-805"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="text-xs text-gray-400 hover:text-gray-650 bg-slate-100 p-1 rounded-full">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </header>

      {/* MAIN SCREEN Scrollable */}
      <main className="p-5 flex-1 space-y-6 overflow-y-auto">
        
        {/* ==================== TAB 1: CATALOG ==================== */}
        {currentTab === "catalog" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* BIG HERO BUDGET PROMPT BANNER */}
            <section className="bg-gradient-to-r from-fuchsia-600 to-purple-700 text-white rounded-[35px] p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-4 -top-4 text-[100px] opacity-10 leading-none">
                ✨
              </div>

              <h2 className="text-3xl font-extrabold leading-tight max-w-xs">
                Venha fazer seu orçamento gratuito
              </h2>

              <p className="mt-3 text-xs text-white/90 max-w-sm font-medium leading-relaxed">
                Materiais de apostilas de alfabetização, encadernações artísticas, cadernos e brindes corporativos perfeitos.
              </p>

              <button 
                onClick={() => {
                  const target = document.getElementById("featured-items-tag");
                  target?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-5 bg-white text-purple-700 px-5 py-3 rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-all hover:bg-purple-50"
              >
                Ver Catálogo Online
              </button>
            </section>

            {/* CATEGORIAS ROW TABBED HEADERS */}
            <section>
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5">
                  <span>Navegar por Categorias</span>
                </h3>
                <span 
                  onClick={() => setSelectedCategory("Ver Tudo")} 
                  className="text-purple-700 text-xs font-bold bg-purple-100/50 px-2.5 py-1 rounded-full cursor-pointer hover:bg-purple-100"
                >
                  Ver Tudo
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  let emojiSym = "✏️";
                  if (cat === "Papelaria") emojiSym = "📚";
                  else if (cat === "Personalizados") emojiSym = "🎨";
                  else if (cat === "Encadernação") emojiSym = "🌀";
                  else if (cat === "Brindes") emojiSym = "🎁";
                  else if (cat === "Escolar") emojiSym = "🎒";
                  else if (cat === "Ver Tudo") emojiSym = "⭐";

                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm border ${
                        isSelected 
                          ? 'bg-purple-700 text-white border-purple-700 font-extrabold scale-[1.03] shadow-md shadow-purple-200' 
                          : 'bg-white text-slate-650 hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span>{emojiSym}</span>
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* PRODUTOS EM DESTAQUE SECTIONS */}
            <section id="featured-items-tag">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-extrabold text-gray-800">
                  Produtos Disponíveis ({filteredItems.length})
                </h3>
                <span className="text-purple-700 text-xs font-bold">
                  {selectedCategory !== "Ver Tudo" ? `Filtrando: ${selectedCategory}` : "Mais Procurados ✨"}
                </span>
              </div>

              <div className="space-y-4">
                {filteredItems.map((item) => {
                  const priceTextStr = "R$ " + item.price.toFixed(2).replace('.', ',');
                  const isFav = favorites.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-[28px] shadow-sm hover:shadow-md p-4.5 flex items-center justify-between gap-3 border border-purple-100/40 hover:scale-[1.01] transition-all duration-200"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-20 h-20 rounded-2xl bg-purple-100/40 border border-purple-205/30 flex items-center justify-center text-4xl shadow-inner shrink-0 leading-none">
                          {item.image}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                              {item.category}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-800 mt-1 lines-clamp-1 truncate" title={item.name}>
                            {item.name}
                          </h4>
                          <p className="text-slate-400 text-[10px] lines-clamp-1 truncate mt-0.5">{item.description}</p>

                          <p className="text-base font-extrabold text-purple-700 mt-1">
                            {priceTextStr}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-2 shrink-0">
                        <button
                          onClick={() => toggleFavorite(item.id)}
                          className={`p-1.5 rounded-full border transition-all ${
                            isFav 
                              ? 'bg-rose-50 text-rose-500 border-rose-200 scale-110' 
                              : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-rose-400'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500' : ''}`} />
                        </button>

                        <button 
                          onClick={() => handleAddToCartAndGo(item)}
                          className="bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white px-3 py-2 rounded-xl font-bold font-sans text-xs shadow-sm hover:scale-105 active:scale-95 transition-all text-center leading-none"
                        >
                          Comprar
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filteredItems.length === 0 && (
                  <div className="text-center py-10 bg-white/40 rounded-[30px] border border-dashed border-purple-200">
                    <span className="text-4xl block">🔍</span>
                    <p className="text-slate-500 text-xs font-semibold mt-3">Nenhum produto atendeu sua busca nesta categoria.</p>
                    <button 
                      onClick={() => { setSearchTerm(""); setSelectedCategory("Ver Tudo"); }}
                      className="mt-3 text-xs font-bold text-purple-700 bg-white px-3 py-1.5 rounded-xl border border-purple-200"
                    >
                      Limpar Filtros
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* REASSURANCE QUALITY METRICS SEALS */}
            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <div className="bg-white p-3 px-4 rounded-2xl flex items-center gap-2.5 border border-purple-100/50 text-[10px]">
                <Shield className="w-5 h-5 text-indigo-500 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800 block">Personalização Livre</span>
                  <span className="text-slate-400">Escolha nome e gravação</span>
                </div>
              </div>
              <div className="bg-white p-3 px-4 rounded-2xl flex items-center gap-2.5 border border-purple-100/50 text-[10px]">
                <Truck className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800 block">Confecção Expressa</span>
                  <span className="text-slate-400">Entrega rápida via correio</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: FAVORITES ==================== */}
        {currentTab === "favorites" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {favorites.length === 0 ? (
              <div className="text-center py-12 bg-white/50 rounded-[35px] border border-dashed border-purple-200">
                <span className="text-4xl text-rose-500 animate-pulse">❤️</span>
                <p className="text-slate-500 text-sm font-semibold mt-4">Nenhum produto favoritado!</p>
                <p className="text-slate-400 text-xs mt-1.5 px-6">Curta e favorite itens no catálogo e eles aparecerão nesta lista.</p>
                <button 
                  onClick={() => setCurrentTab("catalog")}
                  className="mt-4 bg-gradient-to-r from-purple-700 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:scale-102 transition-all active:scale-95"
                >
                  Ver Catálogo
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {allStoreProducts.filter(p => favorites.includes(p.id)).map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-[28px] shadow-sm p-4 flex items-center justify-between gap-3 border border-purple-100/40 hover:scale-[1.01] transition-all duration-200"
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className="w-16 h-16 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-4xl shrink-0 leading-none">
                        {item.image}
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="bg-purple-150 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[9px] font-bold">
                          {item.category}
                        </span>
                        <h4 className="text-sm font-bold text-slate-800 mt-1 lines-clamp-1 truncate">
                          {item.name}
                        </h4>
                        <p className="text-base font-extrabold text-purple-700 mt-1">
                          R$ {item.price.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className="p-1.5 rounded-full border bg-rose-50 text-rose-500 border-rose-250 hover:scale-105 transition-all"
                      >
                        <Heart className="w-3.5 h-3.5 fill-rose-500" />
                      </button>

                      <button 
                        onClick={() => handleAddToCartAndGo(item)}
                        className="bg-gradient-to-r from-purple-700 to-indigo-600 text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all text-center leading-none"
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 3: CARRINHO (USER TEMPLATE) ==================== */}
        {currentTab === "cart" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {cart.length === 0 ? (
              <div className="text-center py-12 bg-white/50 rounded-[35px] border border-dashed border-purple-200">
                <span className="text-5xl block animate-bounce">🛒</span>
                <p className="text-slate-500 text-sm font-semibold mt-4">Seu carrinho está vazio!</p>
                <p className="text-slate-400 text-xs mt-1.5 px-6 leading-relaxed">Explore nossos materiais personalizados premium e adicione itens para simular o checkout.</p>
                <button 
                  onClick={() => setCurrentTab("catalog")}
                  className="mt-4 bg-gradient-to-r from-purple-700 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:scale-102 transition-all active:scale-95"
                >
                  Navegar no Catálogo
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* PRODUTOS */}
                <div className="space-y-4">
                  {cart.map((produto) => (
                    <div
                      key={produto.id}
                      className="bg-white rounded-[25px] p-4 shadow-md flex items-center justify-between hover:scale-[1.01] transition-all duration-300 border border-purple-100/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-[22px] bg-purple-100/50 border border-purple-100 flex items-center justify-center text-4xl shadow-inner shrink-0 leading-none">
                          {produto.image}
                        </div>

                        <div>
                          <h2 className="text-xs font-bold text-gray-800 line-clamp-1">
                            {produto.name}
                          </h2>

                          <p className="text-purple-700 text-sm font-extrabold mt-0.5">
                            R$ {produto.price.toFixed(2).replace('.', ',')}
                          </p>

                          {/* QUANTIDADE CONTROLLER */}
                          <div className="flex items-center gap-2.5 mt-2">
                            <button 
                              onClick={() => handleQuantityChange(produto.id, -1)}
                              className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 font-bold text-xs hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none"
                            >
                              -
                            </button>

                            <span className="text-xs font-bold text-gray-700 select-none">
                              {produto.quantity}
                            </span>

                            <button 
                              onClick={() => handleQuantityChange(produto.id, 1)}
                              className="w-7 h-7 rounded-lg bg-purple-700 text-white font-bold text-xs hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* REMOVER CART BUTTON */}
                      <button 
                        onClick={() => handleRemoveFromCart(produto.id)}
                        className="text-red-500 hover:text-red-655 text-lg hover:scale-110 active:scale-90 transition-all p-2.5 bg-rose-50/50 rounded-xl leading-none"
                        title="Remover Item"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>

                {/* CUPOM */}
                <div className="bg-white rounded-[25px] p-4 shadow-md space-y-3 border border-purple-100/30">
                  <h3 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1 leading-none">
                    <span className="text-purple-700 text-xs">🏷️</span> Cupom de Desconto
                  </h3>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Digite seu cupom (Ex: BEMVINDO10)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 bg-slate-100 rounded-xl px-3 py-2.5 text-xs font-semibold outline-hidden focus:ring-1 focus:ring-purple-400 capitalize placeholder:text-gray-400 uppercase font-mono text-slate-800"
                    />

                    <button 
                      onClick={applyCoupon}
                      className="bg-gradient-to-r from-purple-700 to-indigo-600 text-white px-4 rounded-xl text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all uppercase tracking-wider leading-none"
                    >
                      Aplicar
                    </button>
                  </div>
                  {promoError && <p className="text-rose-500 text-[10px] font-bold mt-1">⚠️ {promoError}</p>}
                  {appliedPromo && (
                    <p className="text-emerald-600 text-[10px] font-bold mt-1 flex items-center gap-1 animate-pulse leading-none">
                      ✓ Cupom <span className="bg-emerald-100 px-1 py-0.5 rounded font-mono font-extrabold">{appliedPromo.code}</span> ativado! 
                      Desconto de {appliedPromo.discountType === "percentage" ? `${appliedPromo.value}%` : `R$ ${appliedPromo.value.toFixed(2)}`} recebido.
                    </p>
                  )}
                </div>

                {/* RESUMO */}
                <div className="bg-white rounded-[30px] p-5 shadow-md space-y-4 border border-purple-100/30">
                  <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider border-b pb-2">
                    Resumo do Pedido do Cliente
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-semibold">Subtotal</span>
                      <span className="font-bold text-gray-800">
                        R$ {cartSubtotal.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    {cartDiscount > 0 && (
                      <div className="flex items-center justify-between text-rose-500 font-bold">
                        <span>Desconto</span>
                        <span>
                          - R$ {cartDiscount.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-semibold">Entrega</span>
                      <span className="font-bold text-gray-800 font-sans">
                        {cartShipping === 0 ? (
                          <span className="text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded uppercase text-[9px] border border-emerald-100">Grátis</span>
                        ) : (
                          `R$ ${cartShipping.toFixed(2).replace('.', ',')}`
                        )}
                      </span>
                    </div>

                    <div className="border-t border-gray-100 pt-3 flex items-center justify-between leading-none">
                      <span className="text-xs font-extrabold text-gray-800">
                        Total
                      </span>

                      <span className="text-base font-extrabold text-purple-700">
                        R$ {cartTotal.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  {/* PAGAMENTO */}
                  <button 
                    onClick={handleCheckoutCart}
                    className="w-full mt-2 bg-gradient-to-r from-purple-700 to-indigo-600 text-white py-3 rounded-2xl text-xs font-extrabold shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-300 uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer leading-none"
                  >
                    🛒 Finalizar Compra via Pix
                  </button>
                </div>

              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 4: PROFILE ==================== */}
        {currentTab === "profile" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-[28px] p-5 shadow-sm border border-purple-100/30 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-3xl font-extrabold select-none">
                👤
              </div>
              <div>
                <h4 className="font-bold text-slate-805 text-sm">Cliente Sandbox Convidado</h4>
                <p className="text-slate-450 text-[10px] mt-0.5">{customerEmail || "izidomingos12@gmail.com"}</p>
                <span className="bg-purple-100 text-purple-700 text-[9px] font-bold px-2 py-0.5 rounded-full mt-1.5 inline-block select-none font-mono">ID VIP • Sandbox Comprador</span>
              </div>
            </div>

            <div className="bg-white rounded-[28px] p-5 shadow-sm border border-purple-100/30 space-y-3 text-xs leading-relaxed">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b pb-1.5 mb-2 leading-none">
                <span>📋 Controle de Orçamentos Virtuais</span>
              </h4>
              <p className="text-slate-500">
                Todo orçamento ou simulação de compra que você preencher no checkout (PIX ou WhatsApp) será gravado com segurança no <strong className="text-slate-700 font-bold">Painel de Administração</strong> da loja institucional.
              </p>
              <div className="pt-2">
                <button 
                  onClick={() => setCurrentTab("catalog")}
                  className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl transition-all select-none"
                >
                  Voltar ao Catálogo
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* FLOAT BRANDING LOGO */}
      <footer className="text-center text-[10px] text-slate-400 py-3 block border-t border-purple-100 shrink-0 select-none font-mono">
        CNPJ {storeConfig.cnpj} • Todos os direitos reservados.
      </footer>

      {/* FIXED BOTTOM NAV MOCK BAR */}
      <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-purple-105 border-slate-200 shadow-2xl px-5 py-3 flex items-center justify-around rounded-t-[30px] z-20 shrink-0">
        <button 
          onClick={() => { setCurrentTab("catalog"); setSelectedCategory("Ver Tudo"); setSearchTerm(""); }}
          className={`flex flex-col items-center ${currentTab === "catalog" ? "text-purple-750 font-bold" : "text-gray-400"} cursor-pointer hover:text-purple-700 transition-colors select-none`}
        >
          <span className="text-xl">🏠</span>
          <span className="text-[10px] mt-0.5 font-sans leading-none">Início</span>
        </button>

        <button 
          onClick={() => { setCurrentTab("favorites"); }}
          className={`flex flex-col items-center ${currentTab === "favorites" ? "text-purple-750 font-bold" : "text-gray-400"} cursor-pointer hover:text-purple-700 transition-colors select-none`}
        >
          <span className="text-xl">❤️</span>
          <span className="text-[10px] mt-0.5 font-sans leading-none">Favoritos</span>
        </button>

        <button 
          onClick={() => { setCurrentTab("cart"); }}
          className={`flex flex-col items-center ${currentTab === "cart" ? "text-purple-750 font-bold animate-pulse" : "text-gray-400"} cursor-pointer hover:text-purple-700 transition-colors relative select-none`}
        >
          <div className="relative leading-none">
            <span className="text-xl font-bold">🛒</span>
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-purple-700 text-white text-[8px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white leading-none scale-[0.9]">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 font-sans leading-none">Carrinho</span>
        </button>

        <button 
          onClick={() => { setCurrentTab("profile"); }}
          className={`flex flex-col items-center ${currentTab === "profile" ? "text-purple-750 font-bold" : "text-gray-400"} cursor-pointer hover:text-purple-700 transition-colors select-none`}
        >
          <span className="text-xl">👤</span>
          <span className="text-[10px] mt-0.5 font-sans leading-none">Perfil</span>
        </button>
      </nav>

      {/* DYNAMICS FLOATING WHATSAPP INTERACTIVE PANEL */}
      <div className="absolute bottom-20 right-5 z-20">
        <button 
          onClick={() => {
            alert(`Simulador de Central de Soluções da ID PERSONALIZADOS!\n\nPara fazer orçamentos automáticos de qualquer produto:\n1. Clique em "Comprar" ao lado de qualquer item\n2. Digite seus dados\n3. Escolha a opção de checkout desejada para monitoramento!`);
          }}
          className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-2xl shadow-xl flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all animate-bounce"
          title="Fale Conosco"
        >
          <MessageCircle className="w-6 h-6 shrink-0 text-white fill-white" />
        </button>
      </div>

      {/* ======================================================== */}
      {/* CHECKOUT MODAL DRAWER - THE LIVING HEART OF THE INTEGRATION */}
      {/* ======================================================== */}
      {selectedCheckoutProduct && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-end z-40 animate-in fade-in duration-200">
          <div 
            onClick={() => setSelectedCheckoutProduct(null)}
            className="absolute inset-0"
          />
          <div className="bg-white rounded-t-[35px] border-t border-purple-200 w-full relative z-10 max-h-[90%] flex flex-col justify-between shadow-2xl p-6 pb-8 animate-in slide-in-from-bottom duration-300">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedCheckoutProduct(null)}
              className="absolute top-5 right-5 p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Sub-Header */}
            <div className="border-b border-slate-100 pb-3 flex items-start gap-3">
              <span className="text-4xl leading-none bg-purple-50 p-2 rounded-xl">{selectedCheckoutProduct.image}</span>
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-600">{selectedCheckoutProduct.category}</span>
                <h4 className="font-extrabold text-slate-800 text-base leading-tight mt-0.5">{selectedCheckoutProduct.name}</h4>
                <p className="font-mono text-purple-700 font-bold text-sm mt-0.5">R$ {selectedCheckoutProduct.price.toFixed(2).replace('.', ',')}</p>
              </div>
            </div>

            {/* CHECKOUT STEP 1: SOLICIT CUSTOMER DETAILS & GRAVING LABELS */}
            {checkoutStep === 'details' && (
              <form onSubmit={handleDetailsSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs pr-1 scrollbar-thin">
                
                <div className="p-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 flex gap-2.5">
                  <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <p className="text-indigo-900 font-medium text-[10px] leading-relaxed">
                    Você pode personalizar seu material agora! Insira cada detalhe de confecção e gravação abaixo. Nós usaremos estas observações no painel produtivo de pedidos!
                  </p>
                </div>

                {/* Dinâmicos Custom Fields */}
                {selectedCheckoutProduct.customizableFields && selectedCheckoutProduct.customizableFields.length > 0 ? (
                  <div className="space-y-3">
                    <h5 className="font-bold text-purple-800 uppercase tracking-wider text-[9px] flex items-center gap-1">
                      <span>✒️ Especificações do Personalizado</span>
                    </h5>
                    
                    <div className="grid grid-cols-1 gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/50">
                      {selectedCheckoutProduct.customizableFields.map((field: string) => (
                        <div key={field} className="space-y-1">
                          <label className="text-slate-650 font-semibold block">{field}</label>
                          <input
                            type="text"
                            required
                            placeholder={`Ex: Informar ${field.toLowerCase()}`}
                            value={customFields[field] || ""}
                            onChange={(e) => setCustomFields({ ...customFields, [field]: e.target.value })}
                            className="w-full bg-white border border-slate-250 border-slate-200 rounded-xl py-2 px-3 text-slate-800 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-hidden"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-slate-650 font-semibold block">Observação ou Gravação Livre</label>
                    <textarea
                      rows={2}
                      placeholder="Ex: Gostaria destas duas fotos aplicadas na estampa."
                      value={customFields['Instrução'] || ""}
                      onChange={(e) => setCustomFields({ ...customFields, 'Instrução': e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800 text-xs focus:ring-1 focus:ring-purple-500 resize-none focus:outline-hidden"
                    />
                  </div>
                )}

                {/* Cliente Contacts Details */}
                <div className="space-y-3">
                  <h5 className="font-bold text-slate-500 uppercase tracking-wider text-[9px]">👤 Identificação do Comprador</h5>
                  
                  <div className="space-y-2.5">
                    <div className="space-y-0.5">
                      <label className="text-slate-500 font-bold block text-[10px]">Nome Completo</label>
                      <input
                        type="text"
                        required
                        placeholder="Insira seu nome"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-slate-800 focus:ring-1 focus:ring-purple-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-slate-500 font-bold block text-[10px]">E-mail para Notificações</label>
                        <input
                          type="email"
                          required
                          placeholder="seu.email@exemplo.com"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-slate-800 focus:ring-1 focus:ring-purple-500 focus:outline-hidden"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-slate-500 font-bold block text-[10px]">WhatApp (DDD + Celular)</label>
                        <input
                          type="text"
                          required
                          placeholder="(11) 99999-0000"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-slate-800 focus:ring-1 focus:ring-purple-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* COUPON INPUT FIELD */}
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold block text-[10px]">Possui Cupom de Desconto?</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Ex: BEMVINDO10"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3.5 text-slate-800 font-semibold focus:ring-1 focus:ring-purple-500 uppercase focus:outline-hidden font-mono"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 rounded-xl text-xs flex items-center justify-center shrink-0 uppercase tracking-wider"
                    >
                      Aplicar
                    </button>
                  </div>
                  {promoError && <p className="text-rose-500 text-[10px] font-bold mt-1">⚠️ {promoError}</p>}
                  {appliedPromo && (
                    <p className="text-emerald-600 text-[10px] font-bold mt-1 flex items-center gap-1 animate-pulse">
                      ✓ Cupom <span className="bg-emerald-100 px-1 py-0.5 rounded font-mono font-extrabold">{appliedPromo.code}</span> ativado! 
                      Desconto de {appliedPromo.discountType === "percentage" ? `${appliedPromo.value}%` : `R$ ${appliedPromo.value.toFixed(2)}`} recebido.
                    </p>
                  )}
                </div>

                {/* PRICING SHEET PREVIEW */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5 text-[11px] font-medium leading-tight">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal do Item</span>
                    <span>R$ {checkoutTotals.subtotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                  {checkoutTotals.discount > 0 && (
                    <div className="flex justify-between text-rose-500 font-bold">
                      <span className="flex items-center gap-1"><Percent className="w-3.5 h-3.5" /> Cupom de Desconto</span>
                      <span>- R$ {checkoutTotals.discount.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500">
                    <span className="flex items-center gap-1">🚚 Frete de Confecção</span>
                    <span>{checkoutTotals.shipping === 0 ? "Grátis" : `R$ ${checkoutTotals.shipping.toFixed(2).replace('.', ',')}`}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-800 text-sm border-t border-slate-200/60 pt-1.5 mt-1.5">
                    <span>Total Estimado</span>
                    <span className="text-purple-700 font-mono">R$ {checkoutTotals.total.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-4 text-center text-white bg-gradient-to-r from-purple-700 to-indigo-600 rounded-2xl font-bold uppercase tracking-wider text-xs shadow-lg shadow-purple-200 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
                >
                  Continuar Para Pagamento <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* CHECKOUT STEP 2: PAYMENT CHOICES & MOCKING MP WEBHOOKS */}
            {checkoutStep === 'payment' && (
              <div className="flex-1 overflow-y-auto py-4 space-y-5 text-xs pr-1 scrollbar-thin">
                
                {/* Mode tabs choice */}
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
                  <button
                    onClick={() => setPaymentMethod('pix')}
                    className={`py-3 px-3 rounded-xl font-bold uppercase text-[10px] flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === 'pix' 
                        ? 'bg-purple-700 text-white shadow-md' 
                        : 'text-slate-505 hover:text-slate-800 text-slate-500'
                    }`}
                  >
                    <QrCode className="w-4 h-4" /> PIX (Mercado Pago)
                  </button>

                  <button
                    onClick={() => setPaymentMethod('whatsapp')}
                    className={`py-3 px-3 rounded-xl font-bold uppercase text-[10px] flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === 'whatsapp' 
                        ? 'bg-[#25d366] text-white shadow-md' 
                        : 'text-slate-505 hover:text-slate-800 text-slate-500'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4 fill-white text-emerald-600" /> WhatsApp Direct
                  </button>
                </div>

                {/* Render appropriate Simulator/Checkout interface based on Choice */}
                {paymentMethod === 'pix' ? (
                  <div className="space-y-4 text-left animate-in fade-in duration-300">
                    
                    {/* CUSTOM SPECIFIED HEADER STYLE FOR PIX PAYMENT */}
                    <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-500 text-white p-5 rounded-3xl shadow-lg relative overflow-hidden select-none">
                      <div className="absolute -right-4 -top-4 text-[70px] opacity-10 leading-none">
                        💳
                      </div>
                      <h4 className="text-xl font-extrabold flex items-center gap-2">
                        Pagamento Pix <span className="bg-emerald-400 text-emerald-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase animate-pulse">Pendente</span>
                      </h4>
                      <p className="text-white/80 mt-1 text-[10px] leading-relaxed">
                        Finalize seu pedido de orçamento com segurança utilizando o QR Code Pix ou copiando o código copia e cola!
                      </p>
                    </div>

                    {/* RESUMO DO PEDIDO */}
                    <div className="bg-slate-50 border border-slate-150 rounded-[28px] p-5 shadow-inner">
                      <h5 className="text-sm font-extrabold text-slate-800 mb-3.5">
                        Resumo do Pedido do Cliente
                      </h5>

                      <div className="space-y-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-semibold">Subtotal dos itens</span>
                          <span className="font-bold text-slate-800">
                            R$ {checkoutTotals.subtotal.toFixed(2).replace('.', ',')}
                          </span>
                        </div>

                        {checkoutTotals.discount > 0 && (
                          <div className="flex items-center justify-between text-rose-500 font-bold">
                            <span>Desconto Aplicado</span>
                            <span>
                              - R$ {checkoutTotals.discount.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-semibold">Entrega e Confecção</span>
                          <span className="font-bold text-slate-800 font-sans">
                            {checkoutTotals.shipping === 0 ? (
                              <span className="text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded uppercase text-[9px] border border-emerald-100">Grátis</span>
                            ) : (
                              `R$ ${checkoutTotals.shipping.toFixed(2).replace('.', ',')}`
                            )}
                          </span>
                        </div>

                        <div className="border-t border-slate-205 pt-3.5 flex items-center justify-between leading-none">
                          <span className="text-sm font-extrabold text-slate-800">
                            Total Parcial
                          </span>

                          <span className="text-xl font-black text-purple-700">
                            R$ {checkoutTotals.total.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* QR CODE PIX */}
                    <div className="bg-white rounded-[28px] border border-purple-100 p-5 text-center shadow-xs">
                      <h5 className="text-sm font-extrabold text-slate-805 mb-3.5">
                        Escaneie o QR Code
                      </h5>

                      <div className="w-44 h-44 mx-auto rounded-[25px] bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center shadow-inner border-2 border-dashed border-purple-200 relative select-none">
                        
                        {/* Authentic QR grid design with Pix center badge */}
                        <div className="w-24 h-24 relative opacity-85">
                          <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-purple-705 rounded-sm"></div>
                          <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-purple-705 rounded-sm"></div>
                          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-purple-705 rounded-sm"></div>
                          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-purple-705 rounded-sm"></div>
                          
                          {/* Inner pixels */}
                          <div className="absolute inset-1.5 grid grid-cols-4 gap-1.5 opacity-30">
                            {Array.from({ length: 16 }).map((_, i) => (
                              <div key={i} className={`rounded-xs ${i % 3 === 0 || i % 5 === 1 ? 'bg-purple-950' : 'bg-transparent'}`} />
                            ))}
                          </div>
                          <div className="absolute inset-4 bg-purple-700 text-white font-black text-[8px] flex items-center justify-center rounded uppercase tracking-wider">
                            PIX
                          </div>
                        </div>

                        <div className="absolute top-2 right-2 text-xl">📱</div>
                      </div>

                      <p className="mt-3.5 text-slate-500 text-[10px] font-medium leading-relaxed px-4">
                        Abra o app do seu banco preferido, selecione a aba <strong className="text-purple-700">"Pagar via Pix QR Code"</strong> e aponte a câmera.
                      </p>
                    </div>

                    {/* PIX COPIA E COLA */}
                    <div className="bg-white rounded-[28px] border border-purple-100 p-5">
                      <h5 className="text-sm font-extrabold text-slate-800 mb-3">
                        Pix Copia e Cola
                      </h5>

                      <div className="bg-slate-100 rounded-2xl p-4 break-all text-slate-650 text-[10px] leading-relaxed font-mono shadow-inner text-left tracking-normal max-h-24 overflow-y-auto select-all">
                        00020126360014BR.GOV.BCB.PIX0114+5511999999995204000053039865405{checkoutTotals.total.toFixed(2)}5802BR5925ID PERSONALIZADOS6009SAO PAULO62070503***6304ABCD
                      </div>

                      <button 
                        onClick={() => {
                          const pixCode = `00020126360014BR.GOV.BCB.PIX0114+5511999999995204000053039865405${checkoutTotals.total.toFixed(2)}5802BR5925ID PERSONALIZADOS6009SAO PAULO62070503***6304ABCD`;
                          navigator.clipboard.writeText(pixCode);
                          setCopiedPix(true);
                          setTimeout(() => setCopiedPix(false), 2000);
                        }}
                        className="w-full mt-3 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 select-none active:scale-95 hover:scale-101 transition-all cursor-pointer leading-none"
                      >
                        {copiedPix ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" /> Copiado com Sucesso!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" /> Copiar Código Copia e Cola
                          </>
                        )}
                      </button>
                    </div>

                    {/* INSTANT SANDBOX TEST WEBHOOK TRIGGER */}
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/50 flex flex-col gap-2.5">
                      <div className="flex gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-extrabold text-emerald-950 text-[10px] block leading-none">Simulador de Liberação Bancária (Webhook)</span>
                          <p className="text-[9px] mt-1 text-emerald-800 leading-relaxed font-sans">
                            Clique abaixo para emular instantaneamente o aviso bancário do Pix aprovado! Seu pedido será creditado e direcionado ao status <strong className="text-slate-800">"Sincronizado"</strong> no painel administrativo principal.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          handlePixSuccess(checkoutTotals.total, `Simulado no checkout: ${selectedCheckoutProduct.name}`);
                        }}
                        className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-extrabold rounded-xl uppercase text-[10px] shadow-sm flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01] active:scale-95 transition-all select-none leading-none"
                      >
                        ⚡ Simular Confirmação Bancária (Pix Pago)
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="space-y-4 py-2">
                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-2">
                      <MessageCircle className="w-4 h-4 text-emerald-500 fill-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-emerald-900 block text-[10px]">Orçamento via Suporte WhatsApp</span>
                        <p className="text-[9px] text-emerald-800 mt-0.5 font-sans leading-relaxed">
                          Gere uma mensagem estruturada contendo as especificações do personalizado. Nosso servidor irá registrar o pedido em produção sinalizando seu contato!
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-205 leading-relaxed font-mono text-[10px] text-slate-650 max-h-48 overflow-y-auto">
                      <span className="text-[8px] uppercase font-bold text-slate-400 block pb-1 border-b mb-1">Modelo da Mensagem para WhatsApp:</span>
                      <pre className="whitespace-pre-wrap font-medium">{`Olá! Vim através do site ${storeConfig.storeName}...\n📦 Produto: ${selectedCheckoutProduct.name}\n📋 Gravações: ${Object.entries(customFields).map(([k, v]) => `${k}:${v}`).join(",")}\n💰 Total: R$ ${checkoutTotals.total.toFixed(2)}`}</pre>
                    </div>

                    <button
                      onClick={testWhatsAppCheckoutMessage}
                      className="w-full py-3.5 bg-emerald-505 hover:bg-emerald-600 bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-100 uppercase text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-xl active:scale-98 transition-all"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" /> Enviar Orçamento ao Vendedor
                    </button>
                  </div>
                )}

                {/* Back button */}
                <button
                  type="button"
                  onClick={() => setCheckoutStep('details')}
                  className="w-full py-2.5 text-slate-500 hover:text-slate-700 font-bold uppercase text-[10px] cursor-pointer text-center bg-slate-50 border border-slate-200 rounded-xl"
                >
                  Voltar e Editar Dados
                </button>
              </div>
            )}

            {/* CHECKOUT STEP 3: CONGRATULATIONS AND ACTION REDIRECTS */}
            {checkoutStep === 'completed' && (
              <div className="flex-1 py-8 flex flex-col items-center justify-center text-center space-y-5 animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-3xl shadow-xl animate-bounce">
                  ✓
                </div>
                <div>
                  <h5 className="text-xl font-extrabold text-slate-800 leading-none">Pedido Cadastrado com Sucesso!</h5>
                  <p className="text-xs text-slate-500 mt-2 px-6 leading-relaxed">
                    Agradecemos seu preenchimento de orçamento! O pedido foi registrado no <strong className="text-slate-800">Painel do Administrador</strong> da loja de forma automática.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl w-full border border-slate-100 text-left space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold text-slate-450 uppercase block font-sans">Comprovante Digital:</span>
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-slate-500">Comprador:</span>
                    <span className="text-slate-800 font-bold">{customerName}</span>
                  </div>
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-slate-500">Material:</span>
                    <span className="text-slate-800 font-bold">{selectedCheckoutProduct.name}</span>
                  </div>
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-slate-500">Total Faturado:</span>
                    <span className="text-purple-600 font-bold font-mono">R$ {checkoutTotals.total.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-slate-500">Status no Painel:</span>
                    <span className={`px-1.5 rounded-full font-bold text-[9px] ${
                      paymentMethod === 'pix' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {paymentMethod === 'pix' ? 'Pago' : 'Produção'}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-450 text-slate-400 font-medium px-4 leading-relaxed italic">
                  Você pode voltar ao Painel de Administrador (clicando no menu lateral) para ver este pedido de id aleatório registrado e atualizar as etapas de produção e entrega!
                </p>

                <button
                  onClick={() => setSelectedCheckoutProduct(null)}
                  className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-2xl text-xs uppercase cursor-pointer hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md"
                >
                  Fechar Janela
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* WHATSAPP OVERLAY POPUP CHAT SIMULATOR                   */}
      {/* ======================================================== */}
      {whatsappSimOpen && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-55 animate-in fade-in">
          <div 
            onClick={() => setWhatsappSimOpen(false)}
            className="absolute inset-0"
          />
          <div className="bg-[#e5ddd5] w-full max-w-sm rounded-3xl overflow-hidden relative z-10 flex flex-col justify-between h-[450px] shadow-2xl border-2 border-white/20">
            
            {/* Header bar WhatsApp green */}
            <div className="bg-[#075e54] text-white p-4 flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-xl shadow-md border-2 border-white/40">
                  🛍️
                </div>
                <div>
                  <h6 className="font-bold text-sm tracking-tight">{storeConfig.storeName}</h6>
                  <span className="text-[10px] text-emerald-200 block mt-0.5">Suporte Oficial • On-line</span>
                </div>
              </div>
              <button onClick={() => setWhatsappSimOpen(false)} className="text-white hover:text-emerald-100 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat screen displaying message bubbles */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3.5 scrollbar-thin">
              <div className="text-center py-1">
                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[9px] font-bold block mx-auto w-max select-none shadow-sm">
                  🔒 Criptografia em Sandbox Ativa
                </span>
              </div>

              {/* Sent message bubbles simulation styled like real WhatsApp */}
              <div className="ml-10 bg-[#dcf8c6] border border-emerald-100 p-3 rounded-2xl rounded-tr-none shadow-sm text-[11px] text-slate-800 relative">
                <pre className="whitespace-pre-wrap font-sans font-medium text-slate-800 leading-relaxed">{whatsappMsg}</pre>
                <div className="text-right text-[8px] text-slate-400 font-bold select-none mt-1.5 flex justify-end gap-1 items-center">
                  <span>02:40</span>
                  <span className="text-blue-500 font-extrabold flex">✓✓</span>
                </div>
              </div>
            </div>

            {/* Chat reply footer */}
            <div className="bg-[#f0f0f0] p-3 text-xs flex gap-2 border-t shrink-0 items-center justify-between">
              <span className="text-slate-405 text-slate-500 font-medium leading-tight">Simulando redirecionamento...</span>
              <button
                onClick={handleWhatsappConfirm}
                className="px-3.5 py-2 bg-emerald-500 text-white font-bold tracking-wider rounded-xl hover:bg-emerald-600 transition-all font-sans text-xs flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 text-center shrink-0 leading-none"
              >
                Confirmar e Enviar <Check className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
