// Tipos para o checkout
export type ProdutoInfo = {
  nome: string;
  price: number;
  imagemUrl: string;
  sku: string;
  descricao?: string;
};

export type OrderBump = {
  id: string;
  nome: string;
  descricao: string;
  initialPrice: number;
  price: number;
  imagemUrl: string;
  sku: string;
  selecionado?: boolean;
};

export type ProdutoComOrderBumps = {
  produto: ProdutoInfo;
  orderBumps: OrderBump[];
};

export type DadosCliente = {
  nome: string;
  email: string;
  telefone: string;
};

export type MetodoPagamento = 'pix' | 'credit_card';
