// DeletedRecords.js - Updated with Translations (Clean Version)
import { useState, Fragment, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";

// ** Third Party Components
import ReactPaginate from "react-paginate";
import {
  ChevronDown,
  RotateCcw,
  Eye,
  AlertTriangle,
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
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
  Spinner,
  Alert,
  ListGroup,
  ListGroupItem,
} from "reactstrap";

// ** API Base URL
const API_URL = "http://127.0.0.1:8000/test1";

const DeletedRecords = () => {
  const { t } = useTranslation();

  // ** States
  const [selectedModel, setSelectedModel] = useState("companies");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("id");
  const [currentPage, setCurrentPage] = useState(0);
  const [filteredData, setFilteredData] = useState([]);
  const [deletedRecords, setDeletedRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // ** Modal States
  const [restoreModal, setRestoreModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [relatedVehicles, setRelatedVehicles] = useState([]);

  // ** Model options with translations
  const MODEL_OPTIONS = [
    { value: "companies", label: t("Companies") },
    { value: "vehicles", label: t("Vehicles") },
    { value: "maktoobs", label: t("Maktoobs") },
    { value: "purchases", label: t("Purchases") },
    { value: "units", label: t("Units") },
    { value: "minerals", label: t("Minerals") },
    { value: "vehicle-types", label: t("Vehicle Types") },
    { value: "scales", label: t("Scales") },
    { value: "weights", label: t("Weights") },
    { value: "balances", label: t("Balances") },
    { value: "momps", label: t("MOMPS") },
  ];

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

  // ** Fetch related vehicles for a company
  const fetchRelatedVehicles = useCallback(async (companyId) => {
    try {
      const config = getAxiosConfig();
      const url = `${API_URL}/companies/${companyId}/vehicle_relationships/`;

      const response = await axios.get(url, config);

      if (response.data && response.data.status === "success") {
        // Combine current and tracked vehicles
        const allVehicles = [
          ...response.data.data.current_vehicles,
          ...response.data.data.tracked_vehicles.map((id) => ({
            id: id,
            name: `${t("Vehicle")} ${id}`,
            is_tracked: true,
            is_current: false,
          })),
        ];

        setRelatedVehicles(allVehicles);
      }
    } catch (error) {
      console.error("Error fetching related vehicles:", error);
      setRelatedVehicles([]);
    }
  }, [t]);

  // ** Fetch deleted records with pagination
  const fetchDeletedRecords = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const config = getAxiosConfig();
        const url = `${API_URL}/${selectedModel}/deleted/?page=${page}&page_size=${pageSize}`;

        console.log(`Fetching deleted ${selectedModel} from: ${url}`);

        const response = await axios.get(url, config);

        let data = [];
        let total = 0;

        if (response.data && response.data.results) {
          // Paginated response
          data = response.data.results;
          total = response.data.count || data.length;
          console.log(
            `Got ${data.length} deleted ${selectedModel} out of ${total}`,
          );
        } else if (response.data && response.data.data) {
          // Alternative response format
          data = response.data.data;
          total = response.data.count || data.length;
        } else if (Array.isArray(response.data)) {
          // Non-paginated array
          data = response.data;
          total = data.length;
        } else if (response.data) {
          data = [response.data];
          total = 1;
        } else {
          console.log("Unexpected response format:", response.data);
          data = [];
          total = 0;
        }

        setDeletedRecords(data);
        setFilteredData(data);
        setTotalRecords(total);
        setTotalPages(Math.ceil(total / pageSize));

        if (data.length === 0) {
          toast.info(
            `${t("No deleted")} ${t(
              getModelDisplayName(selectedModel),
            )} ${t("records found")}`,
          );
        }
      } catch (error) {
        console.error(`Error fetching deleted ${selectedModel}:`, error);

        if (error.response?.status === 401) {
          toast.error(t("Please login first"));
        } else if (error.response?.status === 404) {
          // Try alternative endpoint (singular)
          try {
            const config = getAxiosConfig();
            const singularModel = selectedModel.replace(/s$/, "");
            const altUrl = `${API_URL}/${singularModel}/deleted/`;

            const altResponse = await axios.get(altUrl, config);
            const altData = Array.isArray(altResponse.data)
              ? altResponse.data
              : [altResponse.data];

            setDeletedRecords(altData);
            setFilteredData(altData);
            setTotalRecords(altData.length);
            setTotalPages(1);

            toast.info(
              `${t("Showing")} ${altData.length} ${t("deleted records")}`,
            );
          } catch (altError) {
            console.error("Alternative endpoint also failed:", altError);
            toast.error(
              `${t("Failed to load deleted")} ${t(
                getModelDisplayName(selectedModel),
              )}`,
            );
            setDeletedRecords([]);
            setFilteredData([]);
            setTotalRecords(0);
            setTotalPages(0);
          }
        } else {
          toast.error(
            `${t("Failed to load deleted")} ${t(
              getModelDisplayName(selectedModel),
            )}`,
          );
          setDeletedRecords([]);
          setFilteredData([]);
          setTotalRecords(0);
          setTotalPages(0);
        }
      } finally {
        setLoading(false);
      }
    },
    [selectedModel, pageSize, t],
  );

  // ** Initialize and fetch when model changes
  useEffect(() => {
    setCurrentPage(0);
    fetchDeletedRecords(1);
  }, [selectedModel, fetchDeletedRecords]);

  // ** Apply filters
  useEffect(() => {
    let data = deletedRecords;

    if (searchTerm && searchField) {
      const term = searchTerm.toLowerCase();
      data = data.filter((record) => {
        const fieldValue = record[searchField];
        if (fieldValue === null || fieldValue === undefined) return false;

        return fieldValue.toString().toLowerCase().includes(term);
      });
    }

    setFilteredData(data);
  }, [searchTerm, searchField, deletedRecords]);

  // ** Handle model change
  const handleModelChange = (model) => {
    setSelectedModel(model);
    setSearchTerm("");
  };

  // ** Get model display name
  const getModelDisplayName = (modelKey) => {
    const model = MODEL_OPTIONS.find((m) => m.value === modelKey);
    return model ? model.label : modelKey;
  };

  // ** Handle Restore Click
  const handleRestoreClick = async (record) => {
    setSelectedRecord(record);

    // If it's a company, fetch related vehicles first
    if (selectedModel === "companies") {
      try {
        await fetchRelatedVehicles(record.id);
      } catch (error) {
        console.error("Error fetching related vehicles:", error);
      }
    }

    setRestoreModal(true);
  };

  // ** Handle Permanent Delete Click
  const handlePermanentDeleteClick = (record) => {
    setSelectedRecord(record);
    setDeleteModal(true);
  };

  // ** Handle View Details Click
  const handleViewDetailsClick = (record) => {
    setSelectedRecord(record);
    setViewModal(true);
  };

  // ** Handle Restore Confirmation
  const handleRestoreConfirm = async () => {
    if (selectedRecord) {
      setIsProcessing(true);

      try {
        const config = getAxiosConfig();

        // For companies, use the special endpoint that restores with vehicles
        if (selectedModel === "companies") {
          const url = `${API_URL}/${selectedModel}/${selectedRecord.id}/restore_with_vehicles/`;

          console.log(
            `Restoring company with vehicles ID ${selectedRecord.id}`,
          );
          const response = await axios.post(url, {}, config);

          if (response.status === 200) {
            toast.success(
              <div>
                <strong>{t("Company restored successfully!")}</strong>
                <br />
                {response.data.restored_vehicle_count > 0 &&
                  `${response.data.restored_vehicle_count} ${t(
                    "related vehicle(s) also restored.",
                  )}`}
                {response.data.restored_vehicle_count === 0 &&
                  t("No vehicles needed restoration.")}
              </div>,
              { autoClose: 5000 },
            );

            // Refresh data
            fetchDeletedRecords(currentPage + 1);
            setRestoreModal(false);
            setSelectedRecord(null);
            setRelatedVehicles([]);
          }
        } else {
          // For other models, use the regular restore endpoint
          const url = `${API_URL}/${selectedModel}/${selectedRecord.id}/restore/`;

          console.log(`Restoring ${selectedModel} ID ${selectedRecord.id}`);
          const response = await axios.post(url, {}, config);

          if (response.status === 200) {
            toast.success(t("Record restored successfully!"));

            // Refresh data
            fetchDeletedRecords(currentPage + 1);
            setRestoreModal(false);
            setSelectedRecord(null);
          }
        }
      } catch (error) {
        console.error(`Error restoring ${selectedModel}:`, error);

        if (error.response?.data?.message) {
          toast.error(`${t("Failed to restore:")} ${error.response.data.message}`);
        } else {
          toast.error(t("Failed to restore record"));
        }
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // ** Handle Permanent Delete Confirmation
  const handlePermanentDeleteConfirm = async () => {
    if (selectedRecord) {
      setIsProcessing(true);

      const config = getAxiosConfig();
      const url = `${API_URL}/${selectedModel}/${selectedRecord.id}/hard-delete/`;

      console.log(
        `Permanently deleting ${selectedModel} ID ${selectedRecord.id}`,
      );
      const response = await axios.delete(url, config);
    }
  };

  // ** Handle Pagination
  const handlePagination = (page) => {
    const newPage = page.selected;
    setCurrentPage(newPage);
    fetchDeletedRecords(newPage + 1);
  };

  // ** Clear All Filters
  const clearFilters = () => {
    setSearchTerm("");
  };

  // ** Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return t("N/A");

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return t("N/A");

      return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    } catch (error) {
      return dateString;
    }
  };

  // ** Get record display name
  const getRecordDisplayName = (record) => {
    if (!record) return t("Unknown");

    return (
      record.company_name ||
      record.car_name ||
      record.maktoob_number ||
      record.name ||
      record.truck_name ||
      record.E_name ||
      record.area ||
      record.id ||
      `${t("Record")} ${record.id}`
    );
  };

  // ** Generate table columns dynamically based on selected model
  const generateColumns = () => {
    const baseColumns = [
      {
        name: t("ID"),
        selector: (row) => row.id,
        sortable: true,
        width: "70px",
      },
      {
        name: t("Name/Title"),
        selector: (row) => getRecordDisplayName(row),
        sortable: true,
        minWidth: "150px",
      },
      {
        name: t("Deleted At"),
        selector: (row) => formatDate(row.deleted_at),
        sortable: true,
        width: "150px",
        cell: (row) => (
          <Badge color="danger">{formatDate(row.deleted_at)}</Badge>
        ),
      },
    ];

    // Add action column
    baseColumns.push({
      name: t("Actions"),
      cell: (row) => (
        <div className="d-flex gap-1">
          <Button
            color="info"
            size="sm"
            onClick={() => handleViewDetailsClick(row)}
            className="btn-icon"
            title={t("View Details")}
          >
            <Eye size={12} />
          </Button>
          <Button
            color="success"
            size="sm"
            onClick={() => handleRestoreClick(row)}
            className="btn-icon"
            title={t("Restore")}
          >
            <RotateCcw size={12} />
          </Button>
        </div>
      ),
      width: "180px",
      center: true,
    });

    return baseColumns;
  };

  // ** Custom Pagination
  const CustomPagination = () => {
    const pageCount = totalPages || Math.ceil(totalRecords / pageSize);

    if (pageCount <= 1) return null;

    return (
      <ReactPaginate
        previousLabel={""}
        nextLabel={""}
        forcePage={currentPage}
        onPageChange={handlePagination}
        pageCount={pageCount}
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
  };

  return (
    <Fragment>
      <ToastContainer position="top-left" autoClose={5000} />

      <Card>
        <CardHeader className="border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <CardTitle tag="h4" className="mb-0">
                {t("Deleted Records Management")}
              </CardTitle>
              <Badge color="danger" className="ms-2 m-1 p-1">
                {totalRecords} {getModelDisplayName(selectedModel)} {t("Records")}
              </Badge>
            </div>
            <div className="d-flex gap-1 align-items-center">
              <div className="me-2">
                <Label className="form-label me-2" htmlFor="modelSelect">
                  {t("Select Model:")}
                </Label>
                <Input
                  type="select"
                  id="modelSelect"
                  value={selectedModel}
                  onChange={(e) => handleModelChange(e.target.value)}
                  style={{ width: "150px" }}
                  disabled={loading}
                >
                  {MODEL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Input>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Data Table */}
        <CardBody>
          <Alert color="warning" className="mb-3">
            <AlertTriangle size={16} className="me-2" />
            {t(
              "This section shows only soft-deleted records. Restoring will make them active again.",
            )}
          </Alert>

          {loading ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
              <p className="mt-2">
                {t("Loading deleted")} {getModelDisplayName(selectedModel)}{" "}
                {t("records...")}
              </p>
            </div>
          ) : filteredData.length === 0 && deletedRecords.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">
                {t("No deleted")} {getModelDisplayName(selectedModel)}{" "}
                {t("records found")}
              </p>
            </div>
          ) : filteredData.length === 0 && searchTerm ? (
            <div className="text-center py-5">
              <p className="text-muted">{t("No records match your filters")}</p>
              <Button color="primary" size="sm" onClick={clearFilters}>
                {t("Clear Filters")}
              </Button>
            </div>
          ) : (
            <div className="react-dataTable">
              <DataTable
                noHeader
                pagination
                columns={generateColumns()}
                paginationPerPage={pageSize}
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

      {/* Restore Confirmation Modal */}
      <Modal isOpen={restoreModal} toggle={() => setRestoreModal(false)}>
        <ModalHeader toggle={() => setRestoreModal(false)}>
          <RotateCcw size={18} className="me-2 text-success" />
          {selectedModel === "companies"
            ? t("Restore Company with Vehicles")
            : t("Restore")}
        </ModalHeader>
        <ModalBody>
          <p>
            {selectedModel === "companies" ? (
              <span>
                {t(
                  "Are you sure you want to restore this company? This will also restore any vehicles, maktoobs, purchases that were soft-deleted because of this company.",
                )}
              </span>
            ) : (
              <span>
                {t(
                  "Are you sure you want to restore this record? This will make it active again and restore any related cascade-deleted records.",
                )}
              </span>
            )}
          </p>

          {selectedRecord && (
            <div className="mt-3">
              <Alert color={selectedModel === "companies" ? "info" : "light"}>
                <strong>{getRecordDisplayName(selectedRecord)}</strong>
                <br />
                <small className="text-muted">
                  {t("ID:")} {selectedRecord.id} | {t("Deleted:")}{" "}
                  {formatDate(selectedRecord.deleted_at)}
                </small>
              </Alert>

              {selectedModel === "companies" && relatedVehicles.length > 0 && (
                <div className="mt-3">
                  <h6 className="text-info">
                    <Truck size={16} className="me-2" />
                    {t("Related Vehicles")} ({relatedVehicles.length})
                  </h6>
                  <ListGroup className="mt-2" flush>
                    {relatedVehicles.slice(0, 5).map((vehicle, index) => (
                      <ListGroupItem
                        key={index}
                        className="d-flex justify-content-between align-items-center"
                      >
                        <div>
                          {vehicle.name || `${t("Vehicle")} ${vehicle.id}`}
                          {vehicle.plate_number && ` (${vehicle.plate_number})`}
                        </div>
                        <div>
                          {vehicle.is_deleted ? (
                            <Badge color="danger" pill>
                              {t("Deleted")}
                            </Badge>
                          ) : (
                            <Badge color="success" pill>
                              {t("Active")}
                            </Badge>
                          )}
                        </div>
                      </ListGroupItem>
                    ))}
                    {relatedVehicles.length > 5 && (
                      <ListGroupItem className="text-center text-muted">
                        ... {t("and")} {relatedVehicles.length - 5}{" "}
                        {t("and more vehicle(s)")}
                      </ListGroupItem>
                    )}
                  </ListGroup>
                  <small className="text-muted mt-2 d-block">
                    {t(
                      "Note: Only vehicles that were deleted because of this company will be restored.",
                    )}
                  </small>
                </div>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color="secondary"
            onClick={() => {
              setRestoreModal(false);
              setRelatedVehicles([]);
            }}
            disabled={isProcessing}
          >
            {t("Cancel")}
          </Button>
          <Button
            color="success"
            onClick={handleRestoreConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Spinner size="sm" className="me-2" />
                {t("Processing...")}
              </>
            ) : (
              <>
                <RotateCcw size={14} className="me-50" />
                {selectedModel === "companies"
                  ? t("Restore Company & Vehicles")
                  : t("Restore")}
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={viewModal} toggle={() => setViewModal(false)} size="lg">
        <ModalHeader toggle={() => setViewModal(false)}>
          {t("Record Details")}
        </ModalHeader>
        <ModalBody>
          {selectedRecord && (
            <div>
              <Row>
                <Col md="6">
                  <h5 className="mb-3">{t("Basic Information")}</h5>
                  <table className="table table-sm">
                    <tbody>
                      {Object.entries(selectedRecord)
                        .map(([key, value]) => {
                          if (
                            key === "id" ||
                            key.includes("name") ||
                            key.includes("_at") ||
                            key === "status"
                          ) {
                            return (
                              <tr key={key}>
                                <th style={{ width: "30%" }}>
                                  {key.replace("_", " ").toUpperCase()}:
                                </th>
                                <td>
                                  {key.includes("_at")
                                    ? formatDate(value)
                                    : value || t("N/A")}
                                </td>
                              </tr>
                            );
                          }
                          return null;
                        })
                        .filter(Boolean)}
                    </tbody>
                  </table>
                </Col>
                <Col md="6">
                  <h5 className="mb-3">{t("Additional Information")}</h5>
                  <div className="border p-3 rounded">
                    <h6 className="text-danger mb-2">
                      <AlertTriangle size={16} className="me-2" />
                      {t("Deletion Information")}
                    </h6>
                    <p>
                      <strong>{t("Deleted At:")}</strong>{" "}
                      {formatDate(selectedRecord.deleted_at)}
                    </p>
                    <p>
                      <strong>{t("Time Since Deletion:")}</strong>{" "}
                      {(() => {
                        if (!selectedRecord.deleted_at) return t("N/A");
                        const deletedDate = new Date(selectedRecord.deleted_at);
                        const now = new Date();
                        const diffMs = now - deletedDate;
                        const diffDays = Math.floor(
                          diffMs / (1000 * 60 * 60 * 24),
                        );

                        if (diffDays === 0) return t("Today");
                        if (diffDays === 1) return t("Yesterday");
                        return `${diffDays} ${t("days ago")}`;
                      })()}
                    </p>
                  </div>
                </Col>
              </Row>

              {/* Show related vehicles if loaded */}
              {selectedModel === "companies" && relatedVehicles.length > 0 && (
                <Row className="mt-4">
                  <Col md="12">
                    <h5 className="mb-3">{t("Related Vehicles")}</h5>
                    <ListGroup>
                      {relatedVehicles.map((vehicle, index) => (
                        <ListGroupItem
                          key={index}
                          className="d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <strong>
                              {vehicle.name || `${t("Vehicle")} ${vehicle.id}`}
                            </strong>
                            {vehicle.plate_number && (
                              <span className="ms-2">
                                ({vehicle.plate_number})
                              </span>
                            )}
                            {vehicle.is_tracked && (
                              <Badge color="warning" className="ms-2" pill>
                                {t("Tracked")}
                              </Badge>
                            )}
                          </div>
                          <div>
                            {vehicle.is_deleted ? (
                              <Badge color="danger">{t("Deleted")}</Badge>
                            ) : (
                              <Badge color="success">{t("Active")}</Badge>
                            )}
                          </div>
                        </ListGroupItem>
                      ))}
                    </ListGroup>
                  </Col>
                </Row>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color="secondary"
            onClick={() => {
              setViewModal(false);
              setRelatedVehicles([]);
            }}
          >
            {t("Close")}
          </Button>
        </ModalFooter>
      </Modal>
    </Fragment>
  );
};

export default DeletedRecords;