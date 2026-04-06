-- ========================================================
-- PROCEDURE: Limpar Notificações Antigas


CREATE OR REPLACE PROCEDURE limpar_notificacoes_antigas(dias_limite INT DEFAULT 30)
LANGUAGE plpgsql
AS $$
DECLARE
    qtd_apagada INT;
BEGIN
    -- 1. Deleta as notificações lidas (read = true) mais antigas que o limite de dias
    DELETE FROM "notifications"
    WHERE "read" = true 
      AND "createdAt" < NOW() - (dias_limite || ' days')::INTERVAL;
      
    -- 2. Pega a quantidade exata de linhas que o DELETE acabou de apagar
    GET DIAGNOSTICS qtd_apagada = ROW_COUNT;
    
    -- 3. Imprime uma mensagem de aviso no log do banco de dados
    RAISE NOTICE 'Limpeza concluída com sucesso! % notificações antigas foram apagadas.', qtd_apagada;
END;
$$;