// Tipos para o checkout
export type ProdutoInfo = {
  id: string;
  name: string;
  price: number;
  imagemUrl: string;
  description?: string;
  category?: string; // Categoria do produto para eventos de rastreamento
};

export type OrderBump = {
  id: string;
  productId: string; // ID do produto associado ao order bump
  name: string;
  description: string;
  initialPrice: number;
  specialPrice: number;
  imagemUrl: string;
  selected: boolean;
  percentDiscont?: number;
  displayOrder?: number | null;
};

export type ProdutoComOrderBumps = {
  produto: ProdutoInfo;
  orderBumps: OrderBump[];
};

export type DadosCliente = {
  name: string;
  email: string;
  whatsapp: string;
};

export type MetodoPagamento = 'pix' | 'credit_card';
