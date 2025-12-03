// Comprehensive search queries for diverse news coverage
// These queries are used by news APIs to fetch relevant articles

export interface SearchQuery {
  id: string
  name: string
  query: string
  priority: number
  categories: string[]
}

// Comprehensive search queries covering all major tech domains
export const SEARCH_QUERIES: SearchQuery[] = [
  {
    id: 'ai-ml-core',
    name: 'AI & Machine Learning Core',
    priority: 10,
    categories: ['artificial-intelligence', 'machine-learning'],
    query: 'artificial intelligence OR machine learning OR deep learning OR neural networks OR GPT OR ChatGPT OR Claude OR Gemini OR LLM OR generative AI OR transformer OR multimodal AI OR AI agents'
  },
  {
    id: 'ai-business',
    name: 'AI Business & Industry',
    priority: 9,
    categories: ['artificial-intelligence', 'enterprise-software'],
    query: 'AI adoption OR AI transformation OR enterprise AI OR AI investment OR OpenAI OR Anthropic OR Google AI OR Microsoft AI OR NVIDIA AI OR AI ethics OR AI regulation'
  },
  {
    id: 'cloud-infrastructure',
    name: 'Cloud & Infrastructure',
    priority: 8,
    categories: ['cloud-computing'],
    query: 'cloud computing OR AWS OR Azure OR Google Cloud OR serverless OR Kubernetes OR Docker OR containers OR microservices OR cloud native OR DevOps OR CI/CD'
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity & Threats',
    priority: 9,
    categories: ['cybersecurity'],
    query: 'cybersecurity OR data breach OR ransomware OR phishing OR malware OR zero trust OR threat intelligence OR vulnerability OR SIEM OR EDR OR penetration testing OR AI security'
  },
  {
    id: 'fintech-payments',
    name: 'Fintech & Digital Payments',
    priority: 8,
    categories: ['fintech', 'blockchain-crypto'],
    query: 'fintech OR digital banking OR neobank OR open banking OR digital payments OR BNPL OR cryptocurrency OR Bitcoin OR Ethereum OR blockchain OR DeFi OR Web3 OR robo-advisor'
  },
  {
    id: 'startup-funding',
    name: 'Startups & Venture Capital',
    priority: 7,
    categories: ['startup-venture'],
    query: 'startup funding OR venture capital OR Series A OR Series B OR IPO OR unicorn OR tech acquisition OR valuation OR angel investor OR seed funding OR Y Combinator'
  },
  {
    id: 'data-analytics',
    name: 'Data Science & Analytics',
    priority: 7,
    categories: ['data-science'],
    query: 'big data OR data science OR data analytics OR business intelligence OR data visualization OR Snowflake OR Databricks OR data engineering OR data pipeline OR MLOps'
  },
  {
    id: 'enterprise-saas',
    name: 'Enterprise SaaS',
    priority: 7,
    categories: ['enterprise-software'],
    query: 'enterprise software OR SaaS OR CRM OR ERP OR collaboration software OR productivity tools OR Salesforce OR Microsoft 365 OR digital transformation OR workflow automation'
  },
  {
    id: 'emerging-tech',
    name: 'Emerging Technologies',
    priority: 6,
    categories: ['quantum-computing', 'augmented-reality', 'iot-edge'],
    query: 'quantum computing OR augmented reality OR virtual reality OR metaverse OR IoT OR edge computing OR robotics OR autonomous vehicle OR brain-computer interface'
  },
  {
    id: 'tech-giants',
    name: 'Tech Giants',
    priority: 8,
    categories: ['artificial-intelligence', 'cloud-computing'],
    query: 'Google OR Microsoft OR Amazon OR Apple OR Meta OR Tesla OR NVIDIA OR tech earnings OR product launch OR partnership OR acquisition'
  }
]

// Get a balanced mix of search queries
export function getSearchQueries(maxQueries: number = 3): SearchQuery[] {
  return SEARCH_QUERIES
    .sort((a, b) => b.priority - a.priority)
    .slice(0, maxQueries)
}

// Get queries by category
export function getQueriesByCategory(categoryId: string): SearchQuery[] {
  return SEARCH_QUERIES.filter(query => 
    query.categories.includes(categoryId)
  )
}

// Rotate queries for diverse content
export function getRotatedQuery(): SearchQuery {
  const now = new Date()
  const hourOfDay = now.getHours()
  const dayOfWeek = now.getDay()
  const index = (hourOfDay + dayOfWeek) % SEARCH_QUERIES.length
  return SEARCH_QUERIES[index]
}
