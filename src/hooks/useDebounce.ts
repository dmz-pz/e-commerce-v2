import { useState, useEffect } from 'react';

/**
 * Hook personalizado para retrasar la actualización de un valor (debouncing).
 * Muy útil para barras de búsqueda para evitar peticiones excesivas a la API por cada pulsación de tecla.
 * 
 * @param value El valor que se desea debouncear (ej. un string de búsqueda).
 * @param delay Tiempo de espera en milisegundos (ej. 400).
 * @returns El valor con debounce aplicado.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Establecer un temporizador para actualizar el valor debounced después del retraso
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar el temporizador en la fase de limpieza (cleanup)
    // o si el valor cambia antes de que expire el temporizador.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
