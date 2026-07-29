import os
from PIL import Image

folder_path = r"C:\Users\USER\Documents\Olu work Gallery\web dev\yetay_new_3.0"

def format_size(size_bytes):
    """Convert bytes to KB or MB."""
    if size_bytes >= 1024 * 1024:
        return f"{size_bytes / (1024 * 1024):.2f} MB"
    else:
        return f"{size_bytes / 1024:.2f} KB"

print(f"{'Filename':40} {'Dimensions':15} {'Size'}")
print("-" * 75)

for filename in os.listdir(folder_path):
    file_path = os.path.join(folder_path, filename)

    try:
        with Image.open(file_path) as img:
            width, height = img.size
            file_size = os.path.getsize(file_path)

            print(
                f"{filename:40} "
                f"{width} x {height:8} "
                f"{format_size(file_size)}"
            )

    except Exception:
        # Skip files that are not images
        pass