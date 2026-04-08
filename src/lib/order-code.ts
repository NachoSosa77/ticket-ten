const ORDER_CODE_PREFIX = "TT";

export function generateOrderCode(): string {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  const timestamp = Date.now().toString(36).slice(-6).toUpperCase();

  return `${ORDER_CODE_PREFIX}-${timestamp}-${random}`;
}
