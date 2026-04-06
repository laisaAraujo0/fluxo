// Service para gerenciar categorias de forma centralizada
class CategoryService {
  constructor() {
    this.categories = this.loadCategories();
  }

  // Carregar categorias
  loadCategories() {
    // Força a limpeza do cache antigo para usar os novos Enums
    localStorage.removeItem('categories');

    // Categorias padrão
    return [
      {
        id: 'INFRASTRUCTURE',
        nome: 'Infraestrutura',
        descricao: 'Problemas e eventos relacionados à infraestrutura urbana',
        cor: '#ef4444',
        icone: '🏗️'
      },
      {
        id: 'CULTURE',
        nome: 'Cultura',
        descricao: 'Eventos culturais e artísticos',
        cor: '#f59e0b',
        icone: '🎭'
      },
      {
        id: 'SPORT',
        nome: 'Esporte',
        descricao: 'Eventos e atividades esportivas',
        cor: '#10b981',
        icone: '⚽'
      },
      {
        id: 'EDUCATION',
        nome: 'Educação',
        descricao: 'Eventos educacionais e workshops',
        cor: '#3b82f6',
        icone: '📚'
      },
      {
        id: 'HEALTH',
        nome: 'Saúde',
        descricao: 'Eventos relacionados à saúde e bem-estar',
        cor: '#06b6d4',
        icone: '⚕️'
      },
      {
        id: 'ENVIRONMENT',
        nome: 'Meio Ambiente',
        descricao: 'Iniciativas ambientais e sustentabilidade',
        cor: '#10b981',
        icone: '🌿'
      },
      {
        id: 'TECHNOLOGY',
        nome: 'Tecnologia',
        descricao: 'Eventos de tecnologia e inovação',
        cor: '#8b5cf6',
        icone: '💻'
      },
      {
        id: 'GASTRONOMY',
        nome: 'Gastronomia',
        descricao: 'Eventos gastronômicos e feiras de comida',
        cor: '#f97316',
        icone: '🍔'
      },
      {
        id: 'MUSIC',
        nome: 'Música',
        descricao: 'Shows, concertos e apresentações musicais',
        cor: '#ec4899',
        icone: '🎵'
      },
      {
        id: 'ART',
        nome: 'Arte',
        descricao: 'Exposições de arte, galerias e intervenções urbanas',
        cor: '#d946ef',
        icone: '🎨'
      },
      {
        id: 'SECURITY',
        nome: 'Segurança',
        descricao: 'Questões e eventos de segurança pública',
        cor: '#1e3a8a',
        icone: '🚓'
      },
      {
        id: 'URBAN_MOBILITY',
        nome: 'Mobilidade Urbana',
        descricao: 'Trânsito, ciclovias e transporte',
        cor: '#64748b',
        icone: '🚲'
      },
      {
        id: 'COMMUNITY_EVENT',
        nome: 'Evento Comunitário',
        descricao: 'Reuniões de bairro, assembleias e encontros locais',
        cor: '#14b8a6',
        icone: '🤝'
      },
      {
        id: 'OTHER',
        nome: 'Outros',
        descricao: 'Demais eventos não categorizados',
        cor: '#64748b',
        icone: '📌'
      }
    ];
  }

  // Salvar categorias no localStorage
  saveCategories() {
    localStorage.setItem('categories', JSON.stringify(this.categories));
  }

  // Obter todas as categorias
  getAllCategories() {
    return this.categories;
  }

  // Obter categoria por ID
  getCategoryById(id) {
    return this.categories.find(cat => cat.id === id);
  }

  // Obter cor da categoria
  getCategoryColor(categoryId) {
    const category = this.getCategoryById(categoryId);
    return category ? category.cor : '#6b7280';
  }

  // Obter ícone da categoria
  getCategoryIcon(categoryId) {
    const category = this.getCategoryById(categoryId);
    return category ? category.icone : '📌';
  }

  // Obter nome da categoria
  getCategoryName(categoryId) {
    const category = this.getCategoryById(categoryId);
    return category ? category.nome : 'Outros';
  }

  // Adicionar nova categoria
  addCategory(categoryData) {
    const newCategory = {
      id: categoryData.id || categoryData.nome.toLowerCase().replace(/\s+/g, '-'),
      nome: categoryData.nome,
      descricao: categoryData.descricao || '',
      cor: categoryData.cor || '#6b7280',
      icone: categoryData.icone || '📌'
    };

    // Verificar se a categoria já existe
    if (!this.categories.find(cat => cat.id === newCategory.id)) {
      this.categories.push(newCategory);
      this.saveCategories();
      return newCategory;
    }

    return null;
  }

  // Atualizar categoria
  updateCategory(categoryId, updates) {
    const category = this.getCategoryById(categoryId);
    if (category) {
      Object.assign(category, updates);
      this.saveCategories();
      return category;
    }
    return null;
  }

  // Deletar categoria
  deleteCategory(categoryId) {
    const index = this.categories.findIndex(cat => cat.id === categoryId);
    if (index > -1) {
      const deletedCategory = this.categories.splice(index, 1)[0];
      this.saveCategories();
      return deletedCategory;
    }
    return null;
  }

  // Obter opções de categoria para select
  getCategoryOptions() {
    return this.categories.map(cat => ({
      value: cat.id,
      label: cat.nome,
      color: cat.cor,
      icon: cat.icone
    }));
  }
}

// Instância singleton
const categoryService = new CategoryService();

export default categoryService;

