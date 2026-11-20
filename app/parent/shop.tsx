import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chip, H1, Notice, success, tap } from '../../components/ui';
import { addToCart, cartTotal, inr, setQty, useCart } from '../../lib/cart';
import { fetchProducts, friendlyError, Product } from '../../lib/family';
import { C, R, shadow } from '../../lib/theme';

export default function Shop() {
  const insets = useSafeAreaInsets();
  const cart = useCart();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [cat, setCat] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const loadP = useCallback(async () => {
    try {
      setErr(null);
      setProducts(await fetchProducts());
    } catch (e) {
      setErr(friendlyError(e));
      setProducts(p => p ?? []);
    }
  }, []);
  useEffect(() => {
    loadP();
  }, [loadP]);

  const cats = useMemo(() => ['All', ...Array.from(new Set((products ?? []).map(p => p.category)))], [products]);
  const list = (products ?? []).filter(p => cat === 'All' || p.category === cat);
  const count = cart.reduce((s, l) => s + l.qty, 0);

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, paddingBottom: count ? 110 : 30 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await loadP();
              setRefreshing(false);
            }}
          />
        }
      >
        <H1 eyebrow="HEALZO SHOP" title="Kits for screen-free fun" sub="Gardening, craft and science kits delivered to your door. Pay on delivery." />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} style={{ marginVertical: 14 }}>
          {cats.map(c => (
            <Chip key={c} label={c} active={cat === c} onPress={() => setCat(c)} />
          ))}
        </ScrollView>

        {products == null ? <ActivityIndicator color={C.teal} style={{ marginTop: 30 }} /> : null}
        {err ? <Notice tone="coral" icon="cloud-offline-outline" text={err} /> : null}
        {products && !products.length && !err ? <Text style={{ color: C.muted, textAlign: 'center', marginTop: 20 }}>New kits coming soon!</Text> : null}

        <View style={s.grid}>
          {list.map(p => {
            const inCart = cart.find(l => l.id === p.id);
            const off = p.mrp_inr && p.mrp_inr > p.price_inr ? Math.round(((p.mrp_inr - p.price_inr) / p.mrp_inr) * 100) : 0;
            return (
              <View key={p.id} style={s.card}>
                <View style={s.thumb}>
                  {p.image_url ? <Image source={{ uri: p.image_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" /> : <Text style={{ fontSize: 48 }}>{p.emoji}</Text>}
                  {off ? (
                    <View style={s.off}>
                      <Text style={s.offText}>{off}% off</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={s.name} numberOfLines={2}>
                  {p.name}
                </Text>
                {p.age_label ? <Text style={s.age}>{p.age_label}</Text> : null}
                <Text style={s.desc} numberOfLines={3}>
                  {p.description}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 'auto', paddingTop: 8 }}>
                  <Text style={s.price}>{inr(p.price_inr)}</Text>
                  {off ? <Text style={s.mrp}>{inr(p.mrp_inr!)}</Text> : null}
                </View>
                {inCart ? (
                  <View style={s.qty}>
                    <Pressable onPress={() => { tap(); setQty(p.id, inCart.qty - 1); }} style={s.qBtn} accessibilityLabel="Remove one">
                      <Ionicons name="remove" size={18} color={C.white} />
                    </Pressable>
                    <Text style={s.qVal}>{inCart.qty}</Text>
                    <Pressable onPress={() => { tap(); setQty(p.id, inCart.qty + 1); }} style={s.qBtn} accessibilityLabel="Add one">
                      <Ionicons name="add" size={18} color={C.white} />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable onPress={() => { success(); addToCart(p); }} style={s.add}>
                    <Ionicons name="bag-add-outline" size={16} color={C.navy} />
                    <Text style={s.addText}>Add</Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {count ? (
        <Pressable onPress={() => { tap(); router.push('/cart'); }} style={[s.cartBar, { bottom: 14 }]}>
          <Ionicons name="bag-handle" size={22} color={C.navy} />
          <Text style={s.cartText}>
            {count} item{count > 1 ? 's' : ''} · {inr(cartTotal(cart))}
          </Text>
          <Text style={s.cartGo}>Checkout →</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  card: { width: '48.5%', backgroundColor: C.white, borderRadius: R.lg, padding: 10, borderWidth: 1, borderColor: C.line },
  thumb: { height: 110, borderRadius: R.md, backgroundColor: C.leafSoft, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  off: { position: 'absolute', top: 8, left: 8, backgroundColor: C.coral, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  offText: { color: C.white, fontSize: 10.5, fontWeight: '800' },
  name: { fontWeight: '800', color: C.ink, fontSize: 14, marginTop: 8 },
  age: { color: C.teal, fontSize: 11, fontWeight: '700', marginTop: 2 },
  desc: { color: C.muted, fontSize: 11.5, marginTop: 4, lineHeight: 16 },
  price: { fontSize: 17, fontWeight: '900', color: C.ink },
  mrp: { fontSize: 12, color: C.muted, textDecorationLine: 'line-through' },
  add: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: C.sun, borderRadius: 10, paddingVertical: 9, marginTop: 8 },
  addText: { color: C.navy, fontWeight: '800' },
  qty: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.navy, borderRadius: 10, marginTop: 8, padding: 4 },
  qBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  qVal: { color: C.white, fontWeight: '900', fontSize: 15 },
  cartBar: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.sun, borderRadius: R.lg, padding: 16, ...shadow, shadowOpacity: 0.18 },
  cartText: { flex: 1, fontWeight: '800', color: C.navy, fontSize: 15 },
  cartGo: { fontWeight: '900', color: C.navy },
});
