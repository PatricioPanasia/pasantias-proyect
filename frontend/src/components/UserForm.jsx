import { useState, useEffect } from "react";
import Button from "./Button";
import "../styles/UserForm.css";

// ✅ Lista de países con prefijos
const countries = [
  { code: "AR", name: "Argentina (+54)", prefix: "+54" },
  { code: "MX", name: "México (+52)", prefix: "+52" },
  { code: "ES", name: "España (+34)", prefix: "+34" },
  { code: "CO", name: "Colombia (+57)", prefix: "+57" },
  { code: "CL", name: "Chile (+56)", prefix: "+56" },
  { code: "PE", name: "Perú (+51)", prefix: "+51" },
  { code: "BR", name: "Brasil (+55)", prefix: "+55" },
  { code: "US", name: "Estados Unidos (+1)", prefix: "+1" },
  { code: "UK", name: "Reino Unido (+44)", prefix: "+44" },
  { code: "DE", name: "Alemania (+49)", prefix: "+49" },
  { code: "FR", name: "Francia (+33)", prefix: "+33" },
  { code: "IT", name: "Italia (+39)", prefix: "+39" },
  { code: "UY", name: "Uruguay (+598)", prefix: "+598" },
  { code: "PY", name: "Paraguay (+595)", prefix: "+595" },
  { code: "BO", name: "Bolivia (+591)", prefix: "+591" },
  { code: "EC", name: "Ecuador (+593)", prefix: "+593" },
  { code: "VE", name: "Venezuela (+58)", prefix: "+58" },
  { code: "CR", name: "Costa Rica (+506)", prefix: "+506" },
  { code: "PA", name: "Panamá (+507)", prefix: "+507" },
  { code: "DO", name: "Rep. Dominicana (+1)", prefix: "+1" }
];

export default function UserForm({ onSubmit, initialData, onCancelEdit, isEditing }) {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    direccion: "",
    telefono: "",
    celular: "",
    celular_pais: "AR",
    fecha_nacimiento: "",
    email: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // ✅ Efecto para manejar los datos iniciales
  useEffect(() => {
    if (initialData) {
      const fecha = initialData.fecha_nacimiento
        ? new Date(initialData.fecha_nacimiento).toISOString().split("T")[0]
        : "";
      setForm({ 
        ...initialData, 
        fecha_nacimiento: fecha,
        celular_pais: initialData.celular_pais || "AR"
      });
    } else {
      resetForm();
    }
  }, [initialData]);

  // ✅ Resetear formulario
  const resetForm = () => {
    setForm({
      nombre: "",
      apellido: "",
      direccion: "",
      telefono: "",
      celular: "",
      celular_pais: "AR",
      fecha_nacimiento: "",
      email: "",
    });
    setErrors({});
    setTouched({});
  };

  const handleCancel = () => {
    resetForm();
    onCancelEdit();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleCountryChange = (e) => {
    const countryCode = e.target.value;
    setForm(prev => ({ ...prev, celular_pais: countryCode }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateField = (name, value) => {
    switch (name) {
      case "nombre":
        if (!value.trim()) return "El nombre es obligatorio";
        if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(value)) return "Solo letras";
        if (value.length < 2) return "Mínimo 2 caracteres";
        return null;
      case "apellido":
        if (!value.trim()) return "El apellido es obligatorio";
        if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(value)) return "Solo letras";
        if (value.length < 2) return "Mínimo 2 caracteres";
        return null;
      case "direccion":
        if (!value.trim()) return "La dirección es obligatoria";
        if (value.length < 5) return "Mínimo 5 caracteres";
        return null;
      case "telefono":
        if (!value.trim()) return "El teléfono es obligatorio";
        if (!/^[0-9]+$/.test(value)) return "Solo números";
        return null;
      case "celular":
        if (!value.trim()) return "El celular es obligatorio";
        if (!/^[0-9]+$/.test(value)) return "Solo números";
        if (value.length < 10) return "Mínimo 10 dígitos";
        return null;
      case "fecha_nacimiento":
        if (!value) return "La fecha de nacimiento es obligatoria";
        const fechaNac = new Date(value);
        if (fechaNac > new Date()) return "No puede ser futura";
        return null;
      case "email":
        if (!value.trim()) return "El email es obligatorio";
        if (!value.endsWith("@gmail.com")) return "Debe terminar con @gmail.com";
        return null;
      default:
        return null;
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(form).forEach(key => {
      if (key !== 'celular_pais') {
        const error = validateField(key, form[key]);
        if (error) newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    setTouched(Object.keys(form).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(form);
      if (!isEditing) resetForm();
    }
  };

  const getMaxDate = () => new Date().toISOString().split('T')[0];

  const getSelectedPrefix = () => {
    const country = countries.find(c => c.code === form.celular_pais);
    return country ? country.prefix : "+54";
  };

  return (
    <form onSubmit={handleSubmit} className="user-form">
      <div className="form-grid-three-columns">
        {/* ===== COLUMNA IZQUIERDA ===== */}
        <div className="form-column">
          {/* Nombre */}
          <div className="form-field">
            <label htmlFor="nombre">NOMBRE</label>
            <input
              id="nombre"
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Ej: Juan Carlos"
              className={errors.nombre ? "error" : ""}
            />
            {errors.nombre && <span className="error-message">{errors.nombre}</span>}
          </div>

          {/* Dirección */}
          <div className="form-field">
            <label htmlFor="direccion">DIRECCIÓN</label>
            <input
              id="direccion"
              type="text"
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Ej: Av. Siempre Viva 123"
              className={errors.direccion ? "error" : ""}
            />
            {errors.direccion && <span className="error-message">{errors.direccion}</span>}
          </div>

          {/* Celular */}
          <div className="form-field">
            <label htmlFor="celular">CELULAR</label>
            <div className="phone-input-container">
              <select 
                className="country-select"
                value={form.celular_pais}
                onChange={handleCountryChange}
              >
                {countries.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
              <div className="phone-prefix">{getSelectedPrefix()}</div>
              <input
                id="celular"
                type="text"
                name="celular"
                value={form.celular}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="91123456789"
                className={errors.celular ? "error" : ""}
              />
            </div>
            {errors.celular && <span className="error-message">{errors.celular}</span>}
          </div>
        </div>

        {/* ===== COLUMNA DERECHA ===== */}
        <div className="form-column">
          {/* Apellido */}
          <div className="form-field">
            <label htmlFor="apellido">APELLIDO</label>
            <input
              id="apellido"
              type="text"
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Ej: Pérez González"
              className={errors.apellido ? "error" : ""}
            />
            {errors.apellido && <span className="error-message">{errors.apellido}</span>}
          </div>

          {/* Email */}
          <div className="form-field">
            <label htmlFor="email">
              EMAIL
              <span className="field-info"> (@gmail.com)</span>
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Ej: usuario.ejemplo@gmail.com"
              className={errors.email ? "error" : ""}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {/* Teléfono + Fecha de Nacimiento */}
          <div className="form-row">
            <div className="form-field half-width">
              <label htmlFor="telefono">TELÉFONO FIJO</label>
              <input
                id="telefono"
                type="text"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Ej: 01147855555"
                className={errors.telefono ? "error" : ""}
              />
              {errors.telefono && <span className="error-message">{errors.telefono}</span>}
            </div>

            <div className="form-field half-width">
              <label htmlFor="fecha_nacimiento">
                FECHA NACIMIENTO
                <span className="field-info"></span>
              </label>
              <input
                id="fecha_nacimiento"
                type="date"
                name="fecha_nacimiento"
                value={form.fecha_nacimiento}
                onChange={handleChange}
                onBlur={handleBlur}
                max={getMaxDate()}
                className={errors.fecha_nacimiento ? "error" : ""}
              />
              {errors.fecha_nacimiento && <span className="error-message">{errors.fecha_nacimiento}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="form-actions">
        {isEditing && (
          <Button type="button" color="gray" onClick={handleCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" color="blue">
          {isEditing ? "Actualizar" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
