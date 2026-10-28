import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router";
import React from 'react'

const Protected = ({ children }) => {
    const { loading, user } = useAuth()

    // Wait silently while the session is being resolved
    if (loading) {
        return null
    }

    if (!user) {
        return <Navigate to={'/login'} />
    }

    return children
}

export default Protected