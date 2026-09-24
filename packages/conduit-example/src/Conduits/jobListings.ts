import { InfiniteNetworkConduit } from "@figliolia/conduit";

import { cache } from "./cache";

export const JobListingsConduit = new InfiniteNetworkConduit({
  cache,
  key: ["job-listings"],
  paginationArgs: ["cursor"],
  operation: (config: { search: string; cursor?: number }) => {
    // JobListings.fetch(config.search, config.cursor),
    const data = testData(config);
    return new Promise<ReturnType<typeof testData>>(resolve =>
      setTimeout(() => resolve(data), 1500),
    );
  },
});

function testData({ search, cursor }: { search: string; cursor?: number }) {
  return {
    jobs: Array.from({ length: 10 }, (_, i) => ({
      job_id: (cursor ?? 0) + i + 1,
      job_title: "Frontend Engineer",
      employer_name: "Amazon",
      job_description: `Amazon Leo is building a global e-commerce experience for Internet Service Provider (ISP) customers, and we need a Front End Engineer II to help us do it. You will work with React and Next.js to design, build, and ship features that serve customers worldwide. Many of these experiences are built from zero-to-one, so you will regularly move from ambiguous problem to working product. You will own the full software development lifecycle, collaborating with product, marketing, business, and backend engineering partners to deliver accessible, performant interfaces. If you enjoy working with AI-driven development workflows, picking up new frameworks quickly, and turning complex requirements into clean user experiences, this is the role for you.

Export Control Requirement

Due to applicable export control laws and regulations, candidates must be a U.S. citizen or national, U.S. permanent resident (i.e., current Green Card holder), or lawfully admitted into the U.S. as a refugee or granted asylum.

Key job responsibilities

 Design and build front-end features for the Amazon Leo e-commerce platform using React and Next.js, taking projects from concept through deployment and ongoing operation.
 Collaborate with product managers, UX designers, marketing, and backend commerce service teams to translate customer and business needs into accessible, scalable solutions that work across devices and browsers.
 Leverage agentic development workflows and generative AI tools to accelerate feature delivery, and identify opportunities to improve infrastructure using AWS native services.
 Participate actively in code reviews, providing constructive feedback to teammates while coaching others on front-end best practices, UI design patterns, and maintainable coding standards.
 Write clear documentation for your team's software and train new team members on how it is constructed, tested, and operated.

A day in the life

You might start your morning reviewing a pull request from a teammate, suggesting improvements to a React component's accessibility and performance. After standup, you pick up a new feature that doesn't have a clear precedent yet, sketching out an approach with your product manager before writing code. In the afternoon, you pair with a designer to refine interaction details for an upcoming launch, then dig into an operational metric that looks off, tracing it to a rendering edge case you fix before it reaches customers.

About The Team

We are part of the Leo Commerce engineering organization at Amazon, building the e-commerce experience for a global ISP customer base. Our team works closely with backend commerce services, product, marketing, and business partners to launch new experiences from scratch. We are scaling the team and investing in AI-based development and operational workflows to meet the growing needs of our customers. If you are looking for a place where you can grow your expertise by tackling new problems regularly alongside an inclusive group of engineers, we would be glad to have you.

Basic Qualifications

 2+ years of non-internship professional front end, web or mobile software development using JavaScript, HTML and CSS experience
 1+ years of computer science fundamentals (object-oriented design, data structures, algorithm design, problem solving and complexity analysis) experience
 Experience using JavaScript frameworks such as angular and react

Preferred Qualifications

 1+ years of agile software development methodology experience
 Experience with common front-end technologies such as HTML, CSS, JS, TypeScript, and Node

Amazon is an equal opportunity employer and does not discriminate on the basis of protected veteran status, disability, or other legally protected status.

Our inclusive culture empowers Amazonians to deliver the best results for our customers. If you have a disability and need a workplace accommodation or adjustment during the application and hiring process, including support for the interview or onboarding process, please visit https://amazon.jobs/content/en/how-we-hire/accommodations for more information. If the country/region you’re applying in isn’t listed, please contact your Recruiting Partner.

The base salary range for this position is listed below. Your Amazon package will include sign-on payments and restricted stock units (RSUs). Final compensation will be determined based on factors including experience, qualifications, and location. Amazon also offers comprehensive benefits including health insurance (medical, dental, vision, prescription, Basic Life & AD&D insurance and option for Supplemental life plans, EAP, Mental Health Support, Medical Advice Line, Flexible Spending Accounts, Adoption and Surrogacy Reimbursement coverage), 401(k) matching, paid time off, and parental leave. Learn more about our benefits at https://amazon.jobs/en/benefits.

USA, WA, Redmond - 143,700.00 - 194,400.00 USD annually`,
      employer_logo:
        "https://media.licdn.com/dms/image/v2/D560BAQGDLy4STCnHbg/company-logo_100_100/B56ZnZxDipI0AQ-/0/1760295142304/amazon_logo?e=1792022400&v=beta&t=RTNIh_t8k6PDTee3kWR1PYgJhWBIefYEqmmLsdL-RYY",
      job_city: "Mountain View",
      job_state: "CA",
      job_country: "United States",
      employer_website: "https://amazon.com",
      job_apply_link:
        "https://www.amazon.jobs/en/jobs/10528841/front-end-engineer-amazon-leo?cmpid=SPLICX0248M&ss=paid&utm_campaign=cxro&utm_content=job_posting&utm_medium=social_media&utm_source=linkedin.com",
    })).filter(job => {
      if (!search?.length) {
        return true;
      }
      const query = search.toLowerCase();
      for (const key in job) {
        const property = key as keyof typeof job;
        if (
          property in job &&
          typeof job[property] === "string" &&
          job[property].toLowerCase().includes(query)
        ) {
          return true;
        }
      }
      return false;
    }),
    cursor: (cursor ?? 0) + 10,
  };
}
