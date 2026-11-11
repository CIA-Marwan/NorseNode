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
FRONTEND_EXTENSIONS = {".html", ".css", ".js"}
PUBLISHED_ROOT_FILES = {"CNAME", "favicon.png", "robots.txt", "sitemap.xml"}
EXCLUDED_DIRECTORIES = {".git", ".github", ".venv", "__pycache__", "_site"}


def main():
    if PAGES_ROOT.is_symlink():
        raise SystemExit(f"Refusing to build into a symbolic link: {PAGES_ROOT}")

    if PAGES_ROOT.exists():
        shutil.rmtree(PAGES_ROOT)
    PAGES_ROOT.mkdir()

    copied_files = 0
    for source in PROJECT_ROOT.rglob("*"):
        relative_path = source.relative_to(PROJECT_ROOT)
        if any(part in EXCLUDED_DIRECTORIES for part in relative_path.parts):
            continue
        if source.is_symlink():
            raise SystemExit(f"Refusing to publish a symbolic link: {relative_path}")
        if not source.is_file():
            continue
        if (
            source.suffix.lower() not in FRONTEND_EXTENSIONS
            and relative_path.as_posix() not in PUBLISHED_ROOT_FILES
        ):
            continue

        destination = PAGES_ROOT / relative_path
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, destination)
        copied_files += 1

    if not (PAGES_ROOT / "index.html").is_file():
        raise SystemExit("The Pages build is missing its root index.html entry point.")

    print(f"Built {copied_files} public site files in {PAGES_ROOT}")


if __name__ == "__main__":
    main()
