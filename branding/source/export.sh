#!/bin/sh
# Renders branding/svg into PNG deliverables and copies app + web icons into place.
# Needs: a Python with fontTools (PYTHON), rsvg-convert or another render_png.py backend, macOS sips.
set -e
PYTHON=${PYTHON:-python3}
SKILL=${SKILL:-$HOME/.claude/plugins/cache/logo-design-skill/logo-design/1.4.5/skills/logo-design/scripts}
LOGO=$(cd "$(dirname "$0")/.." && pwd)
REPO=$(dirname "$LOGO")
render() { python3 "$SKILL/render_png.py" "$@" >/dev/null; }

"$PYTHON" "$LOGO/source/build.py"
cd "$LOGO/svg"
mkdir -p ../png ../web

for f in pms-check-horizontal pms-check-horizontal-dark-bg pms-check-horizontal-black pms-check-horizontal-white; do
  render $f.svg -o ../png/$f.png --width 2400 --height 600
done
for f in pms-check-stacked pms-check-stacked-dark-bg; do
  render $f.svg -o ../png/$f.png --size 1200
done
for f in pms-check-icon pms-check-symbol-dark-bg pms-check-symbol-black pms-check-symbol-white; do
  render $f.svg -o ../png/$f.png --size 1024
done

# App Store icons must be opaque: round-trip through JPEG to drop the alpha channel.
render pms-check-icon-square.svg -o ../png/app-icon-1024.png --size 1024
sips -s format jpeg ../png/app-icon-1024.png --out /tmp/pms-icon.jpg >/dev/null
sips -s format png /tmp/pms-icon.jpg --out ../png/app-icon-1024.png >/dev/null

IMG="$REPO/app/mobile/assets/images"
cp ../png/app-icon-1024.png "$IMG/icon.png"
render pms-check-icon.svg -o "$IMG/splash-icon.png" --size 512
render pms-check-icon-small.svg -o "$IMG/favicon.png" --size 48
render android-foreground.svg -o "$IMG/android-icon-foreground.png" --size 512
render android-background.svg -o "$IMG/android-icon-background.png" --size 512
render android-monochrome.svg -o "$IMG/android-icon-monochrome.png" --size 432

render pms-check-icon-small.svg --ico ../web/favicon.ico --ico-sizes 16 32 48
render pms-check-icon-square.svg -o ../web/apple-touch-icon.png --size 180
render pms-check-icon-square.svg -o ../web/icon-512.png --size 512
render pms-check-icon-square.svg -o ../web/icon-192.png --size 192
cp pms-check-icon-small.svg ../web/favicon.svg

PUB="$REPO/landing-page/public"
cp ../web/favicon.svg ../web/favicon.ico ../web/apple-touch-icon.png "$PUB/"
echo "done"
