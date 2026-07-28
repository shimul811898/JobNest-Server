import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/db';
import { getAuth } from './config/auth';
import authRoutes from './routes/authRoutes';
import jobRoutes from './routes/jobRoutes';
import applicationRoutes from './routes/applicationRoutes';
import statsRoutes from './routes/statsRoutes';
import adminRoutes from './routes/adminRoutes';
import User from './models/User';
import Job from './models/Job';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://job-nest-mauve-rho.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin', adminRoutes);

// Root welcome endpoint
app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to JobNest API Server', status: 'online', health: '/api/health' });
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'JobNest API is running' });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

// Auto-seed function
const autoSeed = async () => {
  try {
    // ALWAYS ensure the admin exists and has correct email/password
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = new User({
        name: 'Admin User',
        email: 'shimul181163@gmail.com',
        password: '12345678',
        role: 'admin',
        avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=6C5CE7&color=fff'
      });
      await admin.save();
      console.log('Seed: Created demo admin');
    } else if (admin.email !== 'shimul181163@gmail.com') {
      admin.email = 'shimul181163@gmail.com';
      admin.password = '12345678';
      await admin.save();
      console.log('Seed: Updated demo admin credentials');
    }

    const userCount = await User.countDocuments();
    if (userCount <= 1) { // 1 because admin already exists or was created
      console.log('Database has no other listings. Auto-seeding default data...');

      // Create or update demo seeker
      let demoUser = await User.findOne({ email: 'user@jobnest.com' });
      if (!demoUser) {
        demoUser = new User({
          name: 'John Doe',
          email: 'user@jobnest.com',
          password: 'User@123',
          role: 'user',
          avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=00D2D3&color=fff'
        });
        await demoUser.save();
      }

      console.log('Seed: Created demo users');

      // Default jobs array
      const defaultJobs = [
        {
          title: 'Senior React Developer',
          company: 'TechVista Solutions',
          shortDescription: 'Build scalable web applications using React and TypeScript in a fast-paced startup environment.',
          description: 'We are looking for a Senior React Developer to join our frontend team. You will be responsible for building and maintaining our flagship SaaS platform, implementing complex UI features, and mentoring junior developers. Our tech stack includes React, TypeScript, Next.js, and Tailwind CSS.',
          requirements: [
            '5+ years of professional React experience',
            'Strong TypeScript skills and state management (Zustand/Redux)',
            'Experience with Next.js and server-side rendering patterns',
            'Solid understanding of REST APIs, GraphQL, and async data fetching',
            'Familiarity with writing unit and integration tests'
          ],
          responsibilities: [
            'Build reusable components and front-end libraries for future use',
            'Optimize application performance for maximum speed and scalability',
            'Collaborate with UI/UX designers to translate designs into high-quality code',
            'Participate in code reviews and advocate for code quality standards',
            'Mentor junior team members and conduct tech sessions'
          ],
          location: 'San Francisco, CA',
          salary: { min: 130000, max: 180000, currency: 'USD' },
          category: 'Technology',
          type: 'Hybrid',
          experience: 'Senior',
          skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL'],
          benefits: ['Health Insurance', 'Stock Options', 'Remote Fridays', '401(k) Match', 'Learning Budget'],
          companyLogo: 'https://ui-avatars.com/api/?name=TechVista&background=6C5CE7&color=fff',
          applicationDeadline: new Date('2026-09-01'),
          postedBy: admin._id
        },
        {
          title: 'Data Scientist',
          company: 'DataMinds Analytics',
          shortDescription: 'Analyze large datasets and build ML models to drive business intelligence and strategic decisions.',
          description: 'Join our analytics team to extract insights from complex datasets. You will develop machine learning models, create data pipelines, and present findings to stakeholders to drive strategic decision-making.',
          requirements: [
            'MS or PhD in Statistics, Computer Science, or related quantitative field',
            'Proficiency in Python and R for data manipulation and modeling',
            'Hands-on experience with ML frameworks like TensorFlow or PyTorch',
            'Strong SQL skills and experience with big data tools (Spark/Hadoop)',
            'Data visualization expertise with Tableau or PowerBI'
          ],
          responsibilities: [
            'Develop predictive models to solve complex business problems',
            'Design, execute, and analyze A/B tests to optimize product features',
            'Build automated data pipelines to ingest and clean raw datasets',
            'Create interactive dashboards and reports for leadership teams',
            'Present research findings and data-driven insights to stakeholders'
          ],
          location: 'New York, NY',
          salary: { min: 120000, max: 170000, currency: 'USD' },
          category: 'Technology',
          type: 'Remote',
          experience: 'Mid Level',
          skills: ['Python', 'R', 'TensorFlow', 'SQL', 'Tableau'],
          benefits: ['Flexible Hours', 'Health Insurance', 'Conference Budget', 'Remote Work', 'Gym Membership'],
          companyLogo: 'https://ui-avatars.com/api/?name=DataMinds&background=00D2D3&color=fff',
          applicationDeadline: new Date('2026-08-20'),
          postedBy: admin._id
        },
        {
          title: 'UX/UI Designer',
          company: 'CreativeMinds Agency',
          shortDescription: 'Design beautiful, intuitive user interfaces for web and mobile applications across diverse industries.',
          description: 'We are seeking a talented UX/UI Designer to create exceptional digital experiences. You will work closely with product managers and engineers to design intuitive, beautiful interfaces that align with user needs and business goals.',
          requirements: [
            '3+ years of professional UX/UI design experience with a strong portfolio',
            'Proficiency in Figma, Adobe Creative Cloud (Illustrator, Photoshop, XD)',
            'Solid understanding of user-centered design principles and typography',
            'Experience in building and maintaining modern component-based design systems',
            'Ability to conduct user research, usability testing, and wireframing'
          ],
          responsibilities: [
            'Create low-to-high fidelity wireframes, prototypes, and user flows',
            'Conduct user research sessions and synthesize feedback into designs',
            'Collaborate with developers to ensure implementation matches design specs',
            'Maintain consistency across platforms using design systems',
            'Deliver final visual assets and design specifications for development'
          ],
          location: 'Austin, TX',
          salary: { min: 90000, max: 130000, currency: 'USD' },
          category: 'Design',
          type: 'Onsite',
          experience: 'Mid Level',
          skills: ['Figma', 'Adobe XD', 'Sketch', 'User Research', 'Prototyping'],
          benefits: ['Creative Environment', 'Health Insurance', 'Annual Retreat', 'Design Tools Budget', 'Flexible Schedule'],
          companyLogo: 'https://ui-avatars.com/api/?name=CreativeMinds&background=FD7272&color=fff',
          applicationDeadline: new Date('2026-08-15'),
          postedBy: admin._id
        },
        {
          title: 'Marketing Manager',
          company: 'GrowthPulse Digital',
          shortDescription: 'Lead digital marketing campaigns, manage brand strategy, and drive customer acquisition growth.',
          description: 'Drive our marketing strategy across digital channels. Lead a team of talented marketers, manage budgets, and develop creative campaigns that increase brand awareness and customer acquisition.',
          requirements: [
            '5+ years in digital marketing or brand management',
            'Proven track record with SEO/SEM, email marketing, and content strategies',
            'Data-driven mindset with proficiency in Google Analytics and marketing platforms',
            'Team leadership and budget management experience',
            'Excellent verbal and written communication skills'
          ],
          responsibilities: [
            'Develop and execute comprehensive marketing strategies',
            'Manage marketing budget and optimize acquisition costs',
            'Lead and mentor a team of 5+ digital marketers and content writers',
            'Analyze campaign performance and report monthly ROI to stakeholders',
            'Coordinate marketing efforts with product and sales departments'
          ],
          location: 'Chicago, IL',
          salary: { min: 95000, max: 140000, currency: 'USD' },
          category: 'Marketing',
          type: 'Hybrid',
          experience: 'Senior',
          skills: ['SEO', 'Google Ads', 'Content Marketing', 'Analytics', 'Social Media'],
          benefits: ['Performance Bonus', 'Health Insurance', 'Work from Home Tuesdays', 'Professional Development', 'Team Events'],
          companyLogo: 'https://ui-avatars.com/api/?name=GrowthPulse&background=6C5CE7&color=fff',
          applicationDeadline: new Date('2026-08-25'),
          postedBy: admin._id
        },
        {
          title: 'Financial Analyst',
          company: 'FinanceHub Corp',
          shortDescription: 'Provide financial analysis, forecasting, and strategic recommendations to support business growth.',
          description: 'Analyze financial data, create forecast models, and provide strategic recommendations to senior leadership. Support corporate budgeting, planning, and investment decisions.',
          requirements: [
            'Bachelor’s degree in Finance, Accounting, Economics, or related fields',
            'CFA progress or completion is highly preferred',
            '3+ years experience in corporate finance or banking',
            'Advanced Excel skills (macros, pivot tables, complex formulas)',
            'Knowledge of financial modeling and forecasting techniques'
          ],
          responsibilities: [
            'Build and update financial forecast models for business units',
            'Prepare quarterly performance reports and variance analysis',
            'Analyze market trends, competitor financials, and investment options',
            'Support M&A activities and corporate development processes',
            'Present reports and financial insights directly to the executive board'
          ],
          location: 'Boston, MA',
          salary: { min: 85000, max: 125000, currency: 'USD' },
          category: 'Finance',
          type: 'Onsite',
          experience: 'Mid Level',
          skills: ['Financial Modeling', 'Excel', 'Bloomberg', 'SQL', 'PowerBI'],
          benefits: ['Competitive Salary', 'Health Insurance', 'CFA Sponsorship', 'Annual Bonus', '401(k) Match'],
          companyLogo: 'https://ui-avatars.com/api/?name=FinanceHub&background=00D2D3&color=fff',
          applicationDeadline: new Date('2026-09-10'),
          postedBy: admin._id
        },
        {
          title: 'Registered Nurse (ICU)',
          company: 'HealthFirst Medical Center',
          shortDescription: 'Provide critical care nursing in a leading medical center with state-of-the-art facilities.',
          description: 'Join our ICU team to provide critical care to patients. Work with cutting-edge medical technology in a supportive, collaborative environment that values work-life balance and clinical excellence.',
          requirements: [
            'BSN degree from an accredited nursing program',
            'Active Registered Nurse (RN) license in the state',
            '2+ years of recent experience in an ICU or critical care unit',
            'BLS and ACLS certifications required',
            'Excellent clinical assessment and critical thinking skills'
          ],
          responsibilities: [
            'Provide continuous care and monitoring for critically ill patients',
            'Administer complex medications, treatments, and IV therapies',
            'Monitor and operate specialized equipment (ventilators, monitors)',
            'Collaborate with physicians and multidisciplinary teams',
            'Educate patients and families on status, treatment plans, and post-discharge care'
          ],
          location: 'Houston, TX',
          salary: { min: 75000, max: 105000, currency: 'USD' },
          category: 'Healthcare',
          type: 'Onsite',
          experience: 'Mid Level',
          skills: ['Critical Care', 'Patient Assessment', 'Electronic Health Records', 'Team Collaboration', 'Emergency Response'],
          benefits: ['Sign-on Bonus', 'Health Insurance', 'Tuition Reimbursement', 'Retirement Plan', 'Shift Differential'],
          companyLogo: 'https://ui-avatars.com/api/?name=HealthFirst&background=FD7272&color=fff',
          applicationDeadline: new Date('2026-08-30'),
          postedBy: admin._id
        },
        {
          title: 'DevOps Engineer',
          company: 'CloudScale Infrastructure',
          shortDescription: 'Design and manage cloud infrastructure, CI/CD pipelines, and deployment automation systems.',
          description: 'Build and maintain our cloud infrastructure. Implement CI/CD pipelines, manage Kubernetes clusters, automate deployment steps, and ensure 99.99% uptime for our global services.',
          requirements: [
            '4+ years of DevOps or Site Reliability engineering experience',
            'Expertise in cloud environments (AWS, GCP, or Azure)',
            'Proficiency in container orchestration using Kubernetes and Docker',
            'Hands-on Infrastructure as Code experience using Terraform',
            'Solid scripting skills in Bash, Python, or Go'
          ],
          responsibilities: [
            'Manage, monitor, and scale production cloud infrastructures',
            'Develop and optimize automated CI/CD deployment pipelines',
            'Troubleshoot platform issues and implement auto-healing systems',
            'Ensure security compliance and encryption controls are met',
            'Participate in on-call rotations to maintain system stability'
          ],
          location: 'Seattle, WA',
          salary: { min: 140000, max: 190000, currency: 'USD' },
          category: 'Engineering',
          type: 'Remote',
          experience: 'Senior',
          skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'Jenkins'],
          benefits: ['Full Remote', 'Stock Options', 'Health Insurance', 'Home Office Stipend', 'Unlimited PTO'],
          companyLogo: 'https://ui-avatars.com/api/?name=CloudScale&background=6C5CE7&color=fff',
          applicationDeadline: new Date('2026-09-15'),
          postedBy: admin._id
        },
        {
          title: 'Product Manager',
          company: 'InnovateTech Labs',
          shortDescription: 'Drive product strategy, roadmap execution, and cross-functional team alignment for SaaS products.',
          description: 'Lead product development from ideation to launch. Work closely with engineering, design, sales, and marketing teams to define, build, and deliver products that users love.',
          requirements: [
            '4+ years of product management experience on modern SaaS products',
            'Technical background (degree in CS or equivalent software industry experience)',
            'Data-driven decision making capabilities with product analytics tools',
            'Deep understanding of Agile/Scrum methodologies',
            'Outstanding communication and stakeholder management skills'
          ],
          responsibilities: [
            'Define product vision, strategy, and maintain key roadmap goals',
            'Manage and prioritize the product backlog and write clear user stories',
            'Conduct regular customer interviews and compile user research reports',
            'Analyze usage data, retention, and conversion metrics',
            'Coordinate with engineering, design, and marketing to launch updates'
          ],
          location: 'San Jose, CA',
          salary: { min: 135000, max: 175000, currency: 'USD' },
          category: 'Technology',
          type: 'Hybrid',
          experience: 'Senior',
          skills: ['Product Strategy', 'Agile', 'Data Analysis', 'Stakeholder Management', 'Roadmapping'],
          benefits: ['Health Insurance', 'Equity Options', 'Learning Budget', 'Flexible Hours', 'Catered Meals'],
          companyLogo: 'https://ui-avatars.com/api/?name=InnovateTech&background=00D2D3&color=fff',
          applicationDeadline: new Date('2026-09-05'),
          postedBy: admin._id
        },
        {
          title: 'Sales Executive',
          company: 'SalesForge Global',
          shortDescription: 'Drive enterprise sales growth, manage key accounts, and exceed quarterly revenue targets.',
          description: 'Join our enterprise sales team to drive B2B revenue growth. Manage a portfolio of key client accounts and build long-term relationships with C-suite executives.',
          requirements: [
            '5+ years of B2B enterprise software sales experience',
            'Consistent track record of exceeding quarterly and annual quotas',
            'Proficiency in Salesforce or similar modern CRM systems',
            'Strong negotiation, contract closure, and client relations skills',
            'Excellent presentation and communication skills'
          ],
          responsibilities: [
            'Identify, qualify, and close enterprise sales leads',
            'Prepare and deliver product demonstrations and commercial proposals',
            'Negotiate enterprise contract terms, licensing, and pricing agreements',
            'Maintain an active sales pipeline and forecast revenue accurately',
            'Work closely with customer success to ensure client retention'
          ],
          location: 'Denver, CO',
          salary: { min: 80000, max: 150000, currency: 'USD' },
          category: 'Sales',
          type: 'Hybrid',
          experience: 'Senior',
          skills: ['Enterprise Sales', 'Salesforce', 'Negotiation', 'Account Management', 'Presentation'],
          benefits: ['Uncapped Commission', 'Health Insurance', 'Presidents Club Trip', 'Car Allowance', 'Stock Options'],
          companyLogo: 'https://ui-avatars.com/api/?name=SalesForge&background=FD7272&color=fff',
          applicationDeadline: new Date('2026-08-28'),
          postedBy: admin._id
        },
        {
          title: 'Curriculum Developer',
          company: 'EduLearn Platform',
          shortDescription: 'Design engaging educational content and curriculum for K-12 online learning programs.',
          description: 'Create innovative curriculum and educational materials for our K-12 online learning platform. Design engaging, accessible content that makes virtual learning fun, interactive, and effective.',
          requirements: [
            'Master’s degree in Education, Curriculum Design, or related fields',
            '3+ years experience in digital curriculum development or classroom teaching',
            'Familiarity with LMS platforms (Canvas, Moodle) and instructional tech',
            'Understanding of pedagogy and modern learning standards',
            'Excellent content writing and research abilities'
          ],
          responsibilities: [
            'Design comprehensive course structures, syllabi, and lessons',
            'Write scripts, worksheets, interactive quiz modules, and guides',
            'Assess student learning outcomes and adapt curriculum based on data',
            'Collaborate with videographers and designers to produce visual content',
            'Stay updated on national educational standards and instructional design trends'
          ],
          location: 'Portland, OR',
          salary: { min: 70000, max: 100000, currency: 'USD' },
          category: 'Education',
          type: 'Remote',
          experience: 'Mid Level',
          skills: ['Curriculum Design', 'Content Creation', 'LMS Platforms', 'Assessment Design', 'Instructional Design'],
          benefits: ['Full Remote', 'Health Insurance', 'Summer Hours', 'Professional Development', 'Education Stipend'],
          companyLogo: 'https://ui-avatars.com/api/?name=EduLearn&background=6C5CE7&color=fff',
          applicationDeadline: new Date('2026-09-20'),
          postedBy: admin._id
        },
        {
          title: 'Corporate Lawyer',
          company: 'LegalEdge Associates',
          shortDescription: 'Handle corporate legal matters, contracts, mergers, and regulatory compliance for major clients.',
          description: 'Provide legal counsel on corporate matters, draft and review contracts, support merger and acquisition transactions, and ensure regulatory compliance for our premium enterprise clients.',
          requirements: [
            'Juris Doctor (JD) degree from an accredited law school',
            'Active state bar admission and in good standing',
            '5+ years of corporate law practice, preferably in-house or top-tier firm',
            'Experience in M&A transactions, corporate governance, and IP licensing',
            'Strong analytical, writing, and risk-management skills'
          ],
          responsibilities: [
            'Draft, review, and negotiate complex commercial contracts and agreements',
            'Advise company leadership and clients on regulatory compliance matters',
            'Manage legal due diligence for M&A and corporate transactions',
            'Assess corporate policies to mitigate risks and legal liabilities',
            'Liaise with external specialist counsel on litigation or patent matters'
          ],
          location: 'Washington, DC',
          salary: { min: 150000, max: 220000, currency: 'USD' },
          category: 'Legal',
          type: 'Onsite',
          experience: 'Senior',
          skills: ['Corporate Law', 'Contract Drafting', 'M&A', 'Compliance', 'Legal Research'],
          benefits: ['Health Insurance', 'Bar Dues Covered', 'Bonus Structure', 'CLE Budget', 'Partnership Track'],
          companyLogo: 'https://ui-avatars.com/api/?name=LegalEdge&background=00D2D3&color=fff',
          applicationDeadline: new Date('2026-09-12'),
          postedBy: admin._id
        },
        {
          title: 'Full Stack Developer',
          company: 'NexGen Software',
          shortDescription: 'Develop end-to-end web applications using modern JavaScript frameworks and cloud technologies.',
          description: 'Join our core engineering team to build scalable full-stack applications. You will work with React on the frontend, Node.js on the backend, and cloud services to deliver end-to-end features.',
          requirements: [
            '3+ years of professional full-stack development experience',
            'Proficiency in React.js and Node.js/Express.js',
            'Strong experience with database design (MongoDB and PostgreSQL)',
            'Experience deploying and managing applications on AWS or GCP',
            'Solid Git, CI/CD, and teamwork skills'
          ],
          responsibilities: [
            'Develop new user-facing interfaces and backend API routes',
            'Design optimized schema structures and write performant queries',
            'Write comprehensive unit and integration tests for APIs and UIs',
            'Deploy application updates and manage hosting settings',
            'Participate in sprint planning sessions and estimate task weights'
          ],
          location: 'Miami, FL',
          salary: { min: 100000, max: 145000, currency: 'USD' },
          category: 'Technology',
          type: 'Remote',
          experience: 'Mid Level',
          skills: ['React', 'Node.js', 'MongoDB', 'AWS', 'TypeScript'],
          benefits: ['Remote Work', 'Health Insurance', 'Stock Options', 'Learning Platform Access', 'Quarterly Bonus'],
          companyLogo: 'https://ui-avatars.com/api/?name=NexGen&background=FD7272&color=fff',
          applicationDeadline: new Date('2026-08-18'),
          postedBy: admin._id
        },
        {
          title: 'Graphic Designer',
          company: 'PixelPerfect Studio',
          shortDescription: 'Create stunning visual designs for brands, packaging, and digital media campaigns.',
          description: 'Design compelling visual content for various digital and physical media. Work on corporate branding projects, social media assets, print packaging, and digital advertising campaigns.',
          requirements: [
            '3+ years graphic design experience with a standout visual portfolio',
            'Expertise in Adobe Creative Suite (Photoshop, Illustrator, InDesign)',
            'Deep knowledge of typography, layouts, color theory, and prepress setups',
            'Ability to translate brand guidelines into original layouts',
            'Experience in motion graphics or video editing is a plus'
          ],
          responsibilities: [
            'Create and update cohesive brand identities for clients',
            'Design print brochures, marketing flyers, and packaging boxes',
            'Produce engaging graphics for social media channels and banners',
            'Collaborate with developers to prepare assets for web applications',
            'Maintain asset libraries and organize project archives'
          ],
          location: 'Los Angeles, CA',
          salary: { min: 70000, max: 105000, currency: 'USD' },
          category: 'Design',
          type: 'Hybrid',
          experience: 'Mid Level',
          skills: ['Adobe Photoshop', 'Illustrator', 'InDesign', 'Brand Design', 'Typography'],
          benefits: ['Creative Studio', 'Health Insurance', 'Design Conference Tickets', 'Flexible Hours', 'Art Supply Budget'],
          companyLogo: 'https://ui-avatars.com/api/?name=PixelPerfect&background=6C5CE7&color=fff',
          applicationDeadline: new Date('2026-09-08'),
          postedBy: admin._id
        },
        {
          title: 'Account Manager',
          company: 'BrightPath Consulting',
          shortDescription: 'Manage client relationships, ensure project delivery, and identify growth opportunities.',
          description: 'Build, maintain, and expand strong relationships with corporate clients. Coordinate deliverables across internal teams to ensure projects are delivered on time and exceed expectations.',
          requirements: [
            '3+ years account management or relationship management experience',
            'Prior experience in consulting or marketing agencies preferred',
            'Strong presentation, negotiation, and reporting skills',
            'Experience managing client project budgets',
            'Track record of building rapport and upselling key accounts'
          ],
          responsibilities: [
            'Act as the primary point of contact for corporate client accounts',
            'Coordinate with production teams to track project deliverables',
            'Identify upsell and expansion opportunities within client accounts',
            'Conduct regular business reviews and performance reporting sessions',
            'Quickly resolve client issues, escalations, and budget adjustments'
          ],
          location: 'Atlanta, GA',
          salary: { min: 75000, max: 110000, currency: 'USD' },
          category: 'Sales',
          type: 'Onsite',
          experience: 'Mid Level',
          skills: ['Account Management', 'Client Relations', 'Project Management', 'Presentation', 'Strategic Planning'],
          benefits: ['Health Insurance', 'Performance Bonus', 'Travel Opportunities', 'Professional Growth', '401(k)'],
          companyLogo: 'https://ui-avatars.com/api/?name=BrightPath&background=00D2D3&color=fff',
          applicationDeadline: new Date('2026-08-22'),
          postedBy: admin._id
        },
        {
          title: 'Machine Learning Engineer',
          company: 'NeuralNet AI',
          shortDescription: 'Build and deploy production ML systems for natural language processing and computer vision.',
          description: 'Design, build, and deploy machine learning models at scale. Work on NLP and computer vision challenges, build high-volume data pipelines, and optimize model performance on cloud nodes.',
          requirements: [
            'MS or PhD in Computer Science, Math, or equivalent field',
            'Deep understanding of ML, DL, neural networks, and mathematical algorithms',
            'Proven experience deploying ML models to production environments',
            'Mastery of Python and DL frameworks (PyTorch or TensorFlow)',
            'Familiarity with MLOps pipelines and cloud hosting'
          ],
          responsibilities: [
            'Design and train specialized ML architectures for NLP and vision',
            'Build scalable pipelines to preprocess massive training datasets',
            'Deploy and monitor models in production using Kubernetes',
            'Optimize model latency, memory usage, and throughput metrics',
            'Research and test state-of-the-art architectures and algorithms'
          ],
          location: 'Palo Alto, CA',
          salary: { min: 160000, max: 230000, currency: 'USD' },
          category: 'Technology',
          type: 'Hybrid',
          experience: 'Senior',
          skills: ['PyTorch', 'TensorFlow', 'Python', 'MLOps', 'NLP'],
          benefits: ['Top-tier Compensation', 'Research Time', 'GPU Cluster Access', 'Publication Support', 'Health Insurance'],
          companyLogo: 'https://ui-avatars.com/api/?name=NeuralNet&background=FD7272&color=fff',
          applicationDeadline: new Date('2026-09-25'),
          postedBy: admin._id
        },
        {
          title: 'HR Business Partner',
          company: 'PeopleFirst Solutions',
          shortDescription: 'Partner with business leaders to align HR strategies with organizational goals and culture.',
          description: 'Serve as a strategic Human Resources partner to organizational leaders. Drive talent acquisition, performance management, employee engagement, and development programs across the company.',
          requirements: [
            '5+ years of progressive HR experience, preferably in HRBP role',
            'SHRM-CP/SCP or PHR/SPHR certification highly preferred',
            'Strong business acumen and knowledge of labor laws',
            'Proven experience leading change management initiatives',
            'Exceptional interpersonal, active listening, and conflict resolution skills'
          ],
          responsibilities: [
            'Partner with business leaders to align talent structures with objectives',
            'Drive performance management, promotion, and review processes',
            'Oversee employee relations, investigations, and policy updates',
            'Implement professional development and manager training programs',
            'Analyze employee surveys and retention metrics to suggest improvements'
          ],
          location: 'Minneapolis, MN',
          salary: { min: 90000, max: 130000, currency: 'USD' },
          category: 'Other',
          type: 'Hybrid',
          experience: 'Senior',
          skills: ['Talent Management', 'Employee Relations', 'Change Management', 'HRIS', 'Leadership Development'],
          benefits: ['Health Insurance', 'Flexible Work', 'Professional Certifications', 'Wellness Program', 'Generous PTO'],
          companyLogo: 'https://ui-avatars.com/api/?name=PeopleFirst&background=6C5CE7&color=fff',
          applicationDeadline: new Date('2026-09-02'),
          postedBy: admin._id
        },
        {
          title: 'Cybersecurity Analyst',
          company: 'SecureShield Technologies',
          shortDescription: 'Protect enterprise systems through threat detection, vulnerability assessment, and incident response.',
          description: 'Monitor, audit, and protect our clients network infrastructure and information systems. Conduct detailed vulnerability tests, respond to incidents, and enforce security policies.',
          requirements: [
            '3+ years of professional cybersecurity experience',
            'Recognized security certifications (CISSP, Security+, CEH)',
            'Experience with SIEM, firewalls, threat detection, and packet filters',
            'Solid understanding of network routing protocols and encryption standards',
            'Experience participating in active security incident response'
          ],
          responsibilities: [
            'Monitor alerts and logs across security consoles and endpoints',
            'Conduct regular vulnerability scanning and penetration testing runs',
            'Coordinate and execute response workflows for active security incidents',
            'Deploy, configure, and maintain security monitoring tools',
            'Draft reports documenting security status and suggesting upgrades'
          ],
          location: 'Dallas, TX',
          salary: { min: 110000, max: 155000, currency: 'USD' },
          category: 'Technology',
          type: 'Remote',
          experience: 'Mid Level',
          skills: ['SIEM', 'Penetration Testing', 'Network Security', 'Incident Response', 'Compliance'],
          benefits: ['Remote Work', 'Certification Sponsorship', 'Health Insurance', 'Stock Options', 'Conference Budget'],
          companyLogo: 'https://ui-avatars.com/api/?name=SecureShield&background=00D2D3&color=fff',
          applicationDeadline: new Date('2026-09-18'),
          postedBy: admin._id
        },
        {
          title: 'Content Marketing Specialist',
          company: 'StoryBrand Media',
          shortDescription: 'Create compelling content strategies and produce engaging articles, videos, and social media posts.',
          description: 'Develop and execute content marketing plans. Write SEO-optimized blog posts, compile video scripts, coordinate social media calendars, and report on reader engagement metrics.',
          requirements: [
            '2+ years experience in content marketing, journalism, or copywriting',
            'Exceptional writing, proofreading, and storytelling abilities',
            'Deep understanding of SEO practices, keywords, and page optimization',
            'Experience managing professional social media channels (LinkedIn, Twitter, IG)',
            'Proficiency in using content management and web analytics systems'
          ],
          responsibilities: [
            'Write informative, engaging articles for the corporate blog and website',
            'Maintain the editorial content calendar and coordinates deadlines',
            'Produce copy and concepts for social media channels and campaigns',
            'Apply SEO best practices to all written copy to drive organic traffic',
            'Track monthly pageviews, click-through rates, and subscription conversions'
          ],
          location: 'Nashville, TN',
          salary: { min: 60000, max: 85000, currency: 'USD' },
          category: 'Marketing',
          type: 'Remote',
          experience: 'Entry Level',
          skills: ['Content Writing', 'SEO', 'Social Media', 'Google Analytics', 'Copywriting'],
          benefits: ['Remote Work', 'Health Insurance', 'Creative Freedom', 'Writing Workshops', 'Flexible Schedule'],
          companyLogo: 'https://ui-avatars.com/api/?name=StoryBrand&background=FD7272&color=fff',
          applicationDeadline: new Date('2026-08-12'),
          postedBy: admin._id
        },
        {
          title: 'Mechanical Engineer',
          company: 'PrecisionWorks Engineering',
          shortDescription: 'Design and develop mechanical systems, perform analysis, and oversee manufacturing processes.',
          description: 'Design mechanical components, structures, and systems using advanced CAD systems. Perform FEA/stress analyses, design custom prototypes, and work with manufacturing units to realize production.',
          requirements: [
            'Bachelor’s degree in Mechanical Engineering',
            '4+ years professional experience in mechanical design or CAD modeling',
            'High proficiency with SolidWorks, AutoCAD, or other CAD applications',
            'Experience executing Finite Element Analysis (FEA) and thermal runs',
            'Familiarity with manufacturing processes (CNC, injection molding, welding)'
          ],
          responsibilities: [
            'Create 3D models and manufacturing assembly drawings in SolidWorks',
            'Run stress, thermal, and material analysis simulations (FEA)',
            'Prepare comprehensive technical documentation and product specs',
            'Manage the assembly and testing of physical prototype concepts',
            'Coordinate with manufacturing teams to resolve factory Floor issues'
          ],
          location: 'Detroit, MI',
          salary: { min: 90000, max: 130000, currency: 'USD' },
          category: 'Engineering',
          type: 'Onsite',
          experience: 'Mid Level',
          skills: ['SolidWorks', 'AutoCAD', 'FEA', 'GD&T', '3D Printing'],
          benefits: ['Health Insurance', 'Engineer Certification Support', 'Relocation Assistance', 'Retirement Plan', 'Lab Access'],
          companyLogo: 'https://ui-avatars.com/api/?name=PrecisionWorks&background=6C5CE7&color=fff',
          applicationDeadline: new Date('2026-09-22'),
          postedBy: admin._id
        },
        {
          title: 'Pharmacy Manager',
          company: 'WellCare Pharmacies',
          shortDescription: 'Oversee pharmacy operations, ensure regulatory compliance, and lead a team of pharmacists.',
          description: 'Supervise daily retail pharmacy operations, enforce strict compliance with state and federal regulations, manage pharmacy technicians, and provide outstanding clinical guidance to patients.',
          requirements: [
            'Doctor of Pharmacy (PharmD) degree from an accredited university',
            'Active Pharmacist license in the state with no disciplinary actions',
            '3+ years of clinical pharmacy practice',
            'Prior pharmacy supervisor or management experience preferred',
            'High clinical knowledge and patient counseling capabilities'
          ],
          responsibilities: [
            'Manage pharmacy workflows, inventory, and staff rosters',
            'Supervise, train, and schedule pharmacists and technicians',
            'Ensure absolute compliance with FDA, DEA, and state regulations',
            'Review and verify prescriptions for dosage, safety, and interactions',
            'Provide detailed counseling to patients on medication usage and side effects'
          ],
          location: 'Philadelphia, PA',
          salary: { min: 120000, max: 160000, currency: 'USD' },
          category: 'Healthcare',
          type: 'Onsite',
          experience: 'Senior',
          skills: ['Pharmacy Management', 'Clinical Pharmacy', 'Regulatory Compliance', 'Team Leadership', 'Patient Care'],
          benefits: ['Health Insurance', 'CE Credits Covered', 'Retirement Plan', 'Sign-on Bonus', 'Paid Time Off'],
          companyLogo: 'https://ui-avatars.com/api/?name=WellCare&background=00D2D3&color=fff',
          applicationDeadline: new Date('2026-09-30'),
          postedBy: admin._id
        },
        {
          title: 'Junior Frontend Developer',
          company: 'WebCraft Studios',
          shortDescription: 'Build responsive websites and web applications as part of a collaborative development team.',
          description: 'Start your career building modern websites. Work alongside experienced developers to convert visual drafts into responsive HTML/CSS layouts, resolve interface bugs, and learn industry standards.',
          requirements: [
            '0-2 years of frontend coding experience',
            'High proficiency in HTML, CSS, JavaScript, and Git workflows',
            'Solid foundational knowledge of React.js and modern state managers',
            'Familiarity with writing clean, responsive, mobile-first styles',
            'Eager learner with strong communication and collaboration skills'
          ],
          responsibilities: [
            'Code and styles interfaces based on design blueprints',
            'Investigate, reproduce, and resolve client-side bugs and quirks',
            'Participate in developer sessions, brainstorms, and code reviews',
            'Maintain code code cleanly and collaborate via Git repository',
            'Integrate backend REST endpoints to capture and display data'
          ],
          location: 'Remote',
          salary: { min: 55000, max: 75000, currency: 'USD' },
          category: 'Technology',
          type: 'Remote',
          experience: 'Entry Level',
          skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Git'],
          benefits: ['Full Remote', 'Mentorship Program', 'Health Insurance', 'Learning Budget', 'Flexible Hours'],
          companyLogo: 'https://ui-avatars.com/api/?name=WebCraft&background=FD7272&color=fff',
          applicationDeadline: new Date('2026-08-10'),
          postedBy: admin._id
        },
        {
          title: 'Investment Banking Analyst',
          company: 'CapitalBridge Partners',
          shortDescription: 'Support deal execution, financial analysis, and client presentations in a top-tier investment bank.',
          description: 'Join our active investment banking division to support corporate deal creation and execution. Build valuation models, compile pitch books, and perform analysis for major M&A transactions.',
          requirements: [
            'Bachelor’s degree in Finance, Economics, or related quantitative field',
            '1-3 years investment banking internship or analyst experience',
            'Expert financial modeling capabilities (DCF, LBO, comparable analysis)',
            'Highly advanced PowerPoint layout and Excel formatting skills',
            'Outstanding work ethic, precision, and ability to work in high-pressure roles'
          ],
          responsibilities: [
            'Develop complex financial valuation and projection spreadsheets',
            'Build pitch presentations, industry reviews, and deal decks',
            'Perform detailed macroeconomic and industry sector research reports',
            'Coordinate data-room materials and reviews for active transactions',
            'Analyze financial statements to highlight trends and value insights'
          ],
          location: 'New York, NY',
          salary: { min: 100000, max: 150000, currency: 'USD' },
          category: 'Finance',
          type: 'Onsite',
          experience: 'Entry Level',
          skills: ['Financial Modeling', 'Valuation', 'Excel', 'PowerPoint', 'Industry Research'],
          benefits: ['Top Compensation', 'Health Insurance', 'Signing Bonus', 'Annual Bonus', 'Professional Development'],
          companyLogo: 'https://ui-avatars.com/api/?name=CapitalBridge&background=6C5CE7&color=fff',
          applicationDeadline: new Date('2026-08-15'),
          postedBy: admin._id
        },
        {
          title: 'Online Tutor - Mathematics',
          company: 'BrainBridge Education',
          shortDescription: 'Teach mathematics to students worldwide through interactive online tutoring sessions.',
          description: 'Provide personalized online math tutoring to students from middle school to early college level. Create supportive lesson notes, explain concepts clearly, and guide homework solutions.',
          requirements: [
            'Degree in Mathematics, Education, or related fields',
            'Prior experience as a teacher, tutor, or academic instructor',
            'Outstanding explanation and communication skills',
            'High comfort with virtual classrooms, screen shares, and writing tablets',
            'Patient, supportive, and adaptable approach to diverse learners'
          ],
          responsibilities: [
            'Conduct 1-on-1 virtual math lessons across scheduled shifts',
            'Write personalized curriculum notes and custom review questions',
            'Track and log weekly student progress reports and milestones',
            'Provide homework assistance, exam reviews, and test prep guidance',
            'Communicate periodically with parents regarding student progress'
          ],
          location: 'Remote',
          salary: { min: 45000, max: 70000, currency: 'USD' },
          category: 'Education',
          type: 'Remote',
          experience: 'Entry Level',
          skills: ['Mathematics', 'Online Teaching', 'Lesson Planning', 'Student Assessment', 'Communication'],
          benefits: ['Full Remote', 'Flexible Schedule', 'Health Insurance', 'Professional Development', 'Technology Provided'],
          companyLogo: 'https://ui-avatars.com/api/?name=BrainBridge&background=00D2D3&color=fff',
          applicationDeadline: new Date('2026-10-01'),
          postedBy: admin._id
        },
        {
          title: 'Chief Technology Officer',
          company: 'LaunchPad Ventures',
          shortDescription: 'Lead technology strategy and engineering teams for a fast-growing venture-backed startup.',
          description: 'Set the absolute technical vision and build infrastructure at our scaling startup. Lead and grow our engineering organization, make key architectural decisions, and build robust platforms.',
          requirements: [
            '10+ years professional experience in software engineering and design',
            '5+ years leading high-performance engineering teams',
            'Prior experience scaling technology setups in early-stage startups',
            'Deep system design, cloud architecture, and data engineering knowledge',
            'Strong business alignment, budgeting, and leadership skills'
          ],
          responsibilities: [
            'Establish and direct the technical roadmap and platform vision',
            'Recruit, train, mentor, and evaluate a world-class engineering team',
            'Finalize choices on frameworks, architecture patterns, and cloud platforms',
            'Oversee the technical budget, security compliance, and vendor licensing',
            'Report system status, development milestones, and product vision to executive board'
          ],
          location: 'San Francisco, CA',
          salary: { min: 200000, max: 300000, currency: 'USD' },
          category: 'Technology',
          type: 'Onsite',
          experience: 'Director',
          skills: ['Technical Leadership', 'System Architecture', 'Team Building', 'Strategic Planning', 'Cloud Infrastructure'],
          benefits: ['Equity Package', 'Health Insurance', 'Executive Compensation', 'Board Exposure', 'Unlimited PTO'],
          companyLogo: 'https://ui-avatars.com/api/?name=LaunchPad&background=FD7272&color=fff',
          applicationDeadline: new Date('2026-10-15'),
          postedBy: admin._id
        }
      ];

      await Job.create(defaultJobs);
      console.log(`Auto-seeded: Created ${defaultJobs.length} job listings.`);
      console.log('Demo Credentials Ready.');
    }
  } catch (error) {
    console.error('Auto-seeding failed:', error);
  }
};

// Connect DB on every request middleware for serverless
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

const dynamicImport = new Function('specifier', 'return import(specifier)');

// Better Auth route handler (lazy initialization after DB connection)
app.all('/api/auth/better/*', async (req, res, next) => {
  try {
    await connectDB();
    const { toNodeHandler } = await dynamicImport('better-auth/node');
    const auth = await getAuth();
    const handler = toNodeHandler(auth);
    return handler(req, res);
  } catch (error) {
    next(error);
  }
});

// Connect to DB and start server locally (not on Vercel)
if (!process.env.VERCEL) {
  connectDB().then(() => {
    autoSeed().then(() => {
      app.listen(PORT, () => {
        console.log(`\n🚀 JobNest API Server running on http://localhost:${PORT}`);
        console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
        console.log(`🔐 Better Auth: http://localhost:${PORT}/api/auth/better\n`);
      });
    });
  });
}

export default app;
