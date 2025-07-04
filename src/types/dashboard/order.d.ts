import { OrderStatus } from '@prisma/client';

export interface OrderData {
  id: string;
  createdAt: string;
  status: OrderStatus;
  paidAmount: number;
  paidAt?: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  product: {
    id: string;
    name: string;
    price: number;
  };
  items: {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    priceAtTime: number;
    isOrderBump: boolean;
    isUpsell: boolean;
  }[];
  tracking?: {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmTerm?: string;
    utmContent?: string;
  };
}

export interface OrdersTableData {
  orders: OrderData[];
  pagination: {
    totalCount: number;
    pageSize: number;
    page: number;
    totalPages: number;
  };
}

export interface OrdersTableProps {
  data: OrderData[];
  pagination: {
    totalCount: number;
    pageSize: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onFilterChange: (filters: OrderFilters) => void;
}

export interface OrderFilters extends Record<string, unknown> {
  startDate?: string;
  endDate?: string;
  status?: OrderStatus[];
  productId?: string;
  customerId?: string;
  utmSource?: string;
  utmCampaign?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  minAmount?: number;
  maxAmount?: number;
}

export interface StuckOrder {
  id: string;
  createdAt: string;
  status: OrderStatus;
  customer: {
    name: string;
    email: string;
  };
  product: {
    name: string;
  };
  stuckReason: string;
  stuckDuration: string; // Ex: "2 dias"
}

export interface AlertData {
  stuckOrders: StuckOrder[];
  failedWebhooks: {
    id: string;
    event: string;
    sentAt: string;
    statusCode?: number;
    errorMessage?: string;
  }[];
  anomalies: {
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
    detectedAt: string;
  }[];
}