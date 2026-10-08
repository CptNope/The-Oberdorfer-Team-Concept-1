"""Split a tall full-page capture into lossless PNG parts, or join parts back.

  python3 tools/split_capture.py split .impeccable/review/desktop.png .impeccable/review/full/desktop 3000
  python3 tools/split_capture.py join  .impeccable/review/full/desktop .impeccable/review/desktop.png

Parts are numbered part-01.png, part-02.png, ... top to bottom; joining stacks them in order.
"""
import sys, os, glob
from PIL import Image
Image.MAX_IMAGE_PIXELS = None

def split(src, out_dir, h):
    im = Image.open(src); W, H = im.size
    os.makedirs(out_dir, exist_ok=True)
    n = 0
    for y in range(0, H, h):
        n += 1
        im.crop((0, y, W, min(H, y + h))).save(os.path.join(out_dir, f'part-{n:02d}.png'), optimize=True)
    print(f'{src}: {W}x{H} -> {n} parts in {out_dir}')

def join(in_dir, dst):
    parts = [Image.open(p) for p in sorted(glob.glob(os.path.join(in_dir, 'part-*.png')))]
    W = parts[0].size[0]; H = sum(p.size[1] for p in parts)
    out = Image.new(parts[0].mode, (W, H)); y = 0
    for p in parts: out.paste(p, (0, y)); y += p.size[1]
    out.save(dst); print(f'{len(parts)} parts -> {dst} ({W}x{H})')

if __name__ == '__main__':
    if sys.argv[1] == 'split': split(sys.argv[2], sys.argv[3], int(sys.argv[4]))
    else: join(sys.argv[2], sys.argv[3])
