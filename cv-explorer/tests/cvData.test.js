/**
 * cvData integrity tests.
 *
 * Verifies the chapters array is well-formed and faithful to the LaTeX
 * source (Shuvam_Banerji_Seal_CV.tex). These are regression tests: if the
 * .tex is updated, these tests must be revisited alongside cvData.js.
 */
import { describe, it, expect } from 'vitest';
import { header, chapters } from '../src/data/cvData.js';

describe('header', () => {
  it('has the candidate name from the LaTeX', () => {
    expect(header.name).toBe('Shuvam Banerji Seal');
  });

  it('has the correct institution', () => {
    // LaTeX: "Indian Institute of Science Education and Research - Kolkata"
    expect(header.institution).toMatch(/Science Education and Research.*Kolkata/i);
  });

  it('has all five contact fields populated', () => {
    const { contacts } = header;
    expect(contacts.email).toMatch(/sbs22ms076@iiserkol\.ac\.in/);
    expect(contacts.github).toMatch(/Shuvam-Banerji-Seal/);
    expect(contacts.linkedin).toMatch(/mastersbs/);
    expect(contacts.website).toMatch(/shuvam-banerji-seal/);
    expect(contacts.orcid).toMatch(/0009-0000-0714-569X/);
  });
});

describe('chapters — structural integrity', () => {
  it('has exactly 15 chapters matching the LaTeX sections', () => {
    // LaTeX compactSections: about (header), research, industry, publications,
    // ventures, libraries, tutorials, projects, skills, achievements,
    // experience, leadership, awards, talks, education = 15
    expect(chapters).toHaveLength(15);
  });

  it('every chapter has a stable id, title, color, icon, and pages', () => {
    for (const c of chapters) {
      expect(c.id).toEqual(expect.any(String));
      expect(c.id).toMatch(/^[a-z]+$/);
      expect(c.title).toEqual(expect.any(String));
      expect(c.title.length).toBeGreaterThan(0);
      expect(c.color).toEqual(expect.any(Number));
      expect(c.icon).toEqual(expect.any(String));
      expect(c.pages).toBeInstanceOf(Array);
      expect(c.pages.length).toBeGreaterThan(0);
    }
  });

  it('chapter ids are unique', () => {
    const ids = chapters.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every page has at least one content field (heading/body/bullets/groups/tags/links/meta)', () => {
    for (const c of chapters) {
      for (const p of c.pages) {
        const hasContent =
          !!(p.heading) ||
          !!(p.body) ||
          (Array.isArray(p.bullets) && p.bullets.length) ||
          (Array.isArray(p.groups) && p.groups.length) ||
          (Array.isArray(p.tags) && p.tags.length) ||
          (Array.isArray(p.links) && p.links.length) ||
          (Array.isArray(p.meta) && p.meta.length);
        expect(hasContent, `chapter "${c.id}" has an empty page`).toBe(true);
      }
    }
  });

  it('every link has a url and text', () => {
    for (const c of chapters) {
      for (const p of c.pages) {
        if (!Array.isArray(p.links)) continue;
        for (const l of p.links) {
          expect(l.url).toEqual(expect.any(String));
          expect(l.url.length).toBeGreaterThan(0);
          expect(l.text).toEqual(expect.any(String));
          expect(l.text.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('every group has a name and items array', () => {
    for (const c of chapters) {
      for (const p of c.pages) {
        if (!Array.isArray(p.groups)) continue;
        for (const g of p.groups) {
          expect(g.name).toEqual(expect.any(String));
          expect(g.items).toBeInstanceOf(Array);
          expect(g.items.length).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe('chapters — faithful to the LaTeX source', () => {
  const ids = chapters.map((c) => c.id);
  const expectedIds = [
    'about', 'research', 'industry', 'publications', 'ventures',
    'libraries', 'tutorials', 'projects', 'skills', 'achievements',
    'experience', 'leadership', 'awards', 'talks', 'education'
  ];
  it('has the expected chapter order matching the LaTeX section order', () => {
    expect(ids).toEqual(expectedIds);
  });

  it('publications chapter has 4 entries matching the LaTeX', () => {
    const pubs = chapters.find((c) => c.id === 'publications');
    expect(pubs.pages).toHaveLength(4);
    // ECIR 2026 — AgriIR
    expect(pubs.pages[0].heading).toMatch(/AgriIR/);
    expect(pubs.pages[0].meta[0]).toMatch(/ECIR 2026/);
    // FIRE 2025 — Hierarchical Opinion Classification
    expect(pubs.pages[1].heading).toMatch(/Hierarchical Opinion/);
    expect(pubs.pages[1].meta[0]).toMatch(/FIRE 2025/);
    // TREC 2024 — ToT
    expect(pubs.pages[2].heading).toMatch(/ToT_2024/);
    expect(pubs.pages[2].meta[0]).toMatch(/TREC 2024/);
    // DFT catalyst
    expect(pubs.pages[3].heading).toMatch(/VO\(SALIEP\)\(DTP\)/);
  });

  it('ventures chapter has iFiNN and UnderWater AI', () => {
    const v = chapters.find((c) => c.id === 'ventures');
    expect(v.pages).toHaveLength(2);
    expect(v.pages[0].heading).toMatch(/iFiNN/);
    expect(v.pages[1].heading).toMatch(/UnderWater AI/);
    // Both funded by MeitY GENESIS
    expect(v.pages[0].bullets.join(' ')).toMatch(/MeitY Startup Hub.*GENESIS/);
    expect(v.pages[1].bullets.join(' ')).toMatch(/MeitY Startup Hub.*GENESIS/);
  });

  it('education chapter has 4 institutions matching the LaTeX', () => {
    const edu = chapters.find((c) => c.id === 'education');
    expect(edu.pages).toHaveLength(4);
    expect(edu.pages[0].heading).toMatch(/IISER Kolkata/);
    expect(edu.pages[1].heading).toMatch(/Calcutta University/);
    expect(edu.pages[2].heading).toMatch(/Jodhpur Park/);
    expect(edu.pages[3].heading).toMatch(/New Horizon/);
    // IISER CGPA 8.2
    expect(edu.pages[0].meta.join(' ')).toMatch(/8\.2/);
  });

  it('awards chapter has the UIDAI 1st Prize (Jan 2026)', () => {
    const a = chapters.find((c) => c.id === 'awards');
    expect(a.pages).toHaveLength(1);
    expect(a.pages[0].heading).toMatch(/UIDAI/);
    expect(a.pages[0].heading).toMatch(/₹2,00,000/);
    expect(a.pages[0].meta.join(' ')).toMatch(/Jan 2026/);
  });

  it('skills chapter has 5 pages covering all LaTeX skill blocks', () => {
    const s = chapters.find((c) => c.id === 'skills');
    expect(s.pages).toHaveLength(5);
    // Programming languages include Python, C/C++, Java, Rust, Fortran
    const allSkills = s.pages.flatMap((p) => p.groups || []).flatMap((g) => g.items);
    expect(allSkills).toEqual(expect.arrayContaining(['Python', 'C/C++', 'Java', 'Rust', 'Fortran']));
    expect(allSkills).toEqual(expect.arrayContaining(['LAMMPS', 'Gaussian']));
    expect(allSkills).toEqual(expect.arrayContaining(['Django', 'GTK4 in C']));
  });

  it('projects chapter has 11 entries', () => {
    const p = chapters.find((c) => c.id === 'projects');
    expect(p.pages).toHaveLength(11);
  });

  it('talks chapter includes the FIRE 2026 SYCO PHANCY co-organization', () => {
    const t = chapters.find((c) => c.id === 'talks');
    const fire2026 = t.pages.find((p) => p.heading.includes('FIRE 2026'));
    expect(fire2026).toBeDefined();
    expect(fire2026.meta.join(' ')).toMatch(/Amsterdam/);
    expect(fire2026.meta.join(' ')).toMatch(/Bretagne Occidentale/);
  });
});
