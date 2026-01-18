// AddNewCompany.js - Updated for Django backend
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

const AddNewCompany = ({ onSuccess, onCancel, initialData, loading, isEdit }) => {
  const { t } = useTranslation();
  
  // Form state
  const [formData, setFormData] = useState({
    companyName: "",
    leaderName: "",
    phone: "",
    companyType: "",
    TIN: "",
    status: "active",
    registrationDate: new Date().toISOString().split('T')[0],
  });

  // Set initial data if editing
  useEffect(() => {
    if (isEdit && initialData) {
      setFormData({
        companyName: initialData.company_name || "",
        leaderName: initialData.leader_name || "",
        phone: initialData.phone || "",
        companyType: initialData.company_type || "",
        TIN: initialData.TIN_number || "",
        status: initialData.status === 1 ? "active" : "inactive",
        registrationDate: initialData.create_at || new Date().toISOString().split('T')[0],
      });
    }
  }, [isEdit, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSuccess(formData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="companyName">
              {t("company_name") || "Company Name"} *
            </Label>
            <Input
              id="companyName"
              name="companyName"
              placeholder="Enter company name"
              value={formData.companyName}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </FormGroup>
        </Col>
        
        <Col md="6">
          <FormGroup>
            <Label for="leaderName">
              {t("leader_name") || "Leader Name"} *
            </Label>
            <Input
              id="leaderName"
              name="leaderName"
              placeholder="Enter leader name"
              value={formData.leaderName}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </FormGroup>
        </Col>
        
        <Col md="6">
          <FormGroup>
            <Label for="phone">
              {t("phone") || "Phone"} *
            </Label>
            <Input
              id="phone"
              name="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </FormGroup>
        </Col>
        
        <Col md="6">
          <FormGroup>
            <Label for="companyType">
              {t("company_type") || "Company Type"} *
            </Label>
            <Input
              id="companyType"
              name="companyType"
              placeholder="Enter company type"
              value={formData.companyType}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </FormGroup>
        </Col>
        
        <Col md="6">
          <FormGroup>
            <Label for="TIN">
              {t("TIN_number") || "TIN Number"} *
            </Label>
            <Input
              id="TIN"
              name="TIN"
              placeholder="Enter TIN number"
              value={formData.TIN}
              onChange={handleChange}
              required
              disabled={loading}
            />
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

        <Col md="6">
          <FormGroup>
            <Label for="registrationDate">
              {t("registration_date") || "Registration Date"}
            </Label>
            <Input
              id="registrationDate"
              name="registrationDate"
              type="date"
              value={formData.registrationDate}
              onChange={handleChange}
              disabled={loading || isEdit}
            />
          </FormGroup>
        </Col>
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
            isEdit ? t("update_company") || "Update Company" : t("add_company") || "Add Company"
          )}
        </Button>
      </div>
    </Form>
  );
};

export default AddNewCompany;