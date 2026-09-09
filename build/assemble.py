#!/usr/bin/env python3
"""Assemble index.html from src/head.html + the transformed body part.

Usage:  python3 build/assemble.py [https://your-site.example]
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
ORIGIN = (sys.argv[1] if len(sys.argv) > 1 else 'https://keovothy93.github.io').rstrip('/')

SKIP = """<!-- Accessibility skip link -->
    <a href="#main-content" class="skip-link">រំកិលទៅខ្លឹមសារសំខាន់</a>

    <noscript>
        <p class="noscript-notice">សូមបើក JavaScript ដើម្បីប្រើប្រាស់គ្រប់មុខងាររបស់វេបសាយ។</p>
    </noscript>
    """

head = (ROOT / 'src/head.html').read_text(encoding='utf-8')
head = head.replace('__CANONICAL__', ORIGIN + '/index.html').replace('__ORIGIN__', ORIGIN)

body = (ROOT / 'src/_generated/body.html.part').read_text(encoding='utf-8')
body = body.replace('<body class="antialiased flex flex-col min-h-screen">\n',
                    '<body class="antialiased flex flex-col min-h-screen">\n\n    ' + SKIP, 1)

page = head + '\n' + body + '\n'
(ROOT / 'index.html').write_text(page, encoding='utf-8')
print('index.html:', len(page), 'bytes,', page.count('\n') + 1, 'lines')
print('remaining placeholders:', page.count('__ORIGIN__') + page.count('__CANONICAL__'))
print('drive/blogger leftovers:', page.count('drive.google.com'), page.count('navbar-iframe'))
