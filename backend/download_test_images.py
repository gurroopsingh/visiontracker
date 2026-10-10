"""
Generate synthetic test images for VisionTracker Phase 2 testing.
- backpack_lost.jpg:   blue rectangle shape (simulates a backpack)
- backpack_found.jpg:  same blue rectangle, slight variation (should match)
- bicycle_unrelated.jpg: bright yellow circle (completely different)
"""
from PIL import Image, ImageDraw
import os

os.makedirs("test_images", exist_ok=True)

def make_backpack_image(filename, shade=50):
    """Blue bag-like shape"""
    img = Image.new("RGB", (224, 224), color=(200, 210, 220))
    d = ImageDraw.Draw(img)
    # Main bag body
    d.rectangle([50, 70, 174, 190], fill=(30, 60, shade + 140))
    # Bag top/strap
    d.rectangle([80, 40, 144, 75], fill=(20, 40, shade + 120))
    # Front pocket
    d.rectangle([70, 120, 154, 165], fill=(20, 50, shade + 110))
    # Zipper line
    d.line([70, 120, 154, 120], fill=(180, 180, 180), width=2)
    img.save(f"test_images/{filename}", "JPEG", quality=90)
    print(f"Created {filename}")

def make_bicycle_image(filename):
    """Bright yellow/orange bicycle-like image - completely different"""
    img = Image.new("RGB", (224, 224), color=(240, 230, 180))
    d = ImageDraw.Draw(img)
    # Wheels
    d.ellipse([20, 100, 100, 180], outline=(30, 30, 30), width=8)
    d.ellipse([124, 100, 204, 180], outline=(30, 30, 30), width=8)
    # Frame triangle
    d.line([60, 140, 164, 140], fill=(200, 80, 20), width=6)
    d.line([164, 140, 112, 60], fill=(200, 80, 20), width=6)
    d.line([112, 60, 60, 140], fill=(200, 80, 20), width=6)
    # Handlebars
    d.line([100, 60, 130, 60], fill=(100, 100, 100), width=4)
    img.save(f"test_images/{filename}", "JPEG", quality=90)
    print(f"Created {filename}")

make_backpack_image("backpack_lost.jpg", shade=50)
make_backpack_image("backpack_found.jpg", shade=55)  # Nearly identical shade variant
make_bicycle_image("bicycle_unrelated.jpg")

print("All test images created.")
