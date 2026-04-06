CREATE OR REPLACE VIEW view_auditoria_seguranca AS
SELECT 
    u.name AS "Nome do Usuário",
    u.email AS "Email",
    TO_CHAR(u."createdAt", 'DD/MM/YYYY') AS "Conta Criada Em",
    (SELECT COUNT(*) FROM events e WHERE e."authorId" = u.id) AS "Total Eventos Criados",
    (SELECT COUNT(*) FROM comments c WHERE c."authorId" = u.id) AS "Total Comentários",
    (SELECT COUNT(*) FROM likes l WHERE l."userId" = u.id) AS "Total Curtidas Dadas",
    CASE 
        WHEN (SELECT COUNT(*) FROM events e WHERE e."authorId" = u.id AND e."createdAt" >= NOW() - INTERVAL '24 hours') > 5 THEN '⚠️ ALERTA SPAM: Criou mais de 5 eventos em 24h'
        WHEN (SELECT COUNT(*) FROM comments c WHERE c."authorId" = u.id AND c."createdAt" >= NOW() - INTERVAL '24 hours') > 20 THEN '⚠️ ALERTA SPAM: Mais de 20 comentários em 24h'
        WHEN (SELECT COUNT(*) FROM events e WHERE e."authorId" = u.id) = 0 AND (SELECT COUNT(*) FROM comments c WHERE c."authorId" = u.id) = 0 THEN '⚪ Inativo (Conta Fantasma)'
        ELSE '🟢 Normal'
    END AS "Status de Segurança"
FROM 
    users u
ORDER BY 
    "Status de Segurança" DESC;