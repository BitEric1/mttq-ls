// src/pages/Emergency/detail.jsx

import { useEffect, useState } from 'react'

import { useNavigate, useParams } from 'react-router-dom'

import { openPhone } from 'zmp-sdk/apis'

import {
    AlertTriangle,
    Ambulance,
    Clock3,
    Flame,
    MapPin,
    Navigation,
    Phone,
    Shield,
} from 'lucide-react'

import { Box, Header, Page, Spinner, useSnackbar } from 'zmp-ui'

import {
    getEmergencyDetail,
    logEmergencyCall,
} from '../../services/emergencyApi'

import { getCurrentLocation } from '../../shared/location/locationService'

const EmergencyDetailPage = () => {
    const { id } = useParams()

    const navigate = useNavigate()

    const snackbar = useSnackbar()

    const [loading, setLoading] = useState(true)

    const [contact, setContact] = useState(null)

    const [userLocation, setUserLocation] = useState(null)

    /**
     * ==========================================
     * LOAD DATA
     * ==========================================
     */
    useEffect(() => {
        let mounted = true

        const loadData = async () => {
            try {
                setLoading(true)

                const [location, response] = await Promise.all([
                    getCurrentLocation(),
                    getEmergencyDetail(id),
                ])

                if (!mounted) return

                setUserLocation(location)

                /**
                 * API FORMAT:
                 * {
                 *   success: true,
                 *   data: {...}
                 * }
                 */
                const detail = response?.data || response || null

                setContact(detail)
            } catch (error) {
                console.error(error)

                snackbar.openSnackbar({
                    type: 'error',
                    text: 'Không tải được dữ liệu',
                })
            } finally {
                if (mounted) {
                    setLoading(false)
                }
            }
        }

        loadData()

        return () => {
            mounted = false
        }
    }, [id])

    /**
     * ==========================================
     * TYPE CONFIG
     * ==========================================
     */
    const getTypeConfig = (type) => {
        switch (type) {
            case 'Police':
                return {
                    icon: Shield,
                    color: 'text-blue-600',
                    bg: 'bg-blue-50',
                    label: 'Công an',
                }

            case 'Medical':
            case 'Ambulance':
                return {
                    icon: Ambulance,
                    color: 'text-green-600',
                    bg: 'bg-green-50',
                    label: 'Y tế',
                }

            case 'FireRescue':
                return {
                    icon: Flame,
                    color: 'text-red-600',
                    bg: 'bg-red-50',
                    label: 'PCCC & Cứu hộ',
                }

            default:
                return {
                    icon: AlertTriangle,
                    color: 'text-orange-600',
                    bg: 'bg-orange-50',
                    label: 'Khẩn cấp',
                }
        }
    }

    /**
     * ==========================================
     * CALL HANDLER
     * ==========================================
     */
    const handleCall = async () => {
        try {
            /**
             * LOG BACKGROUND
             */
            logEmergencyCall(contact.id, {
                latitude: userLocation?.latitude || null,
                longitude: userLocation?.longitude || null,
                clientIdentifier: navigator.userAgent || 'unknown-device',
            }).catch((error) => {
                console.error('Emergency log failed:', error)
            })

            /**
             * DEV ENVIRONMENT
             */
            const hostname = window.location.hostname

            const isDevEnvironment =
                hostname === 'localhost' || hostname === '127.0.0.1'

            /**
             * DEV MODE
             */
            if (isDevEnvironment) {
                return snackbar.openSnackbar({
                    type: 'info',
                    text: `Môi trường phát triển không hỗ trợ gọi điện.\nSĐT: ${contact.phoneNumber}`,
                })
            }

            /**
             * PRODUCTION
             */
            try {
                await openPhone({
                    phoneNumber: contact.phoneNumber,
                })
            } catch (sdkError) {
                console.warn('openPhone failed:', sdkError)

                /**
                 * FALLBACK
                 */
                window.location.href = `tel:${contact.phoneNumber}`
            }
        } catch (error) {
            console.error(error)

            snackbar.openSnackbar({
                type: 'warning',
                text: 'Không thể mở trình gọi điện.',
            })
        }
    }

    /**
     * ==========================================
     * OPEN MAP
     * ==========================================
     */
    const handleOpenMap = () => {
        try {
            const mapUrl = `https://www.google.com/maps/search/?api=1&query=${contact.latitude},${contact.longitude}`

            window.open(mapUrl, '_blank')
        } catch (error) {
            console.error(error)

            snackbar.openSnackbar({
                type: 'warning',
                text: 'Không thể mở bản đồ.',
            })
        }
    }

    /**
     * ==========================================
     * LOADING
     * ==========================================
     */
    if (loading) {
        return (
            <Page className="bg-gray-100">
                <div className="h-screen flex items-center justify-center">
                    <Spinner visible />
                </div>
            </Page>
        )
    }

    /**
     * ==========================================
     * EMPTY
     * ==========================================
     */
    if (!contact?.id) {
        return (
            <Page className="bg-gray-100">
                <Header title="Chi tiết liên hệ" showBackIcon />

                <div className="h-[80vh] flex flex-col items-center justify-center px-6 text-center">
                    <AlertTriangle size={56} className="text-orange-500" />

                    <div className="mt-4 font-bold text-xl text-gray-800">
                        Không tìm thấy dữ liệu
                    </div>

                    <div className="text-sm text-gray-500 mt-2">
                        Liên hệ khẩn cấp không tồn tại hoặc đã bị vô hiệu hóa.
                    </div>

                    <button
                        onClick={() => navigate('/emergency')}
                        className="mt-6 h-11 px-5 rounded-2xl bg-red-600 text-white font-bold"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </Page>
        )
    }

    /**
     * ==========================================
     * CONFIG
     * ==========================================
     */
    const config = getTypeConfig(contact.type)

    const IconComponent = config.icon

    return (
        <Page className="bg-gray-100 min-h-screen">
            <Header title="Chi tiết liên hệ" showBackIcon />

            <Box className="pt-16 pb-24">
                {/* HERO */}
                <div className="bg-white rounded-b-3xl px-5 pb-6 shadow-sm">
                    <div className="pt-4">
                        <div
                            className={`w-20 h-20 rounded-3xl flex items-center justify-center ${config.bg}`}
                        >
                            <IconComponent size={42} className={config.color} />
                        </div>

                        <div className="mt-5">
                            <div className="text-2xl font-bold text-gray-900 leading-tight">
                                {contact.name}
                            </div>

                            <div className="mt-2 text-sm text-gray-500">
                                {config.label}
                            </div>
                        </div>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="px-4 mt-5 space-y-4">
                    {/* INFO */}
                    <div className="bg-white rounded-3xl p-5 shadow-sm">
                        <div className="font-bold text-gray-800 mb-5">
                            Thông tin liên hệ
                        </div>

                        <div className="space-y-5">
                            <div>
                                <div className="text-xs text-gray-400">
                                    Số điện thoại
                                </div>

                                <div className="font-semibold text-gray-800 mt-1">
                                    {contact.phoneNumber}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs text-gray-400">
                                    Địa chỉ
                                </div>

                                <div className="font-semibold text-gray-800 mt-1 leading-relaxed">
                                    {contact.address}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs text-gray-400">
                                    Khoảng cách
                                </div>

                                <div className="font-semibold text-gray-800 mt-1">
                                    {Number(contact.distanceKm || 0).toFixed(1)}{' '}
                                    km
                                </div>
                            </div>

                            {contact.description && (
                                <div>
                                    <div className="text-xs text-gray-400">
                                        Mô tả
                                    </div>

                                    <div className="font-medium text-gray-700 mt-1 leading-relaxed">
                                        {contact.description}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <Clock3 size={16} className="text-green-600" />

                                <span className="text-sm font-medium text-green-700">
                                    {contact.is24Hours
                                        ? 'Hoạt động 24/7'
                                        : 'Theo giờ hành chính'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* MAP */}
                    <div className="bg-white rounded-3xl p-5 shadow-sm">
                        <div className="font-bold text-gray-800 mb-4">
                            Vị trí
                        </div>

                        <button
                            onClick={handleOpenMap}
                            className="w-full h-14 rounded-2xl bg-blue-600 active:bg-blue-700 text-white font-bold flex items-center justify-center gap-2"
                        >
                            <MapPin size={20} />
                            Mở Google Maps
                        </button>
                    </div>
                </div>
            </Box>

            {/* BOTTOM ACTION */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
                <div className="flex gap-3">
                    <button
                        onClick={handleOpenMap}
                        className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center"
                    >
                        <Navigation size={22} className="text-blue-600" />
                    </button>

                    <button
                        onClick={handleCall}
                        className="flex-1 h-14 rounded-2xl bg-red-600 active:bg-red-700 text-white font-bold flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Phone size={20} />
                        Gọi ngay
                    </button>
                </div>
            </div>
        </Page>
    )
}

export default EmergencyDetailPage
