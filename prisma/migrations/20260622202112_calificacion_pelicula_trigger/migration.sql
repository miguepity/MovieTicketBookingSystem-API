CREATE OR REPLACE FUNCTION recalc_pelicula_rating(p_id_pelicula BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE peliculas
  SET
    rating_promedio = (
      SELECT ROUND(AVG(puntuacion)::numeric, 2)
      FROM calificacion_pelicula
      WHERE id_pelicula = p_id_pelicula
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM calificacion_pelicula
      WHERE id_pelicula = p_id_pelicula
    )
  WHERE id = p_id_pelicula;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trg_calificacion_pelicula_recalc()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    PERFORM recalc_pelicula_rating(OLD.id_pelicula);
    RETURN OLD;
  ELSE
    PERFORM recalc_pelicula_rating(NEW.id_pelicula);
    IF (TG_OP = 'UPDATE' AND OLD.id_pelicula <> NEW.id_pelicula) THEN
      PERFORM recalc_pelicula_rating(OLD.id_pelicula);
    END IF;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calificacion_pelicula_recalc
AFTER INSERT OR UPDATE OR DELETE ON calificacion_pelicula
FOR EACH ROW EXECUTE FUNCTION trg_calificacion_pelicula_recalc();

ALTER TABLE calificacion_pelicula
  ADD CONSTRAINT chk_puntuacion_rango CHECK (puntuacion BETWEEN 1 AND 5);
