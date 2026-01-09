// ** React Imports
import { useState, Fragment, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

// ** Import Car Data and Functions
import {
  getCars,
  getCarFilters,
  getCarsByCompany,
  addCar,
  updateCar,
  deleteCar,
  carColumns,
  carSearchFilters,
} from "../../dummyData/carData.js";

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
} from "reactstrap";

// ** Import AddCar Component
import AddCar from "./addCar/AddCar.js";

// ** Styles
import "@styles/react/libs/flatpickr/flatpickr.scss";

const CarTable = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // ** Get company data from navigation state
  const { company, fromCompany } = location.state || {};

  // ** States
  const [searchCarNumber, setSearchCarNumber] = useState("");
  const [searchCarName, setSearchCarName] = useState("");
  const [searchPlateNumber, setSearchPlateNumber] = useState("");
  const [searchDriverName, setSearchDriverName] = useState("");
  const [searchCompanyName, setSearchCompanyName] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [dateRange, setDateRange] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [cars, setCars] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);

  // ** Modal States
  const [addCarModal, setAddCarModal] = useState(false);
  const [editCarModal, setEditCarModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ** Main filter function
  const applyFilters = () => {
    let updatedData = cars;

    // Filter by car name
    if (searchCarName) {
      updatedData = updatedData.filter((item) =>
        item.car_name.toLowerCase().includes(searchCarName.toLowerCase())
      );
    }

    // Filter by plate number
    if (searchPlateNumber) {
      updatedData = updatedData.filter((item) =>
        item.plate_number
          .toLowerCase()
          .includes(searchPlateNumber.toLowerCase())
      );
    }

    // Filter by driver name
    if (searchDriverName) {
      updatedData = updatedData.filter((item) =>
        item.driver_name.toLowerCase().includes(searchDriverName.toLowerCase())
      );
    }

    // Filter by company name (only if not filtered by company already)
    if (searchCompanyName && !fromCompany) {
      updatedData = updatedData.filter((item) =>
        item.company_name
          .toLowerCase()
          .includes(searchCompanyName.toLowerCase())
      );
    }

    // Filter by status
    if (searchStatus) {
      updatedData = updatedData.filter((item) => item.status === searchStatus);
    }

    // Filter by date range
    if (dateRange && dateRange.length === 2) {
      const [startDate, endDate] = dateRange;
      updatedData = updatedData.filter((item) => {
        const itemDate = new Date(item.registration_date);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    setFilteredData(updatedData);
  };

  // ** Initialize data
  useEffect(() => {
    const loadData = () => {
      const carsData = getCars();
      getCarFilters(); // Remove assignment since it's not used
      setCars(carsData);
    };

    loadData();
  }, []);

  // ** Filter cars by company when component mounts or company changes
  useEffect(() => {
    if (fromCompany && company) {
      const companyCars = getCarsByCompany(company.company_name);
      setCars(companyCars);
    }
  }, [company, fromCompany]);

  // ** Apply filters automatically when search criteria or cars change
  useEffect(() => {
    applyFilters();
  }, [
    searchCarName,
    searchPlateNumber,
    searchDriverName,
    searchCompanyName,
    searchStatus,
    dateRange,
    cars,
  ]);

  // ** Show Alert
  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: "", message: "" });
    }, 3000);
  };

  // ** Handle Back Button Click
  const handleBackClick = () => {
    navigate(-1);
  };

  // ** Toggle Filter Section
  const toggleFilter = () => setFilterOpen(!filterOpen);

  // ** Clear All Filters
  const clearFilters = () => {
    setSearchCarNumber("");
    setSearchCarName("");
    setSearchPlateNumber("");
    setSearchDriverName("");
    setSearchCompanyName("");
    setSearchStatus("");
    setDateRange("");
  };

  // ** Handle Edit Click
  const handleEdit = (car) => {
    setSelectedCar(car);
    setEditCarModal(true);
  };

  // ** Handle Delete Click
  const handleDeleteClick = (carId) => {
    setSelectedCar(cars.find((car) => car.car_id === carId));
    setDeleteModal(true);
  };

  // ** Get translated columns
  const columns = carColumns(t, handleEdit, handleDeleteClick);
  const searchFilters = carSearchFilters(t);

  // ** Function to handle Pagination
  const handlePagination = (page) => setCurrentPage(page.selected);

  // ** Table data to render
  const dataToRender = () => {
    if (
      searchCarNumber.length ||
      searchCarName.length ||
      searchPlateNumber.length ||
      searchDriverName.length ||
      searchCompanyName.length ||
      searchStatus.length ||
      dateRange.length
    ) {
      return filteredData;
    } else {
      return cars;
    }
  };

  // ** Custom Pagination
  const CustomPagination = () => (
    <ReactPaginate
      previousLabel={""}
      nextLabel={""}
      forcePage={currentPage}
      onPageChange={(page) => handlePagination(page)}
      pageCount={Math.ceil(dataToRender().length / 7) || 1}
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
  const handleDeleteConfirm = () => {
    if (selectedCar) {
      const updatedCars = deleteCar(selectedCar.car_id);
      setCars(updatedCars);
      setDeleteModal(false);
      setSelectedCar(null);
      showAlert("success", "Car deleted successfully!");
    }
  };

  // ** Handle Add Car Submission
  const handleAddCarSubmit = (carData) => {
    setIsSubmitting(true);

    // If we're in company-specific view, auto-set the company name
    if (fromCompany && company) {
      carData.companyName = company.company_name;
    }

    console.log("Adding new car:", carData);

    // Simulate API call delay
    setTimeout(() => {
      const updatedCars = addCar(carData);
      setCars(updatedCars);
      setAddCarModal(false);
      setIsSubmitting(false);
      showAlert("success", "Car added successfully!");
    }, 1000);
  };

  // ** Handle Edit Car Submission
  const handleEditCarSubmit = (carData) => {
    setIsSubmitting(true);

    console.log("Editing car ID:", selectedCar?.car_id);
    console.log("New car data:", carData);

    // Simulate API call delay
    setTimeout(() => {
      if (selectedCar) {
        const updatedCars = updateCar(selectedCar.car_id, carData);
        setCars(updatedCars);
        setEditCarModal(false);
        setSelectedCar(null);
        setIsSubmitting(false);
        showAlert("success", "Car updated successfully!");
      } else {
        setIsSubmitting(false);
        showAlert("error", "No car selected for editing");
      }
    }, 1000);
  };

  // ** Handle Add Car Button Click
  const handleAddCarClick = () => {
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
      {/* Alert */}
      {alert.show && (
        <Alert
          color={alert.type === "success" ? "success" : "danger"}
          className="mb-2"
        >
          {alert.message}
        </Alert>
      )}

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
                  ? `${t("car_management") || "Car Management"} - ${
                      company.company_name
                    }`
                  : t("car_management") || "Car Management"}
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
                onClick={handleAddCarClick}
                className="d-flex align-items-center"
              >
                <Plus size={14} className="me-50" />
                {t("add_car") || "Add Car"}
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
                  {searchFilters.carStatus.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
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
                <Button color="primary" onClick={applyFilters}>
                  {t("apply_filters") || "Apply Filters"}
                </Button>
              </Col>
            </Row>
          </CardBody>
        </Collapse>

        {/* Data Table */}
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
            data={dataToRender()}
          />
        </div>
      </Card>

      {/* Add Car Modal */}
      <Modal isOpen={addCarModal} toggle={closeModals} size="lg">
        <ModalHeader toggle={closeModals}>
          {t("add_new_car") || "Add New Car"}
          {fromCompany && company && ` - ${company.company_name}`}
        </ModalHeader>
        <ModalBody>
          <AddCar
            onSuccess={handleAddCarSubmit}
            onCancel={closeModals}
            selectedCompany={fromCompany ? company : null}
            loading={isSubmitting}
            isEdit={false}
          />
        </ModalBody>
      </Modal>

      {/* Edit Car Modal */}
      <Modal isOpen={editCarModal} toggle={closeModals} size="lg">
        <ModalHeader toggle={closeModals}>
          {t("edit_car") || "Edit Car"} - {selectedCar?.car_id}
        </ModalHeader>
        <ModalBody>
          <AddCar
            onSuccess={handleEditCarSubmit}
            onCancel={closeModals}
            initialData={selectedCar}
            loading={isSubmitting}
            isEdit={true}
          />
        </ModalBody>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal} toggle={closeModals}>
        <ModalHeader toggle={closeModals}>
          {t("delete_car") || "Delete Car"}
        </ModalHeader>
        <ModalBody>
          <p>
            {t("delete_car_confirmation") ||
              "Are you sure you want to delete this car?"}
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
