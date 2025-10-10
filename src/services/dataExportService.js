// Serviço de Exportação de Dados do Usuário
// Permite exportar dados em diferentes formatos (JSON, CSV, PDF)

class DataExportService {
  constructor() {
    this.exportFormats = ['json', 'csv', 'pdf'];
  }

  // Coletar todos os dados do usuário
  async collectUserData(userId) {
    try {
      // Coletar dados de diferentes fontes
      const userData = {
        perfil: this.getUserProfile(userId),
        eventos: this.getUserEvents(userId),
        reclamacoes: this.getUserComplaints(userId),
        notificacoes: this.getUserNotifications(userId),
        preferencias: this.getUserPreferences(userId),
        interacoes: this.getUserInteractions(userId),
        estatisticas: this.getUserStats(userId),
        exportadoEm: new Date().toISOString()
      };

      return {
        success: true,
        data: userData
      };
    } catch (error) {
      console.error('Erro ao coletar dados do usuário:', error);
      return {
        success: false,
        error: 'Erro ao coletar dados do usuário'
      };
    }
  }

  // Obter perfil do usuário
  getUserProfile(userId) {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  // Obter eventos do usuário
  getUserEvents(userId) {
    const eventsStr = localStorage.getItem('userEvents');
    if (!eventsStr) return [];

    try {
      return JSON.parse(eventsStr);
    } catch {
      return [];
    }
  }

  // Obter reclamações do usuário
  getUserComplaints(userId) {
    const complaintsStr = localStorage.getItem('userComplaints');
    if (!complaintsStr) return [];

    try {
      return JSON.parse(complaintsStr);
    } catch {
      return [];
    }
  }

  // Obter notificações do usuário
  getUserNotifications(userId) {
    const notificationsStr = localStorage.getItem('userNotifications');
    if (!notificationsStr) return [];

    try {
      return JSON.parse(notificationsStr);
    } catch {
      return [];
    }
  }

  // Obter preferências do usuário
  getUserPreferences(userId) {
    const preferencesStr = localStorage.getItem('userPreferences');
    if (!preferencesStr) return {};

    try {
      return JSON.parse(preferencesStr);
    } catch {
      return {};
    }
  }

  // Obter interações do usuário
  getUserInteractions(userId) {
    const interactionsStr = localStorage.getItem('userInteractions');
    if (!interactionsStr) return [];

    try {
      return JSON.parse(interactionsStr);
    } catch {
      return [];
    }
  }

  // Obter estatísticas do usuário
  getUserStats(userId) {
    return {
      totalEventos: this.getUserEvents(userId).length,
      totalReclamacoes: this.getUserComplaints(userId).length,
      totalNotificacoes: this.getUserNotifications(userId).length,
      totalInteracoes: this.getUserInteractions(userId).length
    };
  }

  // Exportar dados em formato JSON
  async exportJSON(userId) {
    try {
      const result = await this.collectUserData(userId);
      
      if (!result.success) {
        return result;
      }

      const jsonStr = JSON.stringify(result.data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const filename = `mapa-realidade-dados-${userId}-${Date.now()}.json`;
      this.downloadFile(url, filename);

      return {
        success: true,
        format: 'json',
        filename
      };
    } catch (error) {
      console.error('Erro ao exportar JSON:', error);
      return {
        success: false,
        error: 'Erro ao exportar dados em JSON'
      };
    }
  }

  // Exportar dados em formato CSV
  async exportCSV(userId) {
    try {
      const result = await this.collectUserData(userId);
      
      if (!result.success) {
        return result;
      }

      const data = result.data;
      let csvContent = '';

      // Perfil
      csvContent += 'PERFIL\n';
      if (data.perfil) {
        csvContent += this.objectToCSV(data.perfil);
      }
      csvContent += '\n\n';

      // Eventos
      csvContent += 'EVENTOS\n';
      if (data.eventos && data.eventos.length > 0) {
        csvContent += this.arrayToCSV(data.eventos);
      }
      csvContent += '\n\n';

      // Reclamações
      csvContent += 'RECLAMAÇÕES\n';
      if (data.reclamacoes && data.reclamacoes.length > 0) {
        csvContent += this.arrayToCSV(data.reclamacoes);
      }
      csvContent += '\n\n';

      // Estatísticas
      csvContent += 'ESTATÍSTICAS\n';
      if (data.estatisticas) {
        csvContent += this.objectToCSV(data.estatisticas);
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const filename = `mapa-realidade-dados-${userId}-${Date.now()}.csv`;
      this.downloadFile(url, filename);

      return {
        success: true,
        format: 'csv',
        filename
      };
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      return {
        success: false,
        error: 'Erro ao exportar dados em CSV'
      };
    }
  }

  // Converter objeto para CSV
  objectToCSV(obj) {
    const keys = Object.keys(obj);
    const values = Object.values(obj).map(v => 
      typeof v === 'object' ? JSON.stringify(v) : v
    );
    
    return keys.join(',') + '\n' + values.join(',') + '\n';
  }

  // Converter array de objetos para CSV
  arrayToCSV(arr) {
    if (arr.length === 0) return '';

    const keys = Object.keys(arr[0]);
    let csv = keys.join(',') + '\n';

    arr.forEach(obj => {
      const values = keys.map(key => {
        const value = obj[key];
        return typeof value === 'object' ? JSON.stringify(value) : value;
      });
      csv += values.join(',') + '\n';
    });

    return csv;
  }

  // Exportar dados em formato PDF (simplificado)
  async exportPDF(userId) {
    try {
      const result = await this.collectUserData(userId);
      
      if (!result.success) {
        return result;
      }

      // Para PDF, vamos criar um HTML e converter
      const data = result.data;
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Mapa da Realidade - Dados do Usuário</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #333; }
            h2 { color: #666; margin-top: 30px; }
            table { border-collapse: collapse; width: 100%; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .section { margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <h1>Mapa da Realidade - Dados do Usuário</h1>
          <p><strong>Exportado em:</strong> ${new Date(data.exportadoEm).toLocaleString('pt-BR')}</p>
          
          ${data.perfil ? `
            <div class="section">
              <h2>Perfil</h2>
              <table>
                ${Object.entries(data.perfil).map(([key, value]) => `
                  <tr>
                    <th>${key}</th>
                    <td>${typeof value === 'object' ? JSON.stringify(value) : value}</td>
                  </tr>
                `).join('')}
              </table>
            </div>
          ` : ''}
          
          ${data.estatisticas ? `
            <div class="section">
              <h2>Estatísticas</h2>
              <table>
                ${Object.entries(data.estatisticas).map(([key, value]) => `
                  <tr>
                    <th>${key}</th>
                    <td>${value}</td>
                  </tr>
                `).join('')}
              </table>
            </div>
          ` : ''}
          
          ${data.eventos && data.eventos.length > 0 ? `
            <div class="section">
              <h2>Eventos (${data.eventos.length})</h2>
              <p>Total de eventos participados ou criados</p>
            </div>
          ` : ''}
          
          ${data.reclamacoes && data.reclamacoes.length > 0 ? `
            <div class="section">
              <h2>Reclamações (${data.reclamacoes.length})</h2>
              <p>Total de reclamações registradas</p>
            </div>
          ` : ''}
        </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const filename = `mapa-realidade-dados-${userId}-${Date.now()}.html`;
      this.downloadFile(url, filename);

      return {
        success: true,
        format: 'html',
        filename,
        note: 'Arquivo HTML gerado. Você pode abrir no navegador e imprimir como PDF.'
      };
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      return {
        success: false,
        error: 'Erro ao exportar dados em PDF'
      };
    }
  }

  // Fazer download do arquivo
  downloadFile(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Exportar dados em formato especificado
  async exportData(userId, format = 'json') {
    switch (format.toLowerCase()) {
      case 'json':
        return await this.exportJSON(userId);
      case 'csv':
        return await this.exportCSV(userId);
      case 'pdf':
      case 'html':
        return await this.exportPDF(userId);
      default:
        return {
          success: false,
          error: `Formato não suportado: ${format}`
        };
    }
  }

  // Obter formatos disponíveis
  getAvailableFormats() {
    return this.exportFormats;
  }
}

// Criar instância única do serviço
const dataExportService = new DataExportService();

export default dataExportService;

// Exportar funções individuais
export const {
  collectUserData,
  exportJSON,
  exportCSV,
  exportPDF,
  exportData,
  getAvailableFormats
} = dataExportService;

