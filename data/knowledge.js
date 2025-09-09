// data/knowledge.js
export const knowledge = [
  {
    id: "finops-lite",
    title: "FinOps Lite (CLI) — AWS cost analysis",
    url: "https://github.com/dianuhs/finops-lite",
    content:
      "FinOps Lite is a CLI that parses AWS Cost Explorer exports to surface spend by service, last-30-day totals, and CSV exports. It emphasizes tagging hygiene and quick savings insights like idle EC2, unattached EBS, and unused Elastic IPs. Ideal for finance-minded engineers who want a lightweight workflow.",
  },
  {
    id: "cloud-cost-guard",
    title: "Cloud Cost Guard — React dashboard",
    url: "https://guard.cloudandcapital.com/",
    content:
      "Cloud Cost Guard is a React dashboard prototype that visualizes AWS cost data (summary, products, findings) and talks to a FastAPI backend. The frontend targets Vercel; the backend targets Render with a custom domain and simple CORS. It showcases Diana’s approach to turning raw bills into decisions.",
  },
  {
    id: "watchdog",
    title: "Watchdog — AWS cost anomaly alerts",
    url: "https://guard.cloudandcapital.com/watchdog",
    content:
      "Watchdog is a lightweight cost anomaly alerting tool for AWS. It ingests daily Cost Explorer exports, flags spend spikes by service/account, and applies simple thresholds plus moving-average baselines. Designed to be easy to deploy and tune for finance-minded engineers.",
  },
  {
    id: "brand",
    title: "Cloud & Capital — portfolio",
    content:
      "Cloud & Capital blends finance clarity with cloud practicality. Lumen is the site’s AI guide for navigating FinOps projects, tools, and writing.",
  },
  {
    id: "stack",
    title: "Preferred stack & skills",
    content:
      "AWS cost analysis, tagging strategy, Cost Explorer exports, CSV tooling, and dashboards. Frontend: React/Next.js; Backend: FastAPI. Deployments: Vercel (frontend) and Render (backend). Comfortable with OpenAI APIs for retrieval-augmented assistants.",
  },
  {
    id: "services",
    title: "What Diana can help with",
    content:
      "FinOps foundations (visibility, allocation, optimization), cost reviews for AWS workloads, tagging plans, and lightweight dashboards for stakeholders. She focuses on clarity—helping teams agree on unit economics and cut waste without slowing teams down.",
  },
  {
    id: "contact",
    title: "Contact & availability",
    content:
      "For collaborations or roles, reach out via diana@cloudandcapital.com. Diana prioritizes remote roles with good work-life balance. Demos and write-ups are available upon request if a repo is private.",
  },
];

