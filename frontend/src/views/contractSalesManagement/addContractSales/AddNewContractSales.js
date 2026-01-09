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

  // ** Form State
  const [formData, setFormData] = useState({
    area: "",
    mineralAmount: "",
    unitPrice: "",
    mineralTotalPrice: "",
    royaltyReceiptNumber: "",
    haqWazanReceiptNumber: "",
    weighingTotalPrice: "",
    contractDate: new Date().toISOString().split("T")[0],
  });

  // In AddNewContractSales component, add this useEffect to set the company when in company context
  useEffect(() => {
    if (selectedCompany && !isEdit) {
      console.log("Setting company in contract form:", selectedCompany);
      setFormData((prev) => ({
        ...prev,
        companyName: selectedCompany.company_name,
        companyId: selectedCompany.company_id,
      }));
    }
  }, [selectedCompany, isEdit]);

  // ** Initialize form with data
  useEffect(() => {
    if (isEdit && initialData) {
      setFormData({
        area: initialData.area || "",
        mineralAmount: initialData.mineralAmount || "",
        unitPrice: initialData.unitPrice || "",
        mineralTotalPrice: initialData.mineralTotalPrice || "",
        royaltyReceiptNumber: initialData.royaltyReceiptNumber || "",
        haqWazanReceiptNumber: initialData.haqWazanReceiptNumber || "",
        weighingTotalPrice: initialData.weighingTotalPrice || "",
        contractDate:
          initialData.contractDate || new Date().toISOString().split("T")[0],
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
    if (name === "mineralAmount" || name === "unitPrice") {
      const amount = name === "mineralAmount" ? value : formData.mineralAmount;
      const price = name === "unitPrice" ? value : formData.unitPrice;

      if (amount && price) {
        setFormData((prev) => ({
          ...prev,
          mineralTotalPrice: (
            parseFloat(amount) * parseFloat(price)
          ).toString(),
        }));
      }
    }
  };

  // ** Handle Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.area || !formData.mineralAmount) {
      alert("Please fill in required fields");
      return;
    }

    console.log("Contract form data to submit:", formData);

    // Call onSuccess callback with form data
    if (onSuccess) {
      onSuccess(formData);
    }

    // Reset form only for add mode
    if (!isEdit) {
      setFormData({
        area: "",
        mineralAmount: "",
        unitPrice: "",
        mineralTotalPrice: "",
        royaltyReceiptNumber: "",
        haqWazanReceiptNumber: "",
        weighingTotalPrice: "",
        contractDate: new Date().toISOString().split("T")[0],
      });
    }
  };

  // ** Handle Cancel
  const handleCancel = () => {
    // Reset form only for add mode
    if (!isEdit) {
      setFormData({
        area: "",
        mineralAmount: "",
        unitPrice: "",
        mineralTotalPrice: "",
        royaltyReceiptNumber: "",
        haqWazanReceiptNumber: "",
        weighingTotalPrice: "",
        contractDate: new Date().toISOString().split("T")[0],
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
          {isEdit ? t("edit_contract") : t("add_contract")}
        </h5>
        <small className="text-muted">
          {isEdit ? t("edit_contract_details") : t("enter_contract_details")}
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
            <Label className="form-label" htmlFor="mineralAmount">
              {t("mineral_amount")} *
            </Label>
            <Input
              type="number"
              name="mineralAmount"
              id="mineralAmount"
              placeholder="100"
              value={formData.mineralAmount}
              onChange={handleInputChange}
              required
            />
          </Col>

          <Col md="6" className="mb-1">
            <Label className="form-label" htmlFor="unitPrice">
              {t("unit_price")}
            </Label>
            <Input
              type="number"
              name="unitPrice"
              id="unitPrice"
              placeholder="50"
              value={formData.unitPrice}
              onChange={handleInputChange}
            />
          </Col>

          <Col md="6" className="mb-1">
            <Label className="form-label" htmlFor="mineralTotalPrice">
              {t("mineral_total_price")}
            </Label>
            <Input
              type="number"
              name="mineralTotalPrice"
              id="mineralTotalPrice"
              placeholder="5000"
              value={formData.mineralTotalPrice}
              onChange={handleInputChange}
              readOnly
            />
          </Col>

          <Col md="6" className="mb-1">
            <Label className="form-label" htmlFor="royaltyReceiptNumber">
              {t("royalty_receipt_number")}
            </Label>
            <Input
              type="text"
              name="royaltyReceiptNumber"
              id="royaltyReceiptNumber"
              placeholder="RR001"
              value={formData.royaltyReceiptNumber}
              onChange={handleInputChange}
            />
          </Col>

          <Col md="6" className="mb-1">
            <Label className="form-label" htmlFor="haqWazanReceiptNumber">
              {t("haq_wazan_receipt_number")}
            </Label>
            <Input
              type="text"
              name="haqWazanReceiptNumber"
              id="haqWazanReceiptNumber"
              placeholder="HWR001"
              value={formData.haqWazanReceiptNumber}
              onChange={handleInputChange}
            />
          </Col>

          <Col md="6" className="mb-1">
            <Label className="form-label" htmlFor="weighingTotalPrice">
              {t("weighing_total_price")}
            </Label>
            <Input
              type="number"
              name="weighingTotalPrice"
              id="weighingTotalPrice"
              placeholder="1000"
              value={formData.weighingTotalPrice}
              onChange={handleInputChange}
            />
          </Col>

          <Col md="6" className="mb-1">
            <Label className="form-label" htmlFor="contractDate">
              {t("contract_date")} *
            </Label>
            <Input
              type="date"
              name="contractDate"
              id="contractDate"
              value={formData.contractDate}
              onChange={handleInputChange}
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
