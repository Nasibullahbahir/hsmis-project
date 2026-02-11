// ** React Imports
import { useState, Fragment, useEffect, useCallback, useMemo } from "react";
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
  Database,
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

// ** Import MaktoobInfo Component
import MaktoobInfo from "./addMaktoob/AddNewMaktoob.js";

import gregorianToShamsi from "../gregorianToShamsi.js";

// ** API Base URL
const API_URL = "http://127.0.0.1:8000/test1";

const MaktoobTable = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // ** Get company data (LIKE CARTABLE)
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

  // ** Maktoob Type mapping with translation - MOVED TO useMemo
  const maktoobTypeMap = useMemo(() => ({
    "maktoob-contract": t("Maktoob Contract"),
    "maktoob-tamded": t("Maktoob Tamded"),
    "maktoob-khosh": t("Maktoob Sale"),
    "maktoob-royality": t("Maktoob Royalty"),
    "maktoob-baharbardry": t("Maktoob Baharbardry"),
    "maktoob-paskha": t("Maktoob Paskha"),
    "maktoob-process": t("Maktoob Process"),
  }), [t]);

  // ** States
  const [searchMaktoobNumber, setSearchMaktoobNumber] = useState("");
  const [searchMaktoobType, setSearchMaktoobType] = useState("");
  const [searchCompanyName, setSearchCompanyName] = useState("");
  const [searchSadirDate, setSearchSadirDate] = useState("");
  const [searchSource, setSearchSource] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [filteredData, setFilteredData] = useState([]);
  const [maktoobs, setMaktoobs] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [companiesMap, setCompaniesMap] = useState({});
  const [totalMaktoobs, setTotalMaktoobs] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [existingMaktoobNumbers, setExistingMaktoobNumbers] = useState([]);

  // ** Modal States
  const [addMaktoobModal, setAddMaktoobModal] = useState(false);
  const [editMaktoobModal, setEditMaktoobModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedMaktoob, setSelectedMaktoob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ** Get authentication token
  const getAuthToken = () => {
    return localStorage.getItem("access_token");
  };

  // ** Configure axios headers
  const getAxiosConfig = useCallback(() => {
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
  }, []);

  // ** Fetch all companies and create mapping (LIKE CARTABLE)
  const fetchCompanies = useCallback(async () => {
    try {
      console.log("Fetching companies...");
      const config = getAxiosConfig();

      let allCompanies = [];
      let nextUrl = `${API_URL}/companies/`;

      while (nextUrl) {
        try {
          const response = await axios.get(nextUrl, config);

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

      // Create a mapping of company ID to company name
      const map = {};
      allCompanies.forEach((company) => {
        if (company && company.id) {
          map[company.id] = company.company_name || `Company ${company.id}`;
        }
      });

      setCompanies(allCompanies);
      setCompaniesMap(map);
      return map;
    } catch (error) {
      console.error("Error fetching companies:", error);
      return {};
    }
  }, [getAxiosConfig]);

  // ** Fetch all existing maktoob numbers for validation
  const fetchAllMaktoobNumbers = useCallback(async () => {
    try {
      const config = getAxiosConfig();
      let allMaktoobs = [];
      let nextUrl = `${API_URL}/maktoobs/`;

      while (nextUrl) {
        try {
          const response = await axios.get(nextUrl, config);

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

          allMaktoobs = [...allMaktoobs, ...data];

          if (!response.data.next) {
            break;
          }
        } catch (error) {
          console.error("Error fetching maktoobs page:", error);
          break;
        }
      }

      // Extract all maktoob numbers
      const maktoobNumbers = allMaktoobs
        .filter(m => m.maktoob_number)
        .map(m => m.maktoob_number.toString());
      
      setExistingMaktoobNumbers(maktoobNumbers);
      return maktoobNumbers;
    } catch (error) {
      console.error("Error fetching maktoob numbers:", error);
      return [];
    }
  }, [getAxiosConfig]);

  // ** Fetch users for dropdown
  const fetchUsers = useCallback(async () => {
    try {
      const config = getAxiosConfig();

      let allUsers = [];
      let nextUrl = `${API_URL}/users/`;

      while (nextUrl) {
        try {
          const response = await axios.get(nextUrl, config);

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

          allUsers = [...allUsers, ...data];

          if (!response.data.next) {
            break;
          }
        } catch (error) {
          console.error("Error fetching users page:", error);
          break;
        }
      }

      setUsers(allUsers);
      return allUsers;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  }, [getAxiosConfig]);

  // ** Process maktoob data to extract company name (LIKE CARTABLE)
  const processMaktoobData = useCallback((maktoob, companiesMapping) => {
    if (!maktoob) return null;

    // Process company name
    let companyName = "N/A";
    let companyId = null;

    // Check for company field
    if (maktoob.company) {
      if (typeof maktoob.company === 'object' && maktoob.company.company_name) {
        companyName = maktoob.company.company_name;
        companyId = maktoob.company.id;
      } else if (typeof maktoob.company === 'number' || typeof maktoob.company === 'string') {
        companyId = parseInt(maktoob.company);
        companyName = companiesMapping[companyId] || `Company ${companyId}`;
      }
    }

    return {
      ...maktoob,
      company_display: companyName,
      company_id: companyId,
    };
  }, []);

  // ** Fetch maktoobs from API with pagination (LIKE CARTABLE)
  const fetchMaktoobs = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const config = getAxiosConfig();

        let url = `${API_URL}/maktoobs/?page=${page}&page_size=7`;

        const response = await axios.get(url, config);

        let data = [];
        let total = 0;

        if (response.data && response.data.results) {
          // Paginated response
          data = response.data.results;
          total = response.data.count || data.length;
        } else if (Array.isArray(response.data)) {
          // Non-paginated response
          data = response.data;
          total = data.length;
        } else {
          data = [];
          total = 0;
        }

        // Process maktoobs to add company name and ID
        const processedData = data
          .map((maktoob) => processMaktoobData(maktoob, companiesMap))
          .filter(Boolean);

        // Filter by company if needed (client-side filtering LIKE CARTABLE)
        let finalData = processedData;
        let finalTotal = total;
        
        if (fromCompany && company) {
          finalData = processedData.filter((maktoob) => {
            if (!maktoob.company_id) {
              return false;
            }
            return maktoob.company_id === company.id;
          });
          
          finalTotal = finalData.length;
        }

        setMaktoobs(finalData);
        setFilteredData(finalData);
        setTotalMaktoobs(finalTotal);
        setTotalPages(Math.ceil(finalTotal / 7));
      } catch (error) {
        console.error("Error fetching maktoobs:", error);

        if (error.response?.status === 401) {
          toast.error(t("Please login first"));
        } else if (error.response?.status === 404) {
          // Endpoint not found, try alternative
          try {
            const altUrl = `${API_URL}/maktoob/?page=${page}&page_size=7`;
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
              .map((maktoob) => processMaktoobData(maktoob, companiesMap))
              .filter(Boolean);

            let finalAltData = processedAltData;
            let finalAltTotal = altTotal;
            
            if (fromCompany && company) {
              finalAltData = processedAltData.filter((maktoob) => {
                if (!maktoob.company_id) return false;
                return maktoob.company_id === company.id;
              });
              finalAltTotal = finalAltData.length;
            }

            setMaktoobs(finalAltData);
            setFilteredData(finalAltData);
            setTotalMaktoobs(finalAltTotal);
            setTotalPages(Math.ceil(finalAltTotal / 7));
          } catch (altError) {
            console.error("Error fetching from alternative endpoint:", altError);
            toast.error(t("Failed to load maktoobs"));
            setMaktoobs([]);
            setFilteredData([]);
            setTotalMaktoobs(0);
            setTotalPages(0);
          }
        } else {
          toast.error(t("Failed to load maktoobs"));
          setMaktoobs([]);
          setFilteredData([]);
          setTotalMaktoobs(0);
          setTotalPages(0);
        }
      } finally {
        setLoading(false);
        setDataLoaded(true);
      }
    },
    [company, fromCompany, companiesMap, processMaktoobData, t, getAxiosConfig],
  );

  // ** Initialize data (LIKE CARTABLE)
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        // Fetch companies first and wait for completion
        const companiesMapResult = await fetchCompanies();
        
        // Fetch users
        await fetchUsers();
        
        // Fetch all existing maktoob numbers for validation
        await fetchAllMaktoobNumbers();
        
        // Now fetch maktoobs with current page
        await fetchMaktoobs(currentPage + 1);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []); // Empty dependency array to run only once on mount

  // ** Fetch maktoobs when page changes
  useEffect(() => {
    if (dataLoaded) {
      fetchMaktoobs(currentPage + 1);
    }
  }, [currentPage, fetchMaktoobs, dataLoaded]);

  // ** Apply filters when search criteria change - CLIENT SIDE FILTERING (LIKE CARTABLE)
  useEffect(() => {
    let data = maktoobs;

    if (searchMaktoobNumber) {
      data = data.filter((m) =>
        m.maktoob_number?.toString().includes(searchMaktoobNumber),
      );
    }

    if (searchMaktoobType) {
      data = data.filter((m) => m.maktoob_type === searchMaktoobType);
    }

    // Only show company filter if not in company view (LIKE CARTABLE)
    if (searchCompanyName && !fromCompany) {
      data = data.filter((m) =>
        (m.company_display || "")
          .toLowerCase()
          .includes(searchCompanyName.toLowerCase()),
      );
    }

    if (searchSadirDate) {
      data = data.filter(
        (m) => m.sadir_date && m.sadir_date.includes(searchSadirDate),
      );
    }

    if (searchSource) {
      data = data.filter((m) =>
        (m.source || "").toLowerCase().includes(searchSource.toLowerCase()),
      );
    }

    setFilteredData(data);
  }, [
    searchMaktoobNumber,
    searchMaktoobType,
    searchCompanyName,
    searchSadirDate,
    searchSource,
    maktoobs,
    fromCompany,
  ]);

  // ** Handle Back Button Click (LIKE CARTABLE)
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

  // ** Check if maktoob number already exists
  const isMaktoobNumberUnique = useCallback((maktoobNumber, currentMaktoobId = null) => {
    const numberStr = maktoobNumber.toString();
    
    // Check if this number already exists in the database
    if (existingMaktoobNumbers.includes(numberStr)) {
      // If we're editing, allow the same number for the current maktoob
      if (currentMaktoobId) {
        const existingMaktoob = maktoobs.find(m => 
          m.maktoob_number && m.maktoob_number.toString() === numberStr
        );
        // Allow if it's the same maktoob being edited
        if (existingMaktoob && existingMaktoob.id === currentMaktoobId) {
          return true;
        }
      }
      return false;
    }
    return true;
  }, [existingMaktoobNumbers, maktoobs]);

  // ** Table columns configuration (LIKE CARTABLE)
  const columns = useMemo(() => [
    {
      name: t("ID"),
      selector: (row) => row.id,
      sortable: true,
      width: "70px",
    },
    {
      name: t("Maktoob Type"),
      selector: (row) =>
        maktoobTypeMap[row.maktoob_type] || row.maktoob_type || "N/A",
      sortable: true,
      minWidth: "150px",
    },
    {
      name: t("Maktoob Number"),
      selector: (row) => row.maktoob_number || "N/A",
      sortable: true,
      minWidth: "120px",
    },
    {
      name: t("Sadir Date"),
      selector: (row) =>
        row.sadir_date ? gregorianToShamsi(row.sadir_date) : "N/A",
      sortable: true,
      minWidth: "120px",
    },
    {
      name: t("Source"),
      selector: (row) => row.source || "N/A",
      sortable: true,
      minWidth: "150px",
    },
    {
      name: t("Start Date"),
      selector: (row) =>
        row.start_date ? gregorianToShamsi(row.start_date) : "N/A",
      sortable: true,
      minWidth: "120px",
    },
    {
      name: t("End Date"),
      selector: (row) =>
        row.end_date ? gregorianToShamsi(row.end_date) : "N/A",
      sortable: true,
      minWidth: "120px",
    },
    // Only show Company column if not in company view (LIKE CARTABLE)
    ...(!fromCompany
      ? [
          {
            name: t("Company"),
            selector: (row) => row.company_display || "N/A",
            sortable: true,
            minWidth: "180px",
          },
        ]
      : []),
    {
      name: t("Description"),
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
  ], [t, maktoobTypeMap, fromCompany]);

  // ** Function to handle Pagination (LIKE CARTABLE)
  const handlePagination = (page) => {
    const newPage = page.selected;
    setCurrentPage(newPage);
  };

  // ** Custom Pagination (LIKE CARTABLE)
  const CustomPagination = () => {
    const pageCount = totalPages || Math.ceil(totalMaktoobs / 7);

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
    if (selectedMaktoob) {
      try {
        const config = getAxiosConfig();
        await axios.delete(
          `${API_URL}/maktoobs/${selectedMaktoob.id}/`,
          config,
        );
        toast.success(t("Maktoob deleted successfully!"));
        
        // Update the existing maktoob numbers list
        setExistingMaktoobNumbers(prev => 
          prev.filter(num => num !== selectedMaktoob.maktoob_number?.toString())
        );
        
        // Update state immediately (LIKE CARTABLE)
        setMaktoobs((prev) => prev.filter((m) => m.id !== selectedMaktoob.id));
        setFilteredData((prev) => prev.filter((m) => m.id !== selectedMaktoob.id));
        setTotalMaktoobs(prev => prev - 1);
        
        setDeleteModal(false);
        setSelectedMaktoob(null);
      } catch (error) {
        console.error("Error deleting maktoob:", error);
        toast.error(t("Failed to delete maktoob"));
      }
    }
  };

  // ** Handle Add Maktoob Submission - Auto-assign company if in company view (LIKE CARTABLE)
  const handleAddMaktoobSubmit = async (maktoobData) => {
    setIsSubmitting(true);

    try {
      // Validate maktoob number uniqueness
      if (!isMaktoobNumberUnique(maktoobData.maktoob_number)) {
        toast.error(t("This Maktoob Number already exists. Please use a different number."));
        setIsSubmitting(false);
        return;
      }

      const formattedData = {
        maktoob_type: maktoobData.maktoob_type,
        maktoob_number: parseInt(maktoobData.maktoob_number) || 0,
        sadir_date: maktoobData.sadir_date,
        source: maktoobData.source,
        start_date: maktoobData.start_date,
        end_date: maktoobData.end_date,
        description: maktoobData.description,
        user: maktoobData.user || null,
      };

      // If in company view, auto-set the company (LIKE CARTABLE)
      if (fromCompany && company) {
        formattedData.company = company.id;
      } else if (maktoobData.company && maktoobData.company !== "") {
        formattedData.company = parseInt(maktoobData.company);
      }

      const config = getAxiosConfig();
      const response = await axios.post(
        `${API_URL}/maktoobs/`,
        formattedData,
        config,
      );

      if (response.status === 201) {
        // Add the new maktoob number to existing numbers list
        setExistingMaktoobNumbers(prev => [...prev, maktoobData.maktoob_number.toString()]);
        
        toast.success(t("Maktoob added successfully!"));
        setAddMaktoobModal(false);
        // Reset to first page when adding new maktoob (LIKE CARTABLE)
        setCurrentPage(0);
        fetchMaktoobs(1);
      }
    } catch (error) {
      const errorMsg = error.response?.data;
      if (error.response?.status === 400) {
        // Check if the error is about duplicate maktoob number
        if (errorMsg && typeof errorMsg === 'object') {
          if (errorMsg.maktoob_number && 
              errorMsg.maktoob_number.includes('already exists')) {
            toast.error(t("This Maktoob Number already exists. Please use a different number."));
          } else {
            // Handle other validation errors
            Object.keys(errorMsg).forEach((key) => {
              if (Array.isArray(errorMsg[key])) {
                errorMsg[key].forEach((msg) => {
                  toast.error(`${key}: ${msg}`);
                });
              } else {
                toast.error(`${key}: ${errorMsg[key]}`);
              }
            });
          }
        } else {
          toast.error(t("Invalid data. Please check all fields."));
        }
      } else if (error.response?.status === 401) {
        toast.error(t("Authentication required. Please login."));
      } else {
        toast.error(errorMsg || t("Failed to add maktoob"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ** Handle Edit Maktoob Submission
  const handleEditMaktoobSubmit = async (maktoobData) => {
    setIsSubmitting(true);

    try {
      // Validate maktoob number uniqueness for edits
      if (!isMaktoobNumberUnique(maktoobData.maktoob_number, selectedMaktoob?.id)) {
        toast.error(t("This Maktoob Number already exists. Please use a different number."));
        setIsSubmitting(false);
        return;
      }

      const formattedData = {
        maktoob_type: maktoobData.maktoob_type,
        maktoob_number: parseInt(maktoobData.maktoob_number) || 0,
        sadir_date: maktoobData.sadir_date,
        source: maktoobData.source,
        start_date: maktoobData.start_date,
        end_date: maktoobData.end_date,
        description: maktoobData.description,
        user: maktoobData.user || null,
      };

      // Add company field - Auto-assign if in company view
      if (fromCompany && company) {
        formattedData.company = company.id;
      } else if (maktoobData.company !== undefined && maktoobData.company !== "") {
        formattedData.company = maktoobData.company ? parseInt(maktoobData.company) : null;
      } else {
        formattedData.company = null;
      }

      const config = getAxiosConfig();
      const response = await axios.put(
        `${API_URL}/maktoobs/${selectedMaktoob.id}/`,
        formattedData,
        config,
      );

      if (response.status === 200) {
        // Update the existing maktoob numbers list
        if (selectedMaktoob.maktoob_number !== parseInt(maktoobData.maktoob_number)) {
          // Remove old number and add new one
          setExistingMaktoobNumbers(prev => 
            prev.filter(num => num !== selectedMaktoob.maktoob_number?.toString())
          );
          setExistingMaktoobNumbers(prev => [...prev, maktoobData.maktoob_number.toString()]);
        }
        
        toast.success(t("Maktoob updated successfully!"));
        setEditMaktoobModal(false);
        setSelectedMaktoob(null);
        fetchMaktoobs(currentPage + 1);
      }
    } catch (error) {
      console.error("Error updating maktoob:", error);
      
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        // Check for duplicate maktoob number
        if (errorData.maktoob_number && 
            errorData.maktoob_number.includes('already exists')) {
          toast.error(t("This Maktoob Number already exists. Please use a different number."));
        } else {
          Object.keys(errorData).forEach((key) => {
            if (Array.isArray(errorData[key])) {
              errorData[key].forEach((msg) => {
                toast.error(`${key}: ${msg}`);
              });
            } else {
              toast.error(`${key}: ${errorData[key]}`);
            }
          });
        }
      } else if (error.response?.status === 401) {
        toast.error(t("Authentication required. Please login."));
      } else {
        toast.error(
          error.response?.data?.message || t("Failed to update maktoob"),
        );
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
                  ? `${t("Maktoob Management")} - ${company.company_name}`
                  : t("Maktoob Management")}
                {fromCompany && company && (
                  <Badge color="primary" className="ms-2">
                    {t("Company View")}
                  </Badge>
                )}
                <Badge color="dark" className="ms-2 m-1 p-1">
                  {totalMaktoobs} {t("Maktoobs")}
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
                onClick={handleAddMaktoobClick}
                className="d-flex align-items-center"
              >
                <Plus size={14} className="me-50" />
                {t("Add Maktoob")}
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Filter Section (LIKE CARTABLE layout) */}
        <Collapse isOpen={filterOpen}>
          <CardBody className="pt-0">
            <Row className="mt-1 mb-50">
              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="maktoobNumber">
                  {t("Maktoob Number")}:
                </Label>
                <Input
                  id="maktoobNumber"
                  type="number"
                  placeholder={t("Filter by maktoob number")}
                  value={searchMaktoobNumber}
                  onChange={(e) => setSearchMaktoobNumber(e.target.value)}
                />
              </Col>

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="maktoobType">
                  {t("Maktoob Type")}:
                </Label>
                <Input
                  type="select"
                  id="maktoobType"
                  value={searchMaktoobType}
                  onChange={(e) => setSearchMaktoobType(e.target.value)}
                >
                  <option value="">{t("All Types")}</option>
                  {Object.entries(maktoobTypeMap).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </Input>
              </Col>

              {/* Only show company filter if not in company view (LIKE CARTABLE) */}
              {!fromCompany && (
                <Col lg="3" md="6" className="mb-1">
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
              )}

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="sadirDate">
                  {t("Sadir Date")}:
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
                  {t("Source")}:
                </Label>
                <Input
                  id="source"
                  placeholder={t("Filter by source")}
                  value={searchSource}
                  onChange={(e) => setSearchSource(e.target.value)}
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
                  {t("Clear Filters")}
                </Button>
              </Col>
            </Row>
          </CardBody>
        </Collapse>

        {/* Data Table (LIKE CARTABLE behavior) */}
        <CardBody>
          {loading && !dataLoaded ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
              <p className="mt-2">{t("Loading maktoobs...")}</p>
            </div>
          ) : filteredData.length === 0 && maktoobs.length === 0 ? (
            <div className="text-center py-5">
              <h5>
                {fromCompany && company
                  ? t(`No maktoobs found for ${company.company_name}`)
                  : t("No maktoobs found")}
              </h5>
              <p className="text-muted">
                {fromCompany && company
                  ? t(`No maktoobs recorded for ${company.company_name} yet. Add the first maktoob!`)
                  : ""}
              </p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-5">
              <Database size={48} className="text-muted mb-3" />
              <h5>{t("No maktoobs match your filters")}</h5>
              <p className="text-muted">
                {t("Try clearing filters or adjust your search criteria.")}
              </p>
              <Button color="secondary" onClick={clearFilters}>
                {t("Clear Filters")}
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
                data={filteredData}
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add Maktoob Modal (LIKE CARTABLE) */}
      <Modal isOpen={addMaktoobModal} toggle={closeModals} size="lg">
        <ModalHeader toggle={closeModals}>
          {t("Add New Maktoob")}
          {fromCompany && company && ` - ${company.company_name}`}
        </ModalHeader>
        <ModalBody>
          {loading ? (
            <div className="text-center py-4">
              <Spinner color="primary" />
              <p className="mt-2">{t("Loading form data...")}</p>
            </div>
          ) : (
            <MaktoobInfo
              onSuccess={handleAddMaktoobSubmit}
              onCancel={closeModals}
              selectedCompany={fromCompany ? company : null}
              loading={isSubmitting}
              isEdit={false}
              users={users}
              companies={companies}
              existingMaktoobNumbers={existingMaktoobNumbers}
            />
          )}
        </ModalBody>
      </Modal>

      {/* Edit Maktoob Modal */}
      <Modal isOpen={editMaktoobModal} toggle={closeModals} size="lg">
        <ModalHeader toggle={closeModals}>
          {t("Edit Maktoob")} - {selectedMaktoob?.maktoob_number}
        </ModalHeader>
        <ModalBody>
          {loading ? (
            <div className="text-center py-4">
              <Spinner color="primary" />
              <p className="mt-2">{t("Loading form data...")}</p>
            </div>
          ) : (
            <MaktoobInfo
              onSuccess={handleEditMaktoobSubmit}
              onCancel={closeModals}
              initialData={selectedMaktoob}
              loading={isSubmitting}
              isEdit={true}
              users={users}
              companies={companies}
              existingMaktoobNumbers={existingMaktoobNumbers}
            />
          )}
        </ModalBody>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal} toggle={closeModals}>
        <ModalHeader toggle={closeModals}>{t("Delete Maktoob")}</ModalHeader>
        <ModalBody>
          <p>
            {t(
              "Are you sure you want to delete this maktoob? This action cannot be undone.",
            )}
          </p>
          {selectedMaktoob && (
            <div className="mt-2">
              <strong>
                {t("Maktoob")} #{selectedMaktoob.maktoob_number}
              </strong>
              <br />
              <small className="text-muted">
                {t("Type:")}{" "}
                {maktoobTypeMap[selectedMaktoob.maktoob_type] ||
                  selectedMaktoob.maktoob_type}{" "}
                |{t("Company:")} {selectedMaktoob.company_display || "N/A"}
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

export default MaktoobTable;