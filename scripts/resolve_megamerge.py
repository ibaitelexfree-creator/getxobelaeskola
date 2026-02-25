import os
import subprocess

# Files to resolve with 'ours'
OURS = [
    "src/lib/geospatial/water-check.ts",
]

# Files to resolve with 'theirs'
THEIRS = [
    "src/app/api/logbook/upload-track/route.ts",
    "src/app/api/student/dashboard-stats/route.ts",
    "src/components/academy/nomenclature/3d/Components.test.tsx",
    "src/lib/auth-guard.test.ts",
    "src/lib/auth-guard.ts",
    "src/lib/geospatial/water-check.test.ts",
]

def resolve(files, strategy):
    for f in files:
        if not os.path.exists(f):
             continue
        print(f"Resolving {f} with {strategy}...")
        subprocess.run(["git", "checkout", f"--{strategy}", f])
        subprocess.run(["git", "add", f])

if __name__ == "__main__":
    resolve(OURS, "ours")
    resolve(THEIRS, "theirs")
    print("Conflict resolution complete.")
