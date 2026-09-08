# Shuvam Banerji Seal – CV Repository

BS-MS Dual Degree student (Chemistry Major, Computer Science Minor) at IISER Kolkata.

- Email: [sbs22ms076@iiserkol.ac.in](mailto:sbs22ms076@iiserkol.ac.in)
- GitHub: [github.com/Shuvam-Banerji-Seal](https://github.com/Shuvam-Banerji-Seal)
- LinkedIn: [linkedin.com/in/mastersbs](https://www.linkedin.com/in/mastersbs)
- Website: [shuvam-banerji-seal.github.io](https://shuvam-banerji-seal.github.io)
- ORCID: [0009-0000-0714-569X](https://orcid.org/0009-0000-0714-569X)
- Hugging Face: [huggingface.co/ShuvBan](https://huggingface.co/ShuvBan)

## The three CVs

| File | Length | Use it for |
|---|---|---|
| `Shuvam_Banerji_Seal_CV.tex` | ~7 pages | Full academic CV – everything, in detail |
| `Shuvam_Banerji_Seal_CV_2page.tex` | 3 pages | The general-purpose CV |
| `Shuvam_Banerji_Seal_OnePager.tex` | 1 page | Hand-it-over-in-a-room summary |

The long-form CV is the master. The 3-page and 1-page versions are
condensations of it, and all three are kept in parity: the same facts, the same
links, the same keywords.

## Latest profile highlights (2026)

- **Master's thesis (ongoing), two projects:**
  - Gray-code / Karnaugh-map structure of nucleic-acid and protein sequences,
    with every theorem machine-checked in **Lean 4** (Mathlib).
  - A sparse **Mixture-of-Experts transformer** for RNA structure prediction.
- **Publications:**
  - ECIR 2026 – *AgriIR: A Scalable Framework for Domain-Specific Knowledge Retrieval*
    ([DOI](https://doi.org/10.1007/978-3-032-21324-2_37), [arXiv:2604.16353](https://arxiv.org/abs/2604.16353))
  - CIKM 2026 Resource Track (under review) – *SycoLex*
  - FIRE 2025 – *Hierarchical Opinion Classification using Large Language Models*
  - TREC 2024 – *IISERK@ToT 2024*
- **Open datasets** on Hugging Face:
  [SycoLex](https://huggingface.co/datasets/ShuvBan/SycoLex) (1,954 legal cases,
  three jurisdictions) and
  [AgriIR_dataset](https://huggingface.co/datasets/ShuvBan/AgriIR_dataset) (15,247 entries).
- **Flagship software:**
  [Molecule3D / LAMMPS Web GUI](https://shuvam-banerji-seal.github.io/lammps-web-gui/)
  (browser-native molecular simulation workbench) and
  [IISERKonnect](https://shuvam-banerji-seal.github.io/iiserkonnect-website/)
  (campus super-app, in campus-wide testing with 2,000+ users).
- **Awards:** 1st Prize, **UIDAI Data Hackathon 2026** (₹2,00,000; won among
  5,000+ submitting teams) · Capital One Launchpad Top 14 of 5,073.
- **Entrepreneurship:** co-founder of **iFiNN** (AI-fintech) and
  **UnderWater AI** (deeptech), both funded under MeitY Startup Hub GENESIS.
- **Leadership:** President of Slashdot, IISER Kolkata's programming and design
  club, elected with a 99% approval vote.

## Build

```bash
make                 # builds Shuvam_Banerji_Seal_CV.pdf
```

Or compile any of them directly:

```bash
pdflatex -interaction=nonstopmode Shuvam_Banerji_Seal_CV.tex
pdflatex -interaction=nonstopmode Shuvam_Banerji_Seal_CV_2page.tex
pdflatex -interaction=nonstopmode Shuvam_Banerji_Seal_OnePager.tex
```

The 3-page and 1-page layouts are packed by hand: sections are assigned to
specific columns so each page fills without spilling. If you add content, expect
to rebalance – check the page count after every change.

## Interactive CV

[`cv-explorer/`](cv-explorer/) renders the same CV as a walkable Three.js road:
every milestone stands beside it in chronological order.

Live at <https://shuvam-banerji-seal.github.io/My-CV/>, deployed by GitHub
Actions on every push to `main` that touches `cv-explorer/`.

```bash
cd cv-explorer && npm install && npm run dev
```

`cv-explorer/src/data/cvData.js` is derived from the `.tex` sources. When the
CVs change, update it and run `npm test`.

## Notes

- Update `Shuvam_Banerji_Seal_CV.tex` first, then propagate to the shorter
  versions and to `cv-explorer/src/data/cvData.js`.
- Generated application assets (cover letters, personal statements) are ignored
  via `.gitignore`.
