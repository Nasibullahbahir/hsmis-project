// ** React Imports
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

// ** Reactstrap Imports
import {
  Row,
  Col,
  Form,
  Label,
  Input,
  Button,
  FormFeedback,
  Spinner,
} from "reactstrap";

const AddCar = ({
  onSuccess,
  onCancel,
  selectedCompany = null,
  initialData = null,
  loading = false,
  isEdit = false,
  vehicleTypes = [],
  vehicleTypesMap = {},
  companies = []
}) => {
  const { t } = useTranslation();

  // ** Form State
  const [formData, setFormData] = useState({
    carName: "",
    plateNumber: "",
    driverName: "",
    emptyWeight: "",
    vehicleType: "",
    selectedCompany: "",
    status: "active"
  });

  const [errors, setErrors] = useState({});

  // ** Initialize form with initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        carName: initialData.car_name || "",
        plateNumber: initialData.plate_number || "",
        driverName: initialData.driver_name || "",
        emptyWeight: initialData.empty_weight || "",
        vehicleType: initialData.vehicle_type || initialData.vehicle_type_id || "",
        selectedCompany: initialData.company_id || "",
        status: initialData.status === 1 ? "active" : "inactive"
      });
    } else if (selectedCompany) {
      // If adding from company view, pre-select the company
      setFormData(prev => ({
        ...prev,
        selectedCompany: selectedCompany.id || ""
      }));
    }
  }, [initialData, selectedCompany]);

  // ** Handle Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  // ** Validate Form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.carName.trim()) {
      newErrors.carName = t("Car name is required");
    }
    
    if (!formData.plateNumber.trim()) {
      newErrors.plateNumber = t("Plate number is required");
    }
    
    if (!formData.driverName.trim()) {
      newErrors.driverName = t("Driver name is required");
    }
    
    if (!formData.emptyWeight) {
      newErrors.emptyWeight = t("Empty weight is required");
    } else if (isNaN(formData.emptyWeight) || Number(formData.emptyWeight) <= 0) {
      newErrors.emptyWeight = t("Empty weight must be a positive number");
    }
    
    if (!formData.vehicleType) {
      newErrors.vehicleType = t("Vehicle type is required");
    }
    
    // Only validate company if not in company view
    if (!selectedCompany && !formData.selectedCompany) {
      newErrors.selectedCompany = t("Company is required");
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ** Handle Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Prepare data for submission
      const submissionData = {
        carName: formData.carName,
        plateNumber: formData.plateNumber,
        driverName: formData.driverName,
        emptyWeight: formData.emptyWeight,
        vehicleType: formData.vehicleType,
        status: formData.status,
        // Pass company ID for backend to use in companies array
        selectedCompany: selectedCompany ? selectedCompany.id : formData.selectedCompany
      };
      
      console.log("Submitting vehicle data:", submissionData);
      onSuccess(submissionData);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col md="6">
          <Label for="carName">{t("Car Name")} *</Label>
          <Input
            type="text"
            id="carName"
            name="carName"
            value={formData.carName}
            onChange={handleInputChange}
            placeholder={t("Enter car name")}
            invalid={!!errors.carName}
          />
          <FormFeedback>{errors.carName}</FormFeedback>
        </Col>

        <Col md="6">
          <Label for="plateNumber">{t("Plate Number")} *</Label>
          <Input
            type="text"
            id="plateNumber"
            name="plateNumber"
            value={formData.plateNumber}
            onChange={handleInputChange}
            placeholder={t("Enter plate number")}
            invalid={!!errors.plateNumber}
          />
          <FormFeedback>{errors.plateNumber}</FormFeedback>
        </Col>

        <Col md="6">
          <Label for="driverName">{t("Driver Name")} *</Label>
          <Input
            type="text"
            id="driverName"
            name="driverName"
            value={formData.driverName}
            onChange={handleInputChange}
            placeholder={t("Enter driver name")}
            invalid={!!errors.driverName}
          />
          <FormFeedback>{errors.driverName}</FormFeedback>
        </Col>

        <Col md="6">
          <Label for="emptyWeight">{t("Empty Weight (kg)")} *</Label>
          <Input
            type="number"
            id="emptyWeight"
            name="emptyWeight"
            value={formData.emptyWeight}
            onChange={handleInputChange}
            placeholder={t("Enter empty weight")}
            min="0"
            step="1"
            invalid={!!errors.emptyWeight}
          />
          <FormFeedback>{errors.emptyWeight}</FormFeedback>
        </Col>

        <Col md="6">
          <Label for="vehicleType">{t("Vehicle Type")} *</Label>
          <Input
            type="select"
            id="vehicleType"
            name="vehicleType"
            value={formData.vehicleType}
            onChange={handleInputChange}
            invalid={!!errors.vehicleType}
          >
            <option value="">{t("Select Vehicle Type")}</option>
            {vehicleTypes.map(type => (
              <option key={type.id} value={type.id}>
                {vehicleTypesMap[type.id] || type.truck_name || type.name || `Type ${type.id}`}
              </option>
            ))}
          </Input>
          <FormFeedback>{errors.vehicleType}</FormFeedback>
        </Col>

        {/* Only show company selection if NOT in company view */}
        {!selectedCompany && (
          <Col md="6">
            <Label for="selectedCompany">{t("Company")} *</Label>
            <Input
              type="select"
              id="selectedCompany"
              name="selectedCompany"
              value={formData.selectedCompany}
              onChange={handleInputChange}
              invalid={!!errors.selectedCompany}
            >
              <option value="">{t("Select Company")}</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.company_name}
                </option>
              ))}
            </Input>
            <FormFeedback>{errors.selectedCompany}</FormFeedback>
          </Col>
        )}

        <Col md="6">
          <Label for="status">{t("Status")} *</Label>
          <Input
            type="select"
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
          >
            <option value="active">{t("Active")}</option>
            <option value="inactive">{t("Inactive")}</option>
          </Input>
        </Col>

        {/* Display company name if in company view (read-only) */}
        {selectedCompany && (
          <Col md="6">
            <Label>{t("Company")}</Label>
            <Input
              type="text"
              value={selectedCompany.company_name}
              readOnly
              disabled
              className="bg-light"
            />
            <small className="text-muted">
              {t("Vehicle will be added to this company")}
            </small>
          </Col>
        )}
      </Row>

      <div className="mt-3 d-flex justify-content-end">
        <Button
          type="button"
          color="secondary"
          onClick={onCancel}
          className="me-2"
          disabled={loading}
        >
          {t("Cancel")}
        </Button>
        <Button type="submit" color="primary" disabled={loading}>
          {loading ? (
            <>
              <Spinner size="sm" className="me-50" />
              {isEdit ? t("Updating...") : t("Adding...")}
            </>
          ) : (
            isEdit ? t("Update Vehicle") : t("Add Vehicle")
          )}
        </Button>
      </div>
    </Form>
  );
};

export default AddCar;