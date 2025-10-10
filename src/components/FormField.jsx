import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertCircle } from 'lucide-react';

const FormField = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  validation,
  helperText,
  ...props
}) => {
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!touched || !value) {
      setError('');
      setIsValid(false);
      return;
    }

    if (required && !value) {
      setError('Este campo é obrigatório');
      setIsValid(false);
      return;
    }

    if (validation) {
      const validationResult = validation(value);
      if (validationResult === true) {
        setError('');
        setIsValid(true);
      } else {
        setError(validationResult);
        setIsValid(false);
      }
    } else {
      setError('');
      setIsValid(!!value);
    }
  }, [value, touched, required, validation]);

  const handleBlur = () => {
    setTouched(true);
  };

  const handleChange = (e) => {
    setTouched(true);
    onChange(e);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id={id}
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`
            ${error && touched ? 'border-destructive focus-visible:ring-destructive' : ''}
            ${isValid && touched ? 'border-green-500 focus-visible:ring-green-500' : ''}
            pr-10
          `}
          {...props}
        />
        
        {touched && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {isValid && <CheckCircle className="h-4 w-4 text-green-500" />}
            {error && <AlertCircle className="h-4 w-4 text-destructive" />}
          </div>
        )}
      </div>

      {helperText && !error && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
      
      {error && touched && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
};

// Validadores comuns
export const validators = {
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Email inválido';
    }
    return true;
  },
  
  cpf: (value) => {
    const cpf = value.replace(/\D/g, '');
    if (cpf.length !== 11) {
      return 'CPF deve ter 11 dígitos';
    }
    // Validação básica de CPF
    if (/^(\d)\1+$/.test(cpf)) {
      return 'CPF inválido';
    }
    return true;
  },
  
  telefone: (value) => {
    const telefone = value.replace(/\D/g, '');
    if (telefone.length < 10 || telefone.length > 11) {
      return 'Telefone inválido';
    }
    return true;
  },
  
  cep: (value) => {
    const cep = value.replace(/\D/g, '');
    if (cep.length !== 8) {
      return 'CEP deve ter 8 dígitos';
    }
    return true;
  },
  
  senha: (value) => {
    if (value.length < 6) {
      return 'Senha deve ter no mínimo 6 caracteres';
    }
    if (!/[A-Z]/.test(value)) {
      return 'Senha deve conter pelo menos uma letra maiúscula';
    }
    if (!/[0-9]/.test(value)) {
      return 'Senha deve conter pelo menos um número';
    }
    return true;
  },
  
  confirmarSenha: (senha) => (value) => {
    if (value !== senha) {
      return 'As senhas não coincidem';
    }
    return true;
  },
  
  url: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return 'URL inválida';
    }
  },
  
  minLength: (min) => (value) => {
    if (value.length < min) {
      return `Deve ter no mínimo ${min} caracteres`;
    }
    return true;
  },
  
  maxLength: (max) => (value) => {
    if (value.length > max) {
      return `Deve ter no máximo ${max} caracteres`;
    }
    return true;
  }
};

export default FormField;

