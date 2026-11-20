import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { C } from '../lib/theme';
import { fmtMin } from '../lib/stats';

/** Circular progress ring showing time used vs limit. */
export function Ring({ used, limit, size = 160, stroke = 14, children }: { used: number; limit: number; size?: number; stroke?: number; children?: React.ReactNode }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const ratio = limit > 0 ? Math.min(1, used / limit) : used > 0 ? 1 : 0;
  const over = used > limit;
  const color = over ? C.coral : ratio > 0.8 ? C.sun : C.leaf;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={C.line} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={circ * (1 - ratio)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}

/** Simple 7-day bar chart with a limit line. */
export function WeekBars({ data, limit }: { data: { day: Date; minutes: number }[]; limit: number }) {
  const max = Math.max(limit, ...data.map(d => d.minutes), 30);
  const H = 120;
  const limitY = H - (limit / max) * H;
  return (
    <View>
      <View style={{ height: H, flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
        <View style={[st.limitLine, { top: limitY }]} />
        {data.map((d, i) => {
          const h = Math.max(4, (d.minutes / max) * H);
          const over = d.minutes > limit;
          return (
            <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: H }}>
              {d.minutes > 0 ? <Text style={st.val}>{fmtMin(d.minutes)}</Text> : null}
              <View style={{ width: '70%', height: h, borderRadius: 8, backgroundColor: over ? C.coral : C.leaf, opacity: d.minutes ? 1 : 0.25 }} />
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
        {data.map((d, i) => (
          <Text key={i} style={[st.day, i === data.length - 1 && { color: C.ink, fontWeight: '800' }]}>
            {i === data.length - 1 ? 'Today' : d.day.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 3)}
          </Text>
        ))}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
        <View style={{ width: 14, height: 0, borderTopWidth: 2, borderStyle: 'dashed', borderColor: C.muted }} />
        <Text style={{ fontSize: 11, color: C.muted }}>Daily limit {fmtMin(limit)}</Text>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  limitLine: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: C.muted, zIndex: 1 },
  val: { fontSize: 9.5, color: C.muted, marginBottom: 3 },
  day: { flex: 1, textAlign: 'center', fontSize: 11, color: C.muted },
});
