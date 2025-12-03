// Professional News Categories and Keywords System
// Comprehensive coverage for enterprise-grade news aggregation

export interface NewsCategory {
  id: string
  name: string
  description: string
  keywords: string[]
  subcategories?: string[]
  priority: number // 1-10, higher = more important
}

export interface KeywordGroup {
  category: string
  primary: string[]
  secondary: string[]
  technical: string[]
  business: string[]
  trending: string[]
}

// Main Categories with extensive keyword coverage
export const NEWS_CATEGORIES: NewsCategory[] = [
  {
    id: 'artificial-intelligence',
    name: 'Artificial Intelligence',
    description: 'AI research, development, applications, and industry news',
    priority: 10,
    subcategories: ['machine-learning', 'deep-learning', 'nlp', 'computer-vision', 'robotics'],
    keywords: [
      // Core AI Terms
      'artificial intelligence', 'AI', 'machine learning', 'ML', 'deep learning', 'neural networks',
      'natural language processing', 'NLP', 'computer vision', 'robotics', 'automation',
      // AI Models & Architectures
      'GPT', 'ChatGPT', 'Claude', 'Gemini', 'LLM', 'large language model', 'transformer',
      'BERT', 'T5', 'diffusion model', 'GAN', 'generative AI', 'foundation model',
      'multimodal AI', 'vision transformer', 'reinforcement learning', 'federated learning',
      // AI Applications
      'AI assistant', 'chatbot', 'virtual assistant', 'AI agent', 'autonomous systems',
      'predictive analytics', 'recommendation system', 'fraud detection', 'sentiment analysis',
      'image recognition', 'speech recognition', 'text generation', 'code generation',
      // AI Companies & Products
      'OpenAI', 'Anthropic', 'Google AI', 'Microsoft AI', 'Meta AI', 'Amazon AI',
      'NVIDIA AI', 'Tesla AI', 'DeepMind', 'Stability AI', 'Midjourney', 'Runway',
      // AI Ethics & Governance
      'AI ethics', 'AI safety', 'AI alignment', 'AI governance', 'AI regulation',
      'algorithmic bias', 'AI transparency', 'explainable AI', 'responsible AI',
      // Technical AI Terms
      'neural architecture search', 'transfer learning', 'few-shot learning', 'zero-shot learning',
      'prompt engineering', 'fine-tuning', 'RLHF', 'constitutional AI', 'AI training',
      'model compression', 'quantization', 'distillation', 'edge AI', 'AI inference'
    ]
  },
  {
    id: 'machine-learning',
    name: 'Machine Learning',
    description: 'ML algorithms, frameworks, research, and applications',
    priority: 9,
    subcategories: ['supervised-learning', 'unsupervised-learning', 'reinforcement-learning'],
    keywords: [
      'machine learning', 'ML', 'supervised learning', 'unsupervised learning',
      'reinforcement learning', 'semi-supervised learning', 'self-supervised learning',
      'random forest', 'SVM', 'support vector machine', 'decision tree', 'k-means',
      'linear regression', 'logistic regression', 'gradient boosting', 'XGBoost',
      'ensemble methods', 'bagging', 'boosting', 'clustering', 'classification',
      'TensorFlow', 'PyTorch', 'scikit-learn', 'Keras', 'JAX', 'Hugging Face',
      'MLflow', 'Weights & Biases', 'Kubeflow', 'Apache Spark', 'Dask',
      'MLOps', 'model deployment', 'model monitoring', 'data pipeline', 'feature engineering',
      'hyperparameter tuning', 'cross-validation', 'model evaluation', 'A/B testing',
      'predictive modeling', 'anomaly detection', 'time series forecasting',
      'recommendation engine', 'personalization', 'customer segmentation'
    ]
  },
  {
    id: 'data-science',
    name: 'Data Science',
    description: 'Data analytics, big data, statistics, and data-driven insights',
    priority: 8,
    subcategories: ['big-data', 'analytics', 'statistics', 'data-visualization'],
    keywords: [
      'data science', 'data analytics', 'big data', 'data mining', 'statistics',
      'data analysis', 'business intelligence', 'data visualization', 'dashboard',
      'Python', 'R', 'SQL', 'Tableau', 'Power BI', 'Looker', 'Qlik', 'D3.js',
      'Jupyter', 'pandas', 'NumPy', 'matplotlib', 'seaborn', 'plotly',
      'Hadoop', 'Spark', 'Kafka', 'Elasticsearch', 'MongoDB', 'Cassandra',
      'Snowflake', 'Databricks', 'AWS Redshift', 'Google BigQuery', 'Azure Synapse',
      'data engineering', 'ETL', 'data pipeline', 'data warehouse', 'data lake',
      'data mesh', 'data fabric', 'stream processing', 'batch processing',
      'data governance', 'data quality', 'data lineage', 'metadata management'
    ]
  },
  {
    id: 'cloud-computing',
    name: 'Cloud Computing',
    description: 'Cloud services, infrastructure, platforms, and enterprise solutions',
    priority: 8,
    subcategories: ['aws', 'azure', 'gcp', 'hybrid-cloud', 'edge-computing'],
    keywords: [
      'AWS', 'Amazon Web Services', 'Microsoft Azure', 'Google Cloud', 'GCP',
      'IBM Cloud', 'Oracle Cloud', 'Alibaba Cloud', 'DigitalOcean', 'Linode',
      'IaaS', 'PaaS', 'SaaS', 'FaaS', 'serverless', 'containers', 'Kubernetes',
      'Docker', 'microservices', 'API gateway', 'load balancer', 'CDN',
      'cloud native', 'multi-cloud', 'hybrid cloud', 'edge computing', 'fog computing',
      'distributed systems', 'scalability', 'elasticity', 'high availability',
      'disaster recovery', 'backup', 'cloud migration', 'lift and shift',
      'cloud security', 'identity management', 'access control', 'encryption',
      'compliance', 'GDPR', 'HIPAA', 'SOC 2', 'zero trust', 'VPN',
      'DevOps', 'CI/CD', 'infrastructure as code', 'Terraform', 'CloudFormation',
      'Ansible', 'Chef', 'Puppet', 'GitOps', 'monitoring', 'observability'
    ]
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    description: 'Information security, threats, vulnerabilities, and protection measures',
    priority: 9,
    subcategories: ['threat-intelligence', 'incident-response', 'compliance', 'privacy'],
    keywords: [
      'cybersecurity', 'information security', 'network security', 'endpoint security',
      'application security', 'data security', 'cloud security', 'mobile security',
      'malware', 'ransomware', 'phishing', 'social engineering', 'DDoS',
      'SQL injection', 'XSS', 'CSRF', 'zero-day', 'APT', 'insider threat',
      'supply chain attack', 'man-in-the-middle', 'brute force', 'credential stuffing',
      'firewall', 'antivirus', 'IDS', 'IPS', 'SIEM', 'SOAR', 'EDR', 'XDR',
      'vulnerability scanner', 'penetration testing', 'red team', 'blue team',
      'threat hunting', 'incident response', 'forensics', 'sandboxing',
      'GDPR', 'CCPA', 'HIPAA', 'PCI DSS', 'SOX', 'ISO 27001', 'NIST',
      'compliance', 'audit', 'risk assessment', 'governance', 'privacy',
      'AI security', 'IoT security', 'blockchain security', 'quantum cryptography',
      'biometric security', 'behavioral analytics', 'deception technology'
    ]
  },
  {
    id: 'blockchain-crypto',
    name: 'Blockchain & Cryptocurrency',
    description: 'Distributed ledger technology, digital currencies, and Web3',
    priority: 7,
    subcategories: ['bitcoin', 'ethereum', 'defi', 'nft', 'web3'],
    keywords: [
      'blockchain', 'distributed ledger', 'cryptocurrency', 'digital currency',
      'decentralized', 'consensus', 'proof of work', 'proof of stake', 'mining',
      'Bitcoin', 'BTC', 'Ethereum', 'ETH', 'Binance Coin', 'BNB', 'Cardano', 'ADA',
      'Solana', 'SOL', 'Polygon', 'MATIC', 'Avalanche', 'AVAX', 'Chainlink', 'LINK',
      'DeFi', 'decentralized finance', 'smart contracts', 'dApps', 'DEX',
      'yield farming', 'liquidity mining', 'staking', 'lending protocol',
      'automated market maker', 'AMM', 'flash loans', 'governance token',
      'Web3', 'NFT', 'non-fungible token', 'metaverse', 'digital collectibles',
      'IPFS', 'decentralized storage', 'DAO', 'decentralized autonomous organization',
      'enterprise blockchain', 'supply chain', 'traceability', 'digital identity',
      'central bank digital currency', 'CBDC', 'stablecoin', 'tokenization'
    ]
  },
  {
    id: 'fintech',
    name: 'Financial Technology',
    description: 'Digital banking, payments, investment tech, and financial innovation',
    priority: 8,
    subcategories: ['digital-banking', 'payments', 'insurtech', 'regtech'],
    keywords: [
      'fintech', 'digital banking', 'neobank', 'challenger bank', 'open banking',
      'banking as a service', 'BaaS', 'embedded finance', 'API banking',
      'digital payments', 'mobile payments', 'contactless', 'NFC', 'QR code payments',
      'buy now pay later', 'BNPL', 'peer-to-peer payments', 'P2P', 'remittance',
      'cross-border payments', 'real-time payments', 'instant payments',
      'robo-advisor', 'algorithmic trading', 'high-frequency trading', 'HFT',
      'quantitative finance', 'portfolio management', 'risk management',
      'wealth management', 'investment platform', 'trading platform',
      'alternative lending', 'peer-to-peer lending', 'marketplace lending',
      'credit scoring', 'alternative credit', 'microfinance', 'invoice financing',
      'regtech', 'compliance technology', 'KYC', 'AML', 'fraud detection',
      'risk assessment', 'regulatory reporting', 'stress testing'
    ]
  },
  {
    id: 'iot-edge',
    name: 'IoT & Edge Computing',
    description: 'Internet of Things, connected devices, and edge infrastructure',
    priority: 7,
    subcategories: ['smart-cities', 'industrial-iot', 'consumer-iot', 'edge-ai'],
    keywords: [
      'Internet of Things', 'IoT', 'connected devices', 'smart devices',
      'sensor networks', 'M2M', 'machine-to-machine', 'device management',
      'edge computing', 'edge AI', 'fog computing', 'distributed computing',
      'edge analytics', 'real-time processing', 'latency optimization',
      'smart home', 'smart city', 'smart grid', 'smart transportation',
      'connected car', 'autonomous vehicle', 'telematics', 'fleet management',
      'asset tracking', 'supply chain visibility', 'predictive maintenance',
      'Industrial IoT', 'IIoT', 'Industry 4.0', 'smart manufacturing',
      'digital twin', 'condition monitoring', 'remote monitoring',
      'SCADA', 'PLC', 'industrial automation', 'smart factory',
      'MQTT', 'CoAP', 'LoRaWAN', '5G', 'NB-IoT', 'Zigbee', 'Bluetooth LE',
      'Wi-Fi 6', 'cellular IoT', 'satellite IoT', 'mesh networking'
    ]
  },
  {
    id: 'quantum-computing',
    name: 'Quantum Computing',
    description: 'Quantum processors, algorithms, and quantum information science',
    priority: 6,
    subcategories: ['quantum-algorithms', 'quantum-hardware', 'quantum-software'],
    keywords: [
      'quantum computing', 'quantum processor', 'qubit', 'quantum bit',
      'quantum entanglement', 'quantum superposition', 'quantum interference',
      'quantum decoherence', 'quantum error correction', 'quantum supremacy',
      'superconducting qubits', 'trapped ion', 'photonic quantum', 'topological qubits',
      'quantum annealing', 'adiabatic quantum computing', 'quantum gate',
      'Shor algorithm', 'Grover algorithm', 'quantum Fourier transform',
      'variational quantum eigensolver', 'VQE', 'quantum approximate optimization',
      'QAOA', 'quantum machine learning', 'quantum neural networks',
      'quantum cryptography', 'quantum key distribution', 'quantum simulation',
      'quantum chemistry', 'quantum optimization', 'quantum sensing',
      'IBM Quantum', 'Google Quantum', 'Rigetti', 'IonQ', 'D-Wave',
      'Xanadu', 'PsiQuantum', 'Quantum Computing Inc', 'Cambridge Quantum'
    ]
  },
  {
    id: 'robotics-automation',
    name: 'Robotics & Automation',
    description: 'Robotic systems, industrial automation, and autonomous machines',
    priority: 7,
    subcategories: ['industrial-robotics', 'service-robotics', 'autonomous-systems'],
    keywords: [
      'robotics', 'robot', 'automation', 'autonomous systems', 'robotic process automation',
      'RPA', 'industrial robot', 'service robot', 'humanoid robot', 'collaborative robot',
      'cobot', 'mobile robot', 'drone', 'UAV', 'unmanned aerial vehicle',
      'manufacturing automation', 'warehouse automation', 'logistics robot',
      'delivery robot', 'cleaning robot', 'security robot', 'medical robot',
      'surgical robot', 'rehabilitation robot', 'agricultural robot',
      'autonomous vehicle', 'self-driving car', 'ADAS', 'advanced driver assistance',
      'LiDAR', 'computer vision', 'sensor fusion', 'path planning', 'SLAM',
      'robot operating system', 'ROS', 'motion planning', 'inverse kinematics',
      'robot vision', 'tactile sensing', 'force feedback', 'haptic feedback',
      'swarm robotics', 'multi-robot systems', 'human-robot interaction'
    ]
  },
  {
    id: 'augmented-reality',
    name: 'AR/VR/XR',
    description: 'Augmented reality, virtual reality, and extended reality technologies',
    priority: 6,
    subcategories: ['augmented-reality', 'virtual-reality', 'mixed-reality'],
    keywords: [
      'augmented reality', 'AR', 'virtual reality', 'VR', 'mixed reality', 'MR',
      'extended reality', 'XR', 'immersive technology', 'spatial computing',
      'VR headset', 'AR glasses', 'smart glasses', 'haptic gloves', 'motion tracking',
      'eye tracking', 'hand tracking', 'spatial mapping', '6DOF', 'inside-out tracking',
      'metaverse', 'virtual world', 'digital twin', 'virtual training',
      'remote collaboration', 'virtual meeting', 'immersive learning',
      'virtual showroom', 'AR shopping', 'virtual try-on', 'digital fashion',
      'Meta', 'Oculus', 'HTC Vive', 'Valve Index', 'PlayStation VR',
      'Microsoft HoloLens', 'Magic Leap', 'Varjo', 'Pico', 'ByteDance',
      'Unity 3D', 'Unreal Engine', 'WebXR', 'ARCore', 'ARKit', 'Vuforia',
      'OpenXR', 'WebGL', 'Three.js', 'A-Frame', 'spatial audio', '3D modeling'
    ]
  },
  {
    id: 'enterprise-software',
    name: 'Enterprise Software',
    description: 'Business applications, SaaS platforms, and enterprise solutions',
    priority: 8,
    subcategories: ['crm', 'erp', 'hrms', 'collaboration'],
    keywords: [
      'enterprise software', 'business software', 'SaaS', 'software as a service',
      'CRM', 'customer relationship management', 'ERP', 'enterprise resource planning',
      'HRMS', 'human resource management', 'SCM', 'supply chain management',
      'business intelligence', 'BI', 'analytics platform', 'reporting tool',
      'dashboard', 'data visualization', 'self-service analytics', 'embedded analytics',
      'collaboration software', 'team collaboration', 'video conferencing',
      'project management', 'workflow automation', 'document management',
      'knowledge management', 'intranet', 'digital workplace',
      'office suite', 'productivity tools', 'email platform', 'calendar',
      'file sharing', 'cloud storage', 'backup solution', 'sync',
      'healthcare software', 'EMR', 'electronic medical records', 'PACS',
      'financial software', 'accounting software', 'legal software', 'case management',
      'retail software', 'POS', 'point of sale', 'inventory management'
    ]
  },
  {
    id: 'startup-venture',
    name: 'Startups & Venture Capital',
    description: 'Startup ecosystem, funding, entrepreneurship, and innovation',
    priority: 7,
    subcategories: ['seed-funding', 'series-a', 'ipo', 'unicorn'],
    keywords: [
      'startup', 'entrepreneur', 'entrepreneurship', 'innovation', 'disruptive technology',
      'business model', 'product-market fit', 'minimum viable product', 'MVP',
      'lean startup', 'agile development', 'pivot', 'scale-up', 'growth hacking',
      'venture capital', 'VC', 'angel investor', 'seed funding', 'Series A',
      'Series B', 'Series C', 'IPO', 'initial public offering', 'SPAC',
      'crowdfunding', 'equity crowdfunding', 'revenue-based financing',
      'unicorn', 'decacorn', 'valuation', 'burn rate', 'runway', 'CAC',
      'customer acquisition cost', 'LTV', 'lifetime value', 'churn rate',
      'monthly recurring revenue', 'MRR', 'annual recurring revenue', 'ARR',
      'fintech startup', 'healthtech startup', 'edtech startup', 'proptech startup',
      'foodtech startup', 'agtech startup', 'cleantech startup', 'biotech startup',
      'deep tech startup', 'B2B startup', 'B2C startup', 'marketplace',
      'Silicon Valley', 'startup accelerator', 'incubator', 'tech hub',
      'innovation lab', 'corporate venture capital', 'CVC', 'startup studio'
    ]
  },
  {
    id: 'software-development',
    name: 'Software Development',
    description: 'Programming, development tools, frameworks, and software engineering',
    priority: 7,
    subcategories: ['web-development', 'mobile-development', 'devtools'],
    keywords: [
      'software development', 'programming', 'coding', 'software engineering',
      'web development', 'frontend', 'backend', 'full stack', 'JavaScript',
      'TypeScript', 'React', 'Vue', 'Angular', 'Next.js', 'Node.js',
      'Python', 'Java', 'C++', 'Go', 'Rust', 'Swift', 'Kotlin',
      'mobile development', 'iOS', 'Android', 'React Native', 'Flutter',
      'API development', 'REST API', 'GraphQL', 'microservices', 'serverless',
      'database', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch',
      'version control', 'Git', 'GitHub', 'GitLab', 'Bitbucket',
      'CI/CD', 'continuous integration', 'continuous deployment', 'Jenkins',
      'testing', 'unit testing', 'integration testing', 'test automation',
      'code quality', 'code review', 'refactoring', 'technical debt',
      'agile', 'scrum', 'kanban', 'sprint', 'backlog', 'user story'
    ]
  },
  {
    id: 'digital-health',
    name: 'Digital Health & Healthtech',
    description: 'Healthcare technology, telemedicine, medical devices, and health AI',
    priority: 7,
    subcategories: ['telemedicine', 'medical-devices', 'health-ai'],
    keywords: [
      'digital health', 'healthtech', 'telemedicine', 'telehealth', 'remote care',
      'virtual care', 'online consultation', 'digital therapeutics', 'DTx',
      'medical devices', 'wearable devices', 'health monitoring', 'fitness tracker',
      'smartwatch', 'continuous glucose monitor', 'CGM', 'remote patient monitoring',
      'EMR', 'EHR', 'electronic health records', 'health information exchange',
      'PACS', 'picture archiving', 'medical imaging', 'radiology AI',
      'clinical decision support', 'precision medicine', 'personalized medicine',
      'genomics', 'bioinformatics', 'drug discovery', 'clinical trials',
      'medical AI', 'diagnostic AI', 'pathology AI', 'medical chatbot',
      'mental health tech', 'therapy apps', 'meditation apps', 'wellness apps',
      'health insurance tech', 'claims processing', 'prior authorization'
    ]
  },
  {
    id: 'sustainability-cleantech',
    name: 'Sustainability & Clean Technology',
    description: 'Green technology, renewable energy, climate tech, and ESG',
    priority: 7,
    subcategories: ['renewable-energy', 'climate-tech', 'circular-economy'],
    keywords: [
      'sustainability', 'clean technology', 'cleantech', 'green technology',
      'renewable energy', 'solar power', 'wind power', 'hydroelectric',
      'geothermal', 'biomass', 'energy storage', 'battery technology',
      'electric vehicles', 'EV', 'electric car', 'charging infrastructure',
      'smart grid', 'grid modernization', 'energy efficiency', 'energy management',
      'carbon capture', 'carbon sequestration', 'carbon offset', 'carbon neutral',
      'climate tech', 'climate change', 'greenhouse gas', 'emissions reduction',
      'circular economy', 'recycling', 'waste management', 'sustainable packaging',
      'ESG', 'environmental social governance', 'sustainable investing',
      'green bonds', 'impact investing', 'corporate sustainability',
      'water technology', 'water purification', 'desalination', 'water conservation',
      'sustainable agriculture', 'precision agriculture', 'vertical farming'
    ]
  },
  {
    id: 'ecommerce-retail',
    name: 'E-commerce & Retail Tech',
    description: 'Online retail, digital commerce, retail innovation, and consumer tech',
    priority: 6,
    subcategories: ['online-retail', 'marketplace', 'retail-innovation'],
    keywords: [
      'e-commerce', 'ecommerce', 'online retail', 'digital commerce', 'online shopping',
      'marketplace', 'online marketplace', 'B2C', 'B2B commerce', 'D2C',
      'direct to consumer', 'dropshipping', 'fulfillment', 'logistics',
      'last mile delivery', 'same day delivery', 'delivery optimization',
      'omnichannel', 'unified commerce', 'retail technology', 'point of sale',
      'POS system', 'inventory management', 'supply chain', 'warehouse management',
      'personalization', 'recommendation engine', 'product discovery',
      'conversion optimization', 'checkout optimization', 'payment gateway',
      'social commerce', 'live shopping', 'influencer marketing', 'affiliate marketing',
      'AR shopping', 'virtual try-on', 'visual search', 'voice commerce',
      'subscription commerce', 'subscription box', 'recurring revenue',
      'customer analytics', 'retail analytics', 'merchandising', 'pricing optimization'
    ]
  },
  {
    id: 'edtech',
    name: 'Education Technology',
    description: 'Online learning, educational platforms, and learning innovation',
    priority: 6,
    subcategories: ['online-learning', 'learning-platforms', 'corporate-training'],
    keywords: [
      'edtech', 'education technology', 'online learning', 'e-learning', 'digital learning',
      'learning management system', 'LMS', 'learning platform', 'MOOC',
      'massive open online course', 'online course', 'video learning',
      'adaptive learning', 'personalized learning', 'AI tutoring', 'intelligent tutoring',
      'gamification', 'educational games', 'learning games', 'serious games',
      'virtual classroom', 'remote learning', 'distance learning', 'hybrid learning',
      'student information system', 'SIS', 'assessment technology', 'proctoring',
      'corporate training', 'employee training', 'upskilling', 'reskilling',
      'microlearning', 'mobile learning', 'social learning', 'collaborative learning',
      'coding education', 'STEM education', 'language learning', 'skill development'
    ]
  },
  {
    id: 'media-entertainment',
    name: 'Media & Entertainment Tech',
    description: 'Streaming, content creation, gaming, and digital media',
    priority: 6,
    subcategories: ['streaming', 'gaming', 'content-creation'],
    keywords: [
      'streaming', 'video streaming', 'music streaming', 'OTT', 'over the top',
      'content delivery', 'CDN', 'video on demand', 'VOD', 'live streaming',
      'gaming', 'video games', 'esports', 'game development', 'game engine',
      'cloud gaming', 'game streaming', 'mobile gaming', 'console gaming',
      'content creation', 'creator economy', 'influencer', 'social media',
      'video editing', 'audio production', 'music production', 'podcasting',
      'digital media', 'media technology', 'advertising technology', 'adtech',
      'programmatic advertising', 'digital advertising', 'video advertising',
      'content management', 'digital asset management', 'media asset management',
      'virtual production', 'motion capture', 'CGI', 'visual effects', 'VFX'
    ]
  },
  {
    id: 'telecommunications',
    name: 'Telecommunications & 5G',
    description: 'Telecom infrastructure, 5G networks, and connectivity',
    priority: 6,
    subcategories: ['5g', 'network-infrastructure', 'satellite'],
    keywords: [
      'telecommunications', 'telecom', '5G', 'fifth generation', 'mobile network',
      'cellular network', '4G', 'LTE', 'network infrastructure', 'base station',
      'fiber optic', 'broadband', 'internet service provider', 'ISP',
      'network equipment', 'network optimization', 'network slicing',
      'edge computing', 'mobile edge computing', 'MEC', 'network function virtualization',
      'software defined networking', 'SDN', 'network automation',
      'satellite internet', 'LEO satellite', 'Starlink', 'satellite communication',
      'IoT connectivity', 'M2M connectivity', 'eSIM', 'embedded SIM',
      'private 5G', 'enterprise 5G', 'network security', 'telecom security'
    ]
  },
  {
    id: 'space-tech',
    name: 'Space Technology',
    description: 'Space exploration, satellites, aerospace, and commercial space',
    priority: 5,
    subcategories: ['satellites', 'space-exploration', 'aerospace'],
    keywords: [
      'space technology', 'space tech', 'aerospace', 'space exploration',
      'satellite', 'satellite technology', 'earth observation', 'remote sensing',
      'satellite imagery', 'geospatial', 'GPS', 'navigation', 'positioning',
      'rocket', 'launch vehicle', 'reusable rocket', 'space launch',
      'commercial space', 'space tourism', 'space station', 'ISS',
      'SpaceX', 'Blue Origin', 'Virgin Galactic', 'NASA', 'ESA',
      'Mars mission', 'lunar mission', 'asteroid mining', 'space mining',
      'space manufacturing', 'microgravity', 'space debris', 'space sustainability'
    ]
  }
]

// Industry-specific keyword mappings
export const INDUSTRY_KEYWORDS = {
  healthcare: [
    'telemedicine', 'digital health', 'healthtech', 'medical AI', 'clinical trials',
    'EMR', 'EHR', 'PACS', 'radiology AI', 'drug discovery', 'precision medicine',
    'wearable devices', 'remote patient monitoring', 'health analytics', 'genomics'
  ],
  finance: [
    'fintech', 'digital banking', 'payments', 'cryptocurrency', 'blockchain',
    'robo-advisor', 'algorithmic trading', 'regtech', 'insurtech', 'lending',
    'credit scoring', 'fraud detection', 'KYC', 'AML', 'open banking', 'wealth management'
  ],
  retail: [
    'e-commerce', 'omnichannel', 'personalization', 'recommendation engine',
    'inventory management', 'supply chain', 'last-mile delivery', 'AR shopping',
    'virtual try-on', 'social commerce', 'marketplace', 'POS', 'customer analytics'
  ],
  manufacturing: [
    'Industry 4.0', 'smart manufacturing', 'IIoT', 'digital twin', 'predictive maintenance',
    'quality control', 'supply chain optimization', 'robotics', 'automation',
    'additive manufacturing', '3D printing', 'lean manufacturing', 'MES'
  ],
  energy: [
    'renewable energy', 'smart grid', 'energy storage', 'solar power', 'wind power',
    'electric vehicles', 'battery technology', 'energy efficiency', 'carbon capture',
    'green technology', 'sustainability', 'ESG', 'clean energy', 'grid modernization'
  ],
  education: [
    'edtech', 'online learning', 'LMS', 'MOOC', 'adaptive learning', 'AI tutoring',
    'virtual classroom', 'remote learning', 'corporate training', 'upskilling',
    'microlearning', 'gamification', 'assessment technology', 'student analytics'
  ],
  media: [
    'streaming', 'OTT', 'content creation', 'creator economy', 'gaming', 'esports',
    'digital advertising', 'adtech', 'social media', 'influencer marketing',
    'video production', 'podcasting', 'content management', 'media analytics'
  ]
}

// Trending technology keywords (updated regularly)
export const TRENDING_KEYWORDS = [
  // Current AI Trends
  'GPT-4', 'GPT-4o', 'Claude 3', 'Claude 3.5', 'Gemini Pro', 'Gemini 2.0', 'multimodal AI', 
  'AI agents', 'autonomous AI', 'AI reasoning', 'chain of thought', 
  'retrieval augmented generation', 'RAG', 'AI coding assistant', 'GitHub Copilot',
  // Emerging Technologies
  'quantum advantage', 'neuromorphic computing', 'brain-computer interface',
  'synthetic biology', 'digital twins', 'spatial computing', 'ambient computing',
  // Business Trends
  'AI transformation', 'digital transformation', 'sustainability tech', 'ESG technology',
  'remote work technology', 'hybrid work', 'employee experience', 'customer experience',
  // Security Trends
  'zero trust architecture', 'passwordless authentication', 'privacy-preserving AI',
  'homomorphic encryption', 'confidential computing', 'secure multi-party computation',
  // Web3 & Crypto
  'Web3', 'DeFi 2.0', 'NFT utility', 'DAO governance', 'layer 2', 'rollups',
  // Cloud & Infrastructure
  'FinOps', 'cloud cost optimization', 'Kubernetes security', 'service mesh',
  'observability', 'platform engineering', 'internal developer platform'
]

// Geographic and market-specific keywords
export const MARKET_KEYWORDS = {
  regions: [
    'Silicon Valley', 'San Francisco', 'New York', 'London', 'Berlin', 'Tel Aviv', 
    'Singapore', 'Bangalore', 'Shenzhen', 'Tokyo', 'Toronto', 'Sydney', 'Stockholm',
    'Austin', 'Boston', 'Seattle', 'Los Angeles', 'Miami', 'Dubai', 'Hong Kong'
  ],
  markets: [
    'North America', 'Europe', 'Asia Pacific', 'EMEA', 'Latin America',
    'emerging markets', 'developed markets', 'global market', 'domestic market',
    'enterprise market', 'SMB market', 'consumer market', 'B2B market', 'B2C market'
  ],
  business: [
    'IPO', 'merger', 'acquisition', 'M&A', 'partnership', 'joint venture', 
    'strategic alliance', 'funding round', 'investment', 'valuation', 'market cap', 
    'revenue growth', 'earnings', 'quarterly results', 'annual report',
    'product launch', 'product announcement', 'beta release', 'general availability',
    'market share', 'competitive landscape', 'industry analysis', 'market research'
  ]
}

// Function to get all keywords for a category
export function getCategoryKeywords(categoryId: string): string[] {
  const category = NEWS_CATEGORIES.find(cat => cat.id === categoryId)
  return category?.keywords || []
}

// Function to get trending keywords
export function getTrendingKeywords(): string[] {
  return TRENDING_KEYWORDS
}

// Function to get industry-specific keywords
export function getIndustryKeywords(industry: string): string[] {
  return INDUSTRY_KEYWORDS[industry as keyof typeof INDUSTRY_KEYWORDS] || []
}

// Function to calculate keyword relevance score
export function calculateKeywordRelevance(
  text: string,
  categoryId: string,
  includeIndustry?: string
): number {
  const categoryKeywords = getCategoryKeywords(categoryId)
  const trendingKeywords = getTrendingKeywords()
  const industryKeywords = includeIndustry ? getIndustryKeywords(includeIndustry) : []
  
  const textLower = text.toLowerCase()
  let score = 0

  // Primary category keywords (highest weight)
  categoryKeywords.forEach(keyword => {
    if (textLower.includes(keyword.toLowerCase())) {
      score += 3
    }
  })

  // Trending keywords (medium weight)
  trendingKeywords.forEach(keyword => {
    if (textLower.includes(keyword.toLowerCase())) {
      score += 2
    }
  })

  // Industry keywords (lower weight)
  industryKeywords.forEach(keyword => {
    if (textLower.includes(keyword.toLowerCase())) {
      score += 1
    }
  })

  return Math.min(score / 10, 1) // Normalize to 0-1 range
}

// Export default categories for UI components
export const DEFAULT_CATEGORIES = NEWS_CATEGORIES.map(cat => ({
  value: cat.id,
  label: cat.name,
  description: cat.description
}))

// Get all unique keywords across all categories
export const ALL_KEYWORDS = Array.from(
  new Set(NEWS_CATEGORIES.flatMap(cat => cat.keywords))
).sort()
