export const parseAndFormatPrice = (price: unknown): string => {
  if (price === null || price === undefined || price === "") return "0.00";

  // Si viene como Objeto Decimal de Prisma/decimal.js, intentamos usar .toString() o .toNumber()
  let numericValue: number;

  if (typeof price === 'object' && price !== null && 'toNumber' in price) {
    numericValue = (price as { toNumber: () => number }).toNumber();
  } else {
    numericValue = Number(price);
  }

  return isNaN(numericValue) ? "0.00" : numericValue.toFixed(2);
};
