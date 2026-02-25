# Physics V2 Update

I have overhauled `BoatPhysics.ts` to implement **Realistic Physics v2** as requested:

1.  **Strict "No-Go Zone" (Ceñida)**:
    -   When heading into the wind (< 30°), the sail loses all efficiency ("ions") and generates drag.
    -   The boat will coast to a stop and drift backward if you stay in this zone, requiring proper tacking momentum.

2.  **Downwind Sailing (Popa)**:
    -   Implemented a "Bisector Rule" for optimal trim.
    -   For **Viento de Popa (180°)**, the optimal sail angle is now **90°**. If you open the sail fully, you get 100% efficiency.
    -   If you keep the sail centered downwind, you lose power (Efficiency 0).

3.  **Realistic Maneuvers**:
    -   **Tacking (Virada)**: You must carry speed through the eye of the wind. If too slow, you will get stuck.
    -   **Forces**: Propulsion and Heeling are now calculated separately based on wind angle.
        -   **Upwind**: High Heeling, lower forward Drive.
        -   **Downwind**: Low Heeling, high forward Drive.

## How to Test
-   **Into Wind**: Sail directly into the wind -> Check stopping.
-   **Downwind**: Turn downwind and open sail to 90° -> Check speed.
-   **Tacking**: Try a smooth tack carrying momentum.
