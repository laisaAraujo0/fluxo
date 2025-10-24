// Service para gerenciar categorias de forma centralizada
class CategoryService {
  constructor() {
    this.categories = this.loadCategories();
  }

  // Carregar categorias do localStorage
  loadCategories() {
    const savedCategories = localStorage.getItem('categories');
    if (savedCategories) {
      return JSON.parse(savedCategories);
    }
    
    // Categorias padrão
    return [
      {
        id: 'infraestrutura',
        nome: 'Infraestrutura',
        descricao: 'Problemas e eventos relacionados à infraestrutura urbana',
        cor: '#ef4444',
        icone: '🏗️'
      },
      {
        id: 'cultura',
        nome: 'Cultura',
        descricao: 'Eventos culturais e artísticos',
        cor: '#f59e0b',
        icone: '🎭'
      },
      {
        id: 'esporte',
        nome: 'Esporte',
        descricao: 'Eventos e atividades esportivas',
        cor: '#10b981',
        icone: '⚽'
      },
      {
        id: 'educacao',
        nome: 'Educação',
        descricao: 'Eventos educacionais e workshops',
        cor: '#3b82f6',
        icone: '📚'
      },
      {
        id: 'saude',
        nome: 'Saúde',
        descricao: 'Eventos relacionados à saúde e bem-estar',
        cor: '#06b6d4',
        icone: '⚕️'
      },
      {
        id: 'meio-ambiente',
        nome: 'Meio Ambiente',
        descricao: 'Iniciativas ambientais e sustentabilidade',
        cor: '#10b981',
        icone: '🌿'
      },
      {
        id: 'tecnologia',
        nome: 'Tecnologia',
        descricao: 'Eventos de tecnologia e inovação',
        cor: '#8b5cf6',
        icone: '💻'
      },
      {
        id: 'gastronomia',
        nome: 'Gastronomia',
        descricao: 'Eventos gastronômicos e culinários',
        cor: '#ec4899',
        icone: '🍽️'
      },
      {
        id: 'musica',
        nome: 'Música',
        descricao: 'Eventos musicais e shows',
        cor: '#d946ef',
        icone: '🎵'
      },
      {
        id: 'arte',
        nome: 'Arte',
        descricao: 'Exposições e eventos artísticos',
        cor: '#f97316',
        icone: '🎨'
      },
      {
        id: 'seguranca',
        nome: 'Segurança',
        descricao: 'Questões de segurança pública',
        cor: '#dc2626',
        icone: '🚨'
      },
      {
        id: 'mobilidade-urbana',
        nome: 'Mobilidade Urbana',
        descricao: 'Transporte e mobilidade urbana',
        cor: '#0891b2',
        icone: '🚌'
      },
      {
        id: 'evento-comunitario',
        nome: 'Evento Comunitário',
        descricao: 'Eventos comunitários diversos',
        cor: '#6366f1',
        icone: '👥'
      },
      {
        id: 'outros',
        nome: 'Outros',
        descricao: 'Outras categorias',
        cor: '#6b7280',
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

