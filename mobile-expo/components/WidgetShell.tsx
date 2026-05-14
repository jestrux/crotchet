import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { WidgetRecord, IconDescriptor } from '@/lib/registry';
import { useTheme } from './theming';

function WidgetIcon({ icon, color }: { icon: IconDescriptor; color: string }) {
  if (!icon) return null;
  if (icon.type === 'icon')
    return <Ionicons name={icon.name as React.ComponentProps<typeof Ionicons>['name']} size={16} color={color} />;
  // SVG: fallback to a generic icon until Phase 3 svg support
  return <Ionicons name="apps-outline" size={16} color={color} />;
}

function ListShell({ widget, iconColor }: { widget: WidgetRecord; iconColor: string }) {
  return (
    <View style={styles.card} className="bg-card border border-stroke">
      {/* Header */}
      <View style={styles.header} className="bg-foreground/[0.05]">
        <View style={styles.headerIcon}>
          <WidgetIcon icon={widget.icon} color={iconColor} />
        </View>
        <Text className="flex-1 text-foreground" style={styles.headerTitle}>
          {widget.title || widget.label}
        </Text>
      </View>
      {/* Empty body — three placeholder rows */}
      <View style={styles.listBody}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.skeletonRow}>
            <View style={styles.skeletonThumb} className="bg-foreground/[0.06]" />
            <View style={{ flex: 1, gap: 5 }}>
              <View style={[styles.skeletonLine, { width: '60%' }]} className="bg-foreground/[0.06]" />
              <View style={[styles.skeletonLine, { width: '40%' }]} className="bg-foreground/[0.04]" />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function MediaShell({ widget }: { widget: WidgetRecord }) {
  return (
    <View style={styles.card} className="bg-foreground/[0.06]">
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)']}
        locations={[0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.mediaCaption}>
        <View style={[styles.skeletonLine, { width: '50%' }]} className="bg-white/20" />
        <View style={[styles.skeletonLine, { width: '30%', marginTop: 4 }]} className="bg-white/10" />
      </View>
    </View>
  );
}

export function WidgetShell({ widget }: { widget: WidgetRecord }) {
  const { colors } = useTheme();

  if (widget.content === 'media') {
    return <MediaShell widget={widget} />;
  }

  // list and grid both render as a list shell for now
  return <ListShell widget={widget} iconColor={colors.iconMuted} />;
}

const ASPECT = 2 / 1.02;

const styles = StyleSheet.create({
  card: {
    aspectRatio: ASPECT,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
  },
  headerIcon: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  listBody: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  skeletonThumb: {
    width: 52,
    height: 36,
    borderRadius: 4,
  },
  skeletonLine: {
    height: 10,
    borderRadius: 5,
  },
  mediaCaption: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
  },
});
