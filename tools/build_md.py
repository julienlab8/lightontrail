#!/usr/bin/env python3
"""Génère les versions Markdown des pages principales (proposition llms.txt v2).

La page HTML fait foi : ce script en extrait le contenu principal (<main>) et
l'écrit dans <page>.md à la racine du site. À relancer après chaque
modification d'une de ces pages :

    python3 tools/build_md.py
"""
import html
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = "https://www.lightontrail.com/"
PAGES = {
    "index.html": "index.md",
    "courses.html": "courses.md",
    "evenement.html": "evenement.md",
    "infos.html": "infos.md",
    "reglement.html": "reglement.md",
    "resultats.html": "resultats.md",
    "communaute.html": "communaute.md",
    "actualites.html": "actualites.md",
}
# blocs sans texte utile pour un agent (décor, compte à rebours, logos, formulaires)
SKIP_TAGS = {"script", "style", "svg", "video", "iframe", "form", "picture", "img", "noscript", "button", "source"}
SKIP_CLASSES = {"count-band", "h-partners", "h-newsletter", "swipe-hint", "geo", "glow", "picto", "sr-skip", "tl-tag"}
BLOCKS = {"p", "li", "h1", "h2", "h3", "h4", "dt", "dd", "summary", "blockquote", "figcaption", "caption", "tr", "td", "th", "div", "section", "figure", "details", "dl", "ul", "ol", "table", "article"}


def absolute(href):
    if href.startswith(("http://", "https://", "mailto:", "tel:")):
        return href
    if href in ("./", ""):
        return BASE
    if href.startswith("#"):
        return href
    return BASE + href.lstrip("/")


class MainToMarkdown(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.in_main = False
        self.skip_depth = 0
        self.stack = []          # balises ouvertes dans <main>
        self.out = []            # lignes produites
        self.buf = ""            # texte du bloc en cours
        self.prefix = ""         # préfixe Markdown du bloc en cours
        self.link = None         # (href, texte)
        self.table = None        # lignes du tableau en cours
        self.row = None

    # --- utilitaires
    def flush(self):
        text = re.sub(r"[ \t\r\n]+", " ", self.buf).strip()
        if text:
            self.out.append(self.prefix + text)
            self.out.append("")
        self.buf, self.prefix = "", ""

    def write(self, s):
        if self.link is not None:
            self.link[1] += s
        else:
            self.buf += s

    # --- analyse
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "main":
            self.in_main = True
            return
        if not self.in_main:
            return
        classes = set((a.get("class") or "").split())
        if self.skip_depth or tag in SKIP_TAGS or classes & SKIP_CLASSES or a.get("aria-hidden") == "true":
            if tag not in ("img", "source", "br", "input"):
                self.skip_depth += 1
            return
        self.stack.append(tag)
        if tag == "table":
            self.flush()
            self.table = []
        elif tag == "tr" and self.table is not None:
            self.row = []
        elif tag in ("td", "th") and self.row is not None:
            self.buf = ""
        elif tag in BLOCKS:
            if self.link is not None:
                self.card_href = self.link[0]
                self.buf += self.link[1]
                self.link = None
            self.flush()
            if tag in ("h1", "h2", "h3", "h4"):
                self.prefix = "#" * int(tag[1]) + " "
            elif tag == "summary":
                self.prefix = "### "
            elif tag == "li":
                self.prefix = "- "
            elif tag == "dt":
                self.prefix = "- **"
            elif tag == "blockquote":
                self.prefix = "> "
        elif tag == "a" and a.get("href"):
            self.link = [absolute(a["href"]), ""]
        elif tag in ("strong", "b"):
            self.write("**")
        elif tag == "br":
            self.write(" ")

    def handle_endtag(self, tag):
        if tag == "main":
            self.flush()
            self.in_main = False
            return
        if not self.in_main:
            return
        if self.skip_depth:
            if tag not in ("img", "source", "br", "input"):
                self.skip_depth -= 1
            return
        if self.stack and self.stack[-1] == tag:
            self.stack.pop()
        if tag == "a" and getattr(self, "card_href", None) and self.link is None:
            self.flush()
            self.out.append(f"[Voir la page]({self.card_href})")
            self.out.append("")
            self.card_href = None
        elif tag == "a" and self.link is not None:
            href, text = self.link
            self.link = None
            text = re.sub(r"\s+", " ", text).strip().rstrip("→").strip()
            if text:
                self.buf += text if href.startswith("#") else f"[{text}]({href})"
        elif tag in ("strong", "b"):
            self.write("**")
        elif tag in ("td", "th") and self.row is not None:
            self.row.append(re.sub(r"\s+", " ", self.buf).strip())
            self.buf = ""
        elif tag == "tr" and self.table is not None and self.row is not None:
            self.table.append(self.row)
            self.row = None
        elif tag == "table" and self.table is not None:
            rows, self.table = self.table, None
            if rows:
                width = max(len(r) for r in rows)
                rows = [r + [""] * (width - len(r)) for r in rows]
                self.out.append("| " + " | ".join(rows[0]) + " |")
                self.out.append("|" + "---|" * width)
                for r in rows[1:]:
                    self.out.append("| " + " | ".join(r) + " |")
                self.out.append("")
        elif tag == "dt":
            self.buf = self.buf.strip() + "** :"
            text = re.sub(r"\s+", " ", self.buf).strip()
            self.pending_dt = self.prefix + text
            self.buf, self.prefix = "", ""
        elif tag == "dl":
            self.out.append("")
        elif tag == "dd":
            text = re.sub(r"\s+", " ", self.buf).strip()
            self.out.append(getattr(self, "pending_dt", "- ") + " " + text)
            self.pending_dt = "- "
            self.buf, self.prefix = "", ""
        elif tag in BLOCKS:
            self.flush()

    def handle_data(self, data):
        if self.in_main and not self.skip_depth:
            # « 17 KM* » : les étoiles sont du texte, pas de l'italique Markdown
            self.write(data.replace("*", r"\*"))


def convert(src, dst):
    page = (ROOT / src).read_text(encoding="utf-8")
    title = html.unescape(re.search(r"<title>(.*?)</title>", page, re.S).group(1)).strip()
    desc = re.search(r'<meta name="description" content="([^"]*)"', page)
    parser = MainToMarkdown()
    # séparateurs que la mise en page rend visuellement mais pas le texte brut
    page = re.sub(r'(<span class="eyebrow page-kicker">[^<]*)</span>', r"\1 - </span>", page)  # sur-titre du H1
    page = re.sub(r"<div><span>([^<]+)</span>", r"<div><span>\1 : </span>", page)             # « Dénivelé : 530 m »
    page = page.replace('</b><span class="d">', '</b>, <span class="d">')                    # « Natascha R., 37 KM** »
    page = re.sub(r"(<dd>[^<]*)<span>", r"\1. <span>", page)                                   # bloc L'essentiel
    page = page.replace("54 KM<span>", "54 KM. <span>")
    page = re.sub(r'</span>(<span class="pod-name">)', r'</span>. \1', page)                      # podiums : « 1. Nom - temps »
    page = re.sub(r'</span>(<span class="pod-time)', r'</span> - \1', page)
    page = page.replace('</span><span class="d-sub">', '</span> - <span class="d-sub">')        # « Samedi 3 avril - Veille de course »
    page = page.replace('</span><span class="by-race">', '</span> <span class="by-race">')      # ravitaillements par course
    page = re.sub(r'<div class="tl-time">([^<]*)</div><div><div class="tl-title">', r'<div><div class="tl-title"><b>\1</b> - ', page)  # programme : « 17:00 - Titre »                                         # « 17 · 37 · 54 KM. Inscriptions ouvertes »
    parser.feed(page)
    lines = parser.out
    body = "\n".join(lines)
    body = re.sub(r"[ \t]*→[ \t]*$", "", body, flags=re.M)   # flèches décoratives en fin de ligne
    body = re.sub(r"\n{3,}", "\n\n", body).strip()
    url = BASE if src == "index.html" else BASE + src
    head = f"# {title}\n\n"
    if desc:
        head += f"> {html.unescape(desc.group(1))}\n\n"
    head += f"Version Markdown de {url} . La page HTML fait foi.\n\n---\n\n"
    # le titre du document est le <title> : tous les titres de la page descendent d'un niveau
    body = re.sub(r"^(#{1,5}) ", r"#\1 ", body, flags=re.M)
    (ROOT / dst).write_text(head + body + "\n", encoding="utf-8")


if __name__ == "__main__":
    for src, dst in PAGES.items():
        convert(src, dst)
        print(f"{src} -> {dst}")
