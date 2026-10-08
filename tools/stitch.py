import sys, json, glob
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
# usage: stitch.py <prefix> <H> <ys-json> <out> <sheetprefix> <stripH> <stripW> <percol>
prefix, H, ys, out = sys.argv[1], int(float(sys.argv[2])), json.loads(sys.argv[3]), sys.argv[4]
files = sorted(glob.glob(f'/mnt/user-data/uploads/Oberdorfer-Team/review/{__import__('os').environ.get('CHUNKDIR','chunks')}/{prefix}_*.png'))
assert len(files) == len(ys), (len(files), len(ys))
first = Image.open(files[0]); W = first.size[0]
canvas = Image.new('RGB', (W, H), 'white')
for f, y in zip(files, ys):
    im = Image.open(f).convert('RGB'); canvas.paste(im, (0, int(round(y))))
canvas.save(out, optimize=True)
sp, stripH, stripW, percol = sys.argv[5], int(sys.argv[6]), int(sys.argv[7]), int(sys.argv[8])
n = (H + stripH - 1) // stripH
scale = stripW / W
strips = [canvas.crop((0, i*stripH, W, min(H, (i+1)*stripH))).resize((stripW, int((min(H, (i+1)*stripH) - i*stripH) * scale))) for i in range(n)]
for s in range(0, n, percol):
    sheet = Image.new('RGB', (percol*(stripW+12), int(stripH*scale)), 'black')
    for j, st in enumerate(strips[s:s+percol]): sheet.paste(st, (j*(stripW+12), 0))
    sheet.save(f'{sp}{s//percol}.jpg', quality=84)
print(W, H, n, 'strips')
