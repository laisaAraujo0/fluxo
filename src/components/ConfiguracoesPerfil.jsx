import { useState } from 'react';
import { ArrowLeft, User, Edit, Lock, Bell, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useUser } from '@/contexts/UserContext';
import userProfileService from '@/services/userProfileService';

const ConfiguracoesPerfil = ({ userData, setUserData, onVoltar, initialSection = "perfil" }) => {
  const { updateUser } = useUser();
  const [activeSection, setActiveSection] = useState(initialSection);
  const [isLoading, setIsLoading] = useState(false);
  const [configuracoes, setConfiguracoes] = useState({
    perfilPublico: userData.privacidade?.perfilPublico ?? true,
    mostrarEmail: userData.privacidade?.mostrarEmail ?? true,
    mostrarCidade: userData.privacidade?.mostrarCidade ?? true,
    mostrarTelefone: userData.privacidade?.mostrarTelefone ?? false,
    notificacaoComentarios: userData.notificacaoComentarios ?? true,
    notificacaoMencoes: userData.notificacaoMencoes ?? true,
    notificacaoSeguidores: userData.notificacaoSeguidores ?? false,
    novoUsuarioBloquear: ''
  });

  const [editableUserData, setEditableUserData] = useState({
    nome: userData.nome || '',
    email: userData.email || '',
    bio: userData.bio || '',
    cidade: userData.cidade || '',
    estado: userData.estado || '',
    telefone: userData.telefone || '',
  });

  const [usuariosBloqueados] = useState([
    {
      id: 1,
      nome: 'Carlos Silva',
      username: '@carlos.silva',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIszqwNNEAOVEPLYnyqOMhn0FYUMgXhkLrnLV0PqK3twoAqjW7BCBU0wAfng7_iF2uoAX_AFDFW0eROLLMPJ4lAm7D26mFTZOzfBeCeOt6mgWeI_agwa6w62ZUEzTEFlVEfwIFLEyCdGIMZrxP1LvdETaF9KuvYb30HxR1B2JUufWA9L4Q1OhtpbjuZzZl3tuE5ChzgrrSdONslCPd050gHbASptCwyCGyxJucyqLmRmyKLH1Q3xDwvN1J0aGwc1x3lEiiIx5byRc'
    },
    {
      id: 2,
      nome: 'Ana Pereira',
      username: '@ana.pereira',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIszqwNNEAOVEPLYnyqOMhn0FYUMgXhkLrnLV0PqK3twoAqjW7BCBU0wAfng7_iF2uoAX_AFDFW0eROLLMPJ4lAm7D26mFTZOzfBeCeOt6mgWeI_agwa6w62ZUEzTEFlVEfwIFLEyCdGIMZrxP1LvdETaF9KuvYb30HxR1B2JUufWA9L4Q1OhtpbjuZzZl3tuE5ChzgrrSdONslCPd050gHbASptCwyCGyxJucyqLmRmyKLH1Q3xDwvN1J0aGwc1x3lEiiIx5byRc'
    }
  ]);

  const handleConfigChange = (key, value) => {
    setConfiguracoes(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleEditableDataChange = (key, value) => {
    setEditableUserData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSalvar = async () => {
    setIsLoading(true);
    
    try {
      // Validar dados
      const validation = userProfileService.validateProfileData(editableUserData);
      if (!validation.isValid) {
        alert(`Erro de validação: ${Object.values(validation.errors).join(', ')}`);
        setIsLoading(false);
        return;
      }

      // Preparar dados para envio
      const profileData = {
        ...editableUserData,
        perfilPublico: configuracoes.perfilPublico,
        mostrarEmail: configuracoes.mostrarEmail,
        mostrarCidade: configuracoes.mostrarCidade,
        mostrarTelefone: configuracoes.mostrarTelefone,
        notificacaoComentarios: configuracoes.notificacaoComentarios,
        notificacaoMencoes: configuracoes.notificacaoMencoes,
        notificacaoSeguidores: configuracoes.notificacaoSeguidores,
      };

      // Atualizar no backend
      const result = await userProfileService.updateUserProfile(profileData);

      // Atualizar estado local
      setUserData(prev => ({
        ...prev,
        ...editableUserData,
        privacidade: {
          perfilPublico: configuracoes.perfilPublico,
          mostrarEmail: configuracoes.mostrarEmail,
          mostrarCidade: configuracoes.mostrarCidade,
          mostrarTelefone: configuracoes.mostrarTelefone,
        },
        notificacaoComentarios: configuracoes.notificacaoComentarios,
        notificacaoMencoes: configuracoes.notificacaoMencoes,
        notificacaoSeguidores: configuracoes.notificacaoSeguidores,
      }));

      // Atualizar contexto do usuário
      updateUser(result.usuario);

      alert("Configurações salvas com sucesso!");
      onVoltar();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert("Erro ao salvar configurações. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDesbloquear = (userId) => {
    console.log('Desbloqueando usuário:', userId);
    alert('Usuário desbloqueado!');
  };

  const handleBloquearUsuario = () => {
    if (configuracoes.novoUsuarioBloquear.trim()) {
      console.log('Bloqueando usuário:', configuracoes.novoUsuarioBloquear);
      alert(`Usuário ${configuracoes.novoUsuarioBloquear} bloqueado!`);
      handleConfigChange('novoUsuarioBloquear', '');
    }
  };

  const menuItems = [
    { id: 'perfil', label: 'Informações do Perfil', icon: User },
    { id: 'editar', label: 'Editar Informações', icon: Edit },
    { id: 'privacidade', label: 'Privacidade', icon: Lock },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'sair', label: 'Sair', icon: LogOut, danger: true }
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Cabeçalho */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onVoltar}
            className="flex items-center gap-2 p-0 h-auto hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Perfil
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-left">
            <div className="relative">
              <div 
                className="h-24 w-24 rounded-full bg-cover bg-center ring-4 ring-background"
                style={{
                   backgroundImage: `url(${userData.profilePic || "https://via.placeholder.com/150"})`
          }}
              />
            </div>
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold text-foreground"> {userData?.nome || 'Usuário'}</h2>
              <p className="text-sm text-muted-foreground">{userData?.email || '@usuario'}</p>
            </div>

            {/* Menu de navegação */}
            <nav className="w-full">
              <ul className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveSection(item.id)}
                        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium w-full text-left transition-colors ${
                          activeSection === item.id
                            ? 'bg-muted text-primary'
                            : item.danger
                            ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="md:col-span-3">
          {activeSection === 'privacidade' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-foreground">Configurações de Privacidade</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Controle como suas informações são vistas e compartilhadas na plataforma.
                </p>
              </div>

              {/* Visibilidade do Perfil */}
              <div className="space-y-6 rounded-lg border border-border p-6">
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-foreground">Visibilidade do Perfil</h4>
                  <p className="text-sm text-muted-foreground">
                    Decida quem pode ver seu perfil e suas atividades.
                  </p>
                </div>
                
                <RadioGroup 
                  value={configuracoes.perfilPublico ? 'publico' : 'privado'}
                  onValueChange={(value) => handleConfigChange('perfilPublico', value === 'publico')}
                  className="space-y-4"
                >
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="publico" id="publico" className="mt-1" />
                    <div className="space-y-1">
                      <Label htmlFor="publico" className="font-medium text-foreground">
                        Público
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Qualquer pessoa pode ver seu perfil, suas contribuições e interações.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="privado" id="privado" className="mt-1" />
                    <div className="space-y-1">
                      <Label htmlFor="privado" className="font-medium text-foreground">
                        Privado
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Apenas conexões aprovadas podem ver suas informações detalhadas.
                      </p>
                    </div>
                  </div>
                </RadioGroup>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-foreground">Visibilidade do Email</h5>
                      <p className="text-sm text-muted-foreground">
                        Permitir que outros usuários vejam seu endereço de email.
                      </p>
                    </div>
                    <Switch
                      checked={configuracoes.mostrarEmail}
                      onCheckedChange={(checked) => handleConfigChange('mostrarEmail', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-foreground">Visibilidade da Cidade</h5>
                      <p className="text-sm text-muted-foreground">
                        Permitir que outros usuários vejam sua cidade e estado.
                      </p>
                    </div>
                    <Switch
                      checked={configuracoes.mostrarCidade}
                      onCheckedChange={(checked) => handleConfigChange('mostrarCidade', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Gerenciar Notificações */}
              <div className="space-y-6 rounded-lg border border-border p-6">
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-foreground">Gerenciar Notificações</h4>
                  <p className="text-sm text-muted-foreground">
                    Escolha quais notificações você deseja receber.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-foreground">Novos comentários em suas postagens</h5>
                      <p className="text-sm text-muted-foreground">
                        Receba notificações quando alguém comentar em seus eventos.
                      </p>
                    </div>
                    <Switch
                      checked={configuracoes.notificacaoComentarios}
                      onCheckedChange={(checked) => handleConfigChange('notificacaoComentarios', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-foreground">Menções</h5>
                      <p className="text-sm text-muted-foreground">
                        Seja notificado quando alguém mencionar você.
                      </p>
                    </div>
                    <Switch
                      checked={configuracoes.notificacaoMencoes}
                      onCheckedChange={(checked) => handleConfigChange('notificacaoMencoes', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-foreground">Novos seguidores</h5>
                      <p className="text-sm text-muted-foreground">
                        Receba uma notificação quando um novo usuário seguir você.
                      </p>
                    </div>
                    <Switch
                      checked={configuracoes.notificacaoSeguidores}
                      onCheckedChange={(checked) => handleConfigChange('notificacaoSeguidores', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Usuários Bloqueados */}
              <div className="space-y-6 rounded-lg border border-border p-6">
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-foreground">Usuários Bloqueados</h4>
                  <p className="text-sm text-muted-foreground">
                    Usuários bloqueados não poderão ver seu perfil ou interagir com você.
                  </p>
                </div>
                
                <div className="space-y-4">
                  {usuariosBloqueados.map((usuario) => (
                    <div key={usuario.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-10 w-10 rounded-full bg-cover bg-center"
                          style={{ backgroundImage: `url("${usuario.avatar}")` }}
                        />
                        <div>
                          <p className="font-medium text-foreground">{usuario.nome}</p>
                          <p className="text-sm text-muted-foreground">{usuario.username}</p>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDesbloquear(usuario.id)}
                      >
                        Desbloquear
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <Label htmlFor="block-user" className="block text-sm font-medium text-foreground">
                    Bloquear um novo usuário
                  </Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Input
                      id="block-user"
                      value={configuracoes.novoUsuarioBloquear}
                      onChange={(e) => handleConfigChange('novoUsuarioBloquear', e.target.value)}
                      placeholder="Digite o @usuário"
                      className="flex-1"
                    />
                    <Button onClick={handleBloquearUsuario}>
                      Bloquear
                    </Button>
                  </div>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={onVoltar}>
                  Cancelar
                </Button>
                <Button onClick={handleSalvar}>
                  Salvar
                </Button>
              </div>
            </div>
          )}

          {activeSection === 'perfil' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-foreground">Informações do Perfil</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Visualize suas informações pessoais cadastradas.
                </p>
              </div>

              <div className="space-y-4 rounded-lg border border-border p-6">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">Nome:</p>
                  <p className="text-muted-foreground">{userData.nome}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">Email:</p>
                  <p className="text-muted-foreground">
                    {userData.privacidade.mostrarEmail ? userData.email : "Privado"}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">Nome de Usuário:</p>
                  <p className="text-muted-foreground">{userData.username}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">Bio:</p>
                  <p className="text-muted-foreground">{userData.bio}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">Cidade:</p>
                  <p className="text-muted-foreground">
                    {userData.privacidade.mostrarCidade ? userData.cidade : "Privado"}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">Estado:</p>
                  <p className="text-muted-foreground">
                    {userData.privacidade.mostrarCidade ? userData.estado : "Privado"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'editar' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-foreground">Editar Informações</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Atualize seus dados pessoais.
                </p>
              </div>

              <div className="space-y-4 rounded-lg border border-border p-6">
                <div>
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={editableUserData.nome}
                    onChange={(e) => handleEditableDataChange("nome", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editableUserData.email}
                    onChange={(e) => handleEditableDataChange("email", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    value={editableUserData.bio}
                    onChange={(e) => handleEditableDataChange("bio", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={editableUserData.cidade}
                    onChange={(e) => handleEditableDataChange("cidade", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={editableUserData.estado}
                    onChange={(e) => handleEditableDataChange("estado", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    type="tel"
                    value={editableUserData.telefone}
                    onChange={(e) => handleEditableDataChange("telefone", e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              {/* Botões de ação para edição */}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={onVoltar} disabled={isLoading}>
                  Cancelar
                </Button>
                <Button onClick={handleSalvar} disabled={isLoading}>
                  {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </div>
          )}

          {activeSection === 'notificacoes' && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Seção de notificações em desenvolvimento.</p>
            </div>
          )}

          {activeSection === 'sair' && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Funcionalidade de logout em desenvolvimento.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfiguracoesPerfil;
