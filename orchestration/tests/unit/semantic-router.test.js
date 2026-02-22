/**
 * Unit Tests for Semantic Router
 *
 * Tests cover:
 * - routeTask() function
 * - Heuristic routing (keywords, length)
 * - LLM routing (mocked)
 * - Fallback behavior
 *
 * @module tests/unit/semantic-router.test
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { routeTask } from '../../lib/semantic-router.js';

describe('Semantic Router - routeTask()', () => {
  // =============================================================================
  // Heuristic Tests
  // =============================================================================

  it('should route simple tasks to LOCAL based on keywords', async () => {
    const task = 'Please fix this typo in the README';
    const result = await routeTask(task);

    assert.strictEqual(result.route, 'LOCAL');
    assert.strictEqual(result.method, 'heuristic');
    assert.ok(result.reason.includes('simple keyword'));
  });

  it('should route complex tasks to CLOUD based on keywords', async () => {
    const task = 'Refactor the entire authentication system to use OAuth2';
    const result = await routeTask(task);

    assert.strictEqual(result.route, 'CLOUD');
    assert.strictEqual(result.method, 'heuristic');
    assert.ok(result.reason.includes('complex keyword'));
  });

  it('should route very short tasks to LOCAL', async () => {
    const task = 'Change color to red';
    const result = await routeTask(task);

    assert.strictEqual(result.route, 'LOCAL');
    assert.strictEqual(result.method, 'heuristic');
    assert.strictEqual(result.reason, 'Task description is very short');
  });

  it('should route very long tasks to CLOUD', async () => {
    const task = 'A'.repeat(501);
    const result = await routeTask(task);

    assert.strictEqual(result.route, 'CLOUD');
    assert.strictEqual(result.method, 'heuristic');
    assert.strictEqual(result.reason, 'Task description is detailed/long');
  });

  // =============================================================================
  // LLM Routing Tests (Mocked)
  // =============================================================================

  it('should use LLM for ambiguous tasks (LOCAL result)', async () => {
    const task = 'Change the background color of the main landing page header section to blue'; // > 50 chars, no keywords

    // Mock successful LOCAL classification
    const mockCompletion = async () => ({
      success: true,
      content: JSON.stringify({ route: 'LOCAL', reason: 'Single component update' })
    });

    const result = await routeTask(task, {}, mockCompletion);

    assert.strictEqual(result.route, 'LOCAL');
    assert.strictEqual(result.method, 'llm');
    assert.strictEqual(result.reason, 'Single component update');
  });

  it('should use LLM for ambiguous tasks (CLOUD result)', async () => {
    const task = 'Change the background color of the main landing page header section to blue for better visibility'; // > 50 chars, no keywords

    // Mock successful CLOUD classification
    const mockCompletion = async () => ({
      success: true,
      content: JSON.stringify({ route: 'CLOUD', reason: 'Affects multiple services' })
    });

    const result = await routeTask(task, {}, mockCompletion);

    assert.strictEqual(result.route, 'CLOUD');
    assert.strictEqual(result.method, 'llm');
    assert.strictEqual(result.reason, 'Affects multiple services');
  });

  it('should handle markdown code blocks in LLM response', async () => {
    const task = 'This is an ambiguous task that needs routing decision from LLM';

    const mockCompletion = async () => ({
      success: true,
      content: '```json\n{ "route": "LOCAL", "reason": "Simple" }\n```'
    });

    const result = await routeTask(task, {}, mockCompletion);

    assert.strictEqual(result.route, 'LOCAL');
    assert.strictEqual(result.method, 'llm');
  });

  // =============================================================================
  // Fallback Tests
  // =============================================================================

  it('should fallback to CLOUD if LLM fails', async () => {
    const task = 'This is an ambiguous task that causes an error in LLM processing';

    // Mock failed completion
    const mockCompletion = async () => { throw new Error('Ollama down'); };

    const result = await routeTask(task, {}, mockCompletion);

    assert.strictEqual(result.route, 'CLOUD');
    assert.strictEqual(result.method, 'fallback');
  });

  it('should fallback to CLOUD if LLM returns invalid JSON', async () => {
    const task = 'This is an ambiguous task that returns invalid JSON from LLM';

    const mockCompletion = async () => ({
      success: true,
      content: 'I think it is LOCAL but not JSON'
    });

    // It should fall through to default return
    const result = await routeTask(task, {}, mockCompletion);

    assert.strictEqual(result.route, 'CLOUD');
    // method depends on implementation: if JSON parse fails, it returns default at end of function
    assert.strictEqual(result.method, 'default');
  });
});
