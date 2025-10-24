import React, { useState, useEffect } from 'react';
import { X, Save, CreditCard, AlertCircle, DollarSign, Percent, Settings } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { companyService } from '../../services';
import { useNotifications } from '../../hooks';
import type { 
  PaymentMethod, 
  CreatePaymentMethodData, 
  UpdatePaymentMethodData,
  PaymentMethodSettings,
  BankAccount,
  FormState 
} from '../../types';

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethod?: PaymentMethod | null;
  onSave: () => void;
}

interface PaymentMethodFormData {
  name: string;
  type: 'cash' | 'card' | 'transfer' | 'digital_wallet' | 'check' | 'credit' | 'other';
  description: string;
  is_active: boolean;
  requires_reference: boolean;
  commission_rate: number;
  commission_type: 'percentage' | 'fixed';
  minimum_amount: number;
  maximum_amount: number;
  // Settings
  card_types: ('visa' | 'mastercard' | 'amex' | 'dinners' | 'discover')[];
  wallet_type: 'nequi' | 'daviplata' | 'bancolombia' | 'other';
  wallet_account_number: string;
  wallet_qr_code: string;
  requires_approval: boolean;
  auto_reconciliation: boolean;
  // Bank accounts
  bank_accounts: BankAccount[];
}

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  isOpen,
  onClose,
  paymentMethod,
  onSave
}) => {
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [formState, setFormState] = useState<FormState<PaymentMethodFormData>>({
    data: {
      name: '',
      type: 'cash',
      description: '',
      is_active: true,
      requires_reference: false,
      commission_rate: 0,
      commission_type: 'percentage',
      minimum_amount: 0,
      maximum_amount: 0,
      card_types: [],
      wallet_type: 'nequi',
      wallet_account_number: '',
      wallet_qr_code: '',
      requires_approval: false,
      auto_reconciliation: true,
      bank_accounts: []
    },
    errors: {},
    isSubmitting: false,
    isDirty: false
  });

  const { addNotification } = useNotifications();

  // Payment method types with descriptions
  const paymentTypes = [
    { value: 'cash', label: 'Efectivo', description: 'Pagos en efectivo', icon: '💵' },
    { value: 'card', label: 'Tarjeta', description: 'Tarjetas de crédito/débito', icon: '💳' },
    { value: 'transfer', label: 'Transferencia', description: 'Transferencias bancarias', icon: '🏦' },
    { value: 'digital_wallet', label: 'Billetera Digital', description: 'Nequi, Daviplata, etc.', icon: '📱' },
    { value: 'check', label: 'Cheque', description: 'Pagos con cheque', icon: '📄' },
    { value: 'credit', label: 'Crédito', description: 'Ventas a crédito', icon: '🏪' },
    { value: 'other', label: 'Otro', description: 'Otros métodos de pago', icon: '❓' }
  ];

  const cardTypes = [
    { value: 'visa', label: 'Visa' },
    { value: 'mastercard', label: 'Mastercard' },
    { value: 'amex', label: 'American Express' },
    { value: 'dinners', label: 'Diners Club' },
    { value: 'discover', label: 'Discover' }
  ];

  const walletTypes = [
    { value: 'nequi', label: 'Nequi' },
    { value: 'daviplata', label: 'Daviplata' },
    { value: 'bancolombia', label: 'Bancolombia a la Mano' },
    { value: 'other', label: 'Otro' }
  ];

  useEffect(() => {
    if (isOpen) {
      initializeForm();
    }
  }, [isOpen, paymentMethod]);

  const initializeForm = () => {
    if (paymentMethod) {
      // Edit mode
      setFormState({
        data: {
          name: paymentMethod.name,
          type: paymentMethod.type,
          description: paymentMethod.description || '',
          is_active: paymentMethod.is_active,
          requires_reference: paymentMethod.requires_reference,
          commission_rate: paymentMethod.commission_rate,
          commission_type: paymentMethod.commission_type,
          minimum_amount: paymentMethod.minimum_amount || 0,
          maximum_amount: paymentMethod.maximum_amount || 0,
          card_types: paymentMethod.settings?.card_types || [],
          wallet_type: paymentMethod.settings?.digital_wallet_info?.wallet_type || 'nequi',
          wallet_account_number: paymentMethod.settings?.digital_wallet_info?.account_number || '',
          wallet_qr_code: paymentMethod.settings?.digital_wallet_info?.qr_code || '',
          requires_approval: paymentMethod.settings?.requires_approval || false,
          auto_reconciliation: paymentMethod.settings?.auto_reconciliation || true,
          bank_accounts: paymentMethod.settings?.bank_accounts || []
        },
        errors: {},
        isSubmitting: false,
        isDirty: false
      });
      setShowAdvanced(
        (paymentMethod.settings?.card_types?.length ?? 0) > 0 ||
        !!paymentMethod.settings?.digital_wallet_info ||
        (paymentMethod.settings?.bank_accounts?.length ?? 0) > 0
      );
    } else {
      // Create mode
      setFormState({
        data: {
          name: '',
          type: 'cash',
          description: '',
          is_active: true,
          requires_reference: false,
          commission_rate: 0,
          commission_type: 'percentage',
          minimum_amount: 0,
          maximum_amount: 0,
          card_types: [],
          wallet_type: 'nequi',
          wallet_account_number: '',
          wallet_qr_code: '',
          requires_approval: false,
          auto_reconciliation: true,
          bank_accounts: []
        },
        errors: {},
        isSubmitting: false,
        isDirty: false
      });
      setShowAdvanced(false);
    }
  };

  const updateFormData = (field: keyof PaymentMethodFormData, value: any) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, [field]: value },
      isDirty: true,
      errors: { ...prev.errors, [field]: '' }
    }));
  };

  const toggleCardType = (cardType: string) => {
    const currentTypes = formState.data.card_types;
    const newTypes = currentTypes.includes(cardType as any)
      ? currentTypes.filter(type => type !== cardType)
      : [...currentTypes, cardType as any];
    
    updateFormData('card_types', newTypes);
  };

  const addBankAccount = () => {
    const newAccount: BankAccount = {
      id: Date.now().toString(),
      bank_name: '',
      account_type: 'checking',
      account_number: '',
      account_holder: '',
      is_primary: formState.data.bank_accounts.length === 0
    };
    
    updateFormData('bank_accounts', [...formState.data.bank_accounts, newAccount]);
  };

  const updateBankAccount = (index: number, field: keyof BankAccount, value: any) => {
    const updatedAccounts = formState.data.bank_accounts.map((account, i) => 
      i === index ? { ...account, [field]: value } : account
    );
    updateFormData('bank_accounts', updatedAccounts);
  };

  const removeBankAccount = (index: number) => {
    const updatedAccounts = formState.data.bank_accounts.filter((_, i) => i !== index);
    updateFormData('bank_accounts', updatedAccounts);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const { data } = formState;

    // Name validation
    if (!data.name.trim()) {
      errors.name = 'El nombre del método de pago es obligatorio';
    } else if (data.name.trim().length < 2) {
      errors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    // Commission rate validation
    if (data.commission_rate < 0) {
      errors.commission_rate = 'La comisión no puede ser negativa';
    }

    if (data.commission_type === 'percentage' && data.commission_rate > 100) {
      errors.commission_rate = 'El porcentaje de comisión no puede ser mayor a 100%';
    }

    // Amount validation
    if (data.minimum_amount < 0) {
      errors.minimum_amount = 'El monto mínimo no puede ser negativo';
    }

    if (data.maximum_amount > 0 && data.maximum_amount < data.minimum_amount) {
      errors.maximum_amount = 'El monto máximo debe ser mayor al mínimo';
    }

    // Digital wallet validation
    if (data.type === 'digital_wallet' && showAdvanced) {
      if (!data.wallet_account_number.trim()) {
        errors.wallet_account_number = 'El número de cuenta es obligatorio para billeteras digitales';
      }
    }

    // Bank accounts validation
    if (data.type === 'transfer' && showAdvanced && data.bank_accounts.length > 0) {
      data.bank_accounts.forEach((account, index) => {
        if (!account.bank_name.trim()) {
          errors[`bank_account_${index}_name`] = `El nombre del banco es obligatorio`;
        }
        if (!account.account_number.trim()) {
          errors[`bank_account_${index}_number`] = `El número de cuenta es obligatorio`;
        }
        if (!account.account_holder.trim()) {
          errors[`bank_account_${index}_holder`] = `El titular de la cuenta es obligatorio`;
        }
      });
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
      
      // Build settings object
      const settings: Partial<PaymentMethodSettings> = {};
      
      if (data.type === 'card' && data.card_types.length > 0) {
        settings.card_types = data.card_types;
      }
      
      if (data.type === 'digital_wallet' && (data.wallet_account_number || data.wallet_qr_code)) {
        settings.digital_wallet_info = {
          wallet_type: data.wallet_type,
          account_number: data.wallet_account_number || undefined,
          qr_code: data.wallet_qr_code || undefined
        };
      }
      
      if (data.type === 'transfer' && data.bank_accounts.length > 0) {
        settings.bank_accounts = data.bank_accounts;
      }
      
      settings.requires_approval = data.requires_approval;
      settings.auto_reconciliation = data.auto_reconciliation;

      if (paymentMethod) {
        // Update existing payment method
        const updateData: UpdatePaymentMethodData = {
          name: data.name,
          type: data.type,
          description: data.description || undefined,
          is_active: data.is_active,
          requires_reference: data.requires_reference,
          commission_rate: data.commission_rate,
          commission_type: data.commission_type,
          minimum_amount: data.minimum_amount || undefined,
          maximum_amount: data.maximum_amount || undefined,
          settings: Object.keys(settings).length > 0 ? settings : undefined
        };

        await companyService.updatePaymentMethod(paymentMethod.id, updateData);
        
        addNotification({
          type: 'success',
          title: 'Método de pago actualizado',
          message: 'El método de pago ha sido actualizado correctamente'
        });
      } else {
        // Create new payment method
        const createData: CreatePaymentMethodData = {
          name: data.name,
          type: data.type,
          description: data.description || undefined,
          is_active: data.is_active,
          requires_reference: data.requires_reference,
          commission_rate: data.commission_rate,
          commission_type: data.commission_type,
          minimum_amount: data.minimum_amount || undefined,
          maximum_amount: data.maximum_amount || undefined,
          settings: Object.keys(settings).length > 0 ? settings : undefined
        };

        await companyService.createPaymentMethod(createData);
        
        addNotification({
          type: 'success',
          title: 'Método de pago creado',
          message: 'El método de pago ha sido creado correctamente'
        });
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving payment method:', error);
      
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
          message: error.response?.data?.message || 'No se pudo guardar el método de pago'
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

  if (!isOpen) return null;

  const selectedPaymentType = paymentTypes.find(pt => pt.value === formState.data.type);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <span>{paymentMethod ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}</span>
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
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Método de Pago *
                </label>
                <Input
                  type="text"
                  value={formState.data.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="Ej: Efectivo, Visa, Nequi"
                  disabled={formState.isSubmitting}
                  className={formState.errors.name ? 'border-red-300' : ''}
                />
                {formState.errors.name && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {formState.errors.name}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Método de Pago *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {paymentTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => updateFormData('type', type.value)}
                      disabled={formState.isSubmitting}
                      className={`p-3 rounded-lg border-2 transition-colors text-left ${
                        formState.data.type === type.value
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{type.icon}</span>
                        <div>
                          <div className="font-medium text-sm">{type.label}</div>
                          <div className="text-xs text-gray-500">{type.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formState.data.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Describe este método de pago..."
                  disabled={formState.isSubmitting}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Commission and Limits */}
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900 flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Comisiones y Límites</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comisión
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      value={formState.data.commission_rate}
                      onChange={(e) => updateFormData('commission_rate', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      disabled={formState.isSubmitting}
                      className={`flex-1 ${formState.errors.commission_rate ? 'border-red-300' : ''}`}
                    />
                    <select
                      value={formState.data.commission_type}
                      onChange={(e) => updateFormData('commission_type', e.target.value)}
                      disabled={formState.isSubmitting}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="percentage">%</option>
                      <option value="fixed">COP</option>
                    </select>
                  </div>
                  {formState.errors.commission_rate && (
                    <div className="flex items-center mt-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formState.errors.commission_rate}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mínimo
                    </label>
                    <Input
                      type="number"
                      value={formState.data.minimum_amount}
                      onChange={(e) => updateFormData('minimum_amount', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      disabled={formState.isSubmitting}
                      className={formState.errors.minimum_amount ? 'border-red-300' : ''}
                    />
                    {formState.errors.minimum_amount && (
                      <div className="text-xs text-red-600 mt-1">
                        {formState.errors.minimum_amount}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Máximo
                    </label>
                    <Input
                      type="number"
                      value={formState.data.maximum_amount}
                      onChange={(e) => updateFormData('maximum_amount', parseFloat(e.target.value) || 0)}
                      placeholder="Sin límite"
                      min="0"
                      disabled={formState.isSubmitting}
                      className={formState.errors.maximum_amount ? 'border-red-300' : ''}
                    />
                    {formState.errors.maximum_amount && (
                      <div className="text-xs text-red-600 mt-1">
                        {formState.errors.maximum_amount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formState.data.is_active}
                    onChange={(e) => updateFormData('is_active', e.target.checked)}
                    disabled={formState.isSubmitting}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                    Método activo
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requires_reference"
                    checked={formState.data.requires_reference}
                    onChange={(e) => updateFormData('requires_reference', e.target.checked)}
                    disabled={formState.isSubmitting}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="requires_reference" className="ml-2 text-sm text-gray-700">
                    Requiere referencia
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <h4 className="text-md font-semibold text-gray-900 flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Configuración Avanzada</span>
                </h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? 'Ocultar' : 'Mostrar'}
                </Button>
              </div>

              {showAdvanced && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  {/* Card Types - Only for card payments */}
                  {formState.data.type === 'card' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipos de Tarjeta Aceptados
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {cardTypes.map((cardType) => (
                          <button
                            key={cardType.value}
                            type="button"
                            onClick={() => toggleCardType(cardType.value)}
                            disabled={formState.isSubmitting}
                            className={`p-2 rounded border text-sm font-medium transition-colors ${
                              formState.data.card_types.includes(cardType.value as any)
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {cardType.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Digital Wallet Info - Only for digital wallet payments */}
                  {formState.data.type === 'digital_wallet' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo de Billetera
                        </label>
                        <select
                          value={formState.data.wallet_type}
                          onChange={(e) => updateFormData('wallet_type', e.target.value)}
                          disabled={formState.isSubmitting}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {walletTypes.map((wallet) => (
                            <option key={wallet.value} value={wallet.value}>
                              {wallet.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Número de Cuenta / Teléfono
                        </label>
                        <Input
                          type="text"
                          value={formState.data.wallet_account_number}
                          onChange={(e) => updateFormData('wallet_account_number', e.target.value)}
                          placeholder="Número de teléfono o cuenta"
                          disabled={formState.isSubmitting}
                          className={formState.errors.wallet_account_number ? 'border-red-300' : ''}
                        />
                        {formState.errors.wallet_account_number && (
                          <div className="flex items-center mt-1 text-sm text-red-600">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {formState.errors.wallet_account_number}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Código QR (URL de imagen)
                        </label>
                        <Input
                          type="url"
                          value={formState.data.wallet_qr_code}
                          onChange={(e) => updateFormData('wallet_qr_code', e.target.value)}
                          placeholder="https://ejemplo.com/qr-code.png"
                          disabled={formState.isSubmitting}
                        />
                      </div>
                    </div>
                  )}

                  {/* Bank Accounts - Only for transfer payments */}
                  {formState.data.type === 'transfer' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700">
                          Cuentas Bancarias
                        </label>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={addBankAccount}
                          disabled={formState.isSubmitting}
                        >
                          Agregar Cuenta
                        </Button>
                      </div>

                      {formState.data.bank_accounts.map((account, index) => (
                        <div key={account.id} className="p-3 border border-gray-200 rounded-md space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              Cuenta {index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeBankAccount(index)}
                              disabled={formState.isSubmitting}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              Eliminar
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="text"
                              value={account.bank_name}
                              onChange={(e) => updateBankAccount(index, 'bank_name', e.target.value)}
                              placeholder="Nombre del banco"
                              disabled={formState.isSubmitting}
                              className={formState.errors[`bank_account_${index}_name`] ? 'border-red-300' : ''}
                            />
                            <select
                              value={account.account_type}
                              onChange={(e) => updateBankAccount(index, 'account_type', e.target.value)}
                              disabled={formState.isSubmitting}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="checking">Corriente</option>
                              <option value="savings">Ahorros</option>
                            </select>
                          </div>

                          <Input
                            type="text"
                            value={account.account_number}
                            onChange={(e) => updateBankAccount(index, 'account_number', e.target.value)}
                            placeholder="Número de cuenta"
                            disabled={formState.isSubmitting}
                            className={formState.errors[`bank_account_${index}_number`] ? 'border-red-300' : ''}
                          />

                          <Input
                            type="text"
                            value={account.account_holder}
                            onChange={(e) => updateBankAccount(index, 'account_holder', e.target.value)}
                            placeholder="Titular de la cuenta"
                            disabled={formState.isSubmitting}
                            className={formState.errors[`bank_account_${index}_holder`] ? 'border-red-300' : ''}
                          />

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`primary_${index}`}
                              checked={account.is_primary}
                              onChange={(e) => updateBankAccount(index, 'is_primary', e.target.checked)}
                              disabled={formState.isSubmitting}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor={`primary_${index}`} className="ml-2 text-sm text-gray-700">
                              Cuenta principal
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* General Advanced Settings */}
                  <div className="space-y-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="requires_approval"
                        checked={formState.data.requires_approval}
                        onChange={(e) => updateFormData('requires_approval', e.target.checked)}
                        disabled={formState.isSubmitting}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="requires_approval" className="ml-2 text-sm text-gray-700">
                        Requiere aprobación manual
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="auto_reconciliation"
                        checked={formState.data.auto_reconciliation}
                        onChange={(e) => updateFormData('auto_reconciliation', e.target.checked)}
                        disabled={formState.isSubmitting}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="auto_reconciliation" className="ml-2 text-sm text-gray-700">
                        Conciliación automática
                      </label>
                    </div>
                  </div>
                </div>
              )}
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
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{paymentMethod ? 'Actualizar' : 'Crear'} Método</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentMethodModal;