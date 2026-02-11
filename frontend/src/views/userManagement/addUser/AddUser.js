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

const AddUser = ({ 
  onSuccess, 
  onCancel, 
  initialData, 
  loading, 
  isEdit
}) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    first_name: "",
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    is_active: true
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isEdit && initialData) {
      setFormData({
        first_name: initialData.first_name || initialData.name || "",
        username: initialData.username || "",
        password: "",
        confirmPassword: "",
        email: initialData.email || "",
        is_active: initialData.is_active !== false
      });
    }
  }, [isEdit, initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) newErrors.first_name = t("First name is required");
    if (!formData.username.trim()) newErrors.username = t("Username is required");
    if (!formData.email.trim()) newErrors.email = t("Email is required");
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = t("Invalid email format");
    }

    if (!isEdit) {
      if (!formData.password) newErrors.password = t("Password is required");
      if (formData.password.length < 6) newErrors.password = t("Password must be at least 6 characters");
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t("Passwords do not match");
      }
    } else {
      if (formData.password && formData.password.length < 6) {
        newErrors.password = t("Password must be at least 6 characters");
      }
      if (formData.password && formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t("Passwords do not match");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submissionData = {
      first_name: formData.first_name.trim(),
      username: formData.username.trim(),
      email: formData.email.trim(),
      is_active: formData.is_active
    };

    if (formData.password) {
      submissionData.password = formData.password;
    }

    console.log("Submitting user data:", submissionData);
    onSuccess(submissionData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="first_name">
              {t("first_name")} *
            </Label>
            <Input
              id="first_name"
              name="first_name"
              placeholder={t("Enter first name")}
              value={formData.first_name}
              onChange={handleChange}
              required
              disabled={loading}
              invalid={!!errors.first_name}
            />
            {errors.first_name && <div className="text-danger small mt-1">{errors.first_name}</div>}
          </FormGroup>
        </Col>
        
        <Col md="6">
          <FormGroup>
            <Label for="username">
              {t("username")} *
            </Label>
            <Input
              id="username"
              name="username"
              placeholder={t("Enter username")}
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
              invalid={!!errors.username}
            />
            {errors.username && <div className="text-danger small mt-1">{errors.username}</div>}
          </FormGroup>
        </Col>
        
        <Col md="6">
          <FormGroup>
            <Label for="password">
              {isEdit ? t("change_password") : t("password")} 
              {!isEdit && " *"}
            </Label>
            <div className="position-relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder={isEdit ? t("Leave blank to keep current password") : t("Enter password")}
                value={formData.password}
                onChange={handleChange}
                required={!isEdit}
                disabled={loading}
                invalid={!!errors.password}
              />
              <Button
                type="button"
                color="link"
                className="position-absolute end-0 top-0 mt-20 me-2"
                onClick={() => setShowPassword(!showPassword)}
                style={{ zIndex: 100 }}
              >
                {showPassword ? t("Hide") : t("Show")}
              </Button>
            </div>
            {errors.password && <div className="text-danger small mt-1">{errors.password}</div>}
            <small className="text-muted">
              {t("Password must be at least 6 characters long")}
            </small>
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="confirmPassword">
              {t("confirm_password")} 
              {!isEdit && " *"}
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder={t("Confirm password")}
              value={formData.confirmPassword}
              onChange={handleChange}
              required={!isEdit}
              disabled={loading}
              invalid={!!errors.confirmPassword}
            />
            {errors.confirmPassword && <div className="text-danger small mt-1">{errors.confirmPassword}</div>}
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup>
            <Label for="email">
              {t("email")} *
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t("Enter email address")}
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              invalid={!!errors.email}
            />
            {errors.email && <div className="text-danger small mt-1">{errors.email}</div>}
          </FormGroup>
        </Col>

        <Col md="6">
          <FormGroup check className="mt-4 pt-2">
            <Input
              id="is_active"
              name="is_active"
              type="checkbox"
              checked={formData.is_active}
              onChange={handleChange}
              disabled={loading}
            />
            <Label for="is_active" check className="form-label">
              {t("is_active")}
            </Label>
            <small className="text-muted d-block">
              {t("Uncheck to deactivate user")}
            </small>
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
              {isEdit ? t("Updating...") : t("Creating...")}
            </>
          ) : (
            isEdit ? t("update_user") : t("add_user")
          )}
        </Button>
      </div>
    </Form>
  );
};

export default AddUser;