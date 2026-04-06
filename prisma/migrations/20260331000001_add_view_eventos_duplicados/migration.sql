-- Criar View para detectar eventos duplicados no mesmo local e categoria
CREATE OR REPLACE VIEW view_eventos_duplicados AS
SELECT 
    location,
    category,
    COUNT(id) AS total_repetidos,
    ARRAY_AGG(id) AS ids_dos_eventos,
    ARRAY_AGG(title) AS titulos_dos_eventos
FROM 
    "events"
WHERE 
    status = 'PENDING'
GROUP BY 
    location, 
    category
HAVING 
    COUNT(id) > 1;