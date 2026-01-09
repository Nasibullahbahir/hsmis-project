let contracts = [
  {
    contractId: "CONT001",
    area: "Kabul",
    mineralAmount: "100",
    unitPrice: "50",
    mineralTotalPrice: "5000",
    royaltyReceiptNumber: "RR001",
    haqWazanReceiptNumber: "HWR001",
    weighingTotalPrice: "1000",
    contractDate: "2024-01-15",
    companyName: "Tech Solutions Inc",
    companyId: "COMP001",
  },
  {
    contractId: "CONT002",
    area: "Herat",
    mineralAmount: "200",
    unitPrice: "75",
    mineralTotalPrice: "15000",
    royaltyReceiptNumber: "RR002",
    haqWazanReceiptNumber: "HWR002",
    weighingTotalPrice: "2000",
    contractDate: "2024-02-20",
    companyName: "Business Corp",
    companyId: "COMP002",
  },
  {
    contractId: "CONT003",
    area: "Balkh",
    mineralAmount: "150",
    unitPrice: "60",
    mineralTotalPrice: "9000",
    royaltyReceiptNumber: "RR003",
    haqWazanReceiptNumber: "HWR003",
    weighingTotalPrice: "1500",
    contractDate: "2024-03-10",
    companyName: "Innovation Labs",
    companyId: "COMP003",
  }
];

let contractCounter = 3;

export const getContracts = () => contracts;

export const getContractFilters = () => ({
  contractStatus: [
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "pending", label: "Pending" },
  ],
});

export const getContractsByCompany = (companyName) => {
  return contracts.filter(
    (contract) => contract.companyName?.toLowerCase() === companyName.toLowerCase()
  );
};

export const getContractsByCompanyId = (companyId) => {
  return contracts.filter((contract) => contract.companyId === companyId);
};

export const addContract = (contract) => {
  contractCounter++;
  const newContract = {
    ...contract,
    contractId: `CONT${String(contractCounter).padStart(3, "0")}`,
  };
  contracts = [...contracts, newContract];
  return contracts;
};

export const updateContract = (contractId, updatedData) => {
  contracts = contracts.map((contract) =>
    contract.contractId === contractId
      ? { ...contract, ...updatedData }
      : contract
  );
  return contracts;
};

export const deleteContract = (contractId) => {
  contracts = contracts.filter(
    (contract) => contract.contractId !== contractId
  );
  return contracts;
};

export const getNextContractId = () => {
  return `CONT${String(contractCounter + 1).padStart(3, "0")}`;
};