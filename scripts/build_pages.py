#!/usr/bin/env python3
"""
Norse Node
Copyright (c) 2026 Marwan Abdelrahman.
All rights reserved.

Original source code is proprietary.
No permission is granted to copy, modify,
redistribute, sublicense, or commercially
exploit this software without prior written
authorization from the copyright holder.

Project: Norse Node
Author: Marwan Abdelrahman
"""
from pathlib import Path
import shutil


PROJECT_ROOT = Path(__file__).resolve().parents[1]
PAGES_ROOT = PROJECT_ROOT / "_site"
SITE_ROOT = PROJECT_ROOT / "site"
FRONTEND_EXTENSIONS = {".html", ".css", ".js"}


def main():
    if not SITE_ROOT.is_dir() or SITE_ROOT.is_symlink():
        raise SystemExit(f"Expected a real frontend source directory at {SITE_ROOT}")
    if PAGES_ROOT.is_symlink():
        raise SystemExit(f"Refusing to build into a symbolic link: {PAGES_ROOT}")

    if PAGES_ROOT.exists():
        shutil.rmtree(PAGES_ROOT)
    PAGES_ROOT.mkdir()

    copied_files = 0
    sources = [PROJECT_ROOT / "index.html", *sorted(SITE_ROOT.rglob("*"))]
    for source in sources:
        if source.is_symlink():
            raise SystemExit(f"Refusing to publish a symbolic link: {source}")
        if not source.is_file() or source.suffix.lower() not in FRONTEND_EXTENSIONS:
            continue

        relative_path = (
            Path("index.html")
            if source == PROJECT_ROOT / "index.html"
            else source.relative_to(SITE_ROOT)
        )
        destination = PAGES_ROOT / relative_path
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, destination)
        copied_files += 1

    if not (PAGES_ROOT / "index.html").is_file():
        raise SystemExit("The Pages build is missing its root index.html entry point.")

    print(f"Built {copied_files} frontend files in {PAGES_ROOT}")


if __name__ == "__main__":
    main()
