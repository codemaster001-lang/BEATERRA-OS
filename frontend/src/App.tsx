import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  House,
  LogOut,
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

function TransportSlideshow() {
  return (
    <MediaSlideshow
      images={transportImages}
      alt="Véhicule de transport"
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
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [securityCode, setSecurityCode] = useState('')
  const [newCode, setNewCode] = useState('')
  const [message, setMessage] = useState('')

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

    const savedCode = localStorage.getItem('beaterra_security_code')

    if (savedCode) {
      setSecurityCode(savedCode)
    }
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('beaterra_theme', theme)
  }, [theme])

  const pageTitle = useMemo(() => {
    const item = navigation.find((entry) => entry.id === view)

    return item ? item.label : 'Tableau de bord'
  }, [view])

  const changeSecurityCode = () => {
    if (!/^\d{4,8}$/.test(newCode)) {
      setMessage('Le code doit contenir entre 4 et 8 chiffres.')
      return
    }

    localStorage.setItem('beaterra_security_code', newCode)
    setSecurityCode(newCode)
    setNewCode('')
    setMessage('Code de sécurité enregistré.')
  }

  const handleLogout = () => {
    sessionStorage.removeItem('beaterra_session')
    localStorage.removeItem('beaterra_session')
    setView('dashboard')
    setMessage('Session déconnectée.')
  }

  return (
    <div className={'app-shell ' + theme}>
      <aside className="sidebar">
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
                setView(item.id)
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
          <div>
            <p className="eyebrow">
              BEATERRA OS
            </p>

            <h1>{pageTitle}</h1>

            <p className="subtitle">
              Pilotage centralisé des activités de BEATERRA.
            </p>
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
                    onClick={() => setView(pole.id)}
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
                  PÔLE TRANSPORT
                </p>

                <h2>
                  Transport
                </h2>

                <p>
                  Gérez vos véhicules, conducteurs et opérations
                  de transport depuis un espace unique.
                </p>
              </div>

              <TransportSlideshow />
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

            <div className="dashboard-grid">
              <article className="panel panel-large">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">
                      PLANNING
                    </p>

                    <h2>
                      Agenda
                    </h2>
                  </div>
                </div>

                <div className="empty-table">
                  <strong>
                    Aucune tâche planifiée
                  </strong>

                  <span>
                    Votre planning apparaîtra ici.
                  </span>
                </div>
              </article>

              <article className="panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">
                      PRIORITÉS
                    </p>

                    <h2>
                      Important / urgent
                    </h2>
                  </div>
                </div>

                <div className="empty-table">
                  <strong>
                    Aucune priorité
                  </strong>

                  <span>
                    Ajoutez des tâches pour alimenter
                    cette vue.
                  </span>
                </div>
              </article>
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
                    Code actuel

                    <input
                      type="password"
                      value={securityCode}
                      readOnly
                      placeholder="Aucun code enregistré"
                    />
                  </label>

                  <label>
                    Nouveau code

                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={8}
                      value={newCode}
                      onChange={(event) =>
                        setNewCode(
                          event.target.value.replace(
                            /\D/g,
                            ''
                          )
                        )
                      }
                      placeholder="4 à 8 chiffres"
                    />
                  </label>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={changeSecurityCode}
                  >
                    Enregistrer le code
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