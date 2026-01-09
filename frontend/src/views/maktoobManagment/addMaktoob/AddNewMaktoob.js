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
}) => {
  const { t } = useTranslation();

  // ** Form State - Only specified fields
  const [formData, setFormData] = useState({
    maktoob_type: "maktoob-contract",
    maktoob_number: "",
    maktoob_scan: null,
    sadir_date: "",
    company_name: "",
    source: "",
    start_date: "",
    end_date: "",
    status: "pending",
    description: "",
  });

  // ** File state
  const [selectedFile, setSelectedFile] = useState(null);

  // ** Initialize form with data
  useEffect(() => {
    if (selectedCompany) {
      setFormData((prev) => ({
        ...prev,
        company_name: selectedCompany.company_name,
      }));
    }

    if (isEdit && initialData) {
      setFormData({
        maktoob_type: initialData.maktoob_type || "maktoob-contract",
        maktoob_number: initialData.maktoob_number || "",
        maktoob_scan: initialData.maktoob_scan || null,
        sadir_date: initialData.sadir_date || "",
        company_name: initialData.company_name || "",
        source: initialData.source || "",
        start_date: initialData.start_date || "",
        end_date: initialData.end_date || "",
        status: initialData.status || "pending",
        description: initialData.description || "",
      });
    }
  }, [selectedCompany, isEdit, initialData]);

  // ** Handle Input Change
  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      setSelectedFile(file);
      // Store only the file name, not the File object
      setFormData((prev) => ({
        ...prev,
        [name]: file ? file.name : null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // ** Handle Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.company_name || !formData.maktoob_number) {
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
        maktoob_type: "maktoob-contract",
        maktoob_number: "",
        maktoob_scan: null,
        sadir_date: "",
        company_name: selectedCompany ? selectedCompany.company_name : "",
        source: "",
        start_date: "",
        end_date: "",
        status: "pending",
        description: "",
      });
      setSelectedFile(null);
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
              {t("maktoob_type")} *
            </Label>
            <Input
              type="select"
              name="maktoob_type"
              id="maktoob_type"
              value={formData.maktoob_type}
              onChange={handleInputChange}
              required
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
              type="text"
              name="maktoob_number"
              id="maktoob_number"
              placeholder="MKT-001"
              value={formData.maktoob_number}
              onChange={handleInputChange}
              required
            />
          </Col>

          <Col md="4" className="mb-1">
            <Label className="form-label" htmlFor="maktoob_scan">
              {t("maktoob_scan")}
            </Label>
            <Input
              type="file"
              name="maktoob_scan"
              id="maktoob_scan"
              accept=".pdf, .jpg, .jpeg, .png"
              onChange={handleInputChange}
            />
            {selectedFile && (
              <small className="text-muted">
                Selected file: {selectedFile.name}
              </small>
            )}
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
            <Label className="form-label" htmlFor="company_name">
              {t("company_name")} *
            </Label>
            <Input
              type="select"
              name="company_name"
              id="company_name"
              value={formData.company_name}
              onChange={handleInputChange}
              required
            >
              <option value="">{t("select_company")}</option>
              <option value="Company 1">Company 1</option>
              <option value="Company 2">Company 2</option>
              <option value="Company 3">Company 3</option>
              <option value="Company 4">Company 4</option>
            </Input>
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

          <Col md="4" className="mb-1">
            <Label className="form-label" htmlFor="status">
              {t("status")}
            </Label>
            <Input
              type="select"
              name="status"
              id="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="pending">{t("pending") || "Pending"}</option>
              <option value="completed">{t("completed") || "Completed"}</option>
              <option value="in-progress">
                {t("in_progress") || "In Progress"}
              </option>
              <option value="cancelled">{t("cancelled") || "Cancelled"}</option>
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
};

// Default props
AddNewMaktoob.defaultProps = {
  onSuccess: () => {},
  onCancel: () => {},
  selectedCompany: null,
  isEdit: false,
  initialData: null,
  loading: false,
};

export default AddNewMaktoob;