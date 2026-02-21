import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { MockApiService } from '../../../core/services/mock-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Product, ProductCategory, ProductStatus } from '../../../models/product.model';
import { TableComponent, TableColumn } from '../../../shared/components/table/table.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { formatDate } from '../../../utils/date.util';

const PAGE_SIZE = 5;

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, TableComponent, ModalComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <div>
        <h1>Products</h1>
        <p>Manage your product catalog</p>
      </div>
      <app-button (clicked)="openCreate()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Product
      </app-button>
    </div>

    <div class="table-toolbar">
      <div class="search-box">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" placeholder="Search products..." [formControl]="searchCtrl" />
      </div>
      <div class="filter-row">
        <select [formControl]="categoryFilter">
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
          <option value="books">Books</option>
          <option value="food">Food</option>
          <option value="other">Other</option>
        </select>
        <span class="results-count">{{ total() }} products</span>
      </div>
    </div>

    <app-table
      [columns]="columns"
      [rows]="products()"
      [loading]="loading()"
      emptyText="No products found"
    >
      @for (product of products(); track product.id) {
        <tr>
          <td>
            <div class="product-name">{{ product.name }}</div>
            <div class="product-desc">{{ product.description }}</div>
          </td>
          <td>
            <span class="badge badge--neutral">{{ product.category }}</span>
          </td>
          <td class="price-cell">\${{ product.price.toFixed(2) }}</td>
          <td [class.low-stock]="product.stock < 10">{{ product.stock }}</td>
          <td>
            <span class="badge"
              [ngClass]="{
                'badge--success': product.status === 'active',
                'badge--neutral': product.status === 'draft',
                'badge--error': product.status === 'inactive'
              }">
              {{ product.status }}
            </span>
          </td>
          <td class="text-muted">{{ formatDate(product.createdAt) }}</td>
          <td class="actions-cell">
            <app-button variant="ghost" size="sm" (clicked)="openEdit(product)">Edit</app-button>
            <app-button variant="ghost" size="sm" (clicked)="deleteProduct(product.id)" [loading]="deletingId() === product.id">
              <span class="text-error">Delete</span>
            </app-button>
          </td>
        </tr>
      }
    </app-table>

    <!-- Pagination -->
    @if (totalPages() > 1) {
      <div class="pagination">
        <app-button variant="secondary" size="sm" [disabled]="page() === 1" (clicked)="goToPage(page() - 1)">
          ← Prev
        </app-button>
        <span class="page-info">Page {{ page() }} of {{ totalPages() }}</span>
        <app-button variant="secondary" size="sm" [disabled]="page() === totalPages()" (clicked)="goToPage(page() + 1)">
          Next →
        </app-button>
      </div>
    }

    @if (showModal()) {
      <app-modal
        [title]="editingProduct() ? 'Edit Product' : 'Add Product'"
        (closed)="closeModal()"
        size="lg"
      >
        <form [formGroup]="productForm" (ngSubmit)="saveProduct()" novalidate>
          <div class="form-group">
            <label class="form-label">Product Name</label>
            <input type="text" formControlName="name" placeholder="Enter product name"
              [ngClass]="{ 'input-error': isInvalid('name') }" />
            @if (isInvalid('name')) { <span class="form-error">Name is required</span> }
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea formControlName="description" placeholder="Product description" rows="3"
              [ngClass]="{ 'input-error': isInvalid('description') }"></textarea>
            @if (isInvalid('description')) { <span class="form-error">Description is required</span> }
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Price ($)</label>
              <input type="number" formControlName="price" placeholder="0.00" min="0" step="0.01"
                [ngClass]="{ 'input-error': isInvalid('price') }" />
              @if (isInvalid('price')) { <span class="form-error">Valid price required</span> }
            </div>
            <div class="form-group">
              <label class="form-label">Stock</label>
              <input type="number" formControlName="stock" placeholder="0" min="0"
                [ngClass]="{ 'input-error': isInvalid('stock') }" />
              @if (isInvalid('stock')) { <span class="form-error">Valid stock required</span> }
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Category</label>
              <select formControlName="category">
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="books">Books</option>
                <option value="food">Food</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <select formControlName="status">
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </form>

        <div modal-footer>
          <app-button variant="secondary" (clicked)="closeModal()">Cancel</app-button>
          <app-button variant="primary" [loading]="saving()" (clicked)="saveProduct()">
            {{ editingProduct() ? 'Save Changes' : 'Create Product' }}
          </app-button>
        </div>
      </app-modal>
    }
  `,
  styles: [`
    .product-name {
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-sm);
      color: var(--color-text);
    }

    .product-desc {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      max-width: 240px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .price-cell {
      font-weight: var(--font-weight-semibold);
      color: var(--color-text);
    }

    .low-stock { color: var(--color-warning); font-weight: var(--font-weight-semibold); }

    .actions-cell {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-1);
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;

      .search-icon {
        position: absolute;
        left: 10px;
        color: var(--color-text-muted);
        pointer-events: none;
      }

      input {
        padding: 8px 12px 8px 34px;
        width: 260px;
        font-size: var(--font-size-sm);
        color: var(--color-text);
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        outline: none;
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);

        &::placeholder { color: var(--color-text-subtle); }
        &:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
        }
      }
    }

    .filter-row {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .results-count {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
      white-space: nowrap;
    }

    select {
      padding: 8px 12px;
      font-size: var(--font-size-sm);
      color: var(--color-text);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      outline: none;
      cursor: pointer;
      transition: border-color var(--transition-fast);

      &:focus { border-color: var(--color-primary); }
    }

    input[type=text], input[type=email], input[type=number] {
      width: 100%;
      padding: 9px 12px;
      font-size: var(--font-size-base);
      color: var(--color-text);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      outline: none;
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);

      &::placeholder { color: var(--color-text-subtle); }
      &:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
      }

      &.input-error {
        border-color: var(--color-error);
        &:focus { box-shadow: 0 0 0 3px rgba(220,38,38,0.1); }
      }
    }

    textarea {
      width: 100%;
      padding: 9px 12px;
      font-size: var(--font-size-base);
      color: var(--color-text);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      outline: none;
      resize: vertical;
      font-family: var(--font-family);
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);

      &::placeholder { color: var(--color-text-subtle); }
      &:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
      }

      &.input-error {
        border-color: var(--color-error);
      }
    }

    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-4);
      margin-top: var(--space-5);
    }

    .page-info {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }
  `],
})
export class ProductsComponent implements OnInit {
  private readonly api = inject(MockApiService);
  private readonly notify = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly products = signal<Product[]>([]);
  readonly total = signal(0);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly deletingId = signal<string | null>(null);
  readonly showModal = signal(false);
  readonly editingProduct = signal<Product | null>(null);
  readonly page = signal(1);

  readonly totalPages = computed(() => Math.ceil(this.total() / PAGE_SIZE));

  private readonly searchSubject = new Subject<string>();

  readonly searchCtrl = this.fb.nonNullable.control('');
  readonly categoryFilter = this.fb.nonNullable.control('');

  readonly columns: TableColumn[] = [
    { key: 'name', label: 'Product' },
    { key: 'category', label: 'Category', width: '120px' },
    { key: 'price', label: 'Price', width: '100px' },
    { key: 'stock', label: 'Stock', width: '80px' },
    { key: 'status', label: 'Status', width: '100px' },
    { key: 'createdAt', label: 'Created', width: '130px' },
  ];

  readonly productForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    description: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    category: ['electronics' as ProductCategory],
    status: ['active' as ProductStatus],
  });

  readonly formatDate = formatDate;

  ngOnInit(): void {
    this.loadProducts();

    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => { this.page.set(1); this.loadProducts(); });

    this.searchCtrl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v) => this.searchSubject.next(v));

    this.categoryFilter.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => { this.page.set(1); this.loadProducts(); });
  }

  private loadProducts(): void {
    this.loading.set(true);
    const search = this.searchCtrl.value;
    this.api
      .getProducts({ search, page: this.page(), pageSize: PAGE_SIZE })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        const category = this.categoryFilter.value;
        const filtered = category ? res.data.filter((p: Product) => p.category === category) : res.data;
        this.products.set(filtered);
        this.total.set(res.total ?? res.data.length);
        this.loading.set(false);
      });
  }

  goToPage(p: number): void {
    this.page.set(p);
    this.loadProducts();
  }

  openCreate(): void {
    this.editingProduct.set(null);
    this.productForm.reset({ category: 'electronics', status: 'active', price: 0, stock: 0 });
    this.showModal.set(true);
  }

  openEdit(product: Product): void {
    this.editingProduct.set(product);
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      status: product.status,
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingProduct.set(null);
    this.productForm.reset();
  }

  saveProduct(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const { name, description, price, stock, category, status } = this.productForm.getRawValue();
    const val: Omit<Product, 'id' | 'createdAt'> = { name, description, price, stock, category, status };
    const op = this.editingProduct()
      ? this.api.updateProduct(this.editingProduct()!.id, val)
      : this.api.createProduct(val);

    op.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notify.success(this.editingProduct() ? 'Product updated' : 'Product created');
        this.saving.set(false);
        this.closeModal();
        this.loadProducts();
      },
      error: () => {
        this.notify.error('Failed to save product');
        this.saving.set(false);
      },
    });
  }

  deleteProduct(id: string): void {
    this.deletingId.set(id);
    this.api
      .deleteProduct(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notify.success('Product deleted');
          this.deletingId.set(null);
          this.loadProducts();
        },
        error: () => {
          this.notify.error('Failed to delete product');
          this.deletingId.set(null);
        },
      });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.productForm.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }
}
