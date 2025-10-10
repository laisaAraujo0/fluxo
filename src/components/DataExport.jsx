import { useState } from 'react';
import { Download, FileJson, FileSpreadsheet, FileText, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import dataExportService from '@/services/dataExportService';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';

const DataExport = () => {
  const { user } = useUser();
  const [selectedFormat, setSelectedFormat] = useState('json');
  const [exporting, setExporting] = useState(false);
  const [lastExport, setLastExport] = useState(null);

  const formats = [
    {
      id: 'json',
      name: 'JSON',
      description: 'Formato estruturado ideal para backup e importação',
      icon: FileJson,
      color: 'text-blue-500'
    },
    {
      id: 'csv',
      name: 'CSV',
      description: 'Planilha compatível com Excel e Google Sheets',
      icon: FileSpreadsheet,
      color: 'text-green-500'
    },
    {
      id: 'html',
      name: 'HTML/PDF',
      description: 'Documento formatado para visualização e impressão',
      icon: FileText,
      color: 'text-orange-500'
    }
  ];

  const handleExport = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para exportar dados');
      return;
    }

    setExporting(true);

    try {
      const result = await dataExportService.exportData(user.id, selectedFormat);

      if (result.success) {
        toast.success(`Dados exportados com sucesso em formato ${result.format.toUpperCase()}`);
        setLastExport({
          format: result.format,
          filename: result.filename,
          timestamp: new Date().toISOString()
        });
        
        if (result.note) {
          toast.info(result.note);
        }
      } else {
        toast.error(result.error || 'Erro ao exportar dados');
      }
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast.error('Erro ao exportar dados');
    } finally {
      setExporting(false);
    }
  };

  const getFormatIcon = (formatId) => {
    const format = formats.find(f => f.id === formatId);
    return format ? format.icon : FileJson;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Exportar Meus Dados
        </CardTitle>
        <CardDescription>
          Faça download de todos os seus dados em diferentes formatos
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Seleção de Formato */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Escolha o formato de exportação</Label>
          
          <RadioGroup value={selectedFormat} onValueChange={setSelectedFormat}>
            <div className="space-y-3">
              {formats.map((format) => {
                const Icon = format.icon;
                return (
                  <div
                    key={format.id}
                    className={`
                      flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${selectedFormat === format.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                      }
                    `}
                    onClick={() => setSelectedFormat(format.id)}
                  >
                    <RadioGroupItem value={format.id} id={format.id} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`h-5 w-5 ${format.color}`} />
                        <Label htmlFor={format.id} className="font-semibold cursor-pointer">
                          {format.name}
                        </Label>
                        {selectedFormat === format.id && (
                          <Check className="h-4 w-4 text-primary ml-auto" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </RadioGroup>
        </div>

        {/* Informações sobre os dados */}
        <Alert>
          <AlertDescription>
            <p className="font-medium mb-2">O que será exportado:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Informações do perfil</li>
              <li>Eventos participados e criados</li>
              <li>Reclamações registradas</li>
              <li>Notificações recebidas</li>
              <li>Preferências e configurações</li>
              <li>Histórico de interações</li>
              <li>Estatísticas de uso</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Último export */}
        {lastExport && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="font-medium">Última exportação</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Formato: <Badge variant="secondary">{lastExport.format.toUpperCase()}</Badge></p>
              <p>Arquivo: {lastExport.filename}</p>
              <p>Data: {new Date(lastExport.timestamp).toLocaleString('pt-BR')}</p>
            </div>
          </div>
        )}

        {/* Botão de exportação */}
        <Button
          onClick={handleExport}
          disabled={exporting || !user}
          className="w-full"
          size="lg"
        >
          {exporting ? (
            <>
              <Download className="h-4 w-4 mr-2 animate-pulse" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Exportar Dados
            </>
          )}
        </Button>

        {/* Nota sobre privacidade */}
        <div className="text-xs text-muted-foreground border-t pt-4">
          <p className="font-medium mb-1">Sobre seus dados:</p>
          <p>
            Seus dados são armazenados localmente no seu navegador e você tem total controle sobre eles. 
            Esta exportação permite que você faça backup ou transfira seus dados para outro dispositivo.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataExport;

