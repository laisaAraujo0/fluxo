
-- ========================================================
-- 1. TRIGGER DE COMENTÁRIOS
-- ========================================================
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "commentsCount" INTEGER DEFAULT 0;

CREATE OR REPLACE FUNCTION atualizar_contador_comentarios()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE "events" SET "commentsCount" = "commentsCount" + 1 WHERE id = NEW."eventId";
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE "events" SET "commentsCount" = "commentsCount" - 1 WHERE id = OLD."eventId" AND "commentsCount" > 0;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD."eventId" != NEW."eventId" THEN
            UPDATE "events" SET "commentsCount" = "commentsCount" - 1 WHERE id = OLD."eventId" AND "commentsCount" > 0;
            UPDATE "events" SET "commentsCount" = "commentsCount" + 1 WHERE id = NEW."eventId";
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_atualizar_comentarios ON "comments";

CREATE TRIGGER trigger_atualizar_comentarios
    AFTER INSERT OR UPDATE OR DELETE ON "comments"
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_contador_comentarios();

UPDATE "events" SET "commentsCount" = (SELECT COUNT(*) FROM "comments" WHERE "comments"."eventId" = "events".id);

-- ========================================================
-- 2. FUNCTION DE RELATÓRIO DE USUÁRIO
-- ========================================================
CREATE OR REPLACE FUNCTION get_user_activity_report(user_id TEXT)
RETURNS TABLE (
    usuario_nome TEXT,
    usuario_email TEXT,
    data_cadastro TIMESTAMP,
    total_eventos BIGINT,
    total_comentarios BIGINT,
    total_curtidas BIGINT,
    ultima_atividade TIMESTAMP,
    eventos_recentes BIGINT,
    comentarios_recentes BIGINT,
    curtidas_recentes BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.name,
        u.email,
        u."createdAt",
        COALESCE((SELECT COUNT(*) FROM "events" WHERE "authorId" = user_id), 0),
        COALESCE((SELECT COUNT(*) FROM "comments" WHERE "authorId" = user_id), 0),
        COALESCE((SELECT COUNT(*) FROM "likes" WHERE "userId" = user_id), 0),
        GREATEST(
            COALESCE((SELECT MAX("createdAt") FROM "events" WHERE "authorId" = user_id), '1970-01-01'::timestamp),
            COALESCE((SELECT MAX("createdAt") FROM "comments" WHERE "authorId" = user_id), '1970-01-01'::timestamp),
            COALESCE((SELECT MAX("createdAt") FROM "likes" WHERE "userId" = user_id), '1970-01-01'::timestamp)
        ),
        COALESCE((SELECT COUNT(*) FROM "events" WHERE "authorId" = user_id AND "createdAt" >= NOW() - INTERVAL '30 days'), 0),
        COALESCE((SELECT COUNT(*) FROM "comments" WHERE "authorId" = user_id AND "createdAt" >= NOW() - INTERVAL '30 days'), 0),
        COALESCE((SELECT COUNT(*) FROM "likes" WHERE "userId" = user_id AND "createdAt" >= NOW() - INTERVAL '30 days'), 0)
    FROM "users" u
    WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;