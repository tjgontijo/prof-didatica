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
  initialPrice: number; // Preço original do produto
  specialPrice: number; // Preço especial do order bump
  imagemUrl: string;
  sku: string;
  selecionado?: boolean;
  percentDesconto?: number; // Percentual de desconto calculado
  displayOrder?: number | null; // Ordem de exibição (pode ser nulo)
  callToAction?: string; // Texto do botão de ação
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
