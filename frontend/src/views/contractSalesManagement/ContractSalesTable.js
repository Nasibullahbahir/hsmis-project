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

// ** Import AddNewContractSales Component
import AddNewContractSales from "./addContractSales/AddNewContractSales";

// ** Styles
import "@styles/react/libs/flatpickr/flatpickr.scss";

// ** API Base URL - Should be the same as your CompanyTable
const API_URL = "http://127.0.0.1:8000/test1";

const ContractSalesTable = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // ** Get company data from navigation state
  const { company, fromCompany } = location.state || {};

  // ** States
  const [currentPage, setCurrentPage] = useState(0);
  const [dateRange, setDateRange] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  // ** Filter States
  const [searchArea, setSearchArea] = useState("");
  const [searchMineralAmount, setSearchMineralAmount] = useState("");
  const [searchUnitPrice, setSearchUnitPrice] = useState("");
  const [searchMineralTotalPrice, setSearchMineralTotalPrice] = useState("");
  const [searchRoyaltyReceiptNumber, setSearchRoyaltyReceiptNumber] = useState("");
  const [searchHaqWazanReceiptNumber, setSearchHaqWazanReceiptNumber] = useState("");
  const [searchWeighingTotalPrice, setSearchWeighingTotalPrice] = useState("");

  // ** Modal States
  const [addContractModal, setAddContractModal] = useState(false);
  const [editContractModal, setEditContractModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ** Main filter function
  const applyFilters = () => {
    let updatedData = contracts;

    // Filter by area
    if (searchArea) {
      updatedData = updatedData.filter((item) =>
        item.area?.toLowerCase().includes(searchArea.toLowerCase())
      );
    }

    // Filter by mineral amount
    if (searchMineralAmount) {
      updatedData = updatedData.filter((item) =>
        String(item.mineral_amount || "").includes(searchMineralAmount)
      );
    }

    // Filter by unit price
    if (searchUnitPrice) {
      updatedData = updatedData.filter((item) =>
        String(item.unit_price || "").includes(searchUnitPrice)
      );
    }

    // Filter by mineral total price
    if (searchMineralTotalPrice) {
      updatedData = updatedData.filter((item) =>
        String(item.mineral_total_price || "").includes(searchMineralTotalPrice)
      );
    }

    // Filter by royalty receipt number
    if (searchRoyaltyReceiptNumber) {
      updatedData = updatedData.filter((item) =>
        String(item.royalty_receipt_number || "")
          .toLowerCase()
          .includes(searchRoyaltyReceiptNumber.toLowerCase())
      );
    }

    // Filter by haq wazan receipt number
    if (searchHaqWazanReceiptNumber) {
      updatedData = updatedData.filter((item) =>
        String(item.haq_wazan_receipt_number || "")
          .toLowerCase()
          .includes(searchHaqWazanReceiptNumber.toLowerCase())
      );
    }

    // Filter by weighing total price
    if (searchWeighingTotalPrice) {
      updatedData = updatedData.filter((item) =>
        String(item.weighing_total_price || "").includes(searchWeighingTotalPrice)
      );
    }

    // Filter by date range
    if (dateRange && dateRange.length === 2) {
      const [startDate, endDate] = dateRange;
      updatedData = updatedData.filter((item) => {
        if (!item.create_at) return false;
        const itemDate = new Date(item.create_at);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    setFilteredData(updatedData);
  };

  // ** Fetch contracts from API
  const fetchContracts = async () => {
    setLoading(true);
    try {
      const endpoint = `${API_URL}/purchases/`;
      let response;
      
      // If coming from company view, filter by company
      if (fromCompany && company) {
        try {
          response = await axios.get(endpoint, {
            params: { company: company.id }
          });
        } catch (filterError) {
          // If filtering fails, get all
          response = await axios.get(endpoint);
        }
      } else {
        response = await axios.get(endpoint);
      }
      
      let contractsData = response.data || [];
      
      // Client-side filtering if coming from company
      if (fromCompany && company && Array.isArray(contractsData)) {
        contractsData = contractsData.filter(purchase => {
          if (purchase.company && typeof purchase.company === 'object') {
            return purchase.company.id === company.id;
          } else if (purchase.company) {
            return purchase.company === company.id;
          }
          return false;
        });
      }
      
      setContracts(contractsData);
      setFilteredData(contractsData);
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error("Purchases API endpoint not found. Please check your Django URLs.");
      } else {
        toast.error("Failed to load purchases");
      }
      setContracts([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  // ** Initialize data
  useEffect(() => {
    fetchContracts();
  }, [company, fromCompany]);

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
      contracts.find((contract) => contract.id === contractId)
    );
    setDeleteModal(true);
  };

  // ** Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (selectedContract) {
      try {
        await axios.delete(`${API_URL}/purchases/${selectedContract.id}/`);
        toast.success("Purchase deleted successfully!");
        fetchContracts(); // Refresh the list
        setDeleteModal(false);
        setSelectedContract(null);
      } catch (error) {
        if (error.response?.status === 404) {
          toast.error("Cannot delete. Purchase not found.");
        } else {
          toast.error("Failed to delete purchase");
        }
      }
    }
  };

  // ** Contract columns configuration
  const columns = [
    {
      name: t("id") || "ID",
      selector: (row) => row.id,
      sortable: true,
      width: "70px",
    },
    {
      name: t("area") || "Area",
      selector: (row) => row.area || "N/A",
      sortable: true,
      width: "120px",
    },
    {
      name: t("mineral_amount") || "Mineral Amount",
      selector: (row) => row.mineral_amount || "0",
      sortable: true,
      width: "140px",
    },
    {
      name: t("unit_price") || "Unit Price",
      selector: (row) => row.unit_price,
      sortable: true,
      width: "120px",
      cell: (row) => `$${row.unit_price || "0.00"}`,
    },
    {
      name: t("mineral_total_price") || "Mineral Total Price",
      selector: (row) => row.mineral_total_price,
      sortable: true,
      width: "150px",
      cell: (row) => `$${row.mineral_total_price || "0.00"}`,
    },
    {
      name: t("royalty_receipt_number") || "Royalty Receipt Number",
      selector: (row) => row.royalty_receipt_number || "N/A",
      sortable: true,
      width: "180px",
    },
    {
      name: t("haq_wazan_receipt_number") || "Haq Wazan Receipt Number",
      selector: (row) => row.haq_wazan_receipt_number || "N/A",
      sortable: true,
      width: "200px",
    },
    {
      name: t("weighing_total_price") || "Weighing Total Price",
      selector: (row) => row.weighing_total_price,
      sortable: true,
      width: "160px",
      cell: (row) => `$${row.weighing_total_price || "0"}`,
    },
    {
      name: t("mineral") || "Mineral",
      selector: (row) => row.mineral?.name || "N/A",
      sortable: true,
      width: "120px",
    },
    {
      name: t("company") || "Company",
      selector: (row) => row.company?.company_name || "N/A",
      sortable: true,
      width: "150px",
    },
    {
      name: t("date") || "Date",
      selector: (row) => row.create_at ? new Date(row.create_at).toLocaleDateString() : "N/A",
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

  // ** Handle Add Contract Submission
  const handleAddContractSubmit = async (contractData) => {
    setIsSubmitting(true);

    try {
      // Clean up the data
      const cleanData = {
        area: contractData.area,
        mineral_amount: parseInt(contractData.mineral_amount) || 0,
        unit_price: contractData.unit_price ? parseFloat(contractData.unit_price) : null,
        mineral_total_price: contractData.mineral_total_price ? parseFloat(contractData.mineral_total_price) : null,
        royalty_receipt_number: contractData.royalty_receipt_number ? parseInt(contractData.royalty_receipt_number) : null,
        haq_wazan_receipt_number: contractData.haq_wazan_receipt_number ? parseInt(contractData.haq_wazan_receipt_number) : null,
        weighing_total_price: contractData.weighing_total_price ? parseInt(contractData.weighing_total_price) : null,
        create_at: contractData.create_at,
        company: fromCompany && company ? company.id : contractData.company,
      };

      const response = await axios.post(`${API_URL}/purchases/`, cleanData);
      
      if (response.status === 201) {
        toast.success("Purchase added successfully!");
        setAddContractModal(false);
        fetchContracts(); // Refresh the list
      }
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error("Cannot add purchase. API endpoint not found.");
      } else if (error.response?.status === 400) {
        toast.error("Validation error: " + JSON.stringify(error.response.data));
      } else {
        toast.error(error.response?.data?.message || "Failed to add purchase");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ** Handle Edit Contract Submission
  const handleEditContractSubmit = async (contractData) => {
    setIsSubmitting(true);

    try {
      // Clean up the data
      const cleanData = {
        area: contractData.area,
        mineral_amount: parseInt(contractData.mineral_amount) || 0,
        unit_price: contractData.unit_price ? parseFloat(contractData.unit_price) : null,
        mineral_total_price: contractData.mineral_total_price ? parseFloat(contractData.mineral_total_price) : null,
        royalty_receipt_number: contractData.royalty_receipt_number ? parseInt(contractData.royalty_receipt_number) : null,
        haq_wazan_receipt_number: contractData.haq_wazan_receipt_number ? parseInt(contractData.haq_wazan_receipt_number) : null,
        weighing_total_price: contractData.weighing_total_price ? parseInt(contractData.weighing_total_price) : null,
        company: contractData.company,
      };

      const response = await axios.put(
        `${API_URL}/purchases/${selectedContract.id}/`,
        cleanData
      );
      
      if (response.status === 200) {
        toast.success("Purchase updated successfully!");
        setEditContractModal(false);
        setSelectedContract(null);
        fetchContracts(); // Refresh the list
      }
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error("Cannot update. Purchase not found.");
      } else if (error.response?.status === 400) {
        toast.error("Validation error: " + JSON.stringify(error.response.data));
      } else {
        toast.error(error.response?.data?.message || "Failed to update purchase");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ** Handle Add Contract Button Click
  const handleAddContractClick = () => {
    setAddContractModal(true);
  };

  // ** Close Modals
  const closeModals = () => {
    setAddContractModal(false);
    setEditContractModal(false);
    setDeleteModal(false);
    setSelectedContract(null);
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
                  ? `${t("purchase_management") || "Purchase Management"} - ${
                      company.company_name
                    }`
                  : t("purchase_management") || "Purchase Management"}
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
                {t("add_purchase") || "Add Purchase"}
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
                  {t("purchase_date") || "Purchase Date"}:
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
        <CardBody>
          {loading ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
              <p className="mt-2">Loading purchases...</p>
            </div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No purchases found</p>
              <Button color="primary" onClick={handleAddContractClick}>
                <Plus size={14} className="me-50" />
                Add Your First Purchase
              </Button>
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
                data={dataToRender()}
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add Purchase Modal */}
      <Modal isOpen={addContractModal} toggle={closeModals} size="lg">
        <ModalHeader toggle={closeModals}>
          {t("add_new_purchase") || "Add New Purchase"}
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

      {/* Edit Purchase Modal */}
      <Modal isOpen={editContractModal} toggle={closeModals} size="lg">
        <ModalHeader toggle={closeModals}>
          {t("edit_purchase") || "Edit Purchase"} -{" "}
          {selectedContract?.id}
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
          {t("delete_purchase") || "Delete Purchase"}
        </ModalHeader>
        <ModalBody>
          <p>
            {t("delete_purchase_confirmation") ||
              "Are you sure you want to delete this purchase?"}
          </p>
          {selectedContract && (
            <div className="mt-2">
              <strong>Purchase #{selectedContract.id}</strong>
              <br />
              <small className="text-muted">
                Area: {selectedContract.area} | Mineral Amount:{" "}
                {selectedContract.mineral_amount}
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