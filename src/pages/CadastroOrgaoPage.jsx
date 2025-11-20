import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';

const fakeDB = {
  orgaos: [
    { email: "exemplo@prefeitura.gov.br" }, 
  ]
};

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

  const senhaForteRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

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

    if (formData.emailInstitucional && !formData.emailInstitucional.endsWith('.gov.br')) {
      newErrors.emailInstitucional = 'O email deve terminar com .gov.br';
    }

    const emailJaExiste = fakeDB.orgaos.some(
      o => o.email.toLowerCase() === formData.emailInstitucional.toLowerCase()
    );

    if (emailJaExiste) {
      newErrors.emailInstitucional = 'Este email institucional já está cadastrado.';
    }

    if (formData.senha && !senhaForteRegex.test(formData.senha)) {
      newErrors.senha =
        'A senha deve ter ao menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo.';
    }

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

    if (!validateForm()) {
      toast.error('Por favor, corrija os erros antes de enviar.');
      return;
    }

    try {
      const payload = createPayload();

      fakeDB.orgaos.push({ email: formData.emailInstitucional });

      toast.success('Órgão cadastrado com sucesso!');
      navigate('/admin/login');
    } catch (error) {
      toast.error('Erro ao cadastrar o órgão.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="w-full max-w-md space-y-8">
        
        {/* Cabeçalho */}
        <div className="flex flex-col items-center">
          <div className="rounded-full bg-primary/10 p-3 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-center text-3xl font-bold">Cadastro de Órgão Público</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Preencha os dados para criar sua conta institucional
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          
          {/* Dados do órgão */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-1">Dados do Órgão</h3>

            {/* Nome */}
            <div>
              <Label htmlFor="nomeOrgao">Nome do Órgão</Label>
              <Input id="nomeOrgao" name="nomeOrgao" value={formData.nomeOrgao} onChange={handleInputChange} />
              {errors.nomeOrgao && <p className="text-red-500 text-sm">{errors.nomeOrgao}</p>}
            </div>

            {/* Tipo */}
            <div>
              <Label>Tipo de Órgão</Label>
              <Select onValueChange={handleSelectChange} value={formData.tipoOrgao}>
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

            {/* CNPJ */}
            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" name="cnpj" value={formData.cnpj} onChange={handleInputChange} />
              {errors.cnpj && <p className="text-red-500 text-sm">{errors.cnpj}</p>}
            </div>

            {/* Email institucional */}
            <div>
              <Label htmlFor="emailInstitucional">Email Institucional</Label>
              <Input
                id="emailInstitucional"
                name="emailInstitucional"
                value={formData.emailInstitucional}
                onChange={handleInputChange}
                type="email"
              />
              {errors.emailInstitucional && <p className="text-red-500 text-sm">{errors.emailInstitucional}</p>}
            </div>

            {/* Telefone */}
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" name="telefone" value={formData.telefone} onChange={handleInputChange} />
              {errors.telefone && <p className="text-red-500 text-sm">{errors.telefone}</p>}
            </div>

            {/* Endereço */}
            <h3 className="text-lg font-semibold border-b pb-1 pt-4">Endereço</h3>

            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Input id="endereco" name="endereco" value={formData.endereco} onChange={handleInputChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input id="cidade" name="cidade" value={formData.cidade} onChange={handleInputChange} />
                {errors.cidade && <p className="text-red-500 text-sm">{errors.cidade}</p>}
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Input id="estado" name="estado" value={formData.estado} onChange={handleInputChange} />
                {errors.estado && <p className="text-red-500 text-sm">{errors.estado}</p>}
              </div>
            </div>

            {/* Responsável */}
            <h3 className="text-lg font-semibold border-b pb-1 pt-4">Dados do Responsável</h3>

            <div>
              <Label htmlFor="responsavelNome">Nome completo</Label>
              <Input id="responsavelNome" name="responsavelNome" value={formData.responsavelNome} onChange={handleInputChange} />
              {errors.responsavelNome && <p className="text-red-500 text-sm">{errors.responsavelNome}</p>}
            </div>

            <div>
              <Label htmlFor="responsavelEmail">Email do responsável</Label>
              <Input id="responsavelEmail" name="responsavelEmail" type="email" value={formData.responsavelEmail} onChange={handleInputChange} />
              {errors.responsavelEmail && <p className="text-red-500 text-sm">{errors.responsavelEmail}</p>}
            </div>

            {/* Senha */}
            <h3 className="text-lg font-semibold border-b pb-1 pt-4">Definir Senha</h3>

            <div>
              <Label htmlFor="senha">Senha</Label>
              <Input id="senha" name="senha" type="password" value={formData.senha} onChange={handleInputChange} />
              {errors.senha && <p className="text-red-500 text-sm">{errors.senha}</p>}
            </div>

            <div>
              <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
              <Input id="confirmarSenha" name="confirmarSenha" type="password" value={formData.confirmarSenha} onChange={handleInputChange} />
              {errors.confirmarSenha && <p className="text-red-500 text-sm">{errors.confirmarSenha}</p>}
            </div>

          </div>

          <Button type="submit" className="w-full">Cadastrar Órgão</Button>
        </form>

        <div className="rounded-lg bg-muted/50 p-4 text-center text-xs text-muted-foreground">
          <strong>Importante:</strong> O cadastro está sujeito à aprovação.
        </div>

      </div>
    </div>
  );
};

export default CadastroOrgaoPage;
