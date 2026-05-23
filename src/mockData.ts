/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Order, Customer, Promotion, StoreConfig, StoreTheme } from "./types";

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "P001",
    name: "Caderno Personalizado Capa Dura",
    description: "Caderno artesanal premium com capa rígida laminada fosca, espiral wire-o cor cobre e folhas internas personalizadas em papel polén 80g.",
    category: "Cadernos",
    price: 49.90,
    stock: 156,
    salesCount: 112,
    imageColor: "from-violet-500 to-indigo-600",
    customizableFields: ["Nome na Capa", "Frase Inspiradora", "Cor do Elástico", "Layout das Páginas"]
  },
  {
    id: "P002",
    name: "Apostila de Alfabetização Ilustrativa",
    description: "Material lúdico completo estruturado com atividades sensoriais, coordenação motora fina e coloridos ricos para crianças na fase inicial escolar.",
    category: "Apostilas",
    price: 35.00,
    stock: 89,
    salesCount: 48,
    imageColor: "from-blue-500 to-cyan-500",
    customizableFields: ["Nome do Aluno", "Nome da Professora", "Série/Vogal Inicial"]
  },
  {
    id: "P003",
    name: "Caneca de Cerâmica Alto Brilho",
    description: "Caneca branca importada resinada para alta fidelidade de cores em termo-transferência de imagens ou escritas decorativas.",
    category: "Canecas",
    price: 42.50,
    stock: 200,
    salesCount: 88,
    imageColor: "from-pink-500 to-rose-500",
    customizableFields: ["Imagem/Foto Principal", "Texto Posterior", "Cor Interna (Preto/Rosa/Branco)"]
  },
  {
    id: "P004",
    name: "Planner Diário Espiral Executivo",
    description: "Planejamento organizacional detalhado contendo visão mensal, metas financeiras semanais e controle de hábitos com adesivos inclusos.",
    category: "Planners",
    price: 79.90,
    stock: 42,
    salesCount: 75,
    imageColor: "from-emerald-500 to-teal-600",
    customizableFields: ["Nome Gravado em Hotstamping Dourado", "Visão Semanal (Horizontal/Vertical)"]
  },
  {
    id: "P005",
    name: "Agenda Diária Couro Sintético",
    description: "Agenda estilosa com fita de cetim marcadora, cantoneiras arredondadas e acabamento refinado para compromissos corporativos diários.",
    category: "Planners",
    price: 64.90,
    stock: 18,
    salesCount: 90,
    imageColor: "from-amber-500 to-orange-600",
    customizableFields: ["Gravação de Logotipo da Marca", "Ano (2026/2027)"]
  },
  {
    id: "P006",
    name: "Apostila Vestibular Intensivo",
    description: "Material preparatório com resumos conceituais e mais de 150 questões resolvidas das bancas mais concorridas do vestibular nacional.",
    category: "Apostilas",
    price: 55.00,
    stock: 120,
    salesCount: 22,
    imageColor: "from-violet-600 to-fuchsia-600",
    customizableFields: ["Inclusão de Gabarito Impresso", "Dedicatória na Introdução"]
  },
  {
    id: "P007",
    name: "Caneca Alça Formato de Coração",
    description: "Perfeita para comemorações românticas ou datas comemorativas familiares. Resiste a micro-ondas inteiramente resinada.",
    category: "Canecas",
    price: 48.00,
    stock: 64,
    salesCount: 60,
    imageColor: "from-red-500 to-rose-600",
    customizableFields: ["Duas Fotos para Montagem", "Frase Romântica Decorativa"]
  },
  {
    id: "P008",
    name: "Copo Térmico Inox Parede Dupla",
    description: "Copo premium com isolamento vedado a vácuo de altíssima vedação. Livre de BPA, preserva gelo por horas.",
    category: "Outros",
    price: 95.00,
    stock: 23,
    salesCount: 55,
    imageColor: "from-slate-600 to-stone-700",
    customizableFields: ["Nome Gravado a Laser", "Ícone de Profissão (Medicina/Direito, etc)"]
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "ORD-2041",
    customerName: "Maria Silva",
    customerEmail: "maria.silva@email.com",
    productName: "Caderno Personalizado Capa Dura",
    productId: "P001",
    quantity: 1,
    totalPrice: 49.90,
    status: "Pago",
    date: "22/05/2026",
    customNote: "Gravar nome na capa: 'Maria Silva' em fonte cursiva romântica. Elástico cor rosa chá."
  },
  {
    id: "ORD-2042",
    customerName: "João Pedro",
    customerEmail: "joao.p@email.com",
    productName: "Apostila de Alfabetização Ilustrativa",
    productId: "P002",
    quantity: 2,
    totalPrice: 70.00,
    status: "Produção",
    date: "22/05/2026",
    customNote: "Nome do Aluno: 'João Pedro da Silva' (Jardim I). Capa com estampa de astronautas."
  },
  {
    id: "ORD-2043",
    customerName: "Ana Clara",
    customerEmail: "ana.clara@email.com",
    productName: "Caneca de Cerâmica Alto Brilho",
    productId: "P003",
    quantity: 1,
    totalPrice: 42.50,
    status: "Enviado",
    date: "21/05/2026",
    customNote: "Inclusão de estampa tema dia dos professores: 'Melhor Professora Ana Clara'. Caneca c/ interior preto."
  },
  {
    id: "ORD-2044",
    customerName: "Carlos Eduardo",
    customerEmail: "carlos.edu@email.com",
    productName: "Planner Diário Espiral Executivo",
    productId: "P004",
    quantity: 1,
    totalPrice: 79.90,
    status: "Entregue",
    date: "18/05/2026",
    customNote: "Gravação Hotstamping dourado: 'C.E.B. 2026'. Miolo formato vertical."
  },
  {
    id: "ORD-2045",
    customerName: "Beatriz Santos",
    customerEmail: "beatriz.s@email.com",
    productName: "Caneca Alça Formato de Coração",
    productId: "P007",
    quantity: 2,
    totalPrice: 96.00,
    status: "Pago",
    date: "23/05/2026",
    customNote: "Enviar montagem de namoro com as fotos anexadas. Data: 12/06/2018."
  },
  {
    id: "ORD-2046",
    customerName: "Lucas Andrade",
    customerEmail: "lucas.andrade@email.com",
    productName: "Copo Térmico Inox Parede Dupla",
    productId: "P008",
    quantity: 1,
    totalPrice: 95.00,
    status: "Cancelado",
    date: "15/05/2026",
    customNote: "Gravar nome na lateral: 'Eng. Lucas' com ícone de engrenagem abaixo."
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "CLI-481",
    name: "Maria Silva",
    email: "maria.silva@email.com",
    phone: "(11) 98765-4321",
    ordersCount: 3,
    totalSpent: 198.50,
    joinDate: "10/01/2026",
    location: "São Paulo - SP"
  },
  {
    id: "CLI-482",
    name: "João Pedro",
    email: "joao.p@email.com",
    phone: "(21) 99876-5432",
    ordersCount: 1,
    totalSpent: 70.00,
    joinDate: "15/02/2026",
    location: "Rio de Janeiro - RJ"
  },
  {
    id: "CLI-483",
    name: "Ana Clara",
    email: "ana.clara@email.com",
    phone: "(31) 98877-6655",
    ordersCount: 2,
    totalSpent: 125.00,
    joinDate: "01/03/2026",
    location: "Belo Horizonte - MG"
  },
  {
    id: "CLI-484",
    name: "Carlos Eduardo",
    email: "carlos.edu@email.com",
    phone: "(51) 97766-5544",
    ordersCount: 5,
    totalSpent: 479.90,
    joinDate: "20/11/2025",
    location: "Porto Alegre - RS"
  },
  {
    id: "CLI-485",
    name: "Beatriz Santos",
    email: "beatriz.s@email.com",
    phone: "(19) 99654-3210",
    ordersCount: 1,
    totalSpent: 96.00,
    joinDate: "12/04/2026",
    location: "Campinas - SP"
  }
];

export const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: "PRM-101",
    code: "BEMVINDO10",
    discountType: "percentage",
    value: 10,
    minPurchase: 50.00,
    usageCount: 145,
    maxUses: 500,
    status: "Ativo",
    expiryDate: "31/12/2026"
  },
  {
    id: "PRM-102",
    code: "CUPOMCANELAS15",
    discountType: "fixed",
    value: 15.00,
    minPurchase: 80.00,
    usageCount: 42,
    maxUses: 100,
    status: "Ativo",
    expiryDate: "30/06/2026"
  },
  {
    id: "PRM-103",
    code: "FRETEGRATIS",
    discountType: "percentage", // acts as free shipping placeholder
    value: 0,
    minPurchase: 150.00,
    usageCount: 288,
    maxUses: 1000,
    status: "Ativo",
    expiryDate: "15/09/2026"
  },
  {
    id: "PRM-104",
    code: "DIADASMAES15",
    discountType: "percentage",
    value: 15,
    minPurchase: 60.00,
    usageCount: 80,
    maxUses: 80,
    status: "Inativo",
    expiryDate: "14/05/2026"
  }
];

export const INITIAL_STORE_CONFIG: StoreConfig = {
  storeName: "ID Personalizados",
  cnpj: "12.345.678/0001-90",
  email: "contato@idpersonalizados.com.br",
  phone: "(11) 4002-8922",
  leadTimeDays: 5,
  freeShippingThreshold: 150.00
};

export const THEME_PRESETS: StoreTheme[] = [
  {
    id: "purple-gradient",
    name: "Cores da Marca (Roxo/Azul)",
    primary: "#6A11CB",
    gradientFrom: "from-[#6A11CB]",
    gradientTo: "to-[#2575FC]",
    accent: "bg-[#6A11CB] hover:bg-[#520da3] text-white",
    accentHover: "hover:bg-purple-50 text-[#6A11CB]"
  },
  {
    id: "cozy-rose",
    name: "Artesanal Luxuoso (Rosa/Arco)",
    primary: "#e11d48",
    gradientFrom: "from-rose-600",
    gradientTo: "to-amber-500",
    accent: "bg-rose-600 hover:bg-rose-700 text-white",
    accentHover: "hover:bg-rose-50 text-rose-600"
  },
  {
    id: "emerald-luxury",
    name: "Verde Botânico (Verde/Teal)",
    primary: "#0d9488",
    gradientFrom: "from-teal-600",
    gradientTo: "to-emerald-500",
    accent: "bg-teal-600 hover:bg-teal-700 text-white",
    accentHover: "hover:bg-teal-50 text-teal-600"
  },
  {
    id: "minimal-slate",
    name: "Slate Moderno (Fosco/Preto)",
    primary: "#334155",
    gradientFrom: "from-slate-700",
    gradientTo: "to-slate-900",
    accent: "bg-slate-700 hover:bg-slate-800 text-white",
    accentHover: "hover:bg-slate-50 text-slate-700"
  }
];
