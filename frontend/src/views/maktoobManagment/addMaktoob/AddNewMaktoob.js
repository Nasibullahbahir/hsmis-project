// ** React Imports
import { Fragment, useState, useEffect } from "react";
import PropTypes from "prop-types";

// ** Third Party Components
import { Save } from "react-feather";

// ** Reactstrap Imports
import { Label, Row, Col, Form, Input, Button, Spinner } from "reactstrap";

// ** i18n
import { useTranslation } from "react-i18next";

const AddNewMaktoob = ({
  onSuccess,
  onCancel,
  selectedCompany,
  isEdit = false,
  initialData,
  loading = false,
  users = [],
  companies = [],
}) => {
  const { t } = useTranslation();

  // ** Form State - Based on Django model fields
  const [formData, setFormData] = useState({
    maktoob_type: "maktoob-contract",
    maktoob_number: "",
    sadir_date: "",
    source: "",
    start_date: "",
    end_date: "",
    description: "",
    company: "",
    user: "",
  });

  // ** Initialize form with data
  useEffect(() => {
    if (selectedCompany) {
      setFormData((prev) => ({
        ...prev,
        company: selectedCompany.id,
      }));
    }

    if (isEdit && initialData) {
      setFormData({
        maktoob_type: initialData.maktoob_type || "maktoob-contract",
        maktoob_number: initialData.maktoob_number?.toString() || "",
        sadir_date: initialData.sadir_date || "",
        source: initialData.source || "",
        start_date: initialData.start_date || "",
        end_date: initialData.end_date || "",
        description: initialData.description || "",
        company: initialData.company?.id?.toString() || "",
        user: initialData.user?.id?.toString() || "",
      });
    }
  }, [selectedCompany, isEdit, initialData]);

  // ** Handle Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ** Handle Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.maktoob_number) {
      alert("Maktoob Number is required");
      return;
    }

    if (!formData.company && !selectedCompany) {
      alert("Company is required");
      return;
    }

    // Validate maktoob number is a valid number
    const maktoobNumber = parseInt(formData.maktoob_number);
    if (isNaN(maktoobNumber)) {
      alert("Maktoob Number must be a valid number");
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
        maktoob_type: "maktoob-contract",
        maktoob_number: "",
        sadir_date: "",
        source: "",
        start_date: "",
        end_date: "",
        description: "",
        company: selectedCompany ? selectedCompany.id : "",
        user: "",
      });
    }
  };

  return (
    <Fragment>
      <div className="content-header">
        <h5 className="mb-0">
          {isEdit ? t("edit_maktoob") : t("add_new_maktoob")}
        </h5>
        <small className="text-muted">
          {isEdit ? t("edit_maktoob_info") : t("add_maktoob_info")}
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
              type="number"
              name="maktoob_number"
              id="maktoob_number"
              placeholder="12345"
              value={formData.maktoob_number}
              onChange={handleInputChange}
              required
            />
          </Col>

          <Col md="4" className="mb-1">
            <Label className="form-label" htmlFor="sadir_date">
              {t("sadir_date")}
            </Label>
            <Input
              type="date"
              name="sadir_date"
              id="sadir_date"
              value={formData.sadir_date}
              onChange={handleInputChange}
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
              placeholder={t("source_placeholder") || "Enter source"}
              value={formData.source}
              onChange={handleInputChange}
            />
          </Col>

          <Col md="4" className="mb-1">
            <Label className="form-label" htmlFor="start_date">
              {t("start_date")}
            </Label>
            <Input
              type="date"
              name="start_date"
              id="start_date"
              value={formData.start_date}
              onChange={handleInputChange}
            />
          </Col>

          <Col md="4" className="mb-1">
            <Label className="form-label" htmlFor="end_date">
              {t("end_date")}
            </Label>
            <Input
              type="date"
              name="end_date"
              id="end_date"
              value={formData.end_date}
              onChange={handleInputChange}
            />
          </Col>

          {/* Company selection - Only show if not from a specific company view */}
          {!selectedCompany && (
            <Col md="4" className="mb-1">
              <Label className="form-label" htmlFor="company">
                {t("company")} *
              </Label>
              <Input
                type="select"
                name="company"
                id="company"
                value={formData.company}
                onChange={handleInputChange}
                required={!selectedCompany}
              >
                <option value="">{t("select_company")}</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.company_name}
                  </option>
                ))}
              </Input>
            </Col>
          )}

          {selectedCompany && (
            <Col md="4" className="mb-1">
              <Label className="form-label">
                {t("company")}
              </Label>
              <Input
                type="text"
                value={selectedCompany.company_name}
                disabled
                readOnly
              />
              <small className="text-muted">
                This maktoob will be associated with {selectedCompany.company_name}
              </small>
            </Col>
          )}

          {/* User selection */}
          <Col md="4" className="mb-1">
            <Label className="form-label" htmlFor="user">
              {t("user")}
            </Label>
            <Input
              type="select"
              name="user"
              id="user"
              value={formData.user}
              onChange={handleInputChange}
            >
              <option value="">{t("select_user")}</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </Input>
          </Col>

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
              placeholder={t("description_placeholder") || "Enter description"}
            />
          </Col>
        </Row>

        {/* Save and Cancel Buttons */}
        <div className="d-flex justify-content-end mt-2 gap-1">
          <Button color="secondary" onClick={onCancel} disabled={loading}>
            {t("cancel") || "Cancel"}
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
AddNewMaktoob.propTypes = {
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
  selectedCompany: PropTypes.object,
  isEdit: PropTypes.bool,
  initialData: PropTypes.object,
  loading: PropTypes.bool,
  users: PropTypes.array,
  companies: PropTypes.array,
};

// Default props
AddNewMaktoob.defaultProps = {
  onSuccess: () => {},
  onCancel: () => {},
  selectedCompany: null,
  isEdit: false,
  initialData: null,
  loading: false,
  users: [],
  companies: [],
};

export default AddNewMaktoob;