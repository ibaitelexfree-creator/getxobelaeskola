import subprocess
import os

SMALL_BRANCHES = [
    "jules-fix-errors",
    "origin/jules/fix-syntax-compilation-errors-12255186374862323117",
    "origin/feature/telegram-fix",
    "origin/jules/fix-syntax-compilation-errors-15722361937476666842",
    "origin/jules/fix-orchestration-script-syntax-17580617935887346459",
    "origin/jules/fix-compilation-errors-16402970181243150616",
    "origin/jules/fix-lint-warnings-7838590170719281389",
    "origin/openapi-voting-api-8203428178719386512",
    "origin/jules/fix-deployment-env-10315338086975626514",
    "origin/jules/fix-syntax-compilation-errors-16509586750753116835",
    "origin/feature/jules-architect-comments-design-4480190074039223378",
    "origin/jules/fix-bad-gateway-deploy-4492500184943414611",
    "origin/feature/jules-architect-comments-design-2663675582213568317",
    "origin/jules/arch-notion-refactor-sync-service-160771138921399960",
    "origin/jules/fix-lint-errors-17071256425989174302",
    "origin/photo-voting-system-16850243488200005208",
    "origin/feature/notification-architecture-11774852172402089735",
    "origin/architect-comment-system-fail-9766845636691317621",
    "origin/design/comment-system-schema-325110577445404919",
    "origin/perf/landing-page-optimization-10800237892777992348",
    "origin/jules/fix-bad-gateway-17536962864765605811"
]

def run_cmd(cmd):
    print(f"> {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result

def main():
    # Start features from main
    run_cmd(['git', 'checkout', '-B', 'features', 'main'])
    
    results = []
    for branch in SMALL_BRANCHES:
        print(f"\nMerging {branch}...")
        merge_res = run_cmd(['git', 'merge', branch, '--no-edit'])
        if merge_res.returncode != 0:
            print(f"CONFLICT in {branch}!")
            results.append((branch, "CONFLICT"))
            run_cmd(['git', 'merge', '--abort'])
        else:
            print(f"Merged {branch} successfully.")
            results.append((branch, "MERGED"))
            
    print("\nMerge Summary:")
    for b, res in results:
        print(f"{b}: {res}")
        
    # Final build check
    print("\nRunning compilation check...")
    build_res = subprocess.run(['npm', 'run', 'build'], shell=True)
    if build_res.returncode == 0:
        print("Build SUCCESSFUL")
    else:
        print("Build FAILED")

if __name__ == "__main__":
    main()
