export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function formatBrazilianPhone(phone: string): string {
  // Limpar caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '');

  // Limitar para no máximo 11 dígitos
  const limited = cleaned.slice(0, 11);

  // Formatar de acordo com o tamanho
  if (limited.length <= 2) {
    return limited;
  } else if (limited.length <= 6) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
  } else if (limited.length <= 10) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`;
  } else {
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
  }
}

export function validateBrazilianPhone(phone: string): boolean {
  const cleaned = cleanPhone(phone);

  // Verifica se tem 10 ou 11 dígitos (telefone fixo ou celular com DDD)
  return cleaned.length === 10 || cleaned.length === 11;
}
