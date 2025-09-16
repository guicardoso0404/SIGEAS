import { createContext, useContext, useState } from "react";
import type { User } from "../types/Usertypes"

type AuthContextType = {
    user: User | null;
    // token: string | null;
    login: (email: string, password: string) => void
    logout: () => void;
}
// “confia que sempre vai existir um valor válido”
const AuthContxt = createContext<AuthContextType>({} as AuthContextType)

export const useAuth = () => useContext(AuthContxt)

// estou tipando o children como React.ReactNode pq pode ser qualquer coisa ( qualquer elemento React)
export default function AuthProvider({children} : {children: React.ReactNode}) {
    // state vai utilizar ou null ou os dados do user que estão definidos no type User
    const [user, setUser] = useState<User | null>(null)
    

    function login(email: string, password: string){
        if(email === "peda@gmail.com" && password === "1234"){
            setUser({ idUser: 1,userName: "Pedagogo", email: "pedagogo@gmail.com", age: 20,
                role: "pedagogue", managedClasses: [1, 2]
            })
        }

        if (email === 'prof@sig.com') {
            setUser({ idUser: 2, userName: 'Professor', email, age: 30, role: 'teacher', subjects: [] })
        }
        if (email === 'aluno@sig.com') {
            setUser({ idUser: 3, userName: 'Aluno', email, age: 18, role: 'student', course: 'TI' })
            }
        }

    function logOut(){
        setUser(null)
    }

    return (
        <AuthContxt.Provider value={{user, login, logout: logOut}}>
            {children}
        </AuthContxt.Provider>
    )
}