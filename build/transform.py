#!/usr/bin/env python3
"""Transform the original single-file upload into the standard multi-file site body.

Run from the project root:  python3 build/transform.py
"""
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]

# Course card covers were expressed as Tailwind arbitrary background-image
# utilities containing raw URLs; they become named component classes instead.
PHOTO_TO_CLASS = {
    'photo-1551288049-bebda4e38f71': 'course-photo--digital-marketing',
    'photo-1675557009285-b55f562641b9': 'course-photo--ai-copywriter',
    'photo-1758873272714-4106a439de5c': 'course-photo--crm',
}

DRIVE_LOGO = 'https://drive.google.com/thumbnail?id=1hc4jjgW0Q4I-NN54nkwh2xOfeC9xEE8f&amp;sz=w1000'
LOCAL_LOGO = 'assets/img/logo-512.jpg'
CSS_MARKER = '        .media-frame img, .media-frame .course-photo {'


def build_body(orig: str) -> str:
    body = orig[orig.index('<body'):orig.index('</body>') + len('</body>')]

    # 1. Self-hosted logo instead of hot-linked Google Drive thumbnails.
    body = body.replace(DRIVE_LOGO, LOCAL_LOGO)

    # 2. Arbitrary background-image utilities -> component classes + CSS rules.
    photos = {}

    def swap(match):
        url = match.group(1)
        photo = re.search(r'unsplash\.com/(photo-[0-9a-z-]+)', url).group(1)
        cls = PHOTO_TO_CLASS[photo]
        photos[cls] = url
        return cls

    body = re.sub(r"bg-\[url\('(.*?)'\)\]", swap, body)

    # 3. Inline JS handler -> declarative hook consumed by js/main.js.
    body = body.replace(
        "onclick=\"window.scrollTo({top: window.innerHeight, behavior: 'smooth'})\"",
        "data-scroll-next")

    # 4. External links get a consistent rel/target.
    body = body.replace(
        '<a href="https://www.youtube.com/@rkvt93" class="hover:text-gold transition">YOUTUBE</a>',
        '<a href="https://www.youtube.com/@rkvt93" target="_blank" rel="noopener noreferrer"'
        ' class="hover:text-gold transition">YOUTUBE</a>')

    # 5. Intrinsic dimensions on imagery to avoid layout shift.
    body = body.replace('alt="" loading="lazy" decoding="async">',
                        'loading="lazy" decoding="async" width="360" height="240" alt="">')
    body = body.replace('class="brand-logo-core', 'width="512" height="512" class="brand-logo-core')

    # 6. Third-party libraries + app script move to the <head>-end / body-end block.
    body = re.sub(
        r"[ \t]*<!-- Libraries -->\s*"
        r"<script src=[\"']https://unpkg\.com/aos[^>]+></script>\s*"
        r"<script src=[\"'][^\"']*vanilla-tilt[^>]+></script>\s*"
        r"<script>.*?</script>",
        lambda m: (
            '    <script src="https://unpkg.com/aos@2.3.4/dist/aos.js" defer></script>\n'
            '    <script src="https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.8.1/vanilla-tilt.min.js" defer></script>\n'
            '    <script src="js/main.js" type="module"></script>'),
        body, flags=re.S)

    # 7. Wrap the page content in a single <main> landmark.
    body = body.replace('<!-- Hero Section -->',
                        '<main id="main-content">\n\n        <!-- Hero Section -->', 1)
    body = body.replace('    <a href="#tutorial" class="tutorial-fab"',
                        '        </main>\n\n    <a href="#tutorial" class="tutorial-fab"', 1)

    return body, photos


def patch_css(css: str, photos: dict) -> str:
    if '.course-photo--digital-marketing' in css:
        return css
    rules = ['\n        /* Course card cover photos (replacing Tailwind arbitrary url() utilities) */\n']
    for cls, url in photos.items():
        rules.append('        .%s { background-image: url("%s"); }\n' % (cls, url))
    return css.replace(CSS_MARKER, ''.join(rules) + CSS_MARKER, 1)


if __name__ == '__main__':
    orig = (ROOT / 'index.orig.html').read_text(encoding='utf-8')
    body, photos = build_body(orig)

    out = ROOT / 'src/_generated/body.html.part'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(body, encoding='utf-8')
    (ROOT / 'src/_generated/photos.json').write_text(json.dumps(photos, indent=2), encoding='utf-8')

    site_css = ROOT / 'src/site.css'
    site_css.write_text(patch_css(site_css.read_text(encoding='utf-8'), photos), encoding='utf-8')

    plain = re.sub(r'<[^>]+>', '', body)
    print('photos:', photos)
    print('drive refs left:', body.count('drive.google.com'))
    print('url() in classes:', body.count('bg-[url'))
    print('inline handlers:', len(re.findall(r'\son(click|load|error|mouse\w+|key\w+)\s*=', body)))
    print('main open/close:', body.count('<main'), body.count('</main>'))
    print('h1 count:', len(re.findall(r'<h1', body)), 'h2:', len(re.findall(r'<h2', body)))
    print('script tags in body:', len(re.findall(r'<script', body)))
    print('style tags:', len(re.findall(r'<style', plain)) + body.count('<style'))
