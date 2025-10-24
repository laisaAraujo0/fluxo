import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';

const tiposOrgao = [
  { value: 'prefeitura', label: 'Prefeitura Municipal' },
  { value: 'bombeiros', label: 'Corpo de Bombeiros' },
  { value: 'samu', label: 'SAMU/Ambulância' },
  { value: 'policia_militar', label: 'Polícia Militar' },
  { value: 'policia_civil', label: 'Polícia Civil' },
  { value: 'defesa_civil', label: 'Defesa Civil' },
  { value: 'agua_esgoto', label: 'Companhia de Água e Esgoto' },
  { value: 'energia', label: 'Companhia de Energia Elétrica' },
  { value: 'sec_obras', label: 'Secretaria de Obras' },
  { value: 'sec_meio_ambiente', label: 'Secretaria de Meio Ambiente' },
  { value: 'sec_transporte', label: 'Secretaria de Transporte' },
  { value: 'guarda_municipal', label: 'Guarda Municipal' },
];

const CadastroOrgaoPage = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [formData, setFormData] = useState({
    nomeOrgao: '',
    tipoOrgao: '',
    cnpj: '',
    emailInstitucional: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    responsavelNome: '',
    responsavelCargo: '',
    responsavelCpf: '',
    responsavelEmail: '',
    senha: '',
    confirmarSenha: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({
      ...prev,
      tipoOrgao: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      'nomeOrgao', 'tipoOrgao', 'cnpj', 'emailInstitucional',
      'telefone', 'cidade', 'estado', 'responsavelNome',
      'responsavelEmail', 'senha', 'confirmarSenha'
    ];

    requiredFields.forEach(field => {
      if (!formData[field]) newErrors[field] = 'Campo obrigatório';
    });

    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createPayload = () => ({
    nome: formData.nomeOrgao,
    tipo: formData.tipoOrgao,
    cnpj: formData.cnpj,
    email: formData.emailInstitucional,
    telefone: formData.telefone,
    endereco: formData.endereco,
    cidade: formData.cidade,
    estado: formData.estado,
    cep: formData.cep,
    responsavel: {
      nome: formData.responsavelNome,
      cargo: formData.responsavelCargo,
      cpf: formData.responsavelCpf,
      email: formData.responsavelEmail,
    },
    senha: formData.senha,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = createPayload();
      // Aqui você chamaria sua API de cadastro:
      // await api.post('/orgaos', payload);
      toast.success('Órgão cadastrado com sucesso!');
      navigate('/login');
    } catch (error) {
      toast.error('Erro ao cadastrar o órgão.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex items-center mb-6">
        <Shield className="mr-2 text-blue-600" />
        <h1 className="text-2xl font-bold">Cadastro de Órgão</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="nomeOrgao">Nome do Órgão</Label>
          <Input id="nomeOrgao" name="nomeOrgao" value={formData.nomeOrgao} onChange={handleInputChange} />
          {errors.nomeOrgao && <p className="text-red-500 text-sm">{errors.nomeOrgao}</p>}
        </div>
        <div>
          <Label>Tipo de Órgão</Label>
          <Select onValueChange={handleSelectChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {tiposOrgao.map(tipo => (
                <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.tipoOrgao && <p className="text-red-500 text-sm">{errors.tipoOrgao}</p>}
        </div>
        <Button type="submit" className="w-full">Cadastrar</Button>
        <p className="text-center text-sm mt-4">
          Já possui uma conta? <Link to="/login" className="text-blue-500">Acesse aqui</Link>.
        </p>
      </form>
    </div>
  );
};

export default CadastroOrgaoPage;
