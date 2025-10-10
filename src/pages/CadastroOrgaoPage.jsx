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
    if (errors.tipoOrgao) {
      setErrors(prev => ({ ...prev, tipoOrgao: '' }));
    }
  };

  const formatCNPJ = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return value;
  };

  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
  };

  const formatTelefone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const formatCEP = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    return value;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nomeOrgao.trim()) {
      newErrors.nomeOrgao = 'Nome do órgão é obrigatório';
    }

    if (!formData.tipoOrgao) {
      newErrors.tipoOrgao = 'Tipo de órgão é obrigatório';
    }

    if (!formData.cnpj.trim()) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    } else if (formData.cnpj.replace(/\D/g, '').length !== 14) {
      newErrors.cnpj = 'CNPJ inválido';
    }

    if (!formData.emailInstitucional.trim()) {
      newErrors.emailInstitucional = 'Email institucional é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.emailInstitucional)) {
      newErrors.emailInstitucional = 'Email inválido';
    } else if (!formData.emailInstitucional.includes('.gov.br') && !formData.emailInstitucional.includes('.sp.gov.br')) {
      newErrors.emailInstitucional = 'Use um email institucional (.gov.br)';
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }

    if (!formData.responsavelNome.trim()) {
      newErrors.responsavelNome = 'Nome do responsável é obrigatório';
    }

    if (!formData.responsavelCargo.trim()) {
      newErrors.responsavelCargo = 'Cargo do responsável é obrigatório';
    }

    if (!formData.responsavelCpf.trim()) {
      newErrors.responsavelCpf = 'CPF do responsável é obrigatório';
    } else if (formData.responsavelCpf.replace(/\D/g, '').length !== 11) {
      newErrors.responsavelCpf = 'CPF inválido';
    }

    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 8) {
      newErrors.senha = 'Senha deve ter pelo menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.senha)) {
      newErrors.senha = 'Senha deve conter maiúscula, minúscula e número';
    }

    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Simular cadastro de órgão público
    const novoOrgao = {
      id: Date.now(),
      nomeOrgao: formData.nomeOrgao,
      tipoOrgao: formData.tipoOrgao,
      cnpj: formData.cnpj,
      emailInstitucional: formData.emailInstitucional,
      telefone: formData.telefone,
      endereco: formData.endereco,
      cidade: formData.cidade,
      estado: formData.estado,
      cep: formData.cep,
      responsavel: {
        nome: formData.responsavelNome,
        cargo: formData.responsavelCargo,
        cpf: formData.responsavelCpf,
        email: formData.responsavelEmail
      },
      tipo: 'administrador',
      isAdmin: true,
      dataCriacao: new Date().toISOString(),
      ativo: true
    };

    // Fazer login automático após cadastro
    login(novoOrgao);
    
    toast.success('Órgão cadastrado com sucesso! Aguarde aprovação.');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="w-full max-w-2xl space-y-8">
        <div className="flex flex-col items-center">
          <div className="rounded-full bg-primary/10 p-3 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
            Cadastro de Órgão Público
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <Link 
              to="/admin/login" 
              className="font-medium text-primary hover:text-primary/90"
            >
              Faça login
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Informações do Órgão */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Informações do Órgão</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="nomeOrgao">Nome do Órgão</Label>
                <Input
                  id="nomeOrgao"
                  name="nomeOrgao"
                  type="text"
                  required
                  placeholder="Ex: Prefeitura Municipal de São Paulo"
                  value={formData.nomeOrgao}
                  onChange={handleInputChange}
                  className={errors.nomeOrgao ? 'border-red-500' : ''}
                />
                {errors.nomeOrgao && (
                  <p className="text-sm text-red-500 mt-1">{errors.nomeOrgao}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="tipoOrgao">Tipo de Órgão</Label>
                <Select value={formData.tipoOrgao} onValueChange={handleSelectChange}>
                  <SelectTrigger className={errors.tipoOrgao ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione o tipo de órgão" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposOrgao.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tipoOrgao && (
                  <p className="text-sm text-red-500 mt-1">{errors.tipoOrgao}</p>
                )}
              </div>

              <div>
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  name="cnpj"
                  type="text"
                  required
                  placeholder="00.000.000/0000-00"
                  value={formData.cnpj}
                  onChange={(e) => {
                    const formatted = formatCNPJ(e.target.value);
                    handleInputChange({ target: { name: 'cnpj', value: formatted } });
                  }}
                  className={errors.cnpj ? 'border-red-500' : ''}
                  maxLength={18}
                />
                {errors.cnpj && (
                  <p className="text-sm text-red-500 mt-1">{errors.cnpj}</p>
                )}
              </div>

              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  name="telefone"
                  type="text"
                  required
                  placeholder="(00) 00000-0000"
                  value={formData.telefone}
                  onChange={(e) => {
                    const formatted = formatTelefone(e.target.value);
                    handleInputChange({ target: { name: 'telefone', value: formatted } });
                  }}
                  className={errors.telefone ? 'border-red-500' : ''}
                  maxLength={15}
                />
                {errors.telefone && (
                  <p className="text-sm text-red-500 mt-1">{errors.telefone}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="emailInstitucional">Email Institucional</Label>
                <Input
                  id="emailInstitucional"
                  name="emailInstitucional"
                  type="email"
                  required
                  placeholder="contato@orgao.gov.br"
                  value={formData.emailInstitucional}
                  onChange={handleInputChange}
                  className={errors.emailInstitucional ? 'border-red-500' : ''}
                />
                {errors.emailInstitucional && (
                  <p className="text-sm text-red-500 mt-1">{errors.emailInstitucional}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  name="endereco"
                  type="text"
                  placeholder="Rua, número, complemento"
                  value={formData.endereco}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  name="cidade"
                  type="text"
                  placeholder="Nome da cidade"
                  value={formData.cidade}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  name="estado"
                  type="text"
                  placeholder="UF"
                  value={formData.estado}
                  onChange={handleInputChange}
                  maxLength={2}
                />
              </div>

              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  name="cep"
                  type="text"
                  placeholder="00000-000"
                  value={formData.cep}
                  onChange={(e) => {
                    const formatted = formatCEP(e.target.value);
                    handleInputChange({ target: { name: 'cep', value: formatted } });
                  }}
                  maxLength={9}
                />
              </div>
            </div>
          </div>

          {/* Informações do Responsável */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground">Responsável Legal</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="responsavelNome">Nome Completo</Label>
                <Input
                  id="responsavelNome"
                  name="responsavelNome"
                  type="text"
                  required
                  placeholder="Nome do responsável"
                  value={formData.responsavelNome}
                  onChange={handleInputChange}
                  className={errors.responsavelNome ? 'border-red-500' : ''}
                />
                {errors.responsavelNome && (
                  <p className="text-sm text-red-500 mt-1">{errors.responsavelNome}</p>
                )}
              </div>

              <div>
                <Label htmlFor="responsavelCargo">Cargo</Label>
                <Input
                  id="responsavelCargo"
                  name="responsavelCargo"
                  type="text"
                  required
                  placeholder="Ex: Secretário, Diretor"
                  value={formData.responsavelCargo}
                  onChange={handleInputChange}
                  className={errors.responsavelCargo ? 'border-red-500' : ''}
                />
                {errors.responsavelCargo && (
                  <p className="text-sm text-red-500 mt-1">{errors.responsavelCargo}</p>
                )}
              </div>

              <div>
                <Label htmlFor="responsavelCpf">CPF</Label>
                <Input
                  id="responsavelCpf"
                  name="responsavelCpf"
                  type="text"
                  required
                  placeholder="000.000.000-00"
                  value={formData.responsavelCpf}
                  onChange={(e) => {
                    const formatted = formatCPF(e.target.value);
                    handleInputChange({ target: { name: 'responsavelCpf', value: formatted } });
                  }}
                  className={errors.responsavelCpf ? 'border-red-500' : ''}
                  maxLength={14}
                />
                {errors.responsavelCpf && (
                  <p className="text-sm text-red-500 mt-1">{errors.responsavelCpf}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="responsavelEmail">Email do Responsável (opcional)</Label>
                <Input
                  id="responsavelEmail"
                  name="responsavelEmail"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formData.responsavelEmail}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Senha */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground">Segurança</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  name="senha"
                  type="password"
                  required
                  placeholder="Mínimo 8 caracteres"
                  value={formData.senha}
                  onChange={handleInputChange}
                  className={errors.senha ? 'border-red-500' : ''}
                />
                {errors.senha && (
                  <p className="text-sm text-red-500 mt-1">{errors.senha}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                <Input
                  id="confirmarSenha"
                  name="confirmarSenha"
                  type="password"
                  required
                  placeholder="Digite a senha novamente"
                  value={formData.confirmarSenha}
                  onChange={handleInputChange}
                  className={errors.confirmarSenha ? 'border-red-500' : ''}
                />
                {errors.confirmarSenha && (
                  <p className="text-sm text-red-500 mt-1">{errors.confirmarSenha}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full">
              Cadastrar Órgão
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            Ao cadastrar um órgão público, você declara que possui autorização legal para representá-lo e concorda com os{' '}
            <Link to="/termos" className="text-primary hover:underline">
              Termos de Uso
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CadastroOrgaoPage;

