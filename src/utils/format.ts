export const formatQuantity = (quantity: number): string => {
  const rounded = Math.round(quantity * 4) / 4; // Round to nearest 0.25
  const intPart = Math.floor(rounded);
  const fracPart = rounded - intPart;

  if (fracPart === 0) return intPart.toString();
  if (fracPart === 0.25) return `${intPart > 0 ? intPart + ' ' : ''}¼`;
  if (fracPart === 0.5) return `${intPart > 0 ? intPart + ' ' : ''}½`;
  if (fracPart === 0.75) return `${intPart > 0 ? intPart + ' ' : ''}¾`;
  
  return rounded.toFixed(1);
};
