import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Scholarship from './models/Scholarship.js';

dotenv.config();

const baseScholarships = [
  // 1. Government Scholarships (NSP, INSPIRE, PMSS, PM Yasasvi, Pragati, Saksham, etc.)
  {
    title: 'National Merit Scholarship Scheme',
    provider: 'Ministry of Education, Govt. of India',
    description: 'Financial assistance to meritorious students from low-income families to meet a part of their day-to-day expenses while pursuing higher studies.',
    category: 'General',
    educationLevel: 'Undergraduate',
    stateEligibility: 'All',
    officialWebsite: 'https://scholarships.gov.in/',
    applicationUrl: 'https://scholarships.gov.in/fresh/newRegister',
    benefits: '₹12,000 per annum for pursuing higher education.',
    applicationMode: 'Online'
  },
  {
    title: 'Post Matric Scholarship for OBC Students',
    provider: 'Ministry of Social Justice and Empowerment',
    description: 'Providing financial assistance to OBC students studying at post-matriculation or post-secondary stages to enable them to complete their education.',
    category: 'OBC',
    educationLevel: 'Undergraduate',
    stateEligibility: 'All',
    officialWebsite: 'https://scholarships.gov.in/',
    applicationUrl: 'https://scholarships.gov.in/fresh/newRegister',
    benefits: '₹18,000 per annum for academic expenses.',
    applicationMode: 'Online'
  },
  {
    title: 'INSPIRE Scholarship for Higher Education (SHE)',
    provider: 'Department of Science and Technology, Govt. of India',
    description: 'Offering scholarships for pursuing Bachelor and Masters level courses in Natural and Basic Sciences to attract talented youth.',
    category: 'General',
    educationLevel: 'Science',
    stateEligibility: 'All',
    officialWebsite: 'https://online-inspire.gov.in/',
    applicationUrl: 'https://online-inspire.gov.in/Account/Register',
    benefits: 'Stipend of ₹80,000 per annum to pursue natural sciences degrees.',
    applicationMode: 'Online'
  },
  {
    title: 'Central Sector Scheme of Scholarship for College Students',
    provider: 'Ministry of Human Resource Development',
    description: 'Financial support for undergraduate and postgraduate university students who fall under the low-income threshold.',
    category: 'EWS',
    educationLevel: 'Undergraduate',
    stateEligibility: 'All',
    officialWebsite: 'https://scholarships.gov.in/',
    applicationUrl: 'https://scholarships.gov.in/fresh/newRegister',
    benefits: '₹20,000 per annum for academic support.',
    applicationMode: 'Online'
  },
  {
    title: 'PM Yasasvi Scholarship Scheme',
    provider: 'Ministry of Social Justice and Empowerment, Govt. of India',
    description: 'Providing high-quality education scholarships for OBC, EBC, and DNT students.',
    category: 'OBC',
    educationLevel: 'Intermediate',
    stateEligibility: 'All',
    officialWebsite: 'https://yet.nta.ac.in/',
    applicationUrl: 'https://yet.nta.ac.in/',
    benefits: 'Full tuition fee reimbursement and residential education allowance.',
    applicationMode: 'Online'
  },
  {
    title: 'AICTE Pragati Scholarship for Girls',
    provider: 'All India Council for Technical Education',
    description: 'Empowering female technical education by supporting girls in technical degrees or diploma programs.',
    category: 'Girls',
    educationLevel: 'B.Tech',
    stateEligibility: 'All',
    officialWebsite: 'https://www.aicte-india.org/',
    applicationUrl: 'https://www.aicte-india.org/schemes/students-development-schemes/pragati-scholarship-scheme',
    benefits: '₹50,000 per annum for tuition fees, computer purchase, and other incidentals.',
    applicationMode: 'Online'
  },
  {
    title: 'AICTE Saksham Scholarship for Specially Abled Students',
    provider: 'All India Council for Technical Education',
    description: 'Supporting specially-abled students pursuing professional courses at AICTE approved institutions.',
    category: 'Differently Abled',
    educationLevel: 'Diploma',
    stateEligibility: 'All',
    officialWebsite: 'https://www.aicte-india.org/',
    applicationUrl: 'https://www.aicte-india.org/schemes/students-development-schemes/saksham-scholarship-scheme',
    benefits: '₹50,000 per annum for college fee reimbursement and supportive aids.',
    applicationMode: 'Online'
  },
  {
    title: 'National Means-cum-Merit Scholarship',
    provider: 'Department of School Education and Literacy, Govt. of India',
    description: 'Targeted to reduce dropout rates among meritorious middle school students.',
    category: 'EWS',
    educationLevel: '10th',
    stateEligibility: 'All',
    officialWebsite: 'https://scholarships.gov.in/',
    applicationUrl: 'https://scholarships.gov.in/fresh/newRegister',
    benefits: '₹12,000 per annum from Class 9 to Class 12.',
    applicationMode: 'Online'
  },
  {
    title: "Prime Minister's Scholarship Scheme (PMSS)",
    provider: 'Welfare and Rehabilitation Board, Govt. of India',
    description: 'Encouraging higher professional education for the dependent wards of ex-servicemen.',
    category: 'General',
    educationLevel: 'Undergraduate',
    stateEligibility: 'All',
    officialWebsite: 'https://desw.gov.in/',
    applicationUrl: 'https://scholarships.gov.in/',
    benefits: '₹3,000 per month for girls and ₹2,500 per month for boys.',
    applicationMode: 'Online'
  },
  {
    title: 'Pre-Matric Scholarship for Minority Students',
    provider: 'Ministry of Minority Affairs, Govt. of India',
    description: 'Encouraging educational advancement among minority community students studying in classes 1 to 10.',
    category: 'Minority',
    educationLevel: '10th',
    stateEligibility: 'All',
    officialWebsite: 'https://scholarships.gov.in/',
    applicationUrl: 'https://scholarships.gov.in/fresh/newRegister',
    benefits: '₹1,000 to ₹5,000 per annum for tuition fees and maintenance.',
    applicationMode: 'Online'
  },

  // 2. Private Scholarships
  {
    title: 'Google Generation Scholarship',
    provider: 'Google',
    description: 'Supporting students who are pursuing computer science degrees and excel in technology and leadership.',
    category: 'Girls',
    educationLevel: 'B.Tech',
    stateEligibility: 'All',
    officialWebsite: 'https://buildyourfuture.withgoogle.com/scholarships',
    applicationUrl: 'https://buildyourfuture.withgoogle.com/scholarships/generation-google-scholarship-apac',
    benefits: 'US $1,000 award to help support academic tuition and expenses.',
    applicationMode: 'Online'
  },
  {
    title: 'Adobe India Women-in-Technology Scholarship',
    provider: 'Adobe India',
    description: 'Striving to bring gender diversity to tech industries by sponsoring female computer science and engineering undergraduates.',
    category: 'Girls',
    educationLevel: 'B.Tech',
    stateEligibility: 'All',
    officialWebsite: 'https://research.adobe.com/',
    applicationUrl: 'https://research.adobe.com/adobe-india-women-in-technology-scholarship/',
    benefits: 'Fully paid tuition, internship opportunity at Adobe India, and mentoring program.',
    applicationMode: 'Online'
  },
  {
    title: 'Tata Capital Pankh Scholarship',
    provider: 'Tata Capital',
    description: 'Financial support program targeting students in classes 11, 12, undergraduate, diploma, or polytechnic programs.',
    category: 'EWS',
    educationLevel: 'Diploma',
    stateEligibility: 'All',
    officialWebsite: 'https://www.tatacapital.com/',
    applicationUrl: 'https://www.buddy4study.com/page/the-tata-capital-pankh-scholarship-programme',
    benefits: 'Financial support covering up to 80% of tuition fees.',
    applicationMode: 'Online'
  },
  {
    title: 'HDFC Bank Parivartan Scholarship',
    provider: 'HDFC Bank',
    description: 'A flagship CSR initiative providing scholarships to meritorious students facing financial crises.',
    category: 'General',
    educationLevel: 'Undergraduate',
    stateEligibility: 'All',
    officialWebsite: 'https://www.hdfcbank.com/',
    applicationUrl: 'https://www.buddy4study.com/page/hdfc-bank-parivartans-ecss-scholarship',
    benefits: 'Up to ₹75,000 to cover tuition fees and academic expenses.',
    applicationMode: 'Online'
  },
  {
    title: 'Reliance Foundation Undergraduate Scholarship',
    provider: 'Reliance Foundation',
    description: 'Empowering young leaders of tomorrow to pursue high-quality undergraduate education in any stream.',
    category: 'General',
    educationLevel: 'Undergraduate',
    stateEligibility: 'All',
    officialWebsite: 'https://www.reliancefoundation.org/',
    applicationUrl: 'https://www.scholarships.reliancefoundation.org/',
    benefits: 'Up to ₹2,000,000 for undergraduate studies plus mentorship.',
    applicationMode: 'Online'
  },
  {
    title: 'Kotak Kanya Scholarship',
    provider: 'Kotak Education Foundation',
    description: 'Sponsoring female students from economically backward groups to pursue professional degree courses.',
    category: 'Girls',
    educationLevel: 'B.Tech',
    stateEligibility: 'All',
    officialWebsite: 'https://kotakeducation.org/',
    applicationUrl: 'https://kotakeducation.org/kotak-kanya-scholarship/',
    benefits: '₹1.5 Lakhs per year for professional undergraduate degrees.',
    applicationMode: 'Online'
  },
  {
    title: 'LIC Golden Jubilee Scholarship',
    provider: 'Life Insurance Corporation of India (LIC)',
    description: 'Aiming to support meritorious students from low-income families pursuing higher secondary or vocational education.',
    category: 'EWS',
    educationLevel: 'Diploma',
    stateEligibility: 'All',
    officialWebsite: 'https://licindia.in/',
    applicationUrl: 'https://licindia.in/web/guest/golden-jubilee-foundation',
    benefits: '₹20,000 per annum paid in monthly installments.',
    applicationMode: 'Online'
  },
  {
    title: 'ONGC Scholarship for SC/ST Students',
    provider: 'ONGC Foundation',
    description: 'Aiming to support meritorious SC/ST students pursuing professional courses in Engineering, MBA, Geology and Geophysics.',
    category: 'SC',
    educationLevel: 'B.Tech',
    stateEligibility: 'All',
    officialWebsite: 'https://www.ongcscholar.org/',
    applicationUrl: 'https://www.ongcscholar.org/ongc_scholar/apply_scholarship',
    benefits: '₹48,000 per annum to cover degree costs.',
    applicationMode: 'Online'
  },
  {
    title: 'Sitaram Jindal Scholarship Scheme',
    provider: 'Sitaram Jindal Foundation',
    description: 'Merit-cum-means scholarship for students in ITI, Diploma, Undergraduate, and Postgraduate programs.',
    category: 'General',
    educationLevel: 'ITI',
    stateEligibility: 'All',
    officialWebsite: 'https://www.sitaramjindalfoundation.org/',
    applicationUrl: 'https://www.sitaramjindalfoundation.org/scholarships-info.php',
    benefits: 'Monthly scholarship support ranging from ₹500 to ₹3,200.',
    applicationMode: 'Online'
  },
  {
    title: 'Siemens Scholarship Program',
    provider: 'Siemens India',
    description: 'Targeting first-year engineering students from Government colleges to support tech leadership.',
    category: 'General',
    educationLevel: 'B.Tech',
    stateEligibility: 'All',
    officialWebsite: 'https://www.siemens.co.in/',
    applicationUrl: 'https://www.siemens.co.in/about/siemens-scholarship-program.html',
    benefits: 'Tuition fees reimbursement, laptop support, and technical training.',
    applicationMode: 'Online'
  },
  {
    title: 'DXC Progressing Minds Scholarship',
    provider: 'DXC Technology',
    description: 'Sponsoring female and underprivileged students studying STEM/engineering degrees.',
    category: 'Girls',
    educationLevel: 'B.Tech',
    stateEligibility: 'All',
    officialWebsite: 'https://dxc.com/',
    applicationUrl: 'https://www.buddy4study.com/page/dxc-progressing-minds-scholarship',
    benefits: 'Stipend of ₹50,000 for course fee support.',
    applicationMode: 'Online'
  },
  {
    title: 'Keep India Smiling Foundational Scholarship',
    provider: 'Colgate-Palmolive India',
    description: 'Providing foundational support to students pursuing 11th, graduation, or vocational courses.',
    category: 'General',
    educationLevel: 'Intermediate',
    stateEligibility: 'All',
    officialWebsite: 'https://www.colgate.co.in/',
    applicationUrl: 'https://www.buddy4study.com/page/keep-india-smiling-foundational-scholarship-programme',
    benefits: '₹30,000 per annum for undergraduate courses.',
    applicationMode: 'Online'
  },
  {
    title: 'Santoor Scholarship for Girls',
    provider: 'Wipro Consumer Care & Lighting Group',
    description: 'Supporting female students in transitioning from high school to higher education.',
    category: 'Girls',
    educationLevel: 'Undergraduate',
    stateEligibility: 'Karnataka',
    officialWebsite: 'http://www.santoorscholarship.com/',
    applicationUrl: 'http://www.santoorscholarship.com/',
    benefits: '₹24,000 per annum for the duration of the undergraduate course.',
    applicationMode: 'Online'
  },
  {
    title: 'Foundation for Excellence Scholarship',
    provider: 'Foundation for Excellence (FFE)',
    description: 'Assisting exceptionally bright students from low income families pursuing degrees in Engineering, Technology, and Medicine.',
    category: 'EWS',
    educationLevel: 'Medical',
    stateEligibility: 'All',
    officialWebsite: 'https://ffe.org/',
    applicationUrl: 'https://ffe.org/apply/',
    benefits: '₹40,000 to ₹50,000 per year, mentorship, and training.',
    applicationMode: 'Online'
  },
  {
    title: "L'Oréal India For Young Women in Science Scholarship",
    provider: "L'Oreal India",
    description: 'Empowering young women who have passed Class 12 to pursue careers in science by providing financial support for college.',
    category: 'Girls',
    educationLevel: 'Science',
    stateEligibility: 'All',
    officialWebsite: 'https://www.loreal.com/',
    applicationUrl: 'https://www.buddy4study.com/page/loreal-india-for-young-women-in-science-scholarship',
    benefits: '₹250,000 for undergraduate studies in science subjects.',
    applicationMode: 'Online'
  },
  {
    title: 'Bharti Airtel Scholarship Scheme',
    provider: 'Bharti Foundation',
    description: 'Supporting tech-oriented undergraduate studies for students from economically weaker sections.',
    category: 'EWS',
    educationLevel: 'B.Tech',
    stateEligibility: 'All',
    officialWebsite: 'https://bhartifoundation.org/',
    applicationUrl: 'https://bhartifoundation.org/apply-scholarship/',
    benefits: 'Tuition and hostel allowance coverage.',
    applicationMode: 'Online'
  },

  // 3. International Scholarships
  {
    title: 'Fulbright-Nehru Master Fellowships',
    provider: 'United States-India Educational Foundation (USIEF)',
    description: 'Highly prestigious fellowships for outstanding Indians to pursue master degrees at selected US colleges.',
    category: 'General',
    educationLevel: 'Postgraduate',
    stateEligibility: 'All',
    officialWebsite: 'https://www.usief.org.in/',
    applicationUrl: 'https://www.usief.org.in/Fulbright-Nehru-Master-Fellowships.aspx',
    benefits: 'J-1 visa support, full tuition funding, living allowance, and health insurance.',
    applicationMode: 'Online'
  },
  {
    title: 'Chevening Scholarship Program',
    provider: 'Government of United Kingdom',
    description: 'The UK Government’s global scholarship program offering future leaders the opportunity to study a Master program in the UK.',
    category: 'General',
    educationLevel: 'Postgraduate',
    stateEligibility: 'All',
    officialWebsite: 'https://www.chevening.org/',
    applicationUrl: 'https://www.chevening.org/apply/',
    benefits: 'Fully funded tuition fees, monthly living allowance, and return flights to the UK.',
    applicationMode: 'Online'
  },
  {
    title: 'Commonwealth Master Scholarships',
    provider: 'Commonwealth Scholarship Commission (CSC)',
    description: 'Targeted to support talented individuals from commonwealth countries to pursue postgraduate studies in the UK.',
    category: 'General',
    educationLevel: 'Postgraduate',
    stateEligibility: 'All',
    officialWebsite: 'https://cscuk.fcdo.gov.in/',
    applicationUrl: 'https://cscuk.fcdo.gov.in/about-us/scholarships-and-fellowships/',
    benefits: 'Approved airfare, full tuition fee cover, stipend of £1,300 per month.',
    applicationMode: 'Online'
  },
  {
    title: 'Erasmus Mundus Joint Master Degrees',
    provider: 'European Commission',
    description: 'Prestigious, integrated international study programs jointly delivered by an international consortium of higher education institutions.',
    category: 'General',
    educationLevel: 'Postgraduate',
    stateEligibility: 'All',
    officialWebsite: 'https://erasmus-plus.ec.europa.eu/',
    applicationUrl: 'https://erasmus-plus.ec.europa.eu/opportunities/opportunities-for-individuals/students/erasmus-mundus-joint-masters',
    benefits: 'Full cost coverage including travel, installation, visa, and living allowance.',
    applicationMode: 'Online'
  },
  {
    title: 'DAAD Scholarships for Postgraduate Courses',
    provider: 'German Academic Exchange Service (DAAD)',
    description: 'Scholarships for international students to pursue Master or PhD degrees at state-recognized German universities.',
    category: 'General',
    educationLevel: 'Postgraduate',
    stateEligibility: 'All',
    officialWebsite: 'https://www.daad.de/en/',
    applicationUrl: 'https://www.daad.de/en/study-and-research-in-germany/scholarships/',
    benefits: 'Stipend of €934 per month for graduates, insurance cover, and travel expenses.',
    applicationMode: 'Online'
  },
  {
    title: 'Gates Cambridge Scholarship',
    provider: 'Bill & Melinda Gates Foundation',
    description: 'Offering fully funded scholarships for postgraduate degrees at the University of Cambridge for students from outside the UK.',
    category: 'General',
    educationLevel: 'Postgraduate',
    stateEligibility: 'All',
    officialWebsite: 'https://www.gatescambridge.org/',
    applicationUrl: 'https://www.gatescambridge.org/apply/how-to-apply/',
    benefits: 'Full cost of studying at Cambridge, maintenance allowance, and travel allowance.',
    applicationMode: 'Online'
  },
  {
    title: 'Rhodes Scholarship at Oxford University',
    provider: 'Rhodes Trust',
    description: 'The oldest and perhaps most prestigious international scholarship program, enabling outstanding young people to study at Oxford.',
    category: 'General',
    educationLevel: 'PhD',
    stateEligibility: 'All',
    officialWebsite: 'https://www.rhodeshouse.ox.ac.uk/',
    applicationUrl: 'https://www.rhodeshouse.ox.ac.uk/scholarships/apply/',
    benefits: 'Oxford University fees cover and stipend of £19,000 per year.',
    applicationMode: 'Online'
  },

  // 4. Specific Andhra Pradesh Scholarships (13 Schemes)
  {
    title: 'Jagananna Vidya Deevena',
    provider: 'Government of Andhra Pradesh',
    description: 'Provides full tuition fee reimbursement for students pursuing higher education courses like B.Tech, MBA, MCA, and general Degree.',
    category: 'General',
    educationLevel: 'B.Tech',
    stateEligibility: 'Andhra Pradesh',
    amount: 45000,
    deadline: new Date('2026-11-30'),
    benefits: 'Full tuition fee reimbursement credited directly to the college account.',
    requiredDocuments: ['Aadhaar Card', 'Income Certificate', 'College Admission Fee Receipt', 'Previous Marksheets'],
    officialWebsite: 'https://jnanabhumi.ap.gov.in/',
    applicationUrl: 'https://jnanabhumi.ap.gov.in/',
    applicationMode: 'Online'
  },
  {
    title: 'Jagananna Vasathi Deevena',
    provider: 'Government of Andhra Pradesh',
    description: 'Provides boarding and lodging charges to students pursuing ITI, Polytechnic, Degree, and professional courses.',
    category: 'General',
    educationLevel: 'Diploma',
    stateEligibility: 'Andhra Pradesh',
    amount: 20000,
    deadline: new Date('2026-11-30'),
    benefits: 'Boarding and lodging support of up to ₹20,000 per annum paid in two installments.',
    requiredDocuments: ['Aadhaar Card', 'Income Certificate', 'Hostel Admission Certificate', 'Bank Passbook Details'],
    officialWebsite: 'https://jnanabhumi.ap.gov.in/',
    applicationUrl: 'https://jnanabhumi.ap.gov.in/',
    applicationMode: 'Online'
  },
  {
    title: 'Post Matric Scholarship (AP)',
    provider: 'Social Welfare Department, Andhra Pradesh',
    description: 'Financial aid for students belonging to SC, ST, BC, EBC, Minority, and Kapu categories pursuing post-matric courses.',
    category: 'General',
    educationLevel: 'Undergraduate',
    stateEligibility: 'Andhra Pradesh',
    amount: 15000,
    deadline: new Date('2026-12-15'),
    benefits: 'Reimbursement of tuition and maintenance fee.',
    requiredDocuments: ['Income Certificate', 'Caste Certificate', 'Previous Year Marksheet', 'Domicile Proof'],
    officialWebsite: 'https://jnanabhumi.ap.gov.in/',
    applicationUrl: 'https://jnanabhumi.ap.gov.in/',
    applicationMode: 'Online'
  },
  {
    title: 'Pre Matric Scholarship (AP)',
    provider: 'Social Welfare Department, Andhra Pradesh',
    description: 'Stipend support for school students in classes 5 to 10 to encourage school retention and reduce dropouts.',
    category: 'SC',
    educationLevel: '10th',
    stateEligibility: 'Andhra Pradesh',
    amount: 5000,
    deadline: new Date('2026-10-31'),
    benefits: 'Yearly stipend of ₹5,000 and free textbook supplies.',
    requiredDocuments: ['Aadhaar Card', 'Study Certificate', 'Caste Certificate', 'Bank Account Details'],
    officialWebsite: 'https://jnanabhumi.ap.gov.in/',
    applicationUrl: 'https://jnanabhumi.ap.gov.in/',
    applicationMode: 'Online'
  },
  {
    title: 'YSR Vidyonnathi Scheme',
    provider: 'Backward Classes Welfare Department, Andhra Pradesh',
    description: 'Financial support to sponsored candidates for coaching for Civil Services Examinations.',
    category: 'OBC',
    educationLevel: 'Postgraduate',
    stateEligibility: 'Andhra Pradesh',
    amount: 130000,
    deadline: new Date('2026-08-31'),
    benefits: 'Full coaching fee sponsorship and monthly stipend of ₹10,000 for residential boarding.',
    requiredDocuments: ['Degree Marksheet', 'Caste Certificate', 'Income Certificate', 'Civil Services Prelims Admit Card'],
    officialWebsite: 'https://apcfss.in/',
    applicationUrl: 'https://jnanabhumi.ap.gov.in/',
    applicationMode: 'Online'
  },
  {
    title: 'AP Brahmin Welfare Scholarship',
    provider: 'Andhra Pradesh Brahmin Welfare Corporation',
    description: 'Providing educational financial aid to meritorious students of Brahmin community under Bharati Scheme.',
    category: 'General',
    educationLevel: 'Undergraduate',
    stateEligibility: 'Andhra Pradesh',
    amount: 20000,
    deadline: new Date('2026-09-30'),
    benefits: 'One-time educational financial grant of up to ₹20,000.',
    requiredDocuments: ['Brahmin Community Certificate', 'Income Certificate', 'Aadhaar Card', 'Academic Transcript'],
    officialWebsite: 'https://www.andhrabrahmin.ap.gov.in/',
    applicationUrl: 'https://www.andhrabrahmin.ap.gov.in/',
    applicationMode: 'Online'
  },
  {
    title: 'AP Minority Scholarship',
    provider: 'Minority Welfare Department, Andhra Pradesh',
    description: 'Stipend and fee concessions for minority students enrolled in undergraduate and postgraduate programs in AP.',
    category: 'Minority',
    educationLevel: 'Undergraduate',
    stateEligibility: 'Andhra Pradesh',
    amount: 15000,
    deadline: new Date('2026-11-15'),
    benefits: '₹15,000 yearly maintenance fee support.',
    requiredDocuments: ['Minority Declaration Certificate', 'Income Certificate', 'Bonafide Certificate'],
    officialWebsite: 'https://jnanabhumi.ap.gov.in/',
    applicationUrl: 'https://jnanabhumi.ap.gov.in/',
    applicationMode: 'Online'
  },
  {
    title: 'AP Kapu Nestham Educational Assistance',
    provider: 'Kapu Welfare and Development Corporation, AP',
    description: 'Sponsoring higher education tuition fees and living expenses for Kapu, Balija, Ontari, and Telaga community students.',
    category: 'OBC',
    educationLevel: 'Undergraduate',
    stateEligibility: 'Andhra Pradesh',
    amount: 35000,
    deadline: new Date('2026-10-15'),
    benefits: 'Yearly stipend of ₹35,000 paid to student accounts.',
    requiredDocuments: ['Kapu Caste Certificate', 'Income Certificate', 'College ID Card', 'Aadhaar Card'],
    officialWebsite: 'https://jnanabhumi.ap.gov.in/',
    applicationUrl: 'https://jnanabhumi.ap.gov.in/',
    applicationMode: 'Online'
  },
  {
    title: 'AP BC Welfare Scholarship',
    provider: 'Backward Classes Welfare Department, Andhra Pradesh',
    description: 'Dedicated financial aid program for students from Backward Classes studying in post-matriculation courses.',
    category: 'OBC',
    educationLevel: 'Undergraduate',
    stateEligibility: 'Andhra Pradesh',
    amount: 15000,
    deadline: new Date('2026-11-30'),
    benefits: 'Reimbursement of exam fees and partial hostel expenses.',
    requiredDocuments: ['BC Caste Certificate', 'Income Certificate', 'Aadhaar Card'],
    officialWebsite: 'https://jnanabhumi.ap.gov.in/',
    applicationUrl: 'https://jnanabhumi.ap.gov.in/',
    applicationMode: 'Online'
  },
  {
    title: 'AP SC Corporation Scholarship',
    provider: 'Andhra Pradesh SC Cooperative Finance Corporation',
    description: 'Providing funding and skill enhancement training grants to SC students pursuing professional degrees.',
    category: 'SC',
    educationLevel: 'Undergraduate',
    stateEligibility: 'Andhra Pradesh',
    amount: 40000,
    deadline: new Date('2026-11-20'),
    benefits: 'Stipend of ₹40,000 for training, laptop funding, and college support.',
    requiredDocuments: ['SC Caste Certificate', 'Income Certificate', 'Academic Transcript', 'Bank Details'],
    officialWebsite: 'https://apcfss.in/',
    applicationUrl: 'https://jnanabhumi.ap.gov.in/',
    applicationMode: 'Online'
  },
  {
    title: 'AP ST Welfare Scholarship',
    provider: 'Tribal Welfare Department, Andhra Pradesh',
    description: 'Dedicated educational development grant for ST candidates studying in high schools and colleges.',
    category: 'ST',
    educationLevel: 'Undergraduate',
    stateEligibility: 'Andhra Pradesh',
    amount: 25000,
    deadline: new Date('2026-11-25'),
    benefits: 'Maintenance allowance of ₹2,500 per month and tuition fee cover.',
    requiredDocuments: ['ST Caste Certificate', 'Income Proof', 'Bonafide Student Certificate'],
    officialWebsite: 'https://jnanabhumi.ap.gov.in/',
    applicationUrl: 'https://jnanabhumi.ap.gov.in/',
    applicationMode: 'Online'
  },
  {
    title: 'AP EBC Scholarship',
    provider: 'Social Welfare Department, Andhra Pradesh',
    description: 'Assisting students from Economically Backward Classes (EBC) who do not belong to SC/ST/BC categories.',
    category: 'EWS',
    educationLevel: 'Undergraduate',
    stateEligibility: 'Andhra Pradesh',
    amount: 20000,
    deadline: new Date('2026-11-30'),
    benefits: 'Yearly stipend of ₹20,000 for book purchases and hostel costs.',
    requiredDocuments: ['EWS Certificate', 'Income Certificate', 'Admission Proof'],
    officialWebsite: 'https://jnanabhumi.ap.gov.in/',
    applicationUrl: 'https://jnanabhumi.ap.gov.in/',
    applicationMode: 'Online'
  },
  {
    title: 'Dr. NTR Vaidya Seva Educational Assistance',
    provider: 'Dr. YSR Aarogyasri Health Care Trust, AP',
    description: 'Sponsoring educational tuition fees for medical, nursing, and dental students from low-income groups.',
    category: 'General',
    educationLevel: 'Medical',
    stateEligibility: 'Andhra Pradesh',
    amount: 60000,
    deadline: new Date('2026-10-31'),
    benefits: 'Full convenor quota tuition fee cover and medical training materials stipend.',
    requiredDocuments: ['NEET Admit Card & Score Card', 'Admission Letter', 'Income Certificate', 'Aadhaar Card'],
    officialWebsite: 'https://apcfss.in/',
    applicationUrl: 'https://jnanabhumi.ap.gov.in/',
    applicationMode: 'Online'
  },

  // 5. Specific Telangana Scholarships (12 Schemes)
  {
    title: 'Telangana ePASS Scholarship',
    provider: 'Department of Backward Classes Welfare, Telangana',
    description: 'Comprehensive online scholarship application and disbursement portal for Telangana students.',
    category: 'General',
    educationLevel: 'Undergraduate',
    stateEligibility: 'Telangana',
    amount: 20000,
    deadline: new Date('2026-11-30'),
    benefits: 'Direct credit of tuition fees and maintenance charges.',
    requiredDocuments: ['ePASS Application Form', 'Income Certificate', 'Caste Certificate', 'SSC Hall Ticket Number'],
    officialWebsite: 'https://telanganaepass.cgg.gov.in/',
    applicationUrl: 'https://telanganaepass.cgg.gov.in/',
    applicationMode: 'Online'
  },
  {
    title: 'Telangana Pre Matric Scholarship',
    provider: 'Scheduled Castes Development Department, Telangana',
    description: 'Encouraging education for students in class 9 and 10 belonging to SC/ST categories in Telangana.',
    category: 'SC',
    educationLevel: '10th',
    stateEligibility: 'Telangana',
    amount: 4500,
    deadline: new Date('2026-10-15'),
    benefits: 'Stipend of ₹4,500 per year and hostel boarding support.',
    requiredDocuments: ['Bonafide Certificate', 'Caste Certificate', 'Income Proof', 'Aadhaar Card'],
    officialWebsite: 'https://telanganaepass.cgg.gov.in/',
    applicationUrl: 'https://telanganaepass.cgg.gov.in/',
    applicationMode: 'Online'
  },
  {
    title: 'Telangana Post Matric Scholarship',
    provider: 'Social Welfare Department, Telangana',
    description: 'Disbursing academic fee assistance to SC, ST, BC, and EBC students enrolled in post-secondary degrees.',
    category: 'General',
    educationLevel: 'Undergraduate',
    stateEligibility: 'Telangana',
    amount: 18000,
    deadline: new Date('2026-12-10'),
    benefits: 'Maintenance fee (MTF) and tuition fee (RTF) reimbursements.',
    requiredDocuments: ['Caste Certificate', 'Income Certificate', 'Bonafide Certificate', 'Bank Passbook copy'],
    officialWebsite: 'https://telanganaepass.cgg.gov.in/',
    applicationUrl: 'https://telanganaepass.cgg.gov.in/',
    applicationMode: 'Online'
  },
  {
    title: 'Telangana BC Welfare Scholarship',
    provider: 'Backward Classes Welfare Department, Telangana',
    description: 'Financial support program targeting students belonging to Backward Classes and EBC in Telangana.',
    category: 'OBC',
    educationLevel: 'Undergraduate',
    stateEligibility: 'Telangana',
    amount: 12000,
    deadline: new Date('2026-11-30'),
    benefits: 'Reimbursement of tuition and examinations fees.',
    requiredDocuments: ['BC Caste Certificate', 'Income Certificate', 'Previous Year Marksheet'],
    officialWebsite: 'https://telanganaepass.cgg.gov.in/',
    applicationUrl: 'https://telanganaepass.cgg.gov.in/',
    applicationMode: 'Online'
  },
  {
    title: 'Telangana SC Welfare Scholarship',
    provider: 'Scheduled Castes Development Department, Telangana',
    description: 'Dedicated funding program to promote education and career growth for SC students in TS.',
    category: 'SC',
    educationLevel: 'Undergraduate',
    stateEligibility: 'Telangana',
    amount: 25000,
    deadline: new Date('2026-11-20'),
    benefits: 'Stipend of ₹2,500 per month for boarding, plus course fee covers.',
    requiredDocuments: ['SC Caste Certificate', 'Income Proof', 'College Bonafide'],
    officialWebsite: 'https://telanganaepass.cgg.gov.in/',
    applicationUrl: 'https://telanganaepass.cgg.gov.in/',
    applicationMode: 'Online'
  },
  {
    title: 'Telangana ST Welfare Scholarship',
    provider: 'Tribal Welfare Department, Telangana',
    description: 'Financial assistance and hostel accommodation aid for ST candidates studying higher courses in TS.',
    category: 'ST',
    educationLevel: 'Undergraduate',
    stateEligibility: 'Telangana',
    amount: 25000,
    deadline: new Date('2026-11-25'),
    benefits: 'Full fee reimbursement and textbook stipend.',
    requiredDocuments: ['ST Caste Certificate', 'Income Certificate', 'Admission Receipt'],
    officialWebsite: 'https://telanganaepass.cgg.gov.in/',
    applicationUrl: 'https://telanganaepass.cgg.gov.in/',
    applicationMode: 'Online'
  },
  {
    title: 'Telangana Minority Scholarship',
    provider: 'Minority Welfare Department, Telangana',
    description: 'Providing scholarships and fee reimbursements for minority students (Muslim, Christian, Sikh, etc.) in TS.',
    category: 'Minority',
    educationLevel: 'Undergraduate',
    stateEligibility: 'Telangana',
    amount: 15000,
    deadline: new Date('2026-11-15'),
    benefits: 'Reimbursement of tuition fees and monthly upkeep stipend.',
    requiredDocuments: ['Minority Declaration', 'Income Certificate', 'Aadhaar Card'],
    officialWebsite: 'https://telanganaepass.cgg.gov.in/',
    applicationUrl: 'https://telanganaepass.cgg.gov.in/',
    applicationMode: 'Online'
  },
  {
    title: 'Mahatma Jyotiba Phule Overseas Vidya Nidhi',
    provider: 'Backward Classes Welfare Department, Telangana',
    description: 'Providing financial assistance for BC and EBC students to pursue postgraduate and PhD studies abroad.',
    category: 'OBC',
    educationLevel: 'Postgraduate',
    stateEligibility: 'Telangana',
    amount: 2000000,
    deadline: new Date('2026-09-30'),
    benefits: 'One-time grant of ₹20 Lakhs for fees and living costs abroad, plus airfare support.',
    requiredDocuments: ['TOEFL/IELTS Score Card', 'GRE/GMAT Score Card', 'Foreign University Admission Letter', 'Income Certificate'],
    officialWebsite: 'https://telanganaepass.cgg.gov.in/',
    applicationUrl: 'https://telanganaepass.cgg.gov.in/',
    applicationMode: 'Online'
  },
  {
    title: 'Chief Minister Overseas Scholarship Scheme',
    provider: 'Minority Welfare Department, Telangana',
    description: 'Sponsoring higher studies abroad in US, UK, Australia, Canada, or Singapore for minority students.',
    category: 'Minority',
    educationLevel: 'Postgraduate',
    stateEligibility: 'Telangana',
    amount: 2000000,
    deadline: new Date('2026-09-30'),
    benefits: 'Financial grant of ₹20 Lakhs or actual fees whichever is less, and one-way economy airfare.',
    requiredDocuments: ['Foreign Admission Letter', 'GRE/TOEFL scorecard', 'Minority Community Proof', 'Income Proof'],
    officialWebsite: 'https://telanganaepass.cgg.gov.in/',
    applicationUrl: 'https://telanganaepass.cgg.gov.in/',
    applicationMode: 'Online'
  },
  {
    title: 'Telangana EBC Scholarship',
    provider: 'Social Welfare Department, Telangana',
    description: 'Fee reimbursement scheme for economically backward classes (other than SC/ST/BC/Minority).',
    category: 'EWS',
    educationLevel: 'Undergraduate',
    stateEligibility: 'Telangana',
    amount: 15000,
    deadline: new Date('2026-11-30'),
    benefits: 'Reimbursement of tuition and exam fees.',
    requiredDocuments: ['Income Certificate', 'EWS Certificate', 'Aadhaar Card'],
    officialWebsite: 'https://telanganaepass.cgg.gov.in/',
    applicationUrl: 'https://telanganaepass.cgg.gov.in/',
    applicationMode: 'Online'
  },
  {
    title: 'Telangana Disabled Welfare Scholarship',
    provider: 'Department for Disabled and Senior Citizens Welfare, Telangana',
    description: 'Special scholarship scheme to encourage students with disabilities to pursue academic and professional growth.',
    category: 'Differently Abled',
    educationLevel: 'Undergraduate',
    stateEligibility: 'Telangana',
    amount: 25000,
    deadline: new Date('2026-11-30'),
    benefits: 'Stipend of ₹2,500 per month, reader allowances, and supportive device sponsorships.',
    requiredDocuments: ['Disability Certificate (SADAREM)', 'Income Certificate', 'Academic Records'],
    officialWebsite: 'https://telanganaepass.cgg.gov.in/',
    applicationUrl: 'https://telanganaepass.cgg.gov.in/',
    applicationMode: 'Online'
  },
  {
    title: 'Telangana Residential Educational Institutions Scholarship',
    provider: 'Telangana Residential Educational Institutions Society (TREIS)',
    description: 'Providing scholarships and fully residential educational funding for students selected into TREIS colleges.',
    category: 'General',
    educationLevel: 'Intermediate',
    stateEligibility: 'Telangana',
    amount: 30000,
    deadline: new Date('2026-08-31'),
    benefits: 'Free boarding, lodging, uniform, books, and special education coaching.',
    requiredDocuments: ['TREIS Merit Rank Card', 'Caste Certificate', 'Income Certificate'],
    officialWebsite: 'https://telanganaepass.cgg.gov.in/',
    applicationUrl: 'https://telanganaepass.cgg.gov.in/',
    applicationMode: 'Online'
  }
];

// List of other Indian States and UTs (excluding AP and TS to avoid duplication)
const otherStatesAndUTs = [
  'Andaman and Nicobar Islands', 'Arunachal Pradesh', 'Assam', 'Bihar', 
  'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 
  'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 
  'Sikkim', 'Tamil Nadu', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

// Document lists to randomize
const documentTemplates = [
  ['Aadhaar Card', 'Income Certificate', 'Academic Marksheets'],
  ['Caste Certificate', 'Income Certificate', 'Fee Receipt', 'Admission Letter'],
  ['Marksheet of Qualifying Exam', 'Income Proof Certificate', 'Bonafide Student Certificate'],
  ['Caste Certificate', 'Income Certificate', 'Marksheet', 'Bank Account Passbook'],
  ['Fee Structure Sheet', 'College ID Card', 'Income Proof', 'Character Certificate'],
  ['GitHub Portfolio Link', 'Letter of Recommendation', 'College ID', 'Academic Transcripts'],
  ['Sports Achievement Certificate', 'Medical Fitness Certificate', 'College Bonafide'],
  ['Disability Certificate (40%+)', 'Admission Letter', 'Income Proof Certificate'],
  ['Resume', 'Academic Transcripts', 'Recommendation Letter', 'Statement of Purpose'],
  ['Admit Card', 'Income Affidavit', 'Previous Year Marksheet', 'Domicile Proof']
];

// Categories to randomize
const categories = ['General', 'OBC', 'SC', 'ST', 'EWS', 'Minority', 'Girls', 'Differently Abled'];

// Education levels to cover
const educationLevels = [
  '10th', 'Intermediate', 'Diploma', 'Polytechnic', 'ITI', 'B.Tech', 'M.Tech', 'MBA', 'MCA', 
  'Medical', 'Nursing', 'Law', 'Arts', 'Science', 'Commerce', 'PhD'
];

// Helper to generate a random number within range
const getRandomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper to pick a random item from array
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Generate 100 scholarships by combining base seeds with generated ones
const generatedScholarships = [];

// First, push the predefined ones
baseScholarships.forEach(s => {
  // Use existing deadline/amount or randomize
  const randAmount = getRandomInRange(10, 30) * 1000;
  const deadlineDays = getRandomInRange(30, 180);
  const randDeadline = new Date();
  randDeadline.setDate(randDeadline.getDate() + deadlineDays);

  generatedScholarships.push({
    ...s,
    amount: s.amount || randAmount,
    scholarshipAmount: s.amount || randAmount,
    deadline: s.deadline || randDeadline,
    applicationDeadline: s.deadline || randDeadline,
    minimumCGPA: s.minimumCGPA || (getRandomInRange(50, 85) / 10),
    maximumIncome: s.maximumIncome || getRandomInRange(20, 150) * 10000,
    requiredDocuments: s.requiredDocuments || getRandomItem(documentTemplates),
    eligibilityCriteria: s.eligibility || `Must satisfy domicile and category qualifications for ${s.title}.`,
    eligibility: s.eligibility || `Must satisfy domicile and category qualifications for ${s.title}.`,
    status: s.status || getRandomItem(['Open', 'Open', 'Open', 'Closed'])
  });
});

// Pad with generated ones to hit exactly 100
let idx = 1;
while (generatedScholarships.length < 100) {
  const level = getRandomItem(educationLevels);
  const cat = getRandomItem(categories);
  const state = getRandomItem(otherStatesAndUTs);
  const amount = getRandomInRange(5, 50) * 5000;
  
  const deadlineDays = getRandomInRange(15, 200);
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + deadlineDays);

  const title = `${state} ${cat} Education Grant Scheme ${idx}`;
  const provider = `Department of Social Welfare, Govt. of ${state}`;
  const description = `Providing support to underprivileged students of class/level ${level} under the special ${cat} merit-based scholarship campaign to complete their higher education coursework.`;
  const benefits = `Stipend of ₹${amount.toLocaleString('en-IN')} per academic year for tuition, boarding, and textbook support.`;
  
  generatedScholarships.push({
    title,
    provider,
    description,
    category: cat,
    educationLevel: level,
    stateEligibility: state,
    state,
    amount,
    scholarshipAmount: amount,
    deadline,
    applicationDeadline: deadline,
    applicationMode: getRandomItem(['Online', 'Online', 'Offline']),
    officialWebsite: 'https://scholarships.gov.in/',
    applicationUrl: 'https://scholarships.gov.in/fresh/newRegister',
    requiredDocuments: getRandomItem(documentTemplates),
    benefits,
    minimumCGPA: getRandomInRange(50, 80) / 10,
    maximumIncome: getRandomInRange(15, 100) * 10000,
    eligibilityCriteria: `Domicile of ${state}, belonging to the ${cat} group, pursuing level ${level} with family income below threshold.`,
    eligibility: `Domicile of ${state}, belonging to the ${cat} group, pursuing level ${level} with family income below threshold.`,
    status: getRandomItem(['Open', 'Open', 'Open', 'Closed'])
  });
  idx++;
}

async function seedData() {
  try {
    console.log('Connecting to database...');
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/scholarai');
    console.log(`Connected to database: ${conn.connection.name}`);

    console.log('Clearing existing scholarships...');
    const deleteCount = await Scholarship.deleteMany({});
    console.log(`Cleared ${deleteCount.deletedCount} old scholarship records.`);

    console.log(`Seeding ${generatedScholarships.length} scholarship records...`);
    const inserted = await Scholarship.insertMany(generatedScholarships);
    console.log(`Successfully seeded ${inserted.length} scholarships into MongoDB.`);

    console.log('Closing database connection...');
    await mongoose.connection.close();
    console.log('Database seeding process completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Database seeding failed: ${error.message}`);
    process.exit(1);
  }
}

seedData();
