type CashRefundNotificationTemplateData = {
  paymentId: number | string;
  reservationNumber: string;
  customerName: string;
  customerEmail: string;
  amount: string | number;
  note?: string;
};

export function buildCashRefundNotificationTemplate(
  data: CashRefundNotificationTemplateData,
) {
  const note = data.note ? `<p><strong>Nota:</strong> ${data.note}</p>` : '';

  return `
    <p>Se registro un reembolso en efectivo o Tarjeta.</p>
    <p><strong>ID de pago:</strong> ${data.paymentId}</p>
    <p><strong>Reserva:</strong> ${data.reservationNumber}</p>
    <p><strong>Cliente:</strong> ${data.customerName} (${data.customerEmail})</p>
    <p><strong>Monto entregado:</strong> ${data.amount}</p>
    ${note}
  `;
}
