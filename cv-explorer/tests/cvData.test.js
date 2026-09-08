/**
 * cvData integrity tests.
 *
 * The road renders whatever is in `milestones`, so these are the guard rails:
 * the data must stay chronological, uniquely identified, and faithful to the
 * LaTeX sources in the repository root. If a .tex file is updated, update
 * cvData.js and revisit these expectations together.
 */
import { describe, it, expect } from 'vitest';
import {
  profile,
  KINDS,
  milestones,
  orderedMilestones,
  timelineYears
} from '../src/data/cvData.js';

describe('profile', () => {
  it('carries the candidate name from the LaTeX header', () => {
    expect(profile.name).toBe('Shuvam Banerji Seal');
  });

  it('names IISER Kolkata as the institution', () => {
    expect(profile.institution).toMatch(/IISER Kolkata/i);
  });

  it('links the Hugging Face profile', () => {
    const hf = profile.links.find((l) => /hugging/i.test(l.label));
    expect(hf?.url).toBe('https://huggingface.co/ShuvBan');
  });

  it('every profile link is an absolute URL or a mailto', () => {
    for (const link of profile.links) {
      expect(link.url).toMatch(/^(https:\/\/|mailto:)/);
    }
  });
});

describe('milestones', () => {
  it('has a stable, unique id for every entry', () => {
    const ids = milestones.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  it('uses only declared kinds', () => {
    for (const m of milestones) {
      expect(Object.keys(KINDS)).toContain(m.kind);
    }
  });

  it('gives every entry the fields the plaque renders', () => {
    for (const m of milestones) {
      expect(typeof m.when).toBe('string');
      expect(m.when.length).toBeGreaterThan(0);
      expect(typeof m.title).toBe('string');
      expect(m.title.length).toBeGreaterThan(0);
      expect(typeof m.sortKey).toBe('number');
    }
  });

  it('keeps sortKey inside the lifetime the CV covers', () => {
    for (const m of milestones) {
      expect(m.sortKey).toBeGreaterThanOrEqual(2009);
      expect(m.sortKey).toBeLessThanOrEqual(2030);
    }
  });

  it('every link is absolute and labelled', () => {
    for (const m of milestones) {
      for (const link of m.links ?? []) {
        expect(link.label?.length).toBeGreaterThan(0);
        expect(link.url).toMatch(/^https:\/\//);
      }
    }
  });
});

describe('orderedMilestones', () => {
  it('returns every milestone, sorted ascending by sortKey', () => {
    const ordered = orderedMilestones();
    expect(ordered).toHaveLength(milestones.length);
    for (let i = 1; i < ordered.length; i++) {
      expect(ordered[i].sortKey).toBeGreaterThanOrEqual(ordered[i - 1].sortKey);
    }
  });

  it('does not mutate the source array', () => {
    const before = milestones.map((m) => m.id).join(',');
    orderedMilestones();
    expect(milestones.map((m) => m.id).join(',')).toBe(before);
  });

  it('starts at school and ends at the expected graduation', () => {
    const ordered = orderedMilestones();
    expect(ordered[0].kind).toBe('education');
    expect(ordered[ordered.length - 1].id).toBe('graduation');
  });
});

describe('timelineYears', () => {
  it('is ascending and free of duplicates', () => {
    const years = timelineYears();
    expect(new Set(years).size).toBe(years.length);
    for (let i = 1; i < years.length; i++) {
      expect(years[i]).toBeGreaterThan(years[i - 1]);
    }
  });
});

describe('facts carried over from the LaTeX CVs', () => {
  const byId = Object.fromEntries(milestones.map((m) => [m.id, m]));

  it('records the UIDAI hackathon first prize', () => {
    expect(byId['uidai-hackathon'].title).toMatch(/1st Prize/);
    expect(byId['uidai-hackathon'].kind).toBe('hackathon');
  });

  it('records the Slashdot presidency with its 99% mandate', () => {
    expect(byId['slashdot-president'].summary).toMatch(/99%/);
  });

  it('records IISERKonnect at 2,000+ users', () => {
    expect(byId.iiserkonnect.org).toMatch(/2,000\+ users/);
  });

  it('links both public Hugging Face datasets', () => {
    expect(byId['sycolex-dataset'].links[0].url).toBe(
      'https://huggingface.co/datasets/ShuvBan/SycoLex'
    );
    expect(byId['agriir-dataset'].links[0].url).toBe(
      'https://huggingface.co/datasets/ShuvBan/AgriIR_dataset'
    );
  });

  it('records both Master’s thesis projects', () => {
    expect(byId['thesis-lean'].tags).toContain('Lean 4');
    expect(byId['thesis-moe'].tags).toContain('Mixture-of-Experts');
  });

  it('records the Molecule3D / LAMMPS web workbench', () => {
    expect(byId.molecule3d.links.map((l) => l.url)).toContain(
      'https://shuvam-banerji-seal.github.io/lammps-web-gui/'
    );
  });

  it('records the CBSE guest lecture and the Voice of Youth jury seat', () => {
    expect(byId['cbse-dld'].summary).toMatch(/64 teachers from 38 schools/);
    expect(byId['voice-of-youth'].title).toMatch(/Voice of Youth/);
  });
});
