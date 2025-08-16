
import PageMeta from "../../components/common/PageMeta";
import { Link } from "react-router-dom";

type CardModuloProps = { nombre: string; icono: string; ruta: string; color: string };
const CardModulo: React.FC<CardModuloProps> = ({ nombre, icono, ruta, color }) => (
  <Link to={ruta} className={`flex flex-col items-center justify-center rounded-xl shadow-md p-6 transition hover:scale-105 hover:shadow-lg ${color} cursor-pointer`} style={{ minHeight: 160 }}>
    <img src={`/src/icons/${icono}.svg`} alt={nombre} className="w-12 h-12 mb-3" />
    <span className="font-semibold text-lg text-center">{nombre}</span>
  </Link>
);

// CardModulo: componente interno para las tarjetas de acceso rápido

export default function Home() {
  return (
    <>
      <PageMeta
        title="Bienvenido | Agua Viva - Purificadora de Agua"
        description="Pantalla de bienvenida para el sistema de gestión Agua Viva."
      />
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <img
          src="https://cdn-icons-png.flaticon.com/512/728/728093.png"
          alt="Logo Agua Viva"
          className="w-24 h-24 mb-6"
        />
        <h1 className="text-3xl font-bold text-brand-700 mb-4">¡Bienvenido a Agua Viva!</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl text-center mb-8">
          Este es el sistema de gestión para la purificadora de agua <b>Agua Viva</b>.<br />
          Administra tus clientes, ventas y operaciones de manera eficiente y sencilla.<br />
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {/* Tarjetas de módulos */}
          <CardModulo nombre="Administración de usuarios" icono="user-circle" ruta="/admin/users" color="bg-blue-100 text-blue-700" />
          <CardModulo nombre="Empleados" icono="group" ruta="/admin/employees" color="bg-cyan-100 text-cyan-700" />
          <CardModulo nombre="Clientes" icono="user-line" ruta="/clientes" color="bg-green-100 text-green-700" />
          <CardModulo nombre="Proveedores" icono="box-cube" ruta="/proveedores" color="bg-amber-100 text-amber-700" />
          <CardModulo nombre="Inventario" icono="box" ruta="/inventario" color="bg-purple-100 text-purple-700" />
          <CardModulo nombre="Compras" icono="dollar-line" ruta="/compras" color="bg-pink-100 text-pink-700" />
          <CardModulo nombre="Ventas" icono="pie-chart" ruta="/ventas" color="bg-teal-100 text-teal-700" />
          <CardModulo nombre="Producción" icono="gota-agua" ruta="/produccion" color="bg-indigo-100 text-indigo-700" />
        </div>
      </div>
    </>
  );
}
