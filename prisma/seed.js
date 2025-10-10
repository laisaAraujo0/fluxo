import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuários
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'beatriz.almeida@email.com',
        name: 'Beatriz Almeida',
        username: 'beatriz.almeida',
        bio: 'Entusiasta da vida urbana',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTgZH5QmaCBG5kBLgV5LYcelEsV1n08WAfNFX6QsoH9DbTLkP8ucrf4-7Igm0NH1UoG5kcADzMvkXgKUReyLL1Ylt1mfQeAiXKxq-8kyOv0OZDCBXe7iNXqAHcy3Ja3k9cmZ00vEaGUMXjbz6B0qdxeDpoAZIpV9D3iYmU9KF6j9rWwDW9rw9mgFvsBX6z23vT8c0oxB2fz-w99BEBxjt_MKc539cD4RgfhbwnIK0ZIBNvDqoAQhHiD_Id_lHd7vUM9BY49RYikIA'
      }
    }),
    prisma.user.create({
      data: {
        email: 'ana.silva@email.com',
        name: 'Ana Silva',
        username: 'ana.silva',
        status: 'ACTIVE'
      }
    }),
    prisma.user.create({
      data: {
        email: 'carlos.mendes@email.com',
        name: 'Carlos Mendes',
        username: 'carlos.mendes',
        status: 'ACTIVE'
      }
    }),
    prisma.user.create({
      data: {
        email: 'admin@mapadarealidade.com',
        name: 'Administrador',
        username: 'admin',
        status: 'ACTIVE'
      }
    })
  ]);

  console.log('✅ Usuários criados:', users.length);

  // Criar categorias
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Infraestrutura',
        description: 'Problemas relacionados à infraestrutura urbana',
        eventsCount: 1234
      }
    }),
    prisma.category.create({
      data: {
        name: 'Segurança',
        description: 'Questões de segurança pública',
        eventsCount: 876
      }
    }),
    prisma.category.create({
      data: {
        name: 'Meio Ambiente',
        description: 'Problemas ambientais urbanos',
        eventsCount: 543
      }
    }),
    prisma.category.create({
      data: {
        name: 'Transporte Público',
        description: 'Questões relacionadas ao transporte público',
        eventsCount: 210
      }
    })
  ]);

  console.log('✅ Categorias criadas:', categories.length);

  // Criar eventos
  const events = await Promise.all([
    prisma.event.create({
      data: {
        title: 'Feira de Artesanato no Parque Central',
        description: 'Descubra peças únicas de artesãos locais.',
        location: 'Parque Central',
        category: 'OTHER',
        status: 'APPROVED',
        authorId: users[0].id,
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4phROEA8Q6SjAe5C7zXyd6mKedMgHoOiu-buU27-v5Ug61KmNgTIfMnEd1cBXzJH1L02QGiZ8aLQQgMfLwZigMT7gE-uOhAIuEHnlYmGuYvv57IFUHQNnd3N_Fd4ZjQIlPHabigm6CfsrzXCkjgBuC6Bs0TSuyHS9aZD38MVYkjJglJg4RhFJZVdQ9N0ywiDBrg3biFslBFbWQRd8N81x1f5bxKS8GsUPS0GaUrrJidlPmrQEtjST-6gLxPB2TLCQenkCcqvBit4'
      }
    }),
    prisma.event.create({
      data: {
        title: 'Concerto de Jazz ao Ar Livre',
        description: 'Aproveite uma noite de música sob as estrelas.',
        location: 'Praça da Música',
        category: 'OTHER',
        status: 'APPROVED',
        authorId: users[1].id,
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCP6HjMKtqkk8R4vsnsIUm3ZJOdznaYeIRVrTCQSfnlLPCHqe0YCrh6bWzY3zqbodD3B-5WFEE2PQuouNRSrYPOBVtN7VnZtKyExHQbWPPkChS_AZA79lF8ISFc8uNqSar9zipi5NWA6Aej_eSEPNUlNy6iWnSUVzGjHpH1LRk8_MBBd8Tcg91LkJLpi2gfhZ4mN627TWFN-9C0kgzGw0JtO05tdIbKw6KjKTHV7C2tIGa6wTI2dAkmVlFkKI_kJE5Ak8WyDz2aFRE'
      }
    }),
    prisma.event.create({
      data: {
        title: 'Oficina de Jardinagem Urbana',
        description: 'Aprenda a cultivar seu próprio jardim na cidade.',
        location: 'Centro Comunitário',
        category: 'ENVIRONMENT',
        status: 'APPROVED',
        authorId: users[2].id,
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDiRusMqqN00JFM-rxA8qZvFeLzXV_NLRP7oF0v_MOlQ7hUu55V2BAx7lm2T-3FrOXgSAGNvE4HDNWwDmv0YEtHVshljuwR-iUQBdwAR_zxjuxp64r-Ft11Mp11oP4eahTeC6nluwDtyXEO6jIMh66pEBj3RTbyNYBjDwXEuxXlhhuxJ-29kQtdooVAByvOsYIQOKcx5fW0ayddtOWF64cJ0zRnqq_6AXa80xGmAEiasGEqSN2JhhbTQlAiAKITO3X-rKfed595PXQ'
      }
    })
  ]);

  console.log('✅ Eventos criados:', events.length);

  // Criar reclamações
  const complaints = await Promise.all([
    prisma.complaint.create({
      data: {
        title: 'Buraco na Rua Principal',
        description: 'Grande buraco na via principal causando transtornos',
        location: 'Rua Principal, 123',
        priority: 'HIGH',
        status: 'PENDING',
        likes: 15,
        commentsCount: 5,
        authorId: users[0].id
      }
    }),
    prisma.complaint.create({
      data: {
        title: 'Iluminação Pública Defeituosa',
        description: 'Postes de luz queimados na praça central',
        location: 'Praça Central',
        priority: 'MEDIUM',
        status: 'RESOLVED',
        likes: 20,
        commentsCount: 10,
        authorId: users[1].id
      }
    }),
    prisma.complaint.create({
      data: {
        title: 'Acúmulo de Lixo',
        description: 'Lixo acumulado na esquina há mais de uma semana',
        location: 'Rua das Flores, esquina com Av. Central',
        priority: 'LOW',
        status: 'PENDING',
        likes: 5,
        commentsCount: 2,
        authorId: users[2].id
      }
    }),
    prisma.complaint.create({
      data: {
        title: 'Vazamento de Água',
        description: 'Vazamento na rede de abastecimento',
        location: 'Rua Lateral, 456',
        priority: 'HIGH',
        status: 'RESOLVED',
        likes: 25,
        commentsCount: 15,
        authorId: users[0].id
      }
    }),
    prisma.complaint.create({
      data: {
        title: 'Pichação em Prédio Público',
        description: 'Pichações na fachada da escola municipal',
        location: 'Escola Municipal João Silva',
        priority: 'MEDIUM',
        status: 'PENDING',
        likes: 10,
        commentsCount: 3,
        authorId: users[1].id
      }
    })
  ]);

  console.log('✅ Reclamações criadas:', complaints.length);

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
