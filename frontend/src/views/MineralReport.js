// ** React Imports
import { useState, Fragment, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";

// ** Third Party Components
import Flatpickr from "react-flatpickr";
import ReactPaginate from "react-paginate";
import {
  ChevronDown,
  Filter,
  X,
  Download,
  RefreshCw,
  BarChart2,
  Eye,
  Package,
  DollarSign,
  ShoppingBag,
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
  Badge,
  Collapse,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Progress,
  UncontrolledTooltip,
} from "reactstrap";

// ** Styles
import "@styles/react/libs/flatpickr/flatpickr.scss";

// ** API Base URL
const API_URL = "http://127.0.0.1:8000/test1";

// ** Notification helper functions
const showSuccess = (message) =>
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });

const showError = (message) =>
  toast.error(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });

const showWarning = (message) =>
  toast.warning(message, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });

const showInfo = (message) =>
  toast.info(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });

// ** Mineral Report Component
const MineralReport = () => {
  const { t } = useTranslation();

  // ** States
  const [searchMineralName, setSearchMineralName] = useState("");
  const [searchNetWeight, setSearchNetWeight] = useState("");
  const [dateRange, setDateRange] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [filteredData, setFilteredData] = useState([]);
  const [mineralsData, setMineralsData] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedMineral, setSelectedMineral] = useState(null);
  const [purchaseStats, setPurchaseStats] = useState({
    totalMinerals: 0,
    totalPurchases: 0,
    totalAmount: 0,
    totalValue: 0,
    avgUnitPrice: 0,
  });
  const [weightStats, setWeightStats] = useState({
    totalWeights: 0,
    totalNetWeight: 0,
    totalSecondWeight: 0,
    avgNetWeight: 0,
  });
  const [balanceStats, setBalanceStats] = useState({
    totalBalances: 0,
    totalRemaining: 0,
    positiveBalances: 0,
    zeroBalances: 0,
    negativeBalances: 0,
  });

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

  // ** DEBUG FUNCTION - Test API filtering
  const testAPIFiltering = useCallback(async () => {
    console.log("========== TESTING API FILTERING ==========");

    try {
      const config = getAxiosConfig();

      // Test 1: Get all minerals
      const mineralsRes = await axios.get(`${API_URL}/minerals/`, config);
      const minerals = mineralsRes.data?.results || mineralsRes.data || [];
      console.log(
        "All minerals:",
        minerals.map((m) => ({ id: m.id, name: m.name })),
      );

      // Test 2: Test purchases filtering for each mineral
      for (const mineral of minerals) {
        console.log(
          `\n--- TESTING MINERAL ID: ${mineral.id} - ${mineral.name} ---`,
        );

        // Test purchases
        const purchasesRes = await axios.get(
          `${API_URL}/purchases/?mineral=${mineral.id}`,
          config,
        );
        const purchases = purchasesRes.data?.results || purchasesRes.data || [];
        console.log(
          `Purchases for mineral ${mineral.id}:`,
          purchases.length,
          purchases.map((p) => ({
            id: p.id,
            mineral: p.mineral,
            amount: p.mineral_amount,
          })),
        );

        // Test weights
        const weightsRes = await axios.get(
          `${API_URL}/weights/?mineral=${mineral.id}`,
          config,
        );
        const weights = weightsRes.data?.results || weightsRes.data || [];
        console.log(
          `Weights for mineral ${mineral.id}:`,
          weights.length,
          weights.map((w) => ({
            id: w.id,
            mineral: w.mineral,
            netWeight: w.mineral_net_weight,
          })),
        );

        
       
      }

      console.log("========== TEST COMPLETE ==========");
      showInfo("API test completed - Check console for results");
    } catch (error) {
      console.error("API test failed:", error);
      showError(`API test failed: ${error.message}`);
    }
  }, [getAxiosConfig]);

  // ** Function to calculate total net weight per mineral - FIXED with better filtering
  const calculateTotalNetWeightPerMineral = useCallback(
    async (mineralId, mineralName) => {
      try {
        const config = getAxiosConfig();
        let allWeights = [];
        let nextUrl = `${API_URL}/weights/?mineral=${mineralId}`;
        let totalNetWeight = 0;
        let totalSecondWeight = 0;
        let weightCount = 0;

        console.log(
          `🔍 FETCHING WEIGHTS for Mineral ID: ${mineralId} (${mineralName}) from: ${nextUrl}`,
        );

        // Handle pagination to get all weights
        while (nextUrl) {
          const response = await axios.get(nextUrl, config);

          if (response.status === 200) {
            const data = response.data;
            const weights = data.results || data;
            const validWeights = Array.isArray(weights) ? weights : [weights];

            // Filter to ensure we only get weights for this mineral ID
            const filteredWeights = validWeights.filter((w) => {
              const wMineralId = w.mineral ? parseInt(w.mineral) : null;
              return wMineralId === parseInt(mineralId);
            });

            console.log(
              `  Found ${filteredWeights.length} weights for mineral ${mineralId} (out of ${validWeights.length} total)`,
            );

            // Calculate net weight for this page
            filteredWeights.forEach((weight) => {
              const netWeight = parseFloat(weight.mineral_net_weight) || 0;
              const secondWeight = parseFloat(weight.second_weight) || 0;

              // Add to totals
              totalNetWeight += netWeight;
              totalSecondWeight += secondWeight;
              weightCount += 1;

              // Store weight data
              allWeights.push({
                id: weight.id,
                vehicle: weight.vehicle,
                vehicle_name: weight.vehicle_name,
                scale: weight.scale,
                scale_name: weight.scale_name,
                mineral_net_weight: netWeight,
                second_weight: secondWeight,
                create_at: weight.create_at,
                purchase: weight.purchase,
                total_weight: netWeight + secondWeight,
                mineral_id: weight.mineral,
              });
            });

            // Check for next page
            nextUrl = data.next || null;
          } else {
            break;
          }
        }

        // Calculate average net weight
        const avgNetWeight = weightCount > 0 ? totalNetWeight / weightCount : 0;

        // Get unique vehicles and scales
        const vehicles = [...new Set(allWeights.map((w) => w.vehicle))].filter(
          (id) => id,
        );
        const scales = [...new Set(allWeights.map((w) => w.scale))].filter(
          (id) => id,
        );

        // Get latest date
        const latestDate =
          allWeights.length > 0
            ? allWeights.reduce((latest, w) => {
                if (!latest || new Date(w.create_at) > new Date(latest)) {
                  return w.create_at;
                }
                return latest;
              }, null)
            : null;

        console.log(
          `✅ WEIGHTS for ${mineralName}: ${weightCount} records, total: ${totalNetWeight}`,
        );

        if (weightCount > 0) {
          showSuccess(
            `Loaded ${weightCount} weight records for ${
              mineralName || `Mineral ${mineralId}`
            }`,
          );
        }

        return {
          count: weightCount,
          totalNetWeight: totalNetWeight,
          totalSecondWeight: totalSecondWeight,
          totalCombinedWeight: totalNetWeight + totalSecondWeight,
          avgNetWeight: avgNetWeight,
          vehicles: vehicles,
          scales: scales,
          latestDate: latestDate,
          weights: allWeights,
        };
      } catch (error) {
        showError(
          `Failed to fetch weight data for ${
            mineralName || `Mineral ${mineralId}`
          }: ${error.message}`,
        );
        console.error(
          `Error calculating net weight for mineral ${mineralId}:`,
          error.message,
        );
        return {
          count: 0,
          totalNetWeight: 0,
          totalSecondWeight: 0,
          totalCombinedWeight: 0,
          avgNetWeight: 0,
          vehicles: [],
          scales: [],
          latestDate: null,
          weights: [],
        };
      }
    },
    [getAxiosConfig],
  );

  // ** Fetch Purchase Statistics for each mineral - FIXED with better filtering
  const fetchPurchaseStats = useCallback(
    async (mineralId, mineralName) => {
      try {
        const config = getAxiosConfig();
        let allPurchases = [];
        let nextUrl = `${API_URL}/purchases/?mineral=${mineralId}`;
        let totalAmount = 0;
        let totalValue = 0;
        let purchaseCount = 0;

        console.log(
          `🔍 FETCHING PURCHASES for Mineral ID: ${mineralId} (${mineralName}) from: ${nextUrl}`,
        );

        // Handle pagination
        while (nextUrl) {
          const response = await axios.get(nextUrl, config);

          if (response.status === 200) {
            const data = response.data;
            const purchases = data.results || data;
            const validPurchases = Array.isArray(purchases)
              ? purchases
              : [purchases];

            // Filter to ensure we only get purchases for this mineral ID
            const filteredPurchases = validPurchases.filter((p) => {
              const pMineralId = p.mineral ? parseInt(p.mineral) : null;
              return pMineralId === parseInt(mineralId);
            });

            console.log(
              `  Found ${filteredPurchases.length} purchases for mineral ${mineralId} (out of ${validPurchases.length} total)`,
            );

            // Calculate totals for this page
            filteredPurchases.forEach((purchase) => {
              const amount = parseFloat(purchase.mineral_amount) || 0;
              const unitPrice = parseFloat(purchase.unit_price) || 0;
              const totalPrice = parseFloat(purchase.mineral_total_price) || 0;

              totalAmount += amount;
              totalValue += totalPrice;
              purchaseCount += 1;

              allPurchases.push({
                id: purchase.id,
                company: purchase.company,
                company_name: purchase.company_name,
                mineral_amount: amount,
                unit_price: unitPrice,
                mineral_total_price: totalPrice,
                create_at: purchase.create_at,
                maktoob: purchase.maktoob,
                calculated_total: amount * unitPrice,
                mineral_id: purchase.mineral,
              });
            });

            // Check for next page
            nextUrl = data.next || null;
          } else {
            break;
          }
        }

        // Calculate average unit price
        const avgUnitPrice =
          purchaseCount > 0
            ? allPurchases.reduce((sum, p) => sum + p.unit_price, 0) /
              purchaseCount
            : 0;

        console.log(
          `✅ PURCHASES for ${mineralName}: ${purchaseCount} records, total amount: ${totalAmount}`,
        );

        if (purchaseCount > 0) {
          showSuccess(
            `Loaded ${purchaseCount} purchase records for ${
              mineralName || `Mineral ${mineralId}`
            }`,
          );
        }

        const stats = {
          count: purchaseCount,
          totalAmount: totalAmount,
          totalValue: totalValue,
          avgUnitPrice: avgUnitPrice,
          companies: [...new Set(allPurchases.map((p) => p.company))].filter(
            (id) => id,
          ),
          latestDate:
            purchaseCount > 0
              ? allPurchases.reduce((latest, p) => {
                  if (!latest || new Date(p.create_at) > new Date(latest)) {
                    return p.create_at;
                  }
                  return latest;
                }, null)
              : null,
          purchases: allPurchases,
        };

        return stats;
      } catch (error) {
        showError(
          `Failed to fetch purchase data for ${
            mineralName || `Mineral ${mineralId}`
          }: ${error.message}`,
        );
        console.error(
          `Error fetching purchase stats for mineral ${mineralId}:`,
          error.message,
        );
        return {
          count: 0,
          totalAmount: 0,
          totalValue: 0,
          avgUnitPrice: 0,
          companies: [],
          latestDate: null,
          purchases: [],
        };
      }
    },
    [getAxiosConfig],
  );

  // ** Main function to fetch mineral data with all related statistics
  const fetchMineralData = useCallback(async () => {
    setLoading(true);
    showInfo("Loading mineral data...");

    try {
      const config = getAxiosConfig();

      // Fetch minerals from your actual API endpoint
      const response = await axios.get(`${API_URL}/minerals/`, config);

      if (response.status === 200) {
        let minerals = response.data?.results || response.data || [];
        minerals = Array.isArray(minerals) ? minerals : [minerals];

        console.log("========== START PROCESSING MINERALS ==========");
        console.log(
          "Found minerals:",
          minerals.map((m) => ({ id: m.id, name: m.name })),
        );

        showSuccess(
          `Found ${minerals.length} minerals: ${minerals
            .map((m) => m.name)
            .join(", ")}`,
        );

        // Fetch additional statistics for EACH mineral separately
        const enrichedMinerals = await Promise.all(
          minerals.map(async (mineral) => {
            try {
              console.log(
                `\n--- PROCESSING MINERAL ${mineral.id} - ${mineral.name} ---`,
              );

              // Pass both mineral ID and name to each function
              const [purchaseStats, weightStats, balanceStats] =
                await Promise.all([
                  fetchPurchaseStats(mineral.id, mineral.name),
                  calculateTotalNetWeightPerMineral(mineral.id, mineral.name),
                ]);

              // Calculate overall status for this specific mineral only
              let status = "inactive";
              if (purchaseStats.count > 0 && weightStats.count > 0) {
                status = "active";
              } else if (purchaseStats.count > 0) {
                status = "pending";
              }

              // Log the mineral data with its ID to verify per-mineral calculation
              console.log(
                `\n📊 FINAL STATS FOR ${mineral.name.toUpperCase()} (ID: ${
                  mineral.id
                }):`,
              );
              console.log(
                `  - Purchase Amount: ${purchaseStats.totalAmount} (${purchaseStats.count} purchases)`,
              );
              console.log(
                `  - Net Weight: ${weightStats.totalNetWeight} (${weightStats.count} weights)`,
              );
              console.log(`  - Status: ${status}`);
              console.log(`  - Companies: ${purchaseStats.companies.length}`);
              console.log(`  - Vehicles: ${weightStats.vehicles.length}`);

              return {
                ...mineral,
                purchase_stats: purchaseStats,
                weight_stats: weightStats,
                balance_stats: balanceStats,
                overall_status: status,
                total_companies: purchaseStats.companies.length,
                total_vehicles: weightStats.vehicles.length,
                total_scales: weightStats.scales.length,
                total_net_weight: weightStats.totalNetWeight,
                total_mineral_amount: purchaseStats.totalAmount,
              };
            } catch (error) {
              showError(
                `Error processing mineral ${mineral.id} - ${mineral.name}: ${error.message}`,
              );
              console.error(
                `Error enriching mineral ${mineral.id} (${mineral.name}):`,
                error,
              );
              return {
                ...mineral,
                purchase_stats: {
                  count: 0,
                  totalAmount: 0,
                  totalValue: 0,
                  avgUnitPrice: 0,
                  companies: [],
                  latestDate: null,
                  purchases: [],
                },
                weight_stats: {
                  count: 0,
                  totalNetWeight: 0,
                  totalSecondWeight: 0,
                  totalCombinedWeight: 0,
                  avgNetWeight: 0,
                  vehicles: [],
                  scales: [],
                  latestDate: null,
                  weights: [],
                },
                balance_stats: {
                  count: 0,
                  totalRemaining: 0,
                  avgRemaining: 0,
                  companies: [],
                  positiveBalances: 0,
                  zeroBalances: 0,
                  negativeBalances: 0,
                  balances: [],
                },
                overall_status: "inactive",
                total_companies: 0,
                total_vehicles: 0,
                total_scales: 0,
                total_net_weight: 0,
                total_mineral_amount: 0,
              };
            }
          }),
        );

        console.log("\n========== FINAL MINERAL DATA ==========");
        enrichedMinerals.forEach((m) => {
          console.log(`${m.name} (ID: ${m.id}):`);
          console.log(
            `  Purchase: ${m.purchase_stats?.totalAmount} (${m.purchase_stats?.count} records)`,
          );
          console.log(
            `  Weight: ${m.weight_stats?.totalNetWeight} (${m.weight_stats?.count} records)`,
          );
          console.log(
            `  Balance: ${m.balance_stats?.totalRemaining} (${m.balance_stats?.count} records)`,
          );
        });

        setMineralsData(enrichedMinerals);
        setFilteredData(enrichedMinerals);

        // Update overall stats - this aggregates all minerals for summary cards only
        const overallStats = calculateOverallStats(enrichedMinerals);
        setPurchaseStats(overallStats.purchase);
        setWeightStats(overallStats.weight);
        setBalanceStats(overallStats.balance);

        // Show summary of per-mineral amounts
        const mineralAmounts = enrichedMinerals
          .map(
            (m) =>
              `${m.name}: ${formatNumber(m.purchase_stats?.totalAmount || 0)}`,
          )
          .join(", ");

        showSuccess(
          `Loaded ${enrichedMinerals.length} mineral records with individual statistics`,
        );
        showInfo(`Mineral amounts: ${mineralAmounts}`);

        // Cache data locally
        try {
          localStorage.setItem(
            "minerals_report_data",
            JSON.stringify(enrichedMinerals),
          );
          console.log("Mineral data cached successfully");
        } catch (e) {
          console.log("Could not save to localStorage:", e);
        }
      }
    } catch (error) {
      console.error("Error fetching mineral data:", error);
      showError(`Failed to fetch mineral data: ${error.message}`);

      // Try to load from localStorage
      try {
        const savedData = localStorage.getItem("minerals_report_data");
        if (savedData) {
          const minerals = JSON.parse(savedData);
          setMineralsData(minerals);
          setFilteredData(minerals);

          const overallStats = calculateOverallStats(minerals);
          setPurchaseStats(overallStats.purchase);
          setWeightStats(overallStats.weight);
          setBalanceStats(overallStats.balance);

          showInfo(
            `Loaded ${minerals.length} minerals from local storage (cached data)`,
          );
        } else {
          showWarning("No cached data available");
        }
      } catch (e) {
        console.error("Error loading from localStorage:", e);
        showError("Failed to load cached data");
      }
    } finally {
      setLoading(false);
    }
  }, [getAxiosConfig, fetchPurchaseStats, calculateTotalNetWeightPerMineral]);

  // ** Calculate overall statistics - aggregates all minerals for summary cards only
  const calculateOverallStats = (minerals) => {
    const purchase = {
      totalMinerals: minerals.length,
      totalPurchases: minerals.reduce(
        (sum, m) => sum + (m.purchase_stats?.count || 0),
        0,
      ),
      totalAmount: minerals.reduce(
        (sum, m) => sum + (m.purchase_stats?.totalAmount || 0),
        0,
      ),
      totalValue: minerals.reduce(
        (sum, m) => sum + (m.purchase_stats?.totalValue || 0),
        0,
      ),
      avgUnitPrice:
        minerals.length > 0
          ? minerals.reduce(
              (sum, m) => sum + (m.purchase_stats?.avgUnitPrice || 0),
              0,
            ) / minerals.length
          : 0,
    };

    const weight = {
      totalWeights: minerals.reduce(
        (sum, m) => sum + (m.weight_stats?.count || 0),
        0,
      ),
      totalNetWeight: minerals.reduce(
        (sum, m) => sum + (m.weight_stats?.totalNetWeight || 0),
        0,
      ),
      totalSecondWeight: minerals.reduce(
        (sum, m) => sum + (m.weight_stats?.totalSecondWeight || 0),
        0,
      ),
      totalCombinedWeight: minerals.reduce(
        (sum, m) => sum + (m.weight_stats?.totalCombinedWeight || 0),
        0,
      ),
      avgNetWeight:
        minerals.reduce((sum, m) => sum + (m.weight_stats?.count || 0), 0) > 0
          ? minerals.reduce(
              (sum, m) => sum + (m.weight_stats?.totalNetWeight || 0),
              0,
            ) /
            minerals.reduce((sum, m) => sum + (m.weight_stats?.count || 0), 0)
          : 0,
    };

    const balance = {
      totalBalances: minerals.reduce(
        (sum, m) => sum + (m.balance_stats?.count || 0),
        0,
      ),
      totalRemaining: minerals.reduce(
        (sum, m) => sum + (m.balance_stats?.totalRemaining || 0),
        0,
      ),
      positiveBalances: minerals.reduce(
        (sum, m) => sum + (m.balance_stats?.positiveBalances || 0),
        0,
      ),
      zeroBalances: minerals.reduce(
        (sum, m) => sum + (m.balance_stats?.zeroBalances || 0),
        0,
      ),
      negativeBalances: minerals.reduce(
        (sum, m) => sum + (m.balance_stats?.negativeBalances || 0),
        0,
      ),
    };

    return { purchase, weight, balance };
  };

  // ** Apply filters
  useEffect(() => {
    let data = mineralsData;

    if (searchMineralName) {
      data = data.filter((item) =>
        item.name?.toLowerCase().includes(searchMineralName.toLowerCase()),
      );
    }

    if (searchNetWeight) {
      const weight = parseFloat(searchNetWeight);
      if (!isNaN(weight)) {
        data = data.filter(
          (item) => (item.weight_stats?.totalNetWeight || 0) >= weight,
        );
      }
    }

    if (dateRange.length === 2) {
      const [start, end] = dateRange;
      data = data.filter((item) => {
        const createDate = new Date(item.create_at);
        return createDate >= start && createDate <= end;
      });
    }

    setFilteredData(data);

    if (data.length !== mineralsData.length) {
      showInfo(`Filtered to ${data.length} minerals`);
    }
  }, [searchMineralName, searchNetWeight, dateRange, mineralsData]);

  // ** Fetch data on component mount
  useEffect(() => {
    fetchMineralData();
  }, [fetchMineralData]);

  // ** Toggle Filter Section
  const toggleFilter = () => setFilterOpen(!filterOpen);

  // ** Clear All Filters
  const clearFilters = () => {
    setSearchMineralName("");
    setSearchNetWeight("");
    setDateRange([]);
    showSuccess("Filters cleared");
  };

  // ** Export to CSV
  const exportToCSV = () => {
    if (filteredData.length === 0) {
      showWarning("No data to export");
      return;
    }

    const headers = [
      "Mineral ID",
      "Mineral Name",
      "Description",
      "Total Purchases",
      "Total Mineral Amount",
      "Total Value",
      "Total Weights",
      "Total Net Weight",
      "Total Second Weight",
      "Total Combined Weight",
      "Average Net Weight",
      "Total Companies",
      "Total Vehicles",
      "Created At",
    ];

    const csvData = filteredData.map((item) => [
      item.id,
      `"${item.name}"`,
      `"${item.mineral_description || ""}"`,
      item.purchase_stats?.count || 0,
      item.purchase_stats?.totalAmount || 0,
      item.purchase_stats?.totalValue || 0,
      item.weight_stats?.count || 0,
      item.weight_stats?.totalNetWeight || 0,
      item.weight_stats?.totalSecondWeight || 0,
      item.weight_stats?.totalCombinedWeight || 0,
      item.weight_stats?.avgNetWeight || 0,
      item.balance_stats?.totalRemaining || 0,
      item.total_companies || 0,
      item.weight_stats?.vehicles?.length || 0,
      item.create_at || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `minerals_report_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showSuccess(
      `Report exported successfully with ${filteredData.length} minerals`,
    );
  };

  // ** Format currency
  const formatCurrency = (amount) => {
    if (isNaN(amount)) return " nan";
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // ** Format number with commas
  const formatNumber = (num) => {
    if (isNaN(num)) return "0";
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // ** Format integer without decimals
  const formatInteger = (num) => {
    if (isNaN(num)) return "0";
    return new Intl.NumberFormat("en-US").format(Math.round(num));
  };

  // ** Enhanced table columns - REMOVED Utilization
  const columns = useMemo(
    () => [
      {
        name: t("ID"),
        selector: (row) => row.id,
        sortable: true,
        width: "70px",
        cell: (row) => (
          <Badge color="secondary" pill>
            {row.id}
          </Badge>
        ),
      },
      {
        name: t("Mineral Name"),
        selector: (row) => row.name,
        sortable: true,
        minWidth: "150px",
        cell: (row) => (
          <div>
            <strong className="text-primary">{row.name}</strong>
          </div>
        ),
      },
      {
        name: t("Total Mineral Amount"),
        selector: (row) => row.purchase_stats?.totalAmount || 0,
        sortable: true,
        width: "180px",
        cell: (row) => {
          const amount = row.purchase_stats?.totalAmount || 0;
          return (
            <div className="fw-bold text-primary d-flex align-items-center">
              <ShoppingBag size={14} className="me-1" />
             AF{formatNumber(amount)}
              
            </div>
          );
        },
      },
      {
        name: t("Total Net Weight"),
        selector: (row) => row.weight_stats?.totalNetWeight || 0,
        sortable: true,
        width: "160px",
        cell: (row) => (
          <div className="fw-bold text-info d-flex align-items-center">
            <BarChart2 size={14} className="me-1" />
            {formatNumber(row.weight_stats?.totalNetWeight)}
           
          </div>
        ),
      },
      {
        name: t("Total Value"),
        selector: (row) => row.purchase_stats?.totalValue || 0,
        sortable: true,
        width: "140px",
        cell: (row) => (
          <div className="text-success fw-bold d-flex align-items-center">
            AF {formatCurrency(row.purchase_stats?.totalValue)}
          </div>
        ),
      },
      {
        name: t("Companies"),
        selector: (row) => row.total_companies || 0,
        sortable: true,
        width: "100px",
        cell: (row) => (
          <Badge color="primary" pill>
            {row.total_companies || 0}
          </Badge>
        ),
      },
    ],
    [t],
  );

  // ** Function to handle Pagination
  const handlePagination = (page) => setCurrentPage(page.selected);

  // ** Custom Pagination
  const CustomPagination = () => (
    <ReactPaginate
      previousLabel={""}
      nextLabel={""}
      forcePage={currentPage}
      onPageChange={handlePagination}
      pageCount={Math.ceil(filteredData.length / 10) || 1}
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
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <Card>
        <CardHeader className="border-bottom">
          <div className="d-flex justify-content-between align-items-center w-100">
            <div className="d-flex align-items-center">
              <CardTitle tag="h4" className="mb-0 m-1">
                {t("mineral_report")} - {t("Mineral Amount Analysis")}
              </CardTitle>
              {loading && (
                <Spinner size="sm" color="primary" className="ms-2" />
              )}
            </div>
            <div className="d-flex gap-1">
              <Button
                color="secondary"
                onClick={toggleFilter}
                className="d-flex align-items-center"
                disabled={loading}
              >
                <Filter size={14} className="me-50" />
                {t("filter")}
                {filterOpen && <X size={14} className="ms-50" />}
              </Button>
              <Button
                color="success"
                onClick={exportToCSV}
                className="d-flex align-items-center"
                disabled={loading || filteredData.length === 0}
              >
                <Download size={14} className="me-50" />
                {t("export_csv")}
              </Button>
              <Button
                color="primary"
                onClick={fetchMineralData}
                className="d-flex align-items-center"
                disabled={loading}
              >
                <RefreshCw size={14} className="me-50" />
                {t("refresh")}
              </Button>
              <Button
                color="warning"
                onClick={testAPIFiltering}
                className="d-flex align-items-center"
                disabled={loading}
              >
                <BarChart2 size={14} className="me-50" />
                Test API
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Summary Cards
        <CardBody className="pb-0">
          <Row className="mb-3">
            <Col xl="3" lg="3" sm="6">
              <Card className="bg-primary text-white shadow-sm">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h4 className="mb-0">
                        {formatInteger(purchaseStats.totalMinerals || 0)}
                      </h4>
                      <small>{t("Total Minerals")}</small>
                      <div className="small mt-1">
                        {mineralsData.map((m) => m.name).join(", ")}
                      </div>
                    </div>
                    <Package size={24} />
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xl="3" lg="3" sm="6">
              <Card className="bg-success text-white shadow-sm">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h4 className="mb-0">
                        {formatNumber(purchaseStats.totalAmount)}
                      </h4>
                      <small>{t("Total Mineral Amount")}</small>
                      <div className="small mt-1">
                        {t("From")} {purchaseStats.totalPurchases}{" "}
                        {t("purchases")}
                      </div>
                    </div>
                    <ShoppingBag size={24} />
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xl="3" lg="3" sm="6">
              <Card className="bg-info text-white shadow-sm">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h4 className="mb-0">
                        {formatNumber(weightStats.totalNetWeight)}
                      </h4>
                      <small>{t("Total Net Weight")}</small>
                      <div className="small mt-1">
                        {t("From")} {weightStats.totalWeights} {t("weights")}
                      </div>
                    </div>
                    <BarChart2 size={24} />
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xl="3" lg="3" sm="6">
              <Card className="bg-danger text-white shadow-sm">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h4 className="mb-0">
                        {formatNumber(balanceStats.totalRemaining)}
                      </h4>
                      <div className="mt-1 small">
                        <span className="me-2 bg-success px-2 py-1 rounded">
                          +{balanceStats.positiveBalances || 0}
                        </span>
                        <span className="me-2 bg-warning px-2 py-1 rounded">
                          0:{balanceStats.zeroBalances || 0}
                        </span>
                        <span className="bg-danger px-2 py-1 rounded">
                          -{balanceStats.negativeBalances || 0}
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <DollarSign size={24} />
                      <div className="small mt-1">
                        {formatInteger(balanceStats.totalBalances)}{" "}
                        {t("records")}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </CardBody> */}

        {/* Filter Section */}
        <Collapse isOpen={filterOpen}>
          <CardBody className="pt-0">
            <Row className="mt-1 mb-50">
              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="mineralName">
                  {t("mineral_name")}:
                </Label>
                <Input
                  id="mineralName"
                  placeholder={t("Search by mineral name")}
                  value={searchMineralName}
                  onChange={(e) => setSearchMineralName(e.target.value)}
                  disabled={loading}
                />
              </Col>

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="netWeight">
                  {t("min_net_weight")}:
                </Label>
                <Input
                  type="number"
                  id="netWeight"
                  placeholder={t("Minimum net weight")}
                  value={searchNetWeight}
                  onChange={(e) => setSearchNetWeight(e.target.value)}
                  disabled={loading}
                  min="0"
                  step="0.01"
                />
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
                lg="3"
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
              </Col>
            </Row>
          </CardBody>
        </Collapse>

        {/* Data Table */}
        <CardBody>
          {loading ? (
            <div className="text-center py-5">
              <Spinner
                color="primary"
                style={{ width: "3rem", height: "3rem" }}
              />
              <p className="mt-2">{t("Loading mineral data...")}</p>
              <p className="text-muted small">{t("This may take a moment")}</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">
                {searchMineralName || searchNetWeight || dateRange.length > 0
                  ? t("No minerals match your filters")
                  : t("No minerals found")}
              </p>
              <div className="mt-3">
                <Button color="primary" onClick={fetchMineralData}>
                  <RefreshCw size={14} className="me-50" />
                  {t("Refresh Data")}
                </Button>
              </div>
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
                data={filteredData.slice(
                  currentPage * 10,
                  (currentPage + 1) * 10,
                )}
                highlightOnHover
                responsive
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Mineral Detail Modal - Keep existing modal code from previous version */}
      <Modal
        isOpen={detailModal}
        toggle={() => setDetailModal(false)}
        size="xl"
        className="modal-dialog-centered"
      >
        <ModalHeader toggle={() => setDetailModal(false)}>
          <div className="d-flex align-items-center">
            {t("mineral_details")} -
            <span className="text-primary fw-bold ms-1">
              {selectedMineral?.name}
            </span>
            <Badge color="secondary" className="ms-2" pill>
              ID: {selectedMineral?.id}
            </Badge>
          </div>
          <div className="mt-2">
            <Badge color="success" className="me-2">
              {t("Total Amount")}:{" "}
              {formatNumber(selectedMineral?.purchase_stats?.totalAmount || 0)}
            </Badge>
            <Badge color="info" className="me-2">
              {t("Net Weight")}:{" "}
              {formatNumber(selectedMineral?.weight_stats?.totalNetWeight || 0)}
            </Badge>
            <Badge color="danger">
              {t("Remaining")}:{" "}
              {formatNumber(
                selectedMineral?.balance_stats?.totalRemaining || 0,
              )}
            </Badge>
          </div>
        </ModalHeader>
        <ModalBody>
          {selectedMineral ? (
            <div>
              {/* Basic Information - Show Mineral ID prominently */}
              <Row className="mb-4">
                <Col md="12">
                  <h5 className="mb-3">{t("basic_information")}</h5>
                  <Card className="border-primary">
                    <CardBody>
                      <Row>
                        <Col md="3">
                          <div className="mb-3">
                            <Label className="form-label text-muted">
                              {t("Mineral ID")}
                            </Label>
                            <h3 className="text-primary">
                              <Badge color="primary" size="lg" pill>
                                {selectedMineral.id}
                              </Badge>
                            </h3>
                          </div>
                        </Col>
                        <Col md="3">
                          <div className="mb-3">
                            <Label className="form-label text-muted">
                              {t("mineral_name")}
                            </Label>
                            <h3 className="fw-bold">{selectedMineral.name}</h3>
                          </div>
                        </Col>
                        <Col md="3">
                          <div className="mb-3">
                            <Label className="form-label text-muted">
                              {t("Total Mineral Amount")}
                            </Label>
                            <h3 className="text-success">
                              <ShoppingBag size={20} className="me-1" />
                              {formatNumber(
                                selectedMineral.purchase_stats?.totalAmount ||
                                  0,
                              )}
                            </h3>
                            <small className="text-muted">
                              {selectedMineral.purchase_stats?.count || 0}{" "}
                              purchases
                            </small>
                          </div>
                        </Col>
                        <Col md="3">
                          <div className="mb-3">
                            <Label className="form-label text-muted">
                              {t("Total Net Weight")}
                            </Label>
                            <h3 className="text-info">
                              <BarChart2 size={20} className="me-1" />
                              {formatNumber(
                                selectedMineral.weight_stats?.totalNetWeight ||
                                  0,
                              )}
                            </h3>
                            <small className="text-muted">
                              {selectedMineral.weight_stats?.count || 0} weights
                            </small>
                          </div>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
              </Row>

              {/* Purchase Statistics */}
              <Row className="mb-4">
                <Col md="12">
                  <h5 className="mb-3">
                    {t("Purchase Details")} - {selectedMineral.name} (ID:{" "}
                    {selectedMineral.id})
                  </h5>
                  <Card>
                    <CardBody>
                      {selectedMineral.purchase_stats?.purchases &&
                      selectedMineral.purchase_stats.purchases.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead className="table-light">
                              <tr>
                                <th>Purchase ID</th>
                                <th>Company</th>
                                <th>Mineral Amount</th>
                                <th>Unit Price</th>
                                <th>Total Price</th>
                                <th>Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedMineral.purchase_stats.purchases.map(
                                (p, i) => (
                                  <tr key={p.id}>
                                    <td>{i + 1}</td>
                                    <td>
                                      <Badge color="secondary">{p.id}</Badge>
                                    </td>
                                    <td>
                                      {p.company_name || `Company ${p.company}`}
                                    </td>
                                    <td className="text-primary fw-bold">
                                      {formatNumber(p.mineral_amount)}
                                    </td>
                                    <td>{formatCurrency(p.unit_price)}</td>
                                    <td className="text-success fw-bold">
                                      {formatCurrency(p.mineral_total_price)}
                                    </td>
                                    <td>{p.create_at?.split("T")[0]}</td>
                                  </tr>
                                ),
                              )}
                            </tbody>
                            <tfoot className="table-dark">
                              <tr>
                                <td colSpan="3" className="text-end">
                                  <strong>Total:</strong>
                                </td>
                                <td className="text-primary">
                                  <strong>
                                    {formatNumber(
                                      selectedMineral.purchase_stats
                                        .totalAmount,
                                    )}
                                  </strong>
                                </td>
                                <td></td>
                                <td className="text-success">
                                  <strong>
                                    {formatCurrency(
                                      selectedMineral.purchase_stats.totalValue,
                                    )}
                                  </strong>
                                </td>
                                <td></td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      ) : (
                        <p className="text-muted text-center py-3">
                          No purchase records for {selectedMineral.name}
                        </p>
                      )}
                    </CardBody>
                  </Card>
                </Col>
              </Row>

              {/* Weight Statistics */}
              <Row className="mb-4">
                <Col md="12">
                  <h5 className="mb-3">
                    {t("Weight Details")} - {selectedMineral.name} (ID:{" "}
                    {selectedMineral.id})
                  </h5>
                  <Card>
                    <CardBody>
                      <Row>
                        <Col md="4">
                          <div className="text-center p-3">
                            <h6 className="text-muted">Total Net Weight</h6>
                            <h2 className="text-info">
                              {formatNumber(
                                selectedMineral.weight_stats?.totalNetWeight ||
                                  0,
                              )}
                            </h2>
                            <small>
                              {selectedMineral.weight_stats?.count || 0} records
                            </small>
                          </div>
                        </Col>
                        <Col md="4">
                          <div className="text-center p-3">
                            <h6 className="text-muted">Total Second Weight</h6>
                            <h2 className="text-secondary">
                              {formatNumber(
                                selectedMineral.weight_stats
                                  ?.totalSecondWeight || 0,
                              )}
                            </h2>
                          </div>
                        </Col>
                        <Col md="4">
                          <div className="text-center p-3">
                            <h6 className="text-muted">Average Net Weight</h6>
                            <h2 className="text-primary">
                              {formatNumber(
                                selectedMineral.weight_stats?.avgNetWeight || 0,
                              )}
                            </h2>
                          </div>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
              </Row>

              {/* Balance Statistics */}
              <Row className="mb-4">
                <Col md="12">
                  <h5 className="mb-3">
                    {t("Balance Details")} - {selectedMineral.name} (ID:{" "}
                    {selectedMineral.id})
                  </h5>
                  <Card className="border-danger">
                    <CardBody>
                      {selectedMineral.balance_stats?.balances &&
                      selectedMineral.balance_stats.balances.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-bordered">
                            <thead className="table-dark">
                              <tr>
                                <th>Company</th>
                                <th>Company Type</th>
                                <th>Remaining Amount</th>
                                <th>Last Updated</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedMineral.balance_stats.balances.map(
                                (b, i) => {
                                  const statusColor =
                                    b.remaining_mineral_amount > 0
                                      ? "success"
                                      : b.remaining_mineral_amount === 0
                                      ? "warning"
                                      : "danger";
                                  const statusText =
                                    b.remaining_mineral_amount > 0
                                      ? "POSITIVE"
                                      : b.remaining_mineral_amount === 0
                                      ? "ZERO"
                                      : "NEGATIVE";
                                  return (
                                    <tr key={b.id || i}>
                                      <td>{i + 1}</td>
                                      <td>
                                        <strong>
                                          {b.company_name ||
                                            `Company ${b.company}`}
                                        </strong>
                                      </td>
                                      <td>
                                        <Badge
                                          color={
                                            b.company_type === "Supplier"
                                              ? "info"
                                              : "secondary"
                                          }
                                        >
                                          {b.company_type || "Unknown"}
                                        </Badge>
                                      </td>
                                      <td className="text-end fw-bold text-danger">
                                        {formatNumber(
                                          b.remaining_mineral_amount,
                                        )}
                                      </td>
                                      <td>
                                        <Badge color={statusColor}>
                                          {statusText}
                                        </Badge>
                                      </td>
                                      <td>
                                        {b.last_transaction_date?.split(
                                          "T",
                                        )[0] || "N/A"}
                                      </td>
                                    </tr>
                                  );
                                },
                              )}
                            </tbody>
                            <tfoot className="table-dark">
                              <tr>
                                <td colSpan="3" className="text-end">
                                  <strong>Total Remaining:</strong>
                                </td>
                                <td className="text-end">
                                  <strong className="text-warning">
                                    {formatNumber(
                                      selectedMineral.balance_stats
                                        .totalRemaining,
                                    )}
                                  </strong>
                                </td>
                                <td colSpan="2"></td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      ) : (
                        <p className="text-muted text-center py-3">
                          No balance records for {selectedMineral.name}
                        </p>
                      )}
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </div>
          ) : (
            <div className="text-center py-4">
              <Spinner />
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setDetailModal(false)}>
            {t("close")}
          </Button>
        </ModalFooter>
      </Modal>
    </Fragment>
  );
};

export default MineralReport;
