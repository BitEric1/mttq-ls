import axiosClient from './axiosClient'

export const getNearbyEmergencyContacts = async ({ latitude, longitude }) => {
    const response = await axiosClient.get('/emergency/nearby', {
        params: {
            latitude,
            longitude,
        },
    })

    return response.data
}

export const getEmergencyDetail = async (id) => {
    const response = await axiosClient.get(`/emergency/${id}`)

    return response.data
}

export const logEmergencyCall = async (id, payload) => {
    const response = await axiosClient.post(
        `/emergency/${id}/call-log`,
        payload,
    )

    return response.data
}
