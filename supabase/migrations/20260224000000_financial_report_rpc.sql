-- Vista para reportes financieros estandarizados y búsqueda robusta
CREATE OR REPLACE VIEW financial_reports_view AS
SELECT
    r.id,
    r.created_at,
    r.fecha_reserva,
    r.fecha_pago,
    r.monto_total,
    r.estado_pago,
    r.servicio_id,
    r.perfil_id,
    r.cupon_usado,
    -- Lógica consistente de fecha efectiva para reportes
    COALESCE(r.fecha_pago, r.fecha_reserva, r.created_at) as effective_date,
    -- Campos planos para búsqueda
    p.nombre as client_name,
    p.apellidos as client_surname,
    s.nombre_es as service_name
FROM reservas_alquiler r
LEFT JOIN profiles p ON r.perfil_id = p.id
LEFT JOIN servicios_alquiler s ON r.servicio_id = s.id;

-- Función RPC optimizada para totales y gráfico
CREATE OR REPLACE FUNCTION get_financial_report_stats(
  p_start_date TIMESTAMP WITH TIME ZONE,
  p_end_date TIMESTAMP WITH TIME ZONE,
  p_status TEXT DEFAULT NULL,
  p_service_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total NUMERIC;
  v_daily_stats JSONB;
BEGIN
  -- Calcular Total de Ingresos
  SELECT COALESCE(SUM(
    CASE
      -- Conversión segura a texto antes de regex
      WHEN r.monto_total::text ~ '^[0-9]+(\.[0-9]+)?$' THEN r.monto_total::NUMERIC
      ELSE 0
    END
  ), 0)
  INTO v_total
  FROM reservas_alquiler r
  WHERE
    -- Lógica debe coincidir con la vista
    COALESCE(r.fecha_pago, r.fecha_reserva, r.created_at) >= p_start_date AND
    COALESCE(r.fecha_pago, r.fecha_reserva, r.created_at) <= p_end_date AND
    (p_status IS NULL OR r.estado_pago = p_status) AND
    (p_service_id IS NULL OR r.servicio_id = p_service_id);

  -- Calcular Estadísticas Diarias
  SELECT jsonb_agg(t)
  INTO v_daily_stats
  FROM (
    SELECT
      to_char(date_trunc('day', COALESCE(r.fecha_pago, r.fecha_reserva, r.created_at)), 'YYYY-MM-DD') as date,
      SUM(
        CASE
          WHEN r.monto_total::text ~ '^[0-9]+(\.[0-9]+)?$' THEN r.monto_total::NUMERIC
          ELSE 0
        END
      ) as amount
    FROM reservas_alquiler r
    WHERE
      COALESCE(r.fecha_pago, r.fecha_reserva, r.created_at) >= p_start_date AND
      COALESCE(r.fecha_pago, r.fecha_reserva, r.created_at) <= p_end_date AND
      (p_status IS NULL OR r.estado_pago = p_status) AND
      (p_service_id IS NULL OR r.servicio_id = p_service_id)
    GROUP BY 1
    ORDER BY 1
  ) t;

  RETURN jsonb_build_object(
    'total_revenue', v_total,
    'daily_stats', COALESCE(v_daily_stats, '[]'::jsonb)
  );
END;
$$;
