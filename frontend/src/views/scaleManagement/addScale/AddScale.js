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

const AddScale = ({ 
  onSuccess, 
  onCancel, 
  initialData, 
  loading, 
  isEdit,
  provinces = [],
  systemTypes = []
}) => {
  const { t } = useTranslation();
  
  // Form state with five requested fields
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    province_id: "",
    system_type: "",
    status: "active"
  });

  // Set initial data if editing
  useEffect(() => {
    if (isEdit && initialData) {
      setFormData({
        name: initialData.name || "",
        location: initialData.location || "",
        province_id: initialData.province_id || "",
        system_type: initialData.system_type || "",
        status: initialData.status === 1 ? "active" : "inactive"
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
        {/* Name Field */}
        <Col md="6">
          <FormGroup>
            <Label for="name">
              {t("scale_name")} *
            </Label>
            <Input
              id="name"
              name="name"
              placeholder={t("Enter scale name")}
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </FormGroup>
        </Col>
        
        {/* Location Field */}
        <Col md="6">
          <FormGroup>
            <Label for="location">
              {t("location")} *
            </Label>
            <Input
              id="location"
              name="location"
              placeholder={t("Enter exact location")}
              value={formData.location}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </FormGroup>
        </Col>
        
        {/* Province Field - Number input */}
        <Col md="6">
          <FormGroup>
            <Label for="province_id">
              {t("province_id")} *
            </Label>
            <Input
              id="province_id"
              name="province_id"
              type="number"
              min="0"
              placeholder={t("Enter province ID (number)")}
              value={formData.province_id}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <small className="text-muted">
              {t("Enter a number (e.g., 1, 2, 3, etc.)")}
            </small>
          </FormGroup>
        </Col>
        
        {/* System Type Field */}
        <Col md="6">
          <FormGroup>
            <Label for="system_type">
              {t("system_type")} *
            </Label>
            <Input
              id="system_type"
              name="system_type"
              type="select"
              value={formData.system_type}
              onChange={handleChange}
              required
              disabled={loading || systemTypes.length === 0}
            >
              <option value="">{t("Select System Type")}</option>
              {systemTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Input>
            {systemTypes.length === 0 && !loading && (
              <small className="text-danger">
                {t("No system types available")}
              </small>
            )}
          </FormGroup>
        </Col>
        
        {/* Status Field */}
        <Col md="6">
          <FormGroup>
            <Label for="status">
              {t("status")} *
            </Label>
            <Input
              id="status"
              name="status"
              type="select"
              value={formData.status}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="active">{t("Active")}</option>
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
              {isEdit ? t("Updating...") : t("Adding...")}
            </>
          ) : (
            isEdit ? t("update_scale") : t("add_scale")
          )}
        </Button>
      </div>
    </Form>
  );
};

export default AddScale;