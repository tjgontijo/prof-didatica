export function cleanCPF(cpf: string): string {
  return cpf.replace(/[^\d]+/g, '');
}

export function maskCPF(cpf: string): string {
  // Limpar caracteres não numéricos
  const cleaned = cpf.replace(/\D/g, '');

  // Limitar para no máximo 11 dígitos
  const limited = cleaned.slice(0, 11);

  // Formatar de acordo com o tamanho
  if (limited.length <= 3) {
    return limited;
  } else if (limited.length <= 6) {
    return `${limited.slice(0, 3)}.${limited.slice(3)}`;
  } else if (limited.length <= 9) {
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`;
  } else {
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6, 9)}-${limited.slice(9)}`;
  }
}

export function unMaskCPF(cpf: string): string {
  return cleanCPF(cpf);
}
