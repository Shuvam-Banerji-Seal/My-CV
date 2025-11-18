# Makefile for building Shuvam_Banerji_Seal_CV.tex using pdflatex
# Usage:
#   make        -> build PDF
#   make view   -> build PDF and open it
#   make clean  -> remove intermediate files (aux, log, etc.)
#   make distclean -> remove intermediate files and the PDF

TEX = Shuvam_Banerji_Seal_CV.tex
PDF = $(TEX:.tex=.pdf)
LATEX = pdflatex
LATEXFLAGS = -interaction=nonstopmode -halt-on-error -file-line-error

# Default target
all: $(PDF)

$(PDF): $(TEX)
	@echo "Building $(PDF) from $(TEX)"
	$(LATEX) $(LATEXFLAGS) $(TEX) >/dev/null || (echo "pdflatex failed"; exit 1)
	# Run a second time to resolve references / table of contents etc.
	$(LATEX) $(LATEXFLAGS) $(TEX) >/dev/null || (echo "pdflatex failed on second run"; exit 1)
	@echo "Built $(PDF)"

# Open the generated PDF (Linux xdg-open by default)
view: $(PDF)
	@if command -v xdg-open >/dev/null 2>&1; then xdg-open $(PDF) &>/dev/null & true; \
	echo "Opened $(PDF) with xdg-open"; else \
		echo "Please open $(PDF) with your PDF viewer (xdg-open not found)"; fi

# Remove LaTeX intermediate files but keep PDF
clean:
	@echo "Removing LaTeX intermediate files..."
	rm -f *.aux *.log *.out *.toc *.lof *.lot *.fls *.fdb_latexmk *.synctex* *.bcf *.run.xml *.blg *.bbl
	@echo "Done."

# Remove everything including the generated PDF
distclean: clean
	@echo "Removing generated PDF..."
	rm -f $(PDF)
	@echo "Done."

.PHONY: all view clean distclean
