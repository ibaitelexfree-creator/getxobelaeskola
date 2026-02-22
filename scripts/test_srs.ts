import { calculateNextSRS, INITIAL_SRS_STATE } from '../src/lib/srs';

function testSRS() {
  console.log('Testing SRS Logic...');

  // Test 1: Initial state -> Correct answer (Quality 5)
  let state = { ...INITIAL_SRS_STATE };
  console.log('Initial State:', state);

  state = calculateNextSRS(state, 5);
  console.log('After 1st Correct (Q=5):', state);

  if (state.interval !== 1 || state.repetitions !== 1) {
    console.error('Test 1 Failed: Interval should be 1, Reps 1');
  }

  // Test 2: Second Correct answer (Quality 5)
  state = calculateNextSRS(state, 5);
  console.log('After 2nd Correct (Q=5):', state);

  if (state.interval !== 6 || state.repetitions !== 2) {
     console.error('Test 2 Failed: Interval should be 6, Reps 2');
  }

  // Test 3: Third Correct answer (Quality 5)
  // EF should be increased
  state = calculateNextSRS(state, 5);
  console.log('After 3rd Correct (Q=5):', state);

  // Interval should be 6 * EF. EF starts at 2.5.
  // 1st correct: EF = 2.5 + 0.1 = 2.6
  // 2nd correct: EF = 2.6 + 0.1 = 2.7
  // 3rd step uses EF=2.7. Interval = 6 * 2.7 = 16.2 -> 16.
  if (state.interval !== 16 || state.repetitions !== 3) {
     console.error('Test 3 Failed: Interval should be ~16, Reps 3. Got:', state.interval);
  }

  // Test 4: Fail (Quality 0)
  // EF = 2.7 + 0.1 = 2.8 after 3rd correct.
  // Fail update: EF = EF + (0.1 - (5 - 0) * (0.08 + (5 - 0) * 0.02))
  // = EF + (0.1 - 5 * (0.08 + 0.1))
  // = EF + (0.1 - 5 * 0.18)
  // = EF + (0.1 - 0.9) = EF - 0.8
  // New EF = 2.8 - 0.8 = 2.0
  state = calculateNextSRS(state, 0);
  console.log('After Fail (Q=0):', state);

  if (state.interval !== 1 || state.repetitions !== 0) {
     console.error('Test 4 Failed: Reset expected');
  }
  if (Math.abs(state.easinessFactor - 2.0) > 0.1) {
      console.error('Test 4 Failed: EF expected around 2.0, got', state.easinessFactor);
  }

  // Test 5: Re-learning (Quality 4)
  state = calculateNextSRS(state, 4);
  console.log('After Re-learning (Q=4):', state);

  if (state.interval !== 1 || state.repetitions !== 1) {
    console.error('Test 5 Failed');
  }
}

testSRS();
