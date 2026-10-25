"""
Turns the front-flying flamingos gif into a strip of its frames, one under the
other, at a size a browser can draw many times over: the flight at the end of
the fauna chapter and the start of the orology chapter draws dozens of flocks
at once on one canvas (assets/js/flamingo-flight.js), which as separate
full-size gifs brought the page down to a few frames per second.

Reads  assets/images/flamingo_front.gif
Writes assets/images/flamingo_front_frames.png

Run it again after replacing the gif:
    python tools/make_flight_frames.py
"""
import os
from PIL import Image, ImageSequence

HERE = os.path.dirname(os.path.abspath(__file__))
IMAGES = os.path.join(HERE, '..', 'assets', 'images')
SOURCE = os.path.join(IMAGES, 'flamingo_front.gif')
OUT = os.path.join(IMAGES, 'flamingo_front_frames.png')

WIDTH = 1600   # px of each frame: the flocks are drawn up to about this wide


def main():
    gif = Image.open(SOURCE)
    w = WIDTH
    h = round(gif.height * WIDTH / gif.width)
    frames = [f.convert('RGBA').resize((w, h), Image.LANCZOS) for f in ImageSequence.Iterator(gif)]
    strip = Image.new('RGBA', (w, h * len(frames)))
    for i, f in enumerate(frames):
        strip.paste(f, (0, i * h))
    strip.save(OUT, optimize=True)
    print(f'wrote {os.path.relpath(OUT)}: {len(frames)} frames of {w}x{h}, '
          f'{gif.info.get("duration")} ms each')


if __name__ == '__main__':
    main()
