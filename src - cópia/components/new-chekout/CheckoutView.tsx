import type { CheckoutData } from "@/types/checkout";

export default function CheckoutView({ data }: { data: CheckoutData }) {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>
      <h1 style={{ textAlign: 'center', marginBottom: 32 }}>Finalize sua Compra</h1>
      
      <div>
        <h2>Resumo do Pedido</h2>
        <p>Produto: {data.product.name}</p>
        <p>Preço: R$ {data.product.price}</p>
      </div>

      {/* Aqui entrarão os outros componentes (formulário, pagamento, etc) */}

    </div>
  );
}