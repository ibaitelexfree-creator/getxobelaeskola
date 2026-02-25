import re

file_path = 'src/components/academy/peer-review/PeerReviewDashboard.tsx'

with open(file_path, 'r') as f:
    content = f.read()

# Pattern to find the useEffect and loadTasks block
pattern = re.compile(r'useEffect\(\(\) => \{\s*loadTasks\(\);\s*\}, \[moduleId\]\);\s*async function loadTasks\(\) \{(\s*setLoading\(true\);\s*const res = await getPendingReviews\(moduleId\);\s*if \(res.reviews\) \{\s*setTasks\(res.reviews\);\s*\} else \{\s*console.error\(res.error\);\s*\}\s*setLoading\(false\);)\s*\}', re.DOTALL)

replacement = r'''useEffect(() => {
        async function loadTasks() {\1}
        loadTasks();
    }, [moduleId]);'''

new_content = pattern.sub(replacement, content)

if new_content == content:
    print("No replacement made. Check pattern.")
else:
    with open(file_path, 'w') as f:
        f.write(new_content)
    print("Replacement successful.")
