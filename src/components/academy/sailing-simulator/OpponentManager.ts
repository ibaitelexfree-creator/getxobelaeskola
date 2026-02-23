import { Scene, Vector3 } from 'three';
import { BoatModel } from './BoatModel';
import { OpponentState } from '../../../types/regatta'; // Adjust path
import { ApparentWind } from './WindManager';

export class OpponentManager {
    private scene: Scene;
    private opponents: Map<string, BoatModel>;

    constructor(scene: Scene) {
        this.scene = scene;
        this.opponents = new Map();
    }

    public update(dt: number, time: number, states: OpponentState[]) {
        const activeIds = new Set<string>();

        // Ensure states is an array (handling potential null/undefined from message)
        const validStates = Array.isArray(states) ? states : [];

        for (const state of validStates) {
            activeIds.add(state.userId);
            let boat = this.opponents.get(state.userId);

            if (!boat) {
                boat = new BoatModel();
                // Add to scene
                this.scene.add(boat.group);
                this.opponents.set(state.userId, boat);
            }

            // Construct Vector3 from serializable state
            const position = new Vector3(state.position.x, state.position.y, state.position.z);

            // Create a mock ApparentWind for visualization purposes.
            // Ideally, we'd sync this too, but for now we just want the boat to look "active".
            // We set angleToBoat to PI (180) so windex points back? No, windex points INTO wind.
            // Let's just default to 0.
            const mockApparentWind: ApparentWind = {
                speed: 10,
                vector: new Vector3(),
                angleToBoat: 0
            };

            // Construct a partial BoatState required by BoatModel.update
            // We only populate fields used by BoatModel for rendering.
            const mockBoatState = {
                position: position,
                velocity: new Vector3(),
                heading: state.heading,
                angularVelocity: 0,
                liftCoeff: 0,
                dragCoeff: 0,
                efficiency: 1.0, // Assume efficient sailing for visuals
                aoa: 0,
                tack: 0,
                heel: state.heel,
                speed: state.speed,
                speedKmh: state.speed * 1.852
            };

            // Call update on the model
            // rudderAngle is not currently synced, so we pass 0.
            boat.update(dt, time, mockBoatState, mockApparentWind, state.sailAngle, 0);
        }

        // Cleanup disconnected opponents
        for (const [id, boat] of this.opponents) {
            if (!activeIds.has(id)) {
                this.scene.remove(boat.group);
                this.opponents.delete(id);
            }
        }
    }
}
