import React, { useEffect, useState } from "react";
import { User } from "../../models/User";
import GenericTable from "../../components/GenericTable";
import { userService } from "../../services/userService";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";

const Users: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const users = await userService.getUsers();
            setData(users);
        } catch (fetchError) {
            console.error("Error fetching users:", fetchError);
            setError("No se pudieron cargar los usuarios. Intenta de nuevo más tarde.");
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (action: string, item: User) => {
        if (action === "edit") {
            console.log("Edit user:", item);
            navigate(`/users/update/${item.id}`);
        } else if (action === "delete") {
            console.log("Delete user:", item);
            deleteUser(item.id ? item.id : 0);
        }
    };

    const deleteUser = async (id: number) => {
        Swal.fire({
            title: '¿Estás seguro que quiere eliminar?',
            text: "¡No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',

        }).then(async (result) => {
            if (result.isConfirmed) {
                const success = await userService.deleteUser(id);
                if (success) {
                    // Refrescar la lista de usuarios después de eliminar
                    Swal.fire(
                        '¡Eliminado!',
                        'El usuario ha sido eliminado.',
                        'success'
                    );
                    fetchData();
                } else {
                    console.error("Error al eliminar el usuario con id:", id);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo eliminar el usuario. Por favor, inténtalo de nuevo.',
                    });
                }
            }
        });

    }

    const handleCreate = () => {
        navigate("/users/create");
    };

    return (
        <div>
            <Breadcrumb pageName="Lista de Usuarios" />

            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold text-black dark:text-white">Usuarios</h2>
                <button
                    onClick={handleCreate}
                    className="inline-flex items-center justify-center bg-primary py-2 px-4 text-sm font-medium text-white rounded-md hover:bg-opacity-90 transition"
                >
                    Crear usuario
                </button>
            </div>

            {loading ? (
                <div className="rounded-sm border border-stroke bg-white p-6 text-center text-sm text-gray-600 dark:bg-boxdark dark:text-white">
                    Cargando usuarios...
                </div>
            ) : error ? (
                <div className="rounded-sm border border-red-300 bg-red-50 p-6 text-center text-sm text-red-700 dark:bg-red-200 dark:text-red-900">
                    {error}
                </div>
            ) : data.length === 0 ? (
                <div className="rounded-sm border border-stroke bg-white p-6 text-center text-sm text-gray-600 dark:bg-boxdark dark:text-white">
                    No se encontraron usuarios.
                </div>
            ) : (
                <GenericTable
                    data={data}
                    columns={["id", "name", "email"]}
                    actions={[
                        { name: "edit", label: "Editar" },
                        { name: "delete", label: "Eliminar" },
                    ]}
                    onAction={handleAction}
                />
            )}
        </div>
    );
};

export default Users;
