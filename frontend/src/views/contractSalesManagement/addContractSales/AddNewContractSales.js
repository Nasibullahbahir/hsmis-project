// AddNewPurchase.js - Fixed with company auto-selection and filtered maktoobs
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
  Alert,
} from "reactstrap";

const AddNewPurchase = ({ 
  onSuccess, 
  onCancel, 
  initialData, 
  loading, 
  isEdit,
  companies = [],
  maktoobs = [], // This should be filtered maktoobs by company
  minerals = [],
  scales = [],
  units = [],
  selectedCompany = null, // Pass selected company from PurchaseTable
  currentUser = null,
  hideUserField = false,
  hideScaleField = false
}) => {
  const { t } = useTranslation();
  
  // Form state
  const [formData, setFormData] = useState({
    area: "",
    mineral_amount: "",
    unit_price: "",
    mineral_total_price: "",
    royalty_receipt_number: "",
    weighing_total_price: "",
    haq_wazan_receipt_number: "",
    company: "",
    maktoob: "",
    mineral: "",
    user: currentUser?.id || "",
    scale: "",
    unit: "",
  });

  // Auto-select company if selectedCompany is provided
  useEffect(() => {
    if (selectedCompany && selectedCompany.id) {
      console.log("Auto-selecting company:", selectedCompany);
      setFormData(prev => ({
        ...prev,
        company: selectedCompany.id.toString()
      }));
    }
  }, [selectedCompany]);

  // Calculate mineral_total_price when mineral_amount or unit_price changes
  useEffect(() => {
    if (formData.mineral_amount && formData.unit_price) {
      const amount = parseFloat(formData.mineral_amount) || 0;
      const price = parseFloat(formData.unit_price) || 0;
      const total = (amount * price).toFixed(2);
      
      setFormData(prev => ({
        ...prev,
        mineral_total_price: total
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        mineral_total_price: ""
      }));
    }
  }, [formData.mineral_amount, formData.unit_price]);

  // Set initial data if editing
  useEffect(() => {
    if (isEdit && initialData) {
      console.log("Setting initial data for edit:", initialData);
      
      // Extract IDs
      const companyId = initialData.company?.id || initialData.company || "";
      const maktoobId = initialData.maktoob?.id || initialData.maktoob || "";
      const mineralId = initialData.mineral?.id || initialData.mineral || "";
      const userId = initialData.user?.id || initialData.user || currentUser?.id || "";
      const scaleId = initialData.scale?.id || initialData.scale || "";
      const unitId = initialData.unit?.id || initialData.unit || "";
      
      setFormData({
        area: initialData.area || "",
        mineral_amount: initialData.mineral_amount || "",
        unit_price: initialData.unit_price || "",
        mineral_total_price: initialData.mineral_total_price || "",
        royalty_receipt_number: initialData.royalty_receipt_number || "",
        weighing_total_price: initialData.weighing_total_price || "",
        haq_wazan_receipt_number: initialData.haq_wazan_receipt_number || "",
        company: companyId.toString(),
        maktoob: maktoobId.toString(),
        mineral: mineralId.toString(),
        user: userId.toString(),
        scale: scaleId.toString(),
        unit: unitId.toString(),
      });
    }
  }, [isEdit, initialData, currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.area || !formData.mineral_amount || !formData.unit_price) {
      alert(t("fill_required_fields") || "Please fill in all required fields (Area, Mineral Amount, Unit Price)");
      return;
    }
    
    // Prepare data for submission
    const submitData = {
      area: formData.area,
      mineral_amount: formData.mineral_amount,
      unit_price: formData.unit_price,
      mineral_total_price: formData.mineral_total_price,
      royalty_receipt_number: formData.royalty_receipt_number || null,
      weighing_total_price: formData.weighing_total_price || 0,
      haq_wazan_receipt_number: formData.haq_wazan_receipt_number || null,
    };
    
    // Add foreign key fields only if they have values
    if (formData.company) {
      submitData.company = parseInt(formData.company);
    }
    if (formData.maktoob) {
      submitData.maktoob = parseInt(formData.maktoob);
    }
    if (formData.mineral) {
      submitData.mineral = parseInt(formData.mineral);
    }
    if (formData.user) {
      submitData.user = parseInt(formData.user);
    }
    if (formData.scale) {
      submitData.scale = parseInt(formData.scale);
    }
    if (formData.unit) {
      submitData.unit = parseInt(formData.unit);
    }
    
    console.log("Submitting purchase data:", submitData);
    onSuccess(submitData);
  };

  // Helper function to get display name for dropdown items
  const getDisplayName = (item) => {
    if (!item) return "";
    
    if (item.company_name) return item.company_name;
    if (item.name) return item.name;
    if (item.maktoob_number) return `Maktoob #${item.maktoob_number}`;
    if (item.scale_number) return `Scale #${item.scale_number}`;
    if (item.unit_name) return item.unit_name;
    if (item.unit_code) return item.unit_code;
    if (item.username) return item.username;
    if (item.email) return item.email;
    if (item.mineral_name) return item.mineral_name;
    
    return `ID: ${item.id}`;
  };

  // Get company name for display
  const getSelectedCompanyName = () => {
    if (!formData.company) return "";
    const companyObj = companies.find(c => c.id.toString() === formData.company);
    return companyObj ? getDisplayName(companyObj) : "";
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        {/* Area */}
        <Col md="3">
          <FormGroup>
            <Label for="area">
              {t("area") || "Area"} *
            </Label>
            <Input
              id="area"
              name="area"
              placeholder={t("enter_area") || "Enter area"}
              value={formData.area}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </FormGroup>
        </Col>
        
        {/* Mineral Amount */}
        <Col md="3">
          <FormGroup>
            <Label for="mineral_amount">
              {t("mineral_amount") || "Mineral Amount"} *
            </Label>
            <Input
              id="mineral_amount"
              name="mineral_amount"
              type="number"
              placeholder={t("enter_mineral_amount") || "Enter mineral amount"}
              value={formData.mineral_amount}
              onChange={handleChange}
              required
              disabled={loading}
              min="0"
              step="1"
            />
          </FormGroup>
        </Col>
        
        {/* Unit Price */}
        <Col md="3">
          <FormGroup>
            <Label for="unit_price">
              {t("unit_price") || "Unit Price"} *
            </Label>
            <Input
              id="unit_price"
              name="unit_price"
              type="number"
              step="0.01"
              placeholder={t("enter_unit_price") || "Enter unit price"}
              value={formData.unit_price}
              onChange={handleChange}
              required
              disabled={loading}
              min="0"
            />
          </FormGroup>
        </Col>
        
        {/* Mineral Total Price (Auto-calculated) */}
        <Col md="3">
          <FormGroup>
            <Label for="mineral_total_price">
              {t("mineral_total_price") || "Mineral Total Price"}
            </Label>
            <Input
              id="mineral_total_price"
              name="mineral_total_price"
              type="number"
              step="0.01"
              value={formData.mineral_total_price}
              readOnly
              disabled={loading}
              className="bg-light"
              placeholder={t("auto_calculated") || "Auto-calculated"}
            />
          </FormGroup>
        </Col>
        
        {/* Royalty Receipt Number */}
        <Col md="3">
          <FormGroup>
            <Label for="royalty_receipt_number">
              {t("royalty_receipt_number") || "Royalty Receipt Number"}
            </Label>
            <Input
              id="royalty_receipt_number"
              name="royalty_receipt_number"
              type="number"
              placeholder={t("enter_royalty_receipt_number") || "Enter royalty receipt number"}
              value={formData.royalty_receipt_number}
              onChange={handleChange}
              disabled={loading}
              min="0"
              step="1"
            />
          </FormGroup>
        </Col>
        
        {/* Weighing Total Price */}
        <Col md="3">
          <FormGroup>
            <Label for="weighing_total_price">
              {t("weighing_total_price") || "Weighing Total Price"}
            </Label>
            <Input
              id="weighing_total_price"
              name="weighing_total_price"
              type="number"
              placeholder={t("enter_weighing_total_price") || "Enter weighing total price"}
              value={formData.weighing_total_price}
              onChange={handleChange}
              disabled={loading}
              min="0"
              step="1"
            />
          </FormGroup>
        </Col>
        
        {/* Haq Wazan Receipt Number */}
        <Col md="3">
          <FormGroup>
            <Label for="haq_wazan_receipt_number">
              {t("haq_wazan_receipt_number") || "Haq Wazan Receipt Number"}
            </Label>
            <Input
              id="haq_wazan_receipt_number"
              name="haq_wazan_receipt_number"
              type="number"
              placeholder={t("enter_haq_wazan_receipt_number") || "Enter Haq Wazan receipt number"}
              value={formData.haq_wazan_receipt_number}
              onChange={handleChange}
              disabled={loading}
              min="0"
              step="1"
            />
          </FormGroup>
        </Col>
        
        {/* Company Dropdown - Auto-selected when from company view */}
        <Col md="3">
          <FormGroup>
            <Label for="company">
              {t("company") || "Company"}
            </Label>
            <Input
              id="company"
              name="company"
              type="select"
              value={formData.company}
              onChange={handleChange}
              disabled={loading || (selectedCompany && selectedCompany.id)} // Disable if auto-selected
            >
              <option value="">{t("select_company") || "Select Company"}</option>
              {companies && companies.length > 0 ? (
                companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {getDisplayName(company)}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  {t("no_companies_available") || "No companies available"}
                </option>
              )}
            </Input>
            {selectedCompany && selectedCompany.id && (
              <Alert color="info" className="mt-1 p-2">
                <small>{t("auto_selected_company") || "Company auto-selected:"} <strong>{getSelectedCompanyName()}</strong></small>
              </Alert>
            )}
            {(!companies || companies.length === 0) && (
              <Alert color="warning" className="mt-1 p-2">
                <small>{t("no_companies_found") || "No companies found. Please add companies first."}</small>
              </Alert>
            )}
          </FormGroup>
        </Col>
        
        {/* Maktoob Dropdown - Filtered by company */}
        <Col md="3">
          <FormGroup>
            <Label for="maktoob">
              {t("maktoob") || "Maktoob"}
            </Label>
            <Input
              id="maktoob"
              name="maktoob"
              type="select"
              value={formData.maktoob}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">{t("select_maktoob") || "Select Maktoob"}</option>
              {maktoobs && maktoobs.length > 0 ? (
                maktoobs.map(maktoob => (
                  <option key={maktoob.id} value={maktoob.id}>
                    {getDisplayName(maktoob)}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  {t("no_maktoobs_available") || "No maktoobs available"}
                </option>
              )}
            </Input>
            {(!maktoobs || maktoobs.length === 0) && (
              <Alert color="warning" className="mt-1 p-2">
                <small>
                  {selectedCompany && selectedCompany.id 
                    ? t("no_maktoobs_for_company") || `No maktoobs found for this company. Please add maktoobs first.`
                    : t("no_maktoobs_found") || "No maktoobs found. Please select a company first."}
                </small>
              </Alert>
            )}
          </FormGroup>
        </Col>
        
        {/* Mineral Dropdown */}
        <Col md="3">
          <FormGroup>
            <Label for="mineral">
              {t("mineral") || "Mineral"}
            </Label>
            <Input
              id="mineral"
              name="mineral"
              type="select"
              value={formData.mineral}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">{t("select_mineral") || "Select Mineral"}</option>
              {minerals && minerals.length > 0 ? (
                minerals.map(mineral => (
                  <option key={mineral.id} value={mineral.id}>
                    {getDisplayName(mineral)}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  {t("no_minerals_available") || "No minerals available"}
                </option>
              )}
            </Input>
            {(!minerals || minerals.length === 0) && (
              <Alert color="warning" className="mt-1 p-2">
                <small>{t("no_minerals_found") || "No minerals found. Please add minerals first."}</small>
              </Alert>
            )}
          </FormGroup>
        </Col>
        
        {/* Scale Dropdown - Hidden if hideScaleField is true */}
        {!hideScaleField && (
          <Col md="3">
            <FormGroup>
              <Label for="scale">
                {t("scale") || "Scale"}
              </Label>
              <Input
                id="scale"
                name="scale"
                type="select"
                value={formData.scale}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">{t("select_scale") || "Select Scale"}</option>
                {scales && scales.length > 0 ? (
                  scales.map(scale => (
                    <option key={scale.id} value={scale.id}>
                      {getDisplayName(scale)}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    {t("no_scales_available") || "No scales available"}
                  </option>
                )}
              </Input>
              {(!scales || scales.length === 0) && (
                <Alert color="warning" className="mt-1 p-2">
                  <small>{t("no_scales_found") || "No scales found. Please add scales first."}</small>
                </Alert>
              )}
            </FormGroup>
          </Col>
        )}
        
        {/* Unit Dropdown */}
        <Col md="3">
          <FormGroup>
            <Label for="unit">
              {t("unit") || "Unit"}
            </Label>
            <Input
              id="unit"
              name="unit"
              type="select"
              value={formData.unit}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">{t("select_unit") || "Select Unit"}</option>
              {units && units.length > 0 ? (
                units.map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {getDisplayName(unit)}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  {t("no_units_available") || "No units available"}
                </option>
              )}
            </Input>
            {(!units || units.length === 0) && (
              <Alert color="warning" className="mt-1 p-2">
                <small>{t("no_units_found") || "No units found. Please add units first."}</small>
              </Alert>
            )}
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
          {t("cancel") || "Cancel"}
        </Button>
        <Button
          color="primary"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" />
              {isEdit ? t("updating") || "Updating..." : t("adding") || "Adding..."}
            </>
          ) : (
            isEdit ? t("update_purchase") || "Update Purchase" : t("add_purchase") || "Add Purchase"
          )}
        </Button>
      </div>
    </Form>
  );
};

export default AddNewPurchase;