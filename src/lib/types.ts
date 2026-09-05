// ── Shared domain types (mirrors the backend) ─────────────────────────────────
// Keep in sync with backend/src/lib/types.ts

export type Unit = "CM" | "INCH";
export type Role = "ADMIN" | "STAFF";
export type OrderStatus = "IN_PROGRESS" | "COMPLETED" | "DELIVERED" | "CANCELLED";
export type PaymentStatus = "PAID" | "PARTIAL" | "PENDING";
export type PaymentMethod = "CASH" | "UPI" | "CARD" | "OTHER";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface ClientRow {
  id: string;
  fullName: string;
  mobile: string;
  email: string | null;
  createdAt: string; // ISO string from JSON
  orderCount: number;
  duePaise: number;
}

export interface ClientListResult {
  clients: ClientRow[];
  total: number;
  page: number;
  pages: number;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalPaise: number;
  paidPaise: number;
  duePaise: number;
  expectedDelivery: string | null;
  notes: string | null;
  createdAt: string;
  items: {
    id: string;
    garmentType: string;
    description: string | null;
    quantity: number;
    unitPricePaise: number;
  }[];
  payments: {
    id: string;
    amountPaise: number;
    method: PaymentMethod;
    note: string | null;
    paidAt: string;
  }[];
}

export interface ClientDetail {
  id: string;
  fullName: string;
  mobile: string;
  fatherOrHusband: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  generalMeasurement: { unit: Unit; height: number | null } | null;
  shirtMeasurement: {
    unit: Unit;
    chest: number | null;
    waist: number | null;
    shoulderWidth: number | null;
    sleeveLength: number | null;
    shirtLength: number | null;
    neck: number | null;
    cuff: number | null;
  } | null;
  pantMeasurement: {
    unit: Unit;
    waist: number | null;
    hip: number | null;
    thigh: number | null;
    knee: number | null;
    bottomOpening: number | null;
    inseam: number | null;
  } | null;
  orders: OrderDetail[];
}

export interface DashboardStats {
  totalClients: number;
  ordersInProgress: number;
  pendingAmountPaise: number;
  collectedThisMonthPaise: number;
}

export interface UpcomingDelivery {
  orderId: string;
  orderNumber: string;
  clientId: string;
  clientName: string;
  clientMobile: string;
  garmentTypes: string[];
  expectedDelivery: string;
  totalPaise: number;
  duePaise: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
}

// ── Request payload types ──────────────────────────────────────────────────────

export interface MeasurementsInput {
  unit: Unit;
  general: { height?: number | string };
  shirt: {
    chest?: number | string;
    waist?: number | string;
    shoulderWidth?: number | string;
    sleeveLength?: number | string;
    shirtLength?: number | string;
    neck?: number | string;
    cuff?: number | string;
  };
  pant: {
    waist?: number | string;
    hip?: number | string;
    thigh?: number | string;
    knee?: number | string;
    bottomOpening?: number | string;
    inseam?: number | string;
  };
}

export interface OrderItemInput {
  garmentType: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateClientInput {
  profile: {
    fullName: string;
    mobile: string;
    fatherOrHusband: string;
    email: string;
    address: string;
    notes: string;
  };
  measurements: MeasurementsInput;
  order: {
    items: OrderItemInput[];
    expectedDelivery: string;
    advance: number;
    paymentMethod: string;
  };
}

export interface UpdateClientInput {
  profile: {
    fullName: string;
    mobile: string;
    fatherOrHusband: string;
    email: string;
    address: string;
    notes: string;
  };
  measurements: MeasurementsInput;
}

export interface RecordPaymentInput {
  amount: number;
  method: PaymentMethod;
  note: string;
}
