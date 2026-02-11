// ** React Imports
import { useState, Fragment, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

// ** Third Party Components
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
  Collapse,
  Spinner,
} from "reactstrap";

// ** Import AddCar Component
import AddCar from "./addCar/AddCar.js";

// ** API Base URL
const API_URL = "http://127.0.0.1:8000/test1";

const CarTable = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // ** Get company data
  const { company: companyFromState, fromCompany: fromCompanyState } =
    location.state || {};
  const searchParams = new URLSearchParams(location.search);
  const companyIdFromUrl = searchParams.get("companyId");
  const companyNameFromUrl = searchParams.get("companyName");

  const company =
    companyFromState ||
    (companyIdFromUrl
      ? {
          id: parseInt(companyIdFromUrl),
          company_name: decodeURIComponent(companyNameFromUrl || ""),
        }
      : null);

  const fromCompany = fromCompanyState || !!companyIdFromUrl;

  // ** States
  const [searchCarName, setSearchCarName] = useState("");
  const [searchPlateNumber, setSearchPlateNumber] = useState("");
  const [searchDriverName, setSearchDriverName] = useState("");
  const [searchCompanyName, setSearchCompanyName] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [dateRange, setDateRange] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [cars, setCars] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [vehicleTypesMap, setVehicleTypesMap] = useState({});
  const [companies, setCompanies] = useState([]);
  const [companiesMap, setCompaniesMap] = useState({});
  const [totalCars, setTotalCars] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);

  // ** Modal States
  const [addCarModal, setAddCarModal] = useState(false);
  const [editCarModal, setEditCarModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
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

  // ** Fetch all companies and create mapping
  const fetchCompanies = useCallback(async () => {
    try {
      console.log("Fetching companies...");
      const config = getAxiosConfig();

      let allCompanies = [];
      let nextUrl = `${API_URL}/companies/`;

      while (nextUrl) {
        try {
          const response = await axios.get(nextUrl, config);
          console.log("Companies API response:", response.data);

          let data = [];
          if (response.data && response.data.results) {
            data = response.data.results;
            nextUrl = response.data.next;
          } else if (Array.isArray(response.data)) {
            data = response.data;
            nextUrl = null;
          } else {
            data = [];
            nextUrl = null;
          }

          allCompanies = [...allCompanies, ...data];

          if (!response.data.next) {
            break;
          }
        } catch (error) {
          console.error("Error fetching companies page:", error);
          break;
        }
      }

      console.log("All companies fetched:", allCompanies.length, "companies");

      // Create a mapping of company ID to company name
      const map = {};
      allCompanies.forEach((company) => {
        if (company && company.id) {
          map[company.id] = company.company_name || `Company ${company.id}`;
        }
      });

      setCompanies(allCompanies);
      setCompaniesMap(map);
      console.log(
        "Companies mapping created with",
        Object.keys(map).length,
        "entries",
      );
      return map;
    } catch (error) {
      console.error("Error fetching companies:", error);
      return {};
    }
  }, []);

  // ** Fetch vehicle types
  const fetchVehicleTypes = useCallback(async () => {
    try {
      const config = getAxiosConfig();
      console.log("Fetching vehicle types...");

      let allVehicleTypes = [];
      let nextUrl = `${API_URL}/vehicle-types/`;

      try {
        const response = await axios.get(nextUrl, config);
        console.log("Vehicle types API response:", response.data);

        let data = [];
        if (response.data && response.data.results) {
          data = response.data.results;
        } else if (Array.isArray(response.data)) {
          data = response.data;
        }

        allVehicleTypes = data;
      } catch (error) {
        console.log("Trying /vehicletypes/ endpoint...");
        try {
          const response2 = await axios.get(`${API_URL}/vehicletypes/`, config);
          if (response2.data && response2.data.results) {
            allVehicleTypes = response2.data.results;
          } else if (Array.isArray(response2.data)) {
            allVehicleTypes = response2.data;
          }
        } catch (error2) {
          console.error("Error fetching vehicle types:", error2);
          return {};
        }
      }

      console.log(
        "All vehicle types fetched:",
        allVehicleTypes.length,
        "types",
      );

      setVehicleTypes(allVehicleTypes);

      const map = {};
      allVehicleTypes.forEach((type) => {
        map[type.id] =
          type.truck_name ||
          type.name ||
          type.vehicle_type_name ||
          `Type ${type.id}`;
      });

      console.log(
        "Vehicle types mapping created with",
        Object.keys(map).length,
        "entries",
      );
      setVehicleTypesMap(map);

      return map;
    } catch (error) {
      console.error("Error fetching vehicle types:", error);
      return {};
    }
  }, []);

  // ** Process vehicle data to extract company name and vehicle type
  const processVehicleData = (vehicle, companiesMap, vehicleTypesMap) => {
    if (!vehicle) return null;

    console.log("Processing vehicle ID:", vehicle.id);
    console.log("Vehicle raw data:", vehicle);

    // Process company name
    let companyName = "N/A";
    let companyId = null;

    // Check the companies array (ManyToMany relationship)
    if (vehicle.companies && Array.isArray(vehicle.companies)) {
      if (vehicle.companies.length > 0) {
        const firstCompany = vehicle.companies[0];
        
        // Case 1: Company is an object with company_name
        if (typeof firstCompany === 'object' && firstCompany.company_name) {
          companyName = firstCompany.company_name;
          companyId = firstCompany.id;
          console.log(`Found company object in array: ${companyName} (ID: ${companyId})`);
        } 
        // Case 2: Company is just an ID
        else if (typeof firstCompany === 'number' || typeof firstCompany === 'string') {
          companyId = parseInt(firstCompany);
          companyName = companiesMap[companyId] || `Company ${companyId}`;
          console.log(`Found company ID in array: ${companyId} -> ${companyName}`);
        }
      }
    }
    
    // Check for company field (if it exists as a direct foreign key)
    else if (vehicle.company) {
      if (typeof vehicle.company === 'object' && vehicle.company.company_name) {
        companyName = vehicle.company.company_name;
        companyId = vehicle.company.id;
        console.log(`Found company object: ${companyName} (ID: ${companyId})`);
      } else if (typeof vehicle.company === 'number' || typeof vehicle.company === 'string') {
        companyId = parseInt(vehicle.company);
        companyName = companiesMap[companyId] || `Company ${companyId}`;
        console.log(`Found company ID: ${companyId} -> ${companyName}`);
      }
    }

    // Process vehicle type - CHECK FOR NEW FIELDS FIRST
    let vehicleTypeDisplay = "N/A";
    let vehicleTypeId = null;
    
    // First check for the new flat fields from backend
    if (vehicle.vehicle_type_name) {
      vehicleTypeDisplay = vehicle.vehicle_type_name;
      vehicleTypeId = vehicle.vehicle_type;
      console.log(`Found vehicle_type_name field: ${vehicleTypeDisplay} (ID: ${vehicleTypeId})`);
    }
    // Check for vehicle_type_truck_name (alternative field)
    else if (vehicle.vehicle_type_truck_name) {
      vehicleTypeDisplay = vehicle.vehicle_type_truck_name;
      vehicleTypeId = vehicle.vehicle_type;
      console.log(`Found vehicle_type_truck_name field: ${vehicleTypeDisplay}`);
    }
    // Check for nested vehicle_type object
    else if (vehicle.vehicle_type && typeof vehicle.vehicle_type === 'object') {
      vehicleTypeDisplay =
        vehicle.vehicle_type.truck_name ||
        vehicle.vehicle_type.name ||
        vehicle.vehicle_type.vehicle_type_name ||
        `Type ${vehicle.vehicle_type.id}`;
      vehicleTypeId = vehicle.vehicle_type.id;
      console.log(`Found nested vehicle_type object: ${vehicleTypeDisplay}`);
    }
    // Check for vehicle_type as ID
    else if (vehicle.vehicle_type && (typeof vehicle.vehicle_type === 'number' || typeof vehicle.vehicle_type === 'string')) {
      vehicleTypeId = parseInt(vehicle.vehicle_type);
      vehicleTypeDisplay = vehicleTypesMap[vehicleTypeId] || `Type ${vehicleTypeId}`;
      console.log(`Found vehicle_type ID: ${vehicleTypeId} -> ${vehicleTypeDisplay}`);
    }


    return {
      ...vehicle,
      company_display: companyName,
      company_id: companyId,
      vehicle_type_display: vehicleTypeDisplay,
      vehicle_type_id: vehicleTypeId,
    };
  };

  // ** Fetch cars from API with pagination
  const fetchCars = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        console.log("Fetching vehicles page", page);
        console.log("Company context:", company);
        console.log("From company:", fromCompany);
        console.log("Companies map available:", Object.keys(companiesMap).length);
        const config = getAxiosConfig();

        let url = `${API_URL}/vehicles/?page=${page}&page_size=7`;

        // When viewing from a company, filter by company
        if (fromCompany && company && company.id) {
          console.log(`Filtering by company ID: ${company.id}`);
          // For GET requests with filtering, we can use query parameters
          // The backend might need to support filtering by company
          url = `${API_URL}/vehicles/?page=${page}&page_size=7`;
        }

        console.log("Fetching from URL:", url);

        const response = await axios.get(url, config);
        console.log("Got vehicles response:", response.data);

        let data = [];
        let total = 0;

        if (response.data && response.data.results) {
          // Paginated response
          data = response.data.results;
          total = response.data.count || data.length;
          console.log("Paginated data found, total vehicles:", total);
        } else if (Array.isArray(response.data)) {
          // Non-paginated response
          data = response.data;
          total = data.length;
        } else {
          console.log("Unexpected response format:", response.data);
          data = [];
          total = 0;
        }

     

        // Process vehicles to add company name and vehicle type display
        const processedData = data
          .map((vehicle) => processVehicleData(vehicle, companiesMap, vehicleTypesMap))
          .filter(Boolean); // Remove null entries

        console.log("Processed vehicles:", processedData.length, "items");

        // Filter by company if needed
        let finalData = processedData;
        let finalTotal = total;
        
        if (fromCompany && company) {
          finalData = processedData.filter((vehicle) => {
            if (!vehicle.company_id) {
              console.log(`Vehicle ${vehicle.id} has no company_id, skipping`);
              return false;
            }
            const matches = vehicle.company_id === company.id;
            console.log(`Vehicle ${vehicle.id} company ${vehicle.company_id} matches ${company.id}: ${matches}`);
            return matches;
          });
          
          finalTotal = finalData.length;
          console.log(`Filtered ${finalData.length} vehicles for company ${company.company_name}`);
        }

        setCars(finalData);
        setFilteredData(finalData);
        setTotalCars(finalTotal);
        setTotalPages(Math.ceil(finalTotal / 7));
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        console.error("Error details:", error.response?.data);

        if (error.response?.status === 401) {
          toast.error(t("Please login first"));
        } else if (error.response?.status === 404) {
          // Endpoint not found, try alternative
          try {
            console.log("Trying alternative endpoint...");
            let altUrl = `${API_URL}/vehicle/?page=${page}&page_size=7`;

            const altResponse = await axios.get(altUrl, getAxiosConfig());

            let altData = [];
            let altTotal = 0;

            if (altResponse.data && altResponse.data.results) {
              altData = altResponse.data.results;
              altTotal = altResponse.data.count || altData.length;
            } else if (Array.isArray(altResponse.data)) {
              altData = altResponse.data;
              altTotal = altData.length;
            }

            // Process the alternative data
            const processedAltData = altData
              .map((vehicle) => processVehicleData(vehicle, companiesMap, vehicleTypesMap))
              .filter(Boolean);

            let finalAltData = processedAltData;
            let finalAltTotal = altTotal;
            
            if (fromCompany && company) {
              finalAltData = processedAltData.filter((vehicle) => {
                if (!vehicle.company_id) return false;
                return vehicle.company_id === company.id;
              });
              finalAltTotal = finalAltData.length;
            }

            setCars(finalAltData);
            setFilteredData(finalAltData);
            setTotalCars(finalAltTotal);
            setTotalPages(Math.ceil(finalAltTotal / 7));
          } catch (altError) {
            console.error(
              "Error fetching from alternative endpoint:",
              altError,
            );
            toast.error(t("Failed to load vehicles"));
            setCars([]);
            setFilteredData([]);
            setTotalCars(0);
            setTotalPages(0);
          }
        } else {
          toast.error(t("Failed to load vehicles"));
          setCars([]);
          setFilteredData([]);
          setTotalCars(0);
          setTotalPages(0);
        }
      } finally {
        setLoading(false);
        setDataLoaded(true);
      }
    },
    [company, fromCompany, companiesMap, vehicleTypesMap, t],
  );

  // ** Initialize data
  useEffect(() => {
   

    const loadInitialData = async () => {
      setLoading(true);
      try {
        // Fetch companies first and wait for completion
        const companiesMapResult = await fetchCompanies();
        console.log("Companies loaded, mapping size:", Object.keys(companiesMapResult).length);
        
        // Fetch vehicle types
        const vehicleTypesMapResult = await fetchVehicleTypes();
        console.log("Vehicle types loaded, mapping size:", Object.keys(vehicleTypesMapResult).length);
        
        // Now fetch cars with current page
        await fetchCars(currentPage + 1);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []); // Empty dependency array to run only once on mount

  // ** Fetch cars when page changes
  useEffect(() => {
    if (dataLoaded) {
      fetchCars(currentPage + 1);
    }
  }, [currentPage, fetchCars, dataLoaded]);

  // ** Apply filters when search criteria change - CLIENT SIDE FILTERING
  useEffect(() => {
    let data = cars;

    if (searchCarName) {
      data = data.filter((c) =>
        (c.car_name || "").toLowerCase().includes(searchCarName.toLowerCase()),
      );
    }

    if (searchPlateNumber) {
      data = data.filter((c) =>
        (c.plate_number || "")
          .toLowerCase()
          .includes(searchPlateNumber.toLowerCase()),
      );
    }

    if (searchDriverName) {
      data = data.filter((c) =>
        (c.driver_name || "")
          .toLowerCase()
          .includes(searchDriverName.toLowerCase()),
      );
    }

    if (searchCompanyName && !fromCompany) {
      data = data.filter((c) =>
        (c.company_display || "")
          .toLowerCase()
          .includes(searchCompanyName.toLowerCase()),
      );
    }

    if (searchStatus !== "") {
      data = data.filter((c) => {
        const statusNum = parseInt(searchStatus);
        return c.status === statusNum || c.status === searchStatus;
      });
    }

    setFilteredData(data);
  }, [
    searchCarName,
    searchPlateNumber,
    searchDriverName,
    searchCompanyName,
    searchStatus,
    dateRange,
    cars,
    fromCompany,
  ]);

  // ** Handle Back Button Click
  const handleBackClick = () => {
    navigate(-1);
  };

  // ** Toggle Filter Section
  const toggleFilter = () => setFilterOpen(!filterOpen);

  // ** Clear All Filters
  const clearFilters = () => {
    setSearchCarName("");
    setSearchPlateNumber("");
    setSearchDriverName("");
    setSearchCompanyName("");
    setSearchStatus("");
    setDateRange([]);
  };

  // ** Handle Edit Click
  const handleEdit = (car) => {
    setSelectedCar(car);
    setEditCarModal(true);
  };

  // ** Handle Delete Click
  const handleDeleteClick = (carId) => {
    const car = cars.find((c) => c.id === carId);
    setSelectedCar(car);
    setDeleteModal(true);
  };

  // ** Table columns configuration
  const columns = [
    {
      name: t("ID"),
      selector: (row) => row.id,
      sortable: true,
      width: "70px",
    },
    {
      name: t("Car Name"),
      selector: (row) => row.car_name || "N/A",
      sortable: true,
      minWidth: "120px",
    },
    {
      name: t("Plate Number"),
      selector: (row) => row.plate_number || "N/A",
      sortable: true,
      minWidth: "120px",
    },
    {
      name: t("Driver Name"),
      selector: (row) => row.driver_name || "N/A",
      sortable: true,
      minWidth: "120px",
    },
    {
      name: t("Empty Weight"),
      selector: (row) => row.empty_weight || 0,
      sortable: true,
      cell: (row) => `${row.empty_weight || 0} kg`,
      width: "120px",
    },
    {
      name: t("Vehicle Type"),
      selector: (row) => row.vehicle_type_display || row.vehicle_type_name || "N/A",
      sortable: true,
      width: "120px",
    },
    ...(!fromCompany
      ? [
          {
            name: t("Company"),
            selector: (row) => {
              // Use the processed company display name
              if (row.company_display && row.company_display !== "N/A") {
                return row.company_display;
              }
              
              // Fallback: Check if there's a companies array with IDs
              if (row.companies && Array.isArray(row.companies) && row.companies.length > 0) {
                const companyId = row.companies[0];
                return companiesMap[companyId] || `Company ${companyId}`;
              }
              
              return "N/A";
            },
            sortable: true,
            minWidth: "150px",
          },
        ]
      : []),
    {
      name: t("Status"),
      selector: (row) => (row.status === 1 ? t("Active") : t("Inactive")),
      sortable: true,
      width: "100px",
      cell: (row) => {
        const statusText = row.status === 1 ? t("Active") : t("Inactive");
        const badgeColor = row.status === 1 ? "success" : "secondary";
        return <Badge color={badgeColor}>{statusText}</Badge>;
      },
    },
    
    {
      name: t("Actions"),
      cell: (row) => (
        <div className="d-flex">
          <Button
            color="primary"
            size="sm"
            className="me-1"
            onClick={() => handleEdit(row)}
            title={t("Edit")}
          >
            <Edit size={14} />
          </Button>
          <Button
            color="danger"
            size="sm"
            onClick={() => handleDeleteClick(row.id)}
            title={t("Delete")}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
      width: "100px",
    },
  ];

  // ** Function to handle Pagination
  const handlePagination = (page) => {
    const newPage = page.selected;
    setCurrentPage(newPage);
  };

  // ** Custom Pagination
  const CustomPagination = () => {
    // Calculate pages based on totalCars (not filteredData)
    const pageCount = totalPages || Math.ceil(totalCars / 7);

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

  // ** Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (selectedCar) {
      try {
        const config = getAxiosConfig();

        // Try both endpoints
        try {
          await axios.delete(`${API_URL}/vehicles/${selectedCar.id}/`, config);
        } catch (error) {
          await axios.delete(`${API_URL}/vehicle/${selectedCar.id}/`, config);
        }

        toast.success(t("Vehicle deleted successfully!"));
        fetchCars(currentPage + 1);
        setDeleteModal(false);
        setSelectedCar(null);
      } catch (error) {
        toast.error(t("Failed to delete vehicle"));
      }
    }
  };

  // ** Handle Add Vehicle Submission
  const handleAddVehicleSubmit = async (vehicleData) => {
    setIsSubmitting(true);

    try {

      const formattedData = {
        car_name: vehicleData.carName,
        plate_number: vehicleData.plateNumber,
        driver_name: vehicleData.driverName,
        empty_weight: parseInt(vehicleData.emptyWeight) || 0,
        vehicle_type: vehicleData.vehicleType || null,
        status: vehicleData.status === "active" ? 1 : 2,
      };

      // IMPORTANT: Send companies as an array
      if (fromCompany && company) {
        formattedData.companies = [company.id];
     
      } else if (vehicleData.selectedCompany) {
        // When adding from general view with company selection
        formattedData.companies = [vehicleData.selectedCompany];
       
      }


      const config = getAxiosConfig();

      // Try both endpoints
      let response;
      try {
        response = await axios.post(
          `${API_URL}/vehicles/`,
          formattedData,
          config,
        );
      } catch (error) {
        response = await axios.post(
          `${API_URL}/vehicle/`,
          formattedData,
          config,
        );
      }


      if (response.status === 201) {
        toast.success(t("Vehicle added successfully!"));
        setAddCarModal(false);
        // Reset to first page when adding new vehicle
        setCurrentPage(0);
        fetchCars(1);
      }
    } catch (error) {
      console.error("Error adding vehicle:", error);
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
        toast.error(errorMsg || t("Failed to add vehicle"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ** Handle Edit Vehicle Submission
  const handleEditVehicleSubmit = async (vehicleData) => {
    setIsSubmitting(true);

    try {
      console.log("Updating vehicle data:", vehicleData);

      const formattedData = {
        car_name: vehicleData.carName,
        plate_number: vehicleData.plateNumber,
        driver_name: vehicleData.driverName,
        empty_weight: parseInt(vehicleData.emptyWeight) || 0,
        vehicle_type: vehicleData.vehicleType || null,
        status: vehicleData.status === "active" ? 1 : 2,
      };

      // IMPORTANT: Send companies as an array
      if (fromCompany && company) {
        formattedData.companies = [company.id];
        console.log(`Updating vehicle with company: ${company.id}`);
      } else if (vehicleData.selectedCompany) {
        formattedData.companies = [vehicleData.selectedCompany];
      }

      console.log("Sending update:", formattedData);

      const config = getAxiosConfig();

      // Try both endpoints
      let response;
      try {
        response = await axios.put(
          `${API_URL}/vehicles/${selectedCar.id}/`,
          formattedData,
          config,
        );
      } catch (error) {
        response = await axios.put(
          `${API_URL}/vehicle/${selectedCar.id}/`,
          formattedData,
          config,
        );
      }

      console.log("Update response:", response);

      if (response.status === 200) {
        toast.success(t("Vehicle updated successfully!"));
        setEditCarModal(false);
        setSelectedCar(null);
        fetchCars(currentPage + 1);
      }
    } catch (error) {
      console.error("Error updating vehicle:", error);
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
          error.response?.data?.message || t("Failed to update vehicle"),
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ** Handle Add Vehicle Button Click
  const handleAddVehicleClick = () => {
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

  // ** Refresh data when company changes
  useEffect(() => {
    if (dataLoaded) {
      setCurrentPage(0);
      fetchCars(1);
    }
  }, [company, fromCompany, dataLoaded, fetchCars]);



  return (
    <Fragment>
      <ToastContainer position="top-left" autoClose={3000} />

      <Card>
        <CardHeader className="border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              {fromCompany && (
                <Button
                  color="secondary"
                  onClick={handleBackClick}
                  className="me-2 d-flex align-items-center"
                >
                  <ArrowLeft size={14} className="me-50" />
                  {t("Back")}
                </Button>
              )}
              <CardTitle tag="h4" className="mb-0">
                {fromCompany && company
                  ? `${t("Vehicle Management")} - ${company.company_name}`
                  : t("Vehicle Management")}
                {fromCompany && company && (
                  <Badge color="primary" className="ms-2">
                    {t("Company View")}
                  </Badge>
                )}
                <Badge color="dark" className="ms-2 m-1 p-1">
                  {totalCars} {t("Vehicles")}
                </Badge>
              </CardTitle>
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
                onClick={handleAddVehicleClick}
                className="d-flex align-items-center"
              >
                <Plus size={14} className="me-50" />
                {t("Add Vehicle")}
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
                  {t("Car Name")}:
                </Label>
                <Input
                  id="carName"
                  placeholder={t("Filter by Car Name")}
                  value={searchCarName}
                  onChange={(e) => setSearchCarName(e.target.value)}
                />
              </Col>

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="plateNumber">
                  {t("Plate Number")}:
                </Label>
                <Input
                  id="plateNumber"
                  placeholder={t("Filter by Plate Number")}
                  value={searchPlateNumber}
                  onChange={(e) => setSearchPlateNumber(e.target.value)}
                />
              </Col>

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="driverName">
                  {t("Driver Name")}:
                </Label>
                <Input
                  id="driverName"
                  placeholder={t("Filter by Driver Name")}
                  value={searchDriverName}
                  onChange={(e) => setSearchDriverName(e.target.value)}
                />
              </Col>

              {!fromCompany && (
                <Col lg="3" md="6" className="mb-1">
                  <Label className="form-label" htmlFor="companyName">
                    {t("Company Name")}:
                  </Label>
                  <Input
                    id="companyName"
                    placeholder={t("Filter by Company")}
                    value={searchCompanyName}
                    onChange={(e) => setSearchCompanyName(e.target.value)}
                  />
                </Col>
              )}

              <Col lg="3" md="6" className="mb-1">
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
                lg="12"
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
          {loading && !dataLoaded ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
              <p className="mt-2">{t("Loading vehicles...")}</p>
            </div>
          ) : filteredData.length === 0 && cars.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">
                {fromCompany && company
                  ? t(`No vehicles found for ${company.company_name}`)
                  : t("No vehicles found")}
              </p>
            
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

      {/* Add Vehicle Modal */}
      <Modal isOpen={addCarModal} toggle={closeModals} size="lg">
        <ModalHeader toggle={closeModals}>
          {t("Add New Vehicle")}
          {fromCompany && company && ` - ${company.company_name}`}
        </ModalHeader>
        <ModalBody>
          {loading ? (
            <div className="text-center py-4">
              <Spinner color="primary" />
              <p className="mt-2">{t("Loading form data...")}</p>
            </div>
          ) : (
            <AddCar
              onSuccess={handleAddVehicleSubmit}
              onCancel={closeModals}
              selectedCompany={fromCompany ? company : null}
              loading={isSubmitting}
              isEdit={false}
              vehicleTypes={vehicleTypes}
              vehicleTypesMap={vehicleTypesMap}
              companies={companies}
            />
          )}
        </ModalBody>
      </Modal>

      {/* Edit Vehicle Modal */}
      <Modal isOpen={editCarModal} toggle={closeModals} size="lg">
        <ModalHeader toggle={closeModals}>
          {t("Edit Vehicle")} - {selectedCar?.car_name}
        </ModalHeader>
        <ModalBody>
          {loading ? (
            <div className="text-center py-4">
              <Spinner color="primary" />
              <p className="mt-2">{t("Loading form data...")}</p>
            </div>
          ) : (
            <AddCar
              onSuccess={handleEditVehicleSubmit}
              onCancel={closeModals}
              initialData={selectedCar}
              loading={isSubmitting}
              isEdit={true}
              vehicleTypes={vehicleTypes}
              vehicleTypesMap={vehicleTypesMap}
              companies={companies}
            />
          )}
        </ModalBody>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal} toggle={closeModals}>
        <ModalHeader toggle={closeModals}>{t("Delete Vehicle")}</ModalHeader>
        <ModalBody>
          <p>
            {t(
              "Are you sure you want to delete this vehicle? This action cannot be undone.",
            )}
          </p>
          {selectedCar && (
            <div className="mt-2">
              <strong>{selectedCar.car_name}</strong>
              <br />
              <small className="text-muted">
                {t("Plate")}: {selectedCar.plate_number} | {t("Driver")}:{" "}
                {selectedCar.driver_name} | {t("Type")}: {selectedCar.vehicle_type_display}
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

export default CarTable;