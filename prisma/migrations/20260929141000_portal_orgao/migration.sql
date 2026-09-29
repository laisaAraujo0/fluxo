
-- Portal de órgãos públicos, RBAC, workflow e histórico de reclamações.
-- Esta migration NÃO apaga dados existentes.

CREATE TYPE "UserRole" AS ENUM ('CITIZEN','AGENCY_ATTENDANT','AGENCY_MANAGER','FLUXO_ADMIN');
CREATE TYPE "AgencyStatus" AS ENUM ('ACTIVE','INACTIVE','PENDING');

CREATE TYPE "ComplaintStatus_new" AS ENUM ('RECEIVED','FORWARDED','IN_ANALYSIS','WAITING_INFORMATION','SCHEDULED','IN_PROGRESS','RESOLVED','REOPENED');
ALTER TABLE "complaints" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "complaints" ALTER COLUMN "status" TYPE "ComplaintStatus_new"
USING (
  CASE "status"::text
    WHEN 'PENDING' THEN 'RECEIVED'
    WHEN 'IN_PROGRESS' THEN 'IN_PROGRESS'
    WHEN 'RESOLVED' THEN 'RESOLVED'
    WHEN 'REJECTED' THEN 'RECEIVED'
    ELSE 'RECEIVED'
  END
)::"ComplaintStatus_new";
DROP TYPE "ComplaintStatus";
ALTER TYPE "ComplaintStatus_new" RENAME TO "ComplaintStatus";
ALTER TABLE "complaints" ALTER COLUMN "status" SET DEFAULT 'RECEIVED'::"ComplaintStatus";

CREATE TABLE "agencies" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "telefone" TEXT,
  "cnpj" TEXT,
  "endereco" TEXT,
  "cidade" TEXT NOT NULL,
  "estado" TEXT NOT NULL,
  "logo" TEXT,
  "status" "AgencyStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "agencies_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "agencies_email_key" ON "agencies"("email");
CREATE UNIQUE INDEX "agencies_cnpj_key" ON "agencies"("cnpj");
CREATE INDEX "agencies_cidade_estado_idx" ON "agencies"("cidade","estado");

CREATE TABLE "departments" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "agencyId" TEXT NOT NULL,
  "status" "AgencyStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "departments_agencyId_name_key" ON "departments"("agencyId","name");

ALTER TABLE "users" ADD COLUMN "password" TEXT NOT NULL DEFAULT '';
ALTER TABLE "users" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'CITIZEN';
ALTER TABLE "users" ADD COLUMN "agencyId" TEXT;
ALTER TABLE "users" ADD COLUMN "departmentId" TEXT;
CREATE INDEX "users_agencyId_idx" ON "users"("agencyId");
CREATE INDEX "users_departmentId_idx" ON "users"("departmentId");
CREATE INDEX "users_role_idx" ON "users"("role");

INSERT INTO "agencies" ("id","name","email","cidade","estado","status","createdAt","updatedAt")
VALUES ('agency-fluxo-default','Prefeitura de Barra Mansa','prefeitura@barramansa.rj.gov.br','Barra Mansa','RJ','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

INSERT INTO "departments" ("id","name","agencyId","status","createdAt","updatedAt")
VALUES ('department-fluxo-default','Atendimento Geral','agency-fluxo-default','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

ALTER TABLE "complaints" ADD COLUMN "protocol" TEXT;
ALTER TABLE "complaints" ADD COLUMN "category" TEXT;
ALTER TABLE "complaints" ADD COLUMN "latitude" DOUBLE PRECISION;
ALTER TABLE "complaints" ADD COLUMN "longitude" DOUBLE PRECISION;
ALTER TABLE "complaints" ADD COLUMN "neighborhood" TEXT;
ALTER TABLE "complaints" ADD COLUMN "agencyId" TEXT;
ALTER TABLE "complaints" ADD COLUMN "departmentId" TEXT;
ALTER TABLE "complaints" ADD COLUMN "assignedUserId" TEXT;
ALTER TABLE "complaints" ADD COLUMN "estimatedResolutionAt" TIMESTAMP(3);
ALTER TABLE "complaints" ADD COLUMN "resolutionDescription" TEXT;
ALTER TABLE "complaints" ADD COLUMN "resolutionConfirmed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "complaints" ADD COLUMN "resolutionConfirmedAt" TIMESTAMP(3);
ALTER TABLE "complaints" ADD COLUMN "reopenReason" TEXT;

UPDATE "complaints" c
SET "agencyId" = 'agency-fluxo-default',
    "departmentId" = 'department-fluxo-default'
WHERE "agencyId" IS NULL;

UPDATE "complaints" c
SET "protocol" = x.protocol
FROM (
  SELECT "id",
    'FLX-' || EXTRACT(YEAR FROM "createdAt")::int::text || '-' ||
    LPAD(ROW_NUMBER() OVER (ORDER BY "createdAt","id")::text,6,'0') AS protocol
  FROM "complaints"
) x
WHERE c."id" = x."id";

ALTER TABLE "complaints" ALTER COLUMN "protocol" SET NOT NULL;
ALTER TABLE "complaints" ALTER COLUMN "agencyId" SET NOT NULL;

CREATE UNIQUE INDEX "complaints_protocol_key" ON "complaints"("protocol");
CREATE INDEX "complaints_authorId_idx" ON "complaints"("authorId");
CREATE INDEX "complaints_agencyId_idx" ON "complaints"("agencyId");
CREATE INDEX "complaints_departmentId_idx" ON "complaints"("departmentId");
CREATE INDEX "complaints_status_idx" ON "complaints"("status");
CREATE INDEX "complaints_priority_idx" ON "complaints"("priority");
CREATE INDEX "complaints_createdAt_idx" ON "complaints"("createdAt");

CREATE TABLE "complaint_updates" (
  "id" TEXT NOT NULL,
  "complaintId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "oldStatus" "ComplaintStatus",
  "newStatus" "ComplaintStatus" NOT NULL,
  "message" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "complaint_updates_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "complaint_updates_complaintId_createdAt_idx" ON "complaint_updates"("complaintId","createdAt");

CREATE TABLE "complaint_assignments" (
  "id" TEXT NOT NULL,
  "complaintId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "assignedBy" TEXT NOT NULL,
  "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "complaint_assignments_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "complaint_assignments_complaintId_assignedAt_idx" ON "complaint_assignments"("complaintId","assignedAt");

CREATE TABLE "complaint_messages" (
  "id" TEXT NOT NULL,
  "complaintId" TEXT NOT NULL,
  "senderId" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "complaint_messages_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "complaint_messages_complaintId_createdAt_idx" ON "complaint_messages"("complaintId","createdAt");

CREATE TABLE "attachments" (
  "id" TEXT NOT NULL,
  "complaintId" TEXT NOT NULL,
  "uploadedBy" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "data" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "attachments_complaintId_idx" ON "attachments"("complaintId");

CREATE TABLE "protocol_sequences" (
  "year" INTEGER NOT NULL,
  "next" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "protocol_sequences_pkey" PRIMARY KEY ("year")
);

INSERT INTO "protocol_sequences" ("year","next","createdAt","updatedAt")
SELECT EXTRACT(YEAR FROM CURRENT_DATE)::int,
       COALESCE(COUNT(*),0) + 1,
       CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
FROM "complaints"
ON CONFLICT ("year") DO NOTHING;

ALTER TABLE "departments" ADD CONSTRAINT "departments_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "users" ADD CONSTRAINT "users_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "users" ADD CONSTRAINT "users_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "complaint_updates" ADD CONSTRAINT "complaint_updates_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "complaint_updates" ADD CONSTRAINT "complaint_updates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "complaint_assignments" ADD CONSTRAINT "complaint_assignments_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "complaint_assignments" ADD CONSTRAINT "complaint_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "complaint_assignments" ADD CONSTRAINT "complaint_assignments_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "complaint_messages" ADD CONSTRAINT "complaint_messages_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "complaint_messages" ADD CONSTRAINT "complaint_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
