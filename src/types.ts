/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  category: "Cadernos" | "Apostilas" | "Canecas" | "Planners" | "Outros";
  price: number;
  stock: number;
  salesCount: number;
  imageColor: string; // Tailwind background color class like 'bg-indigo-500' representation
  customizableFields: string[];
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  status: "Pago" | "Produção" | "Enviado" | "Entregue" | "Cancelado";
  date: string; // PT-BR format
  customNote?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
  joinDate: string;
  location: string;
}

export interface Promotion {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  value: number;
  minPurchase: number;
  usageCount: number;
  maxUses: number;
  status: "Ativo" | "Inativo";
  expiryDate: string;
}

export interface StoreConfig {
  storeName: string;
  cnpj: string;
  email: string;
  phone: string;
  leadTimeDays: number;
  freeShippingThreshold: number;
}

export interface StoreTheme {
  id: string;
  name: string;
  primary: string;
  gradientFrom: string;
  gradientTo: string;
  accent: string;
  accentHover: string;
}
