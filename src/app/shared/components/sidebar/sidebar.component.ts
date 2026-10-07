import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface MenuItem {
  label: string;
  link: string;
  icon: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="upharma-sidebar">
      <!-- Sidebar Brand Header -->
      <div class="sidebar-header">
        <div class="brand-logo">U</div>
        <div class="brand-info">
          <div class="brand-title">NHÀ THUỐC UPHARMA</div>
          <div class="brand-subtitle">ĐÀ NẴNG & HUẾ</div>
        </div>
        <button class="collapse-btn" title="Thu gọn menu">«</button>
      </div>

      <!-- Navigation Menu -->
      <nav class="sidebar-nav">
        @for (item of menuItems; track item.link) {
          <a
            [routerLink]="item.link"
            routerLinkActive="active"
            class="nav-item"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
            @if (item.badge) {
              <span class="nav-badge">{{ item.badge }}</span>
            }
          </a>
        }
      </nav>
    </aside>
  `,
  styles: [`
    .upharma-sidebar {
      width: 240px;
      min-width: 240px;
      height: 100vh;
      background-color: #0d472b;
      color: #ffffff;
      display: flex;
      flex-direction: column;
      user-select: none;
      font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      padding: 16px 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      gap: 10px;
    }

    .brand-logo {
      width: 36px;
      height: 36px;
      background-color: #ffffff;
      color: #0d472b;
      font-weight: 800;
      font-size: 22px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-info {
      flex: 1;
      overflow: hidden;
    }

    .brand-title {
      font-size: 13px;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.2;
      letter-spacing: 0.2px;
      white-space: nowrap;
    }

    .brand-subtitle {
      font-size: 10px;
      color: #88c9a1;
      font-weight: 600;
      letter-spacing: 0.5px;
      margin-top: 2px;
    }

    .collapse-btn {
      background: transparent;
      border: none;
      color: #88c9a1;
      font-size: 14px;
      cursor: pointer;
      padding: 4px;
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 10px 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      padding: 10px 12px;
      color: #ffffff;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      border-radius: 10px;
      transition: all 0.15s ease-in-out;
      gap: 12px;
    }

    .nav-item:hover {
      background-color: rgba(255, 255, 255, 0.12);
      color: #ffffff;
    }

    .nav-item.active {
      background-color: #ffffff;
      color: #0d472b;
      font-weight: 800;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
    }

    .nav-icon {
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
    }

    .nav-label {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .nav-badge {
      background-color: #ef4444;
      color: #ffffff;
      font-size: 11px;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 12px;
      line-height: 1;
    }
  `]
})
export class SidebarComponent {
  readonly menuItems: MenuItem[] = [
    { label: 'Tổng Quan', link: '/dashboard', icon: '▦' },
    { label: 'Tồn Kho', link: '/inventory', icon: '📦' },
    { label: 'Báo Cáo Thống Kê', link: '/reports', icon: '📊' }
  ];
}
