import L from 'leaflet'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
    Circle,
    CircleMarker,
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    ZoomControl,
} from 'react-leaflet'

import {
    AlertTriangle,
    Cross,
    LocateFixed,
    Package,
    ShieldAlert,
} from 'lucide-react'

import { Header, Page, Spinner, Text, useSnackbar } from 'zmp-ui'

import { getActiveSupports, getGeoDamageMap } from '../../services/damageApi'

import {
    getCurrentLocation,
    isValidCoordinate,
} from '../../shared/location/locationService'

import 'leaflet/dist/leaflet.css'

const DEFAULT_LOCATION = [21.8485, 106.7578]

const DamageMap = () => {
    const snackbar = useSnackbar()

    const mapRef = useRef(null)

    const [userLocation, setUserLocation] = useState(DEFAULT_LOCATION)

    const [gpsAccuracy, setGpsAccuracy] = useState(0)

    const [damagePoints, setDamagePoints] = useState([])

    const [supportPoints, setSupportPoints] = useState([])

    const [loading, setLoading] = useState(true)

    const [locating, setLocating] = useState(false)

    /**
     * =========================
     * LOAD LOCATION
     * =========================
     */
    const fetchLocation = useCallback(
        async (manual = false) => {
            setLocating(true)

            try {
                const location = await getCurrentLocation()

                const nextLocation = [location.latitude, location.longitude]

                setUserLocation(nextLocation)

                setGpsAccuracy(location.accuracy || 0)

                if (manual && mapRef.current) {
                    mapRef.current.flyTo(nextLocation, 15, {
                        animate: true,
                        duration: 1.2,
                    })
                }

                if (manual) {
                    snackbar.openSnackbar({
                        type: location.success ? 'success' : 'warning',

                        text: location.success
                            ? 'Đã cập nhật GPS.'
                            : 'Đang dùng vị trí mặc định.',
                    })
                }
            } catch (error) {
                console.error(error)

                snackbar.openSnackbar({
                    type: 'error',
                    text: 'Không thể lấy GPS.',
                })
            } finally {
                setLocating(false)
            }
        },
        [snackbar],
    )

    /**
     * =========================
     * LOAD DATA
     * =========================
     */
    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true)

                const [damageRes, supportRes] = await Promise.allSettled([
                    getGeoDamageMap(),
                    getActiveSupports(),
                ])

                if (
                    damageRes.status === 'fulfilled' &&
                    damageRes.value?.success
                ) {
                    const clean = damageRes.value.data.filter((p) =>
                        isValidCoordinate(p.latitude, p.longitude),
                    )

                    setDamagePoints(clean)
                }

                if (
                    supportRes.status === 'fulfilled' &&
                    supportRes.value?.success
                ) {
                    const clean = supportRes.value.data.filter((p) =>
                        isValidCoordinate(p.latitude, p.longitude),
                    )

                    setSupportPoints(clean)
                }

                await fetchLocation(false)
            } catch (error) {
                console.error(error)

                snackbar.openSnackbar({
                    type: 'error',
                    text: 'Lỗi tải dữ liệu bản đồ.',
                })
            } finally {
                setLoading(false)
            }
        }

        init()
    }, [])

    /**
     * =========================
     * DAMAGE STYLE
     * =========================
     */
    const getDamageStyle = (severity) => {
        switch (severity) {
            case 3:
            case 'HIGH':
                return {
                    color: '#dc2626',
                    fill: '#ef4444',
                    label: 'Nặng',
                }

            case 2:
            case 'MEDIUM':
                return {
                    color: '#ea580c',
                    fill: '#f97316',
                    label: 'Trung bình',
                }

            default:
                return {
                    color: '#16a34a',
                    fill: '#22c55e',
                    label: 'Nhẹ',
                }
        }
    }

    /**
     * =========================
     * SUPPORT ICONS
     * =========================
     */
    const supportIcons = useMemo(() => {
        const createIcon = (emoji, bg) =>
            L.divIcon({
                html: `
                    <div
                        style="
                            width:40px;
                            height:40px;
                            border-radius:999px;
                            background:${bg};
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            border:3px solid white;
                            box-shadow:0 4px 12px rgba(0,0,0,.25);
                            font-size:18px;
                        "
                    >
                        ${emoji}
                    </div>
                `,
                className: '',
                iconSize: [40, 40],
                iconAnchor: [20, 20],
            })

        return {
            medical: createIcon('🏥', '#16a34a'),
            relief: createIcon('📦', '#2563eb'),
            evacuation: createIcon('🛡️', '#7c3aed'),
            default: createIcon('🆘', '#475569'),
        }
    }, [])

    const getSupportIcon = (type) => {
        switch (type) {
            case 1:
            case 'MEDICAL':
                return supportIcons.medical

            case 2:
            case 'RELIEF':
                return supportIcons.relief

            case 3:
            case 'EVACUATION':
                return supportIcons.evacuation

            default:
                return supportIcons.default
        }
    }

    return (
        <Page className="bg-black">
            <Header title="Bản đồ Thiệt hại" showBackIcon />

            <div className="relative h-screen w-full">
                {/* MAP */}
                <MapContainer
                    center={userLocation}
                    zoom={12}
                    zoomControl={false}
                    ref={mapRef}
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                >
                    <ZoomControl position="bottomleft" />

                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    {/* GPS ACCURACY */}
                    {gpsAccuracy > 0 && (
                        <Circle
                            center={userLocation}
                            radius={gpsAccuracy}
                            pathOptions={{
                                color: '#3b82f6',
                                fillColor: '#60a5fa',
                                fillOpacity: 0.15,
                            }}
                        />
                    )}

                    {/* USER */}
                    <CircleMarker
                        center={userLocation}
                        radius={10}
                        pathOptions={{
                            color: '#ffffff',
                            fillColor: '#2563eb',
                            fillOpacity: 1,
                            weight: 3,
                        }}
                    >
                        <Popup>
                            <div className="min-w-[160px]">
                                <div className="font-bold text-blue-600">
                                    Vị trí của bạn
                                </div>

                                <div className="text-xs mt-2 text-gray-500">
                                    Sai số GPS:
                                    {' ~'}
                                    {Math.round(gpsAccuracy)}m
                                </div>
                            </div>
                        </Popup>
                    </CircleMarker>

                    {/* DAMAGE */}
                    {damagePoints.map((point) => {
                        const style = getDamageStyle(point.severity)

                        return (
                            <CircleMarker
                                key={point.id}
                                center={[point.latitude, point.longitude]}
                                radius={14}
                                pathOptions={{
                                    color: style.color,
                                    fillColor: style.fill,
                                    fillOpacity: 0.65,
                                    weight: 2,
                                }}
                            >
                                <Popup>
                                    <div className="min-w-[180px]">
                                        <div className="font-bold text-red-600 text-sm">
                                            {point.damageType}
                                        </div>

                                        <div className="text-xs mt-2">
                                            Mức độ:
                                            <b
                                                style={{
                                                    color: style.color,
                                                }}
                                            >
                                                {' '}
                                                {style.label}
                                            </b>
                                        </div>

                                        {point.address && (
                                            <div className="text-xs text-gray-500 mt-2 border-t pt-2">
                                                {point.address}
                                            </div>
                                        )}
                                    </div>
                                </Popup>
                            </CircleMarker>
                        )
                    })}

                    {/* SUPPORT */}
                    {supportPoints.map((point) => (
                        <Marker
                            key={point.id}
                            position={[point.latitude, point.longitude]}
                            icon={getSupportIcon(point.type)}
                        >
                            <Popup>
                                <div className="min-w-[200px]">
                                    <div className="font-bold text-blue-700 text-sm uppercase">
                                        {point.name}
                                    </div>

                                    <div className="text-xs mt-2 text-gray-600">
                                        Sức chứa:
                                        <b> {point.capacity}</b>
                                    </div>

                                    <div className="text-xs mt-1 text-gray-600">
                                        SĐT:
                                        <a
                                            href={`tel:${point.contactPhone}`}
                                            className="text-blue-600 font-bold"
                                        >
                                            {' '}
                                            {point.contactPhone}
                                        </a>
                                    </div>

                                    <div className="text-xs mt-2 text-gray-500 border-t pt-2">
                                        {point.address}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>

                {/* LOADING */}
                {loading && (
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-[1000] flex flex-col items-center justify-center">
                        <Spinner visible />

                        <Text className="text-white mt-3 font-medium">
                            Đang tải dữ liệu bản đồ...
                        </Text>
                    </div>
                )}

                {/* FLOAT CONTROLS */}
                <div className="absolute right-4 bottom-6 z-[1000] flex flex-col gap-3">
                    {/* GPS BUTTON */}
                    <button
                        onClick={() => fetchLocation(true)}
                        className="w-14 h-14 rounded-2xl bg-white shadow-2xl border border-gray-200 flex items-center justify-center active:scale-95 transition"
                    >
                        {locating ? (
                            <Spinner size="small" />
                        ) : (
                            <LocateFixed size={24} className="text-blue-600" />
                        )}
                    </button>

                    {/* LEGEND */}
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-4 min-w-[170px] border border-white/60">
                        <div className="font-bold text-gray-800 mb-3">
                            Chú giải
                        </div>

                        <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-2">
                                <AlertTriangle
                                    size={16}
                                    className="text-red-500"
                                />
                                Thiệt hại nặng
                            </div>

                            <div className="flex items-center gap-2">
                                <AlertTriangle
                                    size={16}
                                    className="text-orange-500"
                                />
                                Trung bình
                            </div>

                            <div className="flex items-center gap-2">
                                <AlertTriangle
                                    size={16}
                                    className="text-green-500"
                                />
                                Nhẹ
                            </div>

                            <div className="h-px bg-gray-200 my-2" />

                            <div className="flex items-center gap-2">
                                <Cross size={16} className="text-green-600" />Y
                                tế
                            </div>

                            <div className="flex items-center gap-2">
                                <Package size={16} className="text-blue-600" />
                                Cứu trợ
                            </div>

                            <div className="flex items-center gap-2">
                                <ShieldAlert
                                    size={16}
                                    className="text-violet-600"
                                />
                                Sơ tán
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Page>
    )
}

export default DamageMap
