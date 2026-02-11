// ** React Imports
import { useState, Fragment, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";

// ** Third Party Components
import Flatpickr from "react-flatpickr";
import ReactPaginate from "react-paginate";
import {
  ChevronDown,
  Plus,
  Trash2,
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

// ** Import AddScale Component
import AddScale from "./addScale/AddScale.js";

// ** Styles
import "@styles/react/libs/flatpickr/flatpickr.scss";

// ** API Base URL
const API_URL = "http://127.0.0.1:8000/test1";

// ** Mock data generator
const createMockScales = (count = 5) => {
  const mockScales = [];
  for (let i = 1; i <= count; i++) {
    mockScales.push({
      id: i,
      name: `Scale ${i}`,
      location: `Location ${i}`,
      province_id: (i % 10) + 1, // 1-10
      system_type: ["analog", "digital", "platform", "floor", "bench"][i % 5],
      status: i % 3 === 0 ? 2 : 1, // Every 3rd is inactive
      create_at: new Date(Date.now() - i * 86400000).toISOString(), // Different dates
      update_at: new Date().toISOString(),
    });
  }
  return mockScales;
};

// ** Status mapping with translation
const getStatusMap = (t) => ({
  1: t("Active"),
  2: t("Inactive"),
});

// ** Province options as static array with translation
const getProvinceOptions = (t) => [
  { id: 1, name: t("Province 1") },
  { id: 2, name: t("Province 2") },
  { id: 3, name: t("Province 3") },
  { id: 4, name: t("Province 4") },
  { id: 5, name: t("Province 5") },
  { id: 6, name: t("Province 6") },
  { id: 7, name: t("Province 7") },
  { id: 8, name: t("Province 8") },
  { id: 9, name: t("Province 9") },
  { id: 10, name: t("Province 10") },
];

// ** System type options with translation
const getSystemTypeOptions = (t) => [
  { value: "analog", label: t("Analog Scale") },
  { value: "digital", label: t("Digital Scale") },
  { value: "platform", label: t("Platform Scale") },
  { value: "floor", label: t("Floor Scale") },
  { value: "bench", label: t("Bench Scale") },
  { value: "truck", label: t("Truck Scale") },
  { value: "rail", label: t("Rail Scale") },
  { value: "livestock", label: t("Livestock Scale") },
];

const ScaleTable = () => {
  const { t } = useTranslation();

  // Initialize constants with translations
  const statusMap = getStatusMap(t);
  const PROVINCE_OPTIONS = getProvinceOptions(t);
  const SYSTEM_TYPE_OPTIONS = getSystemTypeOptions(t);

  // ** States
  const [searchName, setSearchName] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchProvince, setSearchProvince] = useState("");
  const [searchSystemType, setSearchSystemType] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [dateRange, setDateRange] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [scales, setScales] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // ** Modal States
  const [addScaleModal, setAddScaleModal] = useState(false);
  const [editScaleModal, setEditScaleModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedScale, setSelectedScale] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ** Get authentication token
  const getAuthToken = () => {
    return localStorage.getItem('access_token');
  };

  // ** Configure axios headers
  const getAxiosConfig = () => {
    const token = getAuthToken();
    return token ? {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    } : {
      headers: {
        'Content-Type': 'application/json'
      }
    };
  };

  // ** Enhanced fetch function with better error handling
  const fetchWithFallback = useCallback(async (endpoint, config) => {
    try {
      console.log(`Fetching from: ${endpoint}`);
      const response = await axios.get(endpoint, config);
      
      if (response.status === 200) {
        const data = response.data.results || response.data || [];
        console.log(`Successfully fetched ${data.length} items`);
        return Array.isArray(data) ? data : [data];
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.warn(`Failed to fetch from ${endpoint}:`, error.message);
      
      // Return mock data for development
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        console.log(`Using mock data for scales`);
        
        if (error.response?.status === 404) {
          toast.warning("Scales endpoint not found. Using mock data.");
        } else if (error.code === 'ERR_NETWORK') {
          toast.error("Network error. Using mock data.");
        }
        
        return createMockScales(8);
      }
      
      toast.error(`Error loading scales: ${error.message}`);
      return [];
    }
  }, []);

  // ** Fetch scales from API with fallback
  const fetchScales = useCallback(async () => {
    setLoading(true);
    try {
      const config = getAxiosConfig();
      const scalesData = await fetchWithFallback(`${API_URL}/scales/`, config);
      
      setScales(scalesData);
      setFilteredData(scalesData);
      
      if (scalesData.length > 0) {
        toast.success(t("Loaded {{count}} scales", { count: scalesData.length }));
      }
      
      // Also try to save to localStorage for offline mode
      try {
        localStorage.setItem('scales_data', JSON.stringify(scalesData));
      } catch (e) {
        console.log("Could not save to localStorage:", e);
      }
      
    } catch (error) {
      console.error("Error in fetchScales:", error);
      
      // Fallback to localStorage if available
      try {
        const savedScales = localStorage.getItem('scales_data');
        if (savedScales) {
          const scalesData = JSON.parse(savedScales);
          setScales(scalesData);
          setFilteredData(scalesData);
          toast.info(t("Loaded scales from local storage", { count: scalesData.length }));
        } else {
          // Use mock data if nothing else works
          const mockData = createMockScales(5);
          setScales(mockData);
          setFilteredData(mockData);
          toast.info(t("Using sample data for demonstration"));
        }
      } catch (e) {
        console.error("Error loading from localStorage:", e);
        // Final fallback - empty array
        setScales([]);
        setFilteredData([]);
      }
      
    } finally {
      setLoading(false);
    }
  }, [fetchWithFallback, t]);

  // ** Initialize data
  useEffect(() => {
    fetchScales();
  }, [fetchScales]);

  // ** Apply filters when search criteria change
  useEffect(() => {
    let data = scales;

    if (searchName) {
      data = data.filter((scale) =>
        scale.name?.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (searchLocation) {
      data = data.filter((scale) =>
        scale.location?.toLowerCase().includes(searchLocation.toLowerCase())
      );
    }

    if (searchProvince) {
      const provinceNum = parseInt(searchProvince);
      if (!isNaN(provinceNum)) {
        data = data.filter((scale) => 
          parseInt(scale.province_id) === provinceNum
        );
      } else {
        data = data.filter((scale) => {
          const province = PROVINCE_OPTIONS.find(p => p.id === parseInt(scale.province_id));
          return province?.name.toLowerCase().includes(searchProvince.toLowerCase());
        });
      }
    }

    if (searchSystemType) {
      data = data.filter((scale) =>
        scale.system_type?.toLowerCase().includes(searchSystemType.toLowerCase())
      );
    }

    if (searchStatus) {
      data = data.filter((scale) => Number(scale.status) === Number(searchStatus));
    }

    if (dateRange.length === 2) {
      const [start, end] = dateRange;
      data = data.filter((scale) => {
        const createDate = new Date(scale.create_at);
        return createDate >= start && createDate <= end;
      });
    }

    setFilteredData(data);
  }, [
    searchName,
    searchLocation,
    searchProvince,
    searchSystemType,
    searchStatus,
    dateRange,
    scales,
    PROVINCE_OPTIONS,
  ]);

  // ** Get province name from ID
  const getProvinceName = (provinceId) => {
    const province = PROVINCE_OPTIONS.find(p => p.id === parseInt(provinceId));
    return province ? province.name : t("Province") + ` ${provinceId}`;
  };

  // ** Toggle Filter Section
  const toggleFilter = () => setFilterOpen(!filterOpen);

  // ** Clear All Filters
  const clearFilters = () => {
    setSearchName("");
    setSearchLocation("");
    setSearchProvince("");
    setSearchSystemType("");
    setSearchStatus("");
    setDateRange([]);
  };

  // ** Handle Edit Click
  const handleEdit = (scale) => {
    setSelectedScale(scale);
    setEditScaleModal(true);
  };

  // ** Handle Delete Click
  const handleDeleteClick = (scaleId) => {
    const scale = scales.find((s) => s.id === scaleId);
    setSelectedScale(scale);
    setDeleteModal(true);
  };

  // ** Table columns configuration
  const columns = [
    {
      name: t("id"),
      selector: (row) => row.id,
      sortable: true,
      width: "70px",
    },
    {
      name: t("name"),
      selector: (row) => row.name,
      sortable: true,
      minWidth: "150px",
    },
    {
      name: t("location"),
      selector: (row) => row.location,
      sortable: true,
      minWidth: "150px",
    },
    {
      name: t("province"),
      selector: (row) => row.province_id,
      sortable: true,
      width: "120px",
      cell: (row) => getProvinceName(row.province_id)
    },
    {
      name: t("system_type"),
      selector: (row) => row.system_type,
      sortable: true,
      width: "140px",
      cell: (row) => {
        const type = row.system_type;
        const systemType = SYSTEM_TYPE_OPTIONS.find(st => st.value === type);
        return systemType ? systemType.label : type;
      }
    },

    {
      name: t("status"),
      selector: (row) => statusMap[row.status] || t("Unknown"),
      sortable: true,
      width: "100px",
      cell: (row) => {
        const statusText = statusMap[row.status] || t("Unknown");
        const badgeColor = row.status === 1 ? "success" : "secondary";
        return <Badge color={badgeColor}>{statusText}</Badge>;
      },
    },
    {
      name: t("actions"),
      cell: (row) => (
        <div className="d-flex">
          <Button
            color="primary"
            size="sm"
            className="me-1"
            onClick={() => handleEdit(row)}
            title={t("edit")}
          >
            <Edit size={14} />
          </Button>
          <Button
            color="danger"
            size="sm"
            onClick={() => handleDeleteClick(row.id)}
            title={t("delete")}
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

  // ** Handle Add Scale Submission
  const handleAddScaleSubmit = async (scaleData) => {
    setIsSubmitting(true);
    
    try {
      const config = getAxiosConfig();
      
      const formattedData = {
        name: scaleData.name,
        location: scaleData.location,
        province_id: parseInt(scaleData.province_id) || 0,
        system_type: scaleData.system_type,
        status: scaleData.status === "active" ? 1 : 2,
        create_at: new Date().toISOString().split('T')[0],
        update_at: new Date().toISOString().split('T')[0],
      };


      const response = await axios.post(`${API_URL}/scales/`, formattedData, config);
      
      
      if (response.status === 201) {
        toast.success(t("Scale added successfully!"));
        setAddScaleModal(false);
        fetchScales(); // Refresh the list
      }
    } catch (error) {
      console.error("Error adding scale:", error);
      console.error("Error response:", error.response?.data);
      
      // If API fails, save locally
      const newScale = {
        id: Date.now(), // Generate unique ID
        name: scaleData.name,
        location: scaleData.location,
        province_id: parseInt(scaleData.province_id) || 0,
        system_type: scaleData.system_type,
        status: scaleData.status === "active" ? 1 : 2,
        create_at: new Date().toISOString().split('T')[0],
        update_at: new Date().toISOString().split('T')[0],
      };
      
      const updatedScales = [...scales, newScale];
      setScales(updatedScales);
      setFilteredData(updatedScales);
      
      try {
        localStorage.setItem('scales_data', JSON.stringify(updatedScales));
      } catch (e) {
        console.log("Could not save to localStorage:", e);
      }
      
      toast.success(t("Scale saved locally!"));
      setAddScaleModal(false);
      
    } finally {
      setIsSubmitting(false);
    }
  };

  // ** Handle Edit Scale Submission
  const handleEditScaleSubmit = async (scaleData) => {
    setIsSubmitting(true);
    
    try {
      const config = getAxiosConfig();
      
      const formattedData = {
        name: scaleData.name,
        location: scaleData.location,
        province_id: parseInt(scaleData.province_id) || 0,
        system_type: scaleData.system_type,
        status: scaleData.status === "active" ? 1 : 2,
        update_at: new Date().toISOString().split('T')[0],
      };

      console.log("Updating scale data:", formattedData);

      const response = await axios.put(
        `${API_URL}/scales/${selectedScale.id}/`,
        formattedData,
        config
      );
      
      console.log("Edit scale response:", response);
      
      if (response.status === 200) {
        toast.success(t("Scale updated successfully!"));
        setEditScaleModal(false);
        setSelectedScale(null);
        fetchScales(); // Refresh the list
      }
    } catch (error) {
      console.error("Error updating scale:", error);
      console.error("Error response:", error.response?.data);
      
      // If API fails, update locally
      const updatedScale = {
        ...selectedScale,
        name: scaleData.name,
        location: scaleData.location,
        province_id: parseInt(scaleData.province_id) || 0,
        system_type: scaleData.system_type,
        status: scaleData.status === "active" ? 1 : 2,
        update_at: new Date().toISOString().split('T')[0],
      };
      
      const updatedScales = scales.map(scale => {
        if (scale.id === selectedScale.id) {
          return updatedScale;
        }
        return scale;
      });
      
      setScales(updatedScales);
      setFilteredData(updatedScales);
      
      try {
        localStorage.setItem('scales_data', JSON.stringify(updatedScales));
      } catch (e) {
        console.log("Could not save to localStorage:", e);
      }
      
      toast.success(t("Scale updated locally!"));
      setEditScaleModal(false);
      setSelectedScale(null);
      
    } finally {
      setIsSubmitting(false);
    }
  };

  // ** Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (selectedScale) {
      try {
        const config = getAxiosConfig();
        await axios.delete(`${API_URL}/scales/${selectedScale.id}/`, config);
        toast.success(t("Scale deleted successfully!"));
        
        // Update state immediately
        const updatedScales = scales.filter(scale => scale.id !== selectedScale.id);
        setScales(updatedScales);
        setFilteredData(updatedScales);
        
        try {
          localStorage.setItem('scales_data', JSON.stringify(updatedScales));
        } catch (e) {
          console.log("Could not save to localStorage:", e);
        }
        
      } catch (error) {
        console.error("Error deleting scale:", error);
        
        // If API fails, delete locally
        const updatedScales = scales.filter(scale => scale.id !== selectedScale.id);
        setScales(updatedScales);
        setFilteredData(updatedScales);
        
        try {
          localStorage.setItem('scales_data', JSON.stringify(updatedScales));
        } catch (e) {
          console.log("Could not save to localStorage:", e);
        }
        
        toast.success(t("Scale deleted locally!"));
      } finally {
        setDeleteModal(false);
        setSelectedScale(null);
      }
    }
  };

  // ** Handle Add Scale Button Click
  const handleAddScaleClick = () => {
    setAddScaleModal(true);
  };

  // ** Close Modals
  const closeModals = () => {
    setAddScaleModal(false);
    setEditScaleModal(false);
    setDeleteModal(false);
    setSelectedScale(null);
    setIsSubmitting(false);
  };

  return (
    <Fragment>
      
      <ToastContainer position="top-left" autoClose={3000} />
      
      <Card>
        <CardHeader className="border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <CardTitle tag="h4" className="mb-0 m-1">
                {t("scale_management")}
              </CardTitle>
              
              {loading && (
                <Spinner size="sm" color="primary" className="ms-2" />
              )}
            </div>
            <div className="d-flex gap-1">
              <Button
                color="secondary"
                onClick={toggleFilter}
                className="d-flex align-items-cente"
                disabled={loading}
              >
                <Filter size={14} className="me-50" />
                {t("filter")}
                {filterOpen && <X size={14} className="ms-50" />}
              </Button>
              <Button
                color="primary"
                onClick={handleAddScaleClick}
                className="d-flex align-items-center"
                disabled={loading}
              >
                <Plus size={14} className="me-50" />
                {t("add_scale")}
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Filter Section */}
        <Collapse isOpen={filterOpen}>
          <CardBody className="pt-0">
            <Row className="mt-1 mb-50">
              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="name">
                  {t("name")}:
                </Label>
                <Input
                  id="name"
                  placeholder={t("filter_by_name")}
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  disabled={loading}
                />
              </Col>

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="location">
                  {t("location")}:
                </Label>
                <Input
                  id="location"
                  placeholder={t("filter_by_location")}
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  disabled={loading}
                />
              </Col>

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="province">
                  {t("province")}:
                </Label>
                <Input
                  type="select"
                  id="province"
                  value={searchProvince}
                  onChange={(e) => setSearchProvince(e.target.value)}
                  disabled={loading}
                >
                  <option value="">{t("All Provinces")}</option>
                  {PROVINCE_OPTIONS.map(province => (
                    <option key={province.id} value={province.id}>
                      {province.name}
                    </option>
                  ))}
                </Input>
              </Col>

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="systemType">
                  {t("system_type")}:
                </Label>
                <Input
                  type="select"
                  id="systemType"
                  value={searchSystemType}
                  onChange={(e) => setSearchSystemType(e.target.value)}
                  disabled={loading}
                >
                  <option value="">{t("All System Types")}</option>
                  {SYSTEM_TYPE_OPTIONS.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Input>
              </Col>

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="status">
                  {t("status")}:
                </Label>
                <Input
                  type="select"
                  id="status"
                  value={searchStatus}
                  onChange={(e) => setSearchStatus(e.target.value)}
                  disabled={loading}
                >
                  <option value="">{t("all_status")}</option>
                  <option value="1">{t("active")}</option>
                  <option value="2">{t("inactive")}</option>
                </Input>
              </Col>

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="date">
                  {t("creation_date")}:
                </Label>
                <Flatpickr
                  className="form-control"
                  id="date"
                  value={dateRange}
                  options={{ mode: "range", dateFormat: "Y-m-d" }}
                  onChange={(date) => setDateRange(date)}
                  disabled={loading}
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
                  disabled={loading}
                >
                  {t("clear_filters")}
                </Button>
                <Button 
                  color="primary" 
                  onClick={fetchScales}
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" /> : t("refresh")}
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
              <p className="mt-2">{t("Loading scales...")}</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">
                {searchName || searchLocation || searchProvince || searchSystemType || searchStatus || dateRange.length > 0
                  ? t("No scales match your filters")
                  : t("No scales found")}
              </p>
              <div className="mt-3">
                <Button color="primary" onClick={fetchScales} className="me-2">
                  {t("Refresh Data")}
                </Button>
                <Button color="success" onClick={handleAddScaleClick}>
                  <Plus size={14} className="me-50" />
                  {t("Add First Scale")}
                </Button>
              </div>
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

      {/* Add Scale Modal */}
      <Modal isOpen={addScaleModal} toggle={closeModals} size="lg">
        <ModalHeader toggle={closeModals}>
          {t("add_new_scale")}
        </ModalHeader>
        <ModalBody>
          <AddScale
            onSuccess={handleAddScaleSubmit}
            onCancel={closeModals}
            loading={isSubmitting}
            isEdit={false}
            provinces={PROVINCE_OPTIONS}
            systemTypes={SYSTEM_TYPE_OPTIONS}
          />
        </ModalBody>
      </Modal>

      {/* Edit Scale Modal */}
      <Modal isOpen={editScaleModal} toggle={closeModals} size="lg">
        <ModalHeader toggle={closeModals}>
          {t("edit_scale")} - {selectedScale?.name}
        </ModalHeader>
        <ModalBody>
          <AddScale
            onSuccess={handleEditScaleSubmit}
            onCancel={closeModals}
            initialData={selectedScale}
            loading={isSubmitting}
            isEdit={true}
            provinces={PROVINCE_OPTIONS}
            systemTypes={SYSTEM_TYPE_OPTIONS}
          />
        </ModalBody>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal} toggle={closeModals}>
        <ModalHeader toggle={closeModals}>
          {t("delete_scale")}
        </ModalHeader>
        <ModalBody>
          <p>
            {t("Are you sure you want to delete this scale?")}
          </p>
          {selectedScale && (
            <div className="mt-2">
              <strong>{selectedScale.name}</strong>
              <br />
              <small className="text-muted">
                {t("Location:")} {selectedScale.location} | {t("System:")} {selectedScale.system_type}
              </small>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={closeModals}>
            {t("cancel")}
          </Button>
          <Button color="danger" onClick={handleDeleteConfirm}>
            <Trash2 size={14} className="me-50" />
            {t("delete")}
          </Button>
        </ModalFooter>
      </Modal>
    </Fragment>
  );
};

export default ScaleTable;