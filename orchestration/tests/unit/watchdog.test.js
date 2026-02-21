import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { AgentWatchdog } from '../../lib/watchdog.js';

describe('AgentWatchdog', () => {
    let wd;

    beforeEach(() => {
        wd = new AgentWatchdog({
            pollIntervalMs: 60000, // Disable auto-tick in tests
            stallTimeoutMs: 5000,
            killTimeoutMs: 10000,
            loopThreshold: 5,
            loopWindowMs: 30000,
            similarityThreshold: 0.6,
            autoContinueEnabled: false, // No SendKeys in tests
        });
    });

    afterEach(() => {
        wd.stop();
    });

    describe('Loop Detection', () => {
        it('should detect a basic loop with identical messages', () => {
            let loopDetected = false;
            wd.on('loopDetected', () => { loopDetected = true; });

            wd.start();
            for (let i = 0; i < 10; i++) {
                wd.feedOutput('Error: Cannot find module ./foo');
            }

            assert.equal(wd.state, 'LOOPING');
            assert.equal(loopDetected, true);
            assert.equal(wd.stats.loopsDetected, 1);
        });

        it('should detect loops with messages differing only by numbers', () => {
            let loopDetected = false;
            wd.on('loopDetected', () => { loopDetected = true; });

            wd.start();
            for (let i = 0; i < 8; i++) {
                wd.feedOutput(`Retry attempt ${i + 1} failed at line ${100 + i}`);
            }

            assert.equal(wd.state, 'LOOPING');
            assert.equal(loopDetected, true);
        });

        it('should NOT detect a loop with varied messages', () => {
            let loopDetected = false;
            wd.on('loopDetected', () => { loopDetected = true; });

            wd.start();
            const messages = [
                'Creating file utils.js',
                'Running lint check',
                'Fixed 3 errors',
                'Updating component Header',
                'Added test for UserProfile',
                'Build succeeded',
                'Committing changes to git',
                'PR created #42',
            ];
            messages.forEach(m => wd.feedOutput(m));

            assert.equal(wd.state, 'ACTIVE');
            assert.equal(loopDetected, false);
        });

        it('should recover from loop when pattern breaks', () => {
            wd.start();

            // Create loop
            for (let i = 0; i < 6; i++) {
                wd.feedOutput('Stuck on same error');
            }
            assert.equal(wd.state, 'LOOPING');

            // Break the pattern with varied messages
            wd.feedOutput('Fixed the issue');
            wd.feedOutput('Moved to next task');
            wd.feedOutput('Creating new component');
            wd.feedOutput('Test passed');
            wd.feedOutput('Build complete');
            // Need enough diverse messages to drop below threshold
            assert.equal(wd.state, 'ACTIVE');
        });
    });

    describe('Stall Detection', () => {
        it('should detect stall after timeout', (t) => {
            return new Promise((resolve) => {
                const shortWd = new AgentWatchdog({
                    pollIntervalMs: 60000,
                    stallTimeoutMs: 100, // 100ms for test
                    autoContinueEnabled: false,
                });

                shortWd.on('stallDetected', () => {
                    assert.equal(shortWd.state, 'STALLED');
                    shortWd.stop();
                    resolve();
                });

                shortWd.start();
                shortWd.feedOutput('initial message');

                // Wait for stall
                setTimeout(() => shortWd._checkStall(), 150);
            });
        });

        it('should clear stall when output resumes', () => {
            wd.start();
            wd._setState('STALLED');
            wd.feedOutput('I am back!');
            assert.equal(wd.state, 'ACTIVE');
        });
    });

    describe('State Machine', () => {
        it('should emit stateChange events', () => {
            const changes = [];
            wd.on('stateChange', (e) => changes.push(e));

            wd.start();
            wd.pause();
            wd.resume();

            assert.equal(changes.length, 2);
            assert.equal(changes[0].to, 'PAUSED');
            assert.equal(changes[1].to, 'ACTIVE');
        });

        it('should not emit duplicate state changes', () => {
            const changes = [];
            wd.on('stateChange', (e) => changes.push(e));

            wd.start();
            wd.pause();
            wd.pause(); // duplicate
            assert.equal(changes.length, 1);
        });

        it('should ignore feedOutput when paused', () => {
            wd.start();
            wd.pause();

            const bufferBefore = wd.outputBuffer.length;
            wd.feedOutput('this should be ignored');
            assert.equal(wd.outputBuffer.length, bufferBefore);
        });
    });

    describe('Status API', () => {
        it('should return complete status object', () => {
            wd.start();
            wd.feedOutput('test message');

            const status = wd.getStatus();

            assert.equal(status.state, 'ACTIVE');
            assert.equal(status.running, true);
            assert.equal(status.bufferSize, 1);
            assert.equal(typeof status.uptime, 'string');
            assert.equal(typeof status.lastOutput, 'string');
            assert.ok(status.stats);
            assert.ok(Array.isArray(status.recentHistory));
        });
    });

    describe('Buffer Management', () => {
        it('should respect bufferSize limit', () => {
            wd = new AgentWatchdog({ bufferSize: 5, autoContinueEnabled: false, pollIntervalMs: 60000 });
            wd.start();

            for (let i = 0; i < 20; i++) {
                wd.feedOutput(`Message ${i} with unique content ${Math.random()}`);
            }

            assert.equal(wd.outputBuffer.length, 5);
            assert.equal(wd.hashBuffer.length, 5);
        });
    });

    describe('History', () => {
        it('should log interventions to history', () => {
            wd.start();

            // Trigger a loop
            for (let i = 0; i < 10; i++) {
                wd.feedOutput('same error again');
            }

            const history = wd.getFullHistory();
            assert.ok(history.length > 0);
            assert.equal(history[0].action, 'LOOP_DETECTED');
        });

        it('should bound history to prevent memory leaks', () => {
            wd.start();

            // Add 250 history entries manually
            for (let i = 0; i < 250; i++) {
                wd._logHistory('TEST', { i });
            }

            assert.ok(wd.stats.history.length <= 200);
        });
    });
});
