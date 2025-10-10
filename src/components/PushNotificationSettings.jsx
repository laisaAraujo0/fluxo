import { useState, useEffect } from 'react';
import { Bell, BellOff, Check, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import pushNotificationService from '@/services/pushNotifications';

const PushNotificationSettings = () => {
  const [permission, setPermission] = useState('default');
  const [isEnabled, setIsEnabled] = useState(false);
  const [settings, setSettings] = useState({
    novosEventos: true,
    atualizacoesReclamacoes: true,
    lembretes: true,
    notificacoesSistema: false
  });

  useEffect(() => {
    // Verificar permissão atual
    const currentPermission = pushNotificationService.getPermissionStatus();
    setPermission(currentPermission);
    setIsEnabled(currentPermission === 'granted');

    // Carregar configurações salvas
    const savedSettings = localStorage.getItem('pushNotificationSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleRequestPermission = async () => {
    const granted = await pushNotificationService.requestPermission();
    
    if (granted) {
      setPermission('granted');
      setIsEnabled(true);
      toast.success('Notificações ativadas com sucesso!');
      
      // Enviar notificação de teste
      pushNotificationService.notifyCustom(
        'Notificações Ativadas',
        'Você receberá notificações sobre eventos e atualizações',
        {
          icon: '/logo.png'
        }
      );
    } else {
      toast.error('Permissão de notificações negada');
    }
  };

  const handleToggleNotifications = async () => {
    if (!isEnabled) {
      await handleRequestPermission();
    } else {
      setIsEnabled(false);
      toast.info('Notificações desativadas');
    }
  };

  const handleSettingChange = (setting, value) => {
    const newSettings = {
      ...settings,
      [setting]: value
    };
    setSettings(newSettings);
    localStorage.setItem('pushNotificationSettings', JSON.stringify(newSettings));
    toast.success('Configuração atualizada');
  };

  const handleTestNotification = () => {
    if (permission !== 'granted') {
      toast.error('Por favor, ative as notificações primeiro');
      return;
    }

    pushNotificationService.notifyCustom(
      'Notificação de Teste',
      'Esta é uma notificação de teste do Mapa da Realidade',
      {
        icon: '/logo.png',
        requireInteraction: false
      }
    );
    
    toast.success('Notificação de teste enviada!');
  };

  const getPermissionBadge = () => {
    switch (permission) {
      case 'granted':
        return <Badge className="bg-green-500">Ativado</Badge>;
      case 'denied':
        return <Badge variant="destructive">Bloqueado</Badge>;
      default:
        return <Badge variant="secondary">Não configurado</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações Push
            </CardTitle>
            <CardDescription>
              Configure como você deseja receber notificações
            </CardDescription>
          </div>
          {getPermissionBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status e Ativação */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            {isEnabled ? (
              <Bell className="h-5 w-5 text-green-500" />
            ) : (
              <BellOff className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">
                {isEnabled ? 'Notificações Ativadas' : 'Notificações Desativadas'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isEnabled 
                  ? 'Você receberá notificações no navegador' 
                  : 'Ative para receber notificações em tempo real'
                }
              </p>
            </div>
          </div>
          <Button
            onClick={handleToggleNotifications}
            variant={isEnabled ? 'outline' : 'default'}
          >
            {isEnabled ? 'Desativar' : 'Ativar'}
          </Button>
        </div>

        {/* Configurações Detalhadas */}
        {isEnabled && (
          <>
            <div className="space-y-4">
              <h3 className="font-semibold">Tipos de Notificação</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="novos-eventos">Novos Eventos</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações sobre eventos próximos a você
                    </p>
                  </div>
                  <Switch
                    id="novos-eventos"
                    checked={settings.novosEventos}
                    onCheckedChange={(checked) => handleSettingChange('novosEventos', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="atualizacoes">Atualizações de Reclamações</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificações sobre mudanças no status das suas reclamações
                    </p>
                  </div>
                  <Switch
                    id="atualizacoes"
                    checked={settings.atualizacoesReclamacoes}
                    onCheckedChange={(checked) => handleSettingChange('atualizacoesReclamacoes', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="lembretes">Lembretes de Eventos</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba lembretes antes dos eventos começarem
                    </p>
                  </div>
                  <Switch
                    id="lembretes"
                    checked={settings.lembretes}
                    onCheckedChange={(checked) => handleSettingChange('lembretes', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sistema">Notificações do Sistema</Label>
                    <p className="text-sm text-muted-foreground">
                      Atualizações e avisos importantes do sistema
                    </p>
                  </div>
                  <Switch
                    id="sistema"
                    checked={settings.notificacoesSistema}
                    onCheckedChange={(checked) => handleSettingChange('notificacoesSistema', checked)}
                  />
                </div>
              </div>
            </div>

            {/* Botão de Teste */}
            <div className="pt-4 border-t">
              <Button
                onClick={handleTestNotification}
                variant="outline"
                className="w-full"
              >
                Enviar Notificação de Teste
              </Button>
            </div>
          </>
        )}

        {/* Informações sobre Permissões */}
        {permission === 'denied' && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-start gap-3">
              <X className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Notificações Bloqueadas</p>
                <p className="text-sm text-muted-foreground mt-1">
                  As notificações foram bloqueadas para este site. Para ativá-las, 
                  você precisa alterar as configurações do seu navegador.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Informações sobre Suporte */}
        {!pushNotificationService.isSupported() && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-start gap-3">
              <X className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Notificações Não Suportadas</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Seu navegador não suporta notificações push. 
                  Considere atualizar para a versão mais recente.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PushNotificationSettings;

