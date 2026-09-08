/**
 * CV data for the 3D road.
 *
 * Everything here is derived from the LaTeX sources in the repository root
 * (Shuvam_Banerji_Seal_CV.tex is the master; the 3-page and 1-page versions
 * are condensations of it). The road renders `milestones` in `sortKey` order,
 * so the walk down the road *is* the chronology.
 *
 * If the .tex files change, update this file and run `npm test`.
 */

export const profile = {
  name: 'Shuvam Banerji Seal',
  tagline: 'Computational Chemist · AI/ML & Information Retrieval Researcher · DeepTech & AI-Fintech Co-Founder',
  degree: 'BS-MS Dual Degree (Chemistry Major, Computer Science Minor)',
  institution: 'IISER Kolkata',
  interests: [
    'Density functional theory & electronic structure (Quantum ESPRESSO, Gaussian)',
    'Molecular dynamics and simulation (LAMMPS)',
    'Machine learning for the physical and life sciences (transformers, mixture-of-experts)',
    'Structural bioinformatics and RNA structure prediction',
    'Information retrieval and retrieval-augmented generation',
    'Formal verification in Lean 4',
    'AI safety, evaluation and agentic systems'
  ],
  links: [
    { label: 'Email', url: 'mailto:sbs22ms076@iiserkol.ac.in' },
    { label: 'GitHub', url: 'https://github.com/Shuvam-Banerji-Seal' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/mastersbs' },
    { label: 'Portfolio', url: 'https://shuvam-banerji-seal.github.io' },
    { label: 'ORCID', url: 'https://orcid.org/0009-0000-0714-569X' },
    { label: 'Hugging Face', url: 'https://huggingface.co/ShuvBan' }
  ]
};

/**
 * Marker kinds. `color` drives the pillar glow, the timeline dot and the
 * detail-panel accent, so the same colour always means the same kind of thing.
 */
export const KINDS = {
  education: { label: 'Education', color: '#7dd3fc' },
  award: { label: 'Award', color: '#fb923c' },
  hackathon: { label: 'Hackathon', color: '#f472b6' },
  publication: { label: 'Publication', color: '#fbbf24' },
  dataset: { label: 'Open Dataset', color: '#34d399' },
  research: { label: 'Research', color: '#a78bfa' },
  project: { label: 'Project', color: '#60a5fa' },
  startup: { label: 'Startup', color: '#f87171' },
  talk: { label: 'Talk / Jury', color: '#22d3ee' },
  leadership: { label: 'Leadership', color: '#c084fc' },
  teaching: { label: 'Teaching', color: '#4ade80' },
  work: { label: 'Work', color: '#94a3b8' }
};

/**
 * One entry per station along the road.
 *
 *  id       stable slug (used by tests and by the deep-link hash)
 *  sortKey  year + fraction; the only thing that decides road order
 *  when     human-readable date shown on the marker
 *  kind     key of KINDS
 *  title    marker headline
 *  org      one-line affiliation / venue
 *  summary  one or two sentences shown in the panel
 *  bullets  optional detail lines
 *  tags     optional keyword chips
 *  links    optional [{ label, url }]
 */
export const milestones = [
  {
    id: 'school-new-horizon',
    sortKey: 2009,
    when: '2009 – 2019',
    kind: 'education',
    title: 'The New Horizon High School',
    org: 'Secondary schooling (WBBSE), English medium',
    summary: 'Ten years of secondary schooling, finishing at 83.75%.',
    tags: ['WBBSE', '83.75%']
  },
  {
    id: 'tutor-start',
    sortKey: 2018,
    when: '2018 – Present',
    kind: 'work',
    title: 'Private Educator & Technical Trainer',
    org: 'Self-employed, Kolkata',
    summary:
      'Teaching computer science, physics and chemistry to ICSE, CBSE and West Bengal Board students.',
    bullets: ['Mentored 50+ students through board and competitive examinations.']
  },
  {
    id: 'young-scientist-speaker',
    sortKey: 2019.1,
    when: '2019',
    kind: 'award',
    title: 'Best Young Scientist Speaker on Nanotechnology',
    org: 'World Science Conference, Jadavpur University',
    summary: 'Awarded for a conference presentation on nanotechnology.'
  },
  {
    id: 'school-jodhpur-park',
    sortKey: 2019.2,
    when: '2019 – 2021',
    kind: 'education',
    title: "Jodhpur Park Boys' High School",
    org: 'Higher Secondary (WBCHSE)',
    summary: 'Physics, Mathematics, Chemistry and Computer Science. Finished at 83%.',
    tags: ['WBCHSE', '83%']
  },
  {
    id: 'mindscapes',
    sortKey: 2020.1,
    when: '2020',
    kind: 'publication',
    title: 'Published Author – MindScapes',
    org: 'ISBN 978-9389923209, Kolkata',
    summary:
      'A published creative anthology on metaphorical and philosophical themes, alongside workshops on technical and creative writing.'
  },
  {
    id: 'covid-relief',
    sortKey: 2020.5,
    when: '2020 – 2021',
    kind: 'leadership',
    title: 'COVID-19 Relief Coordinator',
    org: 'Volunteer work, Kolkata',
    summary:
      'Coordinated pandemic relief efforts; later a mentor with the Ek-Pehal education initiative.'
  },
  {
    id: 'calcutta-university',
    sortKey: 2021.1,
    when: '2021 – 2022',
    kind: 'education',
    title: 'University of Calcutta',
    org: 'B.Sc. Honours in Physics (first year only)',
    summary: 'One year of physics honours before transferring to the IISER dual-degree programme.',
    tags: ['CGPA 8.308']
  },
  {
    id: 'technical-consultant',
    sortKey: 2021.5,
    when: '2021 – Present',
    kind: 'work',
    title: 'Technical Consultant',
    org: 'Self-employed, Kolkata',
    summary:
      'High-performance computing solutions, system optimisation and BIOS/UEFI configuration.',
    bullets: ['50+ custom builds delivered.']
  },
  {
    id: 'entrance-exams',
    sortKey: 2022.1,
    when: '2022',
    kind: 'award',
    title: 'JEE Advanced, IAT and WBJEE',
    org: 'National entrance examinations',
    summary: 'Qualified all three in the top fractions of the national candidate pool.',
    tags: ['JEE top 0.1%', 'IAT top 0.06%', 'WBJEE top 0.05%']
  },
  {
    id: 'iiser-kolkata',
    sortKey: 2022.2,
    when: '2022 – 2027 (expected)',
    kind: 'education',
    title: 'IISER Kolkata – BS-MS Dual Degree',
    org: 'Chemistry Major with Computer Science Minor',
    summary:
      'The five-year integrated dual degree, where the computational chemistry and the AI/ML strands of this CV converge.',
    tags: ['CGPA 8.2']
  },
  {
    id: 'reliance-scholar',
    sortKey: 2023.1,
    when: '2023',
    kind: 'award',
    title: 'Reliance Foundation Undergraduate Scholar',
    org: 'Reliance Foundation',
    summary: 'Among the top 5,000 awardees nationally after the RF-UG aptitude test.'
  },
  {
    id: 'naest',
    sortKey: 2023.4,
    when: '2023',
    kind: 'award',
    title: 'NAEST – Zonal Runners Up',
    org: 'IIT Kanpur and Shiksha Sopan',
    summary:
      'National Anveshika Experimental Skill Test: building extensive experimental setups from household items.',
    links: [
      {
        label: 'Sample experiments',
        url: 'https://github.com/Shuvam-Banerji-Seal/NAEST_Sample_Experiments'
      }
    ]
  },
  {
    id: 'statuscode0',
    sortKey: 2023.8,
    when: '2023',
    kind: 'hackathon',
    title: 'StatusCode0 – 1st Rank, MATLAB Track',
    org: 'IIIT Kalyani',
    summary: 'A domestic waste-type data analysis tool built for a proposed startup solution.'
  },
  {
    id: 'trec-tot',
    sortKey: 2024.1,
    when: '2024',
    kind: 'publication',
    title: 'IISERK@ToT 2024: Query Reformulation and Layered Retrieval',
    org: 'TREC 2024 Proceedings',
    summary:
      'Four-step query reformulation combined with two-layer BM25 retrieval for tip-of-the-tongue known-item search.',
    bullets: [
      'Multi-layer BM25 filtering in Lucene/Java with dynamic search-domain contraction.',
      'Transformer-based query expansion via local LLMs using multi-shot and chain-of-thought prompting.',
      'Recall@1000 of 0.8067, on par with specifically modified DPR models.'
    ],
    tags: ['BM25', 'Lucene', 'Information Retrieval'],
    links: [
      { label: 'Paper', url: 'https://trec.nist.gov/pubs/trec33/papers/IISER-K.tot.pdf' }
    ]
  },
  {
    id: 'mimansa',
    sortKey: 2024.2,
    when: '2024',
    kind: 'award',
    title: 'Mimansa – Zonal Topper',
    org: 'IISER Pune',
    summary: 'Mathematical problem solving.'
  },
  {
    id: 'sih-2024',
    sortKey: 2024.4,
    when: '2024',
    kind: 'hackathon',
    title: 'Smart India Hackathon – Finalist',
    org: 'Government of India',
    summary:
      'SIH1701, a context-aware AI retrieval framework for commercial courts, and SIH1734, deep learning for air-quality mapping.'
  },
  {
    id: 'statuscode1',
    sortKey: 2024.6,
    when: '2024',
    kind: 'hackathon',
    title: 'StatusCode1 – 1st Rank, GIAN Track',
    org: 'IIIT Kalyani',
    summary:
      "A natural-language search engine over GIAN's abandoned US patents, so users can search without knowing the patent terminology.",
    bullets: [
      'Nomic embeddings of patent abstracts with similarity search.',
      'Selenium and BeautifulSoup scraping pipeline built to survive anti-scraping measures.'
    ],
    links: [
      {
        label: 'GitHub',
        url: 'https://github.com/Shuvam-Banerji-Seal/LLM-based-Searcher-for-GIAN-s-Abandoned-US-Patents'
      }
    ]
  },
  {
    id: 'ecommerce-c',
    sortKey: 2024.8,
    when: '2024',
    kind: 'project',
    title: 'Full-Stack E-Commerce GUI in C',
    org: 'Under Dr. Kripabandhu Ghosh, IISER Kolkata',
    summary:
      'A GTK4 and SQLite3 storefront with a static-context chatbot over optimised BM25 retrieval.',
    tags: ['C', 'GTK4', 'SQLite3'],
    links: [
      { label: 'GitHub', url: 'https://github.com/Shuvam-Banerji-Seal/CS3101-E-Commerce-App-in-C.git' }
    ]
  },
  {
    id: 'freelance-web',
    sortKey: 2024.9,
    when: '2024 – 2025',
    kind: 'work',
    title: 'Freelance Web Developer & Designer',
    org: 'ChemActiva Innovations · Anicon 3.0 · EFAML Lab',
    summary:
      'Built the site for ChemActiva Innovations Pvt. Ltd., a nanocellulose startup and DST-NIDHI PRAYAS and HDFC Parivartan grantee, plus Anicon 3.0 (Inquivesta XI) and the EFAML materials-science lab page at IISER Kolkata.',
    links: [
      { label: 'ChemActiva', url: 'https://chemactiva.com/' },
      { label: 'Anicon 3.0', url: 'https://anicon3.github.io/' },
      { label: 'EFAML', url: 'https://shuvam-banerji-seal.github.io/EFAML_WEB/index.html' }
    ]
  },
  {
    id: 'legal-rag',
    sortKey: 2025.1,
    when: 'February 2025',
    kind: 'project',
    title: 'Legal Document Retrieval RAG',
    org: 'Commercial Courts Act corpus',
    summary:
      'A retrieval stack over legal texts using LLaMA-3.2, Nomic embeddings, ChromaDB and Mistral-OCR, served through Streamlit.',
    tags: ['RAG', 'ChromaDB', 'OCR'],
    links: [{ label: 'GitHub', url: 'https://github.com/Shuvam-Banerji-Seal/CCA-2015-LLM' }]
  },
  {
    id: 'c60-solvation',
    sortKey: 2025.2,
    when: '2025',
    kind: 'research',
    title: 'Solvation of C₆₀ Nanoparticles in Water',
    org: 'Computational science project, IISER Kolkata',
    summary:
      'LAMMPS molecular dynamics of C₆₀ solvation with AIREBO potentials, feeding a machine-learned surrogate for system properties.',
    bullets: [
      'Automated structural feature extraction: radial distribution functions, coordination numbers.',
      'Surrogate pipeline with Gaussian process regression, neural networks and XGBoost predicting properties at unsampled parameter values.'
    ],
    tags: ['LAMMPS', 'AIREBO', 'Molecular Dynamics'],
    links: [
      {
        label: 'GitHub',
        url: 'https://github.com/Shuvam-Banerji-Seal/Solvent-Structure-around-NanoParticles'
      }
    ]
  },
  {
    id: 'histoxai',
    sortKey: 2025.4,
    when: 'May – July 2025',
    kind: 'work',
    title: 'Research Intern, HistoXai',
    org: 'Astroloop Technologies Pvt. Ltd., Bangalore',
    summary:
      'Comparative analysis of 30+ open-source digital histopathology quality-assessment frameworks.',
    bullets: [
      'Evaluated HistoQC, PathProfiler, GrandQC, HistoROI and FASTPathology on architecture, training data, metrics and limitations.',
      'Tech: Python, OpenCV, PyTorch, Scikit-learn, Pandas.'
    ],
    tags: ['Digital Pathology', 'PyTorch']
  },
  {
    id: 'hybrid-rag',
    sortKey: 2025.5,
    when: 'July 2025',
    kind: 'research',
    title: 'Hybrid RAG for Verifiable Answer Synthesis',
    org: 'Under Dr. Dwaipayan Roy, Computational and Data Sciences, IISER Kolkata',
    summary:
      'An end-to-end retrieval-augmented generation pipeline over IISER Kolkata intranet documents that answers with verifiable inline citations.',
    bullets: [
      'Automated Selenium acquisition, OCR with PyMuPDF and EasyOCR, context-aware chunking with metadata enrichment.',
      'Qwen3-4B embeddings in FAISS; hybrid dense plus BM25 retrieval fused by Reciprocal Rank Fusion.',
      'Query refinement with hypothetical answers, surfaced through a Streamlit interface.'
    ],
    tags: ['RAG', 'FAISS', 'Reciprocal Rank Fusion']
  },
  {
    id: 'la-martiniere-judge',
    sortKey: 2025.55,
    when: 'July 2025',
    kind: 'talk',
    title: 'Domain Judge, Computer Science Events',
    org: 'La Martiniere for Boys Annual Science Fest, Kolkata',
    summary:
      'External judge for project demonstrations, live coding and problem-solving rounds.'
  },
  {
    id: 'local-llm-talk',
    sortKey: 2025.6,
    when: 'August 2025',
    kind: 'talk',
    title: 'Running and Optimising Local LLMs',
    org: 'Slashdot Student Chapter, IISER Kolkata',
    summary:
      'A hands-on session on hardware selection, quantisation, embedding pipelines, vector databases and practical optimisation for local LLM deployment.'
  },
  {
    id: 'sustainability-talk',
    sortKey: 2025.62,
    when: 'August 2025',
    kind: 'talk',
    title: 'Sustainability, AI and Emerging Technologies',
    org: 'Valence Chemistry Society, IISER Kolkata',
    summary:
      'An interdisciplinary talk bridging sustainability science with AI-driven modelling, retrieval systems and computational chemistry tooling.'
  },
  {
    id: 'slashdot-president',
    sortKey: 2025.65,
    when: 'August 2025 – Present',
    kind: 'leadership',
    title: 'President, Slashdot – Programming & Design Club',
    org: 'IISER Kolkata',
    summary:
      'Elected to lead the official programming and design club with a 99% approval vote of the club membership, one of the strongest endorsements recorded for the post.',
    bullets: [
      "Directing the club's technical programme: workshops, hackathons, machine-learning and local-LLM sessions.",
      "Owner of the club's open-source and web presence."
    ],
    tags: ['99% mandate'],
    links: [{ label: 'Club site', url: 'https://slashdot-iiserk.github.io/' }]
  },
  {
    id: 'capital-one',
    sortKey: 2025.7,
    when: 'August 2025',
    kind: 'hackathon',
    title: 'Capital One Launchpad – Top 14 of 5,073 Teams',
    org: 'Capital One India',
    summary:
      'IndicAgri, a multi-modal RAG advisor for Indian agriculture supporting 20+ Indian languages with scientifically cited, hyper-localised answers.',
    bullets: [
      'Agentic advisor built on RAG, LangChain and open-weight LLMs (Gemma, DeepSeek).',
      'Autonomous data pipeline that curated a novel 15k+ document dataset, released on Hugging Face.'
    ],
    tags: ['RAG', 'LangChain', 'Team Fibonacci'],
    links: [
      { label: 'GitHub', url: 'https://github.com/Shuvam-Banerji-Seal/Answering_Agriculture' }
    ]
  },
  {
    id: 'startups',
    sortKey: 2025.75,
    when: '2025 – Present',
    kind: 'startup',
    title: 'Co-Founder – iFiNN and UnderWater AI',
    org: 'MeitY Startup Hub (GENESIS) funded, incubated at RISE Foundation, IISER Kolkata',
    summary:
      'Two funded ventures: iFiNN, an AI-fintech platform for automated smart trading alerts, and UnderWater AI, a deeptech company for underwater image enhancement.',
    bullets: [
      'iFiNN (Co-Founder & Lead Developer): democratising ML and AI tooling through a simple interface for alerts across stocks, crypto and mutual funds.',
      'UnderWater AI (Co-Founder & CTO): deep neural networks and early-fusion learning for underwater image quality and marine species identification.',
      'Both funded; DPIIT registration in progress (Q1 2026); products shipping by 2027.'
    ],
    tags: ['MeitY GENESIS', 'DeepTech', 'Fintech'],
    links: [
      { label: 'iFiNN', url: 'https://synapse-iiserk.github.io/' },
      { label: 'UnderWater AI', url: 'https://underwater-ai.github.io/' }
    ]
  },
  {
    id: 'chemenigma',
    sortKey: 2025.8,
    when: '2025',
    kind: 'award',
    title: 'ChemEnigma – 1st Rank',
    org: 'IISc Bangalore',
    summary:
      'Champions of a 72-hour chemistry contest spanning theory, experiment and concept presentation.'
  },
  {
    id: 'bengal-chem-quiz',
    sortKey: 2025.82,
    when: '2025',
    kind: 'award',
    title: 'All Bengal Chemistry Quiz – 2nd Runners Up',
    org: 'Presidency University'
  },
  {
    id: 'qiskit-fallfest',
    sortKey: 2025.85,
    when: 'October 2025',
    kind: 'leadership',
    title: 'Organiser, Qiskit Fallfest 2025',
    org: 'Sponsored by IBM Quantum',
    summary:
      'Ran the local chapter of Qiskit Fallfest, one of 150 institutes selected globally, with hands-on Qiskit SDK and quantum computing workshops.'
  },
  {
    id: 'fire-2025',
    sortKey: 2025.9,
    when: '2025',
    kind: 'publication',
    title: 'Hierarchical Opinion Classification using Large Language Models',
    org: 'FIRE 2025',
    summary:
      'Parameter-efficient fine-tuning of Gemma with a custom two-layer classification head and class-weighted cross-entropy loss.',
    bullets: [
      'Reformulated a three-level opinion hierarchy into an 8-class flat scheme to handle data imbalance.',
      'Compared selective fine-tuning against instruction tuning under tight compute constraints.'
    ],
    tags: ['Gemma', 'PEFT', 'Classification'],
    links: [{ label: 'Paper', url: 'https://ceur-ws.org/Vol-4173/T10-3.pdf' }]
  },
  {
    id: 'open-curricula',
    sortKey: 2025.95,
    when: '2025 – 2026',
    kind: 'teaching',
    title: 'Open Curricula – C, Python and Shaders',
    org: 'Open-source teaching resources',
    summary:
      'Three full courses released publicly: a 20-module C curriculum, a Python course, and a GPU shader series.',
    bullets: [
      'C: fundamentals through network programming, machine learning in C, GDB debugging and GTK4 GUI development.',
      'Python: core concepts through to local LLM deployment, with interactive notebooks and database integration.',
      'Shaders: eleven progressive lessons on OpenGL, GLSL, the graphics pipeline, Vulkan and audio-reactive shaders.'
    ],
    links: [
      { label: 'C course', url: 'https://github.com/Shuvam-Banerji-Seal/C-Programming-for-Beginners' },
      { label: 'Python course', url: 'https://github.com/Shuvam-Banerji-Seal/Python-Course-for-Beginners' },
      { label: 'Shaders', url: 'https://github.com/Shuvam-Banerji-Seal/shaders-for-beginners' }
    ]
  },
  {
    id: 'uidai-hackathon',
    sortKey: 2026.05,
    when: 'January 2026',
    kind: 'hackathon',
    title: 'UIDAI Data Hackathon 2026 – 1st Prize (₹2,00,000)',
    org: 'UIDAI, NIC and MeitY, Government of India',
    summary:
      'First prize in the national hackathon for data-driven analysis of Aadhaar enrolment and update datasets.',
    bullets: [
      'Surfaced meaningful patterns and predictive indicators for system improvements.'
    ],
    tags: ['1st Prize', 'Government of India'],
    links: [
      { label: 'Challenge', url: 'https://event.data.gov.in/challenge/uidai-data-hackathon-2026/' }
    ]
  },
  {
    id: 'ecir-agriir',
    sortKey: 2026.1,
    when: 'ECIR 2026',
    kind: 'publication',
    title: 'AgriIR: A Scalable Framework for Domain-Specific Knowledge Retrieval',
    org: 'Accepted to the ECIR 2026 IR for Good track',
    summary:
      'A six-stage configurable retrieval-augmented generation framework with deterministic citations, built for agricultural knowledge accessibility in developing regions.',
    bullets: [
      'Authors: Shuvam Banerji Seal, Aheli Poddar, Alok Mishra, Dr. Dwaipayan Roy.',
      'Hybrid BM25 plus dense retrieval over FAISS with Ollama-served open-weight LLMs and domain-specific agents.'
    ],
    tags: ['RAG', 'ECIR 2026', 'IR for Good'],
    links: [
      { label: 'DOI', url: 'https://doi.org/10.1007/978-3-032-21324-2_37' },
      { label: 'arXiv', url: 'https://arxiv.org/abs/2604.16353' },
      { label: 'Code', url: 'https://github.com/Shuvam-Banerji-Seal/AgriIR' }
    ]
  },
  {
    id: 'agriir-dataset',
    sortKey: 2026.3,
    when: 'April 2026',
    kind: 'dataset',
    title: 'AgriIR_dataset on Hugging Face',
    org: 'CC-BY-4.0',
    summary:
      '15,247 curated Indian agricultural knowledge entries with quality scores and domain metadata for crops, soils, regions and farming practices.',
    tags: ['Hugging Face', 'CC-BY-4.0', '15,247 entries'],
    links: [
      { label: 'Dataset', url: 'https://huggingface.co/datasets/ShuvBan/AgriIR_dataset' }
    ]
  },
  {
    id: 'sycolex-dataset',
    sortKey: 2026.45,
    when: 'June 2026',
    kind: 'dataset',
    title: 'SycoLex on Hugging Face',
    org: 'CC-BY-4.0 – under review, CIKM 2026 Resource Track',
    summary:
      'A cross-jurisdictional benchmark for detecting sycophancy in LLM legal case reasoning.',
    bullets: [
      '1,954 real legal cases: US Supreme Court (300), Indian Supreme Court (1,500), Indian Consumer Courts (154).',
      'Six sycophancy-inducing prompt variants with responses from five LLMs.',
      'Paired LLM-as-Judge and human expert annotations.',
      'The public evaluation resource for the FIRE 2026 SYCO PHANCY shared task.'
    ],
    tags: ['AI Safety', 'Legal AI', 'Benchmark'],
    links: [{ label: 'Dataset', url: 'https://huggingface.co/datasets/ShuvBan/SycoLex' }]
  },
  {
    id: 'molecule3d',
    sortKey: 2026.5,
    when: '2026 – Present',
    kind: 'project',
    title: 'Molecule3D / LAMMPS Web GUI',
    org: 'Browser-native molecular simulation workbench (MIT)',
    summary:
      'A complete LAMMPS workbench that runs entirely in the browser, GPU-accelerated and fully client-side, built to lower the entry barrier to molecular dynamics.',
    bullets: [
      'Script Builder: input decks as a drag-and-drop flowchart over a 186-command library covering the full general-command surface, locked by an automated coverage test against docs.lammps.org.',
      'Re-imports existing in.* scripts back into editable form and exports SVG/PNG pipeline diagrams.',
      'Compiler Helper: 27 CMake build options (Kokkos, GPU back end, heFFTe, OpenMP) turned into ready-to-run build scripts.',
      'Structure Viewer: LAMMPS data, XYZ, PDB and CIF plus dump trajectories, with playback, in-browser MP4 capture and measurement tools.',
      'Analysis: PBC-aware RDF g(r), MSD, density profiles and speed histograms with CSV export.',
      'Stack: TypeScript, React, Three.js / React Three Fiber, WebGL, Vite, Vitest (143 tests), GitHub Actions.'
    ],
    tags: ['LAMMPS', 'Three.js', 'TypeScript', 'WebGL'],
    links: [
      { label: 'Live', url: 'https://shuvam-banerji-seal.github.io/lammps-web-gui/' },
      { label: 'GitHub', url: 'https://github.com/Shuvam-Banerji-Seal/lammps-web-gui' }
    ]
  },
  {
    id: 'iiserkonnect',
    sortKey: 2026.55,
    when: '2026 – Present',
    kind: 'project',
    title: 'IISERKonnect – Campus Super-App',
    org: 'Sole developer. In campus-wide testing with 2,000+ users at IISER Kolkata',
    summary:
      'One Android (Kotlin) and web application that unifies the entire IISER Kolkata intranet behind a single login.',
    bullets: [
      'WeLearn courses, files, assignment deadlines and attendance; mess transactions, budget analytics and daily menu.',
      'Academic calendar and campus events; grade cards; the previous-year-question archive; student and administrative notice boards.',
      'Library catalogue with live availability; the ePrints research archive; VoIP directory; TCP counter and MAC registration; network health dashboard.',
      'Every service is a hand-written HTML parser (Kotlin/Jsoup, ported 1:1 to DOMParser on web) behind captcha-backed logins and a campus-only host allow-list. Credentials never leave the device.',
      'Serverless Campus Chat over DTLS-encrypted WebRTC data channels.'
    ],
    tags: ['Kotlin', 'Jetpack Compose', 'WebRTC', '2,000+ users'],
    links: [
      { label: 'Web client', url: 'https://shuvam-banerji-seal.github.io/iiserkonnect-website/' },
      { label: 'GitHub', url: 'https://github.com/Shuvam-Banerji-Seal/iiserkonnect-website' }
    ]
  },
  {
    id: 'open-science-notes',
    sortKey: 2026.58,
    when: '2026',
    kind: 'teaching',
    title: 'DFT Notes and Introduction to Molecular Simulation',
    org: 'Open knowledge bases',
    summary:
      'Two open resources: a density functional theory knowledge base, and a beginner-to-running-simulation molecular dynamics course.',
    bullets: [
      'DFT Notes: the many-body Schrödinger problem through Hartree-Fock, the Hohenberg-Kohn theorems, the Kohn-Sham equations and exchange-correlation functionals, each with runnable Python.',
      'Molecular Simulation: statistical mechanics, force fields, MD integrators and thermostats versus Monte Carlo, NVE/NVT/NPT ensembles, and observables (RDF, MSD, VACF, free energy).'
    ],
    tags: ['DFT', 'Quantum ESPRESSO', 'LAMMPS'],
    links: [
      { label: 'DFT Notes', url: 'https://shuvam-banerji-seal.github.io/DFT-notes/' },
      {
        label: 'Molecular Simulation',
        url: 'https://github.com/Shuvam-Banerji-Seal/introduction-to-molecular-simulation'
      }
    ]
  },
  {
    id: 'voice-of-youth',
    sortKey: 2026.6,
    when: '1 – 2 August 2026',
    kind: 'talk',
    title: 'Invited Judge, Voice of Youth 2026 National Summit',
    org: 'Raajkutir, Kolkata – national teen-led innovation summit supported by Mr. Harshavardhan Neotia',
    summary:
      'Judged shortlisted student teams presenting at the National Offline Summit in the technology and innovation domains, assessing technical depth, feasibility and demonstrated impact.'
  },
  {
    id: 'cbse-dld',
    sortKey: 2026.62,
    when: 'August 2026',
    kind: 'talk',
    title: 'Guest Lecturer & Guest of Honour, CBSE District-Level Deliberation',
    org: 'CBSE STEM DLD on Computational Thinking & AI, Abhinav Bharati High School, Kolkata District',
    summary:
      'Invited by the Central Board of Secondary Education as an AI subject expert to address 64 teachers from 38 schools on "AI in the Real-World Context".',
    bullets: [
      'What today\'s AI tools and services actually are, the next-token-prediction machinery underneath them, and how to teach with and about them responsibly.',
      'The full 60-minute talk was released openly: an interactive 26-slide HTML deck and a matching LaTeX Beamer PDF, so attending schools can reuse the material.'
    ],
    tags: ['CBSE', '64 teachers', '38 schools'],
    links: [
      { label: 'HTML deck', url: 'https://shuvam-banerji-seal.github.io/ai-in-real-world-context/' },
      {
        label: 'Beamer PDF',
        url: 'https://shuvam-banerji-seal.github.io/ai-in-real-world-context/main.pdf'
      },
      {
        label: 'GitHub',
        url: 'https://github.com/Shuvam-Banerji-Seal/ai-in-real-world-context'
      }
    ]
  },
  {
    id: 'fire-2026-track',
    sortKey: 2026.65,
    when: '2026',
    kind: 'leadership',
    title: 'Track Co-organiser, FIRE 2026 SYCO PHANCY Shared Task',
    org: 'IISER Kolkata · Université de Bretagne Occidentale · University of Amsterdam',
    summary:
      'Co-organising an international shared task on explainable AI in legal reasoning, from statute prediction to sycophancy detection.',
    tags: ['FIRE 2026', 'Legal AI', 'Evaluation'],
    links: [{ label: 'Track site', url: 'https://sycolex.com/' }]
  },
  {
    id: 'thesis-lean',
    sortKey: 2026.8,
    when: '2026 – Present',
    kind: 'research',
    title: "Master's Thesis I – Gray Codes, Karnaugh Maps and Lean 4",
    org: 'BS-MS Thesis, IISER Kolkata',
    summary:
      'Encoding DNA, RNA and protein sequences into binary sequence space and arranging the codewords on Gray-code orderings and Karnaugh maps, so that adjacency in the map is a single-symbol mutation in the sequence.',
    bullets: [
      'Extracting the binary relations, symmetries and distance structure induced by the encoding.',
      'Testing whether that structure predicts biologically meaningful patterns: codon degeneracy, mutation neighbourhoods, amino-acid physicochemical classes.',
      'Formalising and machine-checking every theorem in Lean 4 with Mathlib, giving fully rigorous proofs of the correspondence between the combinatorial formulation and real genomic sequences.'
    ],
    tags: ['Lean 4', 'Formal Verification', 'Gray Code', 'Genomics'],
    links: []
  },
  {
    id: 'thesis-moe',
    sortKey: 2026.85,
    when: '2026 – Present',
    kind: 'research',
    title: "Master's Thesis II – Mixture-of-Experts Transformer for RNA Structure",
    org: 'BS-MS Thesis, IISER Kolkata',
    summary:
      'A sparse Mixture-of-Experts transformer for nucleic-acid secondary and tertiary structure prediction, routing distinct structural motifs to specialised experts at a fixed inference budget.',
    bullets: [
      'Sequence-to-structure pipeline: nucleotide tokenisation, evolutionary/MSA features, geometry-aware attention.',
      'Distance-map and torsion-angle prediction heads with structure-quality losses.',
      'Multi-GPU distributed training in mixed precision, with systematic ablation of routing strategies and expert counts.'
    ],
    tags: ['Mixture-of-Experts', 'Transformers', 'RNA', 'PyTorch']
  },
  {
    id: 'graduation',
    sortKey: 2027,
    when: '2027 (expected)',
    kind: 'education',
    title: 'BS-MS Dual Degree – Expected Completion',
    org: 'IISER Kolkata',
    summary: 'The road continues.'
  }
];

/** Milestones in road order. The road never re-sorts; it trusts this. */
export function orderedMilestones() {
  return [...milestones].sort((a, b) => a.sortKey - b.sortKey);
}

/** Distinct calendar years touched by the timeline, ascending. */
export function timelineYears() {
  const years = new Set(milestones.map((m) => Math.floor(m.sortKey)));
  return [...years].sort((a, b) => a - b);
}
