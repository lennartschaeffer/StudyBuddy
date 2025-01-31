import axios from "axios"

export const getAllUsers = async (user_id: number) => {
    try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/getAllUsers/${user_id}`,{
            withCredentials: true
        })
        return res.data
    } catch (error) {
        throw new Error("Failed to fetch users")
        console.error("Failed to fetch users", error)
    }
}