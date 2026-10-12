// ============================================================
// AGTURONG — Design Tokens & Theme
// ============================================================

export const Colors = {
  primary: '#FF6B35',
  primaryDark: '#E55A2B',
  primaryLight: '#FF8F66',
  primarySoft: '#FFF0EB',

  secondary: '#2D2D2D',
  secondaryLight: '#4A4A4A',

  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F7',
  backgroundTertiary: '#EEEFF1',

  surface: '#FFFFFF',
  surfaceSecondary: '#F5F5F7',
  surfaceElevated: '#FFFFFF',

  text: '#1A1A1A',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  textOnPrimary: '#FFFFFF',

  border: '#E5E7EB',
  borderLight: '#F0F0F2',
  divider: '#F3F4F6',

  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  star: '#FBBF24',
  overlay: 'rgba(0, 0, 0, 0.5)',

  skeleton: '#E5E7EB',
  skeletonHighlight: '#F3F4F6',

  // Status colors
  statusPending: '#F59E0B',
  statusConfirmed: '#3B82F6',
  statusPreparing: '#8B5CF6',
  statusReady: '#06B6D4',
  statusDelivering: '#FF6B35',
  statusDelivered: '#10B981',
  statusCancelled: '#EF4444',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 40,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
  display: 34,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
};

export const ORDER_STATUS_MAP: Record<string, { label: string; color: string; bgColor: string; description: string }> = {
  pending: { label: 'Pending', color: Colors.statusPending, bgColor: Colors.warningLight, description: 'Order received and waiting for confirmation' },
  confirmed: { label: 'Confirmed', color: Colors.statusConfirmed, bgColor: Colors.infoLight, description: 'Order accepted by the restaurant' },
  preparing: { label: 'Preparing', color: Colors.statusPreparing, bgColor: '#EDE9FE', description: 'Kitchen is currently preparing your meal' },
  ready_for_pickup: { label: 'Ready', color: Colors.statusReady, bgColor: '#CFFAFE', description: 'Order packed and waiting for rider pickup' },
  out_for_delivery: { label: 'On the Way', color: Colors.statusDelivering, bgColor: Colors.primarySoft, description: 'Rider is on the way to your delivery address' },
  delivered: { label: 'Delivered', color: Colors.statusDelivered, bgColor: Colors.successLight, description: 'Order has been successfully delivered' },
  cancelled: { label: 'Cancelled', color: Colors.statusCancelled, bgColor: Colors.errorLight, description: 'Order has been cancelled' },
};
