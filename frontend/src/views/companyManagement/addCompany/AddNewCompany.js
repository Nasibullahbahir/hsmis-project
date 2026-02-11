import React, { useState, useEffect, useCallback } from "react";
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
  
  const [formData, setFormData] = useState({
    companyName: "",
    leaderName: "",
    phone: "",
    companyType: "",
    TIN: "",
    licenceNumber: "", // NEW: Added licence number field
    status: "active",
    registrationDate: "",
  });

  // Validation state
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && initialData) {
      const formatDateForDisplay = (dateString) => {
        if (!dateString) return "";
        
        try {
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return dateString;
          }
          
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return "";
          
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          
          return `${year}-${month}-${day}`;
        } catch (error) {
          console.error("Error formatting date:", error);
          return "";
        }
      };

      setFormData({
        companyName: initialData.company_name || "",
        leaderName: initialData.leader_name || "",
        phone: initialData.phone || "",
        companyType: initialData.company_type || "",
        TIN: initialData.TIN_number || "",
        licenceNumber: initialData.licence_number || "", // NEW: Added licence number
        status: initialData.status === 1 ? "active" : "inactive",
        registrationDate: formatDateForDisplay(initialData.create_at),
      });
    } else {
      const today = new Date();
      const formattedToday = today.toISOString().split('T')[0];
      
      setFormData({
        companyName: "",
        leaderName: "",
        phone: "",
        companyType: "",
        TIN: "",
        licenceNumber: "", // NEW: Added licence number
        status: "active",
        registrationDate: formattedToday,
      });
    }
    setErrors({});
  }, [isEdit, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }
    
    if (!formData.leaderName.trim()) {
      newErrors.leaderName = "Leader name is required";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }
    
    if (!formData.companyType.trim()) {
      newErrors.companyType = "Company type is required";
    }
    
    if (!formData.TIN.trim()) {
      newErrors.TIN = "TIN number is required";
    }
    
    // Licence number can be optional - no validation required
    // If your API requires it, add validation here
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log("Submitting form data:", formData);
      
      const dataToSend = {
        companyName: formData.companyName,
        leaderName: formData.leaderName,
        phone: formData.phone,
        companyType: formData.companyType,
        TIN: formData.TIN,
        licenceNumber: formData.licenceNumber, // NEW: Added licence number
        status: formData.status,
      };
      
      // Only include registrationDate for new companies
      if (!isEdit) {
        dataToSend.registrationDate = formData.registrationDate;
      }
      
      onSuccess(dataToSend);
    } else {
      console.log("Form validation failed:", errors);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        {/* Company Name */}
        <Col md="3">
          <FormGroup>
            <Label for="companyName">{t("company_name")} <span className="text-danger">*</span></Label>
            <Input
              id="companyName"
              name="companyName"
              placeholder={t("enter_company_name")}
              value={formData.companyName}
              onChange={handleChange}
              required
              disabled={loading}
              invalid={!!errors.companyName}
            />
            {errors.companyName && (
              <div className="text-danger small mt-1">{errors.companyName}</div>
            )}
          </FormGroup>
        </Col>
        
        {/* Leader Name */}
        <Col md="3">
          <FormGroup>
            <Label for="leaderName">{t("leader_name")} <span className="text-danger">*</span></Label>
            <Input
              id="leaderName"
              name="leaderName"
              placeholder={t("Enter_leader_name")}
              value={formData.leaderName}
              onChange={handleChange}
              required
              disabled={loading}
              invalid={!!errors.leaderName}
            />
            {errors.leaderName && (
              <div className="text-danger small mt-1">{errors.leaderName}</div>
            )}
          </FormGroup>
        </Col>
        
        {/* Phone */}
        <Col md="3">
          <FormGroup>
            <Label for="phone">{t("phone")} <span className="text-danger">*</span></Label>
            <Input
              id="phone"
              name="phone"
              placeholder={t("Enter_phone_number")}
              value={formData.phone}
              onChange={handleChange}
              required
              disabled={loading}
              invalid={!!errors.phone}
            />
            {errors.phone && (
              <div className="text-danger small mt-1">{errors.phone}</div>
            )}
          </FormGroup>
        </Col>
        
        {/* Company Type */}
        <Col md="3">
          <FormGroup>
            <Label for="companyType">{t("company_type")} <span className="text-danger">*</span></Label>
            <Input
              id="companyType"
              name="companyType"
              placeholder={t("Enter company type")}
              value={formData.companyType}
              onChange={handleChange}
              required
              disabled={loading}
              invalid={!!errors.companyType}
            />
            {errors.companyType && (
              <div className="text-danger small mt-1">{errors.companyType}</div>
            )}
          </FormGroup>
        </Col>
        
        {/* TIN Number */}
        <Col md="3">
          <FormGroup>
            <Label for="TIN">{t("TIN_number")} <span className="text-danger">*</span></Label>
            <Input
              id="TIN"
              name="TIN"
              placeholder={t("Enter TIN number")}
              value={formData.TIN}
              onChange={handleChange}
              required
              disabled={loading}
              invalid={!!errors.TIN}
            />
            {errors.TIN && (
              <div className="text-danger small mt-1">{errors.TIN}</div>
            )}
          </FormGroup>
        </Col>
        
        {/* NEW: Licence Number */}
        <Col md="3">
          <FormGroup>
            <Label for="licenceNumber">{t("licence_number")}</Label>
            <Input
              id="licenceNumber"
              name="licenceNumber"
              placeholder={t("Enter licence number")}
              value={formData.licenceNumber}
              onChange={handleChange}
              disabled={loading}
            />
          </FormGroup>
        </Col>
        
        {/* Status */}
        <Col md="3">
          <FormGroup>
            <Label for="status">{t("status")}</Label>
            <Input
              id="status"
              name="status"
              type="select"
              value={formData.status}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="active">{t("active")}</option>
              <option value="inactive">{t("Inactive")}</option>
            </Input>
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
          {t("cancel")}
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
            isEdit ? t("update_company") : t("add_company")
          )}
        </Button>
      </div>
    </Form>
  );
};

export default AddNewCompany;