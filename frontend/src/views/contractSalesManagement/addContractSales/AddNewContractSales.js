// src/components/addContract/AddNewContractSales.js

// ** React Imports
import { Fragment, useState, useEffect } from "react";
import PropTypes from "prop-types";

// ** Icons Imports
import { Save, X } from "react-feather";

// ** i18n
import { useTranslation } from "react-i18next";

// ** Reactstrap Imports
import { Label, Row, Col, Form, Input, Button, Spinner } from "reactstrap";

const AddNewContractSales = ({
  onSuccess,
  onCancel,
  selectedCompany,
  isEdit = false,
  initialData,
  loading = false,
}) => {
  const { t } = useTranslation();

  // ** Form State - using snake_case for API
  const [formData, setFormData] = useState({
    area: "",
    mineral_amount: "",
    unit_price: "",
    mineral_total_price: "",
    royalty_receipt_number: "",
    haq_wazan_receipt_number: "",
    weighing_total_price: "",
    create_at: new Date().toISOString().split("T")[0],
  });

  // Initialize form with selected company when in add mode
  useEffect(() => {
    if (selectedCompany && !isEdit) {
      // Company will be handled in the parent component
    }
  }, [selectedCompany, isEdit]);

  // ** Initialize form with data from API when editing
  useEffect(() => {
    if (isEdit && initialData) {
      setFormData({
        area: initialData.area || "",
        mineral_amount: initialData.mineral_amount?.toString() || "",
        unit_price: initialData.unit_price?.toString() || "",
        mineral_total_price: initialData.mineral_total_price?.toString() || "",
        royalty_receipt_number: initialData.royalty_receipt_number?.toString() || "",
        haq_wazan_receipt_number: initialData.haq_wazan_receipt_number?.toString() || "",
        weighing_total_price: initialData.weighing_total_price?.toString() || "",
        create_at: initialData.create_at || new Date().toISOString().split("T")[0],
      });
    }
  }, [isEdit, initialData]);

  // ** Handle Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-calculate mineral total price
    if (name === "mineral_amount" || name === "unit_price") {
      const amount = name === "mineral_amount" ? value : formData.mineral_amount;
      const price = name === "unit_price" ? value : formData.unit_price;

      if (amount && price && !isNaN(amount) && !isNaN(price)) {
        const calculatedTotal = (parseFloat(amount) * parseFloat(price)).toFixed(2);
        setFormData((prev) => ({
          ...prev,
          mineral_total_price: calculatedTotal,
        }));
      }
    }
  };

  // ** Handle Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.area || !formData.mineral_amount) {
      alert("Please fill in required fields (Area and Mineral Amount)");
      return;
    }

    // Prepare data for API
    const preparedData = {
      area: formData.area,
      mineral_amount: parseInt(formData.mineral_amount) || 0,
      unit_price: formData.unit_price ? parseFloat(formData.unit_price) : null,
      mineral_total_price: formData.mineral_total_price ? parseFloat(formData.mineral_total_price) : null,
      royalty_receipt_number: formData.royalty_receipt_number ? parseInt(formData.royalty_receipt_number) : null,
      haq_wazan_receipt_number: formData.haq_wazan_receipt_number ? parseInt(formData.haq_wazan_receipt_number) : null,
      weighing_total_price: formData.weighing_total_price ? parseInt(formData.weighing_total_price) : null,
      create_at: formData.create_at,
      company: selectedCompany?.id || (initialData?.company?.id || null),
    };

    // Call onSuccess callback with form data
    if (onSuccess) {
      onSuccess(preparedData);
    }

    // Reset form only for add mode
    if (!isEdit) {
      setFormData({
        area: "",
        mineral_amount: "",
        unit_price: "",
        mineral_total_price: "",
        royalty_receipt_number: "",
        haq_wazan_receipt_number: "",
        weighing_total_price: "",
        create_at: new Date().toISOString().split("T")[0],
      });
    }
  };

  // ** Handle Cancel
  const handleCancel = () => {
    // Reset form only for add mode
    if (!isEdit) {
      setFormData({
        area: "",
        mineral_amount: "",
        unit_price: "",
        mineral_total_price: "",
        royalty_receipt_number: "",
        haq_wazan_receipt_number: "",
        weighing_total_price: "",
        create_at: new Date().toISOString().split("T")[0],
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
          {isEdit ? t("edit_purchase") : t("add_purchase")}
        </h5>
        <small className="text-muted">
          {isEdit ? t("edit_purchase_details") : t("enter_purchase_details")}
        </small>
      </div>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md="6" className="mb-1">
            <Label className="form-label" htmlFor="area">
              {t("area")} *
            </Label>
            <Input
              type="text"
              name="area"
              id="area"
              placeholder={t("area_placeholder") || "Enter area"}
              value={formData.area}
              onChange={handleInputChange}
              required
            />
          </Col>

          <Col md="6" className="mb-1">
            <Label className="form-label" htmlFor="mineral_amount">
              {t("mineral_amount")} *
            </Label>
            <Input
              type="number"
              name="mineral_amount"
              id="mineral_amount"
              placeholder="100"
              value={formData.mineral_amount}
              onChange={handleInputChange}
              required
              min="0"
            />
          </Col>

          <Col md="6" className="mb-1">
            <Label className="form-label" htmlFor="unit_price">
              {t("unit_price")}
            </Label>
            <Input
              type="number"
              name="unit_price"
              id="unit_price"
              placeholder="50.00"
              value={formData.unit_price}
              onChange={handleInputChange}
              min="0"
              step="0.01"
            />
          </Col>

          <Col md="6" className="mb-1">
            <Label className="form-label" htmlFor="mineral_total_price">
              {t("mineral_total_price")}
            </Label>
            <Input
              type="number"
              name="mineral_total_price"
              id="mineral_total_price"
              placeholder="5000.00"
              value={formData.mineral_total_price}
              onChange={handleInputChange}
              readOnly
              min="0"
              step="0.01"
            />
          </Col>

          <Col md="6" className="mb-1">
            <Label className="form-label" htmlFor="royalty_receipt_number">
              {t("royalty_receipt_number")}
            </Label>
            <Input
              type="number"
              name="royalty_receipt_number"
              id="royalty_receipt_number"
              placeholder="1001"
              value={formData.royalty_receipt_number}
              onChange={handleInputChange}
              min="0"
            />
          </Col>

          <Col md="6" className="mb-1">
            <Label className="form-label" htmlFor="haq_wazan_receipt_number">
              {t("haq_wazan_receipt_number")}
            </Label>
            <Input
              type="number"
              name="haq_wazan_receipt_number"
              id="haq_wazan_receipt_number"
              placeholder="2001"
              value={formData.haq_wazan_receipt_number}
              onChange={handleInputChange}
              min="0"
            />
          </Col>

          <Col md="6" className="mb-1">
            <Label className="form-label" htmlFor="weighing_total_price">
              {t("weighing_total_price")}
            </Label>
            <Input
              type="number"
              name="weighing_total_price"
              id="weighing_total_price"
              placeholder="1000"
              value={formData.weighing_total_price}
              onChange={handleInputChange}
              min="0"
            />
          </Col>

          <Col md="6" className="mb-1">
            <Label className="form-label" htmlFor="create_at">
              {t("purchase_date")} *
            </Label>
            <Input
              type="date"
              name="create_at"
              id="create_at"
              value={formData.create_at}
              onChange={handleInputChange}
              required
            />
          </Col>
        </Row>

        {/* Display selected company info */}
        {selectedCompany && !isEdit && (
          <Row>
            <Col md="12" className="mb-2">
              <div className="alert alert-info p-2">
                <small>
                  <strong>Adding purchase for:</strong> {selectedCompany.company_name} (ID: {selectedCompany.id})
                </small>
              </div>
            </Col>
          </Row>
        )}

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
AddNewContractSales.propTypes = {
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
  selectedCompany: PropTypes.object,
  isEdit: PropTypes.bool,
  initialData: PropTypes.object,
  loading: PropTypes.bool,
};

// Default props
AddNewContractSales.defaultProps = {
  onSuccess: () => {},
  onCancel: () => {},
  selectedCompany: null,
  isEdit: false,
  initialData: null,
  loading: false,
};

export default AddNewContractSales;