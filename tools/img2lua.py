import argparse
import math
import sys
from PIL import Image

WIDTH=64
HEIGHT=36

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("file")
    args = parser.parse_args()
    
    im = Image.open(args.file)
    im = im.convert("RGB")
    if not math.isclose(im.width / im.height, WIDTH / HEIGHT):
        print("WARNING: image aspect ratio was incorrect", file=sys.stderr)
    im.thumbnail((WIDTH, HEIGHT), Image.LANCZOS)
    
    for i in range(im.width):
        for j in range(im.height):
            r, g, b = im.getpixel((i, j))
            print(f"image[{i}][{j}] = rgb({r}, {g}, {b})")

if __name__ == "__main__":
    main()