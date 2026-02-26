<<<<<<< HEAD
export interface ScoreEntry {
    name: string;
    score: number;
    date: string;
}

export class ScoringManager {
    public totalScore: number = 0;
    public buoysCollected: number = 0;
    private currentBuoyTime: number = 0;
    public readonly MAX_BUOYS = 5;
    private readonly POINTS_PER_BUOY = 1000;

    // Leaderboard
    public leaderboard: ScoreEntry[] = [];

    constructor() {
        this.currentBuoyTime = 0;
    }

    public update(dt: number) {
        this.currentBuoyTime += dt;
    }

    public addObjectiveBonus(): number {
        if (this.buoysCollected >= this.MAX_BUOYS) return 0;

        const timeTaken = this.currentBuoyTime;
        this.currentBuoyTime = 0;

        // Score: Max points minus time taken (seconds). Minimum 10 points.
        const points = Math.max(10, Math.floor(this.POINTS_PER_BUOY - timeTaken * 8));

        this.totalScore += points;
        this.buoysCollected++;
        return points;
    }

    public addEventBonus(timeLeft: number) {
        // Optional: Bonus for random interactions
        this.totalScore += Math.floor(timeLeft * 50);
    }

    public isGameOver(): boolean {
        return this.buoysCollected >= this.MAX_BUOYS;
    }

    public getScoreDisplay(): string {
        return Math.floor(this.totalScore).toString().padStart(6, '0');
    }

    // Simplified Ranking Logic (to be verified on Main Thread)
    public getRank(leaderboard: ScoreEntry[]): number {
        // Find position if this score was inserted
        const sorted = [...leaderboard, { name: 'YOU', score: this.totalScore, date: '' }]
            .sort((a, b) => b.score - a.score);
        return sorted.findIndex(e => e.name === 'YOU' && e.score === this.totalScore) + 1;
    }
}
=======
// import * as THREE from 'three'; // Unused
import { BoatState } from './BoatPhysics';
import { ObjectiveState } from './ObjectiveManager';

export interface ScoreEntry {
    name: string;
    score: number;
    date: string;
}

export class ScoringManager {
    public totalScore: number = 0;
    public buoysCollected: number = 0;
    private buoyStartTime: number = 0;
    public readonly MAX_BUOYS = 5;
    private readonly POINTS_PER_BUOY = 1000;

    // Leaderboard
    public leaderboard: ScoreEntry[] = [];

    constructor() {
        this.buoyStartTime = performance.now() / 1000;
    }

    public update(dt: number, boatState: BoatState, objective: ObjectiveState) {
        // Only accumulating time for the current buoy
    }

    public addObjectiveBonus(distance: number): number {
        if (this.buoysCollected >= this.MAX_BUOYS) return 0;

        const now = performance.now() / 1000;
        const timeTaken = now - this.buoyStartTime;
        this.buoyStartTime = now;

        // Score: Max points minus time taken (seconds). Minimum 10 points.
        const points = Math.max(10, Math.floor(this.POINTS_PER_BUOY - timeTaken * 8));

        this.totalScore += points;
        this.buoysCollected++;
        return points;
    }

    public addEventBonus(timeLeft: number) {
        // Optional: Bonus for random interactions
        this.totalScore += Math.floor(timeLeft * 50);
    }

    public isGameOver(): boolean {
        return this.buoysCollected >= this.MAX_BUOYS;
    }

    public getScoreDisplay(): string {
        return Math.floor(this.totalScore).toString().padStart(6, '0');
    }

    // Simplified Ranking Logic (to be verified on Main Thread)
    public getRank(leaderboard: ScoreEntry[]): number {
        // Find position if this score was inserted
        const sorted = [...leaderboard, { name: 'YOU', score: this.totalScore, date: '' }]
            .sort((a, b) => b.score - a.score);
        return sorted.findIndex(e => e.name === 'YOU' && e.score === this.totalScore) + 1;
    }
}
>>>>>>> pr-286
