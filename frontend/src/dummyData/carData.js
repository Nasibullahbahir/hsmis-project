// ** React Imports
import { Button, Badge } from "reactstrap"; // Add Button import

import { Edit, Trash2 } from "react-feather";
// ** Car Data
export const carData = [
  {
    car_id: "CAR001",
    car_number: "1001",
    car_name: "Toyota Hilux",
    car_type: "Pickup Truck",
    plate_number: "KBL-1234",
    driver_name: "Ahmad Khan",
    company_name: "Company 1",
    empty_car_weight: "1800",
    status: "active",
    registration_date: "2024-01-15",
    last_maintenance: "2024-03-01",
  },
  {
    car_id: "CAR002",
    car_number: "1002",
    car_name: "Isuzu D-Max",
    car_type: "Pickup Truck",
    plate_number: "KBL-5678",
    driver_name: "Mohammad Ali",
    company_name: "Company 2",
    empty_car_weight: "1850",
    status: "active",
    registration_date: "2024-02-10",
    last_maintenance: "2024-03-15",
  },
  {
    car_id: "CAR003",
    car_number: "1003",
    car_name: "Toyota Corolla",
    car_type: "Sedan",
    plate_number: "KBL-9012",
    driver_name: "Hamid Noori",
    company_name: "Company 1",
    empty_car_weight: "1300",
    status: "maintenance",
    registration_date: "2024-01-20",
    last_maintenance: "2024-03-20",
  },
  {
    car_id: "23",
    car_number: "0980980",
    car_name: "Toyota iouwreoiw",
    car_type: "Pickup m,nfkjdshk",
    plate_number: "KBL-skjdfks",
    driver_name: "Ahmad sdlkfjskl",
    company_name: "dslkfskjf 1",
    empty_car_weight: "18084840",
    status: "active",
    registration_date: "2024-01-15",
    last_maintenance: "2024-03-01",
  },
  {
    car_id: "54",
    car_number: "757",
    car_name: "Toyota h",
    car_type: "Pickup f",
    plate_number: "KBL-dss",
    driver_name: "fdljkfsfkj Khan",
    company_name: "fdskfjsfjk 1",
    empty_car_weight: "4987982",
    status: "active",
    registration_date: "2024-01-15",
    last_maintenance: "2024-03-01",
  },
];

// ** Car Columns Configuration
export const carColumns = (t, handleEdit, handleDeleteClick) => [
  {
    name: t("car_id") || "ID",
    selector: (row) => row.car_id,
    sortable: true,
    width: "100px",
  },
  {
    name: t("car_name") || "Car Name",
    selector: (row) => row.car_name,
    sortable: true,
    minWidth: "150px",
  },
  {
    name: t("car_type") || "Type",
    selector: (row) => row.car_type,
    sortable: true,
    width: "130px",
  },
  {
    name: t("plate_number") || "Plate Number",
    selector: (row) => row.plate_number,
    sortable: true,
    width: "140px",
  },
  {
    name: t("driver_name") || "Driver Name",
    selector: (row) => row.driver_name,
    sortable: true,
    minWidth: "150px",
  },
  {
    name: t("company_name") || "Company",
    selector: (row) => row.company_name,
    sortable: true,
    minWidth: "150px",
  },
  {
    name: t("empty_car_weight") || "Weight (kg)",
    selector: (row) => row.empty_car_weight,
    sortable: true,
    width: "120px",
    cell: (row) => `${row.empty_car_weight} kg`,
  },
  {
    name: t("status") || "Status",
    selector: (row) => row.status,
    sortable: true,
    width: "120px",
    cell: (row) => {
      const statusMap = {
        active: "success",
        inactive: "secondary",
        maintenance: "warning",
        repair: "danger",
      };
      const badgeColor = statusMap[row.status] || "secondary";
      const statusText =
        row.status.charAt(0).toUpperCase() + row.status.slice(1);
      return (
        <Badge color={badgeColor} className="text-capitalize">
          {statusText}
        </Badge>
      );
    },
  },
  {
    name: t("actions") || "Actions",
    width: "120px",
    cell: (row) => (
      <div className="d-flex gap-1">
        <Button
          color="primary"
          size="sm"
          onClick={() => handleEdit(row)}
          className="btn-icon"
          title={t("edit") || "Edit"}
        >
          <Edit size={12} />
        </Button>
        <Button
          color="danger"
          size="sm"
          onClick={() => handleDeleteClick(row.car_id)}
          className="btn-icon"
          title={t("delete") || "Delete"}
        >
          <Trash2 size={12} />
        </Button>
      </div>
    ),
  },
];

// ** Car Search Filters
export const carSearchFilters = (t) => ({
  carStatus: [
    { value: "active", label: t("active") || "Active" },
    { value: "inactive", label: t("inactive") || "Inactive" },
    { value: "maintenance", label: t("maintenance") || "Maintenance" },
    { value: "repair", label: t("repair") || "Repair" },
  ],
  carTypes: [
    { value: "sedan", label: t("sedan") || "Sedan" },
    { value: "pickup", label: t("pickup") || "Pickup Truck" },
    { value: "suv", label: t("suv") || "SUV" },
    { value: "truck", label: t("truck") || "Truck" },
    { value: "van", label: t("van") || "Van" },
  ],
});

// ** CRUD Operations for Cars
let currentCarData = [...carData];

export const getCars = () => {
  return currentCarData;
};

export const getCarById = (id) => {
  return currentCarData.find((car) => car.car_id === id);
};

export const getCarFilters = () => {
  return {
    carStatus: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "maintenance", label: "Maintenance" },
      { value: "repair", label: "Repair" },
    ],
    carTypes: [
      { value: "sedan", label: "Sedan" },
      { value: "pickup", label: "Pickup Truck" },
      { value: "suv", label: "SUV" },
      { value: "truck", label: "Truck" },
      { value: "van", label: "Van" },
    ],
  };
};

export const addCar = (carData) => {
  const newCar = {
    car_id: `CAR${String(currentCarData.length + 1).padStart(3, "0")}`,
    car_number: carData.carNumber,
    car_name: carData.carName,
    car_type: carData.carType,
    plate_number: carData.plateNumber,
    driver_name: carData.driverName,
    company_name: carData.companyName,
    empty_car_weight: carData.emptyCarWeight,
    status: carData.status || "active",
    registration_date:
      carData.registration_date || new Date().toISOString().split("T")[0],
    last_maintenance: carData.lastMaintenance || "",
  };

  currentCarData.unshift(newCar);
  return [...currentCarData];
};

export const updateCar = (id, updatedData) => {
  const index = currentCarData.findIndex((car) => car.car_id === id);
  if (index !== -1) {
    currentCarData[index] = {
      ...currentCarData[index],
      car_number: updatedData.carNumber,
      car_name: updatedData.carName,
      car_type: updatedData.carType,
      plate_number: updatedData.plateNumber,
      driver_name: updatedData.driverName,
      company_name: updatedData.companyName,
      empty_car_weight: updatedData.emptyCarWeight,
      status: updatedData.status,
      last_maintenance: updatedData.lastMaintenance,
    };
  }
  return [...currentCarData];
};

export const deleteCar = (id) => {
  currentCarData = currentCarData.filter((car) => car.car_id !== id);
  return [...currentCarData];
};

export const getCarsByCompany = (companyName) => {
  return currentCarData.filter(
    (car) => car.company_name.toLowerCase() === companyName.toLowerCase()
  );
};
