import { useState, useEffect } from 'react';
import { ArrowLeft, User, Edit, Lock, Bell, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useUser } from '@/contexts/UserContext';
import userProfileService from '@/services/userProfileService';
import { toast } from 'sonner';

const ConfiguracoesPerfil = ({ userData, setUserData, onVoltar, initialSection = "perfil" }) => {
  const { updateUser, user } = useUser();
  const [activeSection, setActiveSection] = useState(initialSection);
  const [isLoading, setIsLoading] = useState(false);
  const [configuracoes, setConfiguracoes] = useState({
    perfilPublico: userData.privacidade?.perfilPublico ?? true,
    mostrarEmail: userData.privacidade?.mostrarEmail ?? true,
    mostrarCidade: userData.privacidade?.mostrarCidade ?? true,
    mostrarTelefone: userData.privacidade?.mostrarTelefone ?? false,
    notificacaoCurtida: userData.notificacaoCurtida ?? true,
    notificacaoComentario: userData.notificacaoComentario ?? true,
    notificacaoAtualizacaoSite: userData.notificacaoAtualizacaoSite ?? true,
    notificacaoAprovacaoPublica: userData.notificacaoAprovacaoPublica ?? true,
    novoUsuarioBloquear: ''
  });

  const [editableUserData, setEditableUserData] = useState({
    nome: userData.nome || '',
    email: userData.email || '',
    cidade: userData.cidade || '',
    estado: userData.estado || '',
    telefone: userData.telefone || '',
    // REMOVIDO: bio: userData.bio || '',
  });

  // Sincronizar dados quando userData muda (vindo do contexto)
  useEffect(() => {
    if (userData) {
      setEditableUserData({
        nome: userData.nome || '',
        email: userData.email || '',
        cidade: userData.cidade || '',
        estado: userData.estado || '',
        telefone: userData.telefone || '',
        // REMOVIDO: bio: userData.bio || '',
      });

      setConfiguracoes(prev => ({
        ...prev,
        perfilPublico: userData.privacidade?.perfilPublico ?? true,
        mostrarEmail: userData.privacidade?.mostrarEmail ?? true,
        mostrarCidade: userData.privacidade?.mostrarCidade ?? true,
        mostrarTelefone: userData.privacidade?.mostrarTelefone ?? false,
        notificacaoCurtida: userData.notificacaoCurtida ?? true,
        notificacaoComentario: userData.notificacaoComentario ?? true,
        notificacaoAtualizacaoSite: userData.notificacaoAtualizacaoSite ?? true,
        notificacaoAprovacaoPublica: userData.notificacaoAprovacaoPublica ?? true,
      }));
    }
  }, [userData]);

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
      // Se userProfileService.validateProfileData não puder lidar com a falta de 'bio',
      // você precisará modificá-lo ou passar apenas os campos existentes.
      const dataToValidate = { ...editableUserData };
      // delete dataToValidate.bio; // Se você usasse 'bio' no editableUserData.
      const validation = userProfileService.validateProfileData(dataToValidate);
      
      if (!validation.isValid) {
        toast.error(`Erro de validação: ${Object.values(validation.errors).join(', ')}`);
        setIsLoading(false);
        return;
      }

      // Preparar dados para envio
      const profileData = {
        ...editableUserData,
        // REMOVIDO: bio: editableUserData.bio,
        privacidade: { // Ajustado para enviar 'privacidade' como objeto, se necessário
          perfilPublico: configuracoes.perfilPublico,
          mostrarEmail: configuracoes.mostrarEmail,
          mostrarCidade: configuracoes.mostrarCidade,
          mostrarTelefone: configuracoes.mostrarTelefone,
        },
        notificacaoCurtida: configuracoes.notificacaoCurtida,
        notificacaoComentario: configuracoes.notificacaoComentario,
        notificacaoAtualizacaoSite: configuracoes.notificacaoAtualizacaoSite,
        notificacaoAprovacaoPublica: configuracoes.notificacaoAprovacaoPublica,
      };

      // Atualizar no backend
      // Verifica se o userProfileService.updateUserProfile lida bem com a ausência de 'bio'
      await userProfileService.updateUserProfile(profileData);

      // Atualizar estado local (userData) com os dados salvos
      setUserData(prev => ({
        ...prev,
        ...editableUserData,
        // REMOVIDO: bio: editableUserData.bio,
        privacidade: {
          perfilPublico: configuracoes.perfilPublico,
          mostrarEmail: configuracoes.mostrarEmail,
          mostrarCidade: configuracoes.mostrarCidade,
          mostrarTelefone: configuracoes.mostrarTelefone,
        },
        notificacaoCurtida: configuracoes.notificacaoCurtida,
        notificacaoComentario: configuracoes.notificacaoComentario,
        notificacaoAtualizacaoSite: configuracoes.notificacaoAtualizacaoSite,
        notificacaoAprovacaoPublica: configuracoes.notificacaoAprovacaoPublica,
      }));

      // Atualizar contexto do usuário com os dados sincronizados
      updateUser({
        nome: editableUserData.nome,
        email: editableUserData.email,
        cidade: editableUserData.cidade,
        estado: editableUserData.estado,
        telefone: editableUserData.telefone,
        // REMOVIDO: bio: editableUserData.bio,
        perfilPublico: configuracoes.perfilPublico,
        mostrarEmail: configuracoes.mostrarEmail,
        mostrarCidade: configuracoes.mostrarCidade,
        mostrarTelefone: configuracoes.mostrarTelefone,
        notificacaoCurtida: configuracoes.notificacaoCurtida,
        notificacaoComentario: configuracoes.notificacaoComentario,
        notificacaoAtualizacaoSite: configuracoes.notificacaoAtualizacaoSite,
        notificacaoAprovacaoPublica: configuracoes.notificacaoAprovacaoPublica,
      });

      toast.success("Configurações salvas com sucesso!");
      onVoltar();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error("Erro ao salvar configurações. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDesbloquear = (userId) => {
    console.log('Desbloqueando usuário:', userId);
    toast.info('Usuário desbloqueado!');
  };

  const handleBloquearUsuario = () => {
    if (configuracoes.novoUsuarioBloquear.trim()) {
      console.log('Bloqueando usuário:', configuracoes.novoUsuarioBloquear);
      toast.success(`Usuário ${configuracoes.novoUsuarioBloquear} bloqueado!`);
      handleConfigChange('novoUsuarioBloquear', '');
    }
  };

  const { logout } = useUser();

  const handleLogout = () => {
    console.log('Executando logout...');
    logout(); // Chamada real de logout
    // O redirecionamento para /login deve ser tratado pelo router principal após o logout,
    // mas adicionamos um fallback para garantir.
    window.location.href = '/login'; 
  };

  const menuItems = [
    { id: 'perfil', label: 'Informações do Perfil', icon: User },
    { id: 'editar', label: 'Editar Informações', icon: Edit },
    { id: 'privacidade', label: 'Privacidade', icon: Lock },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'sair', label: 'Sair', icon: LogOut, danger: true }
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-8 overflow-y-auto">
      {/* Cabeçalho */}
      <div className="mb-8 overflow-y-auto">
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground overflow-y-auto">
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 overflow-y-auto">
        {/* Sidebar */}
        <div className="md:col-span-1 overflow-y-auto">
          <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-left overflow-y-auto">
            <div className="relative overflow-y-auto">
              <div 
                className="h-24 w-24 rounded-full bg-cover bg-center ring-4 ring-background"
                style={{
                    backgroundImage: `url(${userData.profilePic || "https://via.placeholder.com/150"})`
              }}
              />
            </div>
            <div className="flex flex-col overflow-y-auto">
              <h2 className="text-2xl font-bold text-foreground"> {userData?.nome || 'Usuário'}</h2>
              <p className="text-sm text-muted-foreground">{userData?.email || '@usuario'}</p>
            </div>

            {/* Menu de navegação */}
            <nav className="w-full overflow-y-auto">
              <ul className="space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id} className="overflow-y-auto">
                      <button
                        onClick={() => setActiveSection(item.id)}
                        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium w-full text-left transition-colors overflow-y-auto ${
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
        <div className="md:col-span-3 overflow-y-auto">
          {activeSection === 'privacidade' && (
            <div className="space-y-8 overflow-y-auto">
              <div className="overflow-y-auto">
                <h3 className="text-2xl font-bold text-foreground">Configurações de Privacidade</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Controle como suas informações são vistas e compartilhadas na plataforma.
                </p>
              </div>

              {/* Visibilidade do Perfil */}
              <div className="space-y-6 rounded-lg border border-border p-6 overflow-y-auto">
                <div className="space-y-2 overflow-y-auto">
                  <h4 className="text-lg font-semibold text-foreground">Visibilidade do Perfil</h4>
                  <p className="text-sm text-muted-foreground">
                    Decida quem pode ver seu perfil e suas atividades.
                  </p>
                </div>
                
                <RadioGroup 
                  value={configuracoes.perfilPublico ? 'publico' : 'privado'}
                  onValueChange={(value) => handleConfigChange('perfilPublico', value === 'publico')}
                  className="space-y-4 overflow-y-auto"
                >
                  <div className="flex items-start space-x-3 overflow-y-auto">
                    <RadioGroupItem value="publico" id="publico" className="mt-1" />
                    <div className="space-y-1 overflow-y-auto">
                      <Label htmlFor="publico" className="font-medium text-foreground">
                        Público
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Qualquer pessoa pode ver seu perfil, suas contribuições e interações.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 overflow-y-auto">
                    <RadioGroupItem value="privado" id="privado" className="mt-1" />
                    <div className="space-y-1 overflow-y-auto">
                      <Label htmlFor="privado" className="font-medium text-foreground">
                        Privado
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Apenas conexões aprovadas podem ver suas informações detalhadas.
                      </p>
                    </div>
                  </div>
                </RadioGroup>

                <div className="space-y-4 overflow-y-auto">
                  <div className="flex items-center justify-between overflow-y-auto">
                    <div className="overflow-y-auto">
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
                  <div className="flex items-center justify-between overflow-y-auto">
                    <div className="overflow-y-auto">
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

              {/* Botões de ação */}
              <div className="flex justify-end gap-3 pt-4 overflow-y-auto">
                <Button variant="outline" onClick={onVoltar} disabled={isLoading}>
                  Cancelar
                </Button>
                <Button onClick={handleSalvar} disabled={isLoading}>
                  {isLoading ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          )}

          {activeSection === 'perfil' && (
            <div className="space-y-8 overflow-y-auto">
              <div className="overflow-y-auto">
                <h3 className="text-2xl font-bold text-foreground">Informações do Perfil</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Visualize suas informações pessoais cadastradas.
                </p>
              </div>

              <div className="space-y-4 rounded-lg border border-border p-6 overflow-y-auto">
                <div className="flex items-center justify-between overflow-y-auto">
                  <p className="font-medium text-foreground">Nome:</p>
                  <p className="text-muted-foreground">{userData.nome}</p>
                </div>
                <div className="flex items-center justify-between overflow-y-auto">
                  <p className="font-medium text-foreground">Email:</p>
                  <p className="text-muted-foreground">
                    {userData.privacidade.mostrarEmail ? userData.email : "Privado"}
                  </p>
                </div>

                {/* REMOVIDO: {userData.bio && (...)} */}
                
                <div className="flex items-center justify-between overflow-y-auto">
                  <p className="font-medium text-foreground">Cidade:</p>
                  <p className="text-muted-foreground">
                    {userData.privacidade.mostrarCidade ? userData.cidade : "Privado"}
                  </p>
                </div>
                <div className="flex items-center justify-between overflow-y-auto">
                  <p className="font-medium text-foreground">Estado:</p>
                  <p className="text-muted-foreground">
                    {userData.privacidade.mostrarCidade ? userData.estado : "Privado"}
                  </p>
                </div>
                {userData.telefone && (
                  <div className="flex items-center justify-between overflow-y-auto">
                    <p className="font-medium text-foreground">Telefone:</p>
                    <p className="text-muted-foreground">
                      {userData.privacidade.mostrarTelefone ? userData.telefone : "Privado"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'editar' && (
            <div className="space-y-8 overflow-y-auto">
              <div className="overflow-y-auto">
                <h3 className="text-2xl font-bold text-foreground">Editar Informações</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Atualize seus dados pessoais.
                </p>
              </div>

              <div className="space-y-4 rounded-lg border border-border p-6 overflow-y-auto">
                <div className="overflow-y-auto">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={editableUserData.nome}
                    onChange={(e) => handleEditableDataChange("nome", e.target.value)}
                    className="overflow-x-auto"
                  />
                </div>
                <div className="overflow-y-auto">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editableUserData.email}
                    onChange={(e) => handleEditableDataChange("email", e.target.value)}
                    className="overflow-x-auto"
                  />
                </div>
                {/* REMOVIDO: Campo de input para Bio */}
                <div className="overflow-y-auto">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={editableUserData.cidade}
                    onChange={(e) => handleEditableDataChange("cidade", e.target.value)}
                    className="overflow-x-auto"
                  />
                </div>
                <div className="overflow-y-auto">
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={editableUserData.estado}
                    onChange={(e) => handleEditableDataChange("estado", e.target.value)}
                    className="overflow-x-auto"
                  />
                </div>
                <div className="overflow-y-auto">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    type="tel"
                    value={editableUserData.telefone}
                    onChange={(e) => handleEditableDataChange("telefone", e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="overflow-x-auto"
                  />
                </div>
              </div>

              {/* Botões de ação para edição */}
              <div className="flex justify-end gap-3 pt-4 overflow-y-auto">
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
            <div className="space-y-8 overflow-y-auto">
              <div className="overflow-y-auto">
                <h3 className="text-2xl font-bold text-foreground">Configurações de Notificação</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Gerencie quais notificações você deseja receber.
                </p>
              </div>

              <div className="space-y-6 rounded-lg border border-border p-6 overflow-y-auto">
                <div className="flex items-center justify-between overflow-y-auto">
                  <div className="overflow-y-auto">
                    <h5 className="font-medium text-foreground">Curtidas</h5>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações quando alguém curtir suas postagens ou eventos.
                    </p>
                  </div>
                  <Switch
                    checked={configuracoes.notificacaoCurtida}
                    onCheckedChange={(checked) => handleConfigChange('notificacaoCurtida', checked)}
                  />
                </div>
                <div className="flex items-center justify-between overflow-y-auto">
                  <div className="overflow-y-auto">
                    <h5 className="font-medium text-foreground">Comentários</h5>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações quando alguém comentar em suas postagens.
                    </p>
                  </div>
                  <Switch
                    checked={configuracoes.notificacaoComentario}
                    onCheckedChange={(checked) => handleConfigChange('notificacaoComentario', checked)}
                  />
                </div>
                <div className="flex items-center justify-between overflow-y-auto">
                  <div className="overflow-y-auto">
                    <h5 className="font-medium text-foreground">Atualização do Site</h5>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações sobre novas funcionalidades e atualizações importantes do site.
                    </p>
                  </div>
                  <Switch
                    checked={configuracoes.notificacaoAtualizacaoSite}
                    onCheckedChange={(checked) => handleConfigChange('notificacaoAtualizacaoSite', checked)}
                  />
                </div>
                <div className="flex items-center justify-between overflow-y-auto">
                  <div className="overflow-y-auto">
                    <h5 className="font-medium text-foreground">Aprovação Pública do Órgão</h5>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações sobre a aprovação pública de eventos ou postagens pelo órgão responsável.
                    </p>
                  </div>
                  <Switch
                    checked={configuracoes.notificacaoAprovacaoPublica}
                    onCheckedChange={(checked) => handleConfigChange('notificacaoAprovacaoPublica', checked)}
                  />
                </div>
                <div className="flex justify-end pt-4 overflow-y-auto">
                  <Button onClick={handleSalvar} disabled={isLoading}>
                    {isLoading ? 'Salvando...' : 'Salvar Notificações'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'sair' && (
            <div className="space-y-8 overflow-y-auto">
              <div className="overflow-y-auto">
                <h3 className="text-2xl font-bold text-foreground">Sair da Conta</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ao sair, você precisará fazer login novamente para acessar sua conta.
                </p>
              </div>

              <div className="space-y-6 rounded-lg border border-border p-6 overflow-y-auto">
                <p className="text-lg text-muted-foreground overflow-y-auto">
                  Tem certeza de que deseja sair?
                </p>
                <Button 
                  variant="destructive" 
                  className="w-full md:w-auto"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfiguracoesPerfil;