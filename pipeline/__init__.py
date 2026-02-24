"""DTD Pipeline — Data pipeline and content tools for Dungeons the Dragoning 40,000."""

from pathlib import Path

# Project root is the workspace directory (parent of pipeline/)
PROJECT_ROOT = Path(__file__).resolve().parent.parent
BOOKS_DIR = PROJECT_ROOT / "books"
CLEANED_REFS_DIR = PROJECT_ROOT / "cleaned-references"
DATA_DIR = PROJECT_ROOT / "tools" / "shared" / "data"
SOURCE_PDFS_DIR = PROJECT_ROOT / "source-pdfs"
