#!/usr/bin/env python3
import json
import os
import sys
import urllib.parse
from pathlib import Path

import urllib.request


API_URL = "https://huggingface.co/api/datasets/SharedPL25/parentlab/tree/main?recursive=1"
OUTPUT = Path(__file__).resolve().parents[1] / "public" / "data.json"


def fetch_repo_tree(url: str) -> list:
  req = urllib.request.Request(url, headers={"User-Agent": "parentlab-index/1.0"})
  with urllib.request.urlopen(req) as resp:
    data = resp.read()
    return json.loads(data)


def simplify(entries: list) -> list:
  simplified = []
  for e in entries:
    if e.get("type") != "file":
      continue
    path = e.get("path")
    if not path:
      continue
    simplified.append({
      "path": path,
      "size": e.get("size", 0)
    })
  return simplified


def main() -> int:
  try:
    entries = fetch_repo_tree(API_URL)
  except Exception as err:
    print(f"Failed to fetch repo tree: {err}", file=sys.stderr)
    return 1
  items = simplify(entries)
  OUTPUT.parent.mkdir(parents=True, exist_ok=True)
  with open(OUTPUT, "w", encoding="utf-8") as f:
    json.dump(items, f, ensure_ascii=False, indent=2)
  print(f"Wrote {len(items)} items to {OUTPUT}")
  return 0


if __name__ == "__main__":
  raise SystemExit(main())


