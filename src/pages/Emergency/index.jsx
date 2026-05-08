// src/pages/Emergency/index.jsx

import { useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { openPhone } from 'zmp-sdk/apis'

import {
    AlertTriangle,
    Ambulance,
    Clock3,
    Flame,
    MapPin,
    Phone,
    Shield,
} from 'lucide-react'

import { Box, Header, Page, Spinner, useSnackbar } from 'zmp-ui'

import {
    getNearbyEmergencyContacts,
    logEmergencyCall,
} from '../../services/emergencyApi'

import { getCurrentLocation } from '../../shared/location/locationService'

const EmergencyPage = () => {
    const navigate = useNavigate()

    const snackbar = useSnackbar()

    const [loading, setLoading] = useState(true)

    const [contacts, setContacts] = useState([])

    const [userLocation, setUserLocation] = useState(null)

    const [cooldownMap, setCooldownMap] = useState({})

    /**
     * =====================================
     * LOAD DATA
     * =====================================
     */
    useEffect(() => {
        let mounted = true

        const loadData = async () => {
            try {
                setLoading(true)

                const location = await getCurrentLocation()

                if (!mounted) return

                setUserLocation(location)

                const response = await getNearbyEmergencyContacts({
                    latitude: location.latitude,
                    longitude: location.longitude,
                })

                if (!mounted) return

                /**
                 * SUPPORT:
                 * response.data
                 * response
                 */
                const list = response?.data || response || []

                setContacts(Array.isArray(list) ? list : [])
            } catch (error) {
                console.error(error)

                snackbar.openSnackbar({
                    type: 'error',
                    text: 'Không tải được danh sách khẩn cấp',
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
    }, [])

    /**
     * =====================================
     * TYPE CONFIG
     * =====================================
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
     * =====================================
     * CALL HANDLER
     * =====================================
     */
    const handleCall = async (event, contact) => {
        /**
         * TRÁNH CLICK LAN SANG CARD
         */
        event.stopPropagation()

        try {
            const cooldown = cooldownMap[contact.id]

            if (cooldown && cooldown > Date.now()) {
                snackbar.openSnackbar({
                    type: 'warning',
                    text: 'Vui lòng chờ trước khi gọi lại',
                })

                return
            }

            /**
             * SET COOLDOWN
             */
            setCooldownMap((prev) => ({
                ...prev,
                [contact.id]: Date.now() + 60000,
            }))

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
     * =====================================
     * NAVIGATE DETAIL
     * =====================================
     */
    const handleOpenDetail = (contact) => {
        navigate(`/emergency/${contact.id}`)
    }

    return (
        <Page className="bg-gray-100 min-h-screen">
            <Header title="Liên hệ khẩn cấp" showBackIcon />

            <Box className="pt-16 pb-24 px-4">
                {/* HERO */}
                <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-3xl p-5 shadow-xl text-white mb-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />

                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Phone size={30} />
                        </div>

                        <div>
                            <div className="text-xl font-bold">
                                Gọi hỗ trợ khẩn cấp
                            </div>

                            <div className="text-sm text-red-100 mt-1">
                                Chỉ sử dụng khi thật sự cần thiết
                            </div>
                        </div>
                    </div>
                </div>

                {/* LOADING */}
                {loading ? (
                    <div className="flex justify-center py-24">
                        <Spinner visible />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {contacts.map((item) => {
                            const config = getTypeConfig(item.type)

                            const IconComponent = config.icon

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => handleOpenDetail(item)}
                                    className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 active:scale-[0.99] transition-all cursor-pointer"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        {/* LEFT */}
                                        <div className="flex gap-4 flex-1">
                                            <div
                                                className={`w-16 h-16 rounded-2xl flex items-center justify-center ${config.bg}`}
                                            >
                                                <IconComponent
                                                    size={28}
                                                    className={config.color}
                                                />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-gray-800 text-[15px] leading-tight">
                                                    {item.name}
                                                </div>

                                                <div className="text-sm text-gray-500 mt-1">
                                                    {config.label}
                                                </div>

                                                <div className="flex items-start gap-1 text-xs text-gray-500 mt-3">
                                                    <MapPin
                                                        size={14}
                                                        className="mt-[1px] flex-shrink-0"
                                                    />

                                                    <span className="leading-relaxed">
                                                        {item.address}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                    <Clock3 size={14} />

                                                    <span>
                                                        Cách bạn{' '}
                                                        {Number(
                                                            item.distanceKm ||
                                                                0,
                                                        ).toFixed(1)}{' '}
                                                        km
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ACTIONS */}
                                    <div className="mt-4 flex gap-3">
                                        <button
                                            onClick={(e) => handleCall(e, item)}
                                            className="flex-1 h-12 rounded-2xl bg-red-600 active:bg-red-700 text-white font-bold flex items-center justify-center gap-2 shadow-sm"
                                        >
                                            <Phone size={18} />
                                            Gọi ngay
                                        </button>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()

                                                handleOpenDetail(item)
                                            }}
                                            className="w-12 h-12 rounded-2xl bg-gray-100 active:bg-gray-200 flex items-center justify-center"
                                        >
                                            <MapPin
                                                size={20}
                                                className="text-gray-700"
                                            />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}

                        {/* EMPTY */}
                        {!loading && contacts.length === 0 && (
                            <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100">
                                <AlertTriangle
                                    size={52}
                                    className="mx-auto text-orange-500"
                                />

                                <div className="mt-4 font-bold text-gray-800">
                                    Không có dữ liệu
                                </div>

                                <div className="text-sm text-gray-500 mt-2">
                                    Hiện chưa có liên hệ khẩn cấp khả dụng.
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Box>
        </Page>
    )
}

export default EmergencyPage
