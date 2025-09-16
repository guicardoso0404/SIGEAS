import { useAuth } from "../../context/AuthContext";

export default function PrivateRoute() {
  const { user } = useAuth()

  return user ? <div>Rota Privada</div> : <div>Você não tem acesso a essa rota</div>
}
