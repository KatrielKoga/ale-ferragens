export const formatPoints = (points: number) => {
  return Intl.NumberFormat('pt-BR', {
    style: 'decimal',
  }).format(points);
};

export function formatDocument(document: string) {
  if (document.length === 11) {
    return document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return document.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    '$1.$2.$3/$4-$5'
  );
}

export function formatCpfCnpjInput(
  input: string,
  setDocument: (v: string) => void
) {
  const value = addDocMask(input);

  setDocument(value);
}

export function addDocMask(value: string) {
  value = value.replace(/\D/g, '');
  if (value.length <= 11) {
    value = value
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  } else {
    value = value
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return value;
}
