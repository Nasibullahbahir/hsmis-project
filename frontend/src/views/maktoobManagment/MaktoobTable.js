// ** React Imports
import { useState, Fragment, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

// ** Import Maktoob Data and Functions
import {
  getMaktoobs,
  getMaktoobFilters,
  getMaktoobsByCompany,
  addMaktoob,
  updateMaktoob,
  deleteMaktoob,
} from "../../dummyData/maktoobData.js";

// ** Third Party Components
import ReactPaginate from "react-paginate/index.js";
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

// ** Import MaktoobInfo Component
import MaktoobInfo from "./addMaktoob/AddNewMaktoob.js";

const MaktoobTable = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // ** Get company data from navigation state
  const { company, fromCompany } = location.state || {};

  // ** States - Only specified filters
  const [searchMaktoobNumber, setSearchMaktoobNumber] = useState("");
  const [searchMaktoobType, setSearchMaktoobType] = useState("");
  const [searchCompanyName, setSearchCompanyName] = useState("");
  const [searchSadirDate, setSearchSadirDate] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [filteredData, setFilteredData] = useState([]);
  const [maktoobs, setMaktoobs] = useState([]);
  const [filters, setFilters] = useState({});
  const [filterOpen, setFilterOpen] = useState(false);

  // ** Modal States
  const [addMaktoobModal, setAddMaktoobModal] = useState(false);
  const [editMaktoobModal, setEditMaktoobModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedMaktoob, setSelectedMaktoob] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ** Initialize data
  useEffect(() => {
    const loadData = () => {
      const maktoobsData = getMaktoobs();
      const filtersData = getMaktoobFilters();
      setMaktoobs(maktoobsData);
      setFilters(filtersData);
    };

    loadData();
  }, []);

  // ** Filter maktoobs by company when component mounts or company changes
  useEffect(() => {
    if (fromCompany && company) {
      const companyMaktoobs = getMaktoobsByCompany(company.company_name);
      setMaktoobs(companyMaktoobs);
    }
  }, [company, fromCompany]);

  // ** Apply filters automatically when search criteria or maktoobs change
  useEffect(() => {
    applyFilters();
  }, [
    searchMaktoobNumber,
    searchMaktoobType,
    searchCompanyName,
    searchSadirDate,
    maktoobs,
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
    setSearchMaktoobNumber("");
    setSearchMaktoobType("");
    setSearchCompanyName("");
    setSearchSadirDate("");
  };

  // ** Handle Edit Click
  const handleEdit = (maktoob) => {
    setSelectedMaktoob(maktoob);
    setEditMaktoobModal(true);
  };

  // ** Handle Delete Click
  const handleDeleteClick = (maktoobId) => {
    setSelectedMaktoob(
      maktoobs.find((maktoob) => maktoob.maktoob_id === maktoobId)
    );
    setDeleteModal(true);
  };

  // ** Get translated columns with only specified fields
  const columns = [
    {
      name: t("maktoob_id") || "Maktoob ID",
      selector: (row) => row.maktoob_id,
      sortable: true,
      minWidth: "100px",
    },
    {
      name: t("maktoob_type") || "Maktoob Type",
      selector: (row) => row.maktoob_type,
      sortable: true,
      minWidth: "150px",
    },
    {
      name: t("maktoob_number") || "Maktoob Number",
      selector: (row) => row.maktoob_number,
      sortable: true,
      minWidth: "150px",
    },
    {
      name: t("maktoob_scan") || "Maktoob Scan",
      selector: (row) => row.maktoob_scan || "-",
      sortable: true,
      minWidth: "120px",
    },
    {
      name: t("sadir_date") || "Sadir Date",
      selector: (row) => row.sadir_date,
      sortable: true,
      minWidth: "120px",
    },
    {
      name: t("company_name") || "Company Name",
      selector: (row) => row.company_name,
      sortable: true,
      minWidth: "200px",
    },
    {
      name: t("source") || "Source",
      selector: (row) => row.source,
      sortable: true,
      minWidth: "150px",
    },
    {
      name: t("start_date") || "Start Date",
      selector: (row) => row.start_date,
      sortable: true,
      minWidth: "120px",
    },
    {
      name: t("end_date") || "End Date",
      selector: (row) => row.end_date,
      sortable: true,
      minWidth: "120px",
    },
    {
      name: t("status") || "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => {
        let color = "secondary";
        switch (row.status) {
          case "completed":
            color = "success";
            break;
          case "in-progress":
            color = "warning";
            break;
          case "cancelled":
            color = "danger";
            break;
          default:
            color = "secondary";
        }
        return <Badge color={color}>{row.status}</Badge>;
      },
      minWidth: "130px",
    },
    {
      name: t("description") || "Description",
      selector: (row) => row.description,
      sortable: true,
      minWidth: "250px",
      wrap: true,
      cell: (row) => (
        <div
          style={{
            whiteSpace: "normal",
            wordWrap: "break-word",
            maxWidth: "250px",
          }}
        >
          {row.description || "-"}
        </div>
      ),
    },
    {
      name: t("actions") || "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          <Button color="primary" size="sm" onClick={() => handleEdit(row)}>
            <Edit size={14} />
          </Button>
          <Button
            color="danger"
            size="sm"
            onClick={() => handleDeleteClick(row.maktoob_id)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
      minWidth: "120px",
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  // ** Function to handle Pagination
  const handlePagination = (page) => setCurrentPage(page.selected);

  // ** Table data to render
  const dataToRender = () => {
    if (
      searchMaktoobNumber.length ||
      searchMaktoobType.length ||
      searchCompanyName.length ||
      searchSadirDate.length
    ) {
      return filteredData;
    } else {
      return maktoobs;
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

  // ** Main filter function - Only specified filters
  const applyFilters = () => {
    let updatedData = maktoobs;

    // Filter by maktoob number
    if (searchMaktoobNumber) {
      updatedData = updatedData.filter((item) =>
        item.maktoob_number
          .toLowerCase()
          .includes(searchMaktoobNumber.toLowerCase())
      );
    }

    // Filter by maktoob type
    if (searchMaktoobType) {
      updatedData = updatedData.filter(
        (item) => item.maktoob_type === searchMaktoobType
      );
    }

    // Filter by company name
    if (searchCompanyName) {
      updatedData = updatedData.filter((item) =>
        item.company_name
          .toLowerCase()
          .includes(searchCompanyName.toLowerCase())
      );
    }

    // Filter by sadir date
    if (searchSadirDate) {
      updatedData = updatedData.filter((item) =>
        item.sadir_date.includes(searchSadirDate)
      );
    }

    setFilteredData(updatedData);
  };

  // ** Handle Delete Confirmation
  const handleDeleteConfirm = () => {
    if (selectedMaktoob) {
      const updatedMaktoobs = deleteMaktoob(selectedMaktoob.maktoob_id);
      setMaktoobs(updatedMaktoobs);
      setDeleteModal(false);
      setSelectedMaktoob(null);
      showAlert("success", "Maktoob deleted successfully!");
    }
  };

  // ** Handle Add Maktoob Submission
  const handleAddMaktoobSubmit = (maktoobData) => {
    setIsSubmitting(true);

    console.log("Adding new maktoob:", maktoobData);

    // Validate required fields
    if (!maktoobData.maktoob_number) {
      setIsSubmitting(false);
      showAlert("error", "Maktoob number is required!");
      return;
    }

    // Simulate API call delay
    setTimeout(() => {
      try {
        // Prepare the data for the table with specified fields
        const newMaktoobData = {
          // Map specified form fields
          maktoob_type: maktoobData.maktoob_type || "maktoob-contract",
          maktoob_number: maktoobData.maktoob_number || "",
          maktoob_scan: maktoobData.maktoob_scan || null, // This should now be a string (file name), not a File object
          sadir_date: maktoobData.sadir_date || "",
          company_name:
            fromCompany && company
              ? company.company_name
              : maktoobData.company_name || "",
          source: maktoobData.source || "",
          start_date: maktoobData.start_date || "",
          end_date: maktoobData.end_date || "",
          status: maktoobData.status || "pending",
          description: maktoobData.description || "",
          // Add current date as maktoob_date for the table
          maktoob_date: new Date().toISOString().split("T")[0],
        };

        console.log("Processed maktoob data:", newMaktoobData);

        // Add the maktoob to the data - ID will be auto-generated
        const updatedMaktoobs = addMaktoob(newMaktoobData);
        setMaktoobs(updatedMaktoobs);

        // Close modal and show success message
        setAddMaktoobModal(false);
        setIsSubmitting(false);
        showAlert("success", "Maktoob added successfully!");

        // Clear any active filters to show the new data
        clearFilters();
      } catch (error) {
        console.error("Error adding maktoob:", error);
        setIsSubmitting(false);
        showAlert("error", "Failed to add maktoob. Please try again.");
      }
    }, 1000);
  };

  // ** Handle Edit Maktoob Submission
  const handleEditMaktoobSubmit = (maktoobData) => {
    setIsSubmitting(true);

    console.log("Editing maktoob ID:", selectedMaktoob?.maktoob_id);
    console.log("New maktoob data:", maktoobData);

    // Simulate API call delay
    setTimeout(() => {
      try {
        if (selectedMaktoob) {
          // Prepare the updated data with specified fields
          const updatedMaktoobData = {
            // Map specified form data
            maktoob_type: maktoobData.maktoob_type || "maktoob-contract",
            maktoob_number: maktoobData.maktoob_number || "",
            maktoob_scan: maktoobData.maktoob_scan || null, // This should now be a string (file name), not a File object
            sadir_date: maktoobData.sadir_date || "",
            company_name: maktoobData.company_name || "",
            source: maktoobData.source || "",
            start_date: maktoobData.start_date || "",
            end_date: maktoobData.end_date || "",
            status: maktoobData.status || "pending",
            description: maktoobData.description || "",
            // Preserve existing fields that aren't in the form
            maktoob_date: selectedMaktoob.maktoob_date,
          };

          const updatedMaktoobs = updateMaktoob(
            selectedMaktoob.maktoob_id,
            updatedMaktoobData
          );

          setMaktoobs(updatedMaktoobs);
          setEditMaktoobModal(false);
          setSelectedMaktoob(null);
          setIsSubmitting(false);
          showAlert("success", "Maktoob updated successfully!");
        } else {
          setIsSubmitting(false);
          showAlert("error", "No maktoob selected for editing");
        }
      } catch (error) {
        console.error("Error updating maktoob:", error);
        setIsSubmitting(false);
        showAlert("error", "Failed to update maktoob. Please try again.");
      }
    }, 1000);
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

        {/* Filter Section - Only specified filters */}
        <Collapse isOpen={filterOpen}>
          <CardBody className="pt-0">
            <Row className="mt-1 mb-50">
              {/* Maktoob Number Filter */}
              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="maktoobNumber">
                  {t("maktoob_number") || "Maktoob Number"}:
                </Label>
                <Input
                  id="maktoobNumber"
                  placeholder={
                    t("filter_by_maktoob_number") || "Filter by Maktoob Number"
                  }
                  value={searchMaktoobNumber}
                  onChange={(e) => setSearchMaktoobNumber(e.target.value)}
                />
              </Col>

              {/* Maktoob Type Filter */}
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
                  <option value="maktoob-contract">
                    {t("maktoob_contract")}
                  </option>
                  <option value="maktoob-tamded">{t("maktoob_tamded")}</option>
                  <option value="maktoob-khosh">{t("maktoob_sale")}</option>
                  <option value="maktoob-royality">
                    {t("maktoob_royality")}
                  </option>
                  <option value="maktoob-baharbardry">
                    {t("maktoob_baharbardry")}
                  </option>
                  <option value="maktoob-paskha">{t("maktoob_paskha")}</option>
                  <option value="maktoob-process">
                    {t("maktoob_process")}
                  </option>
                </Input>
              </Col>

              {/* Company Name Filter */}
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

              {/* Sadir Date Filter */}
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

              {/* Filter Actions */}
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

      {/* Add Maktoob Modal */}
      <Modal isOpen={addMaktoobModal} toggle={closeModals} size="lg">
        <ModalHeader toggle={closeModals}>
          {t("add_new_maktoob") || "Add New Maktoob"}
          {fromCompany && company && ` - ${company.company_name}`}
        </ModalHeader>
        <ModalBody>
          <MaktoobInfo
            isModal={true}
            onSuccess={handleAddMaktoobSubmit}
            onCancel={closeModals}
            selectedCompany={fromCompany ? company : null}
            loading={isSubmitting}
            isEdit={false}
          />
        </ModalBody>
      </Modal>

      {/* Edit Maktoob Modal */}
      <Modal isOpen={editMaktoobModal} toggle={closeModals} size="lg">
        <ModalHeader toggle={closeModals}>
          {t("edit_maktoob") || "Edit Maktoob"} - {selectedMaktoob?.maktoob_id}
        </ModalHeader>
        <ModalBody>
          <MaktoobInfo
            isModal={true}
            onSuccess={handleEditMaktoobSubmit}
            onCancel={closeModals}
            initialData={selectedMaktoob}
            loading={isSubmitting}
            isEdit={true}
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
              <strong>Maktoob Number: {selectedMaktoob.maktoob_number}</strong>
              <br />
              <strong>Company: {selectedMaktoob.company_name}</strong>
              <br />
              <strong>Type: {selectedMaktoob.maktoob_type}</strong>
              <br />
              <small className="text-muted">
                ID: {selectedMaktoob.maktoob_id} | Status:{" "}
                {selectedMaktoob.status}
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
