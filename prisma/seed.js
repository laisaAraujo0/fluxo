import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed do FLUXO');

  const senhaCidadao = await bcrypt.hash('Fluxo@123', 10);
  const senhaOrgao = await bcrypt.hash('Orgao@123', 10);
  const senhaAdmin = await bcrypt.hash('Admin@123', 10);

  const agency = await prisma.agency.upsert({
    where: { email: 'prefeitura@barramansa.rj.gov.br' },
    update: {},
    create: {
      name: 'Prefeitura de Barra Mansa',
      email: 'prefeitura@barramansa.rj.gov.br',
      cidade: 'Barra Mansa',
      estado: 'RJ',
      telefone: '(24) 0000-0000',
      status: 'ACTIVE',
    },
  });

  const obras = await prisma.department.upsert({
    where: { agencyId_name: { agencyId: agency.id, name: 'Secretaria de Obras' } },
    update: {},
    create: { agencyId: agency.id, name: 'Secretaria de Obras' },
  });

  const meioAmbiente = await prisma.department.upsert({
    where: { agencyId_name: { agencyId: agency.id, name: 'Secretaria de Meio Ambiente' } },
    update: {},
    create: { agencyId: agency.id, name: 'Secretaria de Meio Ambiente' },
  });

  const citizen = await prisma.user.upsert({
    where: { email: 'cidadao@fluxo.local' },
    update: { password: senhaCidadao, role: 'CITIZEN' },
    create: {
      name: 'Cidadão FLUXO',
      email: 'cidadao@fluxo.local',
      username: 'cidadao_fluxo',
      password: senhaCidadao,
      cidade: 'Barra Mansa',
      estado: 'RJ',
      role: 'CITIZEN',
    },
  });

  const attendant = await prisma.user.upsert({
    where: { email: 'atendente@prefeitura.local' },
    update: { password: senhaOrgao, role: 'AGENCY_ATTENDANT', agencyId: agency.id, departmentId: obras.id },
    create: {
      name: 'Carlos Henrique',
      email: 'atendente@prefeitura.local',
      username: 'carlos_obras',
      password: senhaOrgao,
      role: 'AGENCY_ATTENDANT',
      agencyId: agency.id,
      departmentId: obras.id,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'gestor@prefeitura.local' },
    update: { password: senhaOrgao, role: 'AGENCY_MANAGER', agencyId: agency.id, departmentId: obras.id },
    create: {
      name: 'Gestor da Prefeitura',
      email: 'gestor@prefeitura.local',
      username: 'gestor_prefeitura',
      password: senhaOrgao,
      role: 'AGENCY_MANAGER',
      agencyId: agency.id,
      departmentId: obras.id,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@fluxo.local' },
    update: { password: senhaAdmin, role: 'FLUXO_ADMIN', agencyId: null, departmentId: null },
    create: {
      name: 'Administrador FLUXO',
      email: 'admin@fluxo.local',
      username: 'admin_fluxo',
      password: senhaAdmin,
      role: 'FLUXO_ADMIN',
    },
  });

  const protocol = `FLX-${new Date().getFullYear()}-000001`;
  const complaint = await prisma.complaint.upsert({
    where: { protocol },
    update: { agencyId: agency.id, departmentId: obras.id, authorId: citizen.id },
    create: {
      protocol,
      title: 'Buraco na Rua Principal',
      description: 'Buraco grande na via causando risco para veículos e pedestres.',
      category: 'Infraestrutura',
      location: 'Rua Principal, Centro, Barra Mansa - RJ',
      neighborhood: 'Centro',
      priority: 'HIGH',
      status: 'IN_ANALYSIS',
      authorId: citizen.id,
      agencyId: agency.id,
      departmentId: obras.id,
      assignedUserId: attendant.id,
    },
  });

  const year = new Date().getFullYear();
  const complaintCount = await prisma.complaint.count({ where: { protocol: { startsWith: `FLX-${year}-` } } });
  await prisma.protocolSequence.upsert({
    where: { year },
    update: { next: complaintCount + 1 },
    create: { year, next: complaintCount + 1 },
  });

  await prisma.complaintUpdate.deleteMany({ where: { complaintId: complaint.id } });
  await prisma.complaintUpdate.createMany({
    data: [
      { complaintId: complaint.id, userId: citizen.id, newStatus: 'RECEIVED', message: 'Solicitação recebida pelo FLUXO.' },
      { complaintId: complaint.id, userId: attendant.id, oldStatus: 'RECEIVED', newStatus: 'FORWARDED', message: 'Encaminhada para a Secretaria de Obras.' },
      { complaintId: complaint.id, userId: attendant.id, oldStatus: 'FORWARDED', newStatus: 'IN_ANALYSIS', message: 'A equipe está analisando o local.' },
    ],
  });

  console.log('Órgão:', agency.name);
  console.log('Setores:', obras.name, 'e', meioAmbiente.name);
  console.log('Usuários de teste criados.');
  console.log('Seed concluído.');
}

main()
  .catch((error) => {
    console.error('❌ Seed falhou:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
