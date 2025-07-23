export const formatPoints = (points: number) => {
  return Intl.NumberFormat('pt-BR', {
    style: 'decimal',
  }).format(points);
};
