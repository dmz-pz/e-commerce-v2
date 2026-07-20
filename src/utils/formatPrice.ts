export const parseAndFormatPrice = (price: any): string => {
  if (price === null || price === undefined || price === "") return "0.00";

  // Si viene como Objeto Decimal de Prisma/decimal.js, intentamos usar .toString() o .toNumber()
  let numericValue: number;

  if (typeof price === "object") {
    numericValue =
      typeof price.toNumber === "function"
        ? price.toNumber()
        : Number(String(price));
  } else {
    numericValue = Number(price);
  }

  return isNaN(numericValue) ? "0.00" : numericValue.toFixed(2);
};
