import React from 'react';
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
  Business,
  CheckCircle,
  Email,
  KeyboardArrowDown,
  LocationOn,
  Phone,
  Schedule,
  Store,
  Verified,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Accueil: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const kpis = [
    { value: '360°', label: 'Vision globale' },
    { value: '24/7', label: 'Accès sécurisé' },
    { value: '+70%', label: 'Gain de temps' },
    { value: '-90%', label: 'Moins d’erreurs' },
  ];

  const workflowBlocks = [
    {
      title: 'AVANT',
      subtitle: 'Gestion fragmentée',
      color: '#ef4444',
      icon: <Store />,
      description: 'Chaque magasin travaille séparément avec ses propres données.',
      items: ['Magasins isolés', 'Données locales', 'Double saisie', 'Stock séparé', 'Suivi difficile'],
    },
    {
      title: 'MEGA-CENTRAL',
      subtitle: 'Centralisation',
      color: '#2563eb',
      icon: <Business />,
      description: 'Les magasins sont reliés à une seule plateforme centrale.',
      items: ['Connexion magasins', 'Synchronisation', 'Base centralisée', 'Gestion unique', 'Contrôle global'],
    },
    {
      title: 'APRÈS',
      subtitle: 'Performance unifiée',
      color: '#22c55e',
      icon: <Verified />,
      description: 'L’activité commerciale est pilotée en temps réel.',
      items: ['Vision globale', 'Stock centralisé', 'CA temps réel', 'Moins d’erreurs', 'Décisions rapides'],
    },
  ];

  return (
    <Box sx={{ bgcolor: isDarkMode ? '#07111f' : '#f6f8fb', minHeight: '100vh' }}>
      <style>
        {`
          @keyframes cardFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }

          @keyframes arrowMove {
            0%, 100% { transform: translateX(0); opacity: 0.55; }
            50% { transform: translateX(8px); opacity: 1; }
          }

          @keyframes shine {
            0% { transform: translateX(-130%); }
            100% { transform: translateX(130%); }
          }

          @keyframes glowPulse {
            0%, 100% { box-shadow: 0 0 0 rgba(37,99,235,0); }
            50% { box-shadow: 0 0 32px rgba(37,99,235,0.26); }
          }

          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          @keyframes logoFloat {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-5px) scale(1.02); }
          }

          @keyframes backgroundMove {
            0% { transform: translate3d(0,0,0); }
            50% { transform: translate3d(16px,-16px,0); }
            100% { transform: translate3d(0,0,0); }
          }
        `}
      </style>

      <Box
        id="hero"
        sx={{
          minHeight: 'calc(100vh - 82px)',
          pt: { xs: 4, md: 5 },
          pb: { xs: 4, md: 5 },
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
            width: 420,
            height: 420,
            borderRadius: '50%',
            bgcolor: 'rgba(59,130,246,0.18)',
            filter: 'blur(80px)',
            top: -140,
            right: -120,
            animation: 'backgroundMove 8s ease-in-out infinite',
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            width: 320,
            height: 320,
            borderRadius: '50%',
            bgcolor: 'rgba(34,197,94,0.12)',
            filter: 'blur(85px)',
            bottom: -130,
            left: -110,
            animation: 'backgroundMove 9s ease-in-out infinite',
          }}
        />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={3.5} alignItems="center" justifyContent="center">
            <Grid item xs={12} lg={5}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                <Box
                  sx={{
                    width: 58,
                    height: 58,
                    borderRadius: 3,
                    display: 'grid',
                    placeItems: 'center',
                    background: 'linear-gradient(135deg, #2563eb, #22c55e)',
                    boxShadow: '0 14px 36px rgba(37,99,235,0.38)',
                    animation: 'logoFloat 4s ease-in-out infinite',
                  }}
                >
                  <Business sx={{ fontSize: 30, color: '#fff' }} />
                </Box>

                <Box>
                  <Typography
                    fontWeight={950}
                    sx={{
                      fontSize: '1rem',
                      letterSpacing: '0.1em',
                      color: '#bfdbfe',
                    }}
                  >
                    MEGA-CENTRAL
                  </Typography>

                  <Typography sx={{ color: 'rgba(255,255,255,0.66)', fontWeight: 700, fontSize: '0.85rem' }}>
                    Gestion commerciale connectée
                  </Typography>
                </Box>
              </Stack>

              <Typography
                variant="h1"
                sx={{
                  fontWeight: 950,
                  fontSize: { xs: '2.1rem', sm: '2.8rem', md: '3.45rem' },
                  lineHeight: 1.02,
                  letterSpacing: '-0.055em',
                  mb: 2,
                  whiteSpace: { xs: 'normal', md: 'nowrap' },
                  background: 'linear-gradient(135deg, #ffffff, #dbeafe, #93c5fd)',
                  backgroundSize: '220% 220%',
                  animation: 'gradientMove 6s ease infinite',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 22px rgba(37,99,235,0.3))',
                }}
              >
                MEGA-CENTRAL
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255,255,255,0.82)',
                  lineHeight: 1.65,
                  maxWidth: 620,
                  mb: 2.5,
                  fontWeight: 400,
                }}
              >
                Centralisez vos points de vente, surveillez vos ventes en temps réel,
                optimisez vos stocks, suivez vos commandes et analysez vos performances
                depuis une interface moderne conçue pour les commerces multi-sites.
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2.5 }}>
                {['Gestion', 'Stock', 'Commandes', 'Reporting'].map((item) => (
                  <Chip
                    key={item}
                    size="small"
                    label={item}
                    sx={{
                      color: '#bfdbfe',
                      bgcolor: 'rgba(59,130,246,0.16)',
                      border: '1px solid rgba(147,197,253,0.28)',
                      fontWeight: 800,
                    }}
                  />
                ))}
              </Stack>

              <Button
                variant="contained"
                size="medium"
                endIcon={<ArrowForward />}
                onClick={() => navigate('/dashboard')}
                sx={{
                  px: 3.5,
                  py: 1.2,
                  borderRadius: 2.5,
                  textTransform: 'none',
                  fontWeight: 950,
                  fontSize: '0.95rem',
                  bgcolor: '#2563eb',
                  boxShadow: '0 12px 34px rgba(37,99,235,0.34)',
                  '&:hover': {
                    bgcolor: '#1d4ed8',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 18px 44px rgba(37,99,235,0.46)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Accéder au Dashboard
              </Button>

              <Grid container spacing={1.2} sx={{ mt: 3 }}>
                {kpis.map((kpi, index) => (
                  <Grid item xs={6} sm={3} key={kpi.label}>
                    <Box
                      sx={{
                        p: 1.4,
                        borderRadius: 2.5,
                        bgcolor: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        backdropFilter: 'blur(14px)',
                        animation: `cardFloat ${3 + index * 0.25}s ease-in-out infinite`,
                      }}
                    >
                      <Typography fontWeight={950} fontSize="1.2rem">
                        {kpi.value}
                      </Typography>

                      <Typography color="rgba(255,255,255,0.62)" fontSize="0.75rem">
                        {kpi.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12} lg={7}>
              <Card
                id="workflow"
                sx={{
                  width: '100%',
                  borderRadius: 4,
                  bgcolor: isDarkMode ? 'rgba(15,23,42,0.96)' : 'rgba(255,255,255,0.96)',
                  backdropFilter: 'blur(24px)',
                  border: isDarkMode
                    ? '1px solid rgba(255,255,255,0.14)'
                    : '1px solid rgba(37,99,235,0.14)',
                  boxShadow: isDarkMode
                    ? '0 24px 70px rgba(0,0,0,0.36)'
                    : '0 24px 70px rgba(15,23,42,0.14)',
                  overflow: 'hidden',
                  animation: 'glowPulse 5s ease-in-out infinite',
                }}
              >
                <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                  <Box sx={{ textAlign: 'center', mb: 2.5 }}>
                    <Typography
                      variant="h5"
                      fontWeight={950}
                      sx={{
                        color: isDarkMode ? '#f8fafc' : '#0f172a',
                        letterSpacing: '-0.04em',
                        mb: 0.5,
                      }}
                    >
                      Avant / MEGA-CENTRAL / Après
                    </Typography>

                    <Typography
                      sx={{
                        color: isDarkMode ? '#cbd5e1' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        maxWidth: 720,
                        mx: 'auto',
                      }}
                    >
                      D’une gestion dispersée vers une gestion commerciale centralisée.
                    </Typography>
                  </Box>

                  <Grid container spacing={1.5} alignItems="stretch">
                    {workflowBlocks.map((bloc, index) => (
                      <Grid item xs={12} md={4} key={bloc.title} sx={{ position: 'relative' }}>
                        <Card
                          sx={{
                            height: '100%',
                            minHeight: 315,
                            borderRadius: 3.5,
                            bgcolor: isDarkMode ? '#020617' : '#ffffff',
                            border: `1px solid ${alpha(bloc.color, isDarkMode ? 0.45 : 0.28)}`,
                            borderTop: `5px solid ${bloc.color}`,
                            boxShadow: isDarkMode
                              ? `0 16px 40px ${alpha(bloc.color, 0.14)}`
                              : '0 14px 34px rgba(15,23,42,0.08)',
                            position: 'relative',
                            overflow: 'hidden',
                            animation: `cardFloat ${3.2 + index * 0.45}s ease-in-out infinite`,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-6px) scale(1.01)',
                              boxShadow: `0 20px 48px ${alpha(bloc.color, 0.25)}`,
                            },
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '60%',
                              height: '100%',
                              background: isDarkMode
                                ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)'
                                : 'linear-gradient(90deg, transparent, rgba(37,99,235,0.08), transparent)',
                              animation: 'shine 4.5s ease-in-out infinite',
                              pointerEvents: 'none',
                            },
                          }}
                        >
                          <CardContent
                            sx={{
                              p: 2,
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              textAlign: 'center',
                              position: 'relative',
                              zIndex: 1,
                            }}
                          >
                            <Box
                              sx={{
                                width: 50,
                                height: 50,
                                borderRadius: 2.5,
                                display: 'grid',
                                placeItems: 'center',
                                mb: 1.2,
                                color: bloc.color,
                                bgcolor: alpha(bloc.color, isDarkMode ? 0.18 : 0.12),
                                border: `1px solid ${alpha(bloc.color, 0.28)}`,
                              }}
                            >
                              {bloc.icon}
                            </Box>

                            <Typography
                              variant="h6"
                              fontWeight={950}
                              sx={{
                                color: isDarkMode ? '#ffffff' : '#0f172a',
                                mb: 0.4,
                              }}
                            >
                              {bloc.title}
                            </Typography>

                            <Chip
                              label={bloc.subtitle}
                              size="small"
                              sx={{
                                mb: 1.2,
                                fontWeight: 900,
                                color: bloc.color,
                                bgcolor: alpha(bloc.color, isDarkMode ? 0.18 : 0.1),
                                border: `1px solid ${alpha(bloc.color, 0.28)}`,
                              }}
                            />

                            <Typography
                              sx={{
                                color: isDarkMode ? '#cbd5e1' : '#475569',
                                fontWeight: 700,
                                lineHeight: 1.45,
                                mb: 1.5,
                                fontSize: '0.82rem',
                                minHeight: 48,
                              }}
                            >
                              {bloc.description}
                            </Typography>

                            <Stack spacing={0.7} sx={{ width: '100%', mt: 'auto' }}>
                              {bloc.items.map((item) => (
                                <Box
                                  key={item}
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.8,
                                    px: 1,
                                    py: 0.65,
                                    borderRadius: 2,
                                    bgcolor: isDarkMode ? 'rgba(255,255,255,0.06)' : alpha(bloc.color, 0.06),
                                    border: isDarkMode
                                      ? '1px solid rgba(255,255,255,0.08)'
                                      : `1px solid ${alpha(bloc.color, 0.12)}`,
                                    color: isDarkMode ? '#f8fafc' : '#1e293b',
                                    fontWeight: 800,
                                    fontSize: '0.78rem',
                                    textAlign: 'left',
                                  }}
                                >
                                  <CheckCircle sx={{ fontSize: 15, color: bloc.color, flexShrink: 0 }} />
                                  <span>{item}</span>
                                </Box>
                              ))}
                            </Stack>
                          </CardContent>
                        </Card>

                        {index < workflowBlocks.length - 1 && (
                          <Box
                            sx={{
                              display: { xs: 'none', md: 'flex' },
                              position: 'absolute',
                              right: -20,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              zIndex: 5,
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: isDarkMode ? '#0f172a' : '#ffffff',
                              border: `1px solid ${alpha('#2563eb', 0.25)}`,
                              boxShadow: '0 10px 26px rgba(37,99,235,0.2)',
                              animation: 'arrowMove 1.8s ease-in-out infinite',
                            }}
                          >
                            <ArrowForward sx={{ color: '#2563eb', fontSize: 22 }} />
                          </Box>
                        )}
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>

        <Box
          sx={{
            position: 'absolute',
            bottom: 14,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 4,
          }}
        >
          <IconButton
            size="small"
            onClick={() => {
              document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
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

      <Box
        component="footer"
        id="footer"
        sx={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          color: 'white',
          py: 4,
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 800 }}>
                MEGA-TECH Informatique
              </Typography>

              <Typography variant="body2" sx={{ mb: 1.2, lineHeight: 1.55, color: 'rgba(255,255,255,0.78)' }}>
                MEGATECH informatique SRL est spécialisée dans le développement de systèmes informatiques
                et de logiciels de gestion commerciale.
              </Typography>

              <Typography variant="body2" sx={{ lineHeight: 1.55, color: 'rgba(255,255,255,0.78)' }}>
                25 ans d'expérience à votre service pour des solutions fiables et modernes.
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 800 }}>
                Nos Solutions
              </Typography>

              {[
                'MEGA-Win : Gestion commerciale complète',
                'MEGA-Caisse : Points de vente modernes',
                'MEGA-Resto : Solution Horeca',
                'MEGA-Shop : Ventes en ligne',
                'Développement sur mesure',
              ].map((solution) => (
                <Typography key={solution} variant="body2" sx={{ mb: 0.8, color: 'rgba(255,255,255,0.78)' }}>
                  {solution}
                </Typography>
              ))}
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 800 }}>
                Contactez-nous
              </Typography>

              {[
                { icon: <Phone fontSize="small" />, text: '+32 477 75 65 30' },
                { icon: <Phone fontSize="small" />, text: 'Assistance téléphonique 24/7' },
                { icon: <Email fontSize="small" />, text: 'Support en ligne rapide' },
                { icon: <LocationOn fontSize="small" />, text: 'Interventions sur site' },
                { icon: <Schedule fontSize="small" />, text: 'Dépannage sous 24h' },
              ].map((contact) => (
                <Box key={contact.text} sx={{ display: 'flex', alignItems: 'center', mb: 0.8 }}>
                  <Box sx={{ mr: 1.2, color: '#4ECDC4', display: 'flex' }}>
                    {contact.icon}
                  </Box>

                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                    {contact.text}
                  </Typography>
                </Box>
              ))}
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, pt: 2.5, borderTop: '1px solid rgba(255,255,255,0.16)' }}>
            <Typography variant="body2" sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.75)' }}>
              {new Date().getFullYear()} MEGA-TECH Informatique SRL. Tous droits réservés.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Accueil;