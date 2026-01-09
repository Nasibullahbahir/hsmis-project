// Mock company data
const companyData = {
  companies: [
    {
      id: 1,
      company_id: "COMP001",
      company_name: "Tech Solutions Inc",
      leader_name: "John Doe",
      phone: "+93700123456",
      company_type: "contract",
      TIN_number: "TIN123456789",
      licence_number: "LIC0012023",
      state: "active",
      registration_date: "2023-01-15",
      parachiz:{
        miniral_id:1,
        minaral:"zamarod",

        
      }
    },
    {
      id: 2,
      company_id: "COMP002",
      company_name: "Business Corp",
      leader_name: "Jane Smith",
      phone: "+93700123457",
      company_type: "khosh-kharid",
      TIN_number: "TIN987654321",
      licence_number: "LIC0022023",
      state: "inactive",
      registration_date: "2023-02-20",
    },
    {
      id: 3,
      company_id: "COMP003",
      company_name: "Innovation Labs",
      leader_name: "Mike Johnson",
      phone: "+93700123458",
      company_type: "process",
      TIN_number: "TIN456123789",
      licence_number: "LIC0032023",
      state: "active",
      registration_date: "2023-03-10",
    },
    {
      id: 4,
      company_id: "COMP004",
      company_name: "Global Enterprises",
      leader_name: "Sarah Wilson",
      phone: "+93700123459",
      company_type: "control",
      TIN_number: "TIN789456123",
      licence_number: "LIC0042023",
      state: "tamded",
      registration_date: "2023-04-05",
    },
  ],
  filters: {
    companyStates: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "tamded", label: "Tamded" },
    ],
  },
};

// ** Get all companies
export const getCompanies = () => {
  return companyData.companies;
};

// ** Get company by ID
export const getCompanyById = (id) => {
  return companyData.companies.find(
    (company) => company.id === id || company.company_id === id
  );
};

// ** Add new company
export const addCompany = (newCompanyData) => {
  const newCompany = {
    id: companyData.companies.length + 1,
    company_id: `COMP${String(companyData.companies.length + 1).padStart(
      3,
      "0"
    )}`,
    ...newCompanyData,
    registration_date:
      newCompanyData.registration_date ||
      new Date().toISOString().split("T")[0],
  };

  companyData.companies.push(newCompany);
  return [...companyData.companies];
};

// ** Update company
export const updateCompany = (companyId, updatedData) => {
  const companyIndex = companyData.companies.findIndex(
    (company) => company.company_id === companyId
  );

  if (companyIndex !== -1) {
    companyData.companies[companyIndex] = {
      ...companyData.companies[companyIndex],
      ...updatedData,
    };
  }

  return [...companyData.companies];
};

// ** Delete company
export const deleteCompany = (companyId) => {
  const filteredCompanies = companyData.companies.filter(
    (company) => company.company_id !== companyId && company.id !== companyId
  );
  companyData.companies = filteredCompanies;
  return [...filteredCompanies];
};

// ** Get filters
export const getCompanyFilters = () => {
  return companyData.filters;
};

export default companyData;
