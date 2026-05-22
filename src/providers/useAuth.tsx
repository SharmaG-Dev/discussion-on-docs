import React, { createContext, useContext, useId, useState } from "react";
import { v4 as uuidv4 } from 'uuid'

type AuthContextProps = {
    user: {
        id: string
    },
    init: () => void
}




const AuthContext = createContext<AuthContextProps | null>(null)


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const id = uuidv4()
    const [user, setUser] = useState<AuthContextProps['user']>({ id: '' })


    const init = () => {
        if (!user.id) {
            setUser({ id })
            if (typeof localStorage !== "undefined") {
                localStorage.setItem('user', JSON.stringify({ id }))
            }
        }
    }


    return <AuthContext.Provider value={{ user, init }}>
        {children}
    </AuthContext.Provider>
}


export const useAuth = () => useContext(AuthContext)