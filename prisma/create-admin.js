import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const email = 'admin@prefeitura.gov.br';
const senha = 'Admin@1234';

async function main() {
  const senhaHash = await bcrypt.hash(senha, 10);

  const admin = await prisma.user.upsert({
    where: {
      email
    },

    update: {
      password: senhaHash,
      tipo: 'ADMIN',
      status: 'ACTIVE'
    },

    create: {
      email,
      name: 'Administrador FLUXO',
      username: 'admin_fluxo',
      password: senhaHash,
      tipo: 'ADMIN',
      status: 'ACTIVE'
    }
  });

  console.log('Administrador criado/atualizado:');
  console.log({
    id: admin.id,
    email: admin.email,
    tipo: admin.tipo
  });
}

main()
  .catch((error) => {
    console.error('Erro:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });