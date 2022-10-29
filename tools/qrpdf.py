import argparse
import qrcode
import sys
import itertools
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch, cm
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import stringWidth

COUNT = (6, 9)
UNIT_SIZE = (2.6 * cm, 2.6 * cm)
UNIT_PADDING = (0.4 * cm, 0.4 * cm)
PAGE_PADDING = (2 * cm, 2 * cm)
FONT_SIZE = 0.2 * cm


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("output", help="output filename")
    args = parser.parse_args()

    lines = []
    try:
        while True:
            line = input()
            lines.append(line.split(","))
    except EOFError:
        pass

    c = canvas.Canvas(args.output)
    pdfmetrics.registerFont(TTFont("Hack", "Hack-Regular.ttf"))
    font = ("Hack", FONT_SIZE)

    xcount, ycount = COUNT
    width, height = UNIT_SIZE
    xpad, ypad = UNIT_PADDING
    xppad, yppad = PAGE_PADDING

    imgs = [qrcode.make(line[0])._img for line in lines]
    texts = [(line[1] if len(line) > 1 else "") for line in lines]

    done = False
    for i in itertools.count():
        c.setFont(*font)
        for y in range(ycount):
            for x in range(xcount):
                idx = i * xcount * ycount + y * xcount + x
                if idx >= len(imgs):
                    done = True
                    break

                c.drawImage(
                    ImageReader(imgs[idx]),
                    xppad + xpad + x * (width + xpad),
                    yppad + ypad + y * (height + ypad),
                    width,
                    height,
                )

                if text := texts[idx]:
                    text_width = stringWidth(text, *font)
                    c.drawString(
                        xppad + xpad + x * (width + xpad) + width / 2 - text_width / 2,
                        yppad + ypad + y * (height + ypad) - FONT_SIZE / 2,
                        text,
                    )
            if done:
                break

        if done:
            break
        c.showPage()

    c.save()


if __name__ == "__main__":
    main()
