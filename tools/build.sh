#!/bin/sh
# Rebuild index.html, assets/css/brand-book.css, assets/js/brand-book.js and artifact.html from src/.
exec python3 "$(dirname "$0")/build.py"
