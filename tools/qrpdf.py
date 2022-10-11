import argparse
import qrcode
import itertools
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch, cm
from reportlab.lib.utils import ImageReader

COUNT = (5, 7)

UNIT_SIZE = (3 * cm, 3 * cm)
UNIT_PADDING = (1 * cm, 1 * cm)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("output", help="output filename")
    args = parser.parse_args()

    lines = []
    try:
        while True:
            line = input()
            lines.append(line)
    except EOFError:
        pass

    c = canvas.Canvas(args.output)

    xcount, ycount = COUNT
    width, height = UNIT_SIZE
    xpad, ypad = UNIT_PADDING

    imgs = [qrcode.make(line)._img for line in lines]

    done = False
    for i in itertools.count():
        for y in range(ycount):
            for x in range(xcount):
                idx = i * xcount * ycount + y * xcount + x
                if idx >= len(imgs):
                    done = True
                    break

                c.drawImage(
                    ImageReader(imgs[idx]),
                    xpad + x * (width + xpad),
                    ypad + y * (height + ypad),
                    width,
                    height,
                )
            if done:
                break

        c.showPage()
        if done:
            break

    c.save()


if __name__ == "__main__":
    main()
