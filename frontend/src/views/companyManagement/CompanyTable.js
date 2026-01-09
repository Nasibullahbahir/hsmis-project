// ** React Imports
import { useState, Fragment, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

// ** Import Data from JSON file
import {
  getCompanies,
  getCompanyFilters,
  addCompany,
  updateCompany,
  deleteCompany,
} from "../../dummyData/companyData";

// ** Import AddNewCompany Component (Now used for both Add and Edit)
import AddNewCompany from "./addCompany/AddNewCompany";

// ** Third Party Components
import ReactPaginate from "react-paginate";
import {
  ChevronDown,
  Plus,
  Filter,
  X,
  Edit,
  Trash2,
  FileText,
  ShoppingCart,
  Truck,
} from "react-feather";
import DataTable from "react-data-table-component";
import Flatpickr from "react-flatpickr";

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
  Collapse,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
  Badge,
} from "reactstrap";

// ** Styles
import "@styles/react/libs/flatpickr/flatpickr.scss";

const CompanyTable = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // ** States
  const [searchCompanyName, setSearchCompanyName] = useState("");
  const [searchCompanyId, setSearchCompanyId] = useState("");
  const [searchLeaderName, setSearchLeaderName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchCopmany_type, setSearchCopmany_type] = useState("");
  const [searchTIN, setSearchTIN] = useState("");
  const [searchLicence, setSearchLicence] = useState("");
  const [searchState, setSearchState] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [dateRange, setDateRange] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [Filters, setFilters] = useState({});
  const [filterOpen, setFilterOpen] = useState(false);

  // ** Modal States
  const [addCompanyModal, setAddCompanyModal] = useState(false);
  const [editCompanyModal, setEditCompanyModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ** Main filter function
  const applyFilters = () => {
    let updatedData = companies;

    // Filter by company name
    if (searchCompanyName) {
      updatedData = updatedData.filter((item) =>
        item.company_name
          .toLowerCase()
          .includes(searchCompanyName.toLowerCase())
      );
    }

    // Filter by company ID
    if (searchCompanyId) {
      updatedData = updatedData.filter((item) =>
        item.company_id.toLowerCase().includes(searchCompanyId.toLowerCase())
      );
    }

    // Filter by leader name
    if (searchLeaderName) {
      updatedData = updatedData.filter((item) =>
        item.leader_name.toLowerCase().includes(searchLeaderName.toLowerCase())
      );
    }

    // Filter by phone
    if (searchPhone) {
      updatedData = updatedData.filter((item) =>
        item.phone.toLowerCase().includes(searchPhone.toLowerCase())
      );
    }

    // Filter by company_type
    if (searchCopmany_type) {
      updatedData = updatedData.filter((item) =>
        item.company_type
          .toLowerCase()
          .includes(searchCopmany_type.toLowerCase())
      );
    }

    // Filter by TIN number
    if (searchTIN) {
      updatedData = updatedData.filter((item) =>
        item.TIN_number.toLowerCase().includes(searchTIN.toLowerCase())
      );
    }

    // Filter by licence number
    if (searchLicence) {
      updatedData = updatedData.filter((item) =>
        item.licence_number.toLowerCase().includes(searchLicence.toLowerCase())
      );
    }

    // Filter by state
    if (searchState) {
      updatedData = updatedData.filter((item) => {
        if (!item.state) return false;
        return item.state.toLowerCase() === searchState.toLowerCase();
      });
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

  // ** Initialize data from JSON file
  useEffect(() => {
    const loadData = () => {
      const companiesData = getCompanies();
      const filtersData = getCompanyFilters();
      setCompanies(companiesData);
      setFilters(filtersData);
    };

    loadData();
  }, []);

  // ** Apply filters automatically when search criteria or companies change
  useEffect(() => {
    applyFilters();
  }, [
    searchCompanyName,
    searchCompanyId,
    searchLeaderName,
    searchPhone,
    searchCopmany_type,
    searchTIN,
    searchLicence,
    searchState,
    dateRange,
    companies,
  ]);

  // ** Show Alert
  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: "", message: "" });
    }, 3000);
  };

  // ** Handle Edit Click - Open Edit Modal
  const handleEdit = (company) => {
    setSelectedCompany(company);
    setEditCompanyModal(true);
  };

  // ** Handle Delete Click
  const handleDeleteClick = (companyId) => {
    setSelectedCompany(
      companies.find((company) => company.company_id === companyId)
    );
    setDeleteModal(true);
  };

  // ** Handle Delete Confirmation
  const handleDeleteConfirm = () => {
    if (selectedCompany) {
      const updatedCompanies = deleteCompany(selectedCompany.company_id);
      setCompanies(updatedCompanies);
      setDeleteModal(false);
      setSelectedCompany(null);
      showAlert("success", "Company deleted successfully!");
    }
  };

  // ** Handle Maktoob Button Click
  const handleMaktoobClick = (company) => {
    navigate("/maktoob", {
      state: {
        company,
        fromCompany: true,
      },
    });
    showAlert("info", `Redirecting to Maktoob for ${company.company_name}`);
  };

  // ** Handle Khosh Kharid Button Click - UPDATED TO NAVIGATE TO CONTRACT SALES
  const handleKhoshKharidClick = (company) => {
    console.log("Navigating to contract sales with company:", company);

    navigate("/contract-sales", {
      state: {
        company,
        fromCompany: true,
      },
    });
    showAlert(
      "info",
      `Redirecting to Contract/Sales for ${company.company_name}`
    );
  };
  // ** Close All Modals
  const closeModals = () => {
    setAddCompanyModal(false);
    setEditCompanyModal(false);
    setDeleteModal(false);
    setSelectedCompany(null);
    setIsSubmitting(false);
  };

  // ** Handle Add Company Submission
  const handleAddCompany = (companyData) => {
    setIsSubmitting(true);

    // Add company_id for new companies
    const newCompanyData = {
      ...companyData,
      company_id: `COMP${String(companies.length + 1).padStart(3, "0")}`,
    };

    console.log("Adding new company:", newCompanyData);

    // Simulate API call delay
    setTimeout(() => {
      const updatedCompanies = addCompany(newCompanyData);
      setCompanies(updatedCompanies);
      setAddCompanyModal(false);
      setIsSubmitting(false);
      showAlert("success", "Company added successfully!");
    }, 1000);
  };

  // ** Handle Edit Company Submission
  const handleEditCompany = (companyData) => {
    setIsSubmitting(true);

    console.log("Editing company ID:", selectedCompany?.company_id);
    console.log("New company data:", companyData);

    // Simulate API call delay
    setTimeout(() => {
      if (selectedCompany) {
        const updatedCompanies = updateCompany(
          selectedCompany.company_id,
          companyData
        );
        console.log("Updated companies list:", updatedCompanies);
        setCompanies(updatedCompanies);
        setEditCompanyModal(false);
        setSelectedCompany(null);
        setIsSubmitting(false);
        showAlert("success", "Company updated successfully!");
      } else {
        setIsSubmitting(false);
        showAlert("error", "No company selected for editing");
      }
    }, 1000);
  };

  // ** Helper function for status badges
  const getStatusBadge = (state) => {
    if (!state) return "secondary";

    const stateLower = state.toLowerCase();
    switch (stateLower) {
      case "active":
        return "success";
      case "inactive":
        return "danger";
      case "tamded":
        return "warning";
      case "pending":
        return "info";
      default:
        return "secondary";
    }
  };

  // ** Helper function to get state display text
  const getStateDisplayText = (state) => {
    if (!state) return state;

    const stateLower = state.toLowerCase();
    switch (stateLower) {
      case "active":
        return t("active") || "Active";
      case "inactive":
        return t("inactive") || "Inactive";
      case "tamded":
        return t("tamded") || "Tamded";
      case "pending":
        return t("pending") || "Pending";
      default:
        return state;
    }
  };

  // ** Company columns configuration
  const columns = [
    {
      name: t("id") || "ID",
      selector: (row) => row.company_id,
      sortable: true,
      width: "100px",
    },
    {
      name: t("company_name") || "Company Name",
      selector: (row) => row.company_name,
      sortable: true,
      minWidth: "180px",
    },
    {
      name: t("leader_name") || "Leader Name",
      selector: (row) => row.leader_name,
      sortable: true,
      minWidth: "150px",
    },
    {
      name: t("phone") || "Phone",
      selector: (row) => row.phone,
      sortable: true,
      width: "130px",
    },
    {
      name: t("company_type") || "company_type",
      selector: (row) => row.company_type,
      sortable: true,
      width: "120px",
    },
    {
      name: t("TIN_number") || "TIN Number",
      selector: (row) => row.TIN_number,
      sortable: true,
      width: "130px",
    },
    {
      name: t("licence_number") || "Licence Number",
      selector: (row) => row.licence_number,
      sortable: true,
      width: "140px",
    },
    {
      name: t("state") || "State",
      selector: (row) => row.state,
      sortable: true,
      width: "120px",
      cell: (row) => {
        const stateValue = row.state;
        const badgeColor = getStatusBadge(stateValue);
        const displayText = getStateDisplayText(stateValue);

        return (
          <Badge color={badgeColor} className="text-capitalize">
            {displayText}
          </Badge>
        );
      },
    },
    {
      name: t("registration_date") || "Date",
      selector: (row) => row.registration_date,
      sortable: true,
      width: "120px",
    },
    {
      name: t("maktoob") || "Maktoob",
      width: "100px",
      center: true,
      cell: (row) => (
        <Button
          color="info"
          size="sm"
          onClick={() => handleMaktoobClick(row)}
          className="btn-icon"
          title={t("view_maktoob") || "View Maktoob"}
        >
          <FileText size={12} />
        </Button>
      ),
    },
    {
      name: t("contract_info") || "Khosh Kharid",
      width: "120px",
      center: true,
      cell: (row) => (
        <Button
          color="success"
          size="sm"
          onClick={() => handleKhoshKharidClick(row)}
          className="btn-icon"
          title={t("contract_info") || "Khosh Kharid"}
        >
          <ShoppingCart size={12} />
        </Button>
      ),
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
            onClick={() => handleDeleteClick(row.company_id)}
            className="btn-icon"
            title={t("delete") || "Delete"}
          >
            <Trash2 size={12} />
          </Button>
        </div>
      ),
    },
  ];

  // ** Function to handle Pagination
  const handlePagination = (page) => setCurrentPage(page.selected);

  // ** Table data to render
  const dataToRender = () => {
    if (
      searchCompanyName.length ||
      searchCompanyId.length ||
      searchLeaderName.length ||
      searchPhone.length ||
      searchCopmany_type.length ||
      searchTIN.length ||
      searchLicence.length ||
      searchState.length ||
      dateRange.length
    ) {
      return filteredData;
    } else {
      return companies;
    }
  };

  // ** Toggle Filter Section
  const toggleFilter = () => setFilterOpen(!filterOpen);

  // ** Clear All Filters
  const clearFilters = () => {
    setSearchCompanyName("");
    setSearchCompanyId("");
    setSearchLeaderName("");
    setSearchPhone("");
    setSearchCopmany_type("");
    setSearchTIN("");
    setSearchLicence("");
    setSearchState("");
    setDateRange("");
  };

  // ** Handle Add Company Button Click
  const handleAddCompanyClick = () => setAddCompanyModal(true);

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
            <CardTitle tag="h4">
              {t("company_management") || "Company Management"}
            </CardTitle>
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
                onClick={handleAddCompanyClick}
                className="d-flex align-items-center"
              >
                <Plus size={14} className="me-50" />
                {t("add_company") || "Add Company"}
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Filter Section */}
        <Collapse isOpen={filterOpen}>
          <CardBody className="pt-0">
            <Row className="mt-1 mb-50">
              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="companyName">
                  {t("company_name") || "Company Name"}:
                </Label>
                <Input
                  id="companyName"
                  placeholder={
                    t("filter_by_company_name") || "Filter by Company Name"
                  }
                  value={searchCompanyName}
                  onChange={(e) => setSearchCompanyName(e.target.value)}
                />
              </Col>
              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="companyId">
                  {t("id") || "ID"}:
                </Label>
                <Input
                  id="companyId"
                  placeholder={t("filter_by_id") || "Filter by ID"}
                  value={searchCompanyId}
                  onChange={(e) => setSearchCompanyId(e.target.value)}
                />
              </Col>
              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="leaderName">
                  {t("leader_name") || "Leader Name"}:
                </Label>
                <Input
                  id="leaderName"
                  placeholder={t("filter_by_leader") || "Filter by Leader"}
                  value={searchLeaderName}
                  onChange={(e) => setSearchLeaderName(e.target.value)}
                />
              </Col>
              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="phone">
                  {t("phone") || "Phone"}:
                </Label>
                <Input
                  id="phone"
                  placeholder={t("filter_by_phone") || "Filter by Phone"}
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                />
              </Col>
              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="company_type">
                  {t("company_type") || "company_type"}:
                </Label>
                <Input
                  id="copmany_type"
                  placeholder={
                    t("filter_by_copmany_type") || "Filter by copmany_type"
                  }
                  value={searchCopmany_type}
                  onChange={(e) => setSearchCopmany_type(e.target.value)}
                />
              </Col>
              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="TIN">
                  {t("TIN_number") || "TIN Number"}:
                </Label>
                <Input
                  id="TIN"
                  placeholder={t("filter_by_TIN") || "Filter by TIN"}
                  value={searchTIN}
                  onChange={(e) => setSearchTIN(e.target.value)}
                />
              </Col>
              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="licence">
                  {t("licence_number") || "Licence Number"}:
                </Label>
                <Input
                  id="licence"
                  placeholder={t("filter_by_licence") || "Filter by Licence"}
                  value={searchLicence}
                  onChange={(e) => setSearchLicence(e.target.value)}
                />
              </Col>
              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="state">
                  {t("state") || "State"}:
                </Label>
                <Input
                  type="select"
                  id="state"
                  value={searchState}
                  onChange={(e) => setSearchState(e.target.value)}
                >
                  <option value="">{t("all_states") || "All States"}</option>
                  <option value="active">{t("active") || "Active"}</option>
                  <option value="inactive">
                    {t("inactive") || "Inactive"}
                  </option>
                  <option value="tamded">{t("tamded") || "Tamded"}</option>
                  <option value="pending">{t("pending") || "Pending"}</option>
                </Input>
              </Col>
              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="date">
                  {t("registration_date") || "Date"}:
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

      {/* Add Company Modal */}
      <Modal isOpen={addCompanyModal} toggle={closeModals} size="lg">
        <ModalHeader toggle={closeModals}>
          {t("add_new_company") || "Add New Company"}
        </ModalHeader>
        <ModalBody>
          <AddNewCompany
            onSuccess={handleAddCompany}
            onCancel={closeModals}
            loading={isSubmitting}
            isEdit={false}
          />
        </ModalBody>
      </Modal>

      {/* Edit Company Modal */}
      <Modal isOpen={editCompanyModal} toggle={closeModals} size="lg">
        <ModalHeader toggle={closeModals}>
          {t("edit_company") || "Edit Company"} - {selectedCompany?.company_id}
        </ModalHeader>
        <ModalBody>
          <AddNewCompany
            initialData={selectedCompany}
            onSuccess={handleEditCompany}
            onCancel={closeModals}
            loading={isSubmitting}
            isEdit={true}
          />
        </ModalBody>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal} toggle={closeModals}>
        <ModalHeader toggle={closeModals}>
          {t("delete_company") || "Delete Company"}
        </ModalHeader>
        <ModalBody>
          <p>
            {t("delete_company_confirmation") ||
              "Are you sure you want to delete this company?"}
          </p>
          {selectedCompany && (
            <div className="mt-2">
              <strong>{selectedCompany.company_name}</strong>
              <br />
              <small className="text-muted">
                ID: {selectedCompany.company_id}
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

export default CompanyTable;
