"use client";
import { useEffect, useState } from "react";
import { CheckoutData } from "@/types/checkout/checkout";
import { useParams } from "next/navigation";

function Error() {
  return <div style={{ padding: 32, color: 'red', textAlign: 'center' }}>Produto não encontrado.</div>;
}

export default function NewCheckoutPage() {
  const params = useParams();
  const id = params?.id as string;
    const [data, setData] = useState<CheckoutData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/new-checkout/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          setError(true);
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setData(data);
      })
      .catch(() => setError(true));
  }, [id]);

  if (error || !data) return <Error />;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>      
      <pre style={{ background: '#f5f5f5', color: 'black', padding: 16, borderRadius: 8 }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

