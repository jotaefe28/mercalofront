import React, { useState, useEffect } from 'react';
import { X, Save, CreditCard, AlertCircle, DollarSign, Upload, FileImage, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { accountsService } from '../../services';
import { useNotifications } from '../../hooks';
import type { 
  AccountReceivable, 
  CreateAccountPaymentData,
  PaymentMethod,
  FormState 
} from '../../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: AccountReceivable;
  onPaymentAdded: () => void;
}

interface PaymentFormData {
  payment_method_id: string;
  amount: number;
  payment_date: string;
  reference_number: string;
  notes: string;
  proof_of_payment?: File;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  account,
  onPaymentAdded
}) => {
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const [formState, setFormState] = useState<FormState<PaymentFormData>>({
    data: {
      payment_method_id: '',
      amount: 0,
      payment_date: new Date().toISOString().split('T')[0],
      reference_number: '',
      notes: '',
      proof_of_payment: undefined
    },
    errors: {},
    isSubmitting: false,
    isDirty: false
  });

  const { addNotification } = useNotifications();

  // Payment amount suggestions
  const amountSuggestions = [
    { label: 'Pago Total', value: account.pending_amount, primary: true },
    { label: '50%', value: Math.round(account.pending_amount * 0.5) },
    { label: '25%', value: Math.round(account.pending_amount * 0.25) },
    { label: '10%', value: Math.round(account.pending_amount * 0.1) }
  ].filter(suggestion => suggestion.value > 0);

  useEffect(() => {
    if (isOpen) {
      initializeForm();
    }
  }, [isOpen, account]);

  const initializeForm = () => {
    // Pre-select first active payment method if available
    const defaultPaymentMethod = account.available_payment_methods.find(pm => pm.is_active)?.id || '';
    
    setFormState({
      data: {
        payment_method_id: defaultPaymentMethod,
        amount: account.pending_amount, // Default to full payment
        payment_date: new Date().toISOString().split('T')[0],
        reference_number: '',
        notes: '',
        proof_of_payment: undefined
      },
      errors: {},
      isSubmitting: false,
      isDirty: false
    });
    setPreviewImage(null);
  };

  const updateFormData = (field: keyof PaymentFormData, value: any) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, [field]: value },
      isDirty: true,
      errors: { ...prev.errors, [field]: '' }
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setFormState(prev => ({
        ...prev,
        errors: { ...prev.errors, proof_of_payment: 'Solo se permiten imágenes y archivos PDF' }
      }));
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setFormState(prev => ({
        ...prev,
        errors: { ...prev.errors, proof_of_payment: 'El archivo no puede ser mayor a 5MB' }
      }));
      return;
    }

    updateFormData('proof_of_payment', file);

    // Generate preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const { data } = formState;

    // Payment method validation
    if (!data.payment_method_id) {
      errors.payment_method_id = 'Debe seleccionar un método de pago';
    }

    // Amount validation
    const amountValidation = accountsService.validatePaymentAmount(data.amount, account.pending_amount);
    if (!amountValidation.isValid) {
      errors.amount = amountValidation.error!;
    }

    // Date validation
    if (!data.payment_date) {
      errors.payment_date = 'La fecha de pago es obligatoria';
    } else {
      const paymentDate = new Date(data.payment_date);
      const today = new Date();
      if (paymentDate > today) {
        errors.payment_date = 'La fecha de pago no puede ser futura';
      }
    }

    // Reference number validation for certain payment methods
    const selectedMethod = account.available_payment_methods.find(pm => pm.id === data.payment_method_id);
    if (selectedMethod?.requires_reference && !data.reference_number.trim()) {
      errors.reference_number = 'Este método de pago requiere número de referencia';
    }

    setFormState(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setFormState(prev => ({ ...prev, isSubmitting: true }));
    setLoading(true);

    try {
      const { data } = formState;
      
      const paymentData: CreateAccountPaymentData = {
        account_id: account.id,
        payment_method_id: data.payment_method_id,
        amount: data.amount,
        payment_date: data.payment_date,
        reference_number: data.reference_number || undefined,
        notes: data.notes || undefined,
        proof_of_payment: data.proof_of_payment
      };

      await accountsService.createAccountPayment(paymentData);
      
      addNotification({
        type: 'success',
        title: 'Pago registrado',
        message: 'El pago ha sido registrado correctamente'
      });

      onPaymentAdded();
      onClose();
    } catch (error: any) {
      console.error('Error creating payment:', error);
      
      // Handle validation errors from server
      if (error.response?.data?.errors) {
        const serverErrors: Record<string, string> = {};
        Object.entries(error.response.data.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            serverErrors[field] = messages[0];
          }
        });
        setFormState(prev => ({ ...prev, errors: serverErrors }));
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: error.response?.data?.message || 'No se pudo registrar el pago'
        });
      }
    } finally {
      setLoading(false);
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleClose = () => {
    if (formState.isDirty && !formState.isSubmitting) {
      if (confirm('¿Estás seguro de que deseas cerrar? Los cambios no guardados se perderán.')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleAmountSuggestion = (amount: number) => {
    updateFormData('amount', amount);
  };

  const selectedPaymentMethod = account.available_payment_methods.find(
    pm => pm.id === formState.data.payment_method_id
  );

  // Calculate commission
  const commission = selectedPaymentMethod && selectedPaymentMethod.commission_rate > 0
    ? selectedPaymentMethod.commission_type === 'percentage'
      ? (formState.data.amount * selectedPaymentMethod.commission_rate) / 100
      : selectedPaymentMethod.commission_rate
    : 0;

  const netAmount = formState.data.amount - commission;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <span>Registrar Pago</span>
            </h3>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={formState.isSubmitting}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Account Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Resumen de la Cuenta</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Factura:</span>
                  <span className="ml-2 font-medium">{account.invoice_number}</span>
                </div>
                <div>
                  <span className="text-gray-600">Cliente:</span>
                  <span className="ml-2 font-medium">{account.client_name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total:</span>
                  <span className="ml-2 font-medium">{accountsService.formatCurrency(account.total_amount)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Pendiente:</span>
                  <span className="ml-2 font-medium text-red-600">{accountsService.formatCurrency(account.pending_amount)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de Pago *
              </label>
              <select
                value={formState.data.payment_method_id}
                onChange={(e) => updateFormData('payment_method_id', e.target.value)}
                disabled={formState.isSubmitting}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formState.errors.payment_method_id ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccionar método de pago</option>
                {account.available_payment_methods
                  .filter(pm => pm.is_active)
                  .map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.name}
                      {method.commission_rate > 0 && (
                        ` (Comisión: ${method.commission_rate}${method.commission_type === 'percentage' ? '%' : ' COP'})`
                      )}
                    </option>
                  ))}
              </select>
              {formState.errors.payment_method_id && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {formState.errors.payment_method_id}
                </div>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto del Pago *
              </label>
              
              {/* Amount Suggestions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                {amountSuggestions.map((suggestion) => (
                  <Button
                    key={suggestion.label}
                    type="button"
                    size="sm"
                    variant={suggestion.primary ? "default" : "outline"}
                    onClick={() => handleAmountSuggestion(suggestion.value)}
                    disabled={formState.isSubmitting}
                    className="text-xs"
                  >
                    {suggestion.label}
                    <div className="text-xs opacity-75">
                      {accountsService.formatCurrency(suggestion.value)}
                    </div>
                  </Button>
                ))}
              </div>

              <Input
                type="number"
                value={formState.data.amount}
                onChange={(e) => updateFormData('amount', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
                max={account.pending_amount}
                step="1"
                disabled={formState.isSubmitting}
                className={formState.errors.amount ? 'border-red-300' : ''}
              />
              {formState.errors.amount && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {formState.errors.amount}
                </div>
              )}

              {/* Commission Breakdown */}
              {commission > 0 && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monto del pago:</span>
                      <span className="font-medium">{accountsService.formatCurrency(formState.data.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Comisión:</span>
                      <span className="text-red-600">-{accountsService.formatCurrency(commission)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span className="font-medium">Monto neto:</span>
                      <span className="font-medium">{accountsService.formatCurrency(netAmount)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Pago *
              </label>
              <Input
                type="date"
                value={formState.data.payment_date}
                onChange={(e) => updateFormData('payment_date', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                disabled={formState.isSubmitting}
                className={formState.errors.payment_date ? 'border-red-300' : ''}
              />
              {formState.errors.payment_date && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {formState.errors.payment_date}
                </div>
              )}
            </div>

            {/* Reference Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Referencia
                {selectedPaymentMethod?.requires_reference && <span className="text-red-500"> *</span>}
              </label>
              <Input
                type="text"
                value={formState.data.reference_number}
                onChange={(e) => updateFormData('reference_number', e.target.value)}
                placeholder="Número de transacción, cheque, etc."
                disabled={formState.isSubmitting}
                className={formState.errors.reference_number ? 'border-red-300' : ''}
              />
              {formState.errors.reference_number && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {formState.errors.reference_number}
                </div>
              )}
            </div>

            {/* Proof of Payment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comprobante de Pago
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  {previewImage ? (
                    <div className="mb-4">
                      <img 
                        src={previewImage} 
                        alt="Preview" 
                        className="mx-auto h-32 w-auto rounded-lg shadow-md"
                      />
                    </div>
                  ) : (
                    <FileImage className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>{formState.data.proof_of_payment ? 'Cambiar archivo' : 'Subir comprobante'}</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        disabled={formState.isSubmitting}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF hasta 5MB</p>
                  
                  {formState.data.proof_of_payment && (
                    <p className="text-sm text-green-600 font-medium">
                      {formState.data.proof_of_payment.name}
                    </p>
                  )}
                </div>
              </div>
              {formState.errors.proof_of_payment && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {formState.errors.proof_of_payment}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas (opcional)
              </label>
              <textarea
                value={formState.data.notes}
                onChange={(e) => updateFormData('notes', e.target.value)}
                placeholder="Notas adicionales sobre el pago..."
                disabled={formState.isSubmitting}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={formState.isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={formState.isSubmitting || !formState.isDirty}
              className="flex items-center space-x-2"
            >
              {formState.isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Registrar Pago</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;