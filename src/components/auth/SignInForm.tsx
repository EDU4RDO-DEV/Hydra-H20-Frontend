import { useState } from "react";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import AuthService from "../../services/authService";
import { useNavigate } from "react-router-dom";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Obtener información del dispositivo (simplificado)
      const deviceInfo = {
        ip: "127.0.0.1", // En una app real, obtendrías esto de una API o librería
        deviceName: navigator.userAgent,
        latitude: 0,
        longitude: 0,
        accuracy: 0
      };

      const loginResponse = await AuthService.login(
        formData.username,
        formData.password,
        deviceInfo
      );
      console.log(loginResponse);
      if (loginResponse.success) {
        navigate("/home");
      } else {
        setError(loginResponse.message);
      }
    } catch (err) {
      setError("Credenciales incorrectas. Por favor, inténtalo de nuevo.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Iniciar Sesión
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Inicia sesión en tu cuenta para acceder a la plataforma.
            </p>
          </div>
          <div>
            {error && (
              <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Usuario <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input 
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="nombre@ejemplo.com" 
                  />
                </div>
                <div>
                  <Label>
                    Contraseña <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Ingresa tu contraseña"
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                <div>
                  <Button 
                    className="w-full" 
                    size="sm"
                    disabled={loading}
                  >
                    {loading ? "Cargando..." : "Iniciar Sesión"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}