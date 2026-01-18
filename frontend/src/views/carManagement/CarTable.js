// ** React Imports
import { useState, Fragment, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

// ** Third Party Components
import Flatpickr from "react-flatpickr";
import ReactPaginate from "react-paginate";
import {
  ChevronDown,
  Plus,
  Trash2,
  ArrowLeft,
  Filter,
  X,
  Edit,
} from "react-feather";
import DataTable from "react-data-table-component";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ** Reactstrap Imports
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Input,
  Label,
  Row,
  Col,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
  Badge,
  Collapse,
  Spinner,
} from "reactstrap";

// ** Import AddCar Component
import AddCar from "./addCar/AddCar.js";

// ** Styles
import "@styles/react/libs/flatpickr/flatpickr.scss";

// ** API Base URL
const API_URL = "http://127.0.0.1:8000/test1";

// ** Status mapping
const statusMap = {
  1: "Active",
  2: "Inactive",
};

const CarTable = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // ** Get company data from navigation state
  const { company, fromCompany } = location.state || {};

  // ** States
  const [searchCarName, setSearchCarName] = useState("");
  const [searchPlateNumber, setSearchPlateNumber] = useState("");
  const [searchDriverName, setSearchDriverName] = useState("");
  const [searchCompanyName, setSearchCompanyName] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [dateRange, setDateRange] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [cars, setCars] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState([]);

  // ** Modal States
  const [addCarModal, setAddCarModal] = useState(false);
  const [editCarModal, setEditCarModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ** Fetch cars from API - FIXED for ManyToMany relationship
  const fetchCars = async () => {
    setLoading(true);
    try {
      let carsData = [];
      
      console.log("Fetching vehicles for company ID:", company?.id, "Name:", company?.company_name);
      
      if (fromCompany && company) {
        // **METHOD 1: Get company with its vehicles (ManyToMany)**
        try {
          console.log("Trying to get company with vehicles...");
          
          // First, get the company details with its vehicles
          const companyResponse = await axios.get(`${API_URL}/companies/${company.id}/`);
          const companyData = companyResponse.data;
          
          console.log("Company data received:", companyData);
          
          // Check if vehicles are included in the company response
          if (companyData.vehicle && Array.isArray(companyData.vehicle)) {
            // vehicles are returned as an array of IDs
            console.log(`Company has ${companyData.vehicle.length} vehicle IDs:`, companyData.vehicle);
            
            // Fetch details for each vehicle
            const vehiclePromises = companyData.vehicle.map(vehicleId => 
              axios.get(`${API_URL}/vehicle/${vehicleId}/`)
            );
            
            const vehicleResponses = await Promise.all(vehiclePromises);
            carsData = vehicleResponses.map(response => response.data);
            
            console.log(`Fetched ${carsData.length} vehicle details`);
          } else if (companyData.vehicles && Array.isArray(companyData.vehicles)) {
            // vehicles might be returned as full objects
            carsData = companyData.vehicles;
            console.log(`Company has ${carsData.length} vehicle objects directly`);
          }
        } catch (companyError) {
          console.log("Method 1 failed:", companyError.message);
          
          // **METHOD 2: Filter vehicles by company ID**
          try {
            console.log("Trying to filter vehicles by company...");
            
            // Since it's ManyToMany, try filtering vehicles that have this company
            const response = await axios.get(`${API_URL}/vehicle/`);
            const allVehicles = response.data.results || response.data;
            console.log(`Total vehicles in system: ${allVehicles.length}`);
            
            if (allVehicles.length > 0) {
              // Check the structure of first vehicle
              console.log("First vehicle structure:", allVehicles[0]);
              
              // **IMPORTANT: Vehicles don't have company field directly**
              // We need to check if company is in the vehicle's companies field
              carsData = allVehicles.filter(vehicle => {
                // Check if vehicle has companies field (ManyToMany from Vehicle side)
                if (vehicle.companies && Array.isArray(vehicle.companies)) {
                  // If companies is array of IDs
                  const hasCompany = vehicle.companies.some(comp => {
                    if (typeof comp === 'object') {
                      return comp.id === company.id;
                    } else {
                      return parseInt(comp) === parseInt(company.id);
                    }
                  });
                  return hasCompany;
                }
                return false;
              });
              
              console.log(`Found ${carsData.length} vehicles for company ${company.id}`);
            }
          } catch (allError) {
            console.error("Method 2 failed:", allError);
            throw new Error("Cannot fetch vehicles");
          }
        }
      } else {
        // Not from company - fetch all vehicles
        console.log("Fetching ALL vehicles (not filtered by company)");
        const response = await axios.get(`${API_URL}/vehicle/`);
        carsData = response.data.results || response.data;
      }
      
      // **Set the filtered data**
      setCars(carsData);
      setFilteredData(carsData);
      
      // **Show appropriate toast message**
      // if (fromCompany && company) {
      //   if (carsData.length === 0) {
      //     toast.warning(`No vehicles found for ${company.company_name}`);
      //   } else {
      //     toast.success(`Found ${carsData.length} vehicles for ${company.company_name}`);
      //   }
      // } else {
      //   toast.success(`Loaded ${carsData.length} vehicles`);
      // }
      
    } catch (error) {
      console.error("Error fetching cars:", error);
      toast.error("Failed to load vehicles");
      setCars([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  // ** Fetch vehicle types for dropdown
  const fetchVehicleTypes = async () => {
    try {
      const response = await axios.get(`${API_URL}/vehicletype/`);
      setVehicleTypes(response.data.results || response.data);
    } catch (error) {
      console.error("Error fetching vehicle types:", error);
      toast.error("Failed to load vehicle types");
    }
  };

  // ** Initialize data - Refetch when company changes
  useEffect(() => {
    console.log("CarTable useEffect triggered. Company:", company?.id, "fromCompany:", fromCompany);
    fetchCars();
    fetchVehicleTypes();
  }, [company, fromCompany]);

  // ** Apply filters when search criteria change
  useEffect(() => {
    let data = cars;

    if (searchCarName) {
      data = data.filter((c) =>
        c.car_name.toLowerCase().includes(searchCarName.toLowerCase())
      );
    }

    if (searchPlateNumber) {
      data = data.filter((c) =>
        c.plate_number.toLowerCase().includes(searchPlateNumber.toLowerCase())
      );
    }

    if (searchDriverName) {
      data = data.filter((c) =>
        c.driver_name.toLowerCase().includes(searchDriverName.toLowerCase())
      );
    }

    // Don't show company filter when viewing specific company
    if (searchCompanyName && !fromCompany) {
      data = data.filter((c) => {
        // Check companies field (ManyToMany)
        if (c.companies && Array.isArray(c.companies) && c.companies.length > 0) {
          return c.companies.some(comp => {
            if (typeof comp === 'object') {
              return comp.company_name.toLowerCase().includes(searchCompanyName.toLowerCase());
            }
            return false;
          });
        }
        return false;
      });
    }

    if (searchStatus) {
      data = data.filter((c) => Number(c.status) === Number(searchStatus));
    }

    if (dateRange.length === 2) {
      const [start, end] = dateRange;
      data = data.filter((c) => {
        const createDate = new Date(c.create_at);
        return createDate >= start && createDate <= end;
      });
    }

    setFilteredData(data);
  }, [
    searchCarName,
    searchPlateNumber,
    searchDriverName,
    searchCompanyName,
    searchStatus,
    dateRange,
    cars,
  ]);

  // ** Handle Back Button Click
  const handleBackClick = () => {
    navigate(-1);
  };

  // ** Toggle Filter Section
  const toggleFilter = () => setFilterOpen(!filterOpen);

  // ** Clear All Filters
  const clearFilters = () => {
    setSearchCarName("");
    setSearchPlateNumber("");
    setSearchDriverName("");
    setSearchCompanyName("");
    setSearchStatus("");
    setDateRange([]);
  };

  // ** Handle Edit Click
  const handleEdit = (car) => {
    setSelectedCar(car);
    setEditCarModal(true);
  };

  // ** Handle Delete Click
  const handleDeleteClick = (carId) => {
    const car = cars.find((c) => c.id === carId);
    setSelectedCar(car);
    setDeleteModal(true);
  };

  // ** Table columns configuration - Updated for ManyToMany
  const columns = [
    {
      name: t("id") || "ID",
      selector: (row) => row.id,
      sortable: true,
      width: "70px",
    },
    {
      name: t("car_name") || "Car Name",
      selector: (row) => row.car_name,
      sortable: true,
      minWidth: "150px",
    },
    {
      name: t("plate_number") || "Plate Number",
      selector: (row) => row.plate_number,
      sortable: true,
      minWidth: "120px",
    },
    {
      name: t("driver_name") || "Driver Name",
      selector: (row) => row.driver_name,
      sortable: true,
      minWidth: "150px",
    },
    {
      name: t("empty_weight") || "Empty Weight",
      selector: (row) => row.empty_weight,
      sortable: true,
      cell: (row) => `${row.empty_weight} kg`,
      width: "120px",
    },
    {
      name: t("vehicle_type") || "Vehicle Type",
      selector: (row) => row.vehicle_type?.truck_name || "N/A",
      sortable: true,
      width: "120px",
    },
    // Only show company column when NOT viewing specific company
    ...(!fromCompany ? [{
      name: t("company") || "Company",
      selector: (row) => {
        if (row.companies && Array.isArray(row.companies) && row.companies.length > 0) {
          // Show first company name
          if (typeof row.companies[0] === 'object') {
            return row.companies[0].company_name;
          }
        }
        return "N/A";
      },
      sortable: true,
      minWidth: "150px",
    }] : []),
    {
      name: t("status") || "Status",
      selector: (row) => statusMap[row.status] || "Unknown",
      sortable: true,
      width: "100px",
      cell: (row) => {
        const statusText = statusMap[row.status] || "Unknown";
        const badgeColor = row.status === 1 ? "success" : "secondary";
        return <Badge color={badgeColor}>{statusText}</Badge>;
      },
    },
    {
      name: t("actions") || "Actions",
      cell: (row) => (
        <div className="d-flex">
          <Button
            color="primary"
            size="sm"
            className="me-1"
            onClick={() => handleEdit(row)}
            title={t("edit") || "Edit"}
          >
            <Edit size={14} />
          </Button>
          <Button
            color="danger"
            size="sm"
            onClick={() => handleDeleteClick(row.id)}
            title={t("delete") || "Delete"}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
      width: "100px",
    },
  ];

  // ** Function to handle Pagination
  const handlePagination = (page) => setCurrentPage(page.selected);

  // ** Custom Pagination
  const CustomPagination = () => (
    <ReactPaginate
      previousLabel={""}
      nextLabel={""}
      forcePage={currentPage}
      onPageChange={handlePagination}
      pageCount={Math.ceil(filteredData.length / 7) || 1}
      breakLabel={"..."}
      pageRangeDisplayed={2}
      marginPagesDisplayed={2}
      activeClassName="active"
      pageClassName="page-item"
      breakClassName="page-item"
      nextLinkClassName="page-link"
      pageLinkClassName="page-link"
      breakLinkClassName="page-link"
      previousLinkClassName="page-link"
      nextClassName="page-item next-item"
      previousClassName="page-item prev-item"
      containerClassName={
        "pagination react-paginate separated-pagination pagination-sm justify-content-end pe-1 mt-1"
      }
    />
  );

  // ** Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (selectedCar) {
      try {
        await axios.delete(`${API_URL}/vehicle/${selectedCar.id}/`);
        toast.success("Vehicle deleted successfully!");
        fetchCars(); // Refresh the list
        setDeleteModal(false);
        setSelectedCar(null);
      } catch (error) {
        console.error("Error deleting vehicle:", error);
        toast.error("Failed to delete vehicle");
      }
    }
  };

  // ** Handle Add Vehicle Submission - FIXED for ManyToMany
  const handleAddVehicleSubmit = async (vehicleData) => {
    setIsSubmitting(true);
    
    try {
      // **IMPORTANT: For ManyToMany, we need to create vehicle first, then associate with company**
      
      // 1. First create the vehicle
      const formattedData = {
        car_name: vehicleData.carName,
        plate_number: vehicleData.plateNumber,
        driver_name: vehicleData.driverName,
        empty_weight: parseInt(vehicleData.emptyWeight) || 0,
        vehicle_type: vehicleData.vehicleType || null,
        status: vehicleData.status === "active" ? 1 : 2,
        create_at: vehicleData.registrationDate || new Date().toISOString().split('T')[0],
        update_at: new Date().toISOString().split('T')[0],
      };

      console.log("Creating vehicle with data:", formattedData);

      const response = await axios.post(`${API_URL}/vehicle/`, formattedData);
      
      if (response.status === 201) {
        const newVehicle = response.data;
        
        // 2. If fromCompany, associate the vehicle with the company
        if (fromCompany && company) {
          try {
            console.log("Associating vehicle with company...");
            
            // For ManyToMany, we need to update the company's vehicles
            // First get current company
            const companyResponse = await axios.get(`${API_URL}/companies/${company.id}/`);
            const currentCompany = companyResponse.data;
            
            // Add the new vehicle to the company's vehicles
            const updatedVehicles = [...(currentCompany.vehicle || []), newVehicle.id];
            
            // Update the company
            await axios.patch(`${API_URL}/companies/${company.id}/`, {
              vehicle: updatedVehicles
            });
            
            console.log("Vehicle associated with company successfully");
            
          } catch (associationError) {
            console.error("Failed to associate vehicle with company:", associationError);
            toast.warning("Vehicle created but failed to associate with company");
          }
        }
        
        toast.success("Vehicle added successfully!");
        setAddCarModal(false);
        fetchCars(); // Refresh the list
      }
    } catch (error) {
      console.error("Error adding vehicle:", error);
      const errorMsg = error.response?.data;
      if (typeof errorMsg === 'object') {
        Object.keys(errorMsg).forEach(key => {
          toast.error(`${key}: ${errorMsg[key]}`);
        });
      } else {
        toast.error(errorMsg || "Failed to add vehicle");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ** Handle Edit Vehicle Submission
  const handleEditVehicleSubmit = async (vehicleData) => {
    setIsSubmitting(true);
    
    try {
      const formattedData = {
        car_name: vehicleData.carName,
        plate_number: vehicleData.plateNumber,
        driver_name: vehicleData.driverName,
        empty_weight: parseInt(vehicleData.emptyWeight) || 0,
        vehicle_type: vehicleData.vehicleType || null,
        status: vehicleData.status === "active" ? 1 : 2,
        update_at: new Date().toISOString().split('T')[0],
      };

      console.log("Updating vehicle data:", formattedData);

      const response = await axios.put(
        `${API_URL}/vehicle/${selectedCar.id}/`,
        formattedData
      );
      
      if (response.status === 200) {
        toast.success("Vehicle updated successfully!");
        setEditCarModal(false);
        setSelectedCar(null);
        fetchCars(); // Refresh the list
      }
    } catch (error) {
      console.error("Error updating vehicle:", error);
      toast.error(error.response?.data?.message || "Failed to update vehicle");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ** Handle Add Vehicle Button Click
  const handleAddVehicleClick = () => {
    setAddCarModal(true);
  };

  // ** Close Modals
  const closeModals = () => {
    setAddCarModal(false);
    setEditCarModal(false);
    setDeleteModal(false);
    setSelectedCar(null);
    setIsSubmitting(false);
  };

  return (
    <Fragment>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <Card>
        <CardHeader className="border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              {/* Back Button - Only show when coming from company */}
              {fromCompany && (
                <Button
                  color="secondary"
                  onClick={handleBackClick}
                  className="me-2 d-flex align-items-center"
                >
                  <ArrowLeft size={14} className="me-50" />
                  {t("back") || "Back"}
                </Button>
              )}
              <CardTitle tag="h4" className="mb-0">
                {fromCompany && company
                  ? `${t("vehicle_management") || "Vehicle Management"} - ${
                      company.company_name
                    }`
                  : t("vehicle_management") || "Vehicle Management"}
                {fromCompany && company && (
                  <Badge color="primary" className="ms-2">
                    {t("company_view") || "Company View"}
                  </Badge>
                )}
              </CardTitle>
            </div>
            <div className="d-flex gap-1">
              <Button
                color="secondary"
                onClick={toggleFilter}
                className="d-flex align-items-center"
              >
                <Filter size={14} className="me-50" />
                {t("filter") || "Filter"}
                {filterOpen && <X size={14} className="ms-50" />}
              </Button>
              <Button
                color="primary"
                onClick={handleAddVehicleClick}
                className="d-flex align-items-center"
              >
                <Plus size={14} className="me-50" />
                {t("add_vehicle") || "Add Vehicle"}
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Filter Section */}
        <Collapse isOpen={filterOpen}>
          <CardBody className="pt-0">
            <Row className="mt-1 mb-50">
              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="carName">
                  {t("car_name") || "Car Name"}:
                </Label>
                <Input
                  id="carName"
                  placeholder={t("filter_by_car_name") || "Filter by Car Name"}
                  value={searchCarName}
                  onChange={(e) => setSearchCarName(e.target.value)}
                />
              </Col>

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="plateNumber">
                  {t("plate_number") || "Plate Number"}:
                </Label>
                <Input
                  id="plateNumber"
                  placeholder={t("filter_by_plate") || "Filter by Plate Number"}
                  value={searchPlateNumber}
                  onChange={(e) => setSearchPlateNumber(e.target.value)}
                />
              </Col>

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="driverName">
                  {t("driver_name") || "Driver Name"}:
                </Label>
                <Input
                  id="driverName"
                  placeholder={t("filter_by_driver") || "Filter by Driver Name"}
                  value={searchDriverName}
                  onChange={(e) => setSearchDriverName(e.target.value)}
                />
              </Col>

              {/* Hide company filter when viewing specific company's cars */}
              {!fromCompany && (
                <Col lg="3" md="6" className="mb-1">
                  <Label className="form-label" htmlFor="companyName">
                    {t("company_name") || "Company Name"}:
                  </Label>
                  <Input
                    id="companyName"
                    placeholder={t("filter_by_company") || "Filter by Company"}
                    value={searchCompanyName}
                    onChange={(e) => setSearchCompanyName(e.target.value)}
                  />
                </Col>
              )}

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="status">
                  {t("status") || "Status"}:
                </Label>
                <Input
                  type="select"
                  id="status"
                  value={searchStatus}
                  onChange={(e) => setSearchStatus(e.target.value)}
                >
                  <option value="">{t("all_status") || "All Status"}</option>
                  <option value="1">{t("active") || "Active"}</option>
                  <option value="2">{t("inactive") || "Inactive"}</option>
                </Input>
              </Col>

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="date">
                  {t("registration_date") || "Registration Date"}:
                </Label>
                <Flatpickr
                  className="form-control"
                  id="date"
                  value={dateRange}
                  options={{ mode: "range", dateFormat: "Y-m-d" }}
                  onChange={(date) => setDateRange(date)}
                />
              </Col>

              <Col
                lg="12"
                className="mb-1 d-flex align-items-end justify-content-end"
              >
                <Button
                  color="outline-secondary"
                  onClick={clearFilters}
                  className="me-1"
                >
                  {t("clear_filters") || "Clear Filters"}
                </Button>
                <Button color="primary" onClick={() => {}}>
                  {t("apply_filters") || "Apply Filters"}
                </Button>
              </Col>
            </Row>
          </CardBody>
        </Collapse>

        {/* Data Table */}
        <CardBody>
          {loading ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
              <p className="mt-2">Loading vehicles...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">
                {fromCompany && company 
                  ? `No vehicles found for ${company.company_name}`
                  : "No vehicles found"}
              </p>
              {/* <Button color="primary" onClick={handleAddVehicleClick}>
                <Plus size={14} className="me-50" />
                {fromCompany && company 
                  ? `Add Vehicle to ${company.company_name}`
                  : "Add Your First Vehicle"}
              </Button> */}
            </div>
          ) : (
            <div className="react-dataTable">
              <DataTable
                noHeader
                pagination
                columns={columns}
                paginationPerPage={7}
                className="react-dataTable"
                sortIcon={<ChevronDown size={10} />}
                paginationDefaultPage={currentPage + 1}
                paginationComponent={CustomPagination}
                data={filteredData}
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add Vehicle Modal */}
      <Modal isOpen={addCarModal} toggle={closeModals} size="lg">
        <ModalHeader toggle={closeModals}>
          {t("add_new_vehicle") || "Add New Vehicle"}
          {fromCompany && company && ` - ${company.company_name}`}
        </ModalHeader>
        <ModalBody>
          <AddCar
            onSuccess={handleAddVehicleSubmit}
            onCancel={closeModals}
            selectedCompany={fromCompany ? company : null}
            loading={isSubmitting}
            isEdit={false}
            vehicleTypes={vehicleTypes}
          />
        </ModalBody>
      </Modal>

      {/* Edit Vehicle Modal */}
      <Modal isOpen={editCarModal} toggle={closeModals} size="lg">
        <ModalHeader toggle={closeModals}>
          {t("edit_vehicle") || "Edit Vehicle"} - {selectedCar?.car_name}
        </ModalHeader>
        <ModalBody>
          <AddCar
            onSuccess={handleEditVehicleSubmit}
            onCancel={closeModals}
            initialData={selectedCar}
            loading={isSubmitting}
            isEdit={true}
            vehicleTypes={vehicleTypes}
          />
        </ModalBody>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal} toggle={closeModals}>
        <ModalHeader toggle={closeModals}>
          {t("delete_vehicle") || "Delete Vehicle"}
        </ModalHeader>
        <ModalBody>
          <p>
            {t("delete_vehicle_confirmation") ||
              "Are you sure you want to delete this vehicle?"}
          </p>
          {selectedCar && (
            <div className="mt-2">
              <strong>{selectedCar.car_name}</strong>
              <br />
              <small className="text-muted">
                Plate: {selectedCar.plate_number} | Driver:{" "}
                {selectedCar.driver_name}
              </small>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={closeModals}>
            {t("cancel") || "Cancel"}
          </Button>
          <Button color="danger" onClick={handleDeleteConfirm}>
            <Trash2 size={14} className="me-50" />
            {t("delete") || "Delete"}
          </Button>
        </ModalFooter>
      </Modal>
    </Fragment>
  );
};

export default CarTable;