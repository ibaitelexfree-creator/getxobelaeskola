
import { createClient } from '@supabase/supabase-js';
import { calculateNextState, isTerminalStep } from '../src/lib/academy/mission-logic';
import { MissionStep } from '../src/components/academy/interactive-engine/types';

// Mock Step Data
const mockStep: MissionStep = {
    id: 'step-1',
    mission_id: 'mission-1',
    type: 'question',
    content: { title: 'Test Question' },
    options: [
        { label: 'Option A', next_step_id: 'step-2', score_delta: 10, feedback: 'Good job' },
        { label: 'Option B', next_step_id: 'step-3', score_delta: 0, feedback: 'Try again' }
    ]
};

async function verify() {
    console.log('--- Verifying Pure Logic ---');

    // Test 1: Calculate Next State - Option A
    const resultA = calculateNextState(mockStep, 0);
    console.log('Option A Result:', resultA);
    if (resultA.nextStepId === 'step-2' && resultA.scoreDelta === 10) {
        console.log('✅ Option A Correct');
    } else {
        console.error('❌ Option A Failed');
    }

    // Test 2: Calculate Next State - Option B
    const resultB = calculateNextState(mockStep, 1);
    console.log('Option B Result:', resultB);
    if (resultB.nextStepId === 'step-3' && resultB.scoreDelta === 0) {
        console.log('✅ Option B Correct');
    } else {
        console.error('❌ Option B Failed');
    }

    // Test 3: Invalid Option
    const resultInvalid = calculateNextState(mockStep, 99);
    if (resultInvalid.nextStepId === null) {
        console.log('✅ Invalid Option Handled');
    } else {
        console.error('❌ Invalid Option Failed');
    }

    // Test 4: Is Terminal
    const terminalStep: MissionStep = {
        id: 'end',
        mission_id: 'm1',
        type: 'summary',
        content: {},
        options: []
    };
    if (isTerminalStep(terminalStep)) {
        console.log('✅ Terminal Step Identified');
    } else {
        console.error('❌ Terminal Step Failed');
    }

    console.log('\n--- Verifying Data Access (Integration) ---');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.warn('⚠️ Skipping DB verification: Missing Env Vars');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch Mission
    const { data: mission, error } = await supabase
        .from('missions')
        .select('*, steps:mission_steps(*)')
        .eq('slug', 'rescate-alta-mar') // The seed mission
        .single();

    if (error) {
        console.error('❌ Error fetching mission:', error.message);
    } else {
        console.log('✅ Mission fetched:', mission.title);
        console.log(`   - Steps count: ${mission.steps.length}`);

        // Check if steps have options
        const steps = mission.steps as MissionStep[];
        const questionStep = steps.find(s => s.type === 'question');
        if (questionStep && questionStep.options && questionStep.options.length > 0) {
            console.log('✅ Branching options found in question step.');
        } else {
            console.warn('⚠️ No options found in question step (or no question step).');
        }

        // Simulate Save Progress
        const progressPayload = {
            user_id: (await supabase.auth.getUser()).data.user?.id, // Might be null if no user
            mission_id: mission.id,
            current_step_id: mission.initial_step_id,
            status: 'started',
            updated_at: new Date().toISOString()
        };

        if (progressPayload.user_id) {
            console.log('Attempting to save progress for user:', progressPayload.user_id);
            const { error: saveError } = await supabase
                .from('mission_progress')
                .upsert(progressPayload, { onConflict: 'user_id, mission_id' });

            if (saveError) {
                console.error('❌ Error saving progress:', saveError.message);
            } else {
                console.log('✅ Progress saved successfully.');
            }
        } else {
            console.log('⚠️ Skipping save progress: No authenticated user in script context.');
        }
    }
}

verify().catch(console.error);
