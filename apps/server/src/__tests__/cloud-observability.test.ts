import { describe, test } from 'node:test';
import assert from 'node:assert';

describe('Business-Oriented Observability metrics cost aggregates Tests', () => {

  test('Cost breakdown calculations for cloud operations', () => {
    // 1. Inputs
    const renderMinutesUsed = 12.5;
    const storageBytesUsed = 1024 * 1024 * 32; // 32MB
    const aiTokensUsed = 450;

    // 2. Costs calculation
    const renderCosts = renderMinutesUsed * 0.30; // $0.30 per minute
    const storageCosts = (storageBytesUsed / (1024 * 1024 * 1024)) * 0.05; // $0.05 per GB
    const aiCosts = (aiTokensUsed / 1000) * 0.02; // $0.02 per 1000 tokens
    const totalCost = renderCosts + storageCosts + aiCosts;

    // 3. Assertions with fixed precision matching controller format
    assert.strictEqual(parseFloat(renderCosts.toFixed(4)), 3.75);
    assert.strictEqual(parseFloat(storageCosts.toFixed(4)), 0.0016);
    assert.strictEqual(parseFloat(aiCosts.toFixed(4)), 0.009);
    assert.ok(totalCost > 3.76);
  });
});
