import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { LearningPathRecommender } from '@/lib/academy/montessori/recommender';
import { MOCK_TOPICS } from '@/lib/academy/montessori/mock-data';
import { MontessoriGraph, UserProgress, MontessoriNode } from '@/lib/academy/montessori/types';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Fetch User Progress (Scores & Completions)
        const [
            { data: progressData },
            { data: attemptsData }
        ] = await Promise.all([
            supabase.from('progreso_alumno').select('*').eq('alumno_id', user.id),
            supabase.from('intentos_evaluacion').select('*').eq('alumno_id', user.id)
        ]);

        // 2. Build Progress Map
        const progressMap: Record<string, UserProgress> = {};

        const { data: dbUnits } = await supabase.from('unidades_didacticas').select('id, titulo, modulo_id');

        let nodes: MontessoriNode[] = MOCK_TOPICS;

        const realCompletedCount = progressData?.filter(p => p.estado === 'completado').length || 0;

        MOCK_TOPICS.forEach(topic => {
            progressMap[topic.id] = {
                nodeId: topic.id,
                status: 'locked',
                attempts: 0,
                score: 0
            };
        });

        // Simulate some progress based on real DB activity to make it feel "live"
        if (realCompletedCount > 0) {
            progressMap['safety-basics'].status = 'completed';
            progressMap['safety-basics'].score = 0.85; // Mock score
            progressMap['knots-101'].status = 'available';
        } else {
            // New user
            progressMap['safety-basics'].status = 'available';
            progressMap['knots-101'].status = 'available';
            progressMap['parts-of-boat'].status = 'available';
        }

        // 3. Run Recommender
        const recommender = new LearningPathRecommender();
        const recommendations = recommender.recommend(nodes, progressMap);
        const bestNode = recommendations.length > 0 ? recommendations[0] : null;

        // 4. Construct Graph Response
        const graph: MontessoriGraph = {
            nodes: nodes,
            edges: [],
            userProgress: progressMap,
            recommendedNodeId: bestNode?.nodeId || null
        };

        // Generate edges for visualization
        nodes.forEach(node => {
            node.prerequisites.forEach(prereqId => {
                graph.edges.push({ source: prereqId, target: node.id });
            });
        });

        return NextResponse.json(graph);

    } catch (error: any) {
        console.error('Montessori API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
