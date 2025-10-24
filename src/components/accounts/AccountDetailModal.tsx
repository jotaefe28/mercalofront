import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  CreditCard,
  User,
  Building,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Plus,
  Trash2,
  Edit,
  FileImage,
  ExternalLink
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { accountsService } from '../../services';
import { useNotifications } from '../../hooks';
import type { 
  AccountReceivable,
  InvoiceDetail,
  AccountPayment
} from '../../types';

interface AccountDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: AccountReceivable;
  onPaymentAdded: () => void;
}

const AccountDetailModal: React.FC<AccountDetailModalProps> = ({
  isOpen,
  onClose,
  account,
  onPaymentAdded
}) => {
  const [invoiceDetail, setInvoiceDetail] = useState<InvoiceDetail | null>(null);
  const [payments, setPayments] = useState<AccountPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'invoice' | 'payments' | 'contact'>('invoice');

  const { addNotification } = useNotifications();

  useEffect(() => {
    if (isOpen && account) {
      loadAccountDetails();
    }
  }, [isOpen, account]);

  const loadAccountDetails = async () => {
    try {
      setLoading(true);
      const [invoiceData, paymentsData] = await Promise.all([
        accountsService.getInvoiceDetail(account.invoice_details.id),
        accountsService.getAccountPayments(account.id)
      ]);
      
      setInvoiceDetail(invoiceData);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error loading account details:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar los detalles de la cuenta'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoiceDetail) return;
    
    try {
      setDownloadingPDF(true);
      const blob = await accountsService.generateInvoicePDF(invoiceDetail.id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `factura-${invoiceDetail.invoice_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      addNotification({
        type: 'success',
        title: 'Descarga exitosa',
        message: 'La factura se ha descargado correctamente'
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo descargar la factura'
      });
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleSendEmail = async () => {
    if (!invoiceDetail || !account.client_email) return;
    
    try {
      setSendingEmail(true);
      await accountsService.sendInvoiceEmail(
        invoiceDetail.id, 
        account.client_email,
        `Factura ${invoiceDetail.invoice_number} - ${invoiceDetail.date}`
      );
      
      addNotification({
        type: 'success',
        title: 'Email enviado',
        message: 'La factura ha sido enviada por correo electrónico'
      });
    } catch (error) {
      console.error('Error sending email:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo enviar el email'
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const getPaymentStatusIcon = (status: AccountPayment['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPaymentStatusLabel = (status: AccountPayment['status']) => {
    const labels = {
      completed: 'Completado',
      pending: 'Pendiente',
      failed: 'Fallido',
      cancelled: 'Cancelado'
    };
    return labels[status] || 'Desconocido';
  };

  const getPaymentStatusColor = (status: AccountPayment['status']) => {
    const colors = {
      completed: 'text-green-600 bg-green-50 border-green-200',
      pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      failed: 'text-red-600 bg-red-50 border-red-200',
      cancelled: 'text-gray-600 bg-gray-50 border-gray-200'
    };
    return colors[status] || colors.pending;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Cuenta por Cobrar - {account.invoice_number}
              </h3>
              <p className="text-sm text-gray-600">
                Cliente: {account.client_name} | Total: {accountsService.formatCurrency(account.total_amount)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {account.client_email && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleSendEmail}
                disabled={sendingEmail}
                className="flex items-center space-x-1"
              >
                {sendingEmail ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600" />
                ) : (
                  <Mail className="h-3 w-3" />
                )}
                <span>Enviar Email</span>
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadPDF}
              disabled={downloadingPDF || !invoiceDetail}
              className="flex items-center space-x-1"
            >
              {downloadingPDF ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600" />
              ) : (
                <Download className="h-3 w-3" />
              )}
              <span>Descargar PDF</span>
            </Button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-140px)]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            {/* Account Summary */}
            <Card className="p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-3">Resumen de Cuenta</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium">{accountsService.formatCurrency(account.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pagado:</span>
                  <span className="font-medium text-green-600">{accountsService.formatCurrency(account.paid_amount)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Pendiente:</span>
                  <span className="font-medium text-red-600">{accountsService.formatCurrency(account.pending_amount)}</span>
                </div>
              </div>
              
              <div className={`mt-3 px-2 py-1 rounded-full text-xs font-medium border ${accountsService.getStatusColor(account.status)}`}>
                <div className="flex items-center justify-center space-x-1">
                  {selectedTab === 'invoice' ? (
                    <FileText className="h-3 w-3" />
                  ) : selectedTab === 'payments' ? (
                    <CreditCard className="h-3 w-3" />
                  ) : (
                    <User className="h-3 w-3" />
                  )}
                  <span>{accountsService.getStatusLabel(account.status)}</span>
                </div>
              </div>
            </Card>

            {/* Navigation Tabs */}
            <div className="space-y-1">
              <button
                onClick={() => setSelectedTab('invoice')}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedTab === 'invoice'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Factura</span>
              </button>
              <button
                onClick={() => setSelectedTab('payments')}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedTab === 'payments'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <CreditCard className="h-4 w-4" />
                <span>Pagos ({payments.length})</span>
              </button>
              <button
                onClick={() => setSelectedTab('contact')}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedTab === 'contact'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Contacto</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {/* Invoice Tab */}
                {selectedTab === 'invoice' && invoiceDetail && (
                  <div className="space-y-6">
                    {/* Invoice Header */}
                    <Card className="p-6">
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <Building className="h-4 w-4 mr-2" />
                            Información del Vendedor
                          </h4>
                          <div className="space-y-1 text-sm">
                            <div className="font-medium">{invoiceDetail.seller_info.name}</div>
                            <div className="text-gray-600">{invoiceDetail.seller_info.document}</div>
                            <div className="text-gray-600">{invoiceDetail.seller_info.address}</div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            Información del Comprador
                          </h4>
                          <div className="space-y-1 text-sm">
                            <div className="font-medium">{invoiceDetail.buyer_info.name}</div>
                            <div className="text-gray-600">{invoiceDetail.buyer_info.document}</div>
                            {invoiceDetail.buyer_info.address && (
                              <div className="text-gray-600">{invoiceDetail.buyer_info.address}</div>
                            )}
                            {invoiceDetail.buyer_info.email && (
                              <div className="text-gray-600">{invoiceDetail.buyer_info.email}</div>
                            )}
                            {invoiceDetail.buyer_info.phone && (
                              <div className="text-gray-600">{invoiceDetail.buyer_info.phone}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Invoice Details */}
                    <Card className="p-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Número de Factura</label>
                          <div className="text-lg font-semibold text-gray-900">{invoiceDetail.invoice_number}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Fecha</label>
                          <div className="text-sm text-gray-900">{new Date(invoiceDetail.date).toLocaleDateString('es-ES')}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Vencimiento</label>
                          <div className="text-sm text-gray-900">{new Date(invoiceDetail.due_date).toLocaleDateString('es-ES')}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Términos de Pago</label>
                          <div className="text-sm text-gray-900">{invoiceDetail.payment_terms}</div>
                        </div>
                      </div>

                      {/* Invoice Items */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Productos/Servicios</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Descuento</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Impuesto</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {invoiceDetail.items.map((item) => (
                                <tr key={item.id}>
                                  <td className="px-4 py-2">
                                    <div>
                                      <div className="font-medium text-gray-900">{item.product_name}</div>
                                      {item.product_code && (
                                        <div className="text-sm text-gray-500">{item.product_code}</div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-2 text-right text-sm text-gray-900">{item.quantity}</td>
                                  <td className="px-4 py-2 text-right text-sm text-gray-900">
                                    {accountsService.formatCurrency(item.unit_price)}
                                  </td>
                                  <td className="px-4 py-2 text-right text-sm text-gray-900">
                                    {item.discount_percentage > 0 ? `${item.discount_percentage}%` : '-'}
                                  </td>
                                  <td className="px-4 py-2 text-right text-sm text-gray-900">
                                    {item.tax_percentage > 0 ? `${item.tax_percentage}%` : '-'}
                                  </td>
                                  <td className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                                    {accountsService.formatCurrency(item.total)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Totals */}
                        <div className="mt-6 flex justify-end">
                          <div className="w-64 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Subtotal:</span>
                              <span className="font-medium">{accountsService.formatCurrency(invoiceDetail.subtotal)}</span>
                            </div>
                            {invoiceDetail.discount_amount > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Descuento:</span>
                                <span className="font-medium text-red-600">-{accountsService.formatCurrency(invoiceDetail.discount_amount)}</span>
                              </div>
                            )}
                            {invoiceDetail.tax_amount > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Impuestos:</span>
                                <span className="font-medium">{accountsService.formatCurrency(invoiceDetail.tax_amount)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-lg font-bold border-t pt-2">
                              <span>Total:</span>
                              <span>{accountsService.formatCurrency(invoiceDetail.total_amount)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {invoiceDetail.notes && (
                        <div className="mt-6 pt-6 border-t">
                          <h4 className="font-semibold text-gray-900 mb-2">Notas</h4>
                          <p className="text-sm text-gray-600">{invoiceDetail.notes}</p>
                        </div>
                      )}
                    </Card>
                  </div>
                )}

                {/* Payments Tab */}
                {selectedTab === 'payments' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900">
                        Historial de Pagos ({payments.length})
                      </h4>
                      {account.status !== 'paid' && account.status !== 'cancelled' && (
                        <Button
                          onClick={onPaymentAdded}
                          className="flex items-center space-x-2"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Nuevo Pago</span>
                        </Button>
                      )}
                    </div>

                    {payments.length > 0 ? (
                      <div className="space-y-4">
                        {payments.map((payment) => (
                          <Card key={payment.id} className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className={`p-2 rounded-full ${getPaymentStatusColor(payment.status).split(' ')[1]}`}>
                                  {getPaymentStatusIcon(payment.status)}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {accountsService.formatCurrency(payment.amount)}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {payment.payment_method_name} • {new Date(payment.payment_date).toLocaleDateString('es-ES')}
                                  </div>
                                  {payment.reference_number && (
                                    <div className="text-xs text-gray-500">
                                      Ref: {payment.reference_number}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(payment.status)}`}>
                                  {getPaymentStatusLabel(payment.status)}
                                </div>
                                {payment.proof_of_payment && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(payment.proof_of_payment, '_blank')}
                                    className="flex items-center space-x-1"
                                  >
                                    <FileImage className="h-3 w-3" />
                                    <span>Comprobante</span>
                                  </Button>
                                )}
                              </div>
                            </div>
                            {payment.notes && (
                              <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                {payment.notes}
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="p-8 text-center">
                        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No hay pagos registrados
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Aún no se han registrado pagos para esta cuenta.
                        </p>
                        {account.status !== 'paid' && account.status !== 'cancelled' && (
                          <Button onClick={onPaymentAdded}>
                            Registrar Primer Pago
                          </Button>
                        )}
                      </Card>
                    )}
                  </div>
                )}

                {/* Contact Tab */}
                {selectedTab === 'contact' && (
                  <div className="space-y-6">
                    <Card className="p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h4>
                      
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <User className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">{account.client_name}</div>
                            <div className="text-sm text-gray-600">{account.client_document}</div>
                          </div>
                        </div>

                        {account.client_email && (
                          <div className="flex items-center space-x-3">
                            <Mail className="h-5 w-5 text-gray-400" />
                            <div>
                              <div className="font-medium text-gray-900">{account.client_email}</div>
                              <div className="text-sm text-gray-600">Correo electrónico</div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleSendEmail}
                              disabled={sendingEmail}
                              className="ml-auto"
                            >
                              Enviar Factura
                            </Button>
                          </div>
                        )}

                        {account.client_phone && (
                          <div className="flex items-center space-x-3">
                            <Phone className="h-5 w-5 text-gray-400" />
                            <div>
                              <div className="font-medium text-gray-900">{account.client_phone}</div>
                              <div className="text-sm text-gray-600">Teléfono</div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {new Date(account.due_date).toLocaleDateString('es-ES')}
                            </div>
                            <div className="text-sm text-gray-600">Fecha de vencimiento</div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <DollarSign className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">{account.payment_terms}</div>
                            <div className="text-sm text-gray-600">Términos de pago</div>
                          </div>
                        </div>

                        {account.notes && (
                          <div className="pt-4 border-t">
                            <h5 className="font-medium text-gray-900 mb-2">Notas de la Cuenta</h5>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{account.notes}</p>
                          </div>
                        )}
                      </div>
                    </Card>

                    {/* Available Payment Methods */}
                    <Card className="p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Métodos de Pago Disponibles</h4>
                      
                      {account.available_payment_methods.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {account.available_payment_methods.map((method) => (
                            <div
                              key={method.id}
                              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <CreditCard className="h-5 w-5 text-gray-400" />
                                <div>
                                  <div className="font-medium text-gray-900">{method.name}</div>
                                  <div className="text-sm text-gray-600">
                                    {method.commission_rate > 0 && (
                                      <span>
                                        Comisión: {method.commission_rate}
                                        {method.commission_type === 'percentage' ? '%' : ' COP'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {method.is_active && (
                                <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                  Activo
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600">No hay métodos de pago configurados.</p>
                      )}
                    </Card>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetailModal;