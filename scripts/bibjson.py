from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any

try:
    import bibtexparser
except ImportError:
    print(
        "Missing dependency: bibtexparser\n"
        "Install it with:\n"
        "pip install bibtexparser"
    )
    sys.exit(1)


ROOT_DIR = Path(__file__).resolve().parent.parent
BIB_FILE = ROOT_DIR / "bib" / "cvpubs.bib"
OUTPUT_FILE = ROOT_DIR / "data" / "publications.json"


def clean_latex_text(value: Any) -> str:
    """
    Apply conservative cleanup while retaining most publication text.
    Complex mathematical LaTeX should be handled separately if needed.
    """
    if value is None:
        return ""

    text = str(value).strip()

    replacements = {
        r"\&": "&",
        r"\%": "%",
        r"\_": "_",
        r"\#": "#",
        r"\textendash": "–",
        r"\textemdash": "—",
        "---": "—",
        "--": "–",
        "~": " ",
    }

    for old, new in replacements.items():
        text = text.replace(old, new)

    # Remove simple LaTeX formatting commands while preserving their text.
    formatting_commands = [
        "textbf",
        "textit",
        "emph",
        "mathrm",
        "mathbf",
        "mathit",
        "textrm",
        "text",
    ]

    for command in formatting_commands:
        pattern = rf"\\{command}\s*\{{([^{{}}]*)\}}"
        text = re.sub(pattern, r"\1", text)

    # Remove outer or formatting braces.
    text = text.replace("{", "").replace("}", "")

    text = re.sub(r"\s+", " ", text)

    return text.strip()


def split_authors(author_field: str) -> list[str]:
    """
    Split a standard BibTeX author field using 'and'.
    """
    if not author_field:
        return []

    authors = re.split(r"\s+and\s+", author_field.strip())

    return [
        clean_latex_text(author)
        for author in authors
        if author.strip()
    ]


def parse_keywords(keyword_field: str) -> list[str]:
    if not keyword_field:
        return []

    return [
        clean_latex_text(keyword).strip()
        for keyword in keyword_field.split(",")
        if keyword.strip()
    ]


def normalize_entry(entry: dict[str, Any]) -> dict[str, Any]:
    entry_type = entry.get("ENTRYTYPE", "").lower()
    entry_key = entry.get("ID", "")

    normalized: dict[str, Any] = {
        "entrykey": entry_key,
        "entrytype": entry_type,
    }

    for field_name, value in entry.items():
        if field_name in {"ENTRYTYPE", "ID"}:
            continue

        lower_name = field_name.lower()

        if lower_name == "author":
            normalized["author"] = clean_latex_text(value)
            normalized["authors"] = split_authors(value)

        elif lower_name == "keywords":
            normalized["keywords"] = parse_keywords(value)

        else:
            normalized[lower_name] = clean_latex_text(value)

    return normalized


def publication_sort_key(
    publication: dict[str, Any]
) -> tuple[int, str]:
    try:
        year = int(publication.get("year", 0))
    except (TypeError, ValueError):
        year = 0

    title = str(publication.get("title", "")).lower()

    return (-year, title)


def main() -> None:
    if not BIB_FILE.exists():
        raise FileNotFoundError(
            f"BibTeX file not found: {BIB_FILE}"
        )

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    with BIB_FILE.open(
        "r",
        encoding="utf-8"
    ) as bib_file:
        bib_database = bibtexparser.load(bib_file)

    publications = [
        normalize_entry(entry)
        for entry in bib_database.entries
    ]

    publications.sort(key=publication_sort_key)

    with OUTPUT_FILE.open(
        "w",
        encoding="utf-8"
    ) as output_file:
        json.dump(
            publications,
            output_file,
            ensure_ascii=False,
            indent=2
        )

    journal_count = sum(
        publication["entrytype"] == "article"
        for publication in publications
    )

    conference_count = sum(
        publication["entrytype"] == "inproceedings"
        for publication in publications
    )

    print(f"Input: {BIB_FILE}")
    print(f"Output: {OUTPUT_FILE}")
    print(f"Total publications: {len(publications)}")
    print(f"Journal articles: {journal_count}")
    print(f"Conference papers: {conference_count}")


if __name__ == "__main__":
    main()