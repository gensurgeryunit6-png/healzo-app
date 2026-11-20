import { useEffect, useState } from 'react';
import type { CartLine, Product } from './family';

let lines: CartLine[] = [];
const ls = new Set<() => void>();
const emit = () => ls.forEach(l => l());

export function useCart() {
  const [v, setV] = useState(lines);
  useEffect(() => {
    const l = () => setV([...lines]);
    ls.add(l);
    return () => {
      ls.delete(l);
    };
  }, []);
  return v;
}
export function addToCart(p: Product) {
  const ex = lines.find(l => l.id === p.id);
  if (ex) ex.qty = Math.min(10, ex.qty + 1);
  else lines.push({ id: p.id, name: p.name, emoji: p.emoji, price_inr: p.price_inr, qty: 1 });
  emit();
}
export function setQty(id: string, qty: number) {
  lines = qty <= 0 ? lines.filter(l => l.id !== id) : lines.map(l => (l.id === id ? { ...l, qty: Math.min(10, qty) } : l));
  emit();
}
export function clearCart() {
  lines = [];
  emit();
}
export function cartTotal(c: CartLine[]) {
  return c.reduce((s, l) => s + l.price_inr * l.qty, 0);
}
export const inr = (n: number) => '₹' + n.toLocaleString('en-IN');
