import React, { useState } from "react";
import { useSkin } from "@hooks/useSkin";
import { Link, useNavigate } from "react-router-dom";
import { Row, Col, CardTitle, CardText, Form, Label, Input, Button, Alert } from "reactstrap";
import { useTranslation } from "react-i18next"; // Added
import AuthService from "../services/auth";
import "@styles/react/pages/page-authentication.scss";

const Login = () => {
  const { skin } = useSkin();
  const navigate = useNavigate();
  const { t } = useTranslation(); // Added
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      AuthService.logout();
      
      const response = await AuthService.login(username, password);
      
      if (response.access) {
        console.log("Login successful:", response);
        
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        
        navigate("/home");
        window.location.reload();
      }
    } catch (err) {
      console.error("Login error:", err);
      
      if (err.response) {
        if (err.response.status === 401) {
          setError(t("login.error.invalid_credentials"));
        } else if (err.response.data && err.response.data.detail) {
          setError(err.response.data.detail);
        } else if (err.response.data && err.response.data.error) {
          setError(err.response.data.error);
        } else if (err.response.data && typeof err.response.data === 'string') {
          setError(err.response.data);
        } else if (err.response.data && err.response.data.non_field_errors) {
          setError(err.response.data.non_field_errors.join(', '));
        } else {
          setError(t("login.error.general"));
        }
      } else if (err.request) {
        setError(t("login.error.server"));
      } else {
        setError(t("login.error.network"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper auth-cover" style={{ minHeight: "100%" }}>
      <Row className="auth-inner m-0 w-100 justify-content-center align-items-center">
        <Link className="brand-logo" to="/" onClick={(e) => e.preventDefault()}>
          <h2 className="brand-text text-primary ms-1">Weighing Scale</h2>
        </Link>
        
        <Col className="d-flex align-items-center auth-bg px-200 p-lg-5" lg="3" sm="12">
          <Col className="px-xl-2 mx-auto" sm="8" md="6" lg="12">
            <CardTitle tag="h2" className="fw-bold mb-1" style={{ textAlign: "center" }}>
              {t("login.title")}
            </CardTitle>
            
            <CardText className="mb-2" style={{ textAlign: "center" }}>
              {t("login.subtitle")}
            </CardText>
            
            {error && (
              <Alert color="danger" className="text-center">
                {error}
              </Alert>
            )}
            
            <Form className="auth-login-form mt-2" onSubmit={handleLogin}>
              <div className="mb-1">
                <Label className="form-label" for="login-username">
                  {t("login.username")}
                </Label>
                <Input
                  type="text"
                  id="login-username"
                  placeholder={t("login.username_placeholder")}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="mb-1">
                <div className="d-flex justify-content-between">
                  <Label className="form-label" for="login-password">
                    {t("login.password")}
                  </Label>
              
                </div>
                <Input
                  type="password"
                  id="login-password"
                  placeholder={t("login.password_placeholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <Button 
                type="submit" 
                color="primary" 
                block 
                disabled={loading}
                style={{ marginTop: '20px' }}
              >
                {loading ? t("login.loading") : t("login.button")}
              </Button>
            </Form>
          </Col>
        </Col>
      </Row>
    </div>
  );
};

export default Login;