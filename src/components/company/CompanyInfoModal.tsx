import React, { useState, useEffect } from 'react';
import { X, Save, Building2, AlertCircle, Globe, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { companyService } from '../../services';
import { useNotifications } from '../../hooks';
import type { 
  Company, 
  CreateCompanyData, 
  UpdateCompanyData,
  FormState 
} from '../../types';

interface CompanyInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  company?: Company | null;
  onSave: () => void;
}

interface CompanyFormData {
  name: string;
  legal_name: string;
  nit: string;
  document_type: 'nit' | 'cedula' | 'passport';
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  phone: string;
  email: string;
  website: string;
  tax_regime: 'simplified' | 'common' | 'special';
  industry: string;
  description: string;
  is_active: boolean;
}

const CompanyInfoModal: React.FC<CompanyInfoModalProps> = ({
  isOpen,
  onClose,
  company,
  onSave
}) => {
  const [loading, setLoading] = useState(false);
  const [validatingNIT, setValidatingNIT] = useState(false);
  
  const [formState, setFormState] = useState<FormState<CompanyFormData>>({
    data: {
      name: '',
      legal_name: '',
      nit: '',
      document_type: 'nit',
      address: '',
      city: '',
      state: '',
      country: 'Colombia',
      postal_code: '',
      phone: '',
      email: '',
      website: '',
      tax_regime: 'simplified',
      industry: '',
      description: '',
      is_active: true
    },
    errors: {},
    isSubmitting: false,
    isDirty: false
  });

  const { addNotification } = useNotifications();

  // Industries list
  const industries = [
    'Retail',
    'Restaurante',
    'Servicios',
    'Tecnología',
    'Salud',
    'Educación',
    'Construcción',
    'Manufactura',
    'Transporte',
    'Agricultura',
    'Turismo',
    'Otros'
  ];

  useEffect(() => {
    if (isOpen) {
      initializeForm();
    }
  }, [isOpen, company]);

  const initializeForm = () => {
    if (company) {
      // Edit mode
      setFormState({
        data: {
          name: company.name,
          legal_name: company.legal_name,
          nit: company.nit,
          document_type: company.document_type,
          address: company.address,
          city: company.city,
          state: company.state,
          country: company.country,
          postal_code: company.postal_code || '',
          phone: company.phone,
          email: company.email,
          website: company.website || '',
          tax_regime: company.tax_regime,
          industry: company.industry,
          description: company.description || '',
          is_active: company.is_active
        },
        errors: {},
        isSubmitting: false,
        isDirty: false
      });
    } else {
      // Create mode
      setFormState({
        data: {
          name: '',
          legal_name: '',
          nit: '',
          document_type: 'nit',
          address: '',
          city: '',
          state: '',
          country: 'Colombia',
          postal_code: '',
          phone: '',
          email: '',
          website: '',
          tax_regime: 'simplified',
          industry: '',
          description: '',
          is_active: true
        },
        errors: {},
        isSubmitting: false,
        isDirty: false
      });
    }
  };

  const updateFormData = (field: keyof CompanyFormData, value: any) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, [field]: value },
      isDirty: true,
      errors: { ...prev.errors, [field]: '' }
    }));
  };

  const validateNIT = async (nit: string) => {
    if (!nit || nit.length < 8) return;
    
    try {
      setValidatingNIT(true);
      const result = await companyService.validateNIT(nit);
      
      if (result.is_valid && result.company_name) {
        // Auto-fill legal name if available
        if (!formState.data.legal_name) {
          updateFormData('legal_name', result.company_name);
        }
        
        addNotification({
          type: 'success',
          title: 'NIT válido',
          message: result.message || 'El NIT es válido'
        });
      } else {
        setFormState(prev => ({
          ...prev,
          errors: { ...prev.errors, nit: result.message || 'El NIT no es válido' }
        }));
      }
    } catch (error) {
      console.error('Error validating NIT:', error);
    } finally {
      setValidatingNIT(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const { data } = formState;

    // Name validation
    if (!data.name.trim()) {
      errors.name = 'El nombre comercial es obligatorio';
    } else if (data.name.trim().length < 2) {
      errors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    // Legal name validation
    if (!data.legal_name.trim()) {
      errors.legal_name = 'La razón social es obligatoria';
    }

    // NIT validation
    if (!data.nit.trim()) {
      errors.nit = 'El NIT es obligatorio';
    } else if (data.document_type === 'nit' && data.nit.trim().length < 8) {
      errors.nit = 'El NIT debe tener al menos 8 dígitos';
    }

    // Address validation
    if (!data.address.trim()) {
      errors.address = 'La dirección es obligatoria';
    }

    // City validation
    if (!data.city.trim()) {
      errors.city = 'La ciudad es obligatoria';
    }

    // State validation
    if (!data.state.trim()) {
      errors.state = 'El departamento/estado es obligatorio';
    }

    // Phone validation
    if (!data.phone.trim()) {
      errors.phone = 'El teléfono es obligatorio';
    } else if (!/^[\d\s\-\+\(\)]+$/.test(data.phone)) {
      errors.phone = 'Ingrese un número de teléfono válido';
    }

    // Email validation
    if (!data.email.trim()) {
      errors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Ingrese un email válido';
    }

    // Website validation (optional but format check)
    if (data.website && !/^https?:\/\/.+\..+/.test(data.website)) {
      errors.website = 'Ingrese una URL válida (incluya http:// o https://)';
    }

    // Industry validation
    if (!data.industry) {
      errors.industry = 'Debe seleccionar una industria';
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
      
      if (company) {
        // Update existing company
        const updateData: UpdateCompanyData = {
          name: data.name,
          legal_name: data.legal_name,
          nit: data.nit,
          document_type: data.document_type,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          postal_code: data.postal_code || undefined,
          phone: data.phone,
          email: data.email,
          website: data.website || undefined,
          tax_regime: data.tax_regime,
          industry: data.industry,
          description: data.description || undefined,
          is_active: data.is_active
        };

        await companyService.updateCompany(updateData);
        
        addNotification({
          type: 'success',
          title: 'Empresa actualizada',
          message: 'La información de la empresa ha sido actualizada correctamente'
        });
      } else {
        // Create new company
        const createData: CreateCompanyData = {
          name: data.name,
          legal_name: data.legal_name,
          nit: data.nit,
          document_type: data.document_type,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          postal_code: data.postal_code || undefined,
          phone: data.phone,
          email: data.email,
          website: data.website || undefined,
          tax_regime: data.tax_regime,
          industry: data.industry,
          description: data.description || undefined
        };

        await companyService.createCompany(createData);
        
        addNotification({
          type: 'success',
          title: 'Empresa creada',
          message: 'La empresa ha sido creada correctamente'
        });
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving company:', error);
      
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
          message: error.response?.data?.message || 'No se pudo guardar la información de la empresa'
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <span>{company ? 'Editar Empresa' : 'Nueva Empresa'}</span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Comercial *
                </label>
                <Input
                  type="text"
                  value={formState.data.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="Nombre de la empresa"
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
                  Razón Social *
                </label>
                <Input
                  type="text"
                  value={formState.data.legal_name}
                  onChange={(e) => updateFormData('legal_name', e.target.value)}
                  placeholder="Razón social de la empresa"
                  disabled={formState.isSubmitting}
                  className={formState.errors.legal_name ? 'border-red-300' : ''}
                />
                {formState.errors.legal_name && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {formState.errors.legal_name}
                  </div>
                )}
              </div>
            </div>

            {/* Tax Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Documento *
                </label>
                <select
                  value={formState.data.document_type}
                  onChange={(e) => updateFormData('document_type', e.target.value)}
                  disabled={formState.isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="nit">NIT</option>
                  <option value="cedula">Cédula</option>
                  <option value="passport">Pasaporte</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formState.data.document_type === 'nit' ? 'NIT' : 
                   formState.data.document_type === 'cedula' ? 'Cédula' : 'Pasaporte'} *
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={formState.data.nit}
                    onChange={(e) => updateFormData('nit', e.target.value)}
                    onBlur={() => validateNIT(formState.data.nit)}
                    placeholder={formState.data.document_type === 'nit' ? '123456789-0' : 'Número de documento'}
                    disabled={formState.isSubmitting || validatingNIT}
                    className={formState.errors.nit ? 'border-red-300' : ''}
                  />
                  {validatingNIT && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                    </div>
                  )}
                </div>
                {formState.errors.nit && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {formState.errors.nit}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Régimen Tributario *
                </label>
                <select
                  value={formState.data.tax_regime}
                  onChange={(e) => updateFormData('tax_regime', e.target.value)}
                  disabled={formState.isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="simplified">Simplificado</option>
                  <option value="common">Común</option>
                  <option value="special">Especial</option>
                </select>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900 flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Información de Ubicación</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección *
                  </label>
                  <Input
                    type="text"
                    value={formState.data.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    placeholder="Calle 123 # 45-67"
                    disabled={formState.isSubmitting}
                    className={formState.errors.address ? 'border-red-300' : ''}
                  />
                  {formState.errors.address && (
                    <div className="flex items-center mt-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formState.errors.address}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad *
                  </label>
                  <Input
                    type="text"
                    value={formState.data.city}
                    onChange={(e) => updateFormData('city', e.target.value)}
                    placeholder="Bogotá"
                    disabled={formState.isSubmitting}
                    className={formState.errors.city ? 'border-red-300' : ''}
                  />
                  {formState.errors.city && (
                    <div className="flex items-center mt-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formState.errors.city}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departamento/Estado *
                  </label>
                  <Input
                    type="text"
                    value={formState.data.state}
                    onChange={(e) => updateFormData('state', e.target.value)}
                    placeholder="Cundinamarca"
                    disabled={formState.isSubmitting}
                    className={formState.errors.state ? 'border-red-300' : ''}
                  />
                  {formState.errors.state && (
                    <div className="flex items-center mt-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formState.errors.state}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    País *
                  </label>
                  <Input
                    type="text"
                    value={formState.data.country}
                    onChange={(e) => updateFormData('country', e.target.value)}
                    placeholder="Colombia"
                    disabled={formState.isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código Postal
                  </label>
                  <Input
                    type="text"
                    value={formState.data.postal_code}
                    onChange={(e) => updateFormData('postal_code', e.target.value)}
                    placeholder="110111"
                    disabled={formState.isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900">Información de Contacto</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-1">
                    <Phone className="h-4 w-4" />
                    <span>Teléfono *</span>
                  </label>
                  <Input
                    type="tel"
                    value={formState.data.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    placeholder="+57 300 123 4567"
                    disabled={formState.isSubmitting}
                    className={formState.errors.phone ? 'border-red-300' : ''}
                  />
                  {formState.errors.phone && (
                    <div className="flex items-center mt-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formState.errors.phone}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-1">
                    <Mail className="h-4 w-4" />
                    <span>Email *</span>
                  </label>
                  <Input
                    type="email"
                    value={formState.data.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    placeholder="empresa@email.com"
                    disabled={formState.isSubmitting}
                    className={formState.errors.email ? 'border-red-300' : ''}
                  />
                  {formState.errors.email && (
                    <div className="flex items-center mt-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formState.errors.email}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-1">
                    <Globe className="h-4 w-4" />
                    <span>Sitio Web</span>
                  </label>
                  <Input
                    type="url"
                    value={formState.data.website}
                    onChange={(e) => updateFormData('website', e.target.value)}
                    placeholder="https://www.empresa.com"
                    disabled={formState.isSubmitting}
                    className={formState.errors.website ? 'border-red-300' : ''}
                  />
                  {formState.errors.website && (
                    <div className="flex items-center mt-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formState.errors.website}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900">Información del Negocio</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industria *
                </label>
                <select
                  value={formState.data.industry}
                  onChange={(e) => updateFormData('industry', e.target.value)}
                  disabled={formState.isSubmitting}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formState.errors.industry ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccione una industria</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
                {formState.errors.industry && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {formState.errors.industry}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formState.data.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Describe el giro del negocio..."
                  disabled={formState.isSubmitting}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {company && (
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
                    Empresa activa
                  </label>
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
                  <span>{company ? 'Actualizar' : 'Crear'} Empresa</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyInfoModal;