// ** React Imports
import { useState, Fragment, useEffect } from "react";
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
  Truck, // Added Truck icon for vehicles
} from "react-feather";
import DataTable from "react-data-table-component";
import Flatpickr from "react-flatpickr";
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
  Collapse,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
  Badge,
  Spinner,
} from "reactstrap";

// ** Styles
import "@styles/react/libs/flatpickr/flatpickr.scss";

// ** API Base URL
const API_URL = "http://127.0.0.1:8000/test1";

// ** Status mapping
const statusMap = {
  1: "Active",
  2: "Inactive",
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
  const [searchStatus, setSearchStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [dateRange, setDateRange] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // ** Modal States
  const [addCompanyModal, setAddCompanyModal] = useState(false);
  const [editCompanyModal, setEditCompanyModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ** Fetch companies from API
  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/companies/`);
      const companiesData = response.data.results || response.data;
      setCompanies(companiesData);
      setFilteredData(companiesData);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  // ** Initialize data
  useEffect(() => {
    fetchCompanies();
  }, []);

  // ** Apply filters when search criteria change
  useEffect(() => {
    let data = companies;

    if (searchCompanyName) {
      data = data.filter((company) =>
        company.company_name.toLowerCase().includes(searchCompanyName.toLowerCase())
      );
    }

    if (searchLeaderName) {
      data = data.filter((company) =>
        company.leader_name.toLowerCase().includes(searchLeaderName.toLowerCase())
      );
    }

    if (searchPhone) {
      data = data.filter((company) =>
        company.phone.includes(searchPhone)
      );
    }

    if (searchCompanyType) {
      data = data.filter((company) =>
        company.company_type.toLowerCase().includes(searchCompanyType.toLowerCase())
      );
    }

    if (searchTIN) {
      data = data.filter((company) =>
        company.TIN_number.toLowerCase().includes(searchTIN.toLowerCase())
      );
    }

    if (searchStatus) {
      data = data.filter((company) => Number(company.status) === Number(searchStatus));
    }

    if (dateRange.length === 2) {
      const [start, end] = dateRange;
      data = data.filter((company) => {
        const createDate = new Date(company.create_at);
        return createDate >= start && createDate <= end;
      });
    }

    setFilteredData(data);
  }, [
    searchCompanyName,
    searchLeaderName,
    searchPhone,
    searchCompanyType,
    searchTIN,
    searchStatus,
    dateRange,
    companies,
  ]);

  // ** Handle Edit Click
  const handleEdit = (company) => {
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
        await axios.delete(`${API_URL}/companies/${selectedCompany.id}/`);
        toast.success("Company deleted successfully!");
        fetchCompanies(); // Refresh the list
        setDeleteModal(false);
        setSelectedCompany(null);
      } catch (error) {
        console.error("Error deleting company:", error);
        toast.error("Failed to delete company");
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

// ** Handle Khosh Kharid Button Click
const handleKhoshKharidClick = (company) => {
  console.log("Navigating to contract sales with company:", company);
  navigate("/contract-sales", {
    state: {
      company,
      fromCompany: true,
    },
  });
  toast.info(`Redirecting to Contract/Sales for ${company.company_name}`);
};

// ** Handle View Vehicles Button Click
// ** Handle View Vehicles Button Click - UPDATE THIS
const handleViewVehiclesClick = (company) => {
  navigate("/vehicles", {
    state: {
      company: {
        id: company.id,
        company_name: company.company_name,
        // Include other necessary fields
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
      // Format data for Django backend
      const formattedData = {
        company_name: companyData.companyName,
        leader_name: companyData.leaderName,
        phone: companyData.phone,
        company_type: companyData.companyType,
        TIN_number: companyData.TIN,
        status: companyData.status === "active" ? 1 : 2,
        create_at: companyData.registrationDate || new Date().toISOString().split('T')[0],
        update_at: new Date().toISOString().split('T')[0],
      };

      const response = await axios.post(`${API_URL}/companies/`, formattedData);
      
      if (response.status === 201) {
        toast.success("Company added successfully!");
        setAddCompanyModal(false);
        fetchCompanies(); // Refresh the list
      }
    } catch (error) {
      console.error("Error adding company:", error);
      toast.error(error.response?.data?.message || "Failed to add company");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ** Handle Edit Company Submission
  const handleEditCompany = async (companyData) => {
    setIsSubmitting(true);
    
    try {
      // Format data for Django backend
      const formattedData = {
        company_name: companyData.companyName,
        leader_name: companyData.leaderName,
        phone: companyData.phone,
        company_type: companyData.companyType,
        TIN_number: companyData.TIN,
        status: companyData.status === "active" ? 1 : 2,
        update_at: new Date().toISOString().split('T')[0],
      };

      const response = await axios.put(
        `${API_URL}/companies/${selectedCompany.id}/`,
        formattedData
      );
      
      if (response.status === 200) {
        toast.success("Company updated successfully!");
        setEditCompanyModal(false);
        setSelectedCompany(null);
        fetchCompanies(); // Refresh the list
      }
    } catch (error) {
      console.error("Error updating company:", error);
      toast.error(error.response?.data?.message || "Failed to update company");
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
    if (status === 1 || status === "1") return t("active") || "Active";
    if (status === 2 || status === "2") return t("inactive") || "Inactive";
    return "Unknown";
  };

  // ** Company columns configuration
  const columns = [
    {
      name: t("id") || "ID",
      selector: (row) => row.id,
      sortable: true,
      width: "70px",
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
      width: "120px",
    },
    {
      name: t("company_type") || "Company Type",
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
      name: t("status") || "Status",
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
      name: t("registration_date") || "Date",
      selector: (row) => row.create_at,
      sortable: true,
      width: "110px",
    },
    {
      name: t("vehicles") || "Vehicles",
      width: "100px",
      center: true,
      cell: (row) => (
        <Button
          color="primary"
          size="sm"
          onClick={() => handleViewVehiclesClick(row)}
          className="btn-icon"
          title={t("view_vehicles") || "View Vehicles"}
        >
          <Truck size={12} /> {/* Changed to Truck icon */}
        </Button>
      ),
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
      name: t("contract_info") || "Contract/Sales",
      width: "120px",
      center: true,
      cell: (row) => (
        <Button
          color="success"
          size="sm"
          onClick={() => handleKhoshKharidClick(row)}
          className="btn-icon"
          title={t("contract_info") || "Contract/Sales"}
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
            onClick={() => handleDeleteClick(row.id)}
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

  // ** Toggle Filter Section
  const toggleFilter = () => setFilterOpen(!filterOpen);

  // ** Clear All Filters
  const clearFilters = () => {
    setSearchCompanyName("");
    setSearchLeaderName("");
    setSearchPhone("");
    setSearchCompanyType("");
    setSearchTIN("");
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

  return (
    <Fragment>
      <ToastContainer position="top-right" autoClose={3000} />
      
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
                <Label className="form-label" htmlFor="companyType">
                  {t("company_type") || "Company Type"}:
                </Label>
                <Input
                  id="companyType"
                  placeholder={
                    t("filter_by_company_type") || "Filter by Company Type"
                  }
                  value={searchCompanyType}
                  onChange={(e) => setSearchCompanyType(e.target.value)}
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
              <p className="mt-2">Loading companies...</p>
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
          {t("edit_company") || "Edit Company"} - {selectedCompany?.company_name}
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
                TIN: {selectedCompany.TIN_number}
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