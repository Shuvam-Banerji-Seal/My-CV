export const cvData = {
  header: {
    name: "Shuvam Banerji Seal",
    title: "Aspiring Computational Chemist | AI/ML Researcher | DeepTech & AI-Fintech Co-Founder",
    institution: "Indian Institute of Science Education and Research, Kolkata",
    degree: "BS-MS Student (Chemistry Major, Computer Science Minor)",
    contacts: {
      email: "sbs22ms076@iiserkol.ac.in",
      github: "github.com/Shuvam-Banerji-Seal",
      linkedin: "linkedin.com/in/mastersbs",
      website: "shuvam-banerji-seal.github.io",
      orcid: "0009-0000-0714-569X"
    }
  },

  publications: [
    {
      title: "AgriIR: Scalable Framework for Domain-Specific Knowledge Retrieval",
      venue: "ECIR 2026",
      year: 2026,
      authors: "S. Banerji Seal, A. Poddar, A. Mishra, D. Roy",
      doi: "10.1007/978-3-032-21324-2_37",
      description: "Advanced IR framework for agricultural knowledge accessibility in developing regions with domain-optimized retrieval algorithms."
    },
    {
      title: "Hierarchical Opinion Classification using LLMs",
      venue: "FIRE 2025",
      year: 2025,
      authors: "S. Banerji Seal, A. Mishra, U. Ghosh",
      url: "https://ceur-ws.org/Vol-4173/T10-3.pdf",
      description: "Parameter-efficient fine-tuning of Gemma with custom two-layer classification head and class-weighted cross-entropy loss for hierarchical opinion labels."
    },
    {
      title: "Query Reformulation & Layered Retrieval for ToT",
      venue: "TREC 2024 Proceedings",
      year: 2024,
      authors: "S. Banerji Seal, S. Adhikary, S. Sar, D. Roy",
      url: "https://trec.nist.gov/pubs/trec33/papers/IISER-K.tot.pdf",
      description: "Four-step query reformulation with two-layer BM25 retrieval for known-item retrieval; Recall@1000: 0.8067."
    },
    {
      title: "Computational Modeling of [VO(SALIEP)(DTP)]",
      venue: "To be submitted",
      year: 2025,
      authors: "S. Banerji Seal, guided by Dr. S. Roy",
      status: "In Progress",
      description: "DFT methods (B3LYP) for MO energy calculations, electronic structure analysis, and water reduction catalyst performance prediction."
    }
  ],

  research: [
    {
      title: "Hybrid RAG for Verifiable Answer Synthesis",
      period: "July 2025",
      advisor: "Dr. D. Roy",
      institution: "IISER-K",
      description: `End-to-end RAG pipeline for IISER-K intranet: automated Selenium scraping, OCR (PyMuPDF, EasyOCR), Qwen3-4B embeddings in FAISS, hybrid BM25 + dense retrieval via Reciprocal Rank Fusion, Streamlit UI with inline citations.`
    },
    {
      title: "Advanced Retrieval for TREC Tip-of-Tongue",
      period: "2024",
      advisor: "Dr. D. Roy",
      institution: "IISER-K",
      github: "https://trec.nist.gov/pubs/trec33/papers/IISER-K.tot.pdf",
      description: "Multi-layer BM25 filtering in Lucene/Java with dynamic search-domain contraction; transformer-based query expansion via LLMs achieving results on par with modified DPR models."
    }
  ],

  industry: [
    {
      title: "Research Intern, HistoXai",
      company: "Astroloop Technologies Pvt. Ltd.",
      location: "Bangalore",
      period: "May - Jul 2025",
      description: `Comparative analysis of 30+ digital histopathology QA tools (HistoQC, PathProfiler, GrandQC, HistoROI, FASTPathology) evaluating architectures, datasets, and performance metrics.`,
      technologies: ["Python", "OpenCV", "PyTorch", "Scikit-learn", "Pandas"]
    }
  ],

  tutorials: [
    {
      title: "Complete C Programming Course",
      year: 2025,
      github: "https://github.com/Shuvam-Banerji-Seal/C-Programming-for-Beginners",
      description: "Open-source 20-module curriculum: fundamentals to advanced topics including Network Programming, ML in C, and GUI development with GTK4."
    },
    {
      title: "Python Course for Beginners",
      year: 2025,
      github: "https://github.com/Shuvam-Banerji-Seal/Python-Course-for-Beginners",
      description: "Progressive learning resource: core concepts to local LLM deployment, with interactive notebooks, real-world projects, and database integration."
    },
    {
      title: "Shaders for Beginners",
      year: 2026,
      github: "https://github.com/Shuvam-Banerji-Seal/shaders-for-beginners",
      description: `Comprehensive educational repository for graphics shader programming from first principles: 10+ progressive lessons covering OpenGL, GLSL, Vulkan intro, audio-reactive shaders, with C and C++ implementations.`
    }
  ],

  projects: [
    {
      title: "Solvation of C60 NanoParticles in Water",
      year: 2025,
      github: "https://github.com/Shuvam-Banerji-Seal/Solvent-Structure-around-NanoParticles",
      category: "Computational Science",
      description: `LAMMPS molecular dynamics simulations of C60 solvation with AIREBO potentials, automated feature extraction (RDF, coordination numbers), and ML prediction pipeline (GPR, NN, XGBoost) for system properties at novel parameter values.`,
      technologies: ["LAMMPS", "Python", "Machine Learning"]
    },
    {
      title: "LAMMPS Data Web Viewer",
      year: 2025,
      github: "https://github.com/Shuvam-Banerji-Seal/lammps_data_web_viewer",
      website: "https://shuvam-banerji-seal.github.io/lammps_data_web_viewer/",
      category: "Web Visualization",
      description: "Web-based 3D visualization tool for LAMMPS data files using React, TypeScript, Three.js/R3F, and Flask backend. Features file upload, paste, theme switching, material customization, and CI/CD deployment to GitHub Pages.",
      technologies: ["React", "TypeScript", "Three.js", "Flask"]
    },
    {
      title: "Legal Document Retrieval RAG",
      year: 2025,
      period: "Feb 2025",
      github: "https://github.com/Shuvam-Banerji-Seal/CCA-2015-LLM",
      description: "LLaMA-3.2, Nomic embeddings, ChromaDB, Mistral-OCR for legal texts via Streamlit.",
      technologies: ["LLaMA-3.2", "Streamlit", "ChromaDB"]
    },
    {
      title: "Agentic Database Builder",
      year: 2024,
      period: "Aug 2024",
      github: "https://github.com/Shuvam-Banerji-Seal/Agentic_Database_Builder",
      description: "AI-driven autonomous DB construction: LLM-based schema generation, data validation, scalable curation.",
      technologies: ["LLM", "Database Design", "Python"]
    },
    {
      title: "WeLearn Bot in C",
      year: 2025,
      github: "https://github.com/Shuvam-Banerji-Seal/welearnbot_in_C",
      description: "Multi-threaded CLI + GTK4 GUI with encrypted credentials and bulk downloads.",
      technologies: ["C", "GTK4", "Threading"]
    },
    {
      title: "E-Commerce GUI in C",
      year: 2024,
      github: "https://github.com/Shuvam-Banerji-Seal/CS3101-E-Commerce-App-in-C.git",
      description: "GTK4 + SQLite3 with BM25 chatbot. Under Dr. K. Ghosh, IISER-K.",
      technologies: ["C", "GTK4", "SQLite3", "BM25"]
    },
    {
      title: "Event Coupon System & Spherical Harmonics Visualizer",
      year: "2023-25",
      projects: [
        {
          name: "Event Coupon System",
          github: "https://github.com/Shuvam-Banerji-Seal/Automated-Event-Coupon-Sender-Email-and-Verification-Application",
          description: "Flask + OAuth 2.0 + QR verification"
        },
        {
          name: "Spherical Harmonics Visualizer",
          github: "https://github.com/Shuvam-Banerji-Seal/simple-spherical-harmonics-visualizer",
          description: "3D quantum orbital visualizer (Flask + Plotly)"
        }
      ]
    },
    {
      title: "TCP Monitor, Wi-Fi Optimizer & Coordination Chemistry Simulator",
      year: "2024-25",
      projects: [
        {
          name: "TCP Monitor",
          github: "https://github.com/Shuvam-Banerji-Seal/TCP-Count-Monitor-for-Arch-Linux",
          description: "System utility for Arch Linux"
        },
        {
          name: "Wi-Fi Optimizer",
          github: "https://github.com/Shuvam-Banerji-Seal/Wi-Fi-channel-optimizer",
          description: "Network optimization tool"
        },
        {
          name: "Coordination Chemistry Simulator",
          github: "https://github.com/Shuvam-Banerji-Seal/Ray-Dutt-and-Bailar-Twists-Simulator",
          description: "Scientific simulation"
        }
      ],
      additionalProject: {
        title: "SMC Canteen",
        description: "Django application, 2000+ users"
      }
    }
  ],

  researchLibraries: [
    {
      title: "Fernholz SPT Library",
      year: "Ongoing",
      status: "In Development",
      github: "https://github.com/XAheli/Fernholz-SPT",
      description: "Python library for Stochastic Portfolio Theory: diversity-weighted portfolios, relative arbitrage using stochastic calculus and continuous semimartingales."
    },
    {
      title: "LAMMPS Data Web Viewer",
      year: 2025,
      status: "Active Service",
      github: "https://github.com/Shuvam-Banerji-Seal/lammps_data_web_viewer",
      website: "https://shuvam-banerji-seal.github.io/lammps_data_web_viewer/",
      description: "Web-based 3D molecular dynamics visualization (React, Three.js, Flask) for interactive atom/bond rendering. Active web service."
    }
  ],

  ventures: [
    {
      title: "Synapse",
      position: "Co-Founder & Lead Developer",
      period: "2025 - Present",
      website: "https://synapse-iiserk.github.io/",
      funding: "MeitY Startup Hub (GENESIS)",
      incubator: "RISE Foundation, IISER-K",
      status: "DPIIT registration in progress",
      description: "AI-fintech startup democratizing ML/AI tools for smart trading alerts across stocks, crypto, and mutual funds."
    },
    {
      title: "UnderWater AI",
      position: "Co-Founder & CTO",
      period: "2025 - Present",
      funding: "MeitY Startup Hub (GENESIS)",
      type: "Deeptech",
      description: "Deep neural networks for underwater image enhancement and early fusion learning for marine species identification."
    }
  ],

  achievements: {
    hackathons: [
      {
        title: "Capital One Launchpad",
        rank: "Top 14 / 5,073 teams",
        year: 2025,
        github: "https://github.com/Shuvam-Banerji-Seal/Answering_Agriculture",
        team: "Team Fibonacci",
        organization: "Capital One India",
        highlights: [
          "Developed multi-modal RAG platform for Indian agriculture",
          "Built agentic AI advisor supporting 20+ Indian languages with scientifically cited outputs using RAG, LangChain, Gemma, DeepSeek",
          "Engineered autonomous data pipeline creating a novel 15k+ document dataset, released on Hugging Face"
        ]
      },
      {
        title: "StatusCode1 - GIAN Track",
        rank: "1st Rank",
        year: 2024,
        github: "https://github.com/Shuvam-Banerji-Seal/LLM-based-Searcher-for-GIAN-s-Abandoned-US-Patents",
        organization: "GIAN (Global Innovation through Academic Collaboration)",
        highlights: [
          "AI search engine for GIAN's Abandoned US Patents",
          "Used Nomic Embeddings + similarity search for natural language patent queries",
          "Created web-scraping pipeline using Selenium, BeautifulSoup, and fake_useragent"
        ]
      },
      {
        title: "StatusCode0 - MATLAB Track",
        rank: "1st Rank",
        year: 2023,
        organization: "IIIT-Kalyani",
        description: "Domestic waste type data analysis tool for a proposed start-up solution"
      }
    ],
    competitions: [
      {
        title: "ChemEnigma",
        rank: "1st Rank",
        year: 2025,
        organization: "IISc Bangalore",
        description: "72-hour chemistry contest (theory, experimental, concept-presentation)"
      },
      {
        title: "All Bengal Chemistry Quiz",
        rank: "2nd Runners Up",
        year: 2025,
        organization: "Presidency University"
      },
      {
        title: "Mimansa",
        rank: "Zonal Topper",
        year: 2024,
        organization: "IISER Pune",
        description: "Mathematical problem solving"
      },
      {
        title: "NAEST (National Association for Experimental Science & Technology)",
        rank: "Zonal Runners Up",
        year: 2023,
        organization: "IIT Kanpur & Shiksha Sopan",
        description: "Experimental skill test using homely items",
        github: "https://github.com/Shuvam-Banerji-Seal/NAEST_Sample_Experiments"
      }
    ],
    examinations: [
      {
        title: "JEE Mains and Advanced",
        status: "Qualified",
        year: 2022,
        achievement: "Ranked in Top 0.1% of candidates"
      },
      {
        title: "IAT (IISER Aptitude Test)",
        status: "Qualified",
        year: 2022,
        achievement: "Ranked in Top 0.06% of candidates"
      },
      {
        title: "WBJEE",
        status: "Qualified",
        year: 2022,
        achievement: "Ranked in Top 0.05% of candidates"
      }
    ],
    scholarships: [
      {
        title: "Reliance Foundation Undergraduate Scholar",
        year: 2023,
        description: "Qualified RF-UG Aptitude test, top 5000 awardees nationally"
      },
      {
        title: "Best Young Scientist Speaker on Nanotechnology",
        year: 2019,
        organization: "World Science Conference, Jadavpur University"
      }
    ]
  },

  professionalExperience: [
    {
      title: "Freelance Web Developer & Designer",
      period: "2024 - 2025",
      websites: [
        "https://chemactiva.com/",
        "https://anicon3.github.io/",
        "https://shuvam-banerji-seal.github.io/EFAML_WEB/index.html"
      ],
      description: `Designed and developed the website for ChemActiva Innovations Pvt. Ltd. (nanocellulose startup, DST-NIDHI PRAYAS & HDFC Parivartan grantee). Also led web development for Anicon 3.0 (Inquivesta XI) and the EFAML Lab page at IISER-K.`
    },
    {
      title: "Private Educator & Technical Trainer",
      location: "Kolkata",
      period: "2018 - Present",
      employment: "Self-employed",
      description: "Courses in CS, Physics, Chemistry for ICSE/CBSE/WB Board. Mentored 50+ students for competitive exams."
    },
    {
      title: "Technical Consultant",
      location: "Kolkata",
      period: "2021 - Present",
      employment: "Self-employed",
      specialization: ["HPC solutions", "system optimization", "BIOS/UEFI config"],
      achievement: "50+ custom builds with 100% client satisfaction"
    },
    {
      title: "Published Author",
      year: 2020,
      book: "MindScapes",
      isbn: "978-9389923209",
      description: "Published creative anthology. Conducted workshops on technical and creative writing."
    }
  ],

  education: [
    {
      institution: "Indian Institute of Science Education and Research, Kolkata",
      degree: "BS-MS (Chemistry Major, Computer Science Minor)",
      period: "2022 - 2027 (expected)",
      cgpa: "8.2"
    },
    {
      institution: "Calcutta University",
      degree: "B.Sc Honours in Physics (1st Year Only)",
      period: "2021 - 2022",
      cgpa: "8.308"
    },
    {
      institution: "Jodhpur Park Boys' High School (WBCHSE)",
      level: "Higher Secondary",
      subjects: ["Physics", "Mathematics", "Chemistry", "Computer Science"],
      period: "2019 - 2021",
      percentage: "83%"
    },
    {
      institution: "The New Horizon High School (WBBSE)",
      level: "Secondary Level Schooling (English Medium)",
      period: "2009 - 2019",
      percentage: "83.75%"
    }
  ],

  skills: {
    coreCompetencies: [
      "Technical Leadership",
      "Research & Development",
      "Algorithm Development",
      "Strategic Planning",
      "Event Management",
      "Mentoring",
      "Public Speaking"
    ],
    researchComputing: [
      "Information Retrieval (Apache Lucene, BM25)",
      "Bio-Informatics",
      "Molecular Dynamics",
      "DFT Computations",
      "Reciprocal Rank Fusion",
      "Information Theory"
    ],
    programmingLanguages: [
      "Python",
      "C/C++",
      "Java",
      "Rust",
      "Fortran",
      "QBASIC",
      "GWBASIC"
    ],
    pythonCore: [
      "Numpy",
      "Pandas",
      "SciPy",
      "Matplotlib",
      "Plotly",
      "Scikit-learn",
      "OpenCV",
      "PyTorch",
      "TensorFlow"
    ],
    nlpMl: [
      "HuggingFace Transformers",
      "LangChain",
      "NLTK",
      "SpaCy",
      "FAISS",
      "ChromaDB",
      "Selenium",
      "BeautifulSoup"
    ],
    documentProcessing: [
      "PyMuPDF",
      "EasyOCR",
      "Streamlit",
      "Manim",
      "fake_useragent"
    ],
    llmsEmbeddings: [
      "Qwen2/3-4B",
      "Gemma (1B/27B)",
      "DeepSeek",
      "LLaMA-3.2",
      "Nomic Embeddings",
      "Mistral-OCR",
      "Indic-Conformer"
    ],
    ragIr: [
      "Dense+Sparse Retrieval",
      "BM25",
      "RRF (Reciprocal Rank Fusion)",
      "Vector DBs (FAISS, ChromaDB)",
      "Hybrid Search"
    ],
    scientificSoftware: [
      "LAMMPS",
      "VMD",
      "Gaussian",
      "Origin Pro",
      "Scilab",
      "DFT"
    ],
    bioInformatics: [
      "PyMol",
      "ChimeraX",
      "PyDock",
      "AutoDock Vina"
    ],
    digitalPathology: [
      "HistoQC",
      "PathProfiler",
      "GrandQC",
      "HistoROI",
      "FASTPathology"
    ],
    webDevStack: [
      "Django",
      "Flask",
      "React",
      "Three.js",
      "HTML/CSS/JS",
      "MongoDB",
      "MySQL",
      "SQLite3",
      "Git",
      "Docker",
      "CMake",
      "Make"
    ],
    guiDevelopment: [
      "GTK4 (C)",
      "Qt (C++)",
      "Glade"
    ],
    osServer: [
      "Linux",
      "SSH",
      "OpenSSL",
      "CUDA (Python)",
      "Server Handling"
    ],
    labInstrumentation: [
      "UV-Vis",
      "ATR-FTIR",
      "TGA",
      "DSC",
      "XRD",
      "GC-MS",
      "SEM",
      "TEM",
      "AFM",
      "Fluorimeter",
      "Optical Bench",
      "Column Chromatography"
    ],
    tools: [
      "LaTeX",
      "Bash",
      "Figma",
      "UI/UX Design",
      "HTML E-mailing"
    ]
  },

  invitedTalks: [
    {
      title: "Technical Talk - Running & Optimizing Local LLMs",
      month: "Aug 2025",
      organization: "Slashdot Student Chapter, IISER-K",
      description: "Hands-on session: hardware setups, quantization methods, embedding pipelines, vector databases, and optimization techniques."
    },
    {
      title: "Invited Talk - Sustainability, AI & Emerging Technologies",
      month: "Aug 2025",
      organization: "Valence - Chemistry Society, IISER-K",
      description: "Interdisciplinary talk bridging sustainability science with AI-driven modelling, retrieval systems, and computational chemistry."
    },
    {
      title: "Domain Judge - Computer Science Events",
      month: "July 2025",
      organization: "La Martiniere for Boys Annual Science Fest, Kolkata",
      description: "External judge for project demonstrations, live coding, and problem-solving rounds."
    }
  ],

  leadership: [
    {
      title: "Office Bearer",
      organization: "Slashdot - Programming & Design Club",
      institution: "IISER-K",
      period: "Aug 2025 - Present",
      responsibilities: "Leading workshops, hackathons, and technical sessions to foster coding culture."
    },
    {
      title: "Office Bearer",
      organization: "Valence - Chemistry Club",
      institution: "IISER-K",
      period: "Aug 2025 - Present",
      responsibilities: "Organizing seminars, student talks, and departmental events."
    },
    {
      title: "Organizer",
      event: "Qiskit Fallfest 2025",
      sponsor: "IBM Quantum (one of 150 selected institutes globally)",
      description: "Hands-on workshops on Qiskit SDK and quantum computing."
    },
    {
      title: "Event Lead",
      events: [
        "Anicon 3.0 & 2.0 (500+ participants)",
        "Supra-Molecular Discussions 2024",
        "GIAN Courses on Soft-Oxometalates and X-Ray Crystallography"
      ]
    },
    {
      title: "Social Impact",
      initiatives: [
        "COVID-19 relief coordinator (2020-21)",
        "Ek-Pehal education mentoring initiative"
      ]
    },
    {
      title: "Additional Achievements",
      achievements: [
        "District-level Debate/Quiz finalist",
        "Shotokan Karate practitioner",
        "4th Year Art & Painting Student (Stroke Art & Portraits)"
      ]
    }
  ]
};
