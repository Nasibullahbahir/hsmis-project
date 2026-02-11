// ** React Imports
import { useState, Fragment, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ** Third Party Components
import ReactPaginate from "react-paginate";
import { ChevronDown, Plus, Trash2, Filter, X, Edit } from "react-feather";
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

// ** Import AddUser Component
import AddUser from "./addUser/AddUser.js";

// ** Styles
import "@styles/react/libs/flatpickr/flatpickr.scss";

// ** API Base URL
const API_URL = "http://127.0.0.1:8000/test1";

const UserTable = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // ** States
  const [searchFirstName, setSearchFirstName] = useState("");
  const [searchUsername, setSearchUsername] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchIsActive, setSearchIsActive] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [dateRange, setDateRange] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [users, setUsers] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  // ** Modal States
  const [addUserModal, setAddUserModal] = useState(false);
  const [editUserModal, setEditUserModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
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

  // ** Fetch users from API with page_size parameter
  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      console.log("Fetching users...");

      const config = getAxiosConfig();
      // Add page_size=7 to request 7 users per page
      const response = await axios.get(
        `${API_URL}/users/?page=${page}&page_size=7`,
        config,
      );

      console.log("Full API response:", response);
      console.log("Response data:", response.data);

      let usersData = [];
      let total = 0;
      let pages = 0;

      if (response.data && response.data.results) {
        // Paginated response
        usersData = response.data.results;
        total = response.data.count || usersData.length;
        pages = Math.ceil(total / 7); // Calculate based on 7 per page

        console.log("Paginated data found, total users:", total);
        console.log("Users per page:", usersData.length);
      } else if (Array.isArray(response.data)) {
        // Non-paginated response
        usersData = response.data;
        total = usersData.length;
        pages = Math.ceil(total / 7);
      } else if (response.data) {
        // Single object or other structure
        usersData = [response.data];
        total = 1;
        pages = 1;
      }

      console.log("Processed users data:", usersData);
      console.log("Total users:", total);
      console.log("Total pages:", pages);

      setUsers(usersData);
      setFilteredData(usersData);
      setTotalUsers(total);
      setTotalPages(pages);
    } catch (error) {
      console.error("Error fetching users:", error);
      console.error("Error response:", error.response);

      // If page_size parameter fails, try without it
      if (error.response?.status === 400) {
        console.log("page_size parameter not supported, trying without it...");
        try {
          const config = getAxiosConfig();
          const response = await axios.get(
            `${API_URL}/users/?page=${page}`,
            config,
          );

          if (response.data && response.data.results) {
            const usersData = response.data.results;
            const total = response.data.count || usersData.length;
            // Assuming default is 10 per page from backend
            const pages = Math.ceil(total / 10);

            setUsers(usersData);
            setFilteredData(usersData);
            setTotalUsers(total);
            setTotalPages(pages);

            toast.warning(t("Showing 10 users per page (backend default)"));
          }
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
          toast.error(t("Failed to load users"));
          setUsers([]);
          setFilteredData([]);
        }
      } else if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        console.log("Trying test endpoint...");
        try {
          const testResponse = await axios.get(`${API_URL}/test-users/`);
          if (testResponse.data && testResponse.data.users) {
            const users = testResponse.data.users;
            setUsers(users);
            setFilteredData(users);
            setTotalUsers(users.length);
            setTotalPages(Math.ceil(users.length / 7));
          }
          toast.warning(
            t("Using test endpoint - some features may be limited"),
          );
        } catch (testError) {
          console.error("Test endpoint also failed:", testError);
          toast.error(t("Authentication required. Please login first."));
        }
      } else {
        toast.error(t("Failed to load users"));
        setUsers([]);
        setFilteredData([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ** Initialize data
  useEffect(() => {
    console.log("Component mounted, fetching users...");
    console.log("API_URL:", API_URL);
    fetchUsers(currentPage + 1);
  }, [fetchUsers]);

  // ** Apply filters when search criteria change - CLIENT SIDE FILTERING
  useEffect(() => {
    let data = users;

    if (searchFirstName) {
      data = data.filter((u) =>
        (u.first_name || u.name || "")
          .toLowerCase()
          .includes(searchFirstName.toLowerCase()),
      );
    }

    if (searchUsername) {
      data = data.filter((u) =>
        u.username.toLowerCase().includes(searchUsername.toLowerCase()),
      );
    }

    if (searchEmail) {
      data = data.filter((u) =>
        u.email.toLowerCase().includes(searchEmail.toLowerCase()),
      );
    }

    if (searchIsActive !== "") {
      data = data.filter((u) => {
        const isActiveBool = searchIsActive === "true";
        return u.is_active === isActiveBool;
      });
    }

    setFilteredData(data);
  }, [
    searchFirstName,
    searchUsername,
    searchEmail,
    searchIsActive,
    dateRange,
    users,
  ]);

  // ** Toggle Filter Section
  const toggleFilter = () => setFilterOpen(!filterOpen);

  // ** Clear All Filters
  const clearFilters = () => {
    setSearchFirstName("");
    setSearchUsername("");
    setSearchEmail("");
    setSearchIsActive("");
    setDateRange([]);
  };

  // ** Handle Edit Click
  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditUserModal(true);
  };

  // ** Handle Delete Click
  const handleDeleteClick = (userId) => {
    const user = users.find((u) => u.id === userId);
    setSelectedUser(user);
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
      name: t("first_name"),
      selector: (row) => row.first_name || row.name || "N/A",
      sortable: true,
      minWidth: "150px",
    },
    {
      name: t("username"),
      selector: (row) => row.username,
      sortable: true,
      minWidth: "120px",
    },
    {
      name: t("email"),
      selector: (row) => row.email || "N/A",
      sortable: true,
      minWidth: "180px",
    },
    {
      name: t("is_active"),
      selector: (row) => (row.is_active ? t("Active") : t("Inactive")),
      sortable: true,
      width: "100px",
      cell: (row) => {
        const statusText = row.is_active ? t("Active") : t("Inactive");
        const badgeColor = row.is_active ? "success" : "secondary";
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
  const handlePagination = (page) => {
    const newPage = page.selected;
    setCurrentPage(newPage);
    fetchUsers(newPage + 1);
  };

  // ** Custom Pagination - LIKE COMPANYTABLE
  const CustomPagination = () => {
    // Calculate pages based on totalUsers (not filteredData)
    const pageCount = totalPages || Math.ceil(totalUsers / 7);

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
    if (selectedUser) {
      try {
        const config = getAxiosConfig();
        await axios.delete(`${API_URL}/users/${selectedUser.id}/`, config);
        toast.success(t("User deleted successfully!"));
        fetchUsers(currentPage + 1);
        setDeleteModal(false);
        setSelectedUser(null);
      } catch (error) {
        console.error("Error deleting user:", error);
        if (error.response?.status === 401) {
          toast.error(t("Authentication required. Please login."));
        } else {
          toast.error(t("Failed to delete user"));
        }
      }
    }
  };

  // ** Handle Add User Submission
  const handleAddUserSubmit = async (userData) => {
    setIsSubmitting(true);

    try {
      console.log("Creating user with data:", userData);

      const config = getAxiosConfig();
      const response = await axios.post(`${API_URL}/users/`, userData, config);

      if (response.status === 201) {
        toast.success(t("User added successfully!"));
        setAddUserModal(false);
        // Reset to first page when adding new user
        setCurrentPage(0);
        fetchUsers(1);
      }
    } catch (error) {
      console.error("Error adding user:", error);
      const errorMsg = error.response?.data;
      if (typeof errorMsg === "object") {
        Object.keys(errorMsg).forEach((key) => {
          toast.error(`${key}: ${errorMsg[key]}`);
        });
      } else if (error.response?.status === 401) {
        toast.error(t("Authentication required. Please login."));
      } else {
        toast.error(errorMsg || t("Failed to add user"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ** Handle Edit User Submission
  const handleEditUserSubmit = async (userData) => {
    setIsSubmitting(true);

    try {
      console.log("Updating user data:", userData);

      const config = getAxiosConfig();
      const response = await axios.put(
        `${API_URL}/users/${selectedUser.id}/`,
        userData,
        config,
      );

      if (response.status === 200) {
        toast.success(t("User updated successfully!"));
        setEditUserModal(false);
        setSelectedUser(null);
        fetchUsers(currentPage + 1);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      if (error.response?.status === 401) {
        toast.error(t("Authentication required. Please login."));
      } else {
        toast.error(
          error.response?.data?.message || t("Failed to update user"),
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ** Handle Add User Button Click
  const handleAddUserClick = () => {
    setAddUserModal(true);
  };

  // ** Close Modals
  const closeModals = () => {
    setAddUserModal(false);
    setEditUserModal(false);
    setDeleteModal(false);
    setSelectedUser(null);
    setIsSubmitting(false);
  };

  return (
    <Fragment>
      <ToastContainer position="top-left" autoClose={3000} />

      <Card>
        <CardHeader className="border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <CardTitle tag="h4" className="mb-0">
                {t("user_management")}
              </CardTitle>
              <Badge color="dark" className="ms-2 m-1 p-1">
                {totalUsers} {t("users")}
              </Badge>
            </div>
            <div className="d-flex gap-1">
              <Button
                color="secondary"
                onClick={toggleFilter}
                className="d-flex align-items-center"
              >
                <Filter size={14} className="me-50" />
                {t("filter")}
                {filterOpen && <X size={14} className="ms-50" />}
              </Button>
              <Button
                color="primary"
                onClick={handleAddUserClick}
                className="d-flex align-items-center"
              >
                <Plus size={14} className="me-50" />
                {t("add_user")}
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Filter Section */}
        <Collapse isOpen={filterOpen}>
          <CardBody className="pt-0">
            <Row className="mt-1 mb-50">
              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="firstName">
                  {t("first_name")}:
                </Label>
                <Input
                  id="firstName"
                  placeholder={t("filter_by_first_name")}
                  value={searchFirstName}
                  onChange={(e) => setSearchFirstName(e.target.value)}
                />
              </Col>

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="username">
                  {t("username")}:
                </Label>
                <Input
                  id="username"
                  placeholder={t("filter_by_username")}
                  value={searchUsername}
                  onChange={(e) => setSearchUsername(e.target.value)}
                />
              </Col>

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="email">
                  {t("email")}:
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("filter_by_email")}
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                />
              </Col>

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="isActive">
                  {t("is_active")}:
                </Label>
                <Input
                  type="select"
                  id="isActive"
                  value={searchIsActive}
                  onChange={(e) => setSearchIsActive(e.target.value)}
                >
                  <option value="">{t("all_status")}</option>
                  <option value="true">{t("active")}</option>
                  <option value="false">{t("inactive")}</option>
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
              <Spinner color="primary" />
              <p className="mt-2">{t("Loading users...")}</p>
            </div>
          ) : filteredData.length === 0 && users.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">{t("No users found")}</p>
              <Button color="primary" onClick={handleAddUserClick}>
                <Plus size={14} className="me-50" />
                {t("Add Your First User")}
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

      {/* Add User Modal */}
      <Modal isOpen={addUserModal} toggle={closeModals} size="lg">
        <ModalHeader toggle={closeModals}>{t("add_new_user")}</ModalHeader>
        <ModalBody>
          <AddUser
            onSuccess={handleAddUserSubmit}
            onCancel={closeModals}
            loading={isSubmitting}
            isEdit={false}
          />
        </ModalBody>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={editUserModal} toggle={closeModals} size="lg">
        <ModalHeader toggle={closeModals}>
          {t("edit_user")} - {selectedUser?.first_name || selectedUser?.name}
        </ModalHeader>
        <ModalBody>
          <AddUser
            onSuccess={handleEditUserSubmit}
            onCancel={closeModals}
            initialData={selectedUser}
            loading={isSubmitting}
            isEdit={true}
          />
        </ModalBody>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal} toggle={closeModals}>
        <ModalHeader toggle={closeModals}>{t("delete_user")}</ModalHeader>
        <ModalBody>
          <p>
            {t(
              "Are you sure you want to delete this user? This action cannot be undone.",
            )}
          </p>
          {selectedUser && (
            <div className="mt-2">
              <strong>{selectedUser.first_name || selectedUser.name}</strong>
              <br />
              <small className="text-muted">
                {t("Username:")} {selectedUser.username} | {t("Email:")}{" "}
                {selectedUser.email}
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

export default UserTable;
