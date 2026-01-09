// ** React Imports
import { Fragment, useState, useEffect } from "react";
import PropTypes from "prop-types";

// ** Icons Imports
import { Save, X } from "react-feather";

// ** i18n
import { useTranslation } from "react-i18next";

// ** Reactstrap Imports
import { Label, Row, Col, Form, Input, Button, Spinner } from "reactstrap";

const AddCar = ({ 
  onSuccess, 
  onCancel, 
  selectedCompany, 
  isEdit = false, 
  initialData,
  loading = false 
}) => {
  const { t } = useTranslation();

  // ** Form State
  const [formData, setFormData] = useState({
    carName: "",
    carType: "",
    plateNumber: "",
    driverName: "",
    companyName: "",
    emptyCarWeight: "",
    status: "active",
    // lastMaintenance: ""
  });

  // ** Initialize form with data
  useEffect(() => {
    if (selectedCompany) {
      setFormData(prev => ({
        ...prev,
        companyName: selectedCompany.company_name
      }));
    }
    
    if (isEdit && initialData) {
      setFormData({
        carName: initialData.car_name || "",
        carType: initialData.car_type || "",
        plateNumber: initialData.plate_number || "",
        driverName: initialData.driver_name || "",
        companyName: initialData.company_name || "",
        emptyCarWeight: initialData.empty_car_weight || "",
        status: initialData.status || "active",
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
    if (!formData.carName || !formData.plateNumber || !formData.driverName) {
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
        carName: "",
        carType: "",
        plateNumber: "",
        driverName: "",
        companyName: selectedCompany ? selectedCompany.company_name : "",
        emptyCarWeight: "",
        status: "active",
        // lastMaintenance: ""
      });
    }
  };

  // ** Handle Cancel
  const handleCancel = () => {
    // Reset form only for add mode
    if (!isEdit) {
      setFormData({
        carName: "",
        carType: "",
        plateNumber: "",
        driverName: "",
        companyName: selectedCompany ? selectedCompany.company_name : "",
        emptyCarWeight: "",
        status: "active",
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
          {isEdit ? t("edit_car") : t("add_car")}
        </h5>
        <small className="text-muted">
          {isEdit ? t("edit_car_details") : t("enter_car_details")}
        </small>
      </div>
      <Form onSubmit={handleSubmit}>
        <Row>

          <Col md="4" className="mb-1">
            <Label className="form-label" htmlFor="carName">
              {t("car_name")} *
            </Label>
            <Input
              type="text"
              id="carName"
              name="carName"
              placeholder="Toyota Hilux"
              value={formData.carName}
              onChange={handleInputChange}
              required
            />
          </Col>

          <Col md="4" className="mb-1">
            <Label className="form-label" htmlFor="carType">
              {t("car_type")}
            </Label>
            <Input
              type="select"
              id="carType"
              name="carType"
              value={formData.carType}
              onChange={handleInputChange}
            >
              <option value="">{t("select_type") || "Select Type"}</option>
              <option value="sedan">{t("sedan") || "Sedan"}</option>
              <option value="pickup">{t("pickup") || "Pickup Truck"}</option>
              <option value="suv">{t("suv") || "SUV"}</option>
              <option value="truck">{t("truck") || "Truck"}</option>
              <option value="van">{t("van") || "Van"}</option>
            </Input>
          </Col>

          <Col md="4" className="mb-1">
            <Label className="form-label" htmlFor="plateNumber">
              {t("plate_number")} *
            </Label>
            <Input
              type="text"
              id="plateNumber"
              name="plateNumber"
              placeholder="KBL-1234"
              value={formData.plateNumber}
              onChange={handleInputChange}
              required
            />
          </Col>

          <Col md="4" className="mb-1">
            <Label className="form-label" htmlFor="driverName">
              {t("driver_name")} *
            </Label>
            <Input
              type="text"
              id="driverName"
              name="driverName"
              placeholder="Ahmad Khan"
              value={formData.driverName}
              onChange={handleInputChange}
              required
            />
          </Col>

          <Col md="4" className="mb-1">
            <Label className="form-label" htmlFor="companyName">
              {t("company_name")}
            </Label>
            <Input
              type="select"
              name="companyName"
              id="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              disabled={!!selectedCompany}
            >
              <option value="">{t("select_company") || "Select Company"}</option>
              <option value="Company 1">Company 1</option>
              <option value="Company 2">Company 2</option>
              <option value="Company 3">Company 3</option>
              <option value="Company 4">Company 4</option>
            </Input>
            {selectedCompany && (
              <small className="text-info">
                {t("company_auto_selected") || "Company auto-selected from company view"}
              </small>
            )}
          </Col>

          <Col md="4" className="mb-1">
            <Label className="form-label" htmlFor="emptyCarWeight">
              {t("empty_car_weight")} (TON)
            </Label>
            <Input
              type="number"
              name="emptyCarWeight"
              id="emptyCarWeight"
              placeholder="1800"
              value={formData.emptyCarWeight}
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
              <option value="active">{t("active") || "Active"}</option>
              <option value="inactive">{t("inactive") || "Inactive"}</option>
            </Input>
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
AddCar.propTypes = {
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
  selectedCompany: PropTypes.object,
  isEdit: PropTypes.bool,
  initialData: PropTypes.object,
  loading: PropTypes.bool,
};

// Default props
AddCar.defaultProps = {
  onSuccess: () => {},
  onCancel: () => {},
  selectedCompany: null,
  isEdit: false,
  initialData: null,
  loading: false,
};

export default AddCar;