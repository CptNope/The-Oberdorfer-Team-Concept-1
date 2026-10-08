#!/bin/sh
# Assemble the brand book from src/ parts.
#   index.html     full HTML document, served by GitHub Pages
#   artifact.html  fragment (no <html>/<head>/<body>) for publishing as a Claude artifact, whose host adds the skeleton
cd "$(dirname "$0")/.."
{ cat src/00-head.html; cat src/10-book.css; printf '</style>'; cat src/20-cover.html; cat src/30-book.html; cat src/40-book.js; } > artifact.html
{ printf '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<style>:root{padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}body{margin:0}img{max-width:100%%}[hidden]{display:none!important}</style>\n'
  cat src/00-head.html; cat src/10-book.css; printf '</style>\n</head>\n<body>'
  cat src/20-cover.html; cat src/30-book.html; cat src/40-book.js; printf '\n</body>\n</html>\n'; } > index.html
echo "built index.html ($(wc -c < index.html) bytes) and artifact.html ($(wc -c < artifact.html) bytes)"
