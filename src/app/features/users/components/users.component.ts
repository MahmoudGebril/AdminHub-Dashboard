import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { MockApiService } from '../../../core/services/mock-api.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { User, UserRole, UserStatus } from '../../../models/user.model';
import { TableComponent, TableColumn } from '../../../shared/components/table/table.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { formatDate } from '../../../utils/date.util';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgClass,
    TableComponent,
    ModalComponent,
    ButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <div>
        <h1>Users</h1>
        <p>Manage your team members and permissions</p>
      </div>
      <app-button (clicked)="openCreate()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add User
      </app-button>
    </div>

    <div class="table-toolbar">
      <div class="search-box">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Search users..."
          [formControl]="searchCtrl"
        />
      </div>
      <span class="results-count">{{ total() }} users</span>
    </div>

    <app-table
      [columns]="columns"
      [rows]="users()"
      [loading]="loading()"
      emptyText="No users found"
    >
      @for (user of users(); track user.id) {
        <tr>
          <td>
            <div class="user-cell">
              <div class="user-avatar">{{ user.name.charAt(0) }}</div>
              <div>
                <div class="user-name">{{ user.name }}</div>
                <div class="user-email">{{ user.email }}</div>
              </div>
            </div>
          </td>
          <td>
            <span class="badge" [ngClass]="user.role === 'admin' ? 'badge--info' : 'badge--neutral'">
              {{ user.role }}
            </span>
          </td>
          <td>
            <span class="badge" [ngClass]="user.status === 'active' ? 'badge--success' : 'badge--error'">
              {{ user.status }}
            </span>
          </td>
          <td class="text-muted">{{ formatDate(user.createdAt) }}</td>
          <td class="actions-cell">
            <app-button variant="ghost" size="sm" (clicked)="openEdit(user)">Edit</app-button>
            @if (auth.isAdmin()) {
              <app-button variant="ghost" size="sm" (clicked)="confirmDelete(user)" [loading]="deletingId() === user.id">
                <span class="text-error">Delete</span>
              </app-button>
            }
          </td>
        </tr>
      }
    </app-table>

    @if (showModal()) {
      <app-modal
        [title]="editingUser() ? 'Edit User' : 'Add User'"
        (closed)="closeModal()"
      >
        <form [formGroup]="userForm" (ngSubmit)="saveUser()" novalidate>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input type="text" formControlName="name" placeholder="John Doe"
                [ngClass]="{ 'input-error': isInvalid('name') }" />
              @if (isInvalid('name')) {
                <span class="form-error">Name is required</span>
              }
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" formControlName="email" placeholder="john@example.com"
                [ngClass]="{ 'input-error': isInvalid('email') }" />
              @if (isInvalid('email')) {
                <span class="form-error">Valid email is required</span>
              }
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Role</label>
              <select formControlName="role">
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <select formControlName="status">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </form>

        <div modal-footer>
          <app-button variant="secondary" (clicked)="closeModal()">Cancel</app-button>
          <app-button variant="primary" [loading]="saving()" (clicked)="saveUser()">
            {{ editingUser() ? 'Save Changes' : 'Create User' }}
          </app-button>
        </div>
      </app-modal>
    }
  `,
  styles: [`
    .user-cell {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .user-avatar {
      width: 34px;
      height: 34px;
      border-radius: var(--radius-full);
      background: var(--color-primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      flex-shrink: 0;
    }

    .user-name {
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-sm);
      color: var(--color-text);
    }

    .user-email {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

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

    .results-count {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }

    select {
      width: 100%;
      padding: 9px 12px;
      font-size: var(--font-size-base);
      color: var(--color-text);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      outline: none;
      cursor: pointer;
      transition: border-color var(--transition-fast);

      &:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
      }
    }

    input[type=text], input[type=email] {
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
  `],
})
export class UsersComponent implements OnInit {
  private readonly api = inject(MockApiService);
  readonly auth = inject(AuthService);
  private readonly notify = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly users = signal<User[]>([]);
  readonly total = signal(0);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly deletingId = signal<string | null>(null);
  readonly showModal = signal(false);
  readonly editingUser = signal<User | null>(null);

  private readonly searchSubject = new Subject<string>();

  readonly searchCtrl = this.fb.nonNullable.control('');

  readonly columns: TableColumn[] = [
    { key: 'name', label: 'User' },
    { key: 'role', label: 'Role', width: '120px' },
    { key: 'status', label: 'Status', width: '100px' },
    { key: 'createdAt', label: 'Joined', width: '140px' },
  ];

  readonly userForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['editor' as UserRole],
    status: ['active' as UserStatus],
  });

  readonly formatDate = formatDate;

  ngOnInit(): void {
    this.loadUsers();

    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((search) => this.loadUsers(search));

    this.searchCtrl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v) => this.searchSubject.next(v));
  }

  private loadUsers(search = ''): void {
    this.loading.set(true);
    this.api
      .getUsers({ search })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.users.set(res.data);
        this.total.set(res.total ?? res.data.length);
        this.loading.set(false);
      });
  }

  openCreate(): void {
    this.editingUser.set(null);
    this.userForm.reset({ role: 'editor', status: 'active' });
    this.showModal.set(true);
  }

  openEdit(user: User): void {
    this.editingUser.set(user);
    this.userForm.patchValue({ name: user.name, email: user.email, role: user.role, status: user.status });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingUser.set(null);
    this.userForm.reset();
  }

  saveUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const { name, email, role, status } = this.userForm.getRawValue();
    const val: Omit<User, 'id' | 'createdAt'> = { name, email, role, status };
    const op = this.editingUser()
      ? this.api.updateUser(this.editingUser()!.id, val)
      : this.api.createUser(val);

    op.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notify.success(this.editingUser() ? 'User updated' : 'User created');
        this.saving.set(false);
        this.closeModal();
        this.loadUsers(this.searchCtrl.value);
      },
      error: () => {
        this.notify.error('Failed to save user');
        this.saving.set(false);
      },
    });
  }

  confirmDelete(user: User): void {
    this.deletingId.set(user.id);
    this.api
      .deleteUser(user.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notify.success(`${user.name} deleted`);
          this.deletingId.set(null);
          this.loadUsers(this.searchCtrl.value);
        },
        error: () => {
          this.notify.error('Failed to delete user');
          this.deletingId.set(null);
        },
      });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.userForm.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }
}
