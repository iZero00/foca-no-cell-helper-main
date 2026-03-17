function formatMoney(cents: number, currency: string) {
  const amount = cents / 100;
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(amount);
  } catch {
    return `R$ ${amount.toFixed(2)}`;
  }
}

export { formatMoney };

