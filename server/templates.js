// IT Services Communication & Proposal Templates for Aigentle

const templates = [
  {
    id: 'ai-discovery-followup',
    title: 'AI & Automation Discovery Follow-up',
    service: 'AI & Machine Learning Solutions',
    subject: 'Aigentle IT Services: Architecture & Next Steps for {{company_name}}',
    body: `Hi {{contact_person}},

Thank you for your time during our technical discovery session today regarding your AI and automation initiatives at {{company_name}}.

Based on our discussion, here is a quick summary of what we've mapped out:
• Primary Objective: Deploying enterprise-grade LLM / AI solutions to streamline business processes.
• Technology Stack: Custom RAG pipeline with high-throughput vector search, local/cloud LLM fallback, and enterprise-grade role-based access control.
• Proposed Scope: Discovery & Architecture Blueprint (Phase 1) followed by Production MVP Rollout (Phase 2).

We are preparing the detailed Statement of Work (SOW) with estimated milestones and deliverables. Would you be available for a 20-minute review call this {{preferred_day}} at 3:00 PM?

Best regards,

{{owner}}
Aigentle IT Services
https://aigentle.com`
  },
  {
    id: 'cloud-devops-audit',
    title: 'Cloud Architecture & DevOps Proposal',
    service: 'Cloud & DevOps Architecture',
    subject: 'Cloud Optimization & Infrastructure Modernization Plan for {{company_name}}',
    body: `Hi {{contact_person}},

Following up on our review of {{company_name}}'s current cloud infrastructure challenges.

Our DevOps and Cloud Engineering team at Aigentle has drafted an execution roadmap focused on:
1. High Availability: Multi-region Kubernetes cluster deployment with zero-downtime rolling upgrades.
2. Cost Optimization: Identifying reserved instance opportunities and autoscaling policies to reduce cloud spend by ~25-35%.
3. Security Hardening: Automated CI/CD pipelines with integrated static code analysis, vulnerability scanning, and secrets management.

Our initial estimate is {{deal_value}} with an estimated 6-8 week implementation cycle. 

Please let me know if you would like me to send over the formal technical proposal and SLA agreements.

Warm regards,

{{owner}}
Aigentle IT Services`
  },
  {
    id: 'custom-software-proposal',
    title: 'Custom Software MVP Proposal',
    service: 'Custom Software Development',
    subject: 'Custom Software Engineering Proposal for {{company_name}}',
    body: `Hello {{contact_person}},

It was great connecting with you regarding the custom software development requirements for {{company_name}}.

At Aigentle, we specialize in high-velocity agile engineering. For your project:
• Scope: Full-stack responsive web platform & robust REST/GraphQL APIs
• Security & Scale: SOC2 compliant architecture, automated database backups, and sub-100ms API response targets
• Delivery Milestones: Bi-weekly sprint demos with dedicated QA and product management oversight

Estimated investment: {{deal_value}}.

I'd be glad to walk you through our recent case studies and architectural recommendations. Let me know what time works best for you this week.

Sincerely,

{{owner}}
Aigentle IT Services`
  },
  {
    id: 'followup-reengagement',
    title: 'Warm Re-engagement / Inactive Lead Check-in',
    service: 'General Follow-up',
    subject: 'Checking in on {{company_name}}\'s IT initiatives',
    body: `Hi {{contact_person}},

I hope you\'re having a productive week!

I wanted to briefly circle back regarding the discussion we had around {{company_name}}\'s IT and technology goals.

We recently launched new enterprise accelerators for {{service}} that help reduce development time and cloud operational overhead significantly.

If this is still on your roadmap for this quarter, I\'d love to share a quick 5-minute overview of how we helped similar companies achieve 40%+ productivity gains.

Looking forward to hearing your thoughts!

Best,

{{owner}}
Aigentle IT Services`
  }
];

module.exports = { templates };
