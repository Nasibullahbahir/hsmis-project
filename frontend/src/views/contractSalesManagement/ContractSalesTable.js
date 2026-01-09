// ** React Imports
import { useState, Fragment, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

// ** Import Contract Data and Functions
import {
  getContracts,
  getContractFilters,
  getContractsByCompany,
  addContract,
  updateContract,
  deleteContract,
} from "../../dummyData/contractData";

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

// ** Import AddNewContractSales Component
import AddNewContractSales from "./addContractSales/AddNewContractSales";

// ** Styles
import "@styles/react/libs/flatpickr/flatpickr.scss";

const ContractSalesTable = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // ** Get company data from navigation state
  const { company, fromCompany } = location.state || {};

  // Debug: log the received props
  console.log("ContractSalesTable received:", {
    company,
    fromCompany,
    locationState: location.state,
  });

  // ** States
  const [currentPage, setCurrentPage] = useState(0);
  const [dateRange, setDateRange] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [allContracts, setAllContracts] = useState([]); // Store all contracts
  const [filters, setFilters] = useState({});
  const [filterOpen, setFilterOpen] = useState(false);

  // ** Filter States
  const [searchArea, setSearchArea] = useState("");
  const [searchMineralAmount, setSearchMineralAmount] = useState("");
  const [searchUnitPrice, setSearchUnitPrice] = useState("");
  const [searchMineralTotalPrice, setSearchMineralTotalPrice] = useState("");
  const [searchRoyaltyReceiptNumber, setSearchRoyaltyReceiptNumber] =
    useState("");
  const [searchHaqWazanReceiptNumber, setSearchHaqWazanReceiptNumber] =
    useState("");
  const [searchWeighingTotalPrice, setSearchWeighingTotalPrice] = useState("");

  // ** Modal States
  const [addContractModal, setAddContractModal] = useState(false);
  const [editContractModal, setEditContractModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ** Initialize data
  useEffect(() => {
    const loadData = () => {
      const contractsData = getContracts();
      const filtersData = getContractFilters();
      setAllContracts(contractsData); // Store all contracts

      console.log("Location state:", location.state);
      console.log("Company data:", company);
      console.log("From company:", fromCompany);

      // If coming from company view, filter contracts by company
      if (fromCompany && company) {
        const companyContracts = getContractsByCompany(company.company_name);
        console.log(
          "Filtered contracts for company:",
          company.company_name,
          companyContracts
        );
        setContracts(companyContracts);
      } else {
        // If not from company view, show all contracts
        console.log("Showing all contracts:", contractsData);
        setContracts(contractsData);
      }

      setFilters(filtersData);
    };

    loadData();
  }, [company, fromCompany, location.state]); // Add location.state to dependencies

  // ** Apply filters automatically when search criteria or contracts change
  useEffect(() => {
    applyFilters();
  }, [
    searchArea,
    searchMineralAmount,
    searchUnitPrice,
    searchMineralTotalPrice,
    searchRoyaltyReceiptNumber,
    searchHaqWazanReceiptNumber,
    searchWeighingTotalPrice,
    dateRange,
    contracts,
  ]);

  // ** Main filter function
  const applyFilters = () => {
    let updatedData = contracts;

    // Filter by area
    if (searchArea) {
      updatedData = updatedData.filter((item) =>
        item.area.toLowerCase().includes(searchArea.toLowerCase())
      );
    }

    // Filter by mineral amount
    if (searchMineralAmount) {
      updatedData = updatedData.filter((item) =>
        item.mineralAmount.includes(searchMineralAmount)
      );
    }

    // Filter by unit price
    if (searchUnitPrice) {
      updatedData = updatedData.filter((item) =>
        item.unitPrice.includes(searchUnitPrice)
      );
    }

    // Filter by mineral total price
    if (searchMineralTotalPrice) {
      updatedData = updatedData.filter((item) =>
        item.mineralTotalPrice.includes(searchMineralTotalPrice)
      );
    }

    // Filter by royalty receipt number
    if (searchRoyaltyReceiptNumber) {
      updatedData = updatedData.filter((item) =>
        item.royaltyReceiptNumber
          .toLowerCase()
          .includes(searchRoyaltyReceiptNumber.toLowerCase())
      );
    }

    // Filter by haq wazan receipt number
    if (searchHaqWazanReceiptNumber) {
      updatedData = updatedData.filter((item) =>
        item.haqWazanReceiptNumber
          .toLowerCase()
          .includes(searchHaqWazanReceiptNumber.toLowerCase())
      );
    }

    // Filter by weighing total price
    if (searchWeighingTotalPrice) {
      updatedData = updatedData.filter((item) =>
        item.weighingTotalPrice.includes(searchWeighingTotalPrice)
      );
    }

    // Filter by date range
    if (dateRange && dateRange.length === 2) {
      const [startDate, endDate] = dateRange;
      updatedData = updatedData.filter((item) => {
        const itemDate = new Date(item.contractDate);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    setFilteredData(updatedData);
  };

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
    setSearchArea("");
    setSearchMineralAmount("");
    setSearchUnitPrice("");
    setSearchMineralTotalPrice("");
    setSearchRoyaltyReceiptNumber("");
    setSearchHaqWazanReceiptNumber("");
    setSearchWeighingTotalPrice("");
    setDateRange("");
  };

  // ** Handle Edit Click
  const handleEdit = (contract) => {
    setSelectedContract(contract);
    setEditContractModal(true);
  };

  // ** Handle Delete Click
  const handleDeleteClick = (contractId) => {
    setSelectedContract(
      contracts.find((contract) => contract.contractId === contractId)
    );
    setDeleteModal(true);
  };

  // ** Contract columns configuration
  const columns = [
    {
      name: t("contract_id") || "Contract ID",
      selector: (row) => row.contractId,
      sortable: true,
      width: "120px",
    },
    {
      name: t("area") || "Area",
      selector: (row) => row.area,
      sortable: true,
      width: "120px",
    },
    {
      name: t("mineral_amount") || "Mineral Amount",
      selector: (row) => row.mineralAmount,
      sortable: true,
      width: "140px",
    },
    {
      name: t("unit_price") || "Unit Price",
      selector: (row) => row.unitPrice,
      sortable: true,
      width: "120px",
      cell: (row) => `$${row.unitPrice || "0"}`,
    },
    {
      name: t("mineral_total_price") || "Mineral Total Price",
      selector: (row) => row.mineralTotalPrice,
      sortable: true,
      width: "150px",
      cell: (row) => `$${row.mineralTotalPrice || "0"}`,
    },
    {
      name: t("royalty_receipt_number") || "Royalty Receipt Number",
      selector: (row) => row.royaltyReceiptNumber,
      sortable: true,
      width: "180px",
    },
    {
      name: t("haq_wazan_receipt_number") || "Haq Wazan Receipt Number",
      selector: (row) => row.haqWazanReceiptNumber,
      sortable: true,
      width: "200px",
    },
    {
      name: t("weighing_total_price") || "Weighing Total Price",
      selector: (row) => row.weighingTotalPrice,
      sortable: true,
      width: "160px",
      cell: (row) => `$${row.weighingTotalPrice || "0"}`,
    },
    {
      name: t("contract_date") || "Date",
      selector: (row) => row.contractDate,
      sortable: true,
      width: "120px",
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
            onClick={() => handleDeleteClick(row.contractId)}
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
      searchArea.length ||
      searchMineralAmount.length ||
      searchUnitPrice.length ||
      searchMineralTotalPrice.length ||
      searchRoyaltyReceiptNumber.length ||
      searchHaqWazanReceiptNumber.length ||
      searchWeighingTotalPrice.length ||
      dateRange.length
    ) {
      return filteredData;
    } else {
      return contracts;
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
    if (selectedContract) {
      const updatedContracts = deleteContract(selectedContract.contractId);
      setContracts(updatedContracts);
      setAllContracts(updatedContracts); // Update all contracts as well
      setDeleteModal(false);
      setSelectedContract(null);
      showAlert("success", "Contract deleted successfully!");
    }
  };

  // ** Handle Add Contract Submission
  const handleAddContractSubmit = (contractData) => {
    setIsSubmitting(true);

    console.log("Adding new contract:", contractData);

    // Simulate API call delay
    setTimeout(() => {
      const updatedContracts = addContract(contractData);
      setAllContracts(updatedContracts); // Update all contracts

      // If in company view, update the filtered contracts
      if (fromCompany && company) {
        const companyContracts = getContractsByCompany(company.company_name);
        setContracts(companyContracts);
      } else {
        setContracts(updatedContracts);
      }

      setAddContractModal(false);
      setIsSubmitting(false);
      showAlert("success", "Contract added successfully!");
    }, 1000);
  };

  // ** Handle Edit Contract Submission
  const handleEditContractSubmit = (contractData) => {
    setIsSubmitting(true);

    console.log("Editing contract ID:", selectedContract?.contractId);
    console.log("New contract data:", contractData);

    // Simulate API call delay
    setTimeout(() => {
      if (selectedContract) {
        const updatedContracts = updateContract(
          selectedContract.contractId,
          contractData
        );
        setAllContracts(updatedContracts); // Update all contracts

        // If in company view, update the filtered contracts
        if (fromCompany && company) {
          const companyContracts = getContractsByCompany(company.company_name);
          setContracts(companyContracts);
        } else {
          setContracts(updatedContracts);
        }

        setEditContractModal(false);
        setSelectedContract(null);
        setIsSubmitting(false);
        showAlert("success", "Contract updated successfully!");
      } else {
        setIsSubmitting(false);
        showAlert("error", "No contract selected for editing");
      }
    }, 1000);
  };

  // ** Handle Add Contract Button Click
  const handleAddContractClick = () => {
    console.log("Add Contract button clicked");
    setAddContractModal(true);
  };

  // ** Close Modals
  const closeModals = () => {
    console.log("Closing modals");
    setAddContractModal(false);
    setEditContractModal(false);
    setDeleteModal(false);
    setSelectedContract(null);
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
                  ? `${t("contract_management") || "Contract Management"} - ${
                      company.company_name
                    }`
                  : t("contract_management") || "Contract Management"}
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
                onClick={handleAddContractClick}
                className="d-flex align-items-center"
              >
                <Plus size={14} className="me-50" />
                {t("add_contract") || "Add Contract"}
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Filter Section */}
        <Collapse isOpen={filterOpen}>
          <CardBody className="pt-0">
            <Row className="mt-1 mb-50">
              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="area">
                  {t("area") || "Area"}:
                </Label>
                <Input
                  id="area"
                  placeholder={t("filter_by_area") || "Filter by Area"}
                  value={searchArea}
                  onChange={(e) => setSearchArea(e.target.value)}
                />
              </Col>

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="mineralAmount">
                  {t("mineral_amount") || "Mineral Amount"}:
                </Label>
                <Input
                  id="mineralAmount"
                  type="number"
                  placeholder={
                    t("filter_by_mineral_amount") || "Filter by Mineral Amount"
                  }
                  value={searchMineralAmount}
                  onChange={(e) => setSearchMineralAmount(e.target.value)}
                />
              </Col>

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="unitPrice">
                  {t("unit_price") || "Unit Price"}:
                </Label>
                <Input
                  id="unitPrice"
                  type="number"
                  placeholder={
                    t("filter_by_unit_price") || "Filter by Unit Price"
                  }
                  value={searchUnitPrice}
                  onChange={(e) => setSearchUnitPrice(e.target.value)}
                />
              </Col>

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="mineralTotalPrice">
                  {t("mineral_total_price") || "Mineral Total Price"}:
                </Label>
                <Input
                  id="mineralTotalPrice"
                  type="number"
                  placeholder={
                    t("filter_by_total_price") || "Filter by Total Price"
                  }
                  value={searchMineralTotalPrice}
                  onChange={(e) => setSearchMineralTotalPrice(e.target.value)}
                />
              </Col>

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="royaltyReceiptNumber">
                  {t("royalty_receipt_number") || "Royalty Receipt Number"}:
                </Label>
                <Input
                  id="royaltyReceiptNumber"
                  placeholder={
                    t("filter_by_royalty_receipt") ||
                    "Filter by Royalty Receipt"
                  }
                  value={searchRoyaltyReceiptNumber}
                  onChange={(e) =>
                    setSearchRoyaltyReceiptNumber(e.target.value)
                  }
                />
              </Col>

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="haqWazanReceiptNumber">
                  {t("haq_wazan_receipt_number") || "Haq Wazan Receipt Number"}:
                </Label>
                <Input
                  id="haqWazanReceiptNumber"
                  placeholder={
                    t("filter_by_haq_wazan") || "Filter by Haq Wazan"
                  }
                  value={searchHaqWazanReceiptNumber}
                  onChange={(e) =>
                    setSearchHaqWazanReceiptNumber(e.target.value)
                  }
                />
              </Col>

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="weighingTotalPrice">
                  {t("weighing_total_price") || "Weighing Total Price"}:
                </Label>
                <Input
                  id="weighingTotalPrice"
                  type="number"
                  placeholder={
                    t("filter_by_weighing_price") || "Filter by Weighing Price"
                  }
                  value={searchWeighingTotalPrice}
                  onChange={(e) => setSearchWeighingTotalPrice(e.target.value)}
                />
              </Col>

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="date">
                  {t("contract_date") || "Contract Date"}:
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

      {/* Add Contract Modal */}
      <Modal isOpen={addContractModal} toggle={closeModals} size="lg">
        <ModalHeader toggle={closeModals}>
          {t("add_new_contract") || "Add New Contract"}
          {fromCompany && company && ` - ${company.company_name}`}
        </ModalHeader>
        <ModalBody>
          <AddNewContractSales
            onSuccess={handleAddContractSubmit}
            onCancel={closeModals}
            selectedCompany={fromCompany ? company : null}
            loading={isSubmitting}
            isEdit={false}
          />
        </ModalBody>
      </Modal>

      {/* Edit Contract Modal */}
      <Modal isOpen={editContractModal} toggle={closeModals} size="lg">
        <ModalHeader toggle={closeModals}>
          {t("edit_contract") || "Edit Contract"} -{" "}
          {selectedContract?.contractId}
        </ModalHeader>
        <ModalBody>
          <AddNewContractSales
            onSuccess={handleEditContractSubmit}
            onCancel={closeModals}
            initialData={selectedContract}
            loading={isSubmitting}
            isEdit={true}
          />
        </ModalBody>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal} toggle={closeModals}>
        <ModalHeader toggle={closeModals}>
          {t("delete_contract") || "Delete Contract"}
        </ModalHeader>
        <ModalBody>
          <p>
            {t("delete_contract_confirmation") ||
              "Are you sure you want to delete this contract?"}
          </p>
          {selectedContract && (
            <div className="mt-2">
              <strong>Contract #{selectedContract.contractId}</strong>
              <br />
              <small className="text-muted">
                Area: {selectedContract.area} | Mineral Amount:{" "}
                {selectedContract.mineralAmount}
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

export default ContractSalesTable;
