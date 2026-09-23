import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  Building2,
  BusFront,
  CalendarDays,
  CarTaxiFront,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  House,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  PawPrint,
  Settings,
  Sprout,
  Truck,
  WalletCards,
  type LucideIcon,
} from 'lucide-react'
import logo from './assets/logo.png'
import './App.css'

const profileImageModules = import.meta.glob('../../profil/profil*.png', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

const profileImages = Object.entries(profileImageModules)
  .sort(([firstPath], [secondPath]) =>
    firstPath.localeCompare(secondPath, undefined, {
      numeric: true,
      sensitivity: 'base',
    }),
  )
  .map(([, imageUrl]) => imageUrl)

const transportImageModules = import.meta.glob(
  '../../transport/*.{png,jpg,jpeg,webp}',
  {
    eager: true,
    import: 'default',
    query: '?url',
  },
) as Record<string, string>

const transportImages = Object.entries(transportImageModules)
  .sort(([firstPath], [secondPath]) =>
    firstPath.localeCompare(secondPath, undefined, {
      numeric: true,
      sensitivity: 'base',
    }),
  )
  .map(([, imageUrl]) => imageUrl)

const transportImageByName = Object.fromEntries(
  Object.entries(transportImageModules).map(([filePath, imageUrl]) => {
    const fileName = filePath.split('/').pop()?.toLowerCase() ?? ''
    return [fileName, imageUrl]
  }),
) as Record<string, string>

const btpImageModules = import.meta.glob(
  '../../btp/*.{png,jpg,jpeg,webp}',
  {
    eager: true,
    import: 'default',
    query: '?url',
  },
) as Record<string, string>

const btpImages = Object.entries(btpImageModules)
  .sort(([firstPath], [secondPath]) =>
    firstPath.localeCompare(secondPath, undefined, {
      numeric: true,
      sensitivity: 'base',
    }),
  )
  .map(([, imageUrl]) => imageUrl)

type View =
  | 'dashboard'
  | 'btp'
  | 'transport'
  | 'agriculture'
  | 'elevage'
  | 'finances'
  | 'agenda'
  | 'settings'

type NavigationItem = {
  id: View
  label: string
  icon: LucideIcon
}

type Pole = {
  id: View
  name: string
  description: string
  icon: LucideIcon
}

type BtpPlan = {
  id: number
  project_id: number
  plan_name?: string
  file_name?: string
  file_path?: string
  file_url?: string
  file_type?: string
  plan_type?: string
  client?: string
}

type BtpProject = {
  id: number
  name: string
  code: string
  status: string
}

type TransportCategoryKey = 'motorcycle' | 'taxi' | 'bus' | 'truck'

type TransportSummaryItem = {
  type: TransportCategoryKey
  label: string
  total: number
  available: number
  assigned: number
  maintenance: number
}

type TransportDriver = {
  id: number
  driver_code: string
  first_name: string
  last_name: string
  full_name: string
  phone: string
  license_number: string
  license_category: string
  license_expiry_date?: string | null
  hire_date?: string | null
  status: string
  notes: string
  vehicle_id?: number | null
  vehicle_type?: string | null
  registration_number?: string
  brand?: string
  model?: string
  vehicle_status?: string
}

type TransportVehicle = {
  id: number
  type: string
  registration_number: string
  brand: string
  model: string
  manufacture_year?: number | null
  status: string
  acquisition_date?: string | null
  notes: string
  driver_id?: number | null
  driver_name?: string
}

type AgendaCategory = 'cours' | 'rendez-vous' | 'tâche' | 'réunion' | 'personnel' | 'autre'
type AgendaPriority = 'normale' | 'importante' | 'urgente'

type AgendaEvent = {
  id: string
  title: string
  description: string
  date: string
  startTime: string
  endTime: string
  category: AgendaCategory
  priority: AgendaPriority
  important: boolean
}

const AGENDA_EVENTS_KEY = 'beaterra_agenda_events'
const AGENDA_IMPORTANT_DAYS_KEY = 'beaterra_agenda_important_days'

const agendaCategoryOptions: Array<{ value: AgendaCategory; label: string }> = [
  { value: 'cours', label: 'Cours' },
  { value: 'rendez-vous', label: 'Rendez-vous' },
  { value: 'tâche', label: 'Tâche' },
  { value: 'réunion', label: 'Réunion' },
  { value: 'personnel', label: 'Personnel' },
  { value: 'autre', label: 'Autre' },
]

const agendaPriorityOptions: Array<{ value: AgendaPriority; label: string }> = [
  { value: 'normale', label: 'Normale' },
  { value: 'importante', label: 'Importante' },
  { value: 'urgente', label: 'Urgente' },
]

const formatAgendaDateKey = (date: Date) => {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return offsetDate.toISOString().slice(0, 10)
}

const transportCategories: Array<{
  id: TransportCategoryKey
  label: string
  shortLabel: string
  icon: LucideIcon
}> = [
  { id: 'motorcycle', label: 'Moto', shortLabel: 'Moto', icon: Bike },
  { id: 'taxi', label: 'Taxi', shortLabel: 'Taxi', icon: CarTaxiFront },
  { id: 'bus', label: 'Bus', shortLabel: 'Bus', icon: BusFront },
  { id: 'truck', label: 'Camion', shortLabel: 'Camion', icon: Truck },
]

const transportCategoryMeta: Record<
  TransportCategoryKey,
  {
    imageFile: string
    label: string
    subtitle: string
    headline: string
    managementLabel: string
    driverLabel: string
    operationsLabel: string
  }
> = {
  motorcycle: {
    imageFile: 'moto.png',
    label: 'Moto',
    subtitle: 'Véhicule léger',
    headline: 'Tableau de bord Moto',
    managementLabel: 'Gestion des motos',
    driverLabel: 'Gestion des conducteurs',
    operationsLabel: 'Opérations / versements / paiements liés aux motos',
  },
  taxi: {
    imageFile: 'taxi.png',
    label: 'Taxi',
    subtitle: 'Service de transport urbain',
    headline: 'Tableau de bord Taxi',
    managementLabel: 'Gestion des taxis',
    driverLabel: 'Gestion des conducteurs',
    operationsLabel: 'Opérations / versements / paiements liés aux taxis',
  },
  bus: {
    imageFile: 'bus.png',
    label: 'Bus',
    subtitle: 'Transport en ligne',
    headline: 'Tableau de bord Bus',
    managementLabel: 'Gestion des bus',
    driverLabel: 'Gestion des conducteurs',
    operationsLabel: 'Opérations / versements / paiements liés aux bus',
  },
  truck: {
    imageFile: 'camion.png',
    label: 'Camion',
    subtitle: 'Fret et logistique',
    headline: 'Tableau de bord Camion',
    managementLabel: 'Gestion des camions',
    driverLabel: 'Gestion des conducteurs',
    operationsLabel: 'Opérations / versements / paiements liés aux camions',
  },
}

const navigation: NavigationItem[] = [
  { id: 'dashboard', label: 'Tableau de bord', icon: House },
  { id: 'btp', label: 'BTP', icon: Building2 },
  { id: 'transport', label: 'Transport', icon: Truck },
  { id: 'agriculture', label: 'Agriculture', icon: Sprout },
  { id: 'elevage', label: 'Élevage', icon: PawPrint },
  { id: 'finances', label: 'Finances', icon: WalletCards },
  { id: 'agenda', label: 'Agenda PDG', icon: CalendarDays },
  { id: 'settings', label: 'Paramètres', icon: Settings },
]

const poles: Pole[] = [
  {
    id: 'btp',
    name: 'BTP',
    description: 'Plans, clients et projets',
    icon: Building2,
  },
  {
    id: 'transport',
    name: 'Transport',
    description: 'Motos, taxis, bus et camions',
    icon: Truck,
  },
  {
    id: 'agriculture',
    name: 'Agriculture',
    description: 'Production et exploitation',
    icon: Sprout,
  },
  {
    id: 'elevage',
    name: 'Élevage',
    description: 'Suivi du cheptel',
    icon: PawPrint,
  },
]

const moduleIcons: Record<View, LucideIcon> = {
  dashboard: House,
  btp: Building2,
  transport: Truck,
  agriculture: Sprout,
  elevage: PawPrint,
  finances: WalletCards,
  agenda: CalendarDays,
  settings: Settings,
}

const chartValues = [0, 0, 0, 0, 0, 0, 0]
const chartLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const PASSWORD_HASH_KEY = 'beaterra_security_password'
const ACCESS_CODE_KEY = 'beaterra_security_code'

async function verifyAccessPassword(password: string, storedHash: string) {
  if (!storedHash || !storedHash.includes(':')) {
    return false
  }

  const [saltHex, hashHex] = storedHash.split(':', 2)
  const saltBytes = Uint8Array.from(
    (saltHex.match(/.{1,2}/g) ?? []).map((byte) => Number.parseInt(byte, 16)),
  )
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 200000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256,
  )
  const candidateHash = Array.from(new Uint8Array(derivedBits))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')

  return candidateHash === hashHex
}

function EmptyLineChart() {
  const width = 720
  const height = 240
  const left = 48
  const right = 20
  const top = 20
  const bottom = 42
  const plotWidth = width - left - right
  const plotHeight = height - top - bottom

  const points = chartValues
    .map((value, index) => {
      const x = left + (plotWidth / (chartValues.length - 1)) * index
      const y = top + plotHeight - (value / 100) * plotHeight
      return x + ',' + y
    })
    .join(' ')

  return (
    <div className="chart-wrap">
      <svg
        viewBox="0 0 720 240"
        className="line-chart"
        role="img"
        aria-label="Graphique d’évolution"
      >
        <defs>
          <linearGradient
            id="activityGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#FF1744" />
            <stop offset="33%" stopColor="#FF8A00" />
            <stop offset="66%" stopColor="#008F83" />
            <stop offset="100%" stopColor="#19C37D" />
          </linearGradient>
        </defs>

        {[0, 25, 50, 75, 100].map((value) => {
          const y = top + plotHeight - (value / 100) * plotHeight

          return (
            <line
              key={value}
              x1={left}
              y1={y}
              x2={width - right}
              y2={y}
              className="chart-grid-line"
            />
          )
        })}

        <polyline
          points={points}
          className="chart-line"
          fill="none"
          stroke="url(#activityGradient)"
        />

        {chartValues.map((value, index) => {
          const x = left + (plotWidth / (chartValues.length - 1)) * index
          const y = top + plotHeight - (value / 100) * plotHeight

          return (
            <circle
              key={value + '-' + index}
              cx={x}
              cy={y}
              r="4"
              className="chart-point"
            />
          )
        })}

        {chartLabels.map((label, index) => {
          const x = left + (plotWidth / (chartLabels.length - 1)) * index

          return (
            <text
              key={label}
              x={x}
              y={height - 12}
              textAnchor="middle"
              className="chart-label"
            >
              {label}
            </text>
          )
        })}
      </svg>

      <div className="chart-empty">
        <strong>Aucune donnée</strong>
        <span>
          Le graphique se remplira avec les opérations enregistrées.
        </span>
      </div>
    </div>
  )
}

function EmptyBarChart() {
  const labels = ['BTP', 'Transport', 'Agriculture', 'Élevage']

  return (
    <div className="bar-chart">
      <div className="bar-chart-area">
        {labels.map((label) => (
          <div className="bar-column" key={label}>
            <div className="bar-value">0</div>

            <div className="bar-track">
              <div className="bar-fill" />
            </div>

            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="chart-empty compact">
        <strong>Pas encore de données</strong>

        <span>
          Les valeurs apparaîtront après les premières opérations.
        </span>
      </div>
    </div>
  )
}

function MediaSlideshow({
  images,
  alt,
  className,
  adaptFrameToImage = false,
}: {
  images: string[]
  alt: string
  className: string
  adaptFrameToImage?: boolean
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [previousIndex, setPreviousIndex] = useState<number | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [activeAspectRatio, setActiveAspectRatio] = useState<number>()

  useEffect(() => {
    if (!adaptFrameToImage || !images[activeIndex]) {
      return
    }

    const image = new Image()
    image.onload = () => {
      if (image.naturalWidth > 0 && image.naturalHeight > 0) {
        setActiveAspectRatio(image.naturalWidth / image.naturalHeight)
      }
    }
    image.src = images[activeIndex]
  }, [activeIndex, adaptFrameToImage, images])

  useEffect(() => {
    if (images.length < 2) {
      return
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => {
        setPreviousIndex(current)
        setIsTransitioning(true)
        window.setTimeout(() => {
          setPreviousIndex(null)
          setIsTransitioning(false)
        }, 1800)
        return (current + 1) % images.length
      })
    }, 7000)

    return () => {
      window.clearInterval(timer)
    }
  }, [images.length])

  if (images.length === 0) {
    return null
  }

  return (
    <div
      className={
        className +
        (isTransitioning ? 'hero-profile-slideshow-transitioning' : '')
      }
      style={
        adaptFrameToImage && activeAspectRatio
          ? { aspectRatio: String(activeAspectRatio) }
          : undefined
      }
    >
      <div className="hero-profile-media">
        {previousIndex !== null && (
          <img
            src={images[previousIndex]}
            alt=""
            aria-hidden="true"
            className="hero-profile-image hero-profile-image-exiting"
          />
        )}
        <img
          src={images[activeIndex]}
          alt={alt}
          className={
            'hero-profile-image ' +
            (isTransitioning
              ? 'hero-profile-image-entering'
              : 'hero-profile-image-current')
          }
        />
      </div>
      <span className="hero-profile-particle hero-profile-particle-one" />
      <span className="hero-profile-particle hero-profile-particle-two" />
      <span className="hero-profile-particle hero-profile-particle-three" />
      <span className="hero-profile-particle hero-profile-particle-four" />
    </div>
  )
}

function ProfileSlideshow() {
  return (
    <MediaSlideshow
      images={profileImages}
      alt="Profil Btera"
      className="hero-profile-slideshow "
    />
  )
}

function TransportSlideshow({
  images = transportImages,
  alt = 'Véhicule de transport',
}: {
  images?: string[]
  alt?: string
}) {
  return (
    <MediaSlideshow
      images={images}
      alt={alt}
      className="hero-profile-slideshow transport-slideshow "
    />
  )
}

function BtpSlideshow() {
  return (
    <MediaSlideshow
      images={btpImages}
      alt="Plan BTP"
      className="hero-profile-slideshow btp-slideshow "
      adaptFrameToImage
    />
  )
}

function App() {
  const [view, setView] = useState<View>('dashboard')
  const [navigationHistory, setNavigationHistory] = useState<View[]>(['dashboard'])
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [securityCode, setSecurityCode] = useState('')
  const [newCode, setNewCode] = useState('')
  const [confirmNewCode, setConfirmNewCode] = useState('')
  const [lockCode, setLockCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordSettings, setShowPasswordSettings] = useState(false)
  const [agendaView, setAgendaView] = useState<'month' | 'year'>('month')
  const [agendaDate, setAgendaDate] = useState(() => new Date())
  const [agendaSelectedDate, setAgendaSelectedDate] = useState<string | null>(null)
  const [agendaEditingId, setAgendaEditingId] = useState<string | null>(null)
  const [agendaEvents, setAgendaEvents] = useState<AgendaEvent[]>(() => {
    if (typeof window === 'undefined') {
      return []
    }

    try {
      const savedAgenda = localStorage.getItem(AGENDA_EVENTS_KEY)
      return savedAgenda ? JSON.parse(savedAgenda) as AgendaEvent[] : []
    } catch {
      return []
    }
  })
  const [agendaImportantDays, setAgendaImportantDays] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') {
      return {}
    }

    try {
      const savedImportantDays = localStorage.getItem(AGENDA_IMPORTANT_DAYS_KEY)
      return savedImportantDays ? JSON.parse(savedImportantDays) as Record<string, boolean> : {}
    } catch {
      return {}
    }
  })
  const [agendaForm, setAgendaForm] = useState({
    title: '',
    description: '',
    date: formatAgendaDateKey(new Date()),
    startTime: '09:00',
    endTime: '10:00',
    category: 'réunion' as AgendaCategory,
    priority: 'normale' as AgendaPriority,
    important: false,
  })
  const [isAppLocked, setIsAppLocked] = useState(true)
  const [lockMessage, setLockMessage] = useState('Saisissez votre mot de passe pour continuer.')
  const [message, setMessage] = useState('')
  const [transportSelectedCategory, setTransportSelectedCategory] = useState<TransportCategoryKey | 'overview'>('overview')
  const [transportSummary, setTransportSummary] = useState<Record<TransportCategoryKey, TransportSummaryItem>>({
    motorcycle: { type: 'motorcycle', label: 'Moto', total: 0, available: 0, assigned: 0, maintenance: 0 },
    taxi: { type: 'taxi', label: 'Taxi', total: 0, available: 0, assigned: 0, maintenance: 0 },
    bus: { type: 'bus', label: 'Bus', total: 0, available: 0, assigned: 0, maintenance: 0 },
    truck: { type: 'truck', label: 'Camion', total: 0, available: 0, assigned: 0, maintenance: 0 },
  })
  const [transportDrivers, setTransportDrivers] = useState<TransportDriver[]>([])
  const [transportVehicles, setTransportVehicles] = useState<TransportVehicle[]>([])
  const [transportSearch, setTransportSearch] = useState('')
  const [transportStatusFilter, setTransportStatusFilter] = useState('all')
  const [isTransportDriverFormOpen, setIsTransportDriverFormOpen] = useState(false)
  const [transportFormMode, setTransportFormMode] = useState<'create' | 'edit'>('create')
  const [transportForm, setTransportForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    license_number: '',
    license_category: 'B',
    license_expiry_date: '',
    hire_date: '',
    status: 'active',
    notes: '',
    vehicle_id: '',
  })
  const [editingDriverId, setEditingDriverId] = useState<number | null>(null)

  const [btpPlans, setBtpPlans] = useState<BtpPlan[]>([])
  const [btpProjects, setBtpProjects] = useState<BtpProject[]>([])
  const [selectedBtpProjectId, setSelectedBtpProjectId] = useState<number>()
  const [btpPlanIndex, setBtpPlanIndex] = useState(0)
  const [isImportingPlan, setIsImportingPlan] = useState(false)
  const planFileInputRef = useRef<HTMLInputElement>(null)
  const acceptedPlanExtensions = ['.pdf', '.png', '.jpg', '.jpeg']
  const acceptedPlanMimeTypes = new Set([
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/pjpeg',
  ])
  const apiBaseUrl =
    import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

  const loadBtpPlans = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/btp/plans`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const payload = (await response.json()) as { data?: BtpPlan[] }
      const plans = payload.data

      setBtpPlans(Array.isArray(plans) ? plans : [])
      setBtpPlanIndex(0)
    } catch (error) {
      console.error('Erreur chargement des plans BTP :', error)
    }
  }

  const loadBtpProjects = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/btp/projects`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const payload = (await response.json()) as { data?: BtpProject[] }
      const projects = Array.isArray(payload.data) ? payload.data : []
      setBtpProjects(projects)
      setSelectedBtpProjectId((current) => current ?? projects[0]?.id)
    } catch (error) {
      console.error('Erreur chargement des projets BTP :', error)
      setMessage('Impossible de charger les projets BTP.')
    }
  }

  const loadTransportSummary = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/transport/summary`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const payload = (await response.json()) as { data?: TransportSummaryItem[] }
      const summary = payload.data ?? []
      const nextSummary = { ...transportSummary }

      for (const entry of summary) {
        const key = entry.type as TransportCategoryKey
        nextSummary[key] = entry
      }

      setTransportSummary(nextSummary)
    } catch (error) {
      console.error('Erreur chargement du résumé transport :', error)
    }
  }

  const loadTransportData = async () => {
    const categoryForQuery =
      transportSelectedCategory === 'overview' ? 'motorcycle' : transportSelectedCategory

    try {
      const [driversResponse, vehiclesResponse] = await Promise.all([
        fetch(`${apiBaseUrl}/transport/drivers?type=${categoryForQuery}`),
        fetch(`${apiBaseUrl}/transport/vehicles?type=${categoryForQuery}`),
      ])

      if (!driversResponse.ok || !vehiclesResponse.ok) {
        throw new Error('Transport data request failed')
      }

      const driversPayload = (await driversResponse.json()) as { data?: TransportDriver[] }
      const vehiclesPayload = (await vehiclesResponse.json()) as { data?: TransportVehicle[] }

      setTransportDrivers(Array.isArray(driversPayload.data) ? driversPayload.data : [])
      setTransportVehicles(Array.isArray(vehiclesPayload.data) ? vehiclesPayload.data : [])
    } catch (error) {
      console.error('Erreur chargement transport :', error)
    }
  }

  const resetTransportForm = () => {
    setTransportForm({
      first_name: '',
      last_name: '',
      phone: '',
      license_number: '',
      license_category: 'B',
      license_expiry_date: '',
      hire_date: '',
      status: 'active',
      notes: '',
      vehicle_id: '',
    })
    setEditingDriverId(null)
    setTransportFormMode('create')
  }

  const openTransportDriverForm = () => {
    resetTransportForm()
    setIsTransportDriverFormOpen(true)
  }

  const handleTransportInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target
    setTransportForm((current) => ({ ...current, [name]: value }))
  }

  const transportActiveCategory = transportSelectedCategory === 'overview' ? 'motorcycle' : transportSelectedCategory
  const transportCategoryTitle: Record<TransportCategoryKey, string> = {
    motorcycle: 'Gestion des motos',
    taxi: 'Gestion des taxis',
    bus: 'Gestion des bus',
    truck: 'Gestion des camions',
  }

  const currentTransportCategoryMeta =
    transportSelectedCategory === 'overview'
      ? null
      : transportCategoryMeta[transportSelectedCategory]

  const currentTransportHeroImage =
    transportSelectedCategory === 'overview'
      ? transportImages
      : [transportImageByName[transportCategoryMeta[transportSelectedCategory].imageFile] ?? transportImages[0]]

  const transportHeroEyebrow =
    transportSelectedCategory === 'overview' ? 'PÔLE TRANSPORT' : currentTransportCategoryMeta?.label.toUpperCase() ?? 'TRANSPORT'

  const transportHeroTitle =
    transportSelectedCategory === 'overview' ? 'Transport' : currentTransportCategoryMeta?.label ?? 'Transport'

  const transportHeroDescription =
    transportSelectedCategory === 'overview'
      ? 'Gérez vos véhicules, conducteurs et opérations de transport depuis un espace unique.'
      : `${currentTransportCategoryMeta?.subtitle ?? 'Suivi du parc'} • données et opérations spécifiques à ${currentTransportCategoryMeta?.label.toLowerCase() ?? 'ce véhicule'}.`

  const transportSpecificCards =
    transportSelectedCategory === 'overview'
      ? []
      : [
          {
            label: currentTransportCategoryMeta?.managementLabel ?? 'Gestion du parc',
            value: `${transportSummary[transportSelectedCategory].total}`,
            suffix: 'véhicules',
          },
          {
            label: currentTransportCategoryMeta?.driverLabel ?? 'Gestion des conducteurs',
            value: `${transportSummary[transportSelectedCategory].assigned}`,
            suffix: 'affectés',
          },
          {
            label: currentTransportCategoryMeta?.operationsLabel ?? 'Opérations liées',
            value: `${transportSummary[transportSelectedCategory].available + transportSummary[transportSelectedCategory].maintenance}`,
            suffix: 'actives',
          },
        ]

  const agendaYearLabel = agendaDate.toLocaleDateString('fr-FR', { year: 'numeric' })
  const agendaMonthLabel = agendaDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const agendaWeekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  const getAgendaCellEvents = (date: Date) =>
    agendaEvents
      .filter((event) => event.date === formatAgendaDateKey(date))
      .sort((first, second) => first.startTime.localeCompare(second.startTime))

  const openAgendaDateEditor = (date: Date, eventId?: string) => {
    const selectedKey = formatAgendaDateKey(date)
    const selectedEvent = eventId
      ? agendaEvents.find((event) => event.id === eventId)
      : undefined

    setAgendaSelectedDate(selectedKey)
    setAgendaEditingId(eventId ?? null)
    setAgendaForm({
      title: selectedEvent?.title ?? '',
      description: selectedEvent?.description ?? '',
      date: selectedKey,
      startTime: selectedEvent?.startTime ?? '09:00',
      endTime: selectedEvent?.endTime ?? '10:00',
      category: selectedEvent?.category ?? 'réunion',
      priority: selectedEvent?.priority ?? 'normale',
      important: selectedEvent?.important ?? Boolean(agendaImportantDays[selectedKey]),
    })
  }

  const resetAgendaForm = () => {
    setAgendaSelectedDate(null)
    setAgendaEditingId(null)
    setAgendaForm({
      title: '',
      description: '',
      date: formatAgendaDateKey(agendaDate),
      startTime: '09:00',
      endTime: '10:00',
      category: 'réunion',
      priority: 'normale',
      important: Boolean(agendaImportantDays[formatAgendaDateKey(agendaDate)]),
    })
  }

  const handleAgendaFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = event.target
    const nextValue = type === 'checkbox' ? (event.target as HTMLInputElement).checked : value

    setAgendaForm((current) => ({
      ...current,
      [name]: nextValue,
    }))
  }

  const handleAgendaSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const cleanTitle = agendaForm.title.trim()
    const cleanDescription = agendaForm.description.trim()

    if (!cleanTitle || !agendaForm.date) {
      setMessage('Le titre et la date de l’événement sont obligatoires.')
      return
    }

    const nextEvent: AgendaEvent = {
      id: agendaEditingId ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title: cleanTitle,
      description: cleanDescription,
      date: agendaForm.date,
      startTime: agendaForm.startTime,
      endTime: agendaForm.endTime,
      category: agendaForm.category,
      priority: agendaForm.priority,
      important: agendaForm.important,
    }

    setAgendaEvents((current) => {
      const nextAgenda = agendaEditingId
        ? current.map((item) => (item.id === agendaEditingId ? nextEvent : item))
        : [...current, nextEvent]

      return nextAgenda.sort((first, second) => {
        const dateCompare = first.date.localeCompare(second.date)
        if (dateCompare !== 0) {
          return dateCompare
        }

        return first.startTime.localeCompare(second.startTime)
      })
    })

    setAgendaImportantDays((current) => ({
      ...current,
      [agendaForm.date]: agendaForm.important,
    }))

    setAgendaSelectedDate(agendaForm.date)
    setAgendaEditingId(null)
    setAgendaForm({
      title: '',
      description: '',
      date: agendaForm.date,
      startTime: agendaForm.startTime,
      endTime: agendaForm.endTime,
      category: agendaForm.category,
      priority: agendaForm.priority,
      important: agendaForm.important,
    })
    setMessage('Événement enregistré.')
  }

  const handleAgendaDelete = (eventId: string) => {
    const targetEvent = agendaEvents.find((event) => event.id === eventId)

    if (!targetEvent) {
      return
    }

    const confirmed = window.confirm(`Supprimer l’événement « ${targetEvent.title} » ?`)

    if (!confirmed) {
      return
    }

    setAgendaEvents((current) => current.filter((event) => event.id !== eventId))
    setAgendaSelectedDate(null)
    setAgendaEditingId(null)
    setAgendaForm({
      title: '',
      description: '',
      date: formatAgendaDateKey(agendaDate),
      startTime: '09:00',
      endTime: '10:00',
      category: 'réunion',
      priority: 'normale',
      important: Boolean(agendaImportantDays[formatAgendaDateKey(agendaDate)]),
    })
    setMessage('Événement supprimé.')
  }

  const getWeekNumber = (date: Date) => {
    const copy = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const day = copy.getUTCDay() || 7
    copy.setUTCDate(copy.getUTCDate() + 4 - day)
    const yearStart = new Date(Date.UTC(copy.getUTCFullYear(), 0, 1))
    const diffInDays = Math.round((copy.getTime() - yearStart.getTime()) / 86400000)
    return `S${Math.ceil((diffInDays + 1) / 7)}`
  }

  const getAgendaMonthDays = () => {
    const monthStart = new Date(agendaDate.getFullYear(), agendaDate.getMonth(), 1)
    const startWeekDay = (monthStart.getDay() + 6) % 7
    const firstGridDate = new Date(monthStart)
    firstGridDate.setDate(monthStart.getDate() - startWeekDay)

    const cells: Array<{ date: Date; isCurrentMonth: boolean }> = []

    for (let index = 0; index < 42; index += 1) {
      const current = new Date(firstGridDate)
      current.setDate(firstGridDate.getDate() + index)
      cells.push({
        date: current,
        isCurrentMonth: current.getMonth() === agendaDate.getMonth(),
      })
    }

    return cells
  }

  const agendaDays = getAgendaMonthDays()

  const agendaYearMonths = Array.from({ length: 12 }, (_, monthIndex) => {
    const monthLabel = new Date(agendaDate.getFullYear(), monthIndex, 1).toLocaleDateString('fr-FR', {
      month: 'long',
    })

    return {
      monthIndex,
      label: monthLabel,
      events: agendaEvents.filter((event) => {
        const eventDate = new Date(`${event.date}T00:00:00`)
        return eventDate.getFullYear() === agendaDate.getFullYear() && eventDate.getMonth() === monthIndex
      }).length,
    }
  })

  const handleAgendaMonthChange = (offset: number) => {
    const nextMonth = new Date(agendaDate)
    nextMonth.setMonth(nextMonth.getMonth() + offset)
    setAgendaDate(nextMonth)
    setAgendaSelectedDate(null)
  }

  const resetAgendaToToday = () => {
    const today = new Date()
    setAgendaDate(today)
    setAgendaSelectedDate(null)
  }

  const handleTransportDriverSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const payload = {
      first_name: transportForm.first_name.trim(),
      last_name: transportForm.last_name.trim(),
      phone: transportForm.phone.trim(),
      license_number: transportForm.license_number.trim(),
      license_category: transportForm.license_category.trim() || 'B',
      license_expiry_date: transportForm.license_expiry_date || undefined,
      hire_date: transportForm.hire_date || undefined,
      status: transportForm.status,
      notes: transportForm.notes.trim(),
      vehicle_id: transportForm.vehicle_id ? Number(transportForm.vehicle_id) : undefined,
      vehicle_type: transportActiveCategory,
    }

    if (!payload.first_name || !payload.last_name || !payload.phone || !payload.license_number) {
      setMessage('Merci de remplir les informations du chauffeur.')
      return
    }

    try {
      const endpoint = transportFormMode === 'edit' && editingDriverId !== null
        ? `${apiBaseUrl}/transport/drivers/${editingDriverId}`
        : `${apiBaseUrl}/transport/drivers`

      const response = await fetch(endpoint, {
        method: transportFormMode === 'edit' ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => ({}))) as { data?: { message?: string } }
        throw new Error(errorPayload.data?.message || 'Erreur lors de l’enregistrement du chauffeur.')
      }

      setMessage('Chauffeur enregistré avec succès.')
      setIsTransportDriverFormOpen(false)
      resetTransportForm()
      await loadTransportSummary()
      await loadTransportData()
    } catch (error) {
      console.error('Erreur ajout chauffeur :', error)
      setMessage(error instanceof Error ? error.message : 'Impossible d’enregistrer ce chauffeur.')
    }
  }

  const handleTransportDriverStatusUpdate = async (driverId: number, status: string) => {
    try {
      const response = await fetch(`${apiBaseUrl}/transport/drivers/${driverId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Impossible de mettre à jour le statut du chauffeur.')
      }

      await loadTransportSummary()
      await loadTransportData()
    } catch (error) {
      console.error('Erreur mise à jour chauffeur :', error)
      setMessage(error instanceof Error ? error.message : 'Erreur lors de la mise à jour du chauffeur.')
    }
  }

  const handleImportPlan = () => {
    if (isImportingPlan) {
      return
    }

    setMessage('')
    planFileInputRef.current?.click()
  }

  const handlePlanFileSelected = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    if (!selectedBtpProjectId) {
      setMessage('Sélectionnez un projet BTP avant d’importer un plan.')
      return
    }

    const extension = file.name.includes('.')
      ? `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`
      : ''
    const normalizedMime = file.type?.toLowerCase() || ''

    if (!acceptedPlanExtensions.includes(extension)) {
      setMessage('Format de fichier non pris en charge. Utilisez PNG, JPG, JPEG ou PDF.')
      return
    }

    if (normalizedMime && !acceptedPlanMimeTypes.has(normalizedMime)) {
      setMessage('Type MIME du fichier non pris en charge. Utilisez PNG, JPG, JPEG ou PDF.')
      return
    }

    if (file.size > 25 * 1024 * 1024) {
      setMessage('Le plan est trop volumineux. La taille maximale autorisée est de 25 Mo.')
      return
    }

    setIsImportingPlan(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('project_id', String(selectedBtpProjectId))
      formData.append('plan_type', 'other')

      const response = await fetch(`${apiBaseUrl}/btp/plans`, {
        method: 'POST',
        body: formData,
      })
      const payload = (await response.json()) as {
        data?: BtpPlan
        error?: { message?: string }
      }
      if (!response.ok) {
        throw new Error(payload.error?.message || `HTTP ${response.status}`)
      }
      await loadBtpPlans()
    } catch (error) {
      console.error('Erreur importation plan BTP :', error)
      setMessage(
        error instanceof Error
          ? error.message
          : "Impossible d'importer le plan.",
      )
    } finally {
      setIsImportingPlan(false)
    }
  }

  useEffect(() => {
    if (view === 'btp') {
      void loadBtpProjects()
      void loadBtpPlans()
    }
  }, [view])

  useEffect(() => {
    if (view === 'transport') {
      void loadTransportSummary()
      void loadTransportData()
    }
  }, [view, transportSelectedCategory])

  useEffect(() => {
    if (btpPlans.length < 2) {
      return
    }

    const timer = window.setInterval(() => {
      setBtpPlanIndex((current) => (current + 1) % btpPlans.length)
    }, 5000)

    return () => {
      window.clearInterval(timer)
    }
  }, [btpPlans.length])

  useEffect(() => {
    const savedTheme = localStorage.getItem('beaterra_theme')

    if (savedTheme === 'dark' || savedTheme === 'light') {
      setTheme(savedTheme)
    }

    const savedCode = localStorage.getItem(ACCESS_CODE_KEY)
    const savedPasswordHash = localStorage.getItem(PASSWORD_HASH_KEY)

    if (savedCode) {
      setSecurityCode('••••••••')
      setLockMessage('Saisissez votre mot de passe pour continuer.')
    } else if (savedPasswordHash) {
      setSecurityCode('••••••••')
      setLockMessage('Saisissez votre mot de passe pour continuer.')
    } else {
      setLockMessage('Définissez un mot de passe pour activer le verrouillage.')
    }

    setIsAppLocked(true)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('beaterra_theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem(AGENDA_EVENTS_KEY, JSON.stringify(agendaEvents))
  }, [agendaEvents])

  useEffect(() => {
    localStorage.setItem(AGENDA_IMPORTANT_DAYS_KEY, JSON.stringify(agendaImportantDays))
  }, [agendaImportantDays])

  const pageTitle = useMemo(() => {
    const item = navigation.find((entry) => entry.id === view)

    return item ? item.label : 'Tableau de bord'
  }, [view])

  const handleNavigateToView = (nextView: View) => {
    setNavigationHistory((current) => {
      const last = current[current.length - 1]

      if (last === nextView) {
        return current
      }

      return [...current, nextView]
    })
    setView(nextView)
  }

  const handleBackNavigation = () => {
    if (transportSelectedCategory !== 'overview') {
      setTransportSelectedCategory('overview')
      return
    }

    if (navigationHistory.length <= 1) {
      setView('dashboard')
      return
    }

    const previousView = navigationHistory[navigationHistory.length - 2] ?? 'dashboard'

    setNavigationHistory((current) => current.slice(0, -1))
    setView(previousView)
  }

  const changeSecurityCode = async () => {
    const nextCode = newCode
    const confirmation = confirmNewCode

    if (!nextCode) {
      setMessage('Le mot de passe ne peut pas être vide.')
      return
    }

    if (nextCode.length < 6) {
      setMessage('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    if (nextCode !== confirmation) {
      setMessage('Les deux saisies du mot de passe ne correspondent pas.')
      return
    }

    localStorage.setItem(ACCESS_CODE_KEY, nextCode)
    setSecurityCode('••••••••')
    setNewCode('')
    setConfirmNewCode('')
    setMessage('Mot de passe enregistré avec sécurité.')
  }

  const handleLogout = () => {
    sessionStorage.removeItem('beaterra_session')
    localStorage.removeItem('beaterra_session')
    setNavigationHistory(['dashboard'])
    setView('dashboard')
    setLockCode('')
    setIsAppLocked(true)
    setLockMessage('Saisissez votre mot de passe pour continuer.')
    setMessage('Session déconnectée.')
  }

  const handleUnlockApp = async () => {
    const currentCode = lockCode

    if (!currentCode) {
      setLockMessage('Veuillez saisir un mot de passe.')
      return
    }

    const savedCode = localStorage.getItem(ACCESS_CODE_KEY)
    const savedHash = localStorage.getItem(PASSWORD_HASH_KEY)

    if (savedCode && currentCode === savedCode) {
      setIsAppLocked(false)
      setLockCode('')
      setLockMessage('Saisissez votre mot de passe pour continuer.')
      return
    }

    if (savedHash && (await verifyAccessPassword(currentCode, savedHash))) {
      setIsAppLocked(false)
      setLockCode('')
      setLockMessage('Saisissez votre mot de passe pour continuer.')
      return
    }

    setLockMessage('Mot de passe invalide. Veuillez réessayer.')
    setLockCode('')
  }

  useEffect(() => {
    if (!isAppLocked || !lockCode) {
      return
    }

    const savedCode = localStorage.getItem(ACCESS_CODE_KEY)

    if (savedCode && lockCode === savedCode) {
      void handleUnlockApp()
      return
    }

    const tryAutoUnlock = async () => {
      const savedHash = localStorage.getItem(PASSWORD_HASH_KEY)

      if (!savedHash) {
        return
      }

      const isValidHash = await verifyAccessPassword(lockCode, savedHash)

      if (isValidHash) {
        void handleUnlockApp()
      }
    }

    void tryAutoUnlock()
  }, [isAppLocked, lockCode])

  return (
    <div className={'app-shell ' + theme}>
      <button
        type="button"
        className={'sidebar-toggle-floating ' + (isSidebarCollapsed ? 'collapsed' : '')}
        onClick={() => setIsSidebarCollapsed((current) => !current)}
        aria-label={isSidebarCollapsed ? 'Afficher la barre latérale' : 'Masquer la barre latérale'}
      >
        {isSidebarCollapsed ? (
          <PanelLeftOpen aria-hidden="true" size={18} strokeWidth={1.8} />
        ) : (
          <PanelLeftClose aria-hidden="true" size={18} strokeWidth={1.8} />
        )}
      </button>

      {isAppLocked && (
        <div className="lock-screen-backdrop">
          <div className="lock-screen-panel">
            <div className="lock-screen-brand">
              <img
                src={logo}
                alt="Logo officiel BEATERRA"
                className="lock-screen-logo"
              />
            </div>

            <div className="lock-screen-copy">
              <p className="eyebrow">CONNEXION</p>
              <h2>Accès sécurisé</h2>
              <p>{lockMessage}</p>
            </div>

            <label className="lock-screen-input">
              <span>Mot de passe</span>
              <div className="password-input-shell">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={lockCode}
                  onChange={(event) => setLockCode(event.target.value)}
                  placeholder="Votre mot de passe"
                />
                <button
                  type="button"
                  className="password-visibility-button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff aria-hidden="true" size={16} /> : <Eye aria-hidden="true" size={16} />}
                </button>
              </div>
            </label>

            <button type="button" className="primary-button" onClick={() => void handleUnlockApp()}>
              Déverrouiller
            </button>
          </div>
        </div>
      )}

      <aside className={'sidebar ' + (isSidebarCollapsed ? 'collapsed' : '')}>
        <div className="brand">
          <img
            src={logo}
            alt="BEATERRA"
            className="brand-logo"
          />

          <div className="brand-version">
            OS • Direction
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group-label">
            NAVIGATION
          </div>

          {navigation.map((item) => (
            <button
              key={item.id}
              type="button"
              className={
                'nav-item ' +
                (view === item.id ? 'active' : '')
              }
              onClick={() => {
                handleNavigateToView(item.id)
                setMessage('')
              }}
            >
              <span className="nav-icon">
                <item.icon aria-hidden="true" size={17} strokeWidth={1.8} />
              </span>

              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="system-status">
            <span className="status-dot" />

            <div>
              <strong>
                Système opérationnel
              </strong>

              <span>
                BEATERRA OS
              </span>
            </div>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            <LogOut aria-hidden="true" size={16} strokeWidth={1.8} />
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-main">
            {(transportSelectedCategory !== 'overview' || view !== 'dashboard') && (
              <button type="button" className="back-button" onClick={handleBackNavigation}>
                <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.8} />
                <span>Retour</span>
              </button>
            )}

            <div>
              <p className="eyebrow">
                BEATERRA OS
              </p>

              <h1>{pageTitle}</h1>

              <p className="subtitle">
                Pilotage centralisé des activités de BEATERRA.
              </p>
            </div>
          </div>

          <div className="profile-badge">
            <span className="profile-avatar">
              PDG
            </span>

            <div>
              <strong>
                Direction
              </strong>

              <span>
                Fondateur
              </span>
            </div>
          </div>
        </header>

        {view === 'dashboard' && (
          <>
            <section className="hero-card">
              <div>
                <span className="hero-label">
                  BEATERRA
                </span>

                <h2>
                  Bâtir et développer la terre avec excellence.
                </h2>

                <p>
                  Pilotez vos activités, vos projets, vos
                  ressources et vos finances depuis un espace
                  unique.
                </p>
              </div>

              <ProfileSlideshow />
            </section>

            <section className="stats-grid">
              <article className="stat-card">
                <span>Projets BTP</span>
                <strong>0</strong>
                <small>À suivre</small>
              </article>

              <article className="stat-card">
                <span>Véhicules</span>
                <strong>0</strong>
                <small>Parc actuel</small>
              </article>

              <article className="stat-card">
                <span>Solde financier</span>
                <strong>0 FCFA</strong>
                <small>Solde actuel</small>
              </article>

              <article className="stat-card">
                <span>Opérations</span>
                <strong>0</strong>
                <small>Tous pôles confondus</small>
              </article>
            </section>

            <section className="dashboard-grid">
              <article className="panel panel-large">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">
                      ÉVOLUTION
                    </p>

                    <h2>
                      Activité globale
                    </h2>
                  </div>

                  <span className="period-badge">
                    7 jours
                  </span>
                </div>

                <EmptyLineChart />
              </article>

              <article className="panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">
                      RÉPARTITION
                    </p>

                    <h2>
                      Activité par pôle
                    </h2>
                  </div>
                </div>

                <EmptyBarChart />
              </article>
            </section>

            <section className="section-block">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">
                    ACTIVITÉS
                  </p>

                  <h2>
                    Les quatre pôles
                  </h2>
                </div>
              </div>

              <div className="poles-grid">
                {poles.map((pole) => (
                  <button
                    key={pole.id}
                    type="button"
                    className="pole-card"
                    onClick={() => handleNavigateToView(pole.id)}
                  >
                    <span
                      className={
                        'pole-icon ' + pole.id
                      }
                    >
                      <pole.icon
                        aria-hidden="true"
                        size={23}
                        strokeWidth={1.7}
                      />
                    </span>

                    <span className="pole-content">
                      <strong>
                        {pole.name}
                      </strong>

                      <span>
                        {pole.description}
                      </span>
                    </span>

                    <span className="arrow">
                      <ArrowRight
                        aria-hidden="true"
                        size={17}
                        strokeWidth={1.8}
                      />
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        {view === 'btp' && (
          <section className="module-page">
            <div className="module-hero">
              <BtpSlideshow />

              <div className="btp-hero-copy">
                <p className="eyebrow">
                  PÔLE BTP
                </p>

                <h2>
                  BTP
                </h2>

                <p>
                  Consultez vos plans, projets et documents de
                  construction depuis un espace unique.
                </p>
              </div>

              <div className="btp-hero-actions">
                <button
                  type="button"
                  className="primary-button"
                  onClick={handleImportPlan}
                  disabled={isImportingPlan}
                >
                  {isImportingPlan
                    ? 'Importation...'
                    : '+ Importer un plan'}
                </button>
                <label className="btp-project-selector">
                  <span>Projet</span>
                  <select
                    value={selectedBtpProjectId ?? ''}
                    onChange={(event) =>
                      setSelectedBtpProjectId(
                        event.target.value
                          ? Number(event.target.value)
                          : undefined,
                      )
                    }
                    disabled={btpProjects.length === 0}
                  >
                    {btpProjects.length === 0 ? (
                      <option value="">Aucun projet disponible</option>
                    ) : (
                      btpProjects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name} ({project.code})
                        </option>
                      ))
                    )}
                  </select>
                </label>
              </div>
            </div>
            <input
              ref={planFileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
              onChange={handlePlanFileSelected}
              hidden
            />

            <section className="btp-plan-display panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">
                    PLANS
                  </p>

                  <h2>
                    Plans récents
                  </h2>
                </div>

                <span className="period-badge">
                  {btpPlans.length} plan
                  {btpPlans.length > 1 ? 's' : ''}
                </span>
              </div>

              {btpPlans.length > 0 ? (
                <>
                  <div className="btp-plan-stage">
                    {(() => {
                      const plan = btpPlans[btpPlanIndex]

                      if (!plan) {
                        return null
                      }

                      const fileType = String(
                        plan.file_type ||
                        plan.plan_type ||
                        ''
                      ).toLowerCase()

                      const isImage = [
                        'png',
                        'jpg',
                        'jpeg',
                        'webp',
                      ].includes(fileType)

                      if (
                        isImage &&
                        plan.file_path
                      ) {
                        return (
                          <div
                            key={plan.id}
                            className="btp-plan-slide"
                          >
                            <img
                              src={plan.file_url || ''}
                              alt={
                                plan.plan_name ||
                                plan.file_name ||
                                'Plan BTP'
                              }
                              className="btp-plan-image"
                            />
                            <div className="btp-plan-overlay">
                              <strong>
                                {plan.client ||
                                  plan.plan_name ||
                                  plan.file_name ||
                                  'Plan BTP'}
                              </strong>
                              <span>
                                {(
                                  plan.plan_type ||
                                  plan.file_type ||
                                  'DOCUMENT'
                                ).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        )
                      }

                      if (
                        fileType === 'pdf' &&
                        plan.file_path
                      ) {
                        return (
                          <div
                            key={plan.id}
                            className="btp-plan-slide"
                          >
                            <iframe
                              src={plan.file_url || ''}
                              title={
                                plan.plan_name ||
                                plan.file_name ||
                                'Plan BTP'
                              }
                              className="btp-plan-pdf"
                            />
                            <div className="btp-plan-overlay">
                              <strong>
                                {plan.client ||
                                  plan.plan_name ||
                                  plan.file_name ||
                                  'Plan BTP'}
                              </strong>
                              <span>
                                {(
                                  plan.plan_type ||
                                  plan.file_type ||
                                  'PDF'
                                ).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        )
                      }

                      return (
                        <div className="empty-table">
                          <strong>
                            Plan non prévisualisable
                          </strong>

                          <span>
                            Format non pris en charge
                            pour l’aperçu.
                          </span>
                        </div>
                      )
                    })()}
                  </div>

                  <div className="btp-plan-controls">
                    <button
                      type="button"
                      className="plan-arrow"
                      onClick={() =>
                        setBtpPlanIndex(
                          (btpPlanIndex -
                            1 +
                            btpPlans.length) %
                            btpPlans.length
                        )
                      }
                      aria-label="Plan précédent"
                    >
                      <ChevronLeft aria-hidden="true" size={18} strokeWidth={1.8} />
                    </button>

                    <div className="btp-plan-dots">
                      {btpPlans.map(
                        (plan, index) => (
                          <button
                            key={plan.id}
                            type="button"
                            className={
                              'plan-dot ' +
                              (index ===
                              btpPlanIndex
                                ? 'active'
                                : '')
                            }
                            onClick={() =>
                              setBtpPlanIndex(index)
                            }
                            aria-label={
                              'Afficher le plan ' +
                              (index + 1)
                            }
                          />
                        )
                      )}
                    </div>

                    <button
                      type="button"
                      className="plan-arrow"
                      onClick={() =>
                        setBtpPlanIndex(
                          (btpPlanIndex + 1) %
                            btpPlans.length
                        )
                      }
                      aria-label="Plan suivant"
                    >
                      <ChevronRight aria-hidden="true" size={18} strokeWidth={1.8} />
                    </button>
                  </div>

                  <div className="btp-plan-information">
                    <strong>
                      {btpPlans[btpPlanIndex]?.client ||
                        btpPlans[btpPlanIndex]?.plan_name ||
                        btpPlans[btpPlanIndex]?.file_name ||
                        'Plan BTP'}
                    </strong>

                    <span>
                      {(
                        btpPlans[btpPlanIndex]?.plan_type ||
                        btpPlans[btpPlanIndex]?.file_type ||
                        'DOCUMENT'
                      ).toUpperCase() ||
                        'DOCUMENT'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="btp-plan-empty">
                  <strong>
                    Aucun plan importé
                  </strong>

                  <span>
                    Importez votre premier plan pour
                    l’afficher ici.
                  </span>
                </div>
              )}
            </section>

            <section className="dashboard-grid">
              <article className="panel panel-large">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">
                      ÉVOLUTION
                    </p>

                    <h2>
                      Activité BTP
                    </h2>
                  </div>

                  <span className="period-badge">
                    7 jours
                  </span>
                </div>

                <EmptyLineChart />
              </article>

              <article className="panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">
                      PROJETS
                    </p>

                    <h2>
                      Projets BTP
                    </h2>
                  </div>
                </div>

                <div className="empty-table">
                  <strong>
                    Aucun projet à afficher
                  </strong>

                  <span>
                    Les projets apparaîtront ici.
                  </span>
                </div>
              </article>
            </section>
          </section>
        )}

        {view === 'transport' && (
          <section className="module-page">
            <div className="module-hero">
              <div>
                <p className="eyebrow">
                  {transportHeroEyebrow}
                </p>

                <h2>
                  {transportHeroTitle}
                </h2>

                <p>
                  {transportHeroDescription}
                </p>
              </div>

              <TransportSlideshow
                images={currentTransportHeroImage}
                alt={
                  transportSelectedCategory === 'overview'
                    ? 'Véhicule de transport'
                    : `${transportHeroTitle} BEATERRA`
                }
              />
            </div>

            {transportSelectedCategory === 'overview' && (
              <>
                <div className="transport-category-grid">
                  {transportCategories.map((category) => {
                    const summary = transportSummary[category.id]
                    const imageSource =
                      transportImageByName[`${category.id === 'truck' ? 'camion' : category.id === 'bus' ? 'bus' : category.id === 'taxi' ? 'taxi' : 'moto'}.png`] ||
                      transportImages[0]

                    return (
                      <button
                        key={category.id}
                        type="button"
                        className="transport-category-card"
                        onClick={() => setTransportSelectedCategory(category.id)}
                      >
                        <img src={imageSource} alt={category.label} />
                        <div className="transport-card-content">
                          <span className="transport-card-icon">
                            <category.icon aria-hidden="true" size={18} strokeWidth={2} />
                          </span>
                          <strong>{category.label}</strong>
                          <small>
                            {summary.total} véhicule{summary.total > 1 ? 's' : ''}
                          </small>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <section className="dashboard-grid">
                  <article className="panel panel-large">
                    <div className="panel-heading">
                      <div>
                        <p className="eyebrow">ÉVOLUTION</p>
                        <h2>Activité Transport</h2>
                      </div>
                      <span className="period-badge">7 jours</span>
                    </div>
                    <EmptyLineChart />
                  </article>

                  <article className="panel">
                    <div className="panel-heading">
                      <div>
                        <p className="eyebrow">RÉPARTITION</p>
                        <h2>Par catégorie</h2>
                      </div>
                    </div>
                    <EmptyBarChart />
                  </article>
                </section>
              </>
            )}

            {transportSelectedCategory !== 'overview' && (
              <section className="transport-management panel">
                <div className="panel-heading transport-panel-heading">
                  <div>
                    <p className="eyebrow">GESTION</p>
                    <h2>
                      {transportCategoryTitle[transportSelectedCategory]}
                    </h2>
                  </div>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={openTransportDriverForm}
                  >
                    + Ajouter un chauffeur
                  </button>
                </div>

                <div className="transport-stat-grid transport-vehicle-stat-grid">
                  {transportSpecificCards.map((card) => (
                    <article key={card.label} className="transport-stat-item">
                      <span>{card.label}</span>
                      <strong>{card.value}</strong>
                      <small>{card.suffix}</small>
                    </article>
                  ))}
                </div>

                {isTransportDriverFormOpen && (
                  <form className="transport-form" onSubmit={handleTransportDriverSubmit}>
                    <div className="transport-form-grid">
                      <label>
                        <span>Numéro d'identification</span>
                        <input value="Généré automatiquement" readOnly />
                      </label>
                      <label>
                        <span>Nom complet</span>
                        <input
                          name="first_name"
                          value={transportForm.first_name}
                          onChange={handleTransportInputChange}
                          placeholder="Prénom"
                        />
                      </label>
                      <label>
                        <span>Nom</span>
                        <input
                          name="last_name"
                          value={transportForm.last_name}
                          onChange={handleTransportInputChange}
                          placeholder="Nom"
                        />
                      </label>
                      <label>
                        <span>Téléphone</span>
                        <input
                          name="phone"
                          value={transportForm.phone}
                          onChange={handleTransportInputChange}
                          placeholder="+221 ..."
                        />
                      </label>
                      <label>
                        <span>Numéro de permis</span>
                        <input
                          name="license_number"
                          value={transportForm.license_number}
                          onChange={handleTransportInputChange}
                          placeholder="Permis"
                        />
                      </label>
                      <label>
                        <span>Catégorie de permis</span>
                        <input
                          name="license_category"
                          value={transportForm.license_category}
                          onChange={handleTransportInputChange}
                          placeholder="B"
                        />
                      </label>
                      <label>
                        <span>Date d’expiration</span>
                        <input
                          name="license_expiry_date"
                          type="date"
                          value={transportForm.license_expiry_date}
                          onChange={handleTransportInputChange}
                        />
                      </label>
                      <label>
                        <span>Type de véhicule</span>
                        <input value={transportCategories.find((category) => category.id === transportSelectedCategory)?.label ?? 'Moto'} readOnly />
                      </label>
                      <label>
                        <span>Véhicule affecté</span>
                        <select
                          name="vehicle_id"
                          value={transportForm.vehicle_id}
                          onChange={handleTransportInputChange}
                        >
                          <option value="">Aucun véhicule</option>
                          {transportVehicles.map((vehicle) => (
                            <option key={vehicle.id} value={vehicle.id}>
                              {vehicle.registration_number} · {vehicle.brand} {vehicle.model}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span>Immatriculation</span>
                        <input value={transportVehicles.find((vehicle) => String(vehicle.id) === transportForm.vehicle_id)?.registration_number ?? '—'} readOnly />
                      </label>
                      <label>
                        <span>Date d’entrée</span>
                        <input
                          name="hire_date"
                          type="date"
                          value={transportForm.hire_date}
                          onChange={handleTransportInputChange}
                        />
                      </label>
                      <label>
                        <span>Statut</span>
                        <select
                          name="status"
                          value={transportForm.status}
                          onChange={handleTransportInputChange}
                        >
                          <option value="active">Actif</option>
                          <option value="inactive">Inactif</option>
                          <option value="on_leave">En congé</option>
                          <option value="suspended">Suspendu</option>
                        </select>
                      </label>
                      <label className="transport-form-full">
                        <span>Notes / observations</span>
                        <textarea
                          name="notes"
                          value={transportForm.notes}
                          onChange={handleTransportInputChange}
                          rows={3}
                          placeholder="Observations"
                        />
                      </label>
                    </div>

                    <div className="transport-form-actions">
                      <button type="button" className="secondary-button" onClick={() => setIsTransportDriverFormOpen(false)}>
                        Annuler
                      </button>
                      <button type="submit" className="primary-button">
                        {transportFormMode === 'edit' ? 'Enregistrer' : 'Ajouter'}
                      </button>
                    </div>
                  </form>
                )}

                <div className="transport-chauffeurs-header">
                  <div>
                    <p className="eyebrow">CHAUFFEURS</p>
                    <h3>
                      {transportCategories.find((category) => category.id === transportSelectedCategory)?.label}
                    </h3>
                  </div>
                </div>

                <div className="transport-table-toolbar">
                  <input
                    type="search"
                    value={transportSearch}
                    onChange={(event) => setTransportSearch(event.target.value)}
                    placeholder="Rechercher par nom, téléphone, permis, immatriculation..."
                  />
                  <select
                    value={transportStatusFilter}
                    onChange={(event) => setTransportStatusFilter(event.target.value)}
                  >
                    <option value="all">Tous</option>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                    <option value="on_leave">En congé</option>
                    <option value="suspended">Suspendu</option>
                  </select>
                </div>

                <div className="transport-table-wrap">
                  <table className="transport-table">
                    <thead>
                      <tr>
                        <th>N°</th>
                        <th>Nom complet</th>
                        <th>Téléphone</th>
                        <th>N° de permis</th>
                        <th>Catégorie</th>
                        <th>Véhicule affecté</th>
                        <th>Immatriculation</th>
                        <th>Statut</th>
                        <th>Date d’entrée</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transportDrivers
                        .filter((driver) => {
                          const matchesStatus =
                            transportStatusFilter === 'all' || driver.status === transportStatusFilter

                          const matchesSearch =
                            !transportSearch.trim() ||
                            `${driver.full_name} ${driver.phone} ${driver.driver_code} ${driver.license_number} ${driver.registration_number ?? ''}`
                              .toLowerCase()
                              .includes(transportSearch.trim().toLowerCase())

                          return matchesStatus && matchesSearch
                        })
                        .map((driver) => (
                          <tr key={driver.id}>
                            <td>{driver.driver_code}</td>
                            <td>{driver.full_name}</td>
                            <td>{driver.phone}</td>
                            <td>{driver.license_number}</td>
                            <td>{driver.license_category}</td>
                            <td>{driver.brand && driver.model ? `${driver.brand} ${driver.model}` : '—'}</td>
                            <td>{driver.registration_number || '—'}</td>
                            <td>
                              <span className={'transport-status transport-status-' + driver.status}>
                                {driver.status === 'active'
                                  ? 'Actif'
                                  : driver.status === 'inactive'
                                    ? 'Inactif'
                                    : driver.status === 'on_leave'
                                      ? 'En congé'
                                      : 'Suspendu'}
                              </span>
                            </td>
                            <td>{driver.hire_date ? new Date(driver.hire_date).toLocaleDateString('fr-FR') : '—'}</td>
                            <td>
                              <div className="transport-actions">
                                <button type="button" className="table-action-link" onClick={() => {
                                  setTransportForm({
                                    first_name: driver.first_name,
                                    last_name: driver.last_name,
                                    phone: driver.phone,
                                    license_number: driver.license_number,
                                    license_category: driver.license_category,
                                    license_expiry_date: driver.license_expiry_date ?? '',
                                    hire_date: driver.hire_date ?? '',
                                    status: driver.status,
                                    notes: driver.notes ?? '',
                                    vehicle_id: driver.vehicle_id ? String(driver.vehicle_id) : '',
                                  })
                                  setEditingDriverId(driver.id)
                                  setTransportFormMode('edit')
                                  setIsTransportDriverFormOpen(true)
                                }}>
                                  Voir
                                </button>
                                <button type="button" className="table-action-link" onClick={() => {
                                  setTransportForm({
                                    first_name: driver.first_name,
                                    last_name: driver.last_name,
                                    phone: driver.phone,
                                    license_number: driver.license_number,
                                    license_category: driver.license_category,
                                    license_expiry_date: driver.license_expiry_date ?? '',
                                    hire_date: driver.hire_date ?? '',
                                    status: driver.status,
                                    notes: driver.notes ?? '',
                                    vehicle_id: driver.vehicle_id ? String(driver.vehicle_id) : '',
                                  })
                                  setEditingDriverId(driver.id)
                                  setTransportFormMode('edit')
                                  setIsTransportDriverFormOpen(true)
                                }}>
                                  Modifier
                                </button>
                                <button type="button" className="table-action-link danger" onClick={() => {
                                  if (window.confirm('Désactiver ce chauffeur ?')) {
                                    void handleTransportDriverStatusUpdate(driver.id, 'inactive')
                                  }
                                }}>
                                  Désactiver
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </section>
        )}

        {view !== 'dashboard' &&
          view !== 'btp' &&
          view !== 'transport' &&
          view !== 'settings' &&
          view !== 'finances' &&
          view !== 'agenda' && (
            <section className="module-page">
              <div className="module-hero">
                <div>
                  <p className="eyebrow">
                    MODULE
                  </p>

                  <h2>
                    {pageTitle}
                  </h2>

                  <p>
                    Les données apparaîtront ici dès que
                    les premières opérations seront
                    enregistrées.
                  </p>
                </div>

                <div className="module-number">
                  {(() => {
                    const Icon = moduleIcons[view]
                    return (
                      <Icon
                        aria-hidden="true"
                        size={38}
                        strokeWidth={1.5}
                      />
                    )
                  })()}
                </div>
              </div>

              <div className="dashboard-grid">
                <article className="panel panel-large">
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow">
                        ÉVOLUTION
                      </p>

                      <h2>
                        Activité du module
                      </h2>
                    </div>
                  </div>

                  <EmptyLineChart />
                </article>

                <article className="panel">
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow">
                        DONNÉES
                      </p>

                      <h2>
                        Activité récente
                      </h2>
                    </div>
                  </div>

                  <div className="empty-table">
                    <strong>
                      Aucune donnée enregistrée
                    </strong>

                    <span>
                      Les informations apparaîtront
                      automatiquement ici.
                    </span>
                  </div>
                </article>
              </div>
            </section>
          )}

        {view === 'finances' && (
          <section className="module-page">
            <div className="module-hero">
              <div>
                <p className="eyebrow">
                  MODULE FINANCIER
                </p>

                <h2>
                  Finances BEATERRA
                </h2>

                <p>
                  Suivi des recettes, dépenses, soldes
                  et transactions.
                </p>
              </div>

              <div className="module-number">
                <WalletCards
                  aria-hidden="true"
                  size={38}
                  strokeWidth={1.5}
                />
              </div>
            </div>

            <section className="stats-grid finance-stats">
              <article className="stat-card">
                <span>
                  Recettes
                </span>

                <strong>
                  0 FCFA
                </strong>

                <small>
                  Total enregistré
                </small>
              </article>

              <article className="stat-card">
                <span>
                  Dépenses
                </span>

                <strong>
                  0 FCFA
                </strong>

                <small>
                  Total enregistré
                </small>
              </article>

              <article className="stat-card">
                <span>
                  Solde
                </span>

                <strong>
                  0 FCFA
                </strong>

                <small>
                  Recettes - dépenses
                </small>
              </article>

              <article className="stat-card">
                <span>
                  Transactions
                </span>

                <strong>
                  0
                </strong>

                <small>
                  Opérations financières
                </small>
              </article>
            </section>

            <div className="dashboard-grid">
              <article className="panel panel-large">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">
                      ÉVOLUTION
                    </p>

                    <h2>
                      Évolution du solde
                    </h2>
                  </div>

                  <span className="period-badge">
                    30 jours
                  </span>
                </div>

                <EmptyLineChart />
              </article>

              <article className="panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">
                      FLUX FINANCIERS
                    </p>

                    <h2>
                      Recettes / dépenses
                    </h2>
                  </div>
                </div>

                <EmptyBarChart />
              </article>
            </div>

            <article className="panel transactions-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">
                    JOURNAL
                  </p>

                  <h2>
                    Dernières transactions
                  </h2>
                </div>
              </div>

              <div className="empty-table">
                <strong>
                  Aucune transaction enregistrée
                </strong>

                <span>
                  Les mouvements financiers
                  apparaîtront ici.
                </span>
              </div>
            </article>
          </section>
        )}

        {view === 'agenda' && (
          <section className="module-page">
            <div className="module-hero">
              <div>
                <p className="eyebrow">
                  AGENDA PDG
                </p>

                <h2>
                  Organisation et priorités
                </h2>

                <p>
                  Planning, tâches, priorités et suivi
                  des activités du PDG.
                </p>
              </div>

              <div className="module-number">
                <CalendarDays
                  aria-hidden="true"
                  size={38}
                  strokeWidth={1.5}
                />
              </div>
            </div>

            <div className="agenda-shell">
              <article className="panel agenda-panel">
                <div className="panel-heading agenda-panel-heading">
                  <div>
                    <p className="eyebrow">
                      PLANNING
                    </p>

                    <h2>
                      Agenda
                    </h2>
                  </div>

                  <div className="agenda-controls">
                    <button
                      type="button"
                      className="agenda-nav-button"
                      onClick={() => handleAgendaMonthChange(-1)}
                      aria-label="Mois précédent"
                    >
                      <ChevronLeft aria-hidden="true" size={15} strokeWidth={2} />
                    </button>
                    <button type="button" className="agenda-today-button" onClick={resetAgendaToToday}>
                      {agendaView === 'month' ? agendaMonthLabel : agendaYearLabel}
                    </button>
                    <button
                      type="button"
                      className="agenda-nav-button"
                      onClick={() => handleAgendaMonthChange(1)}
                      aria-label="Mois suivant"
                    >
                      <ChevronRight aria-hidden="true" size={15} strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      className="agenda-view-toggle"
                      onClick={() => setAgendaView((current) => (current === 'month' ? 'year' : 'month'))}
                    >
                      {agendaView === 'month' ? 'Vue annuelle' : 'Vue mensuelle'}
                    </button>
                  </div>
                </div>

                {agendaView === 'month' ? (
                  <div className="agenda-calendar">
                    <div className="agenda-week-header">
                      <span className="agenda-week-label">Sem.</span>
                      {agendaWeekDays.map((day) => (
                        <span key={day}>{day}</span>
                      ))}
                    </div>

                    <div className="agenda-month-grid">
                      {Array.from({ length: 6 }, (_, rowIndex) => {
                        const weekDates = agendaDays.slice(rowIndex * 7, rowIndex * 7 + 7)
                        const weekNumber = getWeekNumber(weekDates[0].date)

                        return (
                          <div key={weekNumber} className="agenda-week-row">
                            <span className="agenda-week-number">{weekNumber}</span>
                            {weekDates.map(({ date, isCurrentMonth }) => {
                              const isToday =
                                date.getFullYear() === new Date().getFullYear() &&
                                date.getMonth() === new Date().getMonth() &&
                                date.getDate() === new Date().getDate()
                              const events = getAgendaCellEvents(date)
                              const isImportant = Boolean(agendaImportantDays[formatAgendaDateKey(date)])

                              return (
                                <button
                                  key={`${formatAgendaDateKey(date)}-${rowIndex}`}
                                  type="button"
                                  className={
                                    'agenda-day ' +
                                    (isCurrentMonth ? 'in-month' : 'outside-month') +
                                    (isToday ? ' today' : '') +
                                    (isImportant ? ' important' : '')
                                  }
                                  onClick={() => openAgendaDateEditor(date)}
                                >
                                  <div className="agenda-day-header">
                                    <span className="agenda-day-number">{date.getDate()}</span>
                                    {isImportant && <span className="agenda-important-marker">★</span>}
                                  </div>

                                  {events.slice(0, 2).map((event) => (
                                    <span
                                      key={event.id}
                                      className={'agenda-event-pill ' + event.priority}
                                    >
                                      {event.title}
                                    </span>
                                  ))}

                                  {events.length > 2 && (
                                    <span className="agenda-more-events">+{events.length - 2}</span>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="agenda-year-view">
                    {agendaYearMonths.map((month) => (
                      <button
                        key={month.monthIndex}
                        type="button"
                        className="agenda-year-month"
                        onClick={() => {
                          const nextDate = new Date(agendaDate)
                          nextDate.setMonth(month.monthIndex)
                          setAgendaDate(nextDate)
                          setAgendaView('month')
                        }}
                      >
                        <span>{month.label}</span>
                        <strong>{month.events}</strong>
                      </button>
                    ))}
                  </div>
                )}
              </article>

              <aside className="panel agenda-side-panel">
                <div className="panel-heading agenda-side-heading">
                  <div>
                    <p className="eyebrow">
                      {agendaSelectedDate ? 'JOUR SÉLECTIONNÉ' : 'PLANIFICATION'}
                    </p>
                    <h2>
                      {agendaSelectedDate
                        ? new Date(`${agendaSelectedDate}T00:00:00`).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Choisir une date'}
                    </h2>
                  </div>

                  {agendaSelectedDate && (
                    <button
                      type="button"
                      className="agenda-add-event-button"
                      onClick={() => openAgendaDateEditor(new Date(`${agendaSelectedDate}T00:00:00`))}
                    >
                      + Ajouter
                    </button>
                  )}
                </div>

                {agendaSelectedDate ? (
                  <>
                    <div className="agenda-day-meta">
                      <span className={'agenda-day-badge ' + (agendaImportantDays[agendaSelectedDate] ? 'important' : 'standard')}>
                        {agendaImportantDays[agendaSelectedDate] ? 'Journée importante' : 'Journée standard'}
                      </span>
                    </div>

                    <div className="agenda-event-list">
                      {getAgendaCellEvents(new Date(`${agendaSelectedDate}T00:00:00`)).length > 0 ? (
                        getAgendaCellEvents(new Date(`${agendaSelectedDate}T00:00:00`)).map((event) => (
                          <div key={event.id} className="agenda-event-item">
                            <div className="agenda-event-card-header">
                              <span className={'agenda-event-tag ' + event.priority}>{event.priority}</span>
                              <span className="agenda-event-category">{event.category}</span>
                            </div>

                            <strong>{event.title}</strong>
                            {event.description && <p>{event.description}</p>}
                            <small>
                              {event.startTime} - {event.endTime}
                            </small>

                            <div className="agenda-event-actions">
                              <button
                                type="button"
                                className="table-action-link"
                                onClick={() => openAgendaDateEditor(new Date(`${event.date}T00:00:00`), event.id)}
                              >
                                Modifier
                              </button>
                              <button
                                type="button"
                                className="table-action-link danger"
                                onClick={() => handleAgendaDelete(event.id)}
                              >
                                Supprimer
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="empty-table agenda-empty-list">
                          <strong>Aucun événement</strong>
                          <span>Ajoutez une réunion, tâche ou rendez-vous.</span>
                        </div>
                      )}
                    </div>

                    <form className="agenda-form" onSubmit={handleAgendaSave}>
                      <div className="agenda-form-row">
                        <label>
                          <span>Titre</span>
                          <input
                            name="title"
                            value={agendaForm.title}
                            onChange={handleAgendaFormChange}
                            placeholder="Réunion stratégique"
                          />
                        </label>
                        <label>
                          <span>Catégorie</span>
                          <select
                            name="category"
                            value={agendaForm.category}
                            onChange={handleAgendaFormChange}
                          >
                            {agendaCategoryOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <label>
                        <span>Description</span>
                        <textarea
                          name="description"
                          value={agendaForm.description}
                          onChange={handleAgendaFormChange}
                          rows={3}
                          placeholder="Détails, objectifs et notes..."
                        />
                      </label>

                      <div className="agenda-form-row">
                        <label>
                          <span>Date</span>
                          <input
                            name="date"
                            type="date"
                            value={agendaForm.date}
                            onChange={handleAgendaFormChange}
                          />
                        </label>
                        <label>
                          <span>Priorité</span>
                          <select
                            name="priority"
                            value={agendaForm.priority}
                            onChange={handleAgendaFormChange}
                          >
                            {agendaPriorityOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <div className="agenda-form-row">
                        <label>
                          <span>Heure de début</span>
                          <input
                            name="startTime"
                            type="time"
                            value={agendaForm.startTime}
                            onChange={handleAgendaFormChange}
                          />
                        </label>
                        <label>
                          <span>Heure de fin</span>
                          <input
                            name="endTime"
                            type="time"
                            value={agendaForm.endTime}
                            onChange={handleAgendaFormChange}
                          />
                        </label>
                      </div>

                      <label className="agenda-check-row">
                        <input
                          type="checkbox"
                          name="important"
                          checked={agendaForm.important}
                          onChange={handleAgendaFormChange}
                        />
                        <span>Marquer cette journée comme importante</span>
                      </label>

                      <div className="agenda-form-actions">
                        <button type="button" className="secondary-button" onClick={resetAgendaForm}>
                          Nouveau
                        </button>
                        <button type="submit" className="primary-button">
                          {agendaEditingId ? 'Enregistrer' : 'Ajouter'}
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="agenda-empty-state">
                    <strong>Choisissez une date</strong>
                    <span>Pour créer un événement, sélectionnez un jour du calendrier.</span>
                  </div>
                )}
              </aside>
            </div>
          </section>
        )}

        {view === 'settings' && (
          <section className="settings-page">
            <div className="settings-grid">
              <article className="panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">
                      SÉCURITÉ
                    </p>

                    <h2>
                      Code de sécurité
                    </h2>
                  </div>
                </div>

                <div className="settings-form">
                  <label>
                    Mot de passe actuel

                    <input
                      type="password"
                      value={securityCode || ''}
                      readOnly
                      placeholder="Aucun mot de passe enregistré"
                    />
                  </label>

                  <label>
                    Nouveau mot de passe

                    <div className="password-input-shell settings-password-shell">
                      <input
                        type={showPasswordSettings ? 'text' : 'password'}
                        value={newCode}
                        onChange={(event) => setNewCode(event.target.value)}
                        placeholder="Au moins 6 caractères"
                      />
                      <button
                        type="button"
                        className="password-visibility-button"
                        onClick={() => setShowPasswordSettings((current) => !current)}
                        aria-label={showPasswordSettings ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      >
                        {showPasswordSettings ? <EyeOff aria-hidden="true" size={16} /> : <Eye aria-hidden="true" size={16} />}
                      </button>
                    </div>
                  </label>

                  <label>
                    Confirmer le mot de passe

                    <input
                      type={showPasswordSettings ? 'text' : 'password'}
                      value={confirmNewCode}
                      onChange={(event) => setConfirmNewCode(event.target.value)}
                      placeholder="Répétez le mot de passe"
                    />
                  </label>

                  <div className="settings-password-rules">
                    Mot de passe : lettres, chiffres et caractères spéciaux acceptés. Minimum 6 caractères.
                  </div>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => void changeSecurityCode()}
                  >
                    Enregistrer le mot de passe
                  </button>

                  {message && (
                    <div className="settings-message">
                      {message}
                    </div>
                  )}
                </div>
              </article>

              <article className="panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">
                      APPARENCE
                    </p>

                    <h2>
                      Thème
                    </h2>
                  </div>
                </div>

                <div className="theme-options">
                  <button
                    type="button"
                    className={
                      'theme-option ' +
                      (theme === 'dark'
                        ? 'selected'
                        : '')
                    }
                    onClick={() =>
                      setTheme('dark')
                    }
                  >
                    <span className="theme-preview dark-preview" />

                    <span>
                      <strong>
                        Sombre
                      </strong>

                      <small>
                        Interface direction
                      </small>
                    </span>
                  </button>

                  <button
                    type="button"
                    className={
                      'theme-option ' +
                      (theme === 'light'
                        ? 'selected'
                        : '')
                    }
                    onClick={() =>
                      setTheme('light')
                    }
                  >
                    <span className="theme-preview light-preview" />

                    <span>
                      <strong>
                        Clair
                      </strong>

                      <small>
                        Interface lumineuse
                      </small>
                    </span>
                  </button>
                </div>
              </article>
            </div>

            <article className="panel settings-info">
              <p className="eyebrow">
                PARAMÈTRES
              </p>

              <h2>
                Centre de contrôle BEATERRA OS
              </h2>

              <p>
                Les préférences d’apparence et le code de
                sécurité sont actuellement conservés
                localement sur cet appareil.
              </p>
            </article>
          </section>
        )}
      </main>
    </div>
  )
}

export default App