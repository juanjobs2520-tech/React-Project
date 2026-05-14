import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { User } from "../../models/User";

interface MyFormProps {
    mode: number; // 1 (crear) o 2 (actualizar), solo para texto/estilos
    handleAction: (values: User) => void;
    user?: User | null;
}

const UserFormValidator: React.FC<MyFormProps> = ({ mode, handleAction, user }) => {
    const initialRole = user?.role || "STUDENT";

    return (
        <Formik
            enableReinitialize
            initialValues={{
                code: user?.code || "",
                email: user?.email || "",
                password: "",
                role: initialRole,
                first_name: user?.first_name || user?.name || "",
                last_name: user?.last_name || "",
                identification: user?.identification || "",
                phone: user?.phone || "",
                specialty: user?.specialty || "",
            }}
            validationSchema={Yup.object({
                code: Yup.string().required("El código es obligatorio"),
                email: Yup.string()
                    .email("Email inválido")
                    .required("El email es obligatorio"),
                password:
                    mode === 1
                        ? Yup.string().required("La contraseña es obligatoria")
                        : Yup.string(),
                role: Yup.string()
                    .oneOf(["STUDENT", "TEACHER"], "Selecciona un rol válido")
                    .required("El rol es obligatorio"),
                first_name: Yup.string().required("El nombre es obligatorio"),
                last_name: Yup.string().required("El apellido es obligatorio"),
                identification: Yup.string().required("La identificación es obligatoria"),
                phone: Yup.string().when("role", {
                    is: "TEACHER",
                    then: Yup.string()
                        .matches(/^\d{10}$/, "El teléfono debe tener 10 dígitos")
                        .required("El teléfono es obligatorio para docentes"),
                    otherwise: Yup.string(),
                }),
                specialty: Yup.string().when("role", {
                    is: "TEACHER",
                    then: Yup.string().required("La especialidad es obligatoria"),
                    otherwise: Yup.string(),
                }),
            })}
            onSubmit={(values) => {
                handleAction(values as User);
            }}
        >
            {({ handleSubmit, values }) => (
                <Form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 gap-4 p-6 bg-white rounded-md shadow-md"
                >
                    <div>
                        <label htmlFor="code" className="block text-lg font-medium text-gray-700">
                            Código
                        </label>
                        <Field type="text" name="code" className="w-full border rounded-md p-2" />
                        <ErrorMessage name="code" component="p" className="text-red-500 text-sm" />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-lg font-medium text-gray-700">
                            Email
                        </label>
                        <Field type="email" name="email" className="w-full border rounded-md p-2" />
                        <ErrorMessage name="email" component="p" className="text-red-500 text-sm" />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-lg font-medium text-gray-700">
                            Contraseña
                        </label>
                        <Field
                            type="password"
                            name="password"
                            className="w-full border rounded-md p-2"
                            placeholder={
                                mode === 2
                                    ? "Déjalo en blanco para mantener la contraseña"
                                    : "Escribe una contraseña"
                            }
                        />
                        <ErrorMessage name="password" component="p" className="text-red-500 text-sm" />
                    </div>

                    <div>
                        <label htmlFor="role" className="block text-lg font-medium text-gray-700">
                            Rol
                        </label>
                        <Field as="select" name="role" className="w-full border rounded-md p-2">
                            <option value="STUDENT">ESTUDIANTE</option>
                            <option value="TEACHER">DOCENTE</option>
                        </Field>
                        <ErrorMessage name="role" component="p" className="text-red-500 text-sm" />
                    </div>

                    <div>
                        <label htmlFor="first_name" className="block text-lg font-medium text-gray-700">
                            Nombre
                        </label>
                        <Field type="text" name="first_name" className="w-full border rounded-md p-2" />
                        <ErrorMessage name="first_name" component="p" className="text-red-500 text-sm" />
                    </div>

                    <div>
                        <label htmlFor="last_name" className="block text-lg font-medium text-gray-700">
                            Apellido
                        </label>
                        <Field type="text" name="last_name" className="w-full border rounded-md p-2" />
                        <ErrorMessage name="last_name" component="p" className="text-red-500 text-sm" />
                    </div>

                    <div>
                        <label htmlFor="identification" className="block text-lg font-medium text-gray-700">
                            Identificación
                        </label>
                        <Field type="text" name="identification" className="w-full border rounded-md p-2" />
                        <ErrorMessage name="identification" component="p" className="text-red-500 text-sm" />
                    </div>

                    {values.role === "TEACHER" && (
                        <>
                            <div>
                                <label htmlFor="phone" className="block text-lg font-medium text-gray-700">
                                    Teléfono
                                </label>
                                <Field type="text" name="phone" className="w-full border rounded-md p-2" />
                                <ErrorMessage name="phone" component="p" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <label htmlFor="specialty" className="block text-lg font-medium text-gray-700">
                                    Especialidad
                                </label>
                                <Field type="text" name="specialty" className="w-full border rounded-md p-2" />
                                <ErrorMessage name="specialty" component="p" className="text-red-500 text-sm" />
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        className={`inline-flex items-center justify-center rounded-full py-2 px-6 text-center font-medium text-white hover:bg-opacity-90 transition ${
                            mode === 1 ? "bg-primary" : "bg-meta-3"
                        }`}
                    >
                        {mode === 1 ? "Crear" : "Actualizar"}
                    </button>
                </Form>
            )}
        </Formik>
    );
};

export default UserFormValidator;