// ** React Imports
import { useState, Fragment, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ** Import AddNewCompany Component
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
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  Badge,
  Spinner,
} from "reactstrap";

// ** Styles
import "@styles/react/libs/flatpickr/flatpickr.scss";

// ** API Base URL
const API_URL = "http://127.0.0.1:8000/test1";

// ** Helper function to format date for display
const formatDateForDisplay = (dateString) => {
  if (!dateString) return "N/A";

  try {
    // Check if it's already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // Handle ISO format (2024-01-10T00:00:00Z)
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";

    // Format to YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "N/A";
  }
};

const CompanyTable = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // ** States
  const [searchCompanyName, setSearchCompanyName] = useState("");
  const [searchLeaderName, setSearchLeaderName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchCompanyType, setSearchCompanyType] = useState("");
  const [searchTIN, setSearchTIN] = useState("");
  const [searchLicenceNumber, setSearchLicenceNumber] = useState(""); // NEW: Added search for licence number
  const [searchStatus, setSearchStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [dateRange, setDateRange] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalCompanies, setTotalCompanies] = useState(0);

  // ** Modal States
  const [addCompanyModal, setAddCompanyModal] = useState(false);
  const [editCompanyModal, setEditCompanyModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ** Get authentication token
  const getAuthToken = () => {
    return localStorage.getItem("access_token");
  };

  // ** Configure axios headers
  const getAxiosConfig = () => {
    const token = getAuthToken();
    return token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      : {
          headers: {
            "Content-Type": "application/json",
          },
        };
  };

  // ** Fetch companies from API
  const fetchCompanies = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      console.log(
        `Fetching companies from: ${API_URL}/companies/?page=${page}`,
      );

      const config = getAxiosConfig();
      const response = await axios.get(
        `${API_URL}/companies/?page=${page}`,
        config,
      );

      console.log("Companies API Response:", response);

      let companiesData = [];
      let total = 0;

      if (response.data && response.data.results) {
        // Paginated response
        companiesData = response.data.results;
        total = response.data.count || 0;
        console.log("Got paginated data:", companiesData.length, "companies");
      } else if (Array.isArray(response.data)) {
        // Non-paginated response
        companiesData = response.data;
        total = companiesData.length;
        console.log("Got array data:", companiesData.length, "companies");
      } else {
        console.log("Unexpected response format:", response.data);
        companiesData = [];
        total = 0;
      }

      console.log("Setting companies:", companiesData);
      setCompanies(companiesData);
      setFilteredData(companiesData);
      setTotalCompanies(total);
    } catch (error) {
      console.error("Error fetching companies:", error);
      console.error("Error details:", error.response?.data);

      if (error.response?.status === 401) {
        toast.error(t("Please login first to view companies"));
      } else {
        toast.error(t("Failed to load companies"));
      }
      setCompanies([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ** Initialize data
  useEffect(() => {
    fetchCompanies(currentPage + 1);
  }, [fetchCompanies]);

  // ** Apply filters when search criteria change
  useEffect(() => {
    let data = companies;

    if (searchCompanyName) {
      data = data.filter((company) =>
        (company.company_name || "")
          .toLowerCase()
          .includes(searchCompanyName.toLowerCase()),
      );
    }

    if (searchLeaderName) {
      data = data.filter((company) =>
        (company.leader_name || "")
          .toLowerCase()
          .includes(searchLeaderName.toLowerCase()),
      );
    }

    if (searchPhone) {
      data = data.filter((company) =>
        (company.phone || "").includes(searchPhone),
      );
    }

    if (searchCompanyType) {
      data = data.filter((company) =>
        (company.company_type || "")
          .toLowerCase()
          .includes(searchCompanyType.toLowerCase()),
      );
    }

    if (searchTIN) {
      data = data.filter((company) =>
        (company.TIN_number || "")
          .toLowerCase()
          .includes(searchTIN.toLowerCase()),
      );
    }

    // NEW: Filter by licence number
    if (searchLicenceNumber) {
      data = data.filter((company) =>
        (company.licence_number || "")
          .toLowerCase()
          .includes(searchLicenceNumber.toLowerCase()),
      );
    }

    if (searchStatus !== "") {
      data = data.filter((company) => {
        if (searchStatus === "1" || searchStatus === 1) {
          return company.status === 1 || company.status === "1";
        } else if (searchStatus === "2" || searchStatus === 2) {
          return company.status === 2 || company.status === "2";
        }
        return true;
      });
    }

    console.log("Filtered data:", data.length, "companies");
    setFilteredData(data);
  }, [
    searchCompanyName,
    searchLeaderName,
    searchPhone,
    searchCompanyType,
    searchTIN,
    searchLicenceNumber, // NEW: Added to dependencies
    searchStatus,
    dateRange,
    companies,
  ]);

  // ** Handle Edit Click
  const handleEdit = (company) => {
    console.log("Editing company:", company);
    setSelectedCompany(company);
    setEditCompanyModal(true);
  };

  // ** Handle Delete Click
  const handleDeleteClick = (companyId) => {
    const company = companies.find((c) => c.id === companyId);
    setSelectedCompany(company);
    setDeleteModal(true);
  };

  // ** Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (selectedCompany) {
      try {
        const config = getAxiosConfig();
        await axios.delete(
          `${API_URL}/companies/${selectedCompany.id}/`,
          config,
        );
        toast.success(t("Company deleted successfully!"));
        fetchCompanies(currentPage + 1);
        setDeleteModal(false);
        setSelectedCompany(null);
      } catch (error) {
        console.error("Error deleting company:", error);
        toast.error(t("Failed to delete company"));
      }
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
    toast.info(`Redirecting to Maktoob for ${company.company_name}`);
  };

  // ** Handle purchases Button Click
  const handleKhoshKharidClick = (company) => {
    console.log("Navigating to purchases with company:", company);
    navigate("/purchases", {
      state: {
        company,
        fromCompany: true,
      },
    });
    toast.info(`Redirecting to purchases for ${company.company_name}`);
  };

  // ** Handle View Vehicles Button Click
  const handleViewVehiclesClick = (company) => {
    console.log("Navigating to vehicles with company:", company);
    
    // Navigate to vehicles page with company info as URL parameters AND state
    navigate(`/vehicles?companyId=${company.id}&companyName=${encodeURIComponent(company.company_name)}`, {
      state: {
        company: {
          id: company.id,
          company_name: company.company_name,
        },
        fromCompany: true,
      },
    });
    
    toast.info(`Viewing vehicles for ${company.company_name}`);
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
  const handleAddCompany = async (companyData) => {
    setIsSubmitting(true);

    try {
      console.log("Creating company with data:", companyData);

      // Format data for Django backend
      const formattedData = {
        company_name: companyData.companyName,
        leader_name: companyData.leaderName,
        phone: companyData.phone,
        company_type: companyData.companyType,
        TIN_number: companyData.TIN,
        licence_number: companyData.licenceNumber, // NEW: Added licence number
        status: companyData.status === "active" ? 1 : 2,
      };

      console.log("Sending to API:", formattedData);

      const config = getAxiosConfig();
      const response = await axios.post(
        `${API_URL}/companies/`,
        formattedData,
        config,
      );

      console.log("API Response:", response);

      if (response.status === 201) {
        toast.success(t("Company added successfully!"));
        setAddCompanyModal(false);
        fetchCompanies(1);
      }
    } catch (error) {
      console.error("Error adding company:", error);
      console.error("Error response:", error.response?.data);

      const errorMsg = error.response?.data;
      if (typeof errorMsg === "object") {
        Object.keys(errorMsg).forEach((key) => {
          if (Array.isArray(errorMsg[key])) {
            errorMsg[key].forEach((msg) => {
              toast.error(`${key}: ${msg}`);
            });
          } else {
            toast.error(`${key}: ${errorMsg[key]}`);
          }
        });
      } else if (error.response?.status === 400) {
        toast.error(t("Invalid data. Please check all fields."));
      } else if (error.response?.status === 401) {
        toast.error(t("Authentication required. Please login."));
      } else {
        toast.error(errorMsg || t("Failed to add company"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ** Handle Edit Company Submission
  const handleEditCompany = async (companyData) => {
    setIsSubmitting(true);

    try {
      console.log("Updating company data:", companyData);

      // Format data for Django backend
      const formattedData = {
        company_name: companyData.companyName,
        leader_name: companyData.leaderName,
        phone: companyData.phone,
        company_type: companyData.companyType,
        TIN_number: companyData.TIN,
        licence_number: companyData.licenceNumber, // NEW: Added licence number
        status: companyData.status === "active" ? 1 : 2,
      };

      console.log("Sending update:", formattedData);

      const config = getAxiosConfig();
      const response = await axios.patch(
        `${API_URL}/companies/${selectedCompany.id}/`,
        formattedData,
        config,
      );

      console.log("Update response:", response);

      if (response.status === 200) {
        toast.success(t("Company updated successfully!"));
        setEditCompanyModal(false);
        setSelectedCompany(null);
        fetchCompanies(currentPage + 1);
      }
    } catch (error) {
      console.error("Error updating company:", error);
      console.error("Error response:", error.response?.data);

      if (error.response?.status === 400) {
        const errorData = error.response.data;
        Object.keys(errorData).forEach((key) => {
          if (Array.isArray(errorData[key])) {
            errorData[key].forEach((msg) => {
              toast.error(`${key}: ${msg}`);
            });
          } else {
            toast.error(`${key}: ${errorData[key]}`);
          }
        });
      } else if (error.response?.status === 401) {
        toast.error(t("Authentication required. Please login."));
      } else {
        toast.error(
          error.response?.data?.message || t("Failed to update company"),
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ** Helper function for status badges
  const getStatusBadge = (status) => {
    if (status === 1 || status === "1") return "success";
    if (status === 2 || status === "2") return "secondary";
    return "secondary";
  };

  // ** Helper function to get status display text
  const getStatusDisplayText = (status) => {
    if (status === 1 || status === "1") return t("active");
    if (status === 2 || status === "2") return t("inactive");
    return "Unknown";
  };

  // ** Company columns configuration
  const columns = [
    {
      name: t("ID"),
      selector: (row) => row.id,
      sortable: true,
      width: "70px",
    },
    {
      name: t("Company_Name"),
      selector: (row) => row.company_name || "N/A",
      sortable: true,
      minWidth: "150px",
    },
    {
      name: t("company_leader"),
      selector: (row) => row.leader_name || "N/A",
      sortable: true,
      minWidth: "120px",
    },
    {
      name: t("Phone"),
      selector: (row) => row.phone || "N/A",
      sortable: true,
      width: "120px",
    },
    {
      name: t("Company Type"),
      selector: (row) => row.company_type || "N/A",
      sortable: true,
      width: "120px",
    },
    {
      name: t("TIN Number"),
      selector: (row) => row.TIN_number || "N/A",
      sortable: true,
      width: "110px",
    },
    // NEW: Added Licence Number column
    {
      name: t("Licence Number"),
      selector: (row) => row.licence_number || "N/A",
      sortable: true,
      width: "130px",
    },
    {
      name: t("Status"),
      selector: (row) => getStatusDisplayText(row.status),
      sortable: true,
      width: "100px",
      cell: (row) => {
        const statusValue = row.status;
        const badgeColor = getStatusBadge(statusValue);
        const displayText = getStatusDisplayText(statusValue);

        return (
          <Badge color={badgeColor} className="text-capitalize">
            {displayText}
          </Badge>
        );
      },
    },
    {
      name: t("Vehicles"),
      width: "80px",
      center: true,
      cell: (row) => (
        <Button
          color="primary"
          size="sm"
          onClick={() => handleViewVehiclesClick(row)}
          className="btn-icon"
          title={t("View Vehicles")}
        >
          <Truck size={12} />
        </Button>
      ),
    },
    {
      name: t("Maktoob"),
      width: "80px",
      center: true,
      cell: (row) => (
        <Button
          color="info"
          size="sm"
          onClick={() => handleMaktoobClick(row)}
          className="btn-icon"
          title={t("View Maktoob")}
        >
          <FileText size={12} />
        </Button>
      ),
    },
    {
      name: t("Contract Info"),
      width: "100px",
      center: true,
      cell: (row) => (
        <Button
          color="success"
          size="sm"
          onClick={() => handleKhoshKharidClick(row)}
          className="btn-icon"
          title={t("Contract Info")}
        >
          <ShoppingCart size={12} />
        </Button>
      ),
    },
    {
      name: t("Actions"),
      width: "120px",
      cell: (row) => (
        <div className="d-flex gap-1">
          <Button
            color="primary"
            size="sm"
            onClick={() => handleEdit(row)}
            className="btn-icon"
            title={t("Edit")}
          >
            <Edit size={12} />
          </Button>
          <Button
            color="danger"
            size="sm"
            onClick={() => handleDeleteClick(row.id)}
            className="btn-icon"
            title={t("Delete")}
          >
            <Trash2 size={12} />
          </Button>
        </div>
      ),
    },
  ];

  // ** Function to handle Pagination
  const handlePagination = (page) => {
    console.log("Changing to page:", page.selected + 1);
    setCurrentPage(page.selected);
    fetchCompanies(page.selected + 1);
  };

  // ** Toggle Filter Section
  const toggleFilter = () => setFilterOpen(!filterOpen);

  // ** Clear All Filters
  const clearFilters = () => {
    setSearchCompanyName("");
    setSearchLeaderName("");
    setSearchPhone("");
    setSearchCompanyType("");
    setSearchTIN("");
    setSearchLicenceNumber(""); // NEW: Clear licence number filter
    setSearchStatus("");
    setDateRange([]);
  };

  // ** Handle Add Company Button Click
  const handleAddCompanyClick = () => setAddCompanyModal(true);

  // ** Custom Pagination
  const CustomPagination = () => (
    <ReactPaginate
      previousLabel={""}
      nextLabel={""}
      forcePage={currentPage}
      onPageChange={handlePagination}
      pageCount={Math.ceil(totalCompanies / 7)}
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
      <ToastContainer position="top-left" autoClose={3000} />

      <Card>
        <CardHeader className="border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <CardTitle tag="h4" className="m-2">
                {t("Company Management")}
              </CardTitle>
              <Badge color="dark" className="ms-2 m-1 p-1">
                {totalCompanies} {t("Companies")}
              </Badge>
            </div>
            <div className="d-flex gap-1">
              <Button
                color="secondary"
                onClick={toggleFilter}
                className="d-flex align-items-center"
              >
                <Filter size={14} className="me-50" />
                {t("Filter")}
                {filterOpen && <X size={14} className="ms-50" />}
              </Button>
              <Button
                color="primary"
                onClick={handleAddCompanyClick}
                className="d-flex align-items-center"
              >
                <Plus size={14} className="me-50" />
                {t("Add Company")}
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Filter Section */}
        <Collapse isOpen={filterOpen}>
          <CardBody className="pt-0">
            <Row className="mt-1 mb-50">
              <Col lg="2" md="3" className="mb-1">
                <Label className="form-label" htmlFor="companyName">
                  {t("Company Name")}:
                </Label>
                <Input
                  id="companyName"
                  placeholder={t("Filter by company name")}
                  value={searchCompanyName}
                  onChange={(e) => setSearchCompanyName(e.target.value)}
                />
              </Col>

              <Col lg="2" md="3" className="mb-1">
                <Label className="form-label" htmlFor="leaderName">
                  {t("Leader Name")}:
                </Label>
                <Input
                  id="leaderName"
                  placeholder={t("Filter by leader")}
                  value={searchLeaderName}
                  onChange={(e) => setSearchLeaderName(e.target.value)}
                />
              </Col>

              <Col lg="2" md="6" className="mb-1">
                <Label className="form-label" htmlFor="phone">
                  {t("Phone")}:
                </Label>
                <Input
                  id="phone"
                  placeholder={t("Filter by phone")}
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                />
              </Col>

              <Col lg="2" md="6" className="mb-1">
                <Label className="form-label" htmlFor="companyType">
                  {t("Company Type")}:
                </Label>
                <Input
                  id="companyType"
                  placeholder={t("Filter by company type")}
                  value={searchCompanyType}
                  onChange={(e) => setSearchCompanyType(e.target.value)}
                />
              </Col>

              <Col lg="2" md="6" className="mb-1">
                <Label className="form-label" htmlFor="TIN">
                  {t("TIN Number")}:
                </Label>
                <Input
                  id="TIN"
                  placeholder={t("Filter by TIN")}
                  value={searchTIN}
                  onChange={(e) => setSearchTIN(e.target.value)}
                />
              </Col>

              {/* NEW: Licence Number Filter */}
              <Col lg="2" md="6" className="mb-1">
                <Label className="form-label" htmlFor="licenceNumber">
                  {t("Licence Number")}:
                </Label>
                <Input
                  id="licenceNumber"
                  placeholder={t("Filter by licence number")}
                  value={searchLicenceNumber}
                  onChange={(e) => setSearchLicenceNumber(e.target.value)}
                />
              </Col>

              <Col lg="1" md="6" className="mb-1">
                <Label className="form-label" htmlFor="status">
                  {t("Status")}:
                </Label>
                <Input
                  type="select"
                  id="status"
                  value={searchStatus}
                  onChange={(e) => setSearchStatus(e.target.value)}
                >
                  <option value="">{t("All Status")}</option>
                  <option value="1">{t("Active")}</option>
                  <option value="2">{t("Inactive")}</option>
                </Input>
              </Col>

              <Col
                lg="11"
                className="mb-1 d-flex align-items-end justify-content-end"
              >
                <Button
                  color="outline-secondary"
                  onClick={clearFilters}
                  className="me-1"
                >
                  {t("Clear Filters")}
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
              <p className="mt-2">{t("Loading companies...")}</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">{t("No companies found")}</p>
            </div>
          ) : (
            <div className="react-dataTable">
              <DataTable
                noHeader
                pagination
                columns={columns}
                paginationPerPage={10}
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

      {/* Add Company Modal */}
      <Modal isOpen={addCompanyModal} toggle={closeModals} size="lg">
        <ModalHeader toggle={closeModals}>{t("Add New Company")}</ModalHeader>
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
          {t("Edit Company")} - {selectedCompany?.company_name}
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
        <ModalHeader toggle={closeModals}>{t("Delete Company")}</ModalHeader>
        <ModalBody>
          <p>
            {t(
              "Are you sure you want to delete this company? This action cannot be undone.",
            )}
          </p>
          {selectedCompany && (
            <div className="mt-2">
              <strong>{selectedCompany.company_name}</strong>
              <br />
              <small className="text-muted">
                {t("TIN:")} {selectedCompany.TIN_number}
              </small>
              <br />
              <small className="text-muted">
                {t("Licence:")} {selectedCompany.licence_number || "N/A"}
              </small>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={closeModals}>
            {t("Cancel")}
          </Button>
          <Button color="danger" onClick={handleDeleteConfirm}>
            <Trash2 size={14} className="me-50" />
            {t("Delete")}
          </Button>
        </ModalFooter>
      </Modal>
    </Fragment>
  );
};

export default CompanyTable;
