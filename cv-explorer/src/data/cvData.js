/**
 * CV Data — extracted faithfully from Shuvam_Banerji_Seal_CV.tex
 * (source of truth per README: "Keep profile updates in .tex first").
 *
 * Organised as `chapters`: an ordered array where each entry maps 1:1 to a
 * floating Book along the journey path. The `id` is stable and used by tests.
 *
 * DO NOT add entries that are not present in the .tex file. If the .tex is
 * updated, re-run the extraction and update this file, then run `npm test`.
 */

export const header = {
  name: 'Shuvam Banerji Seal',
  title: 'Aspiring Computational Chemist | AI/ML Researcher | DeepTech & AI-Fintech Co-Founder',
  degree: 'BS-MS Student (Chemistry Major, Computer Science Minor)',
  institution: 'Indian Institute of Science Education and Research, Kolkata',
  contacts: {
    email: 'sbs22ms076@iiserkol.ac.in',
    github: 'https://github.com/Shuvam-Banerji-Seal',
    linkedin: 'https://www.linkedin.com/in/mastersbs',
    website: 'https://shuvam-banerji-seal.github.io',
    orcid: 'https://orcid.org/0009-0000-0714-569X'
  }
};

/**
 * Each chapter has:
 *  - id:          stable slug (used by tests + path layout)
 *  - title:       book spine / cover title
 *  - subtitle:    short descriptor shown on cover
 *  - color:       hex accent color for the book glow + plinth light
 *  - icon:        emoji used on the book cover (lightweight, no asset deps)
 *  - pages:       array of {heading, body, bullets, meta, links}
 */
export const chapters = [
  {
    id: 'about',
    title: 'About Me',
    subtitle: 'Who I am',
    color: 0x4488ff,
    icon: '✦',
    pages: [
      {
        heading: 'Shuvam Banerji Seal',
        body: 'Aspiring Computational Chemist | AI/ML Researcher | DeepTech & AI-Fintech Co-Founder.',
        meta: [
          'BS-MS Student (Chemistry Major, Computer Science Minor)',
          'Indian Institute of Science Education and Research, Kolkata'
        ],
        links: [
          { text: 'Email', url: 'mailto:sbs22ms076@iiserkol.ac.in' },
          { text: 'GitHub', url: 'https://github.com/Shuvam-Banerji-Seal' },
          { text: 'LinkedIn', url: 'https://www.linkedin.com/in/mastersbs' },
          { text: 'Website', url: 'https://shuvam-banerji-seal.github.io' },
          { text: 'ORCID', url: 'https://orcid.org/0009-0000-0714-569X' }
        ]
      }
    ]
  },
  {
    id: 'research',
    title: 'Research Experience',
    subtitle: 'Academic research projects',
    color: 0x66ccff,
    icon: '🔬',
    pages: [
      {
        heading: 'Hybrid RAG for Verifiable Answer Synthesis',
        meta: ['July 2025', 'Under Dr. Dwaipayan Roy, IISER-Kolkata'],
        bullets: [
          'Comprehensive RAG pipeline for IISER-K intranet: Selenium data acquisition, OCR (PyMuPDF, EasyOCR), text extraction',
          'Context-aware chunking with metadata enrichment; Qwen3-4B embeddings stored in FAISS',
          'Hybrid search: dense vector retrieval + BM25 fused via Reciprocal Rank Fusion',
          'Query refinement with hypothetical answers; verifiable inline citations in a Streamlit app'
        ]
      },
      {
        heading: 'Advanced Retrieval for TREC Tip-of-Tongue',
        meta: ['2024', 'TREC 2024 Proceedings', 'Guided by Dr. Dwaipayan Roy, IISER-Kolkata'],
        bullets: [
          'Multi-layer BM-25 filtering system in Lucene (Java) with dynamic search-domain contraction',
          'Transformer-based query expansion and semantic matching via local LLMs (multi-shot + chain-of-thought prompting)',
          'Results on par with specifically-modified DPR models'
        ],
        links: [{ text: 'TREC 2024 Paper', url: 'https://trec.nist.gov/pubs/trec33/papers/IISER-K.tot.pdf' }]
      }
    ]
  },
  {
    id: 'industry',
    title: 'Industrial Experience',
    subtitle: 'Internships',
    color: 0x44ddaa,
    icon: '🏭',
    pages: [
      {
        heading: 'Research Intern — HistoXai',
        meta: ['May 2025 – July 2025', 'Astroloop Technologies Pvt. Ltd., Bangalore'],
        bullets: [
          'Comparative analysis of digital histopathology slide quality assessment tools',
          'Reviewed 30+ open-source frameworks (HistoQC, PathProfiler, GrandQC, HistoROI, FASTPathology)',
          'Evaluated architectural designs, datasets, performance metrics, and limitations for future model integration'
        ],
        tags: ['Python', 'OpenCV', 'PyTorch', 'Scikit-learn', 'Pandas']
      }
    ]
  },
  {
    id: 'publications',
    title: 'Publications',
    subtitle: 'Peer-reviewed work',
    color: 0xffd700,
    icon: '📄',
    pages: [
      {
        heading: 'AgriIR: A Scalable Framework for Domain-Specific Knowledge Retrieval',
        meta: ['ECIR 2026', 'Shuvam Banerji Seal, Aheli Poddar, Alok Mishra, Dr. Dwaipayan Roy'],
        bullets: [
          'Scalable information retrieval framework for agricultural domain knowledge accessibility in developing regions',
          'Advanced retrieval algorithms optimized for domain-specific terminology and contextual understanding',
          'Advancing retrieval systems for social good'
        ],
        links: [{ text: 'DOI', url: 'https://doi.org/10.1007/978-3-032-21324-2_37' }]
      },
      {
        heading: 'Hierarchical Opinion Classification using Large Language Models',
        meta: ['FIRE 2025', 'Shuvam Banerji Seal, Alok Mishra, Utkarsha Ghosh'],
        bullets: [
          'Parameter-efficient fine-tuning of Gemma LLM with custom two-layer classification head',
          'Class-weighted cross-entropy loss to address data imbalance',
          'Reformulated three-level hierarchy into 8-class flat scheme',
          'Explored selective fine-tuning and instruction-tuning under computational constraints'
        ],
        links: [{ text: 'Paper PDF', url: 'https://ceur-ws.org/Vol-4173/T10-3.pdf' }]
      },
      {
        heading: 'IISERK@ToT_2024: Query Reformulation and Layered Retrieval',
        meta: ['TREC 2024 Proceedings', 'Shuvam Banerji Seal, Subinay Adhikary, Soumyadeep Sar, Dr. Dwaipayan Roy'],
        bullets: [
          'Approaches for known-item retrieval in TREC 2024 Tip-of-the-Tongue track',
          'Four-step query reformulation + two-layer retrieval using BM25 and LLMs',
          'Best performance: Recall@1000 of 0.8067; enhanced NDCG via systematic query reformulation'
        ],
        links: [{ text: 'TREC Paper', url: 'https://trec.nist.gov/pubs/trec33/papers/IISER-K.tot.pdf' }]
      },
      {
        heading: 'Computational Modeling of [VO(SALIEP)(DTP)] as Water Reducing Catalyst',
        meta: ['2024–25 (to be submitted)', 'Shuvam Banerji Seal, guided by Dr. Soumyajit Roy'],
        bullets: [
          'DFT methods (B3LYP) for MO energy calculations and electronic structure analysis using Gaussian',
          'Mechanistic studies using transition state theory and reaction pathway analysis',
          'Catalyst performance prediction for water reduction'
        ]
      }
    ]
  },
  {
    id: 'ventures',
    title: 'Entrepreneurial Ventures',
    subtitle: 'Startups co-founded',
    color: 0xff6644,
    icon: '🚀',
    pages: [
      {
        heading: 'iFiNN — Co-Founder & Lead Developer',
        meta: ['2025 – Present', 'Incubated at RISE Foundation, IISER Kolkata'],
        bullets: [
          'AI-driven fintech startup funded by MeitY Startup Hub (MSH) through the GENESIS program',
          'User-friendly platform democratizing ML/AI tools for automated smart trading alerts',
          'Coverage: stocks, crypto, and mutual funds',
          'Status: Funded; DPIIT registration in progress (Q1 2026); product shipping by 2027'
        ],
        links: [{ text: 'Website', url: 'https://synapse-iiserk.github.io/' }]
      },
      {
        heading: 'UnderWater AI — Co-Founder & CTO',
        meta: ['2025 – Present', 'Incubated at RISE Foundation, IISER Kolkata'],
        bullets: [
          'Deeptech startup funded by MeitY Startup Hub (MSH) through the GENESIS program',
          'Software solutions to enhance underwater image quality using deep neural networks',
          'Early fusion learning for marine species identification',
          'Serving researchers and industrial marine applications',
          'Status: Funded; DPIIT registration in progress (Q1 2026); product shipping by 2027'
        ],
        links: [{ text: 'Website', url: 'https://underwater-ai.github.io/' }]
      }
    ]
  },
  {
    id: 'libraries',
    title: 'Research Libraries & Frameworks',
    subtitle: 'Open-source tools developed',
    color: 0xaa88ff,
    icon: '📚',
    pages: [
      {
        heading: 'Fernholz Stochastic Portfolio Theory Python Library',
        meta: ['Ongoing', 'Quantitative Finance Library'],
        bullets: [
          'Python library for Stochastic Portfolio Theory',
          'Diversity-weighted portfolios and relative arbitrage strategies',
          'Built on stochastic calculus and continuous semimartingales'
        ],
        links: [{ text: 'GitHub', url: 'https://github.com/XAheli/Fernholz-SPT' }]
      },
      {
        heading: 'LAMMPS Data Web Viewer',
        meta: ['2025', 'Active Web Service'],
        bullets: [
          'Web-based 3D visualization tool for LAMMPS molecular dynamics data files',
          'Built with React, Three.js, and Flask',
          'Interactive molecular dynamics analysis and real-time atom/bond rendering'
        ],
        links: [
          { text: 'GitHub', url: 'https://github.com/Shuvam-Banerji-Seal/lammps_data_web_viewer' },
          { text: 'Live Site', url: 'https://shuvam-banerji-seal.github.io/lammps_data_web_viewer/' }
        ]
      }
    ]
  },
  {
    id: 'tutorials',
    title: 'Tutorials Developed',
    subtitle: 'Open-source curricula',
    color: 0xffaa44,
    icon: '🎓',
    pages: [
      {
        heading: 'Complete C Programming Course',
        meta: ['2025', 'Open Source Curriculum'],
        bullets: [
          'Comprehensive 20-module C programming curriculum',
          'Fundamentals to advanced topics',
          'Network Programming, Machine Learning in C, GUI development with GTK4'
        ],
        links: [{ text: 'GitHub', url: 'https://github.com/Shuvam-Banerji-Seal/C-Programming-for-Beginners' }]
      },
      {
        heading: 'Python Course for Beginners',
        meta: ['2025', 'Open Source Curriculum'],
        bullets: [
          'Progressive Python learning resource',
          'Core concepts to local LLM deployment',
          'Interactive notebooks, real-world project implementations, database integration'
        ],
        links: [{ text: 'GitHub', url: 'https://github.com/Shuvam-Banerji-Seal/Python-Course-for-Beginners' }]
      }
    ]
  },
  {
    id: 'projects',
    title: 'Projects',
    subtitle: 'Selected works',
    color: 0x00ccff,
    icon: '⚙️',
    pages: [
      {
        heading: 'TCP Activity Monitor for Arch Linux',
        meta: ['2025', 'System Utility'],
        bullets: ['System-wide TCP monitoring utility integrating systemd services', 'Logs kernel statistics, socket states, per-process connections'],
        links: [{ text: 'GitHub', url: 'https://github.com/Shuvam-Banerji-Seal/TCP-Count-Monitor-for-Arch-Linux' }]
      },
      {
        heading: 'WeLearn Bot in C',
        meta: ['2025', 'Utility Application'],
        bullets: ['Multi-threaded educational resource automation tool in C', 'CLI and GTK4 GUI interfaces', 'Secure session management and encrypted credential storage'],
        links: [{ text: 'GitHub', url: 'https://github.com/Shuvam-Banerji-Seal/welearnbot_in_C' }]
      },
      {
        heading: 'IndicAgri: AI Platform for Indian Agriculture',
        meta: ['Aug 2025', 'Capital One Launchpad Hackathon 2025'],
        bullets: ['Multi-modal RAG chatbot supporting 20+ languages', 'Gemma/DeepSeek LLMs and Indic-Conformer', 'Autonomous 15k+ document curation pipeline'],
        links: [{ text: 'GitHub', url: 'https://github.com/Shuvam-Banerji-Seal/Answering_Agriculture' }]
      },
      {
        heading: 'Automated Event Coupon Management System',
        meta: ['2025', 'Event Automation System'],
        bullets: ['Flask-based event management system', 'Google OAuth 2.0 authentication', 'Automated bulk emailing + real-time QR verification with mobile scanner'],
        links: [{ text: 'GitHub', url: 'https://github.com/Shuvam-Banerji-Seal/Automated-Event-Coupon-Sender-Email-and-Verification-Application' }]
      },
      {
        heading: 'Legal Document Retrieval RAG Application',
        meta: ['Feb 2025', 'Legal Tech RAG System'],
        bullets: ['LLaMA-3.2, Nomic embeddings, ChromaDB', 'Streamlit interface', 'Mistral-OCR for complex legal texts'],
        links: [{ text: 'GitHub', url: 'https://github.com/Shuvam-Banerji-Seal/CCA-2015-LLM' }]
      },
      {
        heading: 'Full-Stack E-Commerce GUI in C',
        meta: ['2024', 'Under Dr. Kripabandhu Ghosh, IISER-Kolkata'],
        bullets: ['GTK4 and SQLite3', 'Static context chatbot with optimized BM25 retrieval'],
        links: [{ text: 'GitHub', url: 'https://github.com/Shuvam-Banerji-Seal/CS3101-E-Commerce-App-in-C.git' }]
      },
      {
        heading: 'Wi-Fi Channel Optimizer',
        meta: ['2024', 'Network Optimization Tool'],
        bullets: ['Bash-based Wi-Fi optimization script', 'Automates scanning, speed benchmarking, channel selection'],
        links: [{ text: 'GitHub', url: 'https://github.com/Shuvam-Banerji-Seal/Wi-Fi-channel-optimizer' }]
      },
      {
        heading: 'SMC Canteen System Modernization',
        meta: ['2024', 'IISER-Kolkata'],
        bullets: ['Modernized IISER-K Canteen System', 'Ported legacy code to modular Django architecture', 'Improved maintainability for 2000+ users']
      },
      {
        heading: 'Coordination Chemistry Twists Simulator',
        meta: ['Nov 2024', 'Computational Chemistry Simulation'],
        bullets: ['Python molecular dynamics simulator', 'Visualizes Ray-Dutt and Bailar twist mechanisms in coordination complexes', 'Interactive 3D stereochemical analysis'],
        links: [{ text: 'GitHub', url: 'https://github.com/Shuvam-Banerji-Seal/Ray-Dutt-and-Bailar-Twists-Simulator' }]
      },
      {
        heading: 'Agentic Database Builder',
        meta: ['Aug 2024', 'Autonomous Data Engineering'],
        bullets: ['AI-driven agentic system for autonomous database construction', 'LLM decision-making for schema generation, data validation, scalable curation'],
        links: [{ text: 'GitHub', url: 'https://github.com/Shuvam-Banerji-Seal/Agentic_Database_Builder' }]
      },
      {
        heading: 'Interactive Spherical Harmonics Visualizer',
        meta: ['2023–24', 'Scientific Visualization Engine'],
        bullets: ['Interactive 3D quantum orbital visualizer', 'Flask + Plotly', 'Real-time computation and rendering of spherical harmonics'],
        links: [{ text: 'GitHub', url: 'https://github.com/Shuvam-Banerji-Seal/simple-spherical-harmonics-visualizer' }]
      }
    ]
  },
  {
    id: 'skills',
    title: 'Technical Skills',
    subtitle: 'Tools & technologies',
    color: 0x44ffaa,
    icon: '🛠️',
    pages: [
      {
        heading: 'Core & Research Computing',
        groups: [
          { name: 'Core Competencies', items: ['Technical Leadership', 'Research & Development', 'Strategic Planning', 'Event Management', 'Mentoring', 'Public Speaking', 'Cross-functional Collaboration'] },
          { name: 'Research Computing', items: ['Algorithm Development', 'Information Retrieval (Apache Lucene, BM25)', 'Bio-Informatics', 'Molecular Dynamics', 'DFT Computations', 'Reciprocal Rank Fusion', 'Information Theory'] }
        ]
      },
      {
        heading: 'Programming & Python',
        groups: [
          { name: 'Languages', items: ['Python', 'C/C++', 'Java', 'Rust', 'QBASIC', 'GWBASIC', 'Fortran'] },
          { name: 'Python — Core & Scientific', items: ['Numpy', 'Pandas', 'SciPy', 'Matplotlib', 'Plotly', 'Scikit-learn', 'OpenCV', 'PyTorch', 'Tensorflow'] }
        ]
      },
      {
        heading: 'NLP, ML & LLMs',
        groups: [
          { name: 'NLP & ML Libraries', items: ['HuggingFace Transformers', 'LangChain', 'NLTK', 'Spacy', 'FAISS', 'ChromaDB', 'Selenium', 'BeautifulSoup'] },
          { name: 'Document Processing', items: ['PyMuPDF', 'EasyOCR', 'Streamlit', 'Manim', 'fake_useragent'] },
          { name: 'LLMs & Embeddings', items: ['Qwen2-4B', 'Qwen3-4B', 'Gemma (1B, 27B)', 'DeepSeek', 'LLaMA-3.2:1B', 'Nomic Embeddings', 'Mistral-OCR', 'Indic-Conformer'] },
          { name: 'RAG & Retrieval', items: ['Retrieval-Augmented Generation (RAG)', 'Dense & Sparse Retrieval', 'Vector Databases (FAISS, ChromaDB)', 'Hybrid Search (BM25 + Embeddings)'] }
        ]
      },
      {
        heading: 'Scientific & Domain Tools',
        groups: [
          { name: 'Digital Pathology', items: ['HistoQC', 'PathProfiler', 'GrandQC', 'HistoROI', 'FASTPathology'] },
          { name: 'Scientific Software', items: ['LAMMPS', 'VMD', 'Gaussian', 'Origin Pro', 'Scilab'] },
          { name: 'Bio-Informatics', items: ['PyMol', 'ChimeraX', 'PyDock', 'AutoDock Vina'] }
        ]
      },
      {
        heading: 'Development, GUI & Systems',
        groups: [
          { name: 'Development Stack', items: ['Full Stack (HTML/CSS/JS)', 'MongoDB', 'MySQL', 'SQLite3', 'ChromaDB', 'Git', 'Docker', 'CMake', 'Make'] },
          { name: 'Frameworks', items: ['Django'] },
          { name: 'GUI Development', items: ['GTK4 in C', 'QT in C++', 'Glade for Designing'] },
          { name: 'OS & Server', items: ['Linux', 'SSH', 'OpenSSL', 'CUDA Programming (Python)'] },
          { name: 'Lab Instrumentation', items: ['UV-Vis', 'ATR-FTIR', 'TGA', 'DSC', 'Optical Bench', 'XRD', 'GC-MS', 'Column Chromatography', 'Fluorimeter', 'SEM', 'TEM', 'AFM'] },
          { name: 'Additional Tools', items: ['LaTeX', 'Bash', 'UI/UX Design (Figma)', 'HTML E-mailing'] }
        ]
      }
    ]
  },
  {
    id: 'achievements',
    title: 'Achievements & Honors',
    subtitle: 'Awards & qualifications',
    color: 0xff44aa,
    icon: '🏆',
    pages: [
      {
        heading: 'Hackathons',
        groups: [
          {
            name: 'Capital One Launchpad — Top 14 of 5,073 teams',
            items: [
              '2025, Capital One India, Team Fibonacci',
              'Multi-modal RAG platform for Indian agriculture (IndicAgri)',
              '20+ Indian languages, RAG + LangChain + Gemma/DeepSeek',
              'Autonomous 15k+ document dataset released on Hugging Face'
            ]
          },
          {
            name: 'StatusCode1 — 1st Rank, GIAN Track',
            items: [
              '2024, IIIT-Kalyani',
              'AI search engine for GIAN\'s Abandoned US Patents',
              'Nomic Embeddings + similarity search for natural-language patent queries',
              'Web-scraping pipeline: Selenium, BeautifulSoup, fake_useragent'
            ]
          },
          {
            name: 'StatusCode0 — 1st Rank, MATLAB Track',
            items: ['2023, IIIT-Kalyani', 'Domestic waste type data analysis tool']
          }
        ]
      },
      {
        heading: 'National Science Competitions',
        groups: [
          { name: 'ChemEnigma — 1st Rank', items: ['2025, IISc Bangalore', '72-hour chemistry contest (theory, experimental, concept-presentation)'] },
          { name: 'All Bengal Chemistry Quiz — 2nd Runners Up', items: ['2025, Presidency University'] },
          { name: 'Mimansa — Zonal Topper', items: ['2024, IISER Pune', 'Mathematical problem solving'] },
          { name: 'NAEST — Zonal Runners Up', items: ['2023, NANI IIT Kanpur & Shiksha Sopan', 'Experimental setup using homely items'] }
        ]
      },
      {
        heading: 'Competitive Examinations (2022)',
        bullets: [
          'JEE Mains and Advanced — Qualified, Top 0.1% of candidates',
          'IAT (IISER Aptitude Test) — Qualified, Top 0.06% of candidates',
          'WBJEE — Qualified, Top 0.05% of candidates'
        ]
      },
      {
        heading: 'Scholarships & Honors',
        bullets: [
          'Reliance Foundation Undergraduate Scholar (2023) — top 5000 nationally',
          'Best Young Scientist Speaker on Nanotechnology (2019) — World Science Conference, Jadavpur University'
        ]
      }
    ]
  },
  {
    id: 'experience',
    title: 'Professional Experience',
    subtitle: 'Work & consulting',
    color: 0xff9944,
    icon: '💼',
    pages: [
      {
        heading: 'Web Development for Anicon 3.0',
        meta: ['2024–2025', 'Inquivesta XI, IISER Kolkata'],
        bullets: ['Developed and led the web development of Anicon 3.0 Event'],
        links: [{ text: 'Website', url: 'https://anicon3.github.io/' }]
      },
      {
        heading: 'Web Development for Material Science Laboratory',
        meta: ['2025', 'EFAML, IISER Kolkata'],
        bullets: ['Developed and designed the researchers lab info page', 'Available under Dr. Soumyajit Roy\'s homepage'],
        links: [{ text: 'Website', url: 'https://shuvam-banerji-seal.github.io/EFAML_WEB/index.html' }]
      },
      {
        heading: 'Private Educator & Technical Trainer',
        meta: ['2018 – Present', 'Self-Employed, Kolkata'],
        bullets: ['Courses in CS, Physics, Chemistry, English for High School students (ICSE, CBSE, WB Board)', 'Mentored 50+ students for Board and competitive examinations']
      },
      {
        heading: 'Technical Consultant',
        meta: ['2021 – Present', 'Self-Employed, Kolkata'],
        bullets: ['High-performance computing solutions', 'System optimization, BIOS/UEFI configuration, OS installation', '50+ custom build projects with 100% client satisfaction']
      },
      {
        heading: 'Published Author',
        meta: ['2020', 'MindScapes (ISBN 978-9389923209), Kolkata'],
        bullets: ['Creative anthology focusing on metaphorical and philosophical themes', 'Conducted workshops on technical and creative writing']
      }
    ]
  },
  {
    id: 'leadership',
    title: 'Leadership & Community Impact',
    subtitle: 'Roles & service',
    color: 0xcc66ff,
    icon: '🌟',
    pages: [
      {
        heading: 'President — Slashdot, The Programming & Design Club',
        meta: ['Aug 2025 – Present', 'IISER Kolkata'],
        bullets: ['Leading the official programming and design club of IISER Kolkata', 'Organizing workshops, hackathons, and technical sessions to foster a coding culture']
      },
      {
        heading: 'Office Bearer — Valence, The Chemistry Club',
        meta: ['Aug 2025 – Present', 'IISER Kolkata'],
        bullets: ['Leading the official chemistry club of IISER Kolkata', 'Organizing seminars, student talks, and departmental events']
      },
      {
        heading: 'Organizer — Qiskit Fallfest 2025',
        meta: ['Oct 2025', 'Sponsored by IBM Quantum'],
        bullets: ['Local chapter of Qiskit Fallfest (one of 150 selected institutes globally)', 'Hands-on workshops on Qiskit SDK and quantum computing fundamentals']
      },
      {
        heading: 'Event Management & Logistics',
        meta: ['2023 – 2025', 'IISER Kolkata'],
        bullets: ['Anicon 3.0 & 2.0: led organization with 500+ participants', 'Supra-Molecular Discussions 2024', 'GIAN Courses on Soft-Oxometalates and X-Ray Crystallography']
      },
      {
        heading: 'Social Impact & Community Service',
        meta: ['2020 – 2021', 'Volunteering'],
        bullets: ['COVID-19 relief coordinator', 'Mentoring students under the Ek-Pehal education initiative']
      },
      {
        heading: 'Additional Activities',
        bullets: ['District-level Debate and Quiz finalist', 'Shotokan Karate practitioner', '4th Year Art and Painting Student (Stroke Art & Portraits)']
      }
    ]
  },
  {
    id: 'awards',
    title: 'Honors & Awards',
    subtitle: 'Recent recognitions',
    color: 0xffcc00,
    icon: '🥇',
    pages: [
      {
        heading: '1st Prize (₹2,00,000) — UIDAI Data Hackathon 2026',
        meta: ['Jan 2026', 'UIDAI, NIC, MeitY, Government of India'],
        bullets: [
          'National-level hackathon for data-driven analysis of Aadhaar enrolment and update datasets',
          'Identified meaningful patterns and predictive indicators for system improvements'
        ],
        links: [{ text: 'Hackathon Page', url: 'https://event.data.gov.in/challenge/uidai-data-hackathon-2026/' }]
      }
    ]
  },
  {
    id: 'talks',
    title: 'Invited Talks & Jury Positions',
    subtitle: 'Speaking & judging',
    color: 0x66ffee,
    icon: '🎤',
    pages: [
      {
        heading: 'Technical Talk — Running and Optimizing Local LLMs',
        meta: ['Aug 2025', 'Slashdot Student Chapter, IISER Kolkata'],
        bullets: ['Hardware setups, quantization methods, embedding pipelines', 'Vector databases and practical optimization techniques for local LLM deployment']
      },
      {
        heading: 'Invited Talk — Sustainability, AI, and Emerging Technologies',
        meta: ['Aug 2025', 'Valence – Chemistry Society, IISER Kolkata'],
        bullets: ['Interdisciplinary talk bridging sustainability science with AI-driven modelling', 'Retrieval systems and computational chemistry tools']
      },
      {
        heading: 'Track Co-organizer — FIRE 2026 SYCO PHANCY Shared Task',
        meta: ['2026', 'IISER-K, Université de Bretagne Occidentale (France), University of Amsterdam (Netherlands)'],
        bullets: ['Explainable AI in Legal Reasoning: From Statute Prediction to Sycophancy Detection', 'Evaluating LLM interpretability and sycophancy detection in legal AI'],
        links: [{ text: 'Sycolex', url: 'https://sycolex.com/' }]
      },
      {
        heading: 'Domain Judge — Computer Science Events',
        meta: ['July 2025', 'La Martiniere for Boys Annual Science Fest, Kolkata'],
        bullets: ['External judge for project demonstrations, live coding, and problem-solving rounds']
      }
    ]
  },
  {
    id: 'education',
    title: 'Education',
    subtitle: 'Academic background',
    color: 0xaa66ff,
    icon: '🎓',
    pages: [
      {
        heading: 'IISER Kolkata',
        meta: ['2022 – 2027 (expected)', 'CGPA: 8.2'],
        bullets: ['BS-MS (Chemistry Major, Computer Science Minor)']
      },
      {
        heading: 'Calcutta University',
        meta: ['2021 – 2022', 'CGPA: 8.308'],
        bullets: ['B.Sc Honours in Physics (1st Year Only)']
      },
      {
        heading: 'Jodhpur Park Boys\' High School',
        meta: ['2019 – 2021', '83%'],
        bullets: ['Higher Secondary Education (WBCHSE)', 'Physics, Mathematics, Chemistry, Computer Science']
      },
      {
        heading: 'The New Horizon High School',
        meta: ['2009 – 2019', '83.75%'],
        bullets: ['Secondary Level Schooling (English Medium) under WBBSE']
      }
    ]
  }
];

/**
 * Backwards-compatible aggregated export. Some legacy modules may still
 * reference the flat structure; this avoids breaking them during the refactor.
 */
export const cvData = { header, chapters };
