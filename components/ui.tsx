import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { C, R, shadow } from '../lib/theme';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];

export const tap = () => {
  if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
};
export const success = () => {
  if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading,
  disabled,
  style,
  small,
}: {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'sun' | 'danger' | 'leaf';
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  small?: boolean;
}) {
  const v = {
    primary: { bg: C.teal, fg: C.white, border: C.teal },
    leaf: { bg: C.leaf, fg: C.white, border: C.leaf },
    secondary: { bg: C.white, fg: C.navy, border: C.line },
    ghost: { bg: 'transparent', fg: C.teal, border: 'transparent' },
    sun: { bg: C.sun, fg: C.navy, border: C.sun },
    danger: { bg: C.dangerSoft, fg: C.danger, border: C.dangerSoft },
  }[variant];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={({ pressed }) => [
        s.btn,
        small && { minHeight: 38, paddingHorizontal: 12, borderRadius: 11 },
        { backgroundColor: v.bg, borderColor: v.border, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={small ? 16 : 18} color={v.fg} /> : null}
          <Text style={[s.btnText, small && { fontSize: 13 }, { color: v.fg }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle | (ViewStyle | false | null | undefined)[] }) {
  return <View style={[s.card, style as any]}>{children}</View>;
}

export function H1({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  return (
    <View style={{ marginBottom: 6 }}>
      {eyebrow ? <Text style={s.eyebrow}>{eyebrow}</Text> : null}
      <Text style={s.h1}>{title}</Text>
      {sub ? <Text style={s.sub}>{sub}</Text> : null}
    </View>
  );
}

export function Section({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={s.section}>
      <Text style={s.h2}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={10}>
          <Text style={s.link}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Field({ label, error, hint, icon, ...props }: TextInputProps & { label: string; error?: string; hint?: string; icon?: IconName }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.label}>{label}</Text>
      <View style={[s.inputWrap, focused && { borderColor: C.teal }, error ? { borderColor: C.danger } : null]}>
        {icon ? <Ionicons name={icon} size={18} color={C.muted} style={{ marginRight: 8 }} /> : null}
        <TextInput
          placeholderTextColor="#9AABB7"
          {...props}
          onFocus={e => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          style={[s.input, props.multiline && { minHeight: 80, textAlignVertical: 'top', paddingTop: 12 }]}
        />
      </View>
      {error ? <Text style={s.error}>{error}</Text> : hint ? <Text style={s.hint}>{hint}</Text> : null}
    </View>
  );
}

export function Chip({ label, active, onPress, emoji }: { label: string; active?: boolean; onPress?: () => void; emoji?: string }) {
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={[s.chip, active && { backgroundColor: C.navy, borderColor: C.navy }]}
    >
      <Text style={[s.chipText, active && { color: C.white }]}>
        {emoji ? `${emoji} ` : ''}
        {label}
      </Text>
    </Pressable>
  );
}

export function Notice({ icon = 'information-circle-outline', text, tone = 'mint' }: { icon?: IconName; text: string; tone?: 'mint' | 'coral' | 'sun' }) {
  const bg = tone === 'mint' ? C.mintSoft : tone === 'sun' ? C.sunSoft : C.coralSoft;
  const fg = tone === 'mint' ? '#36615A' : tone === 'sun' ? '#7A5B00' : '#9A4A35';
  return (
    <View style={[s.notice, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={18} color={fg} style={{ marginTop: 1 }} />
      <Text style={[s.noticeText, { color: fg }]}>{text}</Text>
    </View>
  );
}

export function Empty({ emoji, title, text, children }: { emoji: string; title: string; text?: string; children?: React.ReactNode }) {
  return (
    <View style={s.empty}>
      <Text style={{ fontSize: 40 }}>{emoji}</Text>
      <Text style={s.emptyTitle}>{title}</Text>
      {text ? <Text style={s.emptyText}>{text}</Text> : null}
      {children}
    </View>
  );
}

export function Stepper({ value, onChange, step = 15, min = 0, max = 600, format }: { value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number; format?: (v: number) => string }) {
  return (
    <View style={s.stepper}>
      <Pressable style={s.stepBtn} onPress={() => { tap(); onChange(Math.max(min, value - step)); }} accessibilityLabel="Decrease">
        <Ionicons name="remove" size={20} color={C.navy} />
      </Pressable>
      <Text style={s.stepVal}>{format ? format(value) : value}</Text>
      <Pressable style={s.stepBtn} onPress={() => { tap(); onChange(Math.min(max, value + step)); }} accessibilityLabel="Increase">
        <Ionicons name="add" size={20} color={C.navy} />
      </Pressable>
    </View>
  );
}

export function Pill({ text, color, bg }: { text: string; color: string; bg: string }) {
  return (
    <View style={[s.pill, { backgroundColor: bg }]}>
      <Text style={[s.pillText, { color }]}>{text}</Text>
    </View>
  );
}

export const s = StyleSheet.create({
  btn: { minHeight: 50, borderRadius: R.md, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1 },
  btnText: { fontSize: 15, fontWeight: '700' },
  card: { backgroundColor: C.white, borderRadius: R.lg, padding: 16, borderWidth: 1, borderColor: C.line, ...shadow },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.4, color: C.teal, marginBottom: 4 },
  h1: { fontSize: 26, fontWeight: '900', color: C.ink, letterSpacing: -0.7 },
  sub: { color: C.muted, fontSize: 14, lineHeight: 20, marginTop: 6 },
  section: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 26, marginBottom: 12 },
  h2: { fontSize: 19, fontWeight: '800', color: C.ink, letterSpacing: -0.3 },
  link: { color: C.teal, fontWeight: '700', fontSize: 14 },
  label: { fontSize: 13, fontWeight: '700', color: C.ink, marginBottom: 7 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: C.line, backgroundColor: C.white, borderRadius: R.md, paddingHorizontal: 12 },
  input: { flex: 1, minHeight: 48, fontSize: 16, color: C.ink },
  error: { color: C.danger, fontSize: 12, marginTop: 5 },
  hint: { color: C.muted, fontSize: 12, marginTop: 5 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 99, borderWidth: 1, borderColor: C.line, backgroundColor: C.white },
  chipText: { fontSize: 13, fontWeight: '600', color: C.ink },
  notice: { flexDirection: 'row', gap: 10, padding: 14, borderRadius: R.md, marginTop: 16 },
  noticeText: { flex: 1, fontSize: 12.5, lineHeight: 18 },
  empty: { alignItems: 'center', padding: 24, backgroundColor: C.white, borderRadius: R.lg, borderWidth: 1, borderColor: C.line, gap: 6 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: C.ink, marginTop: 4, textAlign: 'center' },
  emptyText: { fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 19 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  stepVal: { minWidth: 70, textAlign: 'center', fontSize: 18, fontWeight: '800', color: C.ink },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, alignSelf: 'flex-start' },
  pillText: { fontSize: 12, fontWeight: '700' },
});
