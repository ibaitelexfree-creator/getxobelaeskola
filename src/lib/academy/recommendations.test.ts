import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getStudentRecommendations } from './recommendations';

// Define mocks using vi.hoisted to ensure they are available before imports
const mocks = vi.hoisted(() => {
  // Create spies
  const select = vi.fn();
  const eq = vi.fn();
  const order = vi.fn();
  const limit = vi.fn();
  const inFn = vi.fn();
  const from = vi.fn();

  // Create the builder object structure
  // We need a circular reference, so we define the object first
  const builder = {
    select,
    eq,
    order,
    limit,
    in: inFn,
  };

  // Setup default implementations for chaining
  // Chainable methods return the builder
  select.mockReturnValue(builder);
  eq.mockReturnValue(builder);
  order.mockReturnValue(builder);
  from.mockReturnValue(builder);

  // Terminal methods return promises with default empty data
  limit.mockResolvedValue({ data: [], error: null });
  inFn.mockResolvedValue({ data: [], error: null });

  return {
    from,
    select,
    eq,
    order,
    limit,
    inFn,
    // Export builder if needed, but usually not necessary if methods are stable
  };
});

// Mock the module
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    from: mocks.from,
  })),
}));

describe('getStudentRecommendations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset terminal methods to default success state
    mocks.limit.mockResolvedValue({ data: [], error: null });
    mocks.inFn.mockResolvedValue({ data: [], error: null });
  });

  it('returns empty list if no attempts found', async () => {
    mocks.limit.mockResolvedValueOnce({ data: [], error: null });

    const recs = await getStudentRecommendations('student-123');

    expect(mocks.from).toHaveBeenCalledWith('intentos_evaluacion');
    expect(mocks.limit).toHaveBeenCalled();
    expect(recs).toEqual([]);
  });

  it('returns empty list if question fetch fails', async () => {
    const attempts = [{ preguntas_json: ['q1'], respuestas_json: {} }];
    mocks.limit.mockResolvedValueOnce({ data: attempts, error: null });
    mocks.inFn.mockResolvedValueOnce({ data: null, error: { message: 'Error' } });

    const recs = await getStudentRecommendations('student-123');
    expect(recs).toEqual([]);
  });

  it('returns empty list if all answers are correct', async () => {
    const attempts = [{
      preguntas_json: ['q1'],
      respuestas_json: { 'q1': 'correct' }
    }];
    const questions = [{
      id: 'q1',
      respuesta_correcta: 'correct',
      entidad_id: 'u1',
      entidad_tipo: 'unidad'
    }];

    mocks.limit.mockResolvedValueOnce({ data: attempts, error: null });
    mocks.inFn.mockResolvedValueOnce({ data: questions, error: null });

    const recs = await getStudentRecommendations('student-123');
    expect(recs).toEqual([]);
  });

  it('returns recommendation for incorrect answer', async () => {
    const attempts = [{
      preguntas_json: ['q1'],
      respuestas_json: { 'q1': 'wrong' }
    }];
    const questions = [{
      id: 'q1',
      respuesta_correcta: 'correct',
      entidad_id: 'u1',
      entidad_tipo: 'unidad'
    }];

    mocks.limit.mockResolvedValueOnce({ data: attempts, error: null });
    mocks.inFn.mockResolvedValueOnce({ data: questions, error: null });

    const recs = await getStudentRecommendations('student-123');
    expect(recs).toEqual(['/academy/unit/u1']);
  });

  it('deduplicates recommendations', async () => {
    const attempts = [{
      preguntas_json: ['q1', 'q2'],
      respuestas_json: { 'q1': 'wrong', 'q2': 'wrong' }
    }];
    const questions = [
      { id: 'q1', respuesta_correcta: 'correct', entidad_id: 'u1', entidad_tipo: 'unidad' },
      { id: 'q2', respuesta_correcta: 'correct', entidad_id: 'u1', entidad_tipo: 'unidad' }
    ];

    mocks.limit.mockResolvedValueOnce({ data: attempts, error: null });
    mocks.inFn.mockResolvedValueOnce({ data: questions, error: null });

    const recs = await getStudentRecommendations('student-123');
    expect(recs).toEqual(['/academy/unit/u1']);
  });

  it('handles module recommendations', async () => {
    const attempts = [{
      preguntas_json: ['q1'],
      respuestas_json: { 'q1': 'wrong' }
    }];
    const questions = [{
      id: 'q1',
      respuesta_correcta: 'correct',
      entidad_id: 'm1',
      entidad_tipo: 'modulo'
    }];

    mocks.limit.mockResolvedValueOnce({ data: attempts, error: null });
    mocks.inFn.mockResolvedValueOnce({ data: questions, error: null });

    const recs = await getStudentRecommendations('student-123');
    expect(recs).toEqual(['/academy/module/m1']);
  });

  it('handles mixed entity types', async () => {
    const attempts = [{
      preguntas_json: ['q1', 'q2'],
      respuestas_json: { 'q1': 'wrong', 'q2': 'wrong' }
    }];
    const questions = [
      { id: 'q1', respuesta_correcta: 'correct', entidad_id: 'u1', entidad_tipo: 'unidad' },
      { id: 'q2', respuesta_correcta: 'correct', entidad_id: 'm1', entidad_tipo: 'modulo' }
    ];

    mocks.limit.mockResolvedValueOnce({ data: attempts, error: null });
    mocks.inFn.mockResolvedValueOnce({ data: questions, error: null });

    const recs = await getStudentRecommendations('student-123');
    expect(recs).toContain('/academy/unit/u1');
    expect(recs).toContain('/academy/module/m1');
    expect(recs.length).toBe(2);
  });
});
