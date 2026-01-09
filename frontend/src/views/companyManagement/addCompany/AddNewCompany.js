// ** React Imports
import { Fragment, useState, useEffect } from "react";
import PropTypes from "prop-types";

// ** Icons Imports
import { Save, X } from "react-feather";

// ** Third Party Components
import Flatpickr from "react-flatpickr";

// ** Reactstrap Imports
import { Label, Row, Col, Input, Form, Button, Spinner } from "reactstrap";

// ** i18n
import { useTranslation } from "react-i18next";

// ** Styles
import "@styles/react/libs/flatpickr/flatpickr.scss";

const AddNewCompany = ({
  onSuccess,
  onCancel,
  loading,
  initialData,
  isEdit = false,
}) => {
  const { t } = useTranslation();

  // ** Form State
  const [formData, setFormData] = useState({
    company_name: "",
    leader_name: "",
    phone: "",
    company_type: "",
    TIN_number: "",
    licence_number: "",
    state: "",
    registration_date: new Date().toISOString().split("T")[0],
  });

  // ** Initialize form with data for edit mode
  useEffect(() => {
    if (isEdit && initialData) {
      console.log("Initial data for edit:", initialData);
      setFormData({
        company_name: initialData.company_name || "",
        leader_name: initialData.leader_name || "",
        phone: initialData.phone || "",
        company_type: initialData.company_type || "",
        TIN_number: initialData.TIN_number || "",
        licence_number: initialData.licence_number || "",
        state: initialData.state || "active",
        registration_date:
          initialData.registration_date ||
          new Date().toISOString().split("T")[0],
      });
    }
  }, [initialData, isEdit]);

  // ** Handle Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ** Handle Date Change
  const handleDateChange = (date) => {
    const selectedDate = date[0]
      ? date[0].toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];
    setFormData((prev) => ({
      ...prev,
      registration_date: selectedDate,
    }));
  };

  // ** Handle Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.company_name || !formData.leader_name || !formData.phone) {
      alert("Please fill in required fields");
      return;
    }

    console.log("Form data to submit:", formData);

    // Call onSuccess callback with form data
    if (onSuccess) {
      onSuccess(formData);
    }

    // Reset form only for add mode
    if (!isEdit) {
      setFormData({
        company_name: "",
        leader_name: "",
        phone: "",
        company_type: "",
        TIN_number: "",
        licence_number: "",
        state: "active",
        registration_date: new Date().toISOString().split("T")[0],
      });
    }
  };

  // ** Handle Cancel
  const handleCancel = () => {
    // Reset form only for add mode
    if (!isEdit) {
      setFormData({
        company_name: "",
        leader_name: "",
        phone: "",
        company_type: "",
        TIN_number: "",
        licence_number: "",
        state: "active",
        registration_date: new Date().toISOString().split("T")[0],
      });
    }

    // Call onCancel callback
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Fragment>
      <div className="content-header">
        <h5 className="mb-0">
          {isEdit ? t("edit_company") : t("add_new_company")}
        </h5>
        <small className="text-muted">
          {isEdit ? t("edit_company_info") : t("enter_company_info")}
        </small>
      </div>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md="3" className="mb-1">
            <Label className="form-label" htmlFor="company_name">
              {t("company_name")} *
            </Label>
            <Input
              type="text"
              name="company_name"
              id="company_name"
              placeholder={t("company_name_placeholder") || "Company Name"}
              value={formData.company_name}
              onChange={handleInputChange}
              required
            />
          </Col>

          <Col md="3" className="mb-1">
            <Label className="form-label" htmlFor="leader_name">
              {t("leader_name")}
            </Label>
            <Input
              type="text"
              name="leader_name"
              id="leader_name"
              placeholder={t("company_leader_placeholder") || "Leader Name"}
              value={formData.leader_name}
              onChange={handleInputChange}
              required
            />
          </Col>

          <Col md="3" className="mb-1">
            <Label className="form-label" htmlFor="phone">
              {t("phone")}
            </Label>
            <Input
              type="number"
              name="phone"
              id="phone"
              placeholder={t("phone_number") || "Phone Number"}
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </Col>

          <Col md="3" className="mb-1">
            <Label className="form-label" htmlFor="company_type">
              {t("company_type")}
            </Label>
            <Input
              type="select"
              name="company_type"
              id="company_type"
              placeholder={t("company_type") || "company_type"}
              value={formData.company_type}
              onChange={handleInputChange}
              required
            >
               <option value="contract">{t("contract") || "contract"}</option>
               <option value="khosh-kharid">{t("khosh-kharid") || "khosh-kharid"}</option>
               <option value="process">{t("process") || "process"}</option>
               <option value="control">{t("control") || "control"}</option>
               </Input>
          </Col>

          <Col md="3" className="mb-1">
            <Label className="form-label" htmlFor="TIN_number">
              {t("TIN_number")}
            </Label>
            <Input
              type="number"
              name="TIN_number"
              id="TIN_number"
              placeholder={t("tin_number") || "TIN Number"}
              value={formData.TIN_number}
              onChange={handleInputChange}
            />
          </Col>

          <Col md="3" className="mb-1">
            <Label className="form-label" htmlFor="licence_number">
              {t("licence_number")}
            </Label>
            <Input
              type="tel"
              name="licence_number"
              id="licence_number"
              placeholder={t("permit_number") || "Licence Number"}
              value={formData.licence_number}
              onChange={handleInputChange}
            />
          </Col>

          <Col md="3" className="mb-1">
            <Label className="form-label" htmlFor="state">
              {t("state")}
            </Label>
            <Input
              type="select"
              name="state"
              id="state"
              value={formData.state}
              onChange={handleInputChange}
              required
            >
              <option value="active">{t("active") || "Active"}</option>
              <option value="inactive">{t("inactive") || "Inactive"}</option>
              <option value="tamded">{t("tamded") || "Tamded"}</option>
            </Input>
          </Col>

          <Col md="3" className="mb-1">
            <Label className="form-label" htmlFor="registration_date">
              {t("registration_date")}
            </Label>
            <Flatpickr
              className="form-control"
              id="registration_date"
              value={formData.registration_date}
              onChange={handleDateChange}
              options={{ dateFormat: "Y-m-d" }}
              required
            />
          </Col>
        </Row>

        {/* Save and Cancel Buttons */}
        <div className="d-flex justify-content-end mt-2">
          <Button
            color="secondary"
            className="me-1"
            onClick={handleCancel}
            disabled={loading}
          >
            <X size={14} className="align-middle me-50" />
            <span className="align-middle">{t("cancel")}</span>
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
                  {isEdit ? t("update") || "Update" : t("save") || "Save"}
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
AddNewCompany.propTypes = {
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
  loading: PropTypes.bool,
  initialData: PropTypes.object,
  isEdit: PropTypes.bool,
};

// Default props
AddNewCompany.defaultProps = {
  onSuccess: () => {},
  onCancel: () => {},
  loading: false,
  initialData: null,
  isEdit: false,
};

export default AddNewCompany;
