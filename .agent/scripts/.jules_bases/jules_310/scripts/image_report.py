
import os

def get_image_report(directory):
    print(f"{'File Path':<80} | {'Size (KB)':>10}")
    print("-" * 95)
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(('.png', '.webp', '.jpg', '.jpeg', '.svg')):
                filepath = os.path.join(root, file)
                size_kb = os.path.getsize(filepath) / 1024
                if size_kb > 50: # Only show images over 50KB
                    rel_path = os.path.relpath(filepath, directory)
                    print(f"{rel_path:<80} | {size_kb:>10.2f}")

if __name__ == "__main__":
    get_image_report("public/images")
