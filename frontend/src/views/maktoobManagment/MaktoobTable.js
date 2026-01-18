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
  Badge,
  Collapse,
  Spinner,
} from "reactstrap";

// ** Import MaktoobInfo Component
import MaktoobInfo from "./addMaktoob/AddNewMaktoob.js";

// ** API Base URL
const API_URL = "http://127.0.0.1:8000/test1";

// ** Maktoob Type mapping
const maktoobTypeMap = {
  "maktoob-contract": "Maktoob Contract",
  "maktoob-tamded": "Maktoob Tamded",
  "maktoob-khosh": "Maktoob Sale",
  "maktoob-royality": "Maktoob Royalty",
  "maktoob-baharbardry": "Maktoob Baharbardry",
  "maktoob-paskha": "Maktoob Paskha",
  "maktoob-process": "Maktoob Process",
};

const MaktoobTable = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // ** Get company data from navigation state OR URL parameters
  const { company: companyFromState, fromCompany: fromCompanyState } = location.state || {};
  const searchParams = new URLSearchParams(location.search);
  const companyIdFromUrl = searchParams.get('companyId');
  const companyNameFromUrl = searchParams.get('companyName');
  
  // ** Use state if available, otherwise use URL parameters
  const company = companyFromState || (companyIdFromUrl ? {
    id: parseInt(companyIdFromUrl),
    company_name: decodeURIComponent(companyNameFromUrl || '')
  } : null);
  
  const fromCompany = fromCompanyState || !!companyIdFromUrl;

  // ** States
  const [searchMaktoobNumber, setSearchMaktoobNumber] = useState("");
  const [searchMaktoobType, setSearchMaktoobType] = useState("");
  const [searchCompanyName, setSearchCompanyName] = useState("");
  const [searchSadirDate, setSearchSadirDate] = useState("");
  const [searchSource, setSearchSource] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [dateRange, setDateRange] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [maktoobs, setMaktoobs] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);

  // ** Modal States
  const [addMaktoobModal, setAddMaktoobModal] = useState(false);
  const [editMaktoobModal, setEditMaktoobModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedMaktoob, setSelectedMaktoob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ** Fetch maktoobs from API
  const fetchMaktoobs = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/maktoob/`;
      
      const response = await axios.get(url);
      
      // Handle both formats: results array or direct array
      let data = response.data.results || response.data;
      data = Array.isArray(data) ? data : [];

      // ** CRITICAL: Filter by company ID if fromCompany is true
      if (fromCompany && company) {
        console.log("Filtering maktoobs for company ID:", company.id);
        data = data.filter(maktoob => {
          // Check different formats of company data
          if (maktoob.company && typeof maktoob.company === 'object') {
            return maktoob.company.id === company.id;
          } else if (maktoob.company) {
            return parseInt(maktoob.company) === parseInt(company.id);
          }
          return false;
        });
        console.log("Filtered maktoobs count:", data.length);
      }

      setMaktoobs(data);
      setFilteredData(data);
      toast.success(`Loaded ${data.length} maktoobs for ${fromCompany ? company.company_name : 'all companies'}`);
    } catch (error) {
      console.error("Error fetching maktoobs:", error);
      toast.error("Failed to load maktoobs");
    } finally {
      setLoading(false);
    }
  };

  // ** Fetch users for dropdown
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/`);
      const data = response.data.results || response.data;
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    }
  };

  // ** Fetch companies for dropdown
  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${API_URL}/companies/`);
      const data = response.data.results || response.data;
      setCompanies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast.error("Failed to load companies");
    }
  };

  // ** Initialize data
  useEffect(() => {
    console.log("MaktoobTable mounted with:", { fromCompany, company });
    fetchMaktoobs();
    fetchUsers();
    fetchCompanies();
  }, [company, fromCompany]);

  // ** Apply filters when search criteria change
  useEffect(() => {
    let data = maktoobs;

    if (searchMaktoobNumber) {
      data = data.filter((m) =>
        m.maktoob_number.toString().includes(searchMaktoobNumber)
      );
    }

    if (searchMaktoobType) {
      data = data.filter((m) => m.maktoob_type === searchMaktoobType);
    }

    if (searchCompanyName && !fromCompany) {
      data = data.filter((m) =>
        m.company?.company_name?.toLowerCase().includes(searchCompanyName.toLowerCase())
      );
    }

    if (searchSadirDate) {
      data = data.filter((m) => 
        m.sadir_date && m.sadir_date.includes(searchSadirDate)
      );
    }

    if (searchSource) {
      data = data.filter((m) =>
        m.source?.toLowerCase().includes(searchSource.toLowerCase())
      );
    }

    if (dateRange.length === 2) {
      const [start, end] = dateRange;
      data = data.filter((m) => {
        const createDate = new Date(m.create_at);
        return createDate >= start && createDate <= end;
      });
    }

    setFilteredData(data);
  }, [
    searchMaktoobNumber,
    searchMaktoobType,
    searchCompanyName,
    searchSadirDate,
    searchSource,
    dateRange,
    maktoobs,
  ]);

  // ** Handle Back Button Click
  const handleBackClick = () => {
    navigate(-1);
  };

  // ** Toggle Filter Section
  const toggleFilter = () => setFilterOpen(!filterOpen);

  // ** Clear All Filters
  const clearFilters = () => {
    setSearchMaktoobNumber("");
    setSearchMaktoobType("");
    setSearchCompanyName("");
    setSearchSadirDate("");
    setSearchSource("");
    setDateRange([]);
  };

  // ** Handle Edit Click
  const handleEdit = (maktoob) => {
    setSelectedMaktoob(maktoob);
    setEditMaktoobModal(true);
  };

  // ** Handle Delete Click
  const handleDeleteClick = (maktoobId) => {
    const maktoob = maktoobs.find((m) => m.id === maktoobId);
    setSelectedMaktoob(maktoob);
    setDeleteModal(true);
  };

  // ** Table columns configuration based on Django model
  const columns = [
    {
      name: t("id") || "ID",
      selector: (row) => row.id,
      sortable: true,
      width: "70px",
    },
    {
      name: t("maktoob_type") || "Maktoob Type",
      selector: (row) => maktoobTypeMap[row.maktoob_type] || row.maktoob_type,
      sortable: true,
      minWidth: "150px",
    },
    {
      name: t("maktoob_number") || "Maktoob Number",
      selector: (row) => row.maktoob_number,
      sortable: true,
      minWidth: "120px",
    },
    {
      name: t("sadir_date") || "Sadir Date",
      selector: (row) => row.sadir_date ? new Date(row.sadir_date).toLocaleDateString() : "N/A",
      sortable: true,
      minWidth: "120px",
    },
    {
      name: t("source") || "Source",
      selector: (row) => row.source || "N/A",
      sortable: true,
      minWidth: "150px",
    },
    {
      name: t("start_date") || "Start Date",
      selector: (row) => row.start_date ? new Date(row.start_date).toLocaleDateString() : "N/A",
      sortable: true,
      minWidth: "120px",
    },
    {
      name: t("end_date") || "End Date",
      selector: (row) => row.end_date ? new Date(row.end_date).toLocaleDateString() : "N/A",
      sortable: true,
      minWidth: "120px",
    },
    {
      name: t("company") || "Company",
      selector: (row) => row.company?.company_name || "N/A",
      sortable: true,
      minWidth: "180px",
    },
    {
      name: t("user") || "User",
      selector: (row) => row.user?.username || "N/A",
      sortable: true,
      minWidth: "120px",
    },
    {
      name: t("description") || "Description",
      selector: (row) => row.description || "-",
      sortable: true,
      minWidth: "200px",
      cell: (row) => (
        <div
          style={{
            whiteSpace: "normal",
            wordWrap: "break-word",
            maxWidth: "200px",
          }}
        >
          {row.description || "-"}
        </div>
      ),
    },
    {
      name: t("created_at") || "Created At",
      selector: (row) => row.create_at ? new Date(row.create_at).toLocaleDateString() : "N/A",
      sortable: true,
      minWidth: "120px",
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
          >
            <Edit size={14} />
          </Button>
          <Button
            color="danger"
            size="sm"
            onClick={() => handleDeleteClick(row.id)}
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
    if (selectedMaktoob) {
      try {
        await axios.delete(`${API_URL}/maktoob/${selectedMaktoob.id}/`);
        toast.success("Maktoob deleted successfully!");
        fetchMaktoobs(); // Refresh the list
        setDeleteModal(false);
        setSelectedMaktoob(null);
      } catch (error) {
        console.error("Error deleting maktoob:", error);
        toast.error(error.response?.data?.detail || "Failed to delete maktoob");
      }
    }
  };

  // ** Handle Add Maktoob Submission
  const handleAddMaktoobSubmit = async (maktoobData) => {
    setIsSubmitting(true);
    
    try {
      // Format data for Django backend - only fields from the model
      const formattedData = {
        maktoob_type: maktoobData.maktoob_type,
        maktoob_number: parseInt(maktoobData.maktoob_number),
        sadir_date: maktoobData.sadir_date,
        source: maktoobData.source,
        start_date: maktoobData.start_date,
        end_date: maktoobData.end_date,
        description: maktoobData.description,
        company: fromCompany ? company.id : maktoobData.company,
        user: maktoobData.user,
      };

      const response = await axios.post(`${API_URL}/maktoob/`, formattedData);
      
      if (response.status === 201) {
        toast.success("Maktoob added successfully!");
        setAddMaktoobModal(false);
        fetchMaktoobs(); // Refresh the list
      }
    } catch (error) {
      console.error("Error adding maktoob:", error);
      const errorMsg = error.response?.data;
      if (typeof errorMsg === 'object') {
        // Display all validation errors
        Object.keys(errorMsg).forEach(key => {
          toast.error(`${key}: ${errorMsg[key]}`);
        });
      } else {
        toast.error(errorMsg || "Failed to add maktoob");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ** Handle Edit Maktoob Submission
  const handleEditMaktoobSubmit = async (maktoobData) => {
    setIsSubmitting(true);
    
    try {
      // Format data for Django backend - only fields from the model
      const formattedData = {
        maktoob_type: maktoobData.maktoob_type,
        maktoob_number: parseInt(maktoobData.maktoob_number),
        sadir_date: maktoobData.sadir_date,
        source: maktoobData.source,
        start_date: maktoobData.start_date,
        end_date: maktoobData.end_date,
        description: maktoobData.description,
        company: fromCompany ? company.id : maktoobData.company,
        user: maktoobData.user,
      };

      const response = await axios.put(
        `${API_URL}/maktoob/${selectedMaktoob.id}/`,
        formattedData
      );
      
      if (response.status === 200) {
        toast.success("Maktoob updated successfully!");
        setEditMaktoobModal(false);
        setSelectedMaktoob(null);
        fetchMaktoobs(); // Refresh the list
      }
    } catch (error) {
      console.error("Error updating maktoob:", error);
      const errorMsg = error.response?.data;
      if (typeof errorMsg === 'object') {
        Object.keys(errorMsg).forEach(key => {
          toast.error(`${key}: ${errorMsg[key]}`);
        });
      } else {
        toast.error(errorMsg || "Failed to update maktoob");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ** Handle Add Maktoob Button Click
  const handleAddMaktoobClick = () => {
    setAddMaktoobModal(true);
  };

  // ** Close Modals
  const closeModals = () => {
    setAddMaktoobModal(false);
    setEditMaktoobModal(false);
    setDeleteModal(false);
    setSelectedMaktoob(null);
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
                  ? `${t("maktoob_management") || "Maktoob Management"} - ${
                      company.company_name
                    }`
                  : t("maktoob_management") || "Maktoob Management"}
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
                onClick={handleAddMaktoobClick}
                className="d-flex align-items-center"
              >
                <Plus size={14} className="me-50" />
                {t("add_maktoob") || "Add Maktoob"}
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Filter Section */}
        <Collapse isOpen={filterOpen}>
          <CardBody className="pt-0">
            <Row className="mt-1 mb-50">
              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="maktoobNumber">
                  {t("maktoob_number") || "Maktoob Number"}:
                </Label>
                <Input
                  id="maktoobNumber"
                  type="number"
                  placeholder={
                    t("filter_by_maktoob_number") || "Filter by Maktoob Number"
                  }
                  value={searchMaktoobNumber}
                  onChange={(e) => setSearchMaktoobNumber(e.target.value)}
                />
              </Col>

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="maktoobType">
                  {t("maktoob_type") || "Maktoob Type"}:
                </Label>
                <Input
                  type="select"
                  id="maktoobType"
                  value={searchMaktoobType}
                  onChange={(e) => setSearchMaktoobType(e.target.value)}
                >
                  <option value="">{t("all_types") || "All Types"}</option>
                  {Object.entries(maktoobTypeMap).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </Input>
              </Col>

              {/* Hide company filter when viewing specific company's maktoobs */}
              {!fromCompany && (
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
              )}

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="sadirDate">
                  {t("sadir_date") || "Sadir Date"}:
                </Label>
                <Input
                  type="date"
                  id="sadirDate"
                  value={searchSadirDate}
                  onChange={(e) => setSearchSadirDate(e.target.value)}
                />
              </Col>

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="source">
                  {t("source") || "Source"}:
                </Label>
                <Input
                  id="source"
                  placeholder={t("filter_by_source") || "Filter by Source"}
                  value={searchSource}
                  onChange={(e) => setSearchSource(e.target.value)}
                />
              </Col>

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="date">
                  {t("created_date") || "Created Date"}:
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
              <p className="mt-2">Loading maktoobs...</p>
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

      {/* Add Maktoob Modal */}
      <Modal isOpen={addMaktoobModal} toggle={closeModals} size="lg">
        <ModalHeader toggle={closeModals}>
          {t("add_new_maktoob") || "Add New Maktoob"}
          {fromCompany && company && ` - ${company.company_name}`}
        </ModalHeader>
        <ModalBody>
          <MaktoobInfo
            onSuccess={handleAddMaktoobSubmit}
            onCancel={closeModals}
            selectedCompany={fromCompany ? company : null}
            loading={isSubmitting}
            isEdit={false}
            users={users}
            companies={companies}
          />
        </ModalBody>
      </Modal>

      {/* Edit Maktoob Modal */}
      <Modal isOpen={editMaktoobModal} toggle={closeModals} size="lg">
        <ModalHeader toggle={closeModals}>
          {t("edit_maktoob") || "Edit Maktoob"} - {selectedMaktoob?.maktoob_number}
        </ModalHeader>
        <ModalBody>
          <MaktoobInfo
            onSuccess={handleEditMaktoobSubmit}
            onCancel={closeModals}
            initialData={selectedMaktoob}
            loading={isSubmitting}
            isEdit={true}
            users={users}
            companies={companies}
          />
        </ModalBody>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal} toggle={closeModals}>
        <ModalHeader toggle={closeModals}>
          {t("delete_maktoob") || "Delete Maktoob"}
        </ModalHeader>
        <ModalBody>
          <p>
            {t("delete_maktoob_confirmation") ||
              "Are you sure you want to delete this maktoob?"}
          </p>
          {selectedMaktoob && (
            <div className="mt-2">
              <strong>Maktoob #{selectedMaktoob.maktoob_number}</strong>
              <br />
              <small className="text-muted">
                Type: {maktoobTypeMap[selectedMaktoob.maktoob_type] || selectedMaktoob.maktoob_type} | 
                Company: {selectedMaktoob.company?.company_name || "N/A"}
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

export default MaktoobTable;