import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { User, UserRole, UserStatus } from '../../models/user.model';
import { Product, ProductCategory, ProductStatus } from '../../models/product.model';
import { ActivityItem, ChartDataPoint, StatCard } from '../../models/dashboard.model';
import { ApiResponse, PaginationParams } from '../../models/api.model';
import { StorageService } from './storage.service';
import { generateId } from '../../utils/id.util';

const USERS_KEY = 'mock_users';
const PRODUCTS_KEY = 'mock_products';
const LATENCY = 400;

@Injectable({ providedIn: 'root' })
export class MockApiService {
  constructor(private readonly storage: StorageService) {
    this.seedIfEmpty();
  }

  // ── Users ────────────────────────────────────────────────────────────────

  getUsers(params?: Partial<PaginationParams>): Observable<ApiResponse<User[]>> {
    const all = this.loadUsers();
    const search = params?.search?.toLowerCase() ?? '';
    const filtered = search
      ? all.filter(
          (u) =>
            u.name.toLowerCase().includes(search) ||
            u.email.toLowerCase().includes(search)
        )
      : all;
    const page = params?.page ?? 1;
    const size = params?.pageSize ?? filtered.length;
    const paged = filtered.slice((page - 1) * size, page * size);
    return of({ data: paged, total: filtered.length, page, pageSize: size }).pipe(
      delay(LATENCY)
    );
  }

  getUserById(id: string): Observable<User> {
    const user = this.loadUsers().find((u) => u.id === id);
    return user
      ? of(user).pipe(delay(LATENCY))
      : throwError(() => new Error('User not found'));
  }

  createUser(payload: Omit<User, 'id' | 'createdAt'>): Observable<User> {
    const users = this.loadUsers();
    const user: User = { ...payload, id: generateId(), createdAt: new Date().toISOString() };
    this.storage.set(USERS_KEY, [...users, user]);
    return of(user).pipe(delay(LATENCY));
  }

  updateUser(id: string, payload: Partial<User>): Observable<User> {
    const users = this.loadUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return throwError(() => new Error('User not found'));
    const updated = { ...users[idx], ...payload };
    const next = [...users];
    next[idx] = updated;
    this.storage.set(USERS_KEY, next);
    return of(updated).pipe(delay(LATENCY));
  }

  deleteUser(id: string): Observable<void> {
    const users = this.loadUsers().filter((u) => u.id !== id);
    this.storage.set(USERS_KEY, users);
    return of(undefined).pipe(delay(LATENCY));
  }

  // ── Products ─────────────────────────────────────────────────────────────

  getProducts(params?: Partial<PaginationParams>): Observable<ApiResponse<Product[]>> {
    const all = this.loadProducts();
    const search = params?.search?.toLowerCase() ?? '';
    const filtered = search
      ? all.filter(
          (p) =>
            p.name.toLowerCase().includes(search) ||
            p.category.toLowerCase().includes(search)
        )
      : all;
    const page = params?.page ?? 1;
    const size = params?.pageSize ?? 10;
    const paged = filtered.slice((page - 1) * size, page * size);
    return of({ data: paged, total: filtered.length, page, pageSize: size }).pipe(
      delay(LATENCY)
    );
  }

  createProduct(payload: Omit<Product, 'id' | 'createdAt'>): Observable<Product> {
    const products = this.loadProducts();
    const product: Product = {
      ...payload,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    this.storage.set(PRODUCTS_KEY, [...products, product]);
    return of(product).pipe(delay(LATENCY));
  }

  updateProduct(id: string, payload: Partial<Product>): Observable<Product> {
    const products = this.loadProducts();
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) return throwError(() => new Error('Product not found'));
    const updated = { ...products[idx], ...payload };
    const next = [...products];
    next[idx] = updated;
    this.storage.set(PRODUCTS_KEY, next);
    return of(updated).pipe(delay(LATENCY));
  }

  deleteProduct(id: string): Observable<void> {
    const products = this.loadProducts().filter((p) => p.id !== id);
    this.storage.set(PRODUCTS_KEY, products);
    return of(undefined).pipe(delay(LATENCY));
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────

  getStats(): Observable<StatCard[]> {
    const users = this.loadUsers();
    const products = this.loadProducts();
    const stats: StatCard[] = [
      { label: 'Total Users', value: users.length, change: 12, icon: 'users', color: 'blue' },
      { label: 'Revenue', value: '$48,295', change: 8.2, icon: 'dollar', color: 'green' },
      { label: 'Orders', value: 1284, change: -3.1, icon: 'shopping', color: 'purple' },
      { label: 'Products', value: products.length, change: 5, icon: 'box', color: 'orange' },
    ];
    return of(stats).pipe(delay(LATENCY));
  }

  getChartData(): Observable<ChartDataPoint[]> {
    const data: ChartDataPoint[] = [
      { label: 'Jan', value: 30 },
      { label: 'Feb', value: 45 },
      { label: 'Mar', value: 38 },
      { label: 'Apr', value: 60 },
      { label: 'May', value: 55 },
      { label: 'Jun', value: 75 },
      { label: 'Jul', value: 68 },
      { label: 'Aug', value: 90 },
      { label: 'Sep', value: 82 },
      { label: 'Oct', value: 95 },
      { label: 'Nov', value: 88 },
      { label: 'Dec', value: 110 },
    ];
    return of(data).pipe(delay(LATENCY));
  }

  getActivity(): Observable<ActivityItem[]> {
    const items: ActivityItem[] = [
      { id: '1', user: 'Omar Hassan', action: 'created', target: 'User "Rania Khalil"', time: new Date(Date.now() - 300000).toISOString(), type: 'create' },
      { id: '2', user: 'Layla Mahmoud', action: 'updated', target: 'Product "Widget Pro"', time: new Date(Date.now() - 900000).toISOString(), type: 'update' },
      { id: '3', user: 'Omar Hassan', action: 'deleted', target: 'Product "Old Item"', time: new Date(Date.now() - 3600000).toISOString(), type: 'delete' },
      { id: '4', user: 'Rania Khalil', action: 'logged in', target: 'Dashboard', time: new Date(Date.now() - 7200000).toISOString(), type: 'login' },
      { id: '5', user: 'Layla Mahmoud', action: 'created', target: 'Product "New Widget"', time: new Date(Date.now() - 86400000).toISOString(), type: 'create' },
      { id: '6', user: 'Omar Hassan', action: 'updated', target: 'Settings', time: new Date(Date.now() - 172800000).toISOString(), type: 'update' },
    ];
    return of(items).pipe(delay(LATENCY));
  }

  // ── Private Helpers ───────────────────────────────────────────────────────

  private loadUsers(): User[] {
    return this.storage.get<User[]>(USERS_KEY) ?? [];
  }

  private loadProducts(): Product[] {
    return this.storage.get<Product[]>(PRODUCTS_KEY) ?? [];
  }

  private seedIfEmpty(): void {
    if (!this.storage.get(USERS_KEY)) {
      const roles: UserRole[] = ['admin', 'editor', 'editor', 'admin', 'editor'];
      const statuses: UserStatus[] = ['active', 'active', 'inactive', 'active', 'active'];
      const names = ['Rania Khalil', 'Karim Al-Farsi', 'Layla Mahmoud', 'Omar Hassan', 'Amira Said'];
      const users: User[] = names.map((name, i) => ({
        id: generateId(),
        name,
        email: `${name.split(' ')[0].toLowerCase()}@example.com`,
        role: roles[i],
        status: statuses[i],
        createdAt: new Date(Date.now() - i * 86400000 * 10).toISOString(),
      }));
      this.storage.set(USERS_KEY, users);
    }

    if (!this.storage.get(PRODUCTS_KEY)) {
      const categories: ProductCategory[] = ['electronics', 'clothing', 'books', 'food', 'other'];
      const pStatuses: ProductStatus[] = ['active', 'active', 'draft', 'active', 'inactive'];
      const productNames = ['Smart Watch Pro', 'Cotton T-Shirt', 'Clean Code Book', 'Organic Coffee', 'USB Hub 7-Port'];
      const products: Product[] = productNames.map((name, i) => ({
        id: generateId(),
        name,
        description: `High quality ${name.toLowerCase()} for everyday use.`,
        price: Math.round((19.99 + i * 15.5) * 100) / 100,
        stock: 10 + i * 5,
        category: categories[i],
        status: pStatuses[i],
        createdAt: new Date(Date.now() - i * 86400000 * 7).toISOString(),
      }));
      this.storage.set(PRODUCTS_KEY, products);
    }
  }
}
