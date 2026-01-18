import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Row,
  Col,
  Spinner,
} from "reactstrap";

const AddCar = ({ 
  onSuccess, 
  onCancel, 
  initialData, 
  loading, 
  isEdit, 
  selectedCompany,
  vehicleTypes = [],
  fromCompany = false  // Add this prop
}) => {
  const { t } = useTranslation();
  
  // Form state - ADD companies field
  const [formData, setFormData] = useState({
    carName: "",
    plateNumber: "",
    driverName: "",
    emptyWeight: "",
    vehicleType: "",
    status: "active",
    registrationDate: new Date().toISOString().split('T')[0],
    companies: []  // Add companies array
  });

  // Set initial data if editing
  useEffect(() => {
    if (isEdit && initialData) {
      // Extract company IDs from the companies array
      const companyIds = initialData.companies && Array.isArray(initialData.companies) 
        ? initialData.companies.map(comp => 
            typeof comp === 'object' ? comp.id : comp
          )
        : [];
      
      setFormData({
        carName: initialData.car_name || "",
        plateNumber: initialData.plate_number || "",
        driverName: initialData.driver_name || "",
        emptyWeight: initialData.empty_weight || "",
        vehicleType: initialData.vehicle_type?.id || "",
        status: initialData.status === 1 ? "active" : "inactive",
        registrationDate: initialData.create_at || new Date().toISOString().split('T')[0],
        companies: companyIds
      });
    } else if (!isEdit && selectedCompany && fromCompany) {
      // When adding from company view, pre-populate with the selected company
      setFormData(prev => ({
        ...prev,
        companies: [selectedCompany.id]
      }));
    }
  }, [isEdit, initialData, selectedCompany, fromCompany]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare the data to send
    const submissionData = {
      ...formData,
      // Ensure companies is always an array
      companies: formData.companies && formData.companies.length > 0 
        ? formData.companies 
        : (selectedCompany && fromCompany ? [selectedCompany.id] : [])
    };
    
    console.log("Submitting vehicle data:", submissionData);
    onSuccess(submissionData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="carName">
              {t("car_name") || "Car Name"} *
            </Label>
            <Input
              id="carName"
              name="carName"
              placeholder="Enter car name"
              value={formData.carName}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </FormGroup>
        </Col>
        
        <Col md="6">
          <FormGroup>
            <Label for="plateNumber">
              {t("plate_number") || "Plate Number"} *
            </Label>
            <Input
              id="plateNumber"
              name="plateNumber"
              placeholder="Enter plate number"
              value={formData.plateNumber}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </FormGroup>
        </Col>
        
        <Col md="6">
          <FormGroup>
            <Label for="driverName">
              {t("driver_name") || "Driver Name"} *
            </Label>
            <Input
              id="driverName"
              name="driverName"
              placeholder="Enter driver name"
              value={formData.driverName}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </FormGroup>
        </Col>
        
        <Col md="6">
          <FormGroup>
            <Label for="emptyWeight">
              {t("empty_weight") || "Empty Weight (kg)"} *
            </Label>
            <Input
              id="emptyWeight"
              name="emptyWeight"
              type="number"
              min="0"
              placeholder="Enter empty weight"
              value={formData.emptyWeight}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </FormGroup>
        </Col>
        
        <Col md="6">
          <FormGroup>
            <Label for="vehicleType">
              {t("vehicle_type") || "Vehicle Type"}
            </Label>
            <Input
              id="vehicleType"
              name="vehicleType"
              type="select"
              value={formData.vehicleType}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">Select Vehicle Type</option>
              {vehicleTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.truck_name}
                </option>
              ))}
            </Input>
          </FormGroup>
        </Col>
        
        <Col md="6">
          <FormGroup>
            <Label for="status">
              {t("status") || "Status"}
            </Label>
            <Input
              id="status"
              name="status"
              type="select"
              value={formData.status}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Input>
          </FormGroup>
        </Col>

        {/* Display selected company information */}
        {selectedCompany && fromCompany && (
          <Col md="12">
            <FormGroup>
              <Label>Company</Label>
              <Input
                type="text"
                value={selectedCompany.company_name}
                disabled
                readOnly
              />
              <small className="text-muted">
                This vehicle will be associated with {selectedCompany.company_name}
              </small>
            </FormGroup>
          </Col>
        )}

        {/* Optional: Add a companies multi-select for when NOT in company view */}
        {!fromCompany && (
          <Col md="12">
            <FormGroup>
              <Label for="companies">
                {t("associate_companies") || "Associate with Companies"} (Optional)
              </Label>
              <Input
                id="companies"
                name="companies"
                type="select"
                multiple
                value={formData.companies}
                onChange={(e) => {
                  const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                  setFormData(prev => ({
                    ...prev,
                    companies: selectedOptions
                  }));
                }}
                disabled={loading}
              >
                <option value="">Select Companies (Hold Ctrl to select multiple)</option>
                {/* You would need to pass companies list as prop or fetch it here */}
                <option value="" disabled>Companies list not available</option>
              </Input>
              <small className="text-muted">
                Select companies this vehicle belongs to. Leave empty if not associated with any company.
              </small>
            </FormGroup>
          </Col>
        )}
      </Row>
      
      <div className="d-flex justify-content-end mt-3">
        <Button
          color="secondary"
          onClick={onCancel}
          className="me-2"
          disabled={loading}
        >
          {t("cancel") || "Cancel"}
        </Button>
        <Button
          color="primary"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" />
              {isEdit ? "Updating..." : "Adding..."}
            </>
          ) : (
            isEdit ? t("update_vehicle") || "Update Vehicle" : t("add_vehicle") || "Add Vehicle"
          )}
        </Button>
      </div>
    </Form>
  );
};

export default AddCar;