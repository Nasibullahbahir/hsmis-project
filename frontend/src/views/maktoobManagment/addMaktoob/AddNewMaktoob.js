// ** React Imports
import { Fragment, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

// ** Third Party Components
import { Save } from "react-feather";

// ** Reactstrap Imports
import { Label, Row, Col, Form, Input, Button, Spinner, Alert } from "reactstrap";

import MultiCalendarDatePicker from "../../MultiCalendarDatePicker";

// ** i18n
import { useTranslation } from "react-i18next";

const AddNewMaktoob = ({
  onSuccess,
  onCancel,
  selectedCompany,
  isEdit = false,
  initialData,
  loading = false,
  companies = [],
  existingMaktoobNumbers = [], // New prop for existing maktoob numbers
}) => {
  const { t } = useTranslation();
  
  // ** Refs
  const maktoobNumberInputRef = useRef(null);

  // ** Form State
  const [formData, setFormData] = useState({
    maktoob_type: "maktoob-contract",
    maktoob_number: "",
    sadir_date: "",
    source: "",
    start_date: "",
    end_date: "",
    description: "",
    company: "",
  });

  // ** Error State
  const [errors, setErrors] = useState({
    maktoob_number: "",
    company: "",
  });

  // ** Initialize form with data
  useEffect(() => {
    if (selectedCompany) {
      console.log("Selected company from parent:", selectedCompany);
      setFormData((prev) => ({
        ...prev,
        company: selectedCompany.id || selectedCompany.toString(),
      }));
      
      // Clear any company errors when company is auto-selected
      setErrors((prev) => ({
        ...prev,
        company: "",
      }));
    }

    if (isEdit && initialData) {
      // For edit mode, preserve the existing company
      let companyValue = "";
      if (initialData.company?.id) {
        companyValue = initialData.company.id.toString();
      } else if (typeof initialData.company === "number") {
        companyValue = initialData.company.toString();
      } else if (typeof initialData.company === "string") {
        companyValue = initialData.company;
      } else if (initialData.company_id) {
        companyValue = initialData.company_id.toString();
      }
      
      setFormData({
        maktoob_type: initialData.maktoob_type || "maktoob-contract",
        maktoob_number: initialData.maktoob_number?.toString() || "",
        sadir_date: initialData.sadir_date || "",
        source: initialData.source || "",
        start_date: initialData.start_date || "",
        end_date: initialData.end_date || "",
        description: initialData.description || "",
        company: companyValue,
      });
      
      // Clear errors on edit initialization
      setErrors({
        maktoob_number: "",
        company: "",
      });
    }
  }, [selectedCompany, isEdit, initialData]);

  // ** Validate maktoob number uniqueness
  const validateMaktoobNumber = (value) => {
    const errorsCopy = { ...errors };
    
    if (!value.trim()) {
      errorsCopy.maktoob_number = t("Maktoob Number is required");
      return errorsCopy;
    }

    const maktoobNumber = parseInt(value);
    if (isNaN(maktoobNumber)) {
      errorsCopy.maktoob_number = t("Maktoob Number must be a valid number");
      return errorsCopy;
    }

    // Check if maktoob number already exists (only for new entries or when number changes)
    if (!isEdit || (isEdit && initialData && initialData.maktoob_number !== value)) {
      if (existingMaktoobNumbers.includes(maktoobNumber)) {
        errorsCopy.maktoob_number = t("This maktoob number already exists. Please use a different number.");
        return errorsCopy;
      }
    }

    // Clear error if valid
    errorsCopy.maktoob_number = "";
    return errorsCopy;
  };

  // ** Handle Input Change with validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Real-time validation for maktoob number
    if (name === "maktoob_number") {
      const validationErrors = validateMaktoobNumber(value);
      setErrors(validationErrors);
    }
  };

  // ** Handle Date Change
  const handleDateChange = (name, date) => {
    setFormData((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

  // ** Validate Form
  const validateForm = () => {
    const newErrors = {
      maktoob_number: "",
      company: "",
    };

    // Validate maktoob number
    if (!formData.maktoob_number.trim()) {
      newErrors.maktoob_number = t("Maktoob Number is required");
    } else {
      const maktoobNumber = parseInt(formData.maktoob_number);
      if (isNaN(maktoobNumber)) {
        newErrors.maktoob_number = t("Maktoob Number must be a valid number");
      } else if (!isEdit && existingMaktoobNumbers.includes(maktoobNumber)) {
        newErrors.maktoob_number = t("This maktoob number already exists. Please use a different number.");
      }
    }

    // Validate company (only if not in company view)
    if (!selectedCompany && !formData.company) {
      newErrors.company = t("Company is required");
    }

    setErrors(newErrors);
    
    // Check if any errors exist
    return Object.values(newErrors).every(error => !error);
  };

  // ** Handle Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      // Focus on first error field
      if (errors.maktoob_number) {
        maktoobNumberInputRef.current?.focus();
      }
      return;
    }

    // Ensure company is set (for company view)
    const finalFormData = { ...formData };
    if (selectedCompany && !finalFormData.company) {
      finalFormData.company = selectedCompany.id || selectedCompany.toString();
    }

    console.log("Form data to submit:", finalFormData);

    // Call onSuccess callback with form data
    if (onSuccess) {
      onSuccess(finalFormData);
    }

    // Reset form only for add mode
    if (!isEdit) {
      setFormData({
        maktoob_type: "maktoob-contract",
        maktoob_number: "",
        sadir_date: "",
        source: "",
        start_date: "",
        end_date: "",
        description: "",
        company: selectedCompany ? (selectedCompany.id || selectedCompany.toString()) : "",
      });
      
      // Clear errors
      setErrors({
        maktoob_number: "",
        company: "",
      });
    }
  };

  // ** Handle Cancel
  const handleCancel = () => {
    // Clear form and errors
    setFormData({
      maktoob_type: "maktoob-contract",
      maktoob_number: "",
      sadir_date: "",
      source: "",
      start_date: "",
      end_date: "",
      description: "",
      company: selectedCompany ? (selectedCompany.id || selectedCompany.toString()) : "",
    });
    
    setErrors({
      maktoob_number: "",
      company: "",
    });
    
    // Call parent cancel callback
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Fragment>
      <div className="content-header">
        {selectedCompany && (
          <Alert color="info" className="py-2 mb-2">
            <small>
              <strong>{t("Company:")}</strong> {selectedCompany.company_name}
            </small>
          </Alert>
        )}
        <small className="text-muted">
          {isEdit ? t("edit_maktoob_info") : t("add_new_maktoob_info")}
        </small>
      </div>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md="4" className="mb-1">
            <Label className="form-label" htmlFor="maktoob_type">
              {t("maktoob_type")}
            </Label>
            <Input
              type="select"
              name="maktoob_type"
              id="maktoob_type"
              value={formData.maktoob_type}
              onChange={handleInputChange}
            >
              <option value="maktoob-contract">{t("maktoob_contract")}</option>
              <option value="maktoob-tamded">{t("maktoob_tamded")}</option>
              <option value="maktoob-khosh">{t("maktoob_sale")}</option>
              <option value="maktoob-royality">{t("maktoob_royality")}</option>
              <option value="maktoob-baharbardry">
                {t("maktoob_baharbardry")}
              </option>
              <option value="maktoob-paskha">{t("maktoob_paskha")}</option>
              <option value="maktoob-process">{t("maktoob_process")}</option>
            </Input>
          </Col>

          <Col md="4" className="mb-1">
            <Label className="form-label" htmlFor="maktoob_number">
              {t("maktoob_number")} *
            </Label>
            <Input
              innerRef={maktoobNumberInputRef}
              type="number"
              name="maktoob_number"
              id="maktoob_number"
              placeholder="12345"
              value={formData.maktoob_number}
              onChange={handleInputChange}
              onBlur={(e) => {
                const validationErrors = validateMaktoobNumber(e.target.value);
                setErrors(validationErrors);
              }}
              invalid={!!errors.maktoob_number}
              required
            />
            {errors.maktoob_number && (
              <div className="text-danger mt-1 small">{errors.maktoob_number}</div>
            )}
          </Col>

          <Col md="4" className="mb-1">
            <MultiCalendarDatePicker
              label={t("sadir_date")}
              value={formData.sadir_date}
              onChange={(date) => handleDateChange("sadir_date", date)}
              wrapperClassName="compose-mail-form-field"
              labelClassName="form-label"
              inputClassName="form-control"
            />
          </Col>

          <Col md="4" className="mb-1">
            <Label className="form-label" htmlFor="source">
              {t("source")}
            </Label>
            <Input
              type="text"
              name="source"
              id="source"
              placeholder={t("source_placeholder")}
              value={formData.source}
              onChange={handleInputChange}
            />
          </Col>
          
          <Col md="4" className="mb-1">
            <MultiCalendarDatePicker
              label={t("start_date")}
              value={formData.start_date}
              onChange={(date) => handleDateChange("start_date", date)}
            />
          </Col>

          <Col md="4" className="mb-1">
            <MultiCalendarDatePicker
              label={t("end_date")}
              value={formData.end_date}
              onChange={(date) => handleDateChange("end_date", date)}
            />
          </Col>

          {/* Company selection - Only show if not in company view */}
          {!selectedCompany && (
            <Col md="4" className="mb-1">
              <Label className="form-label" htmlFor="company">
                {t("company")} *
              </Label>
              {companies.length === 0 ? (
                <div className="alert alert-warning py-1">
                  <small>{t("No companies available")}</small>
                </div>
              ) : (
                <>
                  <Input
                    type="select"
                    name="company"
                    id="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    required={!selectedCompany}
                    invalid={!!errors.company}
                  >
                    <option value="">{t("select_company")}</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.company_name}
                      </option>
                    ))}
                  </Input>
                  {errors.company && (
                    <div className="text-danger mt-1 small">{errors.company}</div>
                  )}
                </>
              )}
            </Col>
          )}

          {/* Display selected company (read-only) when in company view */}
          {selectedCompany && (
            <Col md="4" className="mb-1">
              <Label className="form-label">{t("company")}</Label>
              <Input
                type="text"
                value={selectedCompany.company_name}
                disabled
                readOnly
                className="bg-light"
              />
              <input
                type="hidden"
                name="company"
                value={selectedCompany.id || selectedCompany.toString()}
              />
              <small className="text-muted d-block mt-1">
                {t("This maktoob will be associated with")}{" "}
                <strong>{selectedCompany.company_name}</strong>
              </small>
            </Col>
          )}

          <Col md="12" className="mb-1">
            <Label className="form-label" htmlFor="description">
              {t("description")}
            </Label>
            <Input
              type="textarea"
              name="description"
              id="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              placeholder={t("description_placeholder")}
            />
          </Col>
        </Row>

        {/* Save and Cancel Buttons */}
        <div className="d-flex justify-content-end mt-2 gap-1">
          <Button color="secondary" onClick={handleCancel} disabled={loading}>
            {t("cancel")}
          </Button>

          <Button color="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner size="sm" className="me-50" />
                {t("saving")}
              </>
            ) : (
              <>
                <Save size={14} className="align-middle me-50" />
                <span className="align-middle">
                  {isEdit ? t("update") : t("save")}
                </span>
              </>
            )}
          </Button>
        </div>
      </Form>
    </Fragment>
  );
};

// PropTypes
AddNewMaktoob.propTypes = {
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
  selectedCompany: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
    PropTypes.number,
  ]),
  isEdit: PropTypes.bool,
  initialData: PropTypes.object,
  loading: PropTypes.bool,
  companies: PropTypes.array,
  existingMaktoobNumbers: PropTypes.array, // Array of existing maktoob numbers
};

// Default props
AddNewMaktoob.defaultProps = {
  onSuccess: () => {},
  onCancel: () => {},
  selectedCompany: null,
  isEdit: false,
  initialData: null,
  loading: false,
  companies: [],
  existingMaktoobNumbers: [], // Default empty array
};

export default AddNewMaktoob;