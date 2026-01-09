// Sample initial data
const initialMaktoobs = [
  {
    maktoob_id: "1",
    maktoob_number: "MKT-001-2024",
    maktoob_type: "maktoob-contract",
    maktoob_scan: null,
    sadir_date: "2024-01-15",
    company_name: "Tech Solutions Inc",
    source: "Ministry of Mines",
    start_date: "2024-01-15",
    end_date: "2024-12-31",
    status: "completed",
    description: "Initial business registration and licensing documents",
    maktoob_date: "2024-01-15",
  },
  {
    maktoob_id: "2",
    maktoob_number: "MKT-002-2024",
    maktoob_type: "maktoob-tamded",
    maktoob_scan: null,
    sadir_date: "2024-01-20",
    company_name: "Business Corp",
    source: "Tax Department",
    start_date: "2024-01-20",
    end_date: "2024-03-20",
    status: "in-progress",
    description: "Quarterly tax compliance documentation",
    maktoob_date: "2024-01-20",
  },
  {
    maktoob_id: "3",
    maktoob_number: "MKT-003-2024",
    maktoob_type: "maktoob-khosh",
    maktoob_scan: null,
    sadir_date: "2024-02-01",
    company_name: "Innovation Labs",
    source: "HR Department",
    start_date: "2024-02-01",
    end_date: "2024-02-28",
    status: "pending",
    description: "Employee training and certification records",
    maktoob_date: "2024-02-01",
  },
];

// Your search filters
export const maktoobSearchFilters = (t) => ({
  maktoobStatus: [
    { value: "pending", label: t("pending") || "Pending" },
    { value: "completed", label: t("completed") || "Completed" },
    { value: "in-progress", label: t("in_progress") || "In Progress" },
    { value: "cancelled", label: t("cancelled") || "Cancelled" },
  ],
  maktoobPriority: [
    { value: "low", label: t("low") || "Low" },
    { value: "medium", label: t("medium") || "Medium" },
    { value: "high", label: t("high") || "High" },
  ],
});

// Data functions
let currentMaktoobs = [...initialMaktoobs];

// Function to get the next sequential ID
const getNextMaktoobId = () => {
  if (currentMaktoobs.length === 0) return "1";
  const existingIds = currentMaktoobs.map((maktoob) =>
    parseInt(maktoob.maktoob_id)
  );
  const maxId = Math.max(...existingIds);
  return (maxId + 1).toString();
};

export const getMaktoobs = () => {
  return [...currentMaktoobs];
};

export const getMaktoobFilters = () => {
  return {
    status: ["pending", "completed", "in-progress", "cancelled"],
    priority: ["low", "medium", "high"],
    types: [
      "maktoob-contract",
      "maktoob-tamded",
      "maktoob-khosh",
      "maktoob-royality",
      "maktoob-baharbardry",
      "maktoob-paskha",
      "maktoob-process",
    ],
  };
};

export const getMaktoobsByCompany = (companyName) => {
  return currentMaktoobs.filter(
    (maktoob) => maktoob.company_name === companyName
  );
};

export const addMaktoob = (maktoobData) => {
  const nextId = getNextMaktoobId();

  const newMaktoob = {
    maktoob_id: nextId,
    ...maktoobData,
    maktoob_date: new Date().toISOString().split("T")[0],
  };

  currentMaktoobs = [...currentMaktoobs, newMaktoob];
  return currentMaktoobs;
};

export const updateMaktoob = (maktoobId, updatedData) => {
  currentMaktoobs = currentMaktoobs.map((maktoob) =>
    maktoob.maktoob_id === maktoobId ? { ...maktoob, ...updatedData } : maktoob
  );
  return currentMaktoobs;
};

export const deleteMaktoob = (maktoobId) => {
  currentMaktoobs = currentMaktoobs.filter(
    (maktoob) => maktoob.maktoob_id !== maktoobId
  );
  return currentMaktoobs;
};

// Function to get the next available ID (for display purposes)
export const getNextAvailableId = () => {
  return getNextMaktoobId();
};
