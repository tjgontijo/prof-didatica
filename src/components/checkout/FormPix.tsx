'use client';

export default function FormPix() {
  return (
    <div className="space-y-4">
      {/* Aprovação imediata */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Aprovação imediata</h3>
            <p className="text-sm text-gray-600">
              O pagamento com Pix leva poucos minutos para ser processado.
            </p>
          </div>
        </div>
      </div>

      {/* Transação segura */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Transação segura</h3>
            <p className="text-sm text-gray-600">
              O Pix foi desenvolvido pelo Banco Central para facilitar suas compras, garantindo a
              proteção dos seus dados.
            </p>
          </div>
        </div>
      </div>

      {/* Finalização fácil */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Finalize sua compra com facilidade</h3>
            <p className="text-sm text-gray-600">
              É só acessar o app do seu banco, escanear o QR code ou digitar o código.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
