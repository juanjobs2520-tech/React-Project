import React from 'react';
import { User } from '../../models/User';
import UserFormValidator from '../../components/users/UserFormValidator';

import Swal from 'sweetalert2';
import { userService } from "../../services/userService";
import Breadcrumb from '../../components/Breadcrumb';
import { useNavigate } from "react-router-dom";

const App = () => {
    const navigate = useNavigate();

    const handleCreateUser = async (user: Partial<User>) => {
        try {
            const createdUser = await userService.createUser(user);
            if (createdUser) {
                Swal.fire({
                    title: "Completado",
                    text: "Se ha creado correctamente el registro",
                    icon: "success",
                    timer: 3000
                });
                console.log("Usuario creado con éxito:", createdUser);
                navigate("/users/list");
            }
        } catch (error: any) {
            const message = error?.response?.data?.message || "Existe un problema al momento de crear el registro";
            Swal.fire({
                title: "Error",
                text: message,
                icon: "error",
                timer: 3000
            });
        }
    };
    return (
        <div>
            {/* Formulario para crear un nuevo usuario */}
            <Breadcrumb pageName="Crear Usuario" />
            <UserFormValidator
                handleAction={handleCreateUser}
                mode={1} // 1 significa creación
            />
        </div>
    );
};

export default App;

