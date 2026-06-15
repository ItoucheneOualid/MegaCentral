import React, { useEffect, useRef, useState } from 'react';
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ArrowForward,
  Assessment,
  Business,
  CheckCircle,
  Dashboard,
  Email,
  Inventory,
  KeyboardArrowDown,
  LocationOn,
  Phone,
  PointOfSale,
  Security,
  Speed,
  Store,
  Support,
  Sync,
  Verified,
  Schedule,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Accueil: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [mounted, setMounted] = useState(false);
  const [evolutionStep, setEvolutionStep] = useState(0);
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const magasinsEvolution = [
    {
      title: 'GESTION FRAGMENTÉE',
      subtitle: 'Chaque magasin fonctionne séparément',
      icon: <Store />,
      color: '#ef4444',
      magasins: [
        {
          name: 'Magasin A',
          position: { x: 22, y: 34 },
          color: '#ef4444',
          status: 'Isolé',
          icon: <Store />,
          description: 'Données locales',
          tag: 'Pas de partage',
        },
        {
          name: 'Magasin B',
          position: { x: 50, y: 62 },
          color: '#f97316',
          status: 'Isolé',
          icon: <Store />,
          description: 'Stock séparé',
          tag: 'Double saisie',
        },
        {
          name: 'Magasin C',
          position: { x: 78, y: 34 },
          color: '#dc2626',
          status: 'Isolé',
          icon: <Store />,
          description: 'Vision limitée',
          tag: 'Suivi difficile',
        },
      ],
      megaCentral: null,
      description:
        'Données dispersées, erreurs de saisie, perte de temps et manque de visibilité globale.',
    },
    {
      title: 'CONNEXION INTELLIGENTE',
      subtitle: 'MEGA-CENTRAL connecte vos points de vente',
      icon: <Sync />,
      color: '#3b82f6',
      magasins: [
        {
          name: 'Magasin A',
          position: { x: 24, y: 28 },
          color: '#3b82f6',
          status: 'Connexion',
          icon: <Sync />,
          description: 'Synchronisation',
          tag: 'En cours',
        },
        {
          name: 'Magasin B',
          position: { x: 50, y: 55 },
          color: '#6366f1',
          status: 'Connexion',
          icon: <Sync />,
          description: 'Intégration',
          tag: 'Migration',
        },
        {
          name: 'Magasin C',
          position: { x: 76, y: 28 },
          color: '#0ea5e9',
          status: 'Connexion',
          icon: <Sync />,
          description: 'Centralisation',
          tag: 'Progression',
        },
      ],
      megaCentral: {
        name: 'MEGA-CENTRAL',
        position: { x: 50, y: 76 },
        color: '#2563eb',
        status: 'Déploiement',
        icon: <Business />,
        description: 'Cerveau central de votre commerce',
        fonction: 'Unifie, synchronise, optimise',
      },
      description:
        'MEGA-CENTRAL relie vos magasins et prépare une gestion unique, fiable et structurée.',
    },
    {
      title: 'PERFORMANCE UNIFIÉE',
      subtitle: 'Tous vos magasins pilotés depuis une seule plateforme',
      icon: <Verified />,
      color: '#22c55e',
      magasins: [
        {
          name: 'Magasin A',
          position: { x: 22, y: 25 },
          color: '#22c55e',
          status: 'Connecté',
          icon: <Verified />,
          description: 'Données unifiées',
          tag: 'Optimisé',
        },
        {
          name: 'Magasin B',
          position: { x: 50, y: 72 },
          color: '#16a34a',
          status: 'Connecté',
          icon: <Verified />,
          description: 'Stock centralisé',
          tag: 'Maîtrisé',
        },
        {
          name: 'Magasin C',
          position: { x: 78, y: 25 },
          color: '#15803d',
          status: 'Connecté',
          icon: <Verified />,
          description: 'CA global',
          tag: 'Temps réel',
        },
      ],
      megaCentral: {
        name: 'MEGA-CENTRAL',
        position: { x: 50, y: 46 },
        color: '#2563eb',
        status: 'Actif',
        icon: <Dashboard />,
        description: 'Gestion commerciale centralisée',
        fonction: 'Analyse, contrôle, performance',
      },
      description:
        'Vision globale, stocks synchronisés, statistiques en temps réel et décisions plus rapides.',
    },
  ];

  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      setEvolutionStep((prev) => (prev + 1) % magasinsEvolution.length);
    }, 5500);

    return () => clearInterval(interval);
  }, [mounted]);

  const currentStep = magasinsEvolution[evolutionStep];

  const kpis = [
    { value: '360°', label: 'Vision globale' },
    { value: '24/7', label: 'Accès sécurisé' },
    { value: '+70%', label: 'Gain de temps' },
    { value: '-90%', label: 'Moins d’erreurs' },
  ];

  const features = [
    {
      icon: <Store />,
      title: 'Multi-magasins',
      description: 'Regroupez tous vos points de vente dans une seule plateforme.',
    },
    {
      icon: <PointOfSale />,
      title: 'Ventes centralisées',
      description: 'Suivez les ventes, tickets et performances en temps réel.',
    },
    {
      icon: <Inventory />,
      title: 'Stock synchronisé',
      description: 'Contrôlez les stocks de chaque magasin et évitez les ruptures.',
    },
    {
      icon: <Assessment />,
      title: 'Reporting avancé',
      description: 'Analysez chiffre d’affaires, marges, articles et tendances.',
    },
    {
      icon: <Security />,
      title: 'Sécurité',
      description: 'Accès sécurisé et données protégées pour votre entreprise.',
    },
    {
      icon: <Speed />,
      title: 'Productivité',
      description: 'Réduisez les doubles saisies et gagnez du temps au quotidien.',
    },
  ];

  return (
    <Box
      sx={{
        bgcolor: isDarkMode ? '#07111f' : '#f6f8fb',
        minHeight: '100vh',
      }}
    >
      <style>
        {`
          @keyframes softFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
          }

          @keyframes softPulse {
            0%, 100% { transform: scale(1); opacity: 0.9; }
            50% { transform: scale(1.04); opacity: 1; }
          }

          @keyframes lineFlow {
            0% { stroke-dashoffset: 80; opacity: 0.45; }
            50% { stroke-dashoffset: 0; opacity: 1; }
            100% { stroke-dashoffset: -80; opacity: 0.45; }
          }

          @keyframes glow {
            0%, 100% { box-shadow: 0 0 35px rgba(37, 99, 235, 0.45); }
            50% { box-shadow: 0 0 75px rgba(37, 99, 235, 0.85); }
          }
        `}
      </style>

      {/* HERO */}
      <Box
        id="hero"
        ref={(el: HTMLElement | null) => {
          sectionRefs.current.hero = el;
        }}
        sx={{
          minHeight: '100vh',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          background:
            'radial-gradient(circle at top left, rgba(37,99,235,0.35), transparent 35%), linear-gradient(135deg, #06121f 0%, #0f172a 52%, #172554 100%)',
          color: '#fff',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 480,
            height: 480,
            borderRadius: '50%',
            bgcolor: 'rgba(59,130,246,0.17)',
            filter: 'blur(75px)',
            top: -160,
            right: -120,
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            width: 360,
            height: 360,
            borderRadius: '50%',
            bgcolor: 'rgba(34,197,94,0.1)',
            filter: 'blur(80px)',
            bottom: -140,
            left: -120,
          }}
        />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2, py: 8 }}>
          <Grid container spacing={7} alignItems="center">
            <Grid item xs={12} lg={6}>
              <Chip
                label="Solution professionnelle de gestion commerciale"
                sx={{
                  mb: 3,
                  color: '#bfdbfe',
                  bgcolor: 'rgba(59,130,246,0.16)',
                  border: '1px solid rgba(147,197,253,0.28)',
                  fontWeight: 800,
                  px: 1,
                }}
              />

              <Typography
                variant="h1"
                sx={{
                  fontWeight: 950,
                  fontSize: { xs: '2.8rem', md: '5rem' },
                  lineHeight: 0.95,
                  letterSpacing: '-0.07em',
                  mb: 3,
                  background: 'linear-gradient(135deg, #ffffff, #dbeafe)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 28px rgba(37,99,235,0.35))',
                }}
              >
                MEGA-CENTRAL
              </Typography>

              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,
                  lineHeight: 1.15,
                  mb: 3,
                  fontSize: { xs: '2rem', md: '3rem' },
                }}
              >
                Pilotez tous vos magasins depuis une seule plateforme.
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255,255,255,0.78)',
                  lineHeight: 1.75,
                  maxWidth: 620,
                  mb: 4,
                }}
              >
                Ventes, stocks, commandes, statistiques et gestion multi-sites
                centralisés en temps réel pour une vision complète de votre activité.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/dashboard')}
                  sx={{
                    px: 4,
                    py: 1.7,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 900,
                    fontSize: '1rem',
                    bgcolor: '#2563eb',
                    boxShadow: '0 18px 45px rgba(37,99,235,0.38)',
                    '&:hover': {
                      bgcolor: '#1d4ed8',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 22px 55px rgba(37,99,235,0.48)',
                    },
                  }}
                >
                  Accéder au Dashboard
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({
                      behavior: 'smooth',
                    });
                  }}
                  sx={{
                    px: 4,
                    py: 1.7,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 900,
                    color: '#fff',
                    borderColor: 'rgba(255,255,255,0.28)',
                    '&:hover': {
                      borderColor: '#93c5fd',
                      bgcolor: 'rgba(255,255,255,0.08)',
                    },
                  }}
                >
                  Voir les avantages
                </Button>
              </Stack>

              <Grid container spacing={2} sx={{ mt: 5 }}>
                {kpis.map((kpi) => (
                  <Grid item xs={6} sm={3} key={kpi.label}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        backdropFilter: 'blur(14px)',
                      }}
                    >
                      <Typography fontWeight={950} fontSize="1.55rem">
                        {kpi.value}
                      </Typography>
                      <Typography color="rgba(255,255,255,0.62)" fontSize="0.85rem">
                        {kpi.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12} lg={6}>
              <Card
                sx={{
                  height: { xs: 620, md: 720 },
                  position: 'relative',
                  borderRadius: 7,
                  overflow: 'hidden',
                  bgcolor: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  boxShadow: '0 35px 100px rgba(0,0,0,0.42)',
                }}
              >
                <CardContent sx={{ p: { xs: 2.5, md: 4 }, height: '100%' }}>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Stack direction="row" justifyContent="center" alignItems="center" spacing={1.5}>
                      <Box
                        sx={{
                          width: 46,
                          height: 46,
                          borderRadius: 3,
                          display: 'grid',
                          placeItems: 'center',
                          color: '#fff',
                          bgcolor: currentStep.color,
                          boxShadow: `0 14px 35px ${alpha(currentStep.color, 0.35)}`,
                        }}
                      >
                        {currentStep.icon}
                      </Box>

                      <Typography
                        variant="h4"
                        fontWeight={950}
                        sx={{
                          fontSize: { xs: '1.25rem', md: '1.8rem' },
                          letterSpacing: '-0.03em',
                        }}
                      >
                        {currentStep.title}
                      </Typography>
                    </Stack>

                    <Typography
                      sx={{
                        mt: 1.2,
                        color: 'rgba(255,255,255,0.72)',
                        fontWeight: 600,
                      }}
                    >
                      {currentStep.subtitle}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      position: 'relative',
                      height: 'calc(100% - 95px)',
                      borderRadius: 5,
                      overflow: 'hidden',
                      bgcolor: 'rgba(2,6,23,0.42)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {currentStep.megaCentral && (
                      <Box
                        component="svg"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          pointerEvents: 'none',
                          zIndex: 1,
                        }}
                      >
                        {currentStep.magasins.map((magasin, index) => (
                          <line
                            key={index}
                            x1={`${magasin.position.x}%`}
                            y1={`${magasin.position.y}%`}
                            x2={`${currentStep.megaCentral!.position.x}%`}
                            y2={`${currentStep.megaCentral!.position.y}%`}
                            stroke="url(#lineGradient)"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray="10 8"
                            style={{
                              animation: `lineFlow ${2.8 + index * 0.4}s ease-in-out infinite`,
                            }}
                          />
                        ))}

                        <defs>
                          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(147,197,253,0.15)" />
                            <stop offset="50%" stopColor="rgba(96,165,250,0.9)" />
                            <stop offset="100%" stopColor="rgba(34,197,94,0.8)" />
                          </linearGradient>
                        </defs>
                      </Box>
                    )}

                    {currentStep.magasins.map((magasin, index) => (
                      <Box
                        key={magasin.name}
                        sx={{
                          position: 'absolute',
                          left: `${magasin.position.x}%`,
                          top: `${magasin.position.y}%`,
                          transform: 'translate(-50%, -50%)',
                          zIndex: 3,
                          animation: `softFloat ${3 + index * 0.4}s ease-in-out infinite`,
                        }}
                      >
                        <Card
                          sx={{
                            width: { xs: 120, md: 145 },
                            minHeight: { xs: 130, md: 150 },
                            borderRadius: 5,
                            bgcolor: `linear-gradient(135deg, ${magasin.color}, ${alpha(
                              magasin.color,
                              0.75
                            )})`,
                            background: `linear-gradient(135deg, ${magasin.color}, ${magasin.color}cc)`,
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.35)',
                            boxShadow: `0 24px 55px ${alpha(magasin.color, 0.28)}`,
                          }}
                        >
                          <CardContent sx={{ p: 2, textAlign: 'center' }}>
                            <Box
                              sx={{
                                mx: 'auto',
                                mb: 1.2,
                                width: 42,
                                height: 42,
                                borderRadius: 3,
                                display: 'grid',
                                placeItems: 'center',
                                bgcolor: 'rgba(255,255,255,0.2)',
                              }}
                            >
                              {magasin.icon}
                            </Box>

                            <Typography fontWeight={900} fontSize="0.95rem">
                              {magasin.name}
                            </Typography>

                            <Typography
                              sx={{
                                color: 'rgba(255,255,255,0.78)',
                                fontSize: '0.75rem',
                                mt: 0.5,
                              }}
                            >
                              {magasin.description}
                            </Typography>

                            <Chip
                              label={magasin.status}
                              size="small"
                              sx={{
                                mt: 1.2,
                                color: '#fff',
                                fontWeight: 800,
                                bgcolor: 'rgba(255,255,255,0.22)',
                              }}
                            />
                          </CardContent>
                        </Card>

                        <Box
                          sx={{
                            position: 'absolute',
                            top: -36,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            px: 1.4,
                            py: 0.5,
                            borderRadius: 2,
                            bgcolor: 'rgba(2,6,23,0.82)',
                            border: '1px solid rgba(255,255,255,0.14)',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {magasin.tag}
                        </Box>
                      </Box>
                    ))}

                    {currentStep.megaCentral && (
                      <Box
                        sx={{
                          position: 'absolute',
                          left: `${currentStep.megaCentral.position.x}%`,
                          top: `${currentStep.megaCentral.position.y}%`,
                          transform: 'translate(-50%, -50%)',
                          zIndex: 4,
                          animation: 'softPulse 2.8s ease-in-out infinite',
                        }}
                      >
                        <Card
                          sx={{
                            width: { xs: 178, md: 220 },
                            minHeight: { xs: 178, md: 215 },
                            borderRadius: 6,
                            color: '#fff',
                            background: `linear-gradient(135deg, ${currentStep.megaCentral.color}, #1e40af)`,
                            border: '2px solid rgba(255,255,255,0.42)',
                            boxShadow: '0 32px 90px rgba(37,99,235,0.6)',
                            animation: 'glow 3s ease-in-out infinite',
                          }}
                        >
                          <CardContent sx={{ p: 2.8, textAlign: 'center' }}>
                            <Box
                              sx={{
                                mx: 'auto',
                                mb: 1.5,
                                width: 58,
                                height: 58,
                                borderRadius: 4,
                                display: 'grid',
                                placeItems: 'center',
                                bgcolor: 'rgba(255,255,255,0.2)',
                              }}
                            >
                              {currentStep.megaCentral.icon}
                            </Box>

                            <Typography fontWeight={950} fontSize="1.05rem">
                              {currentStep.megaCentral.name}
                            </Typography>

                            <Typography
                              sx={{
                                color: 'rgba(255,255,255,0.78)',
                                fontSize: '0.78rem',
                                mt: 0.7,
                              }}
                            >
                              {currentStep.megaCentral.description}
                            </Typography>

                            <Chip
                              label={currentStep.megaCentral.status}
                              sx={{
                                mt: 1.5,
                                color: '#fff',
                                fontWeight: 900,
                                bgcolor: 'rgba(255,255,255,0.25)',
                              }}
                            />
                          </CardContent>
                        </Card>

                        <Box
                          sx={{
                            position: 'absolute',
                            top: -42,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            px: 1.5,
                            py: 0.7,
                            borderRadius: 2.5,
                            bgcolor: 'rgba(37,99,235,0.92)',
                            border: '1px solid rgba(255,255,255,0.22)',
                            fontSize: '0.75rem',
                            fontWeight: 900,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {currentStep.megaCentral.fonction}
                        </Box>
                      </Box>
                    )}

                    <Box
                      sx={{
                        position: 'absolute',
                        left: { xs: 16, md: 28 },
                        right: { xs: 16, md: 'auto' },
                        bottom: { xs: 16, md: 28 },
                        maxWidth: { md: 360 },
                        zIndex: 5,
                        p: 2.2,
                        borderRadius: 4,
                        bgcolor: 'rgba(2,6,23,0.78)',
                        border: '1px solid rgba(255,255,255,0.14)',
                        backdropFilter: 'blur(15px)',
                      }}
                    >
                      <Typography
                        sx={{
                          color: 'rgba(255,255,255,0.86)',
                          lineHeight: 1.6,
                          fontWeight: 600,
                        }}
                      >
                        {currentStep.description}
                      </Typography>

                      <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 2 }}>
                        {[0, 1, 2].map((step) => (
                          <Box
                            key={step}
                            onClick={() => setEvolutionStep(step)}
                            sx={{
                              width: step === evolutionStep ? 28 : 10,
                              height: 10,
                              borderRadius: 99,
                              cursor: 'pointer',
                              transition: '0.25s ease',
                              bgcolor:
                                step === evolutionStep
                                  ? currentStep.color
                                  : 'rgba(255,255,255,0.28)',
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>

        <Box
          sx={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 4,
          }}
        >
          <IconButton
            onClick={() => {
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }}
            sx={{
              color: '#ffffff',
              bgcolor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.18)',
              },
            }}
          >
            <KeyboardArrowDown />
          </IconButton>
        </Box>
      </Box>

      {/* FEATURES */}
      <Box
        id="features"
        sx={{
          py: { xs: 7, md: 10 },
          bgcolor: isDarkMode ? '#07111f' : '#f6f8fb',
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Chip
              label="Fonctionnalités"
              sx={{
                mb: 2,
                color: '#2563eb',
                bgcolor: alpha('#2563eb', 0.1),
                fontWeight: 900,
              }}
            />

            <Typography
              variant="h3"
              sx={{
                fontWeight: 950,
                letterSpacing: '-0.045em',
                mb: 2,
              }}
            >
              Une plateforme pensée pour les commerçants
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 760, mx: 'auto', lineHeight: 1.7 }}
            >
              Gardez le contrôle sur vos magasins, vos stocks, vos ventes et vos
              performances avec une interface claire et professionnelle.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {features.map((feature) => (
              <Grid item xs={12} sm={6} md={4} key={feature.title}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 5,
                    bgcolor: isDarkMode ? '#0f172a' : '#ffffff',
                    border: `1px solid ${alpha('#2563eb', 0.12)}`,
                    boxShadow: isDarkMode
                      ? '0 24px 55px rgba(0,0,0,0.26)'
                      : '0 24px 55px rgba(15,23,42,0.08)',
                    transition: '0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 28px 75px rgba(37,99,235,0.16)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3.5 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 3.5,
                        display: 'grid',
                        placeItems: 'center',
                        color: '#2563eb',
                        bgcolor: alpha('#2563eb', 0.1),
                        mb: 2.5,
                      }}
                    >
                      {feature.icon}
                    </Box>

                    <Typography variant="h6" fontWeight={950} mb={1}>
                      {feature.title}
                    </Typography>

                    <Typography color="text.secondary" lineHeight={1.75}>
                      
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA */}
      <Container maxWidth="xl" sx={{ py: { xs: 7, md: 9 } }}>
        <Card
          sx={{
            borderRadius: 7,
            overflow: 'hidden',
            background:
              'linear-gradient(135deg, #2563eb 0%, #1d4ed8 48%, #0f172a 100%)',
            color: '#fff',
            boxShadow: '0 35px 100px rgba(37,99,235,0.28)',
          }}
        >
          <CardContent sx={{ p: { xs: 4, md: 6 } }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h3" fontWeight={950} mb={2}>
                  Prêt à centraliser votre activité ?
                </Typography>

                <Typography sx={{ color: 'rgba(255,255,255,0.78)', fontSize: '1.1rem' }}>
                  Passez d’une gestion dispersée à une plateforme claire, rapide
                  et connectée à tous vos magasins.
                </Typography>

                <Grid container spacing={1.5} sx={{ mt: 3 }}>
                  {[
                    'Gestion multi-magasins',
                    'Stocks synchronisés',
                    'Reporting avancé',
                    'Suivi en temps réel',
                  ].map((item) => (
                    <Grid item xs={12} sm={6} key={item}>
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <CheckCircle sx={{ color: '#86efac' }} />
                        <Typography fontWeight={700}>{item}</Typography>
                      </Stack>
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/dashboard')}
                  sx={{
                    px: 4.5,
                    py: 1.7,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 950,
                    bgcolor: '#fff',
                    color: '#1e40af',
                    '&:hover': {
                      bgcolor: '#eff6ff',
                    },
                  }}
                >
                  Ouvrir le Dashboard
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>

      {/* FOOTER */}
      <Box
        component="footer"
        id="footer"
        sx={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          color: 'white',
          py: 8,
          mt: 4,
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                MEGA-TECH Informatique
              </Typography>

              <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
                MEGATECH informatique SRL est une société spécialisée dans le
                développement de systèmes informatiques. Nous proposons des logiciels
                de gestion commerciale qui répondent aux besoins de tout genre de commerce.
              </Typography>

              <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
                <strong>Notre mission :</strong> le développement de votre entreprise
                grâce à un logiciel performant.
              </Typography>

              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                25 ans d'expérience à votre service pour des solutions de qualité
                et à la pointe de la technologie.
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                Nos Solutions
              </Typography>

              <Box sx={{ mb: 1 }}>
                <Typography variant="body2">
                  <strong>MEGA-Win :</strong> Logiciel de gestion commerciale complète
                </Typography>
              </Box>

              <Box sx={{ mb: 1 }}>
                <Typography variant="body2">
                  <strong>MEGA-Caisse :</strong> Points de vente modernes
                </Typography>
              </Box>

              <Box sx={{ mb: 1 }}>
                <Typography variant="body2">
                  <strong>MEGA-Resto :</strong> Solution pour l'Horeca
                </Typography>
              </Box>

              <Box sx={{ mb: 1 }}>
                <Typography variant="body2">
                  <strong>MEGA-Shop :</strong> Ventes en ligne
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Développement sur mesure :</strong> Logiciels adaptés à vos besoins
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                "Nous améliorons sans cesse nos logiciels grâce aux idées de nos utilisateurs."
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                Contactez-nous
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Phone sx={{ mr: 2, color: '#4ECDC4' }} />
                  <Typography variant="body2">Assistance téléphonique 24/7</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Email sx={{ mr: 2, color: '#4ECDC4' }} />
                  <Typography variant="body2">Support en ligne rapide</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ mr: 2, color: '#4ECDC4' }} />
                  <Typography variant="body2">Interventions sur site</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Schedule sx={{ mr: 2, color: '#4ECDC4' }} />
                  <Typography variant="body2">Dépannage sous 24h</Typography>
                </Box>
              </Box>

              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Nos Sites Web
              </Typography>

              <Box sx={{ mb: 1 }}>
                <Typography variant="body2">
                  🌐 <strong>Site entreprise :</strong> www.mega-tech.eu
                </Typography>
              </Box>

              <Box sx={{ mb: 1 }}>
                <Typography variant="body2">
                  🛒 <strong>E-commerce :</strong> www.mega-shop.be
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <Typography variant="body2" sx={{ textAlign: 'center', mb: 2 }}>
              <strong>Erkin PEKER</strong> - Directeur de MEGA-TECH informatique
            </Typography>

            <Typography variant="body2" sx={{ textAlign: 'center', mb: 2, lineHeight: 1.6 }}>
              Programmeur-analyste expérimenté, il comprend parfaitement les besoins
              des commerçants car il avait un commerce de grossiste au début de sa carrière.
            </Typography>

            <Typography variant="body2" sx={{ textAlign: 'center', mb: 2, lineHeight: 1.6 }}>
              Après avoir développé MEGA-Stock sous DOS pour ses propres besoins,
              il a réalisé le développement de MEGA-Win de 2005 à 2010.
            </Typography>

            <Typography variant="body2" sx={{ textAlign: 'center', fontStyle: 'italic' }}>
              "Vous pouvez compter sur nous pour obtenir des mises à jour de Mega-win
              tous les trimestres. Nous pouvons aussi programmer des ajouts et corriger
              les bugs assez rapidement."
            </Typography>
          </Box>

          <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <Typography variant="body2" sx={{ textAlign: 'center' }}>
              {new Date().getFullYear()} MEGA-TECH Informatique SRL. Tous droits réservés.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Accueil;